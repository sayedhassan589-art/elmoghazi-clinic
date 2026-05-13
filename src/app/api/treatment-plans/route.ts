import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (status) where.status = status

    const [plans, total] = await Promise.all([
      db.treatmentPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, name: true, fileNumber: true } },
          phases: { orderBy: { order: 'asc' } },
          _count: { select: { phases: true } },
        },
      }),
      db.treatmentPlan.count({ where }),
    ])

    return NextResponse.json({
      plans,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get treatment plans error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.patientId || !body.title) {
      return NextResponse.json({ error: 'patientId and title are required' }, { status: 400 })
    }

    const plan = await db.treatmentPlan.create({
      data: {
        patientId: body.patientId,
        title: body.title,
        description: body.description || null,
        status: body.status || 'active',
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
        phases: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('Create treatment plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

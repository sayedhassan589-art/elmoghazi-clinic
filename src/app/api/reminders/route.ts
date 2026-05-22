import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '5000')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (type) where.type = type
    if (status) where.status = status

    const [reminders, total] = await Promise.all([
      db.reminder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          patient: { select: { id: true, name: true, fileNumber: true } },
        },
      }),
      db.reminder.count({ where }),
    ])

    return NextResponse.json({
      reminders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get reminders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title || !body.date) {
      return NextResponse.json({ error: 'title and date are required' }, { status: 400 })
    }

    const reminder = await db.reminder.create({
      data: {
        patientId: body.patientId || null,
        title: body.title,
        description: body.description || null,
        date: new Date(body.date),
        type: body.type || 'follow_up',
        status: body.status || 'pending',
        sentVia: body.sentVia || null,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
      },
    })

    return NextResponse.json({ reminder }, { status: 201 })
  } catch (error) {
    console.error('Create reminder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

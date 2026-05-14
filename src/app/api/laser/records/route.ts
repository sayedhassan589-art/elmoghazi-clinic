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

    const [records, total] = await Promise.all([
      db.laserRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, name: true, fileNumber: true } },
          laserSessions: { orderBy: { sessionNumber: 'desc' } },
          _count: { select: { laserSessions: true } },
        },
      }),
      db.laserRecord.count({ where }),
    ])

    return NextResponse.json({
      records,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get laser records error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.patientId || !body.bodyArea) {
      return NextResponse.json({ error: 'patientId and bodyArea are required' }, { status: 400 })
    }

    // Build data object with only defined values
    const data: Record<string, unknown> = {
      patientId: body.patientId,
      bodyArea: body.bodyArea,
      totalSessions: body.totalSessions || 0,
      status: body.status || 'active',
    }
    // Only add optional fields if they have values
    if (body.skinType) data.skinType = body.skinType
    if (body.hairColor) data.hairColor = body.hairColor
    if (body.hairDensity) data.hairDensity = body.hairDensity
    if (body.notes) data.notes = body.notes

    const record = await db.laserRecord.create({
      data: data as any,
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
      },
    })

    return NextResponse.json({ record }, { status: 201 })
  } catch (error: any) {
    console.error('Create laser record error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

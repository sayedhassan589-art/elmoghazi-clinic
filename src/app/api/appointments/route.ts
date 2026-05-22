import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const patientId = searchParams.get('patientId') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10000')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      where.date = { gte: start, lte: end }
    } else if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
      where.date = dateFilter
    }

    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (type) where.type = type

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          patient: { select: { id: true, name: true, fileNumber: true, phone: true } },
        },
      }),
      db.appointment.count({ where }),
    ])

    return NextResponse.json({
      appointments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.date) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 })
    }

    const appointment = await db.appointment.create({
      data: {
        patientId: body.patientId || null,
        date: new Date(body.date),
        duration: body.duration || 30,
        type: body.type || 'consultation',
        status: body.status || 'scheduled',
        notes: body.notes || null,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true } },
      },
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

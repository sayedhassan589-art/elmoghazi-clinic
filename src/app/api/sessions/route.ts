import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const doctorId = searchParams.get('doctorId') || ''
    const serviceId = searchParams.get('serviceId') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100000')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (doctorId) where.doctorId = doctorId
    if (serviceId) where.serviceId = serviceId
    if (status) where.status = status

    const [sessions, total] = await Promise.all([
      db.session.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          patient: { select: { id: true, name: true, fileNumber: true } },
          service: true,
          doctor: { select: { id: true, name: true } },
        },
      }),
      db.session.count({ where }),
    ])

    return NextResponse.json({
      sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 })
    }

    const patient = await db.patient.findUnique({ where: { id: body.patientId } })
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const session = await db.session.create({
      data: {
        patientId: body.patientId,
        serviceId: body.serviceId || null,
        doctorId: body.doctorId || null,
        status: body.status || 'scheduled',
        notes: body.notes || null,
        date: body.date ? new Date(body.date) : new Date(),
        price: body.price || 0,
        paid: body.paid || false,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
        service: true,
        doctor: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

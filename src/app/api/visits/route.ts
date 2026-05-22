import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const doctorId = searchParams.get('doctorId') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100000')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (doctorId) where.doctorId = doctorId
    if (type) where.type = type

    const [visits, total] = await Promise.all([
      db.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          patient: { select: { id: true, name: true, fileNumber: true } },
          doctor: { select: { id: true, name: true } },
        },
      }),
      db.visit.count({ where }),
    ])

    return NextResponse.json({
      visits,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get visits error:', error)
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

    const visit = await db.visit.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId || null,
        type: body.type || 'consultation',
        diagnosis: body.diagnosis || null,
        notes: body.notes || null,
        date: body.date ? new Date(body.date) : new Date(),
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
        doctor: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ visit }, { status: 201 })
  } catch (error) {
    console.error('Create visit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const doctorId = searchParams.get('doctorId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10000')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (doctorId) where.doctorId = doctorId

    const [prescriptions, total] = await Promise.all([
      db.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          patient: { select: { id: true, name: true, fileNumber: true } },
          doctor: { select: { id: true, name: true } },
          items: { include: { medication: true } },
        },
      }),
      db.prescription.count({ where }),
    ])

    return NextResponse.json({
      prescriptions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get prescriptions error:', error)
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

    const prescription = await db.prescription.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId || null,
        diagnosis: body.diagnosis || null,
        notes: body.notes || null,
        date: body.date ? new Date(body.date) : new Date(),
        items: {
          create: (body.items || []).map((item: { medicationId: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }) => ({
            medicationId: item.medicationId,
            dosage: item.dosage || null,
            frequency: item.frequency || null,
            duration: item.duration || null,
            instructions: item.instructions || null,
          })),
        },
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
        doctor: { select: { id: true, name: true } },
        items: { include: { medication: true } },
      },
    })

    return NextResponse.json({ prescription }, { status: 201 })
  } catch (error) {
    console.error('Create prescription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

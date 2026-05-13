import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        visits: { orderBy: { date: 'desc' }, take: 20 },
        sessions: { orderBy: { date: 'desc' }, take: 20, include: { service: true } },
        alerts: { where: { active: true }, orderBy: { createdAt: 'desc' } },
        patientNotes: { orderBy: { createdAt: 'desc' }, take: 20 },
        laserRecords: { include: { laserSessions: { orderBy: { sessionNumber: 'desc' } } } },
        appointments: { orderBy: { date: 'desc' }, take: 10 },
        photos: { orderBy: { createdAt: 'desc' }, take: 20 },
        treatmentPlans: { include: { phases: { include: { sessions: true }, orderBy: { order: 'asc' } } } },
        prescriptions: { orderBy: { date: 'desc' }, take: 10, include: { items: { include: { medication: true } } } },
        reminders: { orderBy: { date: 'desc' }, take: 10 },
        _count: { select: { visits: true, sessions: true, alerts: true, photos: true, prescriptions: true } },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Get patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.patient.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const patient = await db.patient.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone ?? undefined,
        phone2: body.phone2 ?? undefined,
        age: body.age ?? undefined,
        gender: body.gender ?? undefined,
        bloodType: body.bloodType ?? undefined,
        address: body.address ?? undefined,
        notes: body.notes ?? undefined,
        allergies: body.allergies ?? undefined,
        medicalHistory: body.medicalHistory ?? undefined,
        starred: body.starred ?? undefined,
        improved: body.improved ?? undefined,
        colorTag: body.colorTag ?? undefined,
      },
    })

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Update patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.patient.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    await db.patient.delete({ where: { id } })

    return NextResponse.json({ message: 'Patient deleted successfully' })
  } catch (error) {
    console.error('Delete patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { db } from '@/lib/db'
import { toCairoDate } from '@/lib/cairo-time'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.appointment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        patientId: body.patientId ?? undefined,
        date: body.date ? toCairoDate(body.date) : undefined,
        duration: body.duration ?? undefined,
        type: body.type ?? undefined,
        status: body.status ?? undefined,
        notes: body.notes ?? undefined,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true } },
      },
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.appointment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    await db.appointment.delete({ where: { id } })

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

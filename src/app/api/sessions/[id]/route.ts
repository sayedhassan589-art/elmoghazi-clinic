import { db } from '@/lib/db'
import { toCairoDate } from '@/lib/cairo-time'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.session.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const session = await db.session.update({
      where: { id },
      data: {
        serviceId: body.serviceId ?? undefined,
        doctorId: body.doctorId ?? undefined,
        status: body.status ?? undefined,
        notes: body.notes ?? undefined,
        date: body.date ? toCairoDate(body.date) : undefined,
        price: body.price ?? undefined,
        paid: body.paid ?? undefined,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
        service: true,
        doctor: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.session.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    await db.session.delete({ where: { id } })

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error) {
    console.error('Delete session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

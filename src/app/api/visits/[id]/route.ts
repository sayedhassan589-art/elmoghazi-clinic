import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.visit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    const visit = await db.visit.update({
      where: { id },
      data: {
        type: body.type ?? undefined,
        diagnosis: body.diagnosis ?? undefined,
        notes: body.notes ?? undefined,
        doctorId: body.doctorId ?? undefined,
        date: body.date ? new Date(body.date) : undefined,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
        doctor: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ visit })
  } catch (error) {
    console.error('Update visit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.visit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    await db.visit.delete({ where: { id } })

    return NextResponse.json({ message: 'Visit deleted successfully' })
  } catch (error) {
    console.error('Delete visit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

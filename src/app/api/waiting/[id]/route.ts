import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.waitingQueue.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 })
    }

    const entry = await db.waitingQueue.update({
      where: { id },
      data: {
        patientId: body.patientId ?? undefined,
        patientName: body.patientName ?? undefined,
        priority: body.priority ?? undefined,
        status: body.status ?? undefined,
        notes: body.notes ?? undefined,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true } },
      },
    })

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Update waiting entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.waitingQueue.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 })
    }

    await db.waitingQueue.delete({ where: { id } })

    return NextResponse.json({ message: 'Queue entry deleted successfully' })
  } catch (error) {
    console.error('Delete waiting entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

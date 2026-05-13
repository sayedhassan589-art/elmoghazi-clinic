import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.laserSession.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Laser session not found' }, { status: 404 })
    }

    const session = await db.laserSession.update({
      where: { id },
      data: {
        sessionNumber: body.sessionNumber ?? undefined,
        energy: body.energy ?? undefined,
        pulse: body.pulse ?? undefined,
        painLevel: body.painLevel ?? undefined,
        reaction: body.reaction ?? undefined,
        notes: body.notes ?? undefined,
        date: body.date ? new Date(body.date) : undefined,
      },
      include: {
        laserRecord: {
          include: {
            patient: { select: { id: true, name: true, fileNumber: true } },
          },
        },
      },
    })

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Update laser session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.laserSession.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Laser session not found' }, { status: 404 })
    }

    await db.laserSession.delete({ where: { id } })

    // Update totalSessions on the record
    const remainingSessions = await db.laserSession.count({
      where: { laserRecordId: existing.laserRecordId },
    })
    await db.laserRecord.update({
      where: { id: existing.laserRecordId },
      data: { totalSessions: remainingSessions },
    })

    return NextResponse.json({ message: 'Laser session deleted successfully' })
  } catch (error) {
    console.error('Delete laser session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

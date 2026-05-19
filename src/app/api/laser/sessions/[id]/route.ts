import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.laserSession.findUnique({
      where: { id },
      include: { laserRecord: { include: { patient: { select: { name: true } } } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Laser session not found' }, { status: 404 })
    }

    const wasPaid = existing.paid
    const session = await db.laserSession.update({
      where: { id },
      data: {
        sessionNumber: body.sessionNumber ?? undefined,
        energy: body.energy ?? undefined,
        pulse: body.pulse === '' ? null : body.pulse ?? undefined,
        painLevel: body.painLevel ?? undefined,
        reaction: body.reaction === '' ? null : body.reaction ?? undefined,
        notes: body.notes === '' ? null : body.notes ?? undefined,
        price: body.price ?? undefined,
        paid: body.paid ?? undefined,
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

    // If payment status changed to paid, create a financial transaction
    if (!wasPaid && body.paid && (body.price ?? existing.price ?? 0) > 0) {
      const patientName = session.laserRecord?.patient?.name || 'مريض'
      try {
        await db.transaction.create({
          data: {
            type: 'income',
            category: 'ليزر',
            amount: body.price ?? existing.price ?? 0,
            description: `جلسة ليزر #${existing.sessionNumber} - ${patientName}`,
            date: new Date(),
          },
        })
      } catch (e) { console.error('Failed to create transaction:', e) }
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Update laser session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.laserSession.findUnique({
      where: { id },
      include: { laserRecord: { include: { patient: { select: { name: true } } } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Laser session not found' }, { status: 404 })
    }

    // If the session was paid, delete the corresponding finance transaction
    if (existing.paid) {
      const patientName = existing.laserRecord?.patient?.name || 'مريض'
      const descriptionPattern = `جلسة ليزر #${existing.sessionNumber} - ${patientName}`
      try {
        await db.transaction.deleteMany({
          where: {
            type: 'income',
            category: 'ليزر',
            description: descriptionPattern,
          },
        })
      } catch (e) { console.error('Failed to delete related transaction:', e) }
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

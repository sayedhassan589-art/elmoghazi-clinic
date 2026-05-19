import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const record = await db.laserRecord.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true, age: true, gender: true } },
        laserSessions: { orderBy: { sessionNumber: 'asc' } },
        laserNotes: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!record) {
      return NextResponse.json({ error: 'Laser record not found' }, { status: 404 })
    }

    return NextResponse.json({ record })
  } catch (error) {
    console.error('Get laser record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.laserRecord.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Laser record not found' }, { status: 404 })
    }

    const record = await db.laserRecord.update({
      where: { id },
      data: {
        bodyArea: body.bodyArea ?? undefined,
        skinType: body.skinType === '' ? null : body.skinType ?? undefined,
        hairColor: body.hairColor === '' ? null : body.hairColor ?? undefined,
        hairDensity: body.hairDensity === '' ? null : body.hairDensity ?? undefined,
        totalSessions: body.totalSessions ?? undefined,
        price: body.price ?? undefined,
        totalPrice: body.totalPrice ?? undefined,
        paid: body.paid ?? undefined,
        machineName: body.machineName === '' ? null : body.machineName ?? undefined,
        energy: body.energy ?? undefined,
        pulse: body.pulse === '' ? null : body.pulse ?? undefined,
        status: body.status ?? undefined,
        notes: body.notes === '' ? null : body.notes ?? undefined,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true, age: true, gender: true } },
        laserSessions: { orderBy: { sessionNumber: 'asc' } },
      },
    })

    return NextResponse.json({ record })
  } catch (error) {
    console.error('Update laser record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.laserRecord.findUnique({
      where: { id },
      include: {
        patient: { select: { name: true } },
        laserSessions: true,
      },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Laser record not found' }, { status: 404 })
    }

    // Delete finance transactions for all paid sessions
    const patientName = existing.patient?.name || 'مريض'
    for (const session of existing.laserSessions) {
      if (session.paid) {
        const descriptionPattern = `جلسة ليزر #${session.sessionNumber} - ${patientName}`
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
    }

    await db.laserRecord.delete({ where: { id } })

    return NextResponse.json({ message: 'Laser record deleted successfully' })
  } catch (error) {
    console.error('Delete laser record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
        skinType: body.skinType ?? undefined,
        hairColor: body.hairColor ?? undefined,
        hairDensity: body.hairDensity ?? undefined,
        totalSessions: body.totalSessions ?? undefined,
        price: body.price ?? undefined,
        totalPrice: body.totalPrice ?? undefined,
        paid: body.paid ?? undefined,
        machineName: body.machineName ?? undefined,
        energy: body.energy ?? undefined,
        pulse: body.pulse ?? undefined,
        status: body.status ?? undefined,
        notes: body.notes ?? undefined,
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

    const existing = await db.laserRecord.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Laser record not found' }, { status: 404 })
    }

    await db.laserRecord.delete({ where: { id } })

    return NextResponse.json({ message: 'Laser record deleted successfully' })
  } catch (error) {
    console.error('Delete laser record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

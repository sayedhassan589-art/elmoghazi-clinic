import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const queue = await db.waitingQueue.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true } },
      },
    })

    return NextResponse.json({ queue })
  } catch (error) {
    console.error('Get waiting queue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const entry = await db.waitingQueue.create({
      data: {
        patientId: body.patientId || null,
        patientName: body.patientName || null,
        priority: body.priority || 0,
        status: body.status || 'waiting',
        notes: body.notes || null,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true } },
      },
    })

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error('Create waiting entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

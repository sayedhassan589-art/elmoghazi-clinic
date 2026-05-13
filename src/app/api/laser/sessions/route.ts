import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const laserRecordId = searchParams.get('laserRecordId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (laserRecordId) where.laserRecordId = laserRecordId

    const [sessions, total] = await Promise.all([
      db.laserSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sessionNumber: 'desc' },
        include: {
          laserRecord: {
            include: {
              patient: { select: { id: true, name: true, fileNumber: true } },
            },
          },
        },
      }),
      db.laserSession.count({ where }),
    ])

    return NextResponse.json({
      sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get laser sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.laserRecordId) {
      return NextResponse.json({ error: 'laserRecordId is required' }, { status: 400 })
    }

    const record = await db.laserRecord.findUnique({ where: { id: body.laserRecordId } })
    if (!record) {
      return NextResponse.json({ error: 'Laser record not found' }, { status: 404 })
    }

    // Auto-calculate session number
    const lastSession = await db.laserSession.findFirst({
      where: { laserRecordId: body.laserRecordId },
      orderBy: { sessionNumber: 'desc' },
      select: { sessionNumber: true },
    })

    const sessionNumber = lastSession ? lastSession.sessionNumber + 1 : 1

    const session = await db.laserSession.create({
      data: {
        laserRecordId: body.laserRecordId,
        sessionNumber: body.sessionNumber || sessionNumber,
        energy: body.energy || null,
        pulse: body.pulse || null,
        painLevel: body.painLevel || null,
        reaction: body.reaction || null,
        notes: body.notes || null,
        date: body.date ? new Date(body.date) : new Date(),
      },
      include: {
        laserRecord: {
          include: {
            patient: { select: { id: true, name: true, fileNumber: true } },
          },
        },
      },
    })

    // Update totalSessions on the record
    await db.laserRecord.update({
      where: { id: body.laserRecordId },
      data: { totalSessions: sessionNumber },
    })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('Create laser session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

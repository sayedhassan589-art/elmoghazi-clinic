import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const laserRecordId = searchParams.get('laserRecordId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50000')
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

    const sessionData: Record<string, unknown> = {
      laserRecordId: body.laserRecordId,
      sessionNumber: body.sessionNumber || sessionNumber,
      price: body.price ?? record.price ?? 0,
      paid: body.paid ?? false,
      date: body.date ? new Date(body.date) : new Date(),
    }
    if (body.energy) sessionData.energy = body.energy
    if (body.pulse) sessionData.pulse = body.pulse
    if (body.painLevel) sessionData.painLevel = body.painLevel
    if (body.reaction) sessionData.reaction = body.reaction
    if (body.notes) sessionData.notes = body.notes

    const session = await db.laserSession.create({
      data: sessionData as any,
      include: {
        laserRecord: {
          include: {
            patient: { select: { id: true, name: true, fileNumber: true } },
          },
        },
      },
    })

    // If session is paid, auto-create a financial transaction
    if (body.paid && (body.price ?? record.price ?? 0) > 0) {
      const patientName = session.laserRecord?.patient?.name || 'مريض'
      const areaInfo = record.bodyArea || ''
      try {
        await db.transaction.create({
          data: {
            type: 'income',
            category: 'ليزر',
            amount: body.price ?? record.price ?? 0,
            description: `جلسة ليزر #${sessionNumber} - ${patientName} - ${areaInfo}`,
            date: session.date,
          },
        })
      } catch (e) { console.error('Failed to create transaction for laser session:', e) }
    }

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

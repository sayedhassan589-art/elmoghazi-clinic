import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const laserRecordId = searchParams.get('laserRecordId') || ''

    const where: Record<string, unknown> = {}
    if (laserRecordId) where.laserRecordId = laserRecordId

    const notes = await db.laserNote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        laserRecord: {
          include: {
            patient: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Get laser notes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.laserRecordId || !body.content) {
      return NextResponse.json({ error: 'laserRecordId and content are required' }, { status: 400 })
    }

    const note = await db.laserNote.create({
      data: {
        laserRecordId: body.laserRecordId,
        content: body.content,
      },
      include: {
        laserRecord: {
          include: {
            patient: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Create laser note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

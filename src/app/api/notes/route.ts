import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const section = searchParams.get('section') || ''
    const important = searchParams.get('important')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (section) where.section = section
    if (important !== null && important !== '') where.important = important === 'true'

    const [notes, total] = await Promise.all([
      db.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      db.note.count({ where }),
    ])

    return NextResponse.json({
      notes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const note = await db.note.create({
      data: {
        patientId: body.patientId || null,
        userId: body.userId || null,
        content: body.content,
        important: body.important || false,
        section: body.section || null,
      },
      include: {
        patient: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

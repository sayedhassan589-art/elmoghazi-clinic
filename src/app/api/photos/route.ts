import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10000')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (type) where.type = type

    const [photos, total] = await Promise.all([
      db.patientPhoto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, name: true, fileNumber: true } },
        },
      }),
      db.patientPhoto.count({ where }),
    ])

    return NextResponse.json({
      photos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.patientId || !body.imageData) {
      return NextResponse.json({ error: 'patientId and imageData are required' }, { status: 400 })
    }

    const photo = await db.patientPhoto.create({
      data: {
        patientId: body.patientId,
        type: body.type || 'general',
        description: body.description || null,
        imageData: body.imageData,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
      },
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error('Create photo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

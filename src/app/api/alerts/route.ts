import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const type = searchParams.get('type') || ''
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (type) where.type = type
    if (active !== null && active !== '') where.active = active === 'true'

    const alerts = await db.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
      },
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.patientId || !body.message) {
      return NextResponse.json({ error: 'patientId and message are required' }, { status: 400 })
    }

    const alert = await db.alert.create({
      data: {
        patientId: body.patientId,
        type: body.type || 'warning',
        message: body.message,
        active: body.active ?? true,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
      },
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    console.error('Create alert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

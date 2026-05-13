import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const plan = await db.treatmentPlan.findUnique({ where: { id } })
    if (!plan) {
      return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 })
    }

    const phases = await db.treatmentPhase.findMany({
      where: { planId: id },
      orderBy: { order: 'asc' },
      include: {
        sessions: {
          include: {
            session: {
              include: {
                service: true,
                doctor: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ phases })
  } catch (error) {
    console.error('Get treatment phases error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const plan = await db.treatmentPlan.findUnique({ where: { id } })
    if (!plan) {
      return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 })
    }

    if (!body.name) {
      return NextResponse.json({ error: 'Phase name is required' }, { status: 400 })
    }

    // Get next order number
    const lastPhase = await db.treatmentPhase.findFirst({
      where: { planId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const phase = await db.treatmentPhase.create({
      data: {
        planId: id,
        name: body.name,
        description: body.description || null,
        order: body.order ?? (lastPhase ? lastPhase.order + 1 : 0),
        status: body.status || 'pending',
      },
    })

    return NextResponse.json({ phase }, { status: 201 })
  } catch (error) {
    console.error('Create treatment phase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

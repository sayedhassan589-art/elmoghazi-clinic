import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const plan = await db.treatmentPlan.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
        phases: {
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
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Get treatment plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.treatmentPlan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 })
    }

    const plan = await db.treatmentPlan.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        description: body.description ?? undefined,
        status: body.status ?? undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
        phases: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Update treatment plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.treatmentPlan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 })
    }

    await db.treatmentPlan.delete({ where: { id } })

    return NextResponse.json({ message: 'Treatment plan deleted successfully' })
  } catch (error) {
    console.error('Delete treatment plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

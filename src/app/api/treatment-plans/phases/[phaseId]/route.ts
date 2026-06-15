import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ phaseId: string }> }) {
  try {
    const { phaseId } = await params
    const body = await request.json()

    const existing = await db.treatmentPhase.findUnique({ where: { id: phaseId } })
    if (!existing) {
      return NextResponse.json({ error: 'Treatment phase not found' }, { status: 404 })
    }

    const phase = await db.treatmentPhase.update({
      where: { id: phaseId },
      data: {
        name: body.name ?? undefined,
        description: body.description ?? undefined,
        order: body.order ?? undefined,
        status: body.status ?? undefined,
      },
    })

    return NextResponse.json({ phase })
  } catch (error) {
    console.error('Update treatment phase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ phaseId: string }> }) {
  try {
    const { phaseId } = await params

    const existing = await db.treatmentPhase.findUnique({ where: { id: phaseId } })
    if (!existing) {
      return NextResponse.json({ error: 'Treatment phase not found' }, { status: 404 })
    }

    await db.treatmentPhase.delete({ where: { id: phaseId } })

    return NextResponse.json({ message: 'Treatment phase deleted successfully' })
  } catch (error) {
    console.error('Delete treatment phase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.medication.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
    }

    const medication = await db.medication.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        category: body.category ?? undefined,
        description: body.description ?? undefined,
        dosage: body.dosage ?? undefined,
        instructions: body.instructions ?? undefined,
        sideEffects: body.sideEffects ?? undefined,
        active: body.active ?? undefined,
      },
    })

    return NextResponse.json({ medication })
  } catch (error) {
    console.error('Update medication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.medication.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
    }

    await db.medication.delete({ where: { id } })

    return NextResponse.json({ message: 'Medication deleted successfully' })
  } catch (error) {
    console.error('Delete medication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

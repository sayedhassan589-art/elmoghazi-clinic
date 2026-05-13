import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.alert.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const alert = await db.alert.update({
      where: { id },
      data: {
        type: body.type ?? undefined,
        message: body.message ?? undefined,
        active: body.active ?? undefined,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
      },
    })

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.alert.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    await db.alert.delete({ where: { id } })

    return NextResponse.json({ message: 'Alert deleted successfully' })
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

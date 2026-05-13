import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.reminder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    const reminder = await db.reminder.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        description: body.description ?? undefined,
        date: body.date ? new Date(body.date) : undefined,
        type: body.type ?? undefined,
        status: body.status ?? undefined,
        sentVia: body.sentVia ?? undefined,
      },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
      },
    })

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error('Update reminder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.reminder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    await db.reminder.delete({ where: { id } })

    return NextResponse.json({ message: 'Reminder deleted successfully' })
  } catch (error) {
    console.error('Delete reminder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

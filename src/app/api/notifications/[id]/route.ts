import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.notification.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    const notification = await db.notification.update({
      where: { id },
      data: {
        read: body.read ?? true,
        type: body.type ?? undefined,
        link: body.link ?? undefined,
      },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.notification.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    await db.notification.delete({ where: { id } })

    return NextResponse.json({ message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

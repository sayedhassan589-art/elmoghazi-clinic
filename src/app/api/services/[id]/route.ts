import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const service = await db.service.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        category: body.category ?? undefined,
        price: body.price ?? undefined,
        duration: body.duration ?? undefined,
        active: body.active ?? undefined,
      },
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    await db.service.delete({ where: { id } })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

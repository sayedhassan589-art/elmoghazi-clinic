import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.inventoryItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    const item = await db.inventoryItem.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        category: body.category ?? undefined,
        quantity: body.quantity ?? undefined,
        minQuantity: body.minQuantity ?? undefined,
        unitPrice: body.unitPrice ?? undefined,
        notes: body.notes ?? undefined,
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Update inventory item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.inventoryItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    await db.inventoryItem.delete({ where: { id } })

    return NextResponse.json({ message: 'Inventory item deleted successfully' })
  } catch (error) {
    console.error('Delete inventory item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

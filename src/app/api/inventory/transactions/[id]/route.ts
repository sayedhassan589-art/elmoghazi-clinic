import { db } from '@/lib/db'
import { toCairoDate } from '@/lib/cairo-time'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.inventoryTransaction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Inventory transaction not found' }, { status: 404 })
    }

    // Reverse the old quantity change
    const oldChange = existing.type === 'in' ? -existing.quantity : existing.quantity
    await db.inventoryItem.update({
      where: { id: existing.itemId },
      data: { quantity: { increment: oldChange } },
    })

    // Apply the new values
    const transaction = await db.inventoryTransaction.update({
      where: { id },
      data: {
        type: body.type ?? undefined,
        quantity: body.quantity ?? undefined,
        notes: body.notes ?? undefined,
        date: body.date ? toCairoDate(body.date) : undefined,
      },
      include: { item: true },
    })

    // Apply new quantity change
    const newChange = transaction.type === 'in' ? transaction.quantity : -transaction.quantity
    await db.inventoryItem.update({
      where: { id: transaction.itemId },
      data: { quantity: { increment: newChange } },
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Update inventory transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.inventoryTransaction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Inventory transaction not found' }, { status: 404 })
    }

    // Reverse the quantity change
    const quantityChange = existing.type === 'in' ? -existing.quantity : existing.quantity
    await db.inventoryItem.update({
      where: { id: existing.itemId },
      data: { quantity: { increment: quantityChange } },
    })

    await db.inventoryTransaction.delete({ where: { id } })

    return NextResponse.json({ message: 'Inventory transaction deleted successfully' })
  } catch (error) {
    console.error('Delete inventory transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

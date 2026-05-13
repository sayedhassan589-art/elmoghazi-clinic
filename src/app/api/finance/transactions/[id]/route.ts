import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.transaction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        type: body.type ?? undefined,
        category: body.category ?? undefined,
        amount: body.amount ?? undefined,
        description: body.description ?? undefined,
        date: body.date ? new Date(body.date) : undefined,
      },
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.transaction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    await db.transaction.delete({ where: { id } })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Delete transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

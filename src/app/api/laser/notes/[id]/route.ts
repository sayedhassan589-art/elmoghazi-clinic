import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.laserNote.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Laser note not found' }, { status: 404 })
    }

    await db.laserNote.delete({ where: { id } })

    return NextResponse.json({ message: 'Laser note deleted successfully' })
  } catch (error) {
    console.error('Delete laser note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

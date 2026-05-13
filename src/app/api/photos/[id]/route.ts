import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.patientPhoto.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    await db.patientPhoto.delete({ where: { id } })

    return NextResponse.json({ message: 'Photo deleted successfully' })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

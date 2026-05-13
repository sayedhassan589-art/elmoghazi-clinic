import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.laserPackage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Laser package not found' }, { status: 404 })
    }

    const laserPackage = await db.laserPackage.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        sessionsCount: body.sessionsCount ?? undefined,
        price: body.price ?? undefined,
        bodyArea: body.bodyArea ?? undefined,
        active: body.active ?? undefined,
      },
    })

    return NextResponse.json({ package: laserPackage })
  } catch (error) {
    console.error('Update laser package error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.laserPackage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Laser package not found' }, { status: 404 })
    }

    await db.laserPackage.delete({ where: { id } })

    return NextResponse.json({ message: 'Laser package deleted successfully' })
  } catch (error) {
    console.error('Delete laser package error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.laserSetting.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Laser setting not found' }, { status: 404 })
    }

    const setting = await db.laserSetting.update({
      where: { id },
      data: {
        machineName: body.machineName ?? undefined,
        bodyArea: body.bodyArea ?? undefined,
        skinType: body.skinType ?? undefined,
        defaultEnergy: body.defaultEnergy ?? undefined,
        defaultPulse: body.defaultPulse ?? undefined,
        notes: body.notes ?? undefined,
      },
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Update laser setting error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.laserSetting.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Laser setting not found' }, { status: 404 })
    }

    await db.laserSetting.delete({ where: { id } })

    return NextResponse.json({ message: 'Laser setting deleted successfully' })
  } catch (error) {
    console.error('Delete laser setting error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

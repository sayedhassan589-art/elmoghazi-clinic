import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const doctor = await db.partnerDoctor.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.specialty !== undefined && { specialty: body.specialty }),
        ...(body.checkupPercentage !== undefined && { checkupPercentage: body.checkupPercentage }),
        ...(body.revisitPercentage !== undefined && { revisitPercentage: body.revisitPercentage }),
        ...(body.laserPercentage !== undefined && { laserPercentage: body.laserPercentage }),
        ...(body.sessionPercentage !== undefined && { sessionPercentage: body.sessionPercentage }),
        ...(body.fixedAmount !== undefined && { fixedAmount: body.fixedAmount }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    })

    return NextResponse.json({ doctor })
  } catch (error) {
    console.error('Update doctor error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await db.partnerDoctor.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete doctor error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

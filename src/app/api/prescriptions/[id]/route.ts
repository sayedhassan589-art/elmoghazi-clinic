import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const prescription = await db.prescription.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, age: true, gender: true } },
        doctor: { select: { id: true, name: true } },
        items: { include: { medication: true } },
      },
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    return NextResponse.json({ prescription })
  } catch (error) {
    console.error('Get prescription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.prescription.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    // Update basic fields
    await db.prescription.update({
      where: { id },
      data: {
        doctorId: body.doctorId ?? undefined,
        diagnosis: body.diagnosis ?? undefined,
        notes: body.notes ?? undefined,
        date: body.date ? new Date(body.date) : undefined,
      },
    })

    // If items provided, replace them
    if (body.items && Array.isArray(body.items)) {
      // Delete existing items
      await db.prescriptionItem.deleteMany({ where: { prescriptionId: id } })

      // Create new items
      await db.prescriptionItem.createMany({
        data: body.items.map((item: { medicationId: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }) => ({
          prescriptionId: id,
          medicationId: item.medicationId,
          dosage: item.dosage || null,
          frequency: item.frequency || null,
          duration: item.duration || null,
          instructions: item.instructions || null,
        })),
      })
    }

    const prescription = await db.prescription.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true } },
        doctor: { select: { id: true, name: true } },
        items: { include: { medication: true } },
      },
    })

    return NextResponse.json({ prescription })
  } catch (error) {
    console.error('Update prescription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.prescription.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    await db.prescription.delete({ where: { id } })

    return NextResponse.json({ message: 'Prescription deleted successfully' })
  } catch (error) {
    console.error('Delete prescription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

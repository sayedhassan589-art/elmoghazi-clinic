import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const gender = searchParams.get('gender') || ''
    const starred = searchParams.get('starred')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { phone2: { contains: search } },
        { fileNumber: { contains: search } },
      ]
    }

    if (gender) {
      where.gender = gender
    }

    if (starred !== null && starred !== '') {
      where.starred = starred === 'true'
    }

    const [patients, total] = await Promise.all([
      db.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { visits: true, sessions: true, alerts: true } },
        },
      }),
      db.patient.count({ where }),
    ])

    return NextResponse.json({
      patients,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get patients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Auto-generate fileNumber
    const lastPatient = await db.patient.findFirst({
      orderBy: { fileNumber: 'desc' },
      select: { fileNumber: true },
    })

    let nextNumber = 1
    if (lastPatient?.fileNumber) {
      const num = parseInt(lastPatient.fileNumber.replace(/\D/g, ''), 10)
      if (!isNaN(num)) {
        nextNumber = num + 1
      }
    }

    const fileNumber = `P${String(nextNumber).padStart(5, '0')}`

    const patient = await db.patient.create({
      data: {
        fileNumber,
        name: body.name,
        phone: body.phone || null,
        phone2: body.phone2 || null,
        age: body.age || null,
        gender: body.gender || null,
        bloodType: body.bloodType || null,
        address: body.address || null,
        notes: body.notes || null,
        allergies: body.allergies || null,
        medicalHistory: body.medicalHistory || null,
        starred: body.starred || false,
      },
    })

    return NextResponse.json({ patient }, { status: 201 })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

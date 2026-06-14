import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Virtual/relation fields that must be stripped before Prisma createMany/create
const VIRTUAL_FIELDS = [
  '_count', 'patient', 'doctor', 'user', 'service', 'laserRecord',
  'laserPackage', 'inventoryItem', 'treatmentPlan', 'phase',
  'visits', 'sessions', 'alerts', 'patientNotes', 'laserRecords',
  'appointments', 'photos', 'treatmentPlans', 'reminders',
  'waitingQueue', 'prescriptions', 'followUpRecords', 'followUpVisits',
  'items', 'transactions', 'notes', 'medications',
]

function stripVirtualFields(record: any): any {
  if (!record || typeof record !== 'object') return record
  const cleaned = { ...record }
  for (const field of VIRTUAL_FIELDS) {
    delete cleaned[field]
  }
  return cleaned
}

function cleanRecords(records: any[]): any[] {
  return records.map(stripVirtualFields)
}

// GET /api/backups/[id] — Fetch backup data for download/export
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const backup = await db.backup.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        size: true,
        status: true,
        createdAt: true,
        data: true,
      },
    })

    if (!backup) {
      return NextResponse.json({ error: 'النسخة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ backup })
  } catch (error) {
    console.error('Get backup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/backups/[id] — Restore from a stored backup
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const backup = await db.backup.findUnique({ where: { id } })
    if (!backup) {
      return NextResponse.json({ error: 'النسخة غير موجودة' }, { status: 404 })
    }

    const backupData = JSON.parse(backup.data)
    const data = backupData?.data || backupData

    // Delete in reverse dependency order
    const deleteOrder = [
      'treatmentPlanSession', 'treatmentPhase', 'treatmentPlan',
      'prescriptionItem', 'prescription',
      'followUpVisit', 'followUpRecord',
      'notification', 'auditLog',
      'inventoryTransaction', 'inventoryItem',
      'waitingQueue', 'appointment', 'transaction',
      'laserNote', 'laserSession', 'laserRecord',
      'laserSetting', 'laserPackage',
      'patientPhoto', 'medication',
      'reminder', 'alert', 'note',
      'session', 'visit', 'service',
      'partnerDoctor', 'patient', 'user', 'backup',
    ]

    for (const model of deleteOrder) {
      try {
        await (db as any)[model]?.deleteMany()
      } catch {
        // Model might not exist
      }
    }

    // Recreate data in dependency order — strip virtual fields first
    const restoreOrder: { key: string; model: string }[] = [
      { key: 'users', model: 'user' },
      { key: 'partnerDoctors', model: 'partnerDoctor' },
      { key: 'patients', model: 'patient' },
      { key: 'services', model: 'service' },
      { key: 'medications', model: 'medication' },
      { key: 'laserPackages', model: 'laserPackage' },
      { key: 'laserSettings', model: 'laserSetting' },
      { key: 'inventoryItems', model: 'inventoryItem' },
      { key: 'visits', model: 'visit' },
      { key: 'sessions', model: 'session' },
      { key: 'notes', model: 'note' },
      { key: 'alerts', model: 'alert' },
      { key: 'reminders', model: 'reminder' },
      { key: 'laserRecords', model: 'laserRecord' },
      { key: 'laserSessions', model: 'laserSession' },
      { key: 'laserNotes', model: 'laserNote' },
      { key: 'transactions', model: 'transaction' },
      { key: 'appointments', model: 'appointment' },
      { key: 'waitingQueue', model: 'waitingQueue' },
      { key: 'inventoryTransactions', model: 'inventoryTransaction' },
      { key: 'treatmentPlans', model: 'treatmentPlan' },
      { key: 'treatmentPhases', model: 'treatmentPhase' },
      { key: 'treatmentPlanSessions', model: 'treatmentPlanSession' },
      { key: 'patientPhotos', model: 'patientPhoto' },
      { key: 'prescriptions', model: 'prescription' },
      { key: 'prescriptionItems', model: 'prescriptionItem' },
      { key: 'followUpRecords', model: 'followUpRecord' },
      { key: 'followUpVisits', model: 'followUpVisit' },
      { key: 'notifications', model: 'notification' },
      { key: 'auditLogs', model: 'auditLog' },
    ]

    const results: Record<string, number> = {}
    let totalRestored = 0

    for (const { key, model } of restoreOrder) {
      const records = data[key]
      if (Array.isArray(records) && records.length > 0) {
        // Strip virtual fields before inserting
        const cleaned = cleanRecords(records)
        try {
          const result = await (db as any)[model].createMany({ data: cleaned, skipDuplicates: true })
          results[key] = result.count
          totalRestored += result.count
        } catch (err: any) {
          console.error(`Error restoring ${model}:`, err.message?.substring(0, 150))
          // Fallback: one-by-one
          let count = 0
          for (const record of cleaned) {
            try {
              await (db as any)[model].create({ data: record })
              count++
            } catch {
              // Skip bad records
            }
          }
          results[key] = count
          totalRestored += count
        }
      }
    }

    return NextResponse.json({
      message: 'تمت الاستعادة بنجاح',
      totalRestored,
      details: results,
    })
  } catch (error: any) {
    console.error('Restore backup error:', error)
    return NextResponse.json({
      error: 'حدث خطأ أثناء الاستعادة',
      details: error.message || String(error),
    }, { status: 500 })
  }
}

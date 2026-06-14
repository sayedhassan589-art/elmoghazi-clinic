import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Virtual/relation fields that must be stripped from records before Prisma createMany/create
// These fields are added by Prisma `include` but are not actual database columns
const VIRTUAL_FIELDS = [
  '_count', 'patient', 'doctor', 'user', 'service', 'laserRecord',
  'laserPackage', 'inventoryItem', 'treatmentPlan', 'phase',
  'visits', 'sessions', 'alerts', 'patientNotes', 'laserRecords',
  'appointments', 'photos', 'treatmentPlans', 'reminders',
  'waitingQueue', 'prescriptions', 'followUpRecords', 'followUpVisits',
  'items', 'transactions', 'notes', 'medications',
]

/**
 * Strip virtual/relation fields from a record before inserting into the database.
 * This prevents Prisma validation errors when restoring from backups that
 * include `_count`, nested relations, or other non-column fields.
 */
function stripVirtualFields(record: any): any {
  if (!record || typeof record !== 'object') return record
  const cleaned = { ...record }
  for (const field of VIRTUAL_FIELDS) {
    delete cleaned[field]
  }
  return cleaned
}

/**
 * Strip virtual fields from an array of records.
 * Returns a new array with cleaned records.
 */
function cleanRecords(records: any[]): any[] {
  return records.map(stripVirtualFields)
}

// POST /api/backups/import — Restore from uploaded JSON backup file
// This endpoint accepts the full backup JSON directly and restores via Prisma createMany,
// preserving original IDs and foreign key relationships.
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Support both formats:
    // 1. Full backup with wrapper: { exportedAt, version, data: { ... } }
    // 2. Direct data format: { patients: [...], visits: [...], ... }
    const backupData = body?.data || body

    if (!backupData || typeof backupData !== 'object') {
      return NextResponse.json({ error: 'صيغة الملف غير صالحة' }, { status: 400 })
    }

    // Check if it has any recognizable data
    const dataKeys = Object.keys(backupData)
    const knownKeys = [
      'users', 'patients', 'services', 'visits', 'sessions', 'notes', 'alerts',
      'reminders', 'laserRecords', 'laserSessions', 'laserPackages', 'laserSettings',
      'laserNotes', 'transactions', 'appointments', 'waitingQueue', 'inventoryItems',
      'inventoryTransactions', 'treatmentPlans', 'treatmentPhases', 'treatmentPlanSessions',
      'patientPhotos', 'medications', 'prescriptions', 'prescriptionItems', 'notifications',
      'auditLogs', 'partnerDoctors', 'followUpRecords', 'followUpVisits',
    ]
    const hasValidData = dataKeys.some(k => knownKeys.includes(k) && Array.isArray(backupData[k]))
    if (!hasValidData) {
      return NextResponse.json({ error: 'الملف لا يحتوي على بيانات صالحة للاستعادة' }, { status: 400 })
    }

    // Helper: safely create records, stripping virtual fields and reporting errors
    const safeCreateMany = async (model: string, records: any[]): Promise<{ count: number; errors: string[] }> => {
      if (!records?.length) return { count: 0, errors: [] }

      // Strip virtual fields from ALL records before attempting insert
      const cleanedRecords = cleanRecords(records)
      const errors: string[] = []

      try {
        const result = await (db as any)[model].createMany({
          data: cleanedRecords,
          skipDuplicates: true,
        })
        return { count: result.count, errors }
      } catch (err: any) {
        const batchError = err.message?.substring(0, 200) || 'Unknown error'
        console.error(`Error restoring ${model} with createMany:`, batchError)
        errors.push(`Batch insert failed: ${batchError}`)

        // Fallback: try one-by-one for records that fail
        let count = 0
        for (let i = 0; i < cleanedRecords.length; i++) {
          try {
            await (db as any)[model].create({ data: cleanedRecords[i] })
            count++
          } catch (singleErr: any) {
            // Log the specific record that failed but continue with others
            const errMsg = singleErr.message?.substring(0, 100) || 'Unknown error'
            errors.push(`Record ${i} failed: ${errMsg}`)
          }
        }
        return { count, errors }
      }
    }

    // Delete existing data in reverse dependency order
    const deleteOrder = [
      'treatmentPlanSession',
      'treatmentPhase',
      'treatmentPlan',
      'prescriptionItem',
      'prescription',
      'followUpVisit',
      'followUpRecord',
      'notification',
      'auditLog',
      'inventoryTransaction',
      'inventoryItem',
      'waitingQueue',
      'appointment',
      'transaction',
      'laserNote',
      'laserSession',
      'laserRecord',
      'laserSetting',
      'laserPackage',
      'patientPhoto',
      'medication',
      'reminder',
      'alert',
      'note',
      'session',
      'visit',
      'service',
      'partnerDoctor',
      'patient',
      'user',
      'backup',
    ]

    for (const model of deleteOrder) {
      try {
        await (db as any)[model]?.deleteMany()
      } catch {
        // Model might not exist, skip
      }
    }

    // Recreate data in dependency order (parents before children)
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
    const allErrors: Record<string, string[]> = {}
    let totalRestored = 0

    for (const { key, model } of restoreOrder) {
      const records = backupData[key]
      if (Array.isArray(records) && records.length > 0) {
        const { count, errors } = await safeCreateMany(model, records)
        results[key] = count
        if (errors.length > 0) {
          allErrors[key] = errors
        }
        totalRestored += count

        // Log if some records were skipped
        if (count < records.length) {
          console.warn(`⚠️ ${key}: Restored ${count}/${records.length} records. Some records were skipped.`)
        }
      }
    }

    return NextResponse.json({
      message: 'تمت الاستعادة بنجاح',
      totalRestored,
      details: results,
      errors: Object.keys(allErrors).length > 0 ? allErrors : undefined,
    }, { status: 200 })
  } catch (error: any) {
    console.error('Import backup error:', error)
    return NextResponse.json({
      error: 'حدث خطأ أثناء الاستعادة',
      details: error.message || String(error),
    }, { status: 500 })
  }
}

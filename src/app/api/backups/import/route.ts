import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

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

    // Helper: safely create records one by one to handle duplicates and bad data
    // SQLite doesn't support skipDuplicates in createMany, so we insert one-by-one
    const safeCreateMany = async (model: string, records: any[]) => {
      if (!records?.length) return 0
      let count = 0
      for (const record of records) {
        try {
          await (db as any)[model].create({ data: record })
          count++
        } catch (err: any) {
          // Skip duplicates and bad records silently
          if (!err?.message?.includes('Unique') && !err?.message?.includes('unique')) {
            console.error(`Error restoring ${model}:`, err.message?.substring(0, 100))
          }
        }
      }
      return count
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
    let totalRestored = 0

    for (const { key, model } of restoreOrder) {
      const records = backupData[key]
      if (Array.isArray(records) && records.length > 0) {
        const count = await safeCreateMany(model, records)
        results[key] = count
        totalRestored += count
      }
    }

    return NextResponse.json({
      message: 'تمت الاستعادة بنجاح',
      totalRestored,
      details: results,
    }, { status: 200 })
  } catch (error: any) {
    console.error('Import backup error:', error)
    return NextResponse.json({
      error: 'حدث خطأ أثناء الاستعادة',
      details: error.message || String(error),
    }, { status: 500 })
  }
}

import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST /api/patients/import — Bulk import patients from JSON/CSV/XLSX
// Accepts an array of patient objects and creates them in bulk.
// Automatically generates fileNumbers and skips duplicates.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const patients: any[] = body.patients

    if (!Array.isArray(patients) || patients.length === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات مرضى للاستيراد' }, { status: 400 })
    }

    // Limit to 5000 patients per import to prevent timeout
    const toImport = patients.slice(0, 5000)

    // Get existing patients for duplicate detection
    const existingPatients = await db.patient.findMany({
      select: { name: true, phone: true, fileNumber: true },
    })

    // Build a set of existing name+phone combos for fast lookup
    const existingSet = new Set<string>()
    for (const p of existingPatients) {
      existingSet.add(`${(p.name || '').trim().toLowerCase()}||${(p.phone || '').trim()}`)
    }

    // Get the current max fileNumber to continue numbering
    const lastPatient = await db.patient.findFirst({
      orderBy: { fileNumber: 'desc' },
      select: { fileNumber: true },
    })
    let nextNumber = 1
    if (lastPatient?.fileNumber) {
      const num = parseInt(lastPatient.fileNumber.replace(/\D/g, ''), 10)
      if (!isNaN(num)) nextNumber = num + 1
    }

    // Normalize gender field: map Arabic/English values to DB format
    const normalizeGender = (g: string | undefined | null): string | null => {
      if (!g) return null
      const lower = g.trim().toLowerCase()
      if (['male', 'm', 'ذكر', 'ذكرى'].includes(lower)) return 'male'
      if (['female', 'f', 'أنثى', 'انثى'].includes(lower)) return 'female'
      return g // Keep as-is if unrecognized
    }

    // Process each patient
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
      importedPatients: [] as { name: string; fileNumber: string }[],
    }

    for (const p of toImport) {
      // Validate: name is required
      const name = (p.name || p['الاسم'] || p.Name || p['اسم المريض'] || '')?.toString().trim()
      if (!name) {
        results.skipped++
        continue
      }

      const phone = (p.phone || p['الموبايل'] || p['هاتف'] || p.Phone || p['موبايل'] || p['موبايل ١'] || p['رقم الهاتف'] || '')?.toString().trim() || null
      const phone2 = (p.phone2 || p['الموبايل ٢'] || p['موبايل ٢'] || p.Phone2 || p['هاتف ٢'] || '')?.toString().trim() || null
      const age = parseInt(p.age || p['العمر'] || p.Age || '0') || null
      const gender = normalizeGender(p.gender || p['الجنس'] || p.Gender || '')
      const bloodType = (p.bloodType || p['فصيلة الدم'] || p.BloodType || '')?.toString().trim() || null
      const address = (p.address || p['العنوان'] || p.Address || p['عنوان'] || '')?.toString().trim() || null
      const notes = (p.notes || p['ملاحظات'] || p.Notes || p['الملاحظات'] || p.motes || '')?.toString().trim() || null
      const allergies = (p.allergies || p['الحساسية'] || p.Allergies || '')?.toString().trim() || null
      const medicalHistory = (p.medicalHistory || p['التاريخ المرضي'] || p.MedicalHistory || p['تاريخ مرضي'] || '')?.toString().trim() || null

      // Check for duplicate (by name+phone)
      const duplicateKey = `${name.toLowerCase()}||${phone || ''}`
      if (existingSet.has(duplicateKey)) {
        results.skipped++
        continue
      }

      try {
        const fileNumber = `P${String(nextNumber).padStart(5, '0')}`
        nextNumber++

        const patient = await db.patient.create({
          data: {
            fileNumber,
            name,
            phone,
            phone2,
            age,
            gender,
            bloodType,
            address,
            notes,
            allergies,
            medicalHistory,
            starred: false,
          },
        })

        // Add to existing set so we don't create duplicates within the same import
        existingSet.add(duplicateKey)

        results.imported++
        results.importedPatients.push({ name, fileNumber })
      } catch (err: any) {
        results.skipped++
        results.errors.push(`${name}: ${err.message?.substring(0, 80) || 'خطأ غير معروف'}`)
      }
    }

    return NextResponse.json({
      message: `تم استيراد ${results.imported} مريض بنجاح`,
      imported: results.imported,
      skipped: results.skipped,
      total: toImport.length,
      errors: results.errors.length > 0 ? results.errors.slice(0, 20) : undefined,
      importedPatients: results.importedPatients.slice(0, 50), // First 50 for preview
    }, { status: 200 })
  } catch (error: any) {
    console.error('Bulk import error:', error)
    return NextResponse.json({
      error: 'حدث خطأ أثناء الاستيراد',
      details: error.message || String(error),
    }, { status: 500 })
  }
}

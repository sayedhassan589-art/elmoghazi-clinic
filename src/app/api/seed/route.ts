import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Clean existing data (reverse dependency order)
    await db.treatmentPlanSession.deleteMany()
    await db.treatmentPhase.deleteMany()
    await db.treatmentPlan.deleteMany()
    await db.prescriptionItem.deleteMany()
    await db.prescription.deleteMany()
    await db.notification.deleteMany()
    await db.auditLog.deleteMany()
    await db.inventoryTransaction.deleteMany()
    await db.inventoryItem.deleteMany()
    await db.waitingQueue.deleteMany()
    await db.appointment.deleteMany()
    await db.transaction.deleteMany()
    await db.laserNote.deleteMany()
    await db.laserSession.deleteMany()
    await db.laserRecord.deleteMany()
    await db.laserSetting.deleteMany()
    await db.laserPackage.deleteMany()
    await db.patientPhoto.deleteMany()
    await db.medication.deleteMany()
    await db.reminder.deleteMany()
    await db.alert.deleteMany()
    await db.note.deleteMany()
    await db.session.deleteMany()
    await db.visit.deleteMany()
    await db.service.deleteMany()
    await db.patient.deleteMany()
    await db.user.deleteMany()

    // Create users
    const doctor = await db.user.create({
      data: {
        name: 'Dr. Elmoghazi',
        email: 'doctor@elmoghazi.com',
        password: '1300',
        role: 'doctor',
        active: true,
      },
    })

    const secretary = await db.user.create({
      data: {
        name: 'Sarah Ahmed',
        email: 'secretary@elmoghazi.com',
        password: '1300',
        role: 'secretary',
        active: true,
      },
    })

    // Create medications for dermatology
    const medications = await Promise.all([
      db.medication.create({ data: { name: 'Hydrocortisone 1% Cream', category: 'cream', description: 'Mild topical corticosteroid', dosage: 'Apply thin layer', instructions: 'Apply to affected area twice daily', sideEffects: 'Skin thinning with prolonged use', active: true } }),
      db.medication.create({ data: { name: 'Betamethasone 0.05% Cream', category: 'cream', description: 'Medium potency topical corticosteroid', dosage: 'Apply thin layer', instructions: 'Apply to affected area once or twice daily', sideEffects: 'Skin atrophy, striae', active: true } }),
      db.medication.create({ data: { name: 'Clobetasol 0.05% Ointment', category: 'ointment', description: 'Super potent topical corticosteroid', dosage: 'Apply thin layer', instructions: 'Apply sparingly to affected area twice daily, max 2 weeks', sideEffects: 'Skin atrophy, telangiectasia, HPA axis suppression', active: true } }),
      db.medication.create({ data: { name: 'Clotrimazole 1% Cream', category: 'cream', description: 'Antifungal cream', dosage: 'Apply thin layer', instructions: 'Apply to affected area twice daily for 2-4 weeks', sideEffects: 'Local irritation, burning', active: true } }),
      db.medication.create({ data: { name: 'Terbinafine 1% Gel', category: 'gel', description: 'Antifungal gel', dosage: 'Apply thin layer', instructions: 'Apply once daily for 1 week', sideEffects: 'Local irritation, dryness', active: true } }),
      db.medication.create({ data: { name: 'Adapalene 0.1% Gel', category: 'gel', description: 'Retinoid for acne', dosage: 'Pea-sized amount', instructions: 'Apply at night to clean dry skin', sideEffects: 'Dryness, peeling, sun sensitivity', active: true } }),
      db.medication.create({ data: { name: 'Benzoyl Peroxide 5% Gel', category: 'gel', description: 'Antibacterial for acne', dosage: 'Thin layer', instructions: 'Apply once daily, increase to twice daily as tolerated', sideEffects: 'Dryness, irritation, bleaching of fabrics', active: true } }),
      db.medication.create({ data: { name: 'Metronidazole 0.75% Gel', category: 'gel', description: 'For rosacea', dosage: 'Thin layer', instructions: 'Apply twice daily to affected areas', sideEffects: 'Local irritation, metallic taste', active: true } }),
      db.medication.create({ data: { name: 'Mupirocin 2% Ointment', category: 'ointment', description: 'Topical antibiotic', dosage: 'Small amount', instructions: 'Apply to affected area 3 times daily for up to 10 days', sideEffects: 'Local irritation', active: true } }),
      db.medication.create({ data: { name: 'Tacrolimus 0.1% Ointment', category: 'ointment', description: 'Topical calcineurin inhibitor for eczema', dosage: 'Thin layer', instructions: 'Apply twice daily, avoid sun exposure', sideEffects: 'Burning, stinging at application site', active: true } }),
      db.medication.create({ data: { name: 'Isotretinoin 20mg', category: 'tablet', description: 'Oral retinoid for severe acne', dosage: '0.5-1 mg/kg/day', instructions: 'Take with food, monthly pregnancy tests required, avoid vitamin A', sideEffects: 'Dry lips, dry skin, teratogenic, mood changes, liver effects', active: true } }),
      db.medication.create({ data: { name: 'Doxycycline 100mg', category: 'tablet', description: 'Oral antibiotic for acne and infections', dosage: '100mg once or twice daily', instructions: 'Take with food, stay upright for 30 min, avoid sun', sideEffects: 'GI upset, esophageal irritation, photosensitivity', active: true } }),
      db.medication.create({ data: { name: 'Fluconazole 150mg', category: 'tablet', description: 'Oral antifungal', dosage: '150mg single dose or weekly', instructions: 'Take as directed, monitor liver function', sideEffects: 'Nausea, headache, liver effects', active: true } }),
      db.medication.create({ data: { name: 'Cetirizine 10mg', category: 'tablet', description: 'Antihistamine for allergic skin conditions', dosage: '10mg once daily', instructions: 'Take at bedtime, may cause drowsiness', sideEffects: 'Drowsiness, dry mouth', active: true } }),
      db.medication.create({ data: { name: 'Sunscreen SPF 50+ Lotion', category: 'lotion', description: 'Broad spectrum sunscreen', dosage: 'Generous application', instructions: 'Apply 20 min before sun exposure, reapply every 2 hours', sideEffects: 'Rare allergic reactions', active: true } }),
      db.medication.create({ data: { name: 'Urea 10% Cream', category: 'cream', description: 'Keratolytic moisturizer', dosage: 'Apply as needed', instructions: 'Apply to dry/rough skin twice daily', sideEffects: 'Mild stinging on broken skin', active: true } }),
      db.medication.create({ data: { name: 'Salicylic Acid 5% Ointment', category: 'ointment', description: 'Keratolytic for warts and psoriasis', dosage: 'Apply to affected area', instructions: 'Apply at night under occlusion', sideEffects: 'Local irritation', active: true } }),
      db.medication.create({ data: { name: 'Triamcinolone Injection 40mg/ml', category: 'injection', description: 'Intralesional corticosteroid', dosage: '0.1-0.3 ml per lesion', instructions: 'Inject into dermal lesions, max 40mg per visit', sideEffects: 'Skin atrophy, depigmentation', active: true } }),
    ])

    // Create services
    const services = await Promise.all([
      db.service.create({ data: { name: 'General Consultation', category: 'consultation', price: 200, duration: 30, active: true } }),
      db.service.create({ data: { name: 'Follow-up Visit', category: 'consultation', price: 150, duration: 15, active: true } }),
      db.service.create({ data: { name: 'Laser Hair Removal - Small Area', category: 'laser', price: 300, duration: 20, active: true } }),
      db.service.create({ data: { name: 'Laser Hair Removal - Medium Area', category: 'laser', price: 500, duration: 30, active: true } }),
      db.service.create({ data: { name: 'Laser Hair Removal - Large Area', category: 'laser', price: 800, duration: 45, active: true } }),
      db.service.create({ data: { name: 'Laser Skin Resurfacing', category: 'laser', price: 1000, duration: 60, active: true } }),
      db.service.create({ data: { name: 'Acne Treatment', category: 'treatment', price: 350, duration: 30, active: true } }),
      db.service.create({ data: { name: 'Chemical Peeling', category: 'cosmetic', price: 400, duration: 30, active: true } }),
      db.service.create({ data: { name: 'Microdermabrasion', category: 'cosmetic', price: 350, duration: 30, active: true } }),
      db.service.create({ data: { name: 'Botox Injection', category: 'cosmetic', price: 1500, duration: 20, active: true } }),
      db.service.create({ data: { name: 'Filler Injection', category: 'cosmetic', price: 2000, duration: 30, active: true } }),
      db.service.create({ data: { name: 'Wart Removal', category: 'treatment', price: 250, duration: 15, active: true } }),
      db.service.create({ data: { name: 'Skin Biopsy', category: 'treatment', price: 500, duration: 20, active: true } }),
      db.service.create({ data: { name: 'Phototherapy Session', category: 'treatment', price: 300, duration: 20, active: true } }),
      db.service.create({ data: { name: 'PRP Treatment', category: 'cosmetic', price: 1200, duration: 45, active: true } }),
    ])

    // Create patients
    const patients = []
    const patientData = [
      { name: 'Fatima Al-Rashid', phone: '0501234567', phone2: '0551234567', age: 28, gender: 'female', bloodType: 'A+', address: 'Riyadh, Al-Olaya District', allergies: 'Penicillin', medicalHistory: 'No chronic conditions', notes: 'Regular patient', starred: true },
      { name: 'Ahmed Hassan', phone: '0509876543', age: 45, gender: 'male', bloodType: 'O+', address: 'Riyadh, Al-Nakheel', allergies: '', medicalHistory: 'Hypertension', notes: '', starred: false },
      { name: 'Noura Al-Saeed', phone: '0541112233', age: 32, gender: 'female', bloodType: 'B+', address: 'Jeddah, Al-Hamra', allergies: 'Sulfa drugs', medicalHistory: 'Eczema since childhood', notes: 'Sensitive skin', starred: true },
      { name: 'Mohammed Al-Khalidi', phone: '0567891234', age: 55, gender: 'male', bloodType: 'AB+', address: 'Riyadh, Al-Malqa', allergies: '', medicalHistory: 'Diabetes Type 2', notes: 'Monitor wound healing', starred: false },
      { name: 'Layla Mahmoud', phone: '0554433221', age: 24, gender: 'female', bloodType: 'O-', address: 'Riyadh, Al-Yarmouk', allergies: 'Latex', medicalHistory: '', notes: '', starred: false },
      { name: 'Khalid Al-Otaibi', phone: '0503322110', age: 38, gender: 'male', bloodType: 'A-', address: 'Riyadh, Al-Sulaimaniya', allergies: '', medicalHistory: 'Psoriasis', notes: 'Chronic condition', starred: false },
      { name: 'Sara Al-Dosari', phone: '0549988776', age: 19, gender: 'female', bloodType: 'B-', address: 'Riyadh, Al-Rabwa', allergies: '', medicalHistory: '', notes: 'New patient - acne', starred: false },
      { name: 'Omar Al-Shammari', phone: '0561122334', age: 62, gender: 'male', bloodType: 'O+', address: 'Riyadh, Al-Wurud', allergies: 'Aspirin', medicalHistory: 'Heart disease, hypertension', notes: '', starred: false },
      { name: 'Hind Al-Qahtani', phone: '0508877665', age: 35, gender: 'female', bloodType: 'AB-', address: 'Riyadh, Al-Malga', allergies: '', medicalHistory: 'Vitiligo', notes: 'Laser treatment patient', starred: true },
      { name: 'Youssef Al-Amri', phone: '0556677889', age: 41, gender: 'male', bloodType: 'A+', address: 'Riyadh, Al-Narjis', allergies: '', medicalHistory: '', notes: '', starred: false },
    ]

    for (let i = 0; i < patientData.length; i++) {
      const fileNumber = `P${String(i + 1).padStart(5, '0')}`
      const p = patientData[i]
      const patient = await db.patient.create({
        data: {
          fileNumber,
          name: p.name,
          phone: p.phone,
          phone2: p.phone2 || null,
          age: p.age,
          gender: p.gender,
          bloodType: p.bloodType || null,
          address: p.address || null,
          allergies: p.allergies || null,
          medicalHistory: p.medicalHistory || null,
          notes: p.notes || null,
          starred: p.starred,
        },
      })
      patients.push(patient)
    }

    // Create visits for the last 30 days
    const now = new Date()
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30)
      const visitDate = new Date(now)
      visitDate.setDate(visitDate.getDate() - daysAgo)

      await db.visit.create({
        data: {
          patientId: patients[Math.floor(Math.random() * patients.length)].id,
          doctorId: doctor.id,
          type: ['consultation', 'followup', 'emergency'][Math.floor(Math.random() * 3)],
          diagnosis: ['Acne Vulgaris', 'Psoriasis', 'Eczema', 'Fungal Infection', 'Vitiligo', 'Rosacea', 'Contact Dermatitis', 'Alopecia'][Math.floor(Math.random() * 8)],
          notes: 'Patient responded well to treatment',
          date: visitDate,
        },
      })
    }

    // Create sessions
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30)
      const sessionDate = new Date(now)
      sessionDate.setDate(sessionDate.getDate() - daysAgo)

      const randomService = services[Math.floor(Math.random() * services.length)]

      await db.session.create({
        data: {
          patientId: patients[Math.floor(Math.random() * patients.length)].id,
          serviceId: randomService.id,
          doctorId: doctor.id,
          status: ['scheduled', 'completed', 'completed', 'completed', 'cancelled'][Math.floor(Math.random() * 5)],
          notes: '',
          date: sessionDate,
          price: randomService.price,
          paid: Math.random() > 0.3,
        },
      })
    }

    // Create laser records
    const laserRecord1 = await db.laserRecord.create({
      data: {
        patientId: patients[0].id,
        bodyArea: 'Upper Lip',
        skinType: 'IV',
        hairColor: 'Dark Brown',
        hairDensity: 'medium',
        totalSessions: 3,
        status: 'active',
        notes: 'Responding well to treatment',
      },
    })

    const laserRecord2 = await db.laserRecord.create({
      data: {
        patientId: patients[8].id,
        bodyArea: 'Full Legs',
        skinType: 'III',
        hairColor: 'Black',
        hairDensity: 'high',
        totalSessions: 5,
        status: 'active',
        notes: 'Good response',
      },
    })

    // Create laser sessions for the records
    for (let i = 1; i <= 3; i++) {
      const sessionDate = new Date(now)
      sessionDate.setDate(sessionDate.getDate() - (30 - i * 10))
      await db.laserSession.create({
        data: {
          laserRecordId: laserRecord1.id,
          sessionNumber: i,
          energy: 12 + i * 2,
          pulse: '15ms',
          painLevel: 3 + i,
          reaction: 'Mild erythema',
          notes: `Session ${i} completed`,
          date: sessionDate,
        },
      })
    }

    for (let i = 1; i <= 5; i++) {
      const sessionDate = new Date(now)
      sessionDate.setDate(sessionDate.getDate() - (50 - i * 10))
      await db.laserSession.create({
        data: {
          laserRecordId: laserRecord2.id,
          sessionNumber: i,
          energy: 18 + i * 2,
          pulse: '20ms',
          painLevel: 4,
          reaction: 'Perifollicular erythema and edema',
          notes: `Session ${i} - good results`,
          date: sessionDate,
        },
      })
    }

    // Create laser packages
    await Promise.all([
      db.laserPackage.create({ data: { name: 'Small Area - 6 Sessions', sessionsCount: 6, price: 1500, bodyArea: 'Upper Lip / Chin', active: true } }),
      db.laserPackage.create({ data: { name: 'Medium Area - 6 Sessions', sessionsCount: 6, price: 2700, bodyArea: 'Underarms / Bikini', active: true } }),
      db.laserPackage.create({ data: { name: 'Large Area - 6 Sessions', sessionsCount: 6, price: 4200, bodyArea: 'Full Legs / Full Back', active: true } }),
      db.laserPackage.create({ data: { name: 'Full Body - 8 Sessions', sessionsCount: 8, price: 8000, bodyArea: 'Full Body', active: true } }),
    ])

    // Create laser settings
    await Promise.all([
      db.laserSetting.create({ data: { machineName: 'Candela GentleLase Pro', bodyArea: 'Upper Lip', skinType: 'III', defaultEnergy: 14, defaultPulse: '15ms', notes: 'Start low, increase as tolerated' } }),
      db.laserSetting.create({ data: { machineName: 'Candela GentleLase Pro', bodyArea: 'Underarms', skinType: 'III', defaultEnergy: 16, defaultPulse: '15ms', notes: '' } }),
      db.laserSetting.create({ data: { machineName: 'Candela GentleLase Pro', bodyArea: 'Full Legs', skinType: 'IV', defaultEnergy: 18, defaultPulse: '20ms', notes: 'Use caution with darker skin' } }),
      db.laserSetting.create({ data: { machineName: 'Candela GentleYag', bodyArea: 'Full Legs', skinType: 'V', defaultEnergy: 22, defaultPulse: '25ms', notes: 'For darker skin types' } }),
      db.laserSetting.create({ data: { machineName: 'Candela GentleYag', bodyArea: 'Bikini', skinType: 'IV', defaultEnergy: 20, defaultPulse: '20ms', notes: '' } }),
    ])

    // Create laser notes
    await Promise.all([
      db.laserNote.create({ data: { laserRecordId: laserRecord1.id, content: 'Patient reports reduced hair growth after 3 sessions' } }),
      db.laserNote.create({ data: { laserRecordId: laserRecord2.id, content: 'Switching to GentleYag for better results on darker skin' } }),
    ])

    // Create transactions
    const transactionCategories = ['clinic', 'clinic', 'clinic', 'personal']
    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 30)
      const txDate = new Date(now)
      txDate.setDate(txDate.getDate() - daysAgo)

      const isIncome = Math.random() > 0.3
      await db.transaction.create({
        data: {
          type: isIncome ? 'income' : 'expense',
          category: transactionCategories[Math.floor(Math.random() * transactionCategories.length)],
          amount: isIncome ? Math.floor(Math.random() * 1000) + 100 : Math.floor(Math.random() * 500) + 50,
          description: isIncome
            ? ['Consultation fee', 'Laser session payment', 'Treatment payment', 'Cosmetic procedure'][Math.floor(Math.random() * 4)]
            : ['Supplies purchase', 'Equipment maintenance', 'Rent', 'Staff salary'][Math.floor(Math.random() * 4)],
          date: txDate,
        },
      })
    }

    // Create appointments for today and upcoming
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 8; i++) {
      const aptDate = new Date(today)
      aptDate.setHours(9 + i, 0, 0, 0)
      await db.appointment.create({
        data: {
          patientId: patients[i % patients.length].id,
          date: aptDate,
          duration: 30,
          type: ['consultation', 'followup', 'laser'][Math.floor(Math.random() * 3)],
          status: i < 3 ? 'completed' : i < 5 ? 'confirmed' : 'scheduled',
          notes: '',
        },
      })
    }

    // Create tomorrow appointments
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    for (let i = 0; i < 5; i++) {
      const aptDate = new Date(tomorrow)
      aptDate.setHours(9 + i, 30, 0, 0)
      await db.appointment.create({
        data: {
          patientId: patients[Math.floor(Math.random() * patients.length)].id,
          date: aptDate,
          duration: 30,
          type: ['consultation', 'laser'][Math.floor(Math.random() * 2)],
          status: 'scheduled',
          notes: '',
        },
      })
    }

    // Create waiting queue entries
    await db.waitingQueue.create({ data: { patientId: patients[2].id, patientName: patients[2].name, priority: 1, status: 'waiting', notes: 'Follow-up eczema' } })
    await db.waitingQueue.create({ data: { patientId: patients[5].id, patientName: patients[5].name, priority: 0, status: 'waiting', notes: 'Psoriasis check' } })
    await db.waitingQueue.create({ data: { patientId: patients[0].id, patientName: patients[0].name, priority: 2, status: 'in_progress', notes: 'Laser session' } })

    // Create alerts
    await Promise.all([
      db.alert.create({ data: { patientId: patients[0].id, type: 'warning', message: 'Penicillin allergy - verify before prescribing', active: true } }),
      db.alert.create({ data: { patientId: patients[2].id, type: 'danger', message: 'Sulfa drug allergy - STRICT CONTRAINDICATION', active: true } }),
      db.alert.create({ data: { patientId: patients[3].id, type: 'info', message: 'Diabetic patient - monitor wound healing carefully', active: true } }),
      db.alert.create({ data: { patientId: patients[4].id, type: 'warning', message: 'Latex allergy - use non-latex gloves', active: true } }),
    ])

    // Create notes
    await Promise.all([
      db.note.create({ data: { patientId: patients[0].id, userId: doctor.id, content: 'Patient prefers morning appointments', important: true, section: 'patients' } }),
      db.note.create({ data: { patientId: null, userId: secretary.id, content: 'New laser machine arriving next week', important: false, section: 'dashboard' } }),
      db.note.create({ data: { patientId: patients[5].id, userId: doctor.id, content: 'Psoriasis flare-up protocol needed', important: true, section: 'patients' } }),
      db.note.create({ data: { patientId: null, userId: doctor.id, content: 'Order more hydrocortisone cream', important: false, section: 'inventory' } }),
    ])

    // Create reminders
    await Promise.all([
      db.reminder.create({ data: { patientId: patients[0].id, title: 'Follow-up laser session', description: 'Session 4 of upper lip laser', date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), type: 'appointment', status: 'pending', sentVia: 'whatsapp' } }),
      db.reminder.create({ data: { patientId: patients[5].id, title: 'Psoriasis check-up', description: 'Monthly follow-up', date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), type: 'follow_up', status: 'pending', sentVia: 'sms' } }),
      db.reminder.create({ data: { patientId: patients[3].id, title: 'Isotretinoin monthly labs', description: 'Liver function and lipid panel', date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), type: 'medication', status: 'pending' } }),
      db.reminder.create({ data: { patientId: null, title: 'Equipment calibration', description: 'Laser machine annual calibration due', date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), type: 'custom', status: 'pending' } }),
    ])

    // Create inventory items
    const item1 = await db.inventoryItem.create({ data: { name: 'Hydrocortisone 1% Cream (30g)', category: 'Medication', quantity: 45, minQuantity: 10, unitPrice: 25, notes: 'Popular item' } })
    const item2 = await db.inventoryItem.create({ data: { name: 'Betamethasone 0.05% Cream (30g)', category: 'Medication', quantity: 30, minQuantity: 10, unitPrice: 30, notes: '' } })
    const item3 = await db.inventoryItem.create({ data: { name: 'Laser Gel (500ml)', category: 'Supplies', quantity: 8, minQuantity: 5, unitPrice: 80, notes: 'For laser procedures' } })
    const item4 = await db.inventoryItem.create({ data: { name: 'Disposable Gloves (Box of 100)', category: 'Supplies', quantity: 15, minQuantity: 5, unitPrice: 45, notes: 'Non-latex option available' } })
    const item5 = await db.inventoryItem.create({ data: { name: 'Sunscreen SPF 50 (100ml)', category: 'Product', quantity: 20, minQuantity: 5, unitPrice: 55, notes: 'Retail product' } })

    // Create some inventory transactions
    await db.inventoryTransaction.create({ data: { itemId: item1.id, type: 'out', quantity: 3, notes: 'Given to patients', date: new Date() } })
    await db.inventoryTransaction.create({ data: { itemId: item3.id, type: 'out', quantity: 2, notes: 'Used in laser sessions', date: new Date() } })
    await db.inventoryTransaction.create({ data: { itemId: item4.id, type: 'in', quantity: 5, notes: 'New order received', date: new Date() } })

    // Create treatment plans
    const plan1 = await db.treatmentPlan.create({
      data: {
        patientId: patients[6].id,
        title: 'Acne Treatment Plan',
        description: 'Comprehensive acne management plan',
        status: 'active',
        startDate: new Date(),
      },
    })

    const phase1 = await db.treatmentPhase.create({
      data: { planId: plan1.id, name: 'Initial Treatment', description: 'Topical therapy and skin care routine', order: 0, status: 'in_progress' },
    })

    const phase2 = await db.treatmentPhase.create({
      data: { planId: plan1.id, name: 'Maintenance', description: 'Long-term maintenance and monitoring', order: 1, status: 'pending' },
    })

    const plan2 = await db.treatmentPlan.create({
      data: {
        patientId: patients[5].id,
        title: 'Psoriasis Management Plan',
        description: 'Multi-phase psoriasis treatment',
        status: 'active',
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    })

    await db.treatmentPhase.create({
      data: { planId: plan2.id, name: 'Acute Flare Control', description: 'Control current flare with topical steroids', order: 0, status: 'completed' },
    })

    await db.treatmentPhase.create({
      data: { planId: plan2.id, name: 'Maintenance Phase', description: 'Transition to maintenance therapy', order: 1, status: 'in_progress' },
    })

    // Create prescriptions
    const presc1 = await db.prescription.create({
      data: {
        patientId: patients[6].id,
        doctorId: doctor.id,
        diagnosis: 'Acne Vulgaris - Moderate',
        notes: 'Follow up in 4 weeks',
        date: new Date(),
        items: {
          create: [
            { medicationId: medications[5].id, dosage: 'Pea-sized amount', frequency: 'Once daily at night', duration: '3 months', instructions: 'Apply to clean dry face, avoid eyes' },
            { medicationId: medications[6].id, dosage: 'Thin layer', frequency: 'Once daily in morning', duration: '3 months', instructions: 'Start every other day, increase as tolerated' },
            { medicationId: medications[14].id, dosage: 'Generous application', frequency: 'Every morning', duration: 'Ongoing', instructions: 'Apply 20 min before sun exposure' },
          ],
        },
      },
    })

    const presc2 = await db.prescription.create({
      data: {
        patientId: patients[2].id,
        doctorId: doctor.id,
        diagnosis: 'Atopic Dermatitis - Flare',
        notes: 'Eczema management plan discussed',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            { medicationId: medications[1].id, dosage: 'Thin layer', frequency: 'Twice daily', duration: '2 weeks', instructions: 'Apply to affected areas only' },
            { medicationId: medications[9].id, dosage: 'Thin layer', frequency: 'Twice daily', duration: '2 weeks', instructions: 'Apply after steroid cream' },
            { medicationId: medications[13].id, dosage: '10mg', frequency: 'Once daily at bedtime', duration: '2 weeks', instructions: 'For itch control' },
            { medicationId: medications[15].id, dosage: 'Apply liberally', frequency: 'As needed', duration: 'Ongoing', instructions: 'Apply after bathing and throughout the day' },
          ],
        },
      },
    })

    // Create notifications
    await Promise.all([
      db.notification.create({ data: { userId: doctor.id, title: 'New Appointment', message: 'Sara Al-Dosari has an appointment tomorrow at 10:00 AM', type: 'info', read: false } }),
      db.notification.create({ data: { userId: doctor.id, title: 'Low Stock Alert', message: 'Laser Gel stock is running low (8 units remaining)', type: 'warning', read: false } }),
      db.notification.create({ data: { userId: secretary.id, title: 'Reminder', message: 'Dr. Elmoghazi - Equipment calibration due in 30 days', type: 'info', read: true } }),
      db.notification.create({ data: { userId: null, title: 'System Update', message: 'Clinic management system has been updated to version 1.1', type: 'success', read: false } }),
    ])

    // Create audit logs
    await Promise.all([
      db.auditLog.create({ data: { userId: doctor.id, action: 'LOGIN', entity: 'User', entityId: doctor.id, details: 'Doctor logged in' } }),
      db.auditLog.create({ data: { userId: secretary.id, action: 'CREATE', entity: 'Patient', details: 'Created patient: Fatima Al-Rashid' } }),
      db.auditLog.create({ data: { userId: secretary.id, action: 'CREATE', entity: 'Appointment', details: 'Created appointment for Fatima Al-Rashid' } }),
      db.auditLog.create({ data: { userId: doctor.id, action: 'CREATE', entity: 'Prescription', entityId: presc1.id, details: 'Created prescription for Sara Al-Dosari' } }),
    ])

    return NextResponse.json({
      message: 'Seed data created successfully',
      summary: {
        users: 2,
        patients: patients.length,
        services: services.length,
        medications: medications.length,
        visits: 15,
        sessions: 20,
        laserRecords: 2,
        laserSessions: 8,
        laserPackages: 4,
        laserSettings: 5,
        appointments: 13,
        transactions: 25,
        alerts: 4,
        notes: 4,
        reminders: 4,
        inventoryItems: 5,
        prescriptions: 2,
        treatmentPlans: 2,
        notifications: 4,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

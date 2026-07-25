import { create } from 'zustand'

// ─── Laser Form Store ──────────────────────────────────────────────────────
// Contains: laser record form, laser session form, laser editing, laser finance

interface LaserFormState {
  // Laser record form
  laserFormArea: string
  setLaserFormArea: (v: string) => void
  laserFormSkinType: string
  setLaserFormSkinType: (v: string) => void
  laserFormHairColor: string
  setLaserFormHairColor: (v: string) => void
  laserFormHairDensity: string
  setLaserFormHairDensity: (v: string) => void
  laserFormSessions: string
  setLaserFormSessions: (v: string) => void
  laserFormNotes: string
  setLaserFormNotes: (v: string) => void
  laserFormPatientId: string
  setLaserFormPatientId: (v: string) => void
  laserFormPatientSearch: string
  setLaserFormPatientSearch: (v: string) => void
  laserFormPrice: string
  setLaserFormPrice: (v: string) => void
  laserFormPaid: boolean
  setLaserFormPaid: (v: boolean) => void
  laserFormMachine: string
  setLaserFormMachine: (v: string) => void
  laserFormEnergy: string
  setLaserFormEnergy: (v: string) => void
  laserFormPulse: string
  setLaserFormPulse: (v: string) => void
  laserFormDoctorId: string
  setLaserFormDoctorId: (v: string) => void

  // Editing laser session
  editingLaserSessionId: string | null
  setEditingLaserSessionId: (v: string | null) => void
  editLaserSessionForm: { energy: string; pulse: string; painLevel: string; reaction: string; notes: string; date: string; price: string; paid: boolean }
  setEditLaserSessionForm: (v: { energy: string; pulse: string; painLevel: string; reaction: string; notes: string; date: string; price: string; paid: boolean }) => void

  // New laser session form
  newLaserSessionForm: { energy: string; pulse: string; painLevel: string; reaction: string; notes: string; date: string; price: string; paid: boolean }
  setNewLaserSessionForm: (v: { energy: string; pulse: string; painLevel: string; reaction: string; notes: string; date: string; price: string; paid: boolean }) => void

  // Editing laser record
  editingLaserRecordId: string | null
  setEditingLaserRecordId: (v: string | null) => void
  editLaserRecordForm: { bodyArea: string; skinType: string; hairColor: string; hairDensity: string; totalSessions: string; price: string; totalPrice: string; paid: boolean; machineName: string; energy: string; pulse: string; status: string; notes: string }
  setEditLaserRecordForm: (v: { bodyArea: string; skinType: string; hairColor: string; hairDensity: string; totalSessions: string; price: string; totalPrice: string; paid: boolean; machineName: string; energy: string; pulse: string; status: string; notes: string }) => void

  // Laser finance (from patient profile)
  laserFinancePatientId: string
  setLaserFinancePatientId: (v: string) => void
  laserFinancePrice: string
  setLaserFinancePrice: (v: string) => void
  laserFinanceNotes: string
  setLaserFinanceNotes: (v: string) => void

  // Treatment templates
  treatmentTemplates: any[]
  setTreatmentTemplates: (v: any[]) => void

  // Reset laser form
  resetLaserForm: () => void
}

const defaultEditLaserSessionForm = { energy: '', pulse: '', painLevel: '', reaction: '', notes: '', date: '', price: '', paid: false }
const defaultNewLaserSessionForm = { energy: '', pulse: '', painLevel: '', reaction: '', notes: '', date: '', price: '', paid: false }
const defaultEditLaserRecordForm = { bodyArea: '', skinType: '', hairColor: '', hairDensity: '', totalSessions: '', price: '', totalPrice: '', paid: false, machineName: '', energy: '', pulse: '', status: '', notes: '' }

export const useLaserFormStore = create<LaserFormState>()((set) => ({
  // Laser record form
  laserFormArea: '',
  setLaserFormArea: (v) => set({ laserFormArea: v }),
  laserFormSkinType: '',
  setLaserFormSkinType: (v) => set({ laserFormSkinType: v }),
  laserFormHairColor: '',
  setLaserFormHairColor: (v) => set({ laserFormHairColor: v }),
  laserFormHairDensity: '',
  setLaserFormHairDensity: (v) => set({ laserFormHairDensity: v }),
  laserFormSessions: '6',
  setLaserFormSessions: (v) => set({ laserFormSessions: v }),
  laserFormNotes: '',
  setLaserFormNotes: (v) => set({ laserFormNotes: v }),
  laserFormPatientId: '',
  setLaserFormPatientId: (v) => set({ laserFormPatientId: v }),
  laserFormPatientSearch: '',
  setLaserFormPatientSearch: (v) => set({ laserFormPatientSearch: v }),
  laserFormPrice: '',
  setLaserFormPrice: (v) => set({ laserFormPrice: v }),
  laserFormPaid: false,
  setLaserFormPaid: (v) => set({ laserFormPaid: v }),
  laserFormMachine: '',
  setLaserFormMachine: (v) => set({ laserFormMachine: v }),
  laserFormEnergy: '',
  setLaserFormEnergy: (v) => set({ laserFormEnergy: v }),
  laserFormPulse: '',
  setLaserFormPulse: (v) => set({ laserFormPulse: v }),
  laserFormDoctorId: '',
  setLaserFormDoctorId: (v) => set({ laserFormDoctorId: v }),

  // Editing laser session
  editingLaserSessionId: null,
  setEditingLaserSessionId: (v) => set({ editingLaserSessionId: v }),
  editLaserSessionForm: { ...defaultEditLaserSessionForm },
  setEditLaserSessionForm: (v) => set({ editLaserSessionForm: v }),

  // New laser session form
  newLaserSessionForm: { ...defaultNewLaserSessionForm },
  setNewLaserSessionForm: (v) => set({ newLaserSessionForm: v }),

  // Editing laser record
  editingLaserRecordId: null,
  setEditingLaserRecordId: (v) => set({ editingLaserRecordId: v }),
  editLaserRecordForm: { ...defaultEditLaserRecordForm },
  setEditLaserRecordForm: (v) => set({ editLaserRecordForm: v }),

  // Laser finance
  laserFinancePatientId: '',
  setLaserFinancePatientId: (v) => set({ laserFinancePatientId: v }),
  laserFinancePrice: '',
  setLaserFinancePrice: (v) => set({ laserFinancePrice: v }),
  laserFinanceNotes: '',
  setLaserFinanceNotes: (v) => set({ laserFinanceNotes: v }),

  // Treatment templates
  treatmentTemplates: [
    { id: '1', name: 'علاج حب الشباب', description: 'بروتوكول علاجي كامل لحب الشباب', sessions: 6, estimatedPrice: 1500, category: 'جلدية' },
    { id: '2', name: 'تبييض البشرة', description: 'جلسات تبييض وتوحيد لون البشرة', sessions: 4, estimatedPrice: 2000, category: 'تجميل' },
    { id: '3', name: 'إزالة شعر كامل', description: 'إزالة شعر بالليزر - جسم كامل', sessions: 8, estimatedPrice: 4000, category: 'ليزر' },
    { id: '4', name: 'علاج التصبغات', description: 'علاج بقع وتصبغات البشرة', sessions: 5, estimatedPrice: 1800, category: 'جلدية' },
    { id: '5', name: 'تجديد البشرة', description: 'جلسات تجديد وتنضيج البشرة', sessions: 4, estimatedPrice: 2500, category: 'تجميل' },
  ],
  setTreatmentTemplates: (v) => set({ treatmentTemplates: v }),

  // Reset laser form
  resetLaserForm: () => set({
    laserFormArea: '',
    laserFormSkinType: '',
    laserFormHairColor: '',
    laserFormHairDensity: '',
    laserFormSessions: '6',
    laserFormNotes: '',
    laserFormPatientId: '',
    laserFormPatientSearch: '',
    laserFormPrice: '',
    laserFormPaid: false,
    laserFormMachine: '',
    laserFormEnergy: '',
    laserFormPulse: '',
    laserFormDoctorId: '',
  }),
}))

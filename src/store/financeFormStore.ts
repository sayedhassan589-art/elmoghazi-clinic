import { create } from 'zustand'

// ─── Finance Form Store ──────────────────────────────────────────────────────
// Contains: transaction form, service form, service editing, doctor form

interface FinanceFormState {
  // Transaction form
  txnFormType: 'income' | 'expense'
  setTxnFormType: (v: 'income' | 'expense') => void
  txnFormCategory: string
  setTxnFormCategory: (v: string) => void
  txnFormAmount: string
  setTxnFormAmount: (v: string) => void
  txnFormDescription: string
  setTxnFormDescription: (v: string) => void
  txnFormDate: string
  setTxnFormDate: (v: string) => void

  // Service form
  serviceFormName: string
  setServiceFormName: (v: string) => void
  serviceFormCategory: string
  setServiceFormCategory: (v: string) => void
  serviceFormPrice: string
  setServiceFormPrice: (v: string) => void
  serviceFormDuration: string
  setServiceFormDuration: (v: string) => void

  // Service editing
  editingServiceId: string | null
  setEditingServiceId: (v: string | null) => void
  editingServicePrice: string
  setEditingServicePrice: (v: string) => void
  editingServiceName: string
  setEditingServiceName: (v: string) => void

  // Doctor form
  editingDoctorId: string | null
  setEditingDoctorId: (v: string | null) => void
  doctorForm: { name: string; phone: string; specialty: string; checkupPercentage: string; revisitPercentage: string; laserPercentage: string; sessionPercentage: string; fixedAmount: string; notes: string }
  setDoctorForm: (v: { name: string; phone: string; specialty: string; checkupPercentage: string; revisitPercentage: string; laserPercentage: string; sessionPercentage: string; fixedAmount: string; notes: string }) => void

  // Reminder form
  reminderType: string
  setReminderType: (v: string) => void
  reminderDate: string
  setReminderDate: (v: string) => void
  reminderTime: string
  setReminderTime: (v: string) => void
  reminderPatientId: string
  setReminderPatientId: (v: string) => void

  // Reset transaction form
  resetTxnForm: () => void
  // Reset service form
  resetServiceForm: () => void
  // Reset doctor form
  resetDoctorForm: () => void
}

const defaultDoctorForm = { name: '', phone: '', specialty: '', checkupPercentage: '', revisitPercentage: '', laserPercentage: '', sessionPercentage: '', fixedAmount: '', notes: '' }

export const useFinanceFormStore = create<FinanceFormState>()((set) => ({
  // Transaction form
  txnFormType: 'income',
  setTxnFormType: (v) => set({ txnFormType: v }),
  txnFormCategory: 'كشف',
  setTxnFormCategory: (v) => set({ txnFormCategory: v }),
  txnFormAmount: '',
  setTxnFormAmount: (v) => set({ txnFormAmount: v }),
  txnFormDescription: '',
  setTxnFormDescription: (v) => set({ txnFormDescription: v }),
  txnFormDate: '',
  setTxnFormDate: (v) => set({ txnFormDate: v }),

  // Service form
  serviceFormName: '',
  setServiceFormName: (v) => set({ serviceFormName: v }),
  serviceFormCategory: 'عام',
  setServiceFormCategory: (v) => set({ serviceFormCategory: v }),
  serviceFormPrice: '',
  setServiceFormPrice: (v) => set({ serviceFormPrice: v }),
  serviceFormDuration: '',
  setServiceFormDuration: (v) => set({ serviceFormDuration: v }),

  // Service editing
  editingServiceId: null,
  setEditingServiceId: (v) => set({ editingServiceId: v }),
  editingServicePrice: '',
  setEditingServicePrice: (v) => set({ editingServicePrice: v }),
  editingServiceName: '',
  setEditingServiceName: (v) => set({ editingServiceName: v }),

  // Doctor form
  editingDoctorId: null,
  setEditingDoctorId: (v) => set({ editingDoctorId: v }),
  doctorForm: { ...defaultDoctorForm },
  setDoctorForm: (v) => set({ doctorForm: v }),

  // Reminder form
  reminderType: 'general',
  setReminderType: (v) => set({ reminderType: v }),
  reminderDate: '',
  setReminderDate: (v) => set({ reminderDate: v }),
  reminderTime: '',
  setReminderTime: (v) => set({ reminderTime: v }),
  reminderPatientId: '',
  setReminderPatientId: (v) => set({ reminderPatientId: v }),

  // Reset transaction form
  resetTxnForm: () => set({
    txnFormType: 'income',
    txnFormCategory: 'كشف',
    txnFormAmount: '',
    txnFormDescription: '',
    txnFormDate: '',
  }),
  // Reset service form
  resetServiceForm: () => set({
    serviceFormName: '',
    serviceFormCategory: 'عام',
    serviceFormPrice: '',
    serviceFormDuration: '',
  }),
  // Reset doctor form
  resetDoctorForm: () => set({
    doctorForm: { ...defaultDoctorForm },
    editingDoctorId: null,
  }),
}))

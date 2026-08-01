import { create } from 'zustand'
import { applyUpdater, type Updater } from '@/lib/updater'

// ─── Appointment Form Store ────────────────────────────────────────────────
// Contains: waiting queue form, booking form, booking editing

interface AppointmentFormState {
  // Waiting queue form
  waitingFormName: string
  setWaitingFormName: (v: string) => void
  waitingFormPriority: 'normal' | 'urgent'
  setWaitingFormPriority: (v: 'normal' | 'urgent') => void
  waitingFormPatientId: string | undefined
  setWaitingFormPatientId: (v: string | undefined) => void
  waitingFormNotes: string
  setWaitingFormNotes: (v: string) => void

  // Booking form
  bookingFormPatientSearch: string
  setBookingFormPatientSearch: (v: string) => void
  bookingFormPatientId: string
  setBookingFormPatientId: (v: string) => void
  bookingFormDate: string
  setBookingFormDate: (v: string) => void
  bookingFormTime: string
  setBookingFormTime: (v: string) => void
  bookingFormType: string
  setBookingFormType: (v: string) => void
  bookingFormStatus: string
  setBookingFormStatus: (v: string) => void
  bookingFormNotes: string
  setBookingFormNotes: (v: string) => void

  // Booking editing
  editingBookingId: string | null
  setEditingBookingId: (v: string | null) => void

  // Stock transaction form
  stockTransactionItemId: string
  setStockTransactionItemId: (v: string) => void
  stockTransactionType: 'in' | 'out'
  setStockTransactionType: (v: 'in' | 'out') => void
  stockTransactionQty: string
  setStockTransactionQty: (v: string) => void
  stockTransactionNotes: string
  setStockTransactionNotes: (v: string) => void

  // Inventory editing
  editingInventoryId: string | null
  setEditingInventoryId: (v: string | null) => void
  editInventoryForm: { name: string; category: string; quantity: string; minQuantity: string; unitPrice: string; notes: string }
  setEditInventoryForm: (v: Updater<{ name: string; category: string; quantity: string; minQuantity: string; unitPrice: string; notes: string }>) => void

  // Reset forms
  resetWaitingForm: () => void
  resetBookingForm: () => void
}

const defaultEditInventoryForm = { name: '', category: '', quantity: '', minQuantity: '', unitPrice: '', notes: '' }

export const useAppointmentFormStore = create<AppointmentFormState>()((set, get) => ({
  // Waiting queue form
  waitingFormName: '',
  setWaitingFormName: (v) => set({ waitingFormName: v }),
  waitingFormPriority: 'normal',
  setWaitingFormPriority: (v) => set({ waitingFormPriority: v }),
  waitingFormPatientId: undefined,
  setWaitingFormPatientId: (v) => set({ waitingFormPatientId: v }),
  waitingFormNotes: '',
  setWaitingFormNotes: (v) => set({ waitingFormNotes: v }),

  // Booking form
  bookingFormPatientSearch: '',
  setBookingFormPatientSearch: (v) => set({ bookingFormPatientSearch: v }),
  bookingFormPatientId: '',
  setBookingFormPatientId: (v) => set({ bookingFormPatientId: v }),
  bookingFormDate: '',
  setBookingFormDate: (v) => set({ bookingFormDate: v }),
  bookingFormTime: '',
  setBookingFormTime: (v) => set({ bookingFormTime: v }),
  bookingFormType: 'checkup',
  setBookingFormType: (v) => set({ bookingFormType: v }),
  bookingFormStatus: 'scheduled',
  setBookingFormStatus: (v) => set({ bookingFormStatus: v }),
  bookingFormNotes: '',
  setBookingFormNotes: (v) => set({ bookingFormNotes: v }),

  // Booking editing
  editingBookingId: null,
  setEditingBookingId: (v) => set({ editingBookingId: v }),

  // Stock transaction form
  stockTransactionItemId: '',
  setStockTransactionItemId: (v) => set({ stockTransactionItemId: v }),
  stockTransactionType: 'in',
  setStockTransactionType: (v) => set({ stockTransactionType: v }),
  stockTransactionQty: '',
  setStockTransactionQty: (v) => set({ stockTransactionQty: v }),
  stockTransactionNotes: '',
  setStockTransactionNotes: (v) => set({ stockTransactionNotes: v }),

  // Inventory editing
  editingInventoryId: null,
  setEditingInventoryId: (v) => set({ editingInventoryId: v }),
  editInventoryForm: { ...defaultEditInventoryForm },
  setEditInventoryForm: (v) => set({ editInventoryForm: applyUpdater(v, get().editInventoryForm) }),

  // Reset forms
  resetWaitingForm: () => set({
    waitingFormName: '',
    waitingFormPriority: 'normal',
    waitingFormPatientId: undefined,
    waitingFormNotes: '',
  }),
  resetBookingForm: () => set({
    bookingFormPatientSearch: '',
    bookingFormPatientId: '',
    bookingFormDate: '',
    bookingFormTime: '',
    bookingFormType: 'checkup',
    bookingFormStatus: 'scheduled',
    bookingFormNotes: '',
  }),
}))

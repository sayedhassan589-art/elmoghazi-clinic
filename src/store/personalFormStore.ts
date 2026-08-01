import { create } from 'zustand'
import { applyUpdater, type Updater } from '@/lib/updater'

// ─── Personal Form Store ──────────────────────────────────────────────────
// Contains: personal transactions, reminders, notes forms and editing states

interface PersonalFormState {
  // Personal transaction form
  personalTxnForm: { type: 'income' | 'expense'; category: string; amount: string; description: string; date: string }
  setPersonalTxnForm: (v: Updater<{ type: 'income' | 'expense'; category: string; amount: string; description: string; date: string }>) => void
  editingPersonalTxnId: string | null
  setEditingPersonalTxnId: (v: string | null) => void

  // Personal reminder form
  personalReminderForm: { title: string; description: string; date: string; type: string }
  setPersonalReminderForm: (v: Updater<{ title: string; description: string; date: string; type: string }>) => void
  editingPersonalReminderId: string | null
  setEditingPersonalReminderId: (v: string | null) => void

  // Personal note form
  personalNoteForm: { content: string; important: boolean }
  setPersonalNoteForm: (v: Updater<{ content: string; important: boolean }>) => void
  editingPersonalNoteId: string | null
  setEditingPersonalNoteId: (v: string | null) => void
  editingPersonalNoteContent: string
  setEditingPersonalNoteContent: (v: string) => void

  // Reset forms
  resetPersonalTxnForm: () => void
  resetPersonalReminderForm: () => void
  resetPersonalNoteForm: () => void
}

export const usePersonalFormStore = create<PersonalFormState>()((set, get) => ({
  // Personal transaction form
  personalTxnForm: { type: 'income', category: '', amount: '', description: '', date: '' },
  setPersonalTxnForm: (v) => set({ personalTxnForm: applyUpdater(v, get().personalTxnForm) }),
  editingPersonalTxnId: null,
  setEditingPersonalTxnId: (v) => set({ editingPersonalTxnId: v }),

  // Personal reminder form
  personalReminderForm: { title: '', description: '', date: '', type: 'شخصي' },
  setPersonalReminderForm: (v) => set({ personalReminderForm: applyUpdater(v, get().personalReminderForm) }),
  editingPersonalReminderId: null,
  setEditingPersonalReminderId: (v) => set({ editingPersonalReminderId: v }),

  // Personal note form
  personalNoteForm: { content: '', important: false },
  setPersonalNoteForm: (v) => set({ personalNoteForm: applyUpdater(v, get().personalNoteForm) }),
  editingPersonalNoteId: null,
  setEditingPersonalNoteId: (v) => set({ editingPersonalNoteId: v }),
  editingPersonalNoteContent: '',
  setEditingPersonalNoteContent: (v) => set({ editingPersonalNoteContent: v }),

  // Reset forms
  resetPersonalTxnForm: () => set({ personalTxnForm: { type: 'income', category: '', amount: '', description: '', date: '' } }),
  resetPersonalReminderForm: () => set({ personalReminderForm: { title: '', description: '', date: '', type: 'شخصي' } }),
  resetPersonalNoteForm: () => set({ personalNoteForm: { content: '', important: false } }),
}))

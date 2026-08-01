import { create } from 'zustand'
import { applyUpdater, type Updater } from '@/lib/updater'

// ─── Patient Form Store ──────────────────────────────────────────────────
// Contains: new patient form, edit patient form, patient profile forms,
// editing states for notes/visits/sessions, photo states, import states

interface PatientFormState {
  // New patient form
  newPatientName: string
  setNewPatientName: (v: string) => void
  newPatientPhone: string
  setNewPatientPhone: (v: string) => void
  newPatientPhone2: string
  setNewPatientPhone2: (v: string) => void
  newPatientAddress: string
  setNewPatientAddress: (v: string) => void
  newPatientAge: string
  setNewPatientAge: (v: string) => void
  newPatientDiagnosis: string
  setNewPatientDiagnosis: (v: string) => void
  newPatientNotes: string
  setNewPatientNotes: (v: string) => void
  newPatientDate: string
  setNewPatientDate: (v: string) => void

  // Visit/Service quick selection
  selectedVisitType: string
  setSelectedVisitType: (v: string) => void
  selectedServiceIds: string[]
  setSelectedServiceIds: (v: Updater<string[]>) => void
  customServicePrice: string
  setCustomServicePrice: (v: string) => void
  visitPrice: string
  setVisitPrice: (v: string) => void
  quickNote: string
  setQuickNote: (v: string) => void

  // Edit patient form
  editPatientForm: { name: string; phone: string; phone2: string; age: string; gender: string; address: string; bloodType: string; medicalHistory: string; notes: string }
  setEditPatientForm: (v: Updater<{ name: string; phone: string; phone2: string; age: string; gender: string; address: string; bloodType: string; medicalHistory: string; notes: string }>) => void

  // Editing note in patient profile
  editingNoteId: string | null
  setEditingNoteId: (v: string | null) => void
  editingNoteContent: string
  setEditingNoteContent: (v: string) => void

  // Patient photos
  photoType: string
  setPhotoType: (v: string) => void
  photoDescription: string
  setPhotoDescription: (v: string) => void

  // Add session in patient profile
  profileSessionServiceId: string
  setProfileSessionServiceId: (v: string) => void
  profileSessionPrice: string
  setProfileSessionPrice: (v: string) => void
  profileSessionNotes: string
  setProfileSessionNotes: (v: string) => void
  profileSessionDate: string
  setProfileSessionDate: (v: string) => void

  // Add visit in patient profile
  profileVisitType: string
  setProfileVisitType: (v: string) => void
  profileVisitPrice: string
  setProfileVisitPrice: (v: string) => void
  profileVisitNotes: string
  setProfileVisitNotes: (v: string) => void
  profileVisitDate: string
  setProfileVisitDate: (v: string) => void

  // Editing visit
  editingVisitId: string | null
  setEditingVisitId: (v: string | null) => void
  editVisitForm: { type: string; notes: string; price: string }
  setEditVisitForm: (v: Updater<{ type: string; notes: string; price: string }>) => void

  // Editing session
  editingSessionId: string | null
  setEditingSessionId: (v: string | null) => void
  editSessionForm: { price: string; notes: string; status: string; paid: boolean }
  setEditSessionForm: (v: Updater<{ price: string; notes: string; status: string; paid: boolean }>) => void

  // Editing note in more tab
  editingNoteIdMore: string | null
  setEditingNoteIdMore: (v: string | null) => void
  editingNoteContentMore: string
  setEditingNoteContentMore: (v: string) => void
  editingNoteSectionMore: string
  setEditingNoteSectionMore: (v: string) => void

  // Add note form (more tab)
  newNoteContent: string
  setNewNoteContent: (v: string) => void
  newNoteSection: string
  setNewNoteSection: (v: string) => void
  newNoteImportant: boolean
  setNewNoteImportant: (v: boolean) => void

  // Improvement slider
  improvementSliderValue: number
  setImprovementSliderValue: (v: number) => void
  improvementNote: string
  setImprovementNote: (v: string) => void

  // Patient import
  patientImportData: any[]
  setPatientImportData: (v: any[]) => void
  patientImportPreview: boolean
  setPatientImportPreview: (v: boolean) => void
  patientImportFile: File | null
  setPatientImportFile: (v: File | null) => void
  patientImportLoading: boolean
  setPatientImportLoading: (v: boolean) => void
  patientImportProgress: string
  setPatientImportProgress: (v: string) => void
  patientImportDragOver: boolean
  setPatientImportDragOver: (v: boolean) => void

  // Reset new patient form
  resetNewPatientForm: () => void
}

const defaultEditPatientForm = { name: '', phone: '', phone2: '', age: '', gender: '', address: '', bloodType: '', medicalHistory: '', notes: '' }
const defaultEditVisitForm = { type: '', notes: '', price: '' }
const defaultEditSessionForm = { price: '', notes: '', status: '', paid: false }

export const usePatientFormStore = create<PatientFormState>()((set, get) => ({
  // New patient form
  newPatientName: '',
  setNewPatientName: (v) => set({ newPatientName: v }),
  newPatientPhone: '',
  setNewPatientPhone: (v) => set({ newPatientPhone: v }),
  newPatientPhone2: '',
  setNewPatientPhone2: (v) => set({ newPatientPhone2: v }),
  newPatientAddress: '',
  setNewPatientAddress: (v) => set({ newPatientAddress: v }),
  newPatientAge: '',
  setNewPatientAge: (v) => set({ newPatientAge: v }),
  newPatientDiagnosis: '',
  setNewPatientDiagnosis: (v) => set({ newPatientDiagnosis: v }),
  newPatientNotes: '',
  setNewPatientNotes: (v) => set({ newPatientNotes: v }),
  newPatientDate: '',
  setNewPatientDate: (v) => set({ newPatientDate: v }),

  // Visit/Service quick selection
  selectedVisitType: '',
  setSelectedVisitType: (v) => set({ selectedVisitType: v }),
  selectedServiceIds: [],
  setSelectedServiceIds: (v) => set({ selectedServiceIds: applyUpdater(v, get().selectedServiceIds) }),
  customServicePrice: '',
  setCustomServicePrice: (v) => set({ customServicePrice: v }),
  visitPrice: '',
  setVisitPrice: (v) => set({ visitPrice: v }),
  quickNote: '',
  setQuickNote: (v) => set({ quickNote: v }),

  // Edit patient form
  editPatientForm: { ...defaultEditPatientForm },
  setEditPatientForm: (v) => set({ editPatientForm: applyUpdater(v, get().editPatientForm) }),

  // Editing note in patient profile
  editingNoteId: null,
  setEditingNoteId: (v) => set({ editingNoteId: v }),
  editingNoteContent: '',
  setEditingNoteContent: (v) => set({ editingNoteContent: v }),

  // Patient photos
  photoType: 'general',
  setPhotoType: (v) => set({ photoType: v }),
  photoDescription: '',
  setPhotoDescription: (v) => set({ photoDescription: v }),

  // Add session in patient profile
  profileSessionServiceId: '',
  setProfileSessionServiceId: (v) => set({ profileSessionServiceId: v }),
  profileSessionPrice: '',
  setProfileSessionPrice: (v) => set({ profileSessionPrice: v }),
  profileSessionNotes: '',
  setProfileSessionNotes: (v) => set({ profileSessionNotes: v }),
  profileSessionDate: '',
  setProfileSessionDate: (v) => set({ profileSessionDate: v }),

  // Add visit in patient profile
  profileVisitType: 'checkup',
  setProfileVisitType: (v) => set({ profileVisitType: v }),
  profileVisitPrice: '',
  setProfileVisitPrice: (v) => set({ profileVisitPrice: v }),
  profileVisitNotes: '',
  setProfileVisitNotes: (v) => set({ profileVisitNotes: v }),
  profileVisitDate: '',
  setProfileVisitDate: (v) => set({ profileVisitDate: v }),

  // Editing visit
  editingVisitId: null,
  setEditingVisitId: (v) => set({ editingVisitId: v }),
  editVisitForm: { ...defaultEditVisitForm },
  setEditVisitForm: (v) => set({ editVisitForm: applyUpdater(v, get().editVisitForm) }),

  // Editing session
  editingSessionId: null,
  setEditingSessionId: (v) => set({ editingSessionId: v }),
  editSessionForm: { ...defaultEditSessionForm },
  setEditSessionForm: (v) => set({ editSessionForm: applyUpdater(v, get().editSessionForm) }),

  // Editing note in more tab
  editingNoteIdMore: null,
  setEditingNoteIdMore: (v) => set({ editingNoteIdMore: v }),
  editingNoteContentMore: '',
  setEditingNoteContentMore: (v) => set({ editingNoteContentMore: v }),
  editingNoteSectionMore: 'general',
  setEditingNoteSectionMore: (v) => set({ editingNoteSectionMore: v }),

  // Add note form (more tab)
  newNoteContent: '',
  setNewNoteContent: (v) => set({ newNoteContent: v }),
  newNoteSection: 'general',
  setNewNoteSection: (v) => set({ newNoteSection: v }),
  newNoteImportant: false,
  setNewNoteImportant: (v) => set({ newNoteImportant: v }),

  // Improvement slider
  improvementSliderValue: 5,
  setImprovementSliderValue: (v) => set({ improvementSliderValue: v }),
  improvementNote: '',
  setImprovementNote: (v) => set({ improvementNote: v }),

  // Patient import
  patientImportData: [],
  setPatientImportData: (v) => set({ patientImportData: v }),
  patientImportPreview: false,
  setPatientImportPreview: (v) => set({ patientImportPreview: v }),
  patientImportFile: null,
  setPatientImportFile: (v) => set({ patientImportFile: v }),
  patientImportLoading: false,
  setPatientImportLoading: (v) => set({ patientImportLoading: v }),
  patientImportProgress: '',
  setPatientImportProgress: (v) => set({ patientImportProgress: v }),
  patientImportDragOver: false,
  setPatientImportDragOver: (v) => set({ patientImportDragOver: v }),

  // Reset new patient form
  resetNewPatientForm: () => set({
    newPatientName: '',
    newPatientPhone: '',
    newPatientPhone2: '',
    newPatientAddress: '',
    newPatientAge: '',
    newPatientDiagnosis: '',
    newPatientNotes: '',
    newPatientDate: '',
    selectedVisitType: '',
    selectedServiceIds: [],
    customServicePrice: '',
    visitPrice: '',
    quickNote: '',
  }),
}))

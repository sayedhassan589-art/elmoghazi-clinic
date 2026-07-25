import { create } from 'zustand'

// ─── Follow-up Form Store ────────────────────────────────────────────────
// Contains: follow-up record form, follow-up visit form, editing states

interface FollowUpFormState {
  // Follow-up record form
  fuFormPatientSearch: string
  setFuFormPatientSearch: (v: string) => void
  fuFormPatientId: string
  setFuFormPatientId: (v: string) => void
  fuFormCondition: string
  setFuFormCondition: (v: string) => void
  fuFormCategory: string
  setFuFormCategory: (v: string) => void
  fuFormSeverity: string
  setFuFormSeverity: (v: string) => void
  fuFormFrequency: string
  setFuFormFrequency: (v: string) => void
  fuFormCustomDays: string
  setFuFormCustomDays: (v: string) => void
  fuFormNextVisit: string
  setFuFormNextVisit: (v: string) => void
  fuFormDiagnosis: string
  setFuFormDiagnosis: (v: string) => void
  fuFormTreatmentPlan: string
  setFuFormTreatmentPlan: (v: string) => void
  fuFormMedications: string
  setFuFormMedications: (v: string) => void
  fuFormNotes: string
  setFuFormNotes: (v: string) => void

  // Follow-up subscription form
  fuFormHasSubscription: boolean
  setFuFormHasSubscription: (v: boolean) => void
  fuFormSubType: string
  setFuFormSubType: (v: string) => void
  fuFormSubPrice: string
  setFuFormSubPrice: (v: string) => void
  fuFormSubStart: string
  setFuFormSubStart: (v: string) => void
  fuFormSubEnd: string
  setFuFormSubEnd: (v: string) => void
  fuFormSubSessions: string
  setFuFormSubSessions: (v: string) => void

  // Follow-up visit form
  fuVisitForm: { findings: string; vitals: string; diagnosis: string; treatmentNotes: string; medications: string; instructions: string; paid: boolean; price: string; nextVisitDate: string; notes: string; type: string; date: string }
  setFuVisitForm: (v: { findings: string; vitals: string; diagnosis: string; treatmentNotes: string; medications: string; instructions: string; paid: boolean; price: string; nextVisitDate: string; notes: string; type: string; date: string }) => void

  // Editing follow-up
  editingFollowUpId: string | null
  setEditingFollowUpId: (v: string | null) => void

  // Reset forms
  resetFollowUpForm: () => void
  resetFuVisitForm: () => void
}

const defaultFuVisitForm = { findings: '', vitals: '', diagnosis: '', treatmentNotes: '', medications: '', instructions: '', paid: false, price: '', nextVisitDate: '', notes: '', type: 'followup', date: '' }

export const useFollowUpFormStore = create<FollowUpFormState>()((set) => ({
  // Follow-up record form
  fuFormPatientSearch: '',
  setFuFormPatientSearch: (v) => set({ fuFormPatientSearch: v }),
  fuFormPatientId: '',
  setFuFormPatientId: (v) => set({ fuFormPatientId: v }),
  fuFormCondition: '',
  setFuFormCondition: (v) => set({ fuFormCondition: v }),
  fuFormCategory: 'جلدية',
  setFuFormCategory: (v) => set({ fuFormCategory: v }),
  fuFormSeverity: 'moderate',
  setFuFormSeverity: (v) => set({ fuFormSeverity: v }),
  fuFormFrequency: 'monthly',
  setFuFormFrequency: (v) => set({ fuFormFrequency: v }),
  fuFormCustomDays: '',
  setFuFormCustomDays: (v) => set({ fuFormCustomDays: v }),
  fuFormNextVisit: '',
  setFuFormNextVisit: (v) => set({ fuFormNextVisit: v }),
  fuFormDiagnosis: '',
  setFuFormDiagnosis: (v) => set({ fuFormDiagnosis: v }),
  fuFormTreatmentPlan: '',
  setFuFormTreatmentPlan: (v) => set({ fuFormTreatmentPlan: v }),
  fuFormMedications: '',
  setFuFormMedications: (v) => set({ fuFormMedications: v }),
  fuFormNotes: '',
  setFuFormNotes: (v) => set({ fuFormNotes: v }),

  // Follow-up subscription form
  fuFormHasSubscription: false,
  setFuFormHasSubscription: (v) => set({ fuFormHasSubscription: v }),
  fuFormSubType: 'monthly',
  setFuFormSubType: (v) => set({ fuFormSubType: v }),
  fuFormSubPrice: '',
  setFuFormSubPrice: (v) => set({ fuFormSubPrice: v }),
  fuFormSubStart: '',
  setFuFormSubStart: (v) => set({ fuFormSubStart: v }),
  fuFormSubEnd: '',
  setFuFormSubEnd: (v) => set({ fuFormSubEnd: v }),
  fuFormSubSessions: '',
  setFuFormSubSessions: (v) => set({ fuFormSubSessions: v }),

  // Follow-up visit form
  fuVisitForm: { ...defaultFuVisitForm },
  setFuVisitForm: (v) => set({ fuVisitForm: v }),

  // Editing follow-up
  editingFollowUpId: null,
  setEditingFollowUpId: (v) => set({ editingFollowUpId: v }),

  // Reset forms
  resetFollowUpForm: () => set({
    fuFormPatientSearch: '',
    fuFormPatientId: '',
    fuFormCondition: '',
    fuFormCategory: 'جلدية',
    fuFormSeverity: 'moderate',
    fuFormFrequency: 'monthly',
    fuFormCustomDays: '',
    fuFormNextVisit: '',
    fuFormDiagnosis: '',
    fuFormTreatmentPlan: '',
    fuFormMedications: '',
    fuFormNotes: '',
    fuFormHasSubscription: false,
    fuFormSubType: 'monthly',
    fuFormSubPrice: '',
    fuFormSubStart: '',
    fuFormSubEnd: '',
    fuFormSubSessions: '',
  }),
  resetFuVisitForm: () => set({
    fuVisitForm: { ...defaultFuVisitForm },
  }),
}))

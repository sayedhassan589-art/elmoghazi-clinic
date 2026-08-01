import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Patient } from '@/lib/data-store'

// ─── UI Store ──────────────────────────────────────────────────────────────
// Contains: dark mode, search, tabs, dialog visibility, confirm dialogs,
// selected items, celebrations, password dialog, slider, login flow, filters

interface UIState {
  // Dark mode
  darkMode: boolean
  setDarkMode: (v: boolean) => void

  // Smart search
  smartSearchOpen: boolean
  setSmartSearchOpen: (v: boolean) => void
  smartSearchQuery: string
  setSmartSearchQuery: (v: string) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  searchField: 'all' | 'name' | 'address' | 'diagnosis' | 'phone' | 'notes'
  setSearchField: (v: 'all' | 'name' | 'address' | 'diagnosis' | 'phone' | 'notes') => void
  patientDisplayCount: number
  setPatientDisplayCount: (v: number) => void

  // Selected patient
  selectedPatient: Patient | null
  setSelectedPatient: (v: Patient | null) => void

  // Sub-tabs
  moreSubTab: string
  setMoreSubTab: (v: string) => void
  laserSubTab: string
  setLaserSubTab: (v: string) => void
  personalSubTab: 'finance' | 'reminders' | 'notes' | 'reports'
  setPersonalSubTab: (v: 'finance' | 'reminders' | 'notes' | 'reports') => void
  patientDetailTab: string
  setPatientDetailTab: (v: string) => void
  laserDetailTab: 'overview' | 'sessions' | 'payments' | 'notes'
  setLaserDetailTab: (v: 'overview' | 'sessions' | 'payments' | 'notes') => void
  followUpDetailTab: 'overview' | 'visits' | 'subscription'
  setFollowUpDetailTab: (v: 'overview' | 'visits' | 'subscription') => void

  // Dialog visibility - Patient
  showAddPatient: boolean
  setShowAddPatient: (v: boolean) => void
  editingPatient: boolean
  setEditingPatient: (v: boolean) => void
  deletePatientConfirmOpen: boolean
  setDeletePatientConfirmOpen: (v: boolean) => void
  showImprovementSlider: boolean
  setShowImprovementSlider: (v: boolean) => void
  showPatientImport: boolean
  setShowPatientImport: (v: boolean) => void

  // Dialog visibility - Session/Visit in profile
  showAddSessionProfile: boolean
  setShowAddSessionProfile: (v: boolean) => void
  showAddVisitProfile: boolean
  setShowAddVisitProfile: (v: boolean) => void

  // Dialog visibility - Service
  showAddService: boolean
  setShowAddService: (v: boolean) => void

  // Dialog visibility - Transaction
  showAddTransaction: boolean
  setShowAddTransaction: (v: boolean) => void
  expandedFinanceDay: string | null
  setExpandedFinanceDay: (v: string | null) => void

  // Dialog visibility - Appointment
  showAddAppointment: boolean
  setShowAddAppointment: (v: boolean) => void

  // Dialog visibility - Laser
  showAddLaserRecord: boolean
  setShowAddLaserRecord: (v: boolean) => void
  showAddLaserPackage: boolean
  setShowAddLaserPackage: (v: boolean) => void
  showAddLaserSessionForm: boolean
  setShowAddLaserSessionForm: (v: boolean) => void
  selectedLaserRecordId: string | null
  setSelectedLaserRecordId: (v: string | null) => void

  // Dialog visibility - Medical
  showAddMedication: boolean
  setShowAddMedication: (v: boolean) => void
  showAddReminder: boolean
  setShowAddReminder: (v: boolean) => void
  showAddDoctor: boolean
  setShowAddDoctor: (v: boolean) => void

  // Dialog visibility - Inventory
  showAddInventory: boolean
  setShowAddInventory: (v: boolean) => void
  editingInventoryId: string | null
  setEditingInventoryId: (v: string | null) => void
  editInventoryForm: { name: string; category: string; quantity: string; minQuantity: string; unitPrice: string; notes: string }
  setEditInventoryForm: (v: { name: string; category: string; quantity: string; minQuantity: string; unitPrice: string; notes: string }) => void
  showStockTransaction: boolean
  setShowStockTransaction: (v: boolean) => void
  stockTransactionItemId: string | null
  setStockTransactionItemId: (v: string | null) => void
  stockTransactionType: 'in' | 'out'
  setStockTransactionType: (v: 'in' | 'out') => void
  stockTransactionQty: string
  setStockTransactionQty: (v: string) => void
  stockTransactionNotes: string
  setStockTransactionNotes: (v: string) => void

  // Dialog visibility - Booking/Waiting
  showAddWaiting: boolean
  setShowAddWaiting: (v: boolean) => void
  showAddBooking: boolean
  setShowAddBooking: (v: boolean) => void
  editingBookingId: string | null
  setEditingBookingId: (v: string | null) => void
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

  // Dialog visibility - Follow-up
  showAddFollowUp: boolean
  setShowAddFollowUp: (v: boolean) => void
  showAddFollowUpVisit: boolean
  setShowAddFollowUpVisit: (v: boolean) => void

  // Dialog visibility - Notes
  showAddNote: boolean
  setShowAddNote: (v: boolean) => void

  // Dialog visibility - Personal
  showAddPersonalTxn: boolean
  setShowAddPersonalTxn: (v: boolean) => void
  showAddPersonalReminder: boolean
  setShowAddPersonalReminder: (v: boolean) => void
  showAddPersonalNote: boolean
  setShowAddPersonalNote: (v: boolean) => void

  // Dialog visibility - Broadcast
  showBroadcast: boolean
  setShowBroadcast: (v: boolean) => void

  // Dialog visibility - Template
  showApplyTemplate: boolean
  setShowApplyTemplate: (v: boolean) => void

  // Confirm dialogs
  deleteVisitConfirmId: string | null
  setDeleteVisitConfirmId: (v: string | null) => void
  deleteLaserRecordConfirmId: string | null
  setDeleteLaserRecordConfirmId: (v: string | null) => void
  deleteLaserSessionConfirmId: string | null
  setDeleteLaserSessionConfirmId: (v: string | null) => void
  deleteInventoryConfirmId: string | null
  setDeleteInventoryConfirmId: (v: string | null) => void
  deleteFollowUpConfirmId: string | null
  setDeleteFollowUpConfirmId: (v: string | null) => void
  restoreConfirmOpen: boolean
  setRestoreConfirmOpen: (v: boolean) => void
  pendingRestoreData: any
  setPendingRestoreData: (v: any) => void

  // Celebrations
  celebratingId: string | null
  setCelebratingId: (v: string | null) => void
  celebratingImprovement: boolean
  setCelebratingImprovement: (v: boolean) => void
  celebratingPersonalId: string | null
  setCelebratingPersonalId: (v: string | null) => void

  // Password dialog
  passwordDialogOpen: boolean
  setPasswordDialogOpen: (v: boolean) => void
  passwordTarget: string
  setPasswordTarget: (v: string) => void
  passwordInput: string
  setPasswordInput: (v: string) => void
  pendingTab: string
  setPendingTab: (v: string) => void

  // Before/After Slider
  sliderPos: number
  setSliderPos: (v: number) => void
  isDragging: boolean
  setIsDragging: (v: boolean) => void

  // Login flow
  loginRole: 'doctor' | 'secretary' | null
  setLoginRole: (v: 'doctor' | 'secretary' | null) => void
  loginPassword: string
  setLoginPassword: (v: string) => void
  loginLoading: boolean
  setLoginLoading: (v: boolean) => void
  seeded: boolean
  setSeeded: (v: boolean) => void

  // Patient filters
  patientFilter: 'all' | 'starred' | 'improved' | 'publishable' | 'dangerous'
  setPatientFilter: (v: 'all' | 'starred' | 'improved' | 'publishable' | 'dangerous') => void
  patientCopySearch: string
  setPatientCopySearch: (v: string) => void

  // Import preview
  importPreviewData: { name: string; phone: string }[]
  setImportPreviewData: (v: { name: string; phone: string }[]) => void
  importSelectedIndices: number[]
  setImportSelectedIndices: (v: number[]) => void

  // Note filters (dashboard)
  noteSearch: string
  setNoteSearch: (v: string) => void
  noteFilter: 'all' | 'important' | 'dashboard' | 'patients' | 'laser' | 'finance' | 'general'
  setNoteFilter: (v: 'all' | 'important' | 'dashboard' | 'patients' | 'laser' | 'finance' | 'general') => void

  // Notes filters (more tab)
  notesSearch: string
  setNotesSearch: (v: string) => void
  notesFilterSection: string
  setNotesFilterSection: (v: string) => void
  notesFilterImportant: boolean
  setNotesFilterImportant: (v: boolean) => void

  // Visit filters
  visitFilterType: string
  setVisitFilterType: (v: string) => void

  // Inventory filters
  inventorySearch: string
  setInventorySearch: (v: string) => void
  inventoryFilter: 'all' | 'low' | 'normal'
  setInventoryFilter: (v: 'all' | 'low' | 'normal') => void
  inventoryCategoryFilter: string
  setInventoryCategoryFilter: (v: string) => void

  // Booking filters
  bookingFilterStatus: string
  setBookingFilterStatus: (v: string) => void
  bookingFilterDate: 'all' | 'today' | 'week' | 'month'
  setBookingFilterDate: (v: 'all' | 'today' | 'week' | 'month') => void

  // Follow-up filters
  followUpSearch: string
  setFollowUpSearch: (v: string) => void
  followUpFilter: 'all' | 'active' | 'paused' | 'completed' | 'discharged'
  setFollowUpFilter: (v: 'all' | 'active' | 'paused' | 'completed' | 'discharged') => void
  selectedFollowUpId: string | null
  setSelectedFollowUpId: (v: string | null) => void

  // Personal filters
  personalSearchQuery: string
  setPersonalSearchQuery: (v: string) => void
  personalReportPeriod: 'daily' | 'weekly' | 'monthly'
  setPersonalReportPeriod: (v: 'daily' | 'weekly' | 'monthly') => void
  personalTxnFilter: 'all' | 'income' | 'expense'
  setPersonalTxnFilter: (v: 'all' | 'income' | 'expense') => void
  personalTxnCategoryFilter: string
  setPersonalTxnCategoryFilter: (v: string) => void
  personalDateFrom: string
  setPersonalDateFrom: (v: string) => void
  personalDateTo: string
  setPersonalDateTo: (v: string) => void
  reportPeriod: 'all' | 'weekly' | 'monthly'
  setReportPeriod: (v: 'all' | 'weekly' | 'monthly') => void

  // Template states
  selectedTemplate: any
  setSelectedTemplate: (v: any) => void
  templatePatientId: string
  setTemplatePatientId: (v: string) => void

  // Broadcast states
  broadcastMessage: string
  setBroadcastMessage: (v: string) => void
  broadcastFilter: 'all' | 'starred' | 'dangerous' | 'today' | 'recent7' | 'recent30'
  setBroadcastFilter: (v: 'all' | 'starred' | 'dangerous' | 'today' | 'recent7' | 'recent30') => void
  broadcastSending: boolean
  setBroadcastSending: (v: boolean) => void
  broadcastProgress: { sent: number; total: number }
  setBroadcastProgress: (v: { sent: number; total: number }) => void
  broadcastSelectedIds: string[]
  setBroadcastSelectedIds: (v: string[]) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Dark mode
      darkMode: false,
      setDarkMode: (v) => set({ darkMode: v }),

      // Smart search
      smartSearchOpen: false,
      setSmartSearchOpen: (v) => set({ smartSearchOpen: v }),
      smartSearchQuery: '',
      setSmartSearchQuery: (v) => set({ smartSearchQuery: v }),
      searchQuery: '',
      setSearchQuery: (v) => set({ searchQuery: v }),
      searchField: 'all' as 'all' | 'name' | 'address' | 'diagnosis' | 'phone' | 'notes',
      setSearchField: (v) => set({ searchField: v }),
      patientDisplayCount: 50,
      setPatientDisplayCount: (v) => set({ patientDisplayCount: v }),

      // Selected patient
      selectedPatient: null,
      setSelectedPatient: (v) => set({ selectedPatient: v }),

      // Sub-tabs
      moreSubTab: 'services',
      setMoreSubTab: (v) => set({ moreSubTab: v }),
      laserSubTab: 'records',
      setLaserSubTab: (v) => set({ laserSubTab: v }),
      personalSubTab: 'finance' as 'finance' | 'reminders' | 'notes' | 'reports',
      setPersonalSubTab: (v) => set({ personalSubTab: v }),
      patientDetailTab: 'overview',
      setPatientDetailTab: (v) => set({ patientDetailTab: v }),
      laserDetailTab: 'overview' as 'overview' | 'sessions' | 'payments' | 'notes',
      setLaserDetailTab: (v) => set({ laserDetailTab: v }),
      followUpDetailTab: 'overview' as 'overview' | 'visits' | 'subscription',
      setFollowUpDetailTab: (v) => set({ followUpDetailTab: v }),

      // Dialog visibility - Patient
      showAddPatient: false,
      setShowAddPatient: (v) => set({ showAddPatient: v }),
      editingPatient: false,
      setEditingPatient: (v) => set({ editingPatient: v }),
      deletePatientConfirmOpen: false,
      setDeletePatientConfirmOpen: (v) => set({ deletePatientConfirmOpen: v }),
      showImprovementSlider: false,
      setShowImprovementSlider: (v) => set({ showImprovementSlider: v }),
      showPatientImport: false,
      setShowPatientImport: (v) => set({ showPatientImport: v }),

      // Dialog visibility - Session/Visit in profile
      showAddSessionProfile: false,
      setShowAddSessionProfile: (v) => set({ showAddSessionProfile: v }),
      showAddVisitProfile: false,
      setShowAddVisitProfile: (v) => set({ showAddVisitProfile: v }),

      // Dialog visibility - Service
      showAddService: false,
      setShowAddService: (v) => set({ showAddService: v }),

      // Dialog visibility - Transaction
      showAddTransaction: false,
      setShowAddTransaction: (v) => set({ showAddTransaction: v }),
      expandedFinanceDay: null,
      setExpandedFinanceDay: (v) => set({ expandedFinanceDay: v }),

      // Dialog visibility - Appointment
      showAddAppointment: false,
      setShowAddAppointment: (v) => set({ showAddAppointment: v }),

      // Dialog visibility - Laser
      showAddLaserRecord: false,
      setShowAddLaserRecord: (v) => set({ showAddLaserRecord: v }),
      showAddLaserPackage: false,
      setShowAddLaserPackage: (v) => set({ showAddLaserPackage: v }),
      showAddLaserSessionForm: false,
      setShowAddLaserSessionForm: (v) => set({ showAddLaserSessionForm: v }),
      selectedLaserRecordId: null,
      setSelectedLaserRecordId: (v) => set({ selectedLaserRecordId: v }),

      // Dialog visibility - Medical
      showAddMedication: false,
      setShowAddMedication: (v) => set({ showAddMedication: v }),
      showAddReminder: false,
      setShowAddReminder: (v) => set({ showAddReminder: v }),
      showAddDoctor: false,
      setShowAddDoctor: (v) => set({ showAddDoctor: v }),

      // Dialog visibility - Inventory
      showAddInventory: false,
      setShowAddInventory: (v) => set({ showAddInventory: v }),
      editingInventoryId: null,
      setEditingInventoryId: (v) => set({ editingInventoryId: v }),
      editInventoryForm: { name: '', category: '', quantity: '', minQuantity: '', unitPrice: '', notes: '' },
      setEditInventoryForm: (v) => set({ editInventoryForm: v }),
      showStockTransaction: false,
      setShowStockTransaction: (v) => set({ showStockTransaction: v }),
      stockTransactionItemId: null,
      setStockTransactionItemId: (v) => set({ stockTransactionItemId: v }),
      stockTransactionType: 'in',
      setStockTransactionType: (v) => set({ stockTransactionType: v }),
      stockTransactionQty: '',
      setStockTransactionQty: (v) => set({ stockTransactionQty: v }),
      stockTransactionNotes: '',
      setStockTransactionNotes: (v) => set({ stockTransactionNotes: v }),

      // Dialog visibility - Booking/Waiting
      showAddWaiting: false,
      setShowAddWaiting: (v) => set({ showAddWaiting: v }),
      showAddBooking: false,
      setShowAddBooking: (v) => set({ showAddBooking: v }),
      editingBookingId: null,
      setEditingBookingId: (v) => set({ editingBookingId: v }),
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

      // Dialog visibility - Follow-up
      showAddFollowUp: false,
      setShowAddFollowUp: (v) => set({ showAddFollowUp: v }),
      showAddFollowUpVisit: false,
      setShowAddFollowUpVisit: (v) => set({ showAddFollowUpVisit: v }),

      // Dialog visibility - Notes
      showAddNote: false,
      setShowAddNote: (v) => set({ showAddNote: v }),

      // Dialog visibility - Personal
      showAddPersonalTxn: false,
      setShowAddPersonalTxn: (v) => set({ showAddPersonalTxn: v }),
      showAddPersonalReminder: false,
      setShowAddPersonalReminder: (v) => set({ showAddPersonalReminder: v }),
      showAddPersonalNote: false,
      setShowAddPersonalNote: (v) => set({ showAddPersonalNote: v }),

      // Dialog visibility - Broadcast
      showBroadcast: false,
      setShowBroadcast: (v) => set({ showBroadcast: v }),

      // Dialog visibility - Template
      showApplyTemplate: false,
      setShowApplyTemplate: (v) => set({ showApplyTemplate: v }),

      // Confirm dialogs
      deleteVisitConfirmId: null,
      setDeleteVisitConfirmId: (v) => set({ deleteVisitConfirmId: v }),
      deleteLaserRecordConfirmId: null,
      setDeleteLaserRecordConfirmId: (v) => set({ deleteLaserRecordConfirmId: v }),
      deleteLaserSessionConfirmId: null,
      setDeleteLaserSessionConfirmId: (v) => set({ deleteLaserSessionConfirmId: v }),
      deleteInventoryConfirmId: null,
      setDeleteInventoryConfirmId: (v) => set({ deleteInventoryConfirmId: v }),
      deleteFollowUpConfirmId: null,
      setDeleteFollowUpConfirmId: (v) => set({ deleteFollowUpConfirmId: v }),
      restoreConfirmOpen: false,
      setRestoreConfirmOpen: (v) => set({ restoreConfirmOpen: v }),
      pendingRestoreData: null,
      setPendingRestoreData: (v) => set({ pendingRestoreData: v }),

      // Celebrations
      celebratingId: null,
      setCelebratingId: (v) => set({ celebratingId: v }),
      celebratingImprovement: false,
      setCelebratingImprovement: (v) => set({ celebratingImprovement: v }),
      celebratingPersonalId: null,
      setCelebratingPersonalId: (v) => set({ celebratingPersonalId: v }),

      // Password dialog
      passwordDialogOpen: false,
      setPasswordDialogOpen: (v) => set({ passwordDialogOpen: v }),
      passwordTarget: '',
      setPasswordTarget: (v) => set({ passwordTarget: v }),
      passwordInput: '',
      setPasswordInput: (v) => set({ passwordInput: v }),
      pendingTab: '',
      setPendingTab: (v) => set({ pendingTab: v }),

      // Before/After Slider
      sliderPos: 50,
      setSliderPos: (v) => set({ sliderPos: v }),
      isDragging: false,
      setIsDragging: (v) => set({ isDragging: v }),

      // Login flow
      loginRole: null as 'doctor' | 'secretary' | null,
      setLoginRole: (v) => set({ loginRole: v }),
      loginPassword: '',
      setLoginPassword: (v) => set({ loginPassword: v }),
      loginLoading: false,
      setLoginLoading: (v) => set({ loginLoading: v }),
      seeded: false,
      setSeeded: (v) => set({ seeded: v }),

      // Patient filters
      patientFilter: 'all' as 'all' | 'starred' | 'improved' | 'publishable' | 'dangerous',
      setPatientFilter: (v) => set({ patientFilter: v }),
      patientCopySearch: '',
      setPatientCopySearch: (v) => set({ patientCopySearch: v }),
      importPreviewData: [],
      setImportPreviewData: (v) => set({ importPreviewData: v }),
      importSelectedIndices: [],
      setImportSelectedIndices: (v) => set({ importSelectedIndices: v }),

      // Note filters (dashboard)
      noteSearch: '',
      setNoteSearch: (v) => set({ noteSearch: v }),
      noteFilter: 'all' as 'all' | 'important' | 'dashboard' | 'patients' | 'laser' | 'finance' | 'general',
      setNoteFilter: (v) => set({ noteFilter: v }),

      // Notes filters (more tab)
      notesSearch: '',
      setNotesSearch: (v) => set({ notesSearch: v }),
      notesFilterSection: 'all',
      setNotesFilterSection: (v) => set({ notesFilterSection: v }),
      notesFilterImportant: false,
      setNotesFilterImportant: (v) => set({ notesFilterImportant: v }),

      // Visit filters
      visitFilterType: 'all',
      setVisitFilterType: (v) => set({ visitFilterType: v }),

      // Inventory filters
      inventorySearch: '',
      setInventorySearch: (v) => set({ inventorySearch: v }),
      inventoryFilter: 'all' as 'all' | 'low' | 'normal',
      setInventoryFilter: (v) => set({ inventoryFilter: v }),
      inventoryCategoryFilter: 'all',
      setInventoryCategoryFilter: (v) => set({ inventoryCategoryFilter: v }),

      // Booking filters
      bookingFilterStatus: 'all',
      setBookingFilterStatus: (v) => set({ bookingFilterStatus: v }),
      bookingFilterDate: 'all' as 'all' | 'today' | 'week' | 'month',
      setBookingFilterDate: (v) => set({ bookingFilterDate: v }),

      // Follow-up filters
      followUpSearch: '',
      setFollowUpSearch: (v) => set({ followUpSearch: v }),
      followUpFilter: 'all' as 'all' | 'active' | 'paused' | 'completed' | 'discharged',
      setFollowUpFilter: (v) => set({ followUpFilter: v }),
      selectedFollowUpId: null,
      setSelectedFollowUpId: (v) => set({ selectedFollowUpId: v }),

      // Personal filters
      personalSearchQuery: '',
      setPersonalSearchQuery: (v) => set({ personalSearchQuery: v }),
      personalReportPeriod: 'daily' as 'daily' | 'weekly' | 'monthly',
      setPersonalReportPeriod: (v) => set({ personalReportPeriod: v }),
      personalTxnFilter: 'all' as 'all' | 'income' | 'expense',
      setPersonalTxnFilter: (v) => set({ personalTxnFilter: v }),
      personalTxnCategoryFilter: 'all',
      setPersonalTxnCategoryFilter: (v) => set({ personalTxnCategoryFilter: v }),
      personalDateFrom: '',
      setPersonalDateFrom: (v) => set({ personalDateFrom: v }),
      personalDateTo: '',
      setPersonalDateTo: (v) => set({ personalDateTo: v }),
      reportPeriod: 'all' as 'all' | 'weekly' | 'monthly',
      setReportPeriod: (v) => set({ reportPeriod: v }),

      // Template states
      selectedTemplate: null,
      setSelectedTemplate: (v) => set({ selectedTemplate: v }),
      templatePatientId: '',
      setTemplatePatientId: (v) => set({ templatePatientId: v }),

      // Broadcast states
      broadcastMessage: '',
      setBroadcastMessage: (v) => set({ broadcastMessage: v }),
      broadcastFilter: 'all' as 'all' | 'starred' | 'dangerous' | 'today' | 'recent7' | 'recent30',
      setBroadcastFilter: (v) => set({ broadcastFilter: v }),
      broadcastSending: false,
      setBroadcastSending: (v) => set({ broadcastSending: v }),
      broadcastProgress: { sent: 0, total: 0 },
      setBroadcastProgress: (v) => set({ broadcastProgress: v }),
      broadcastSelectedIds: [],
      setBroadcastSelectedIds: (v) => set({ broadcastSelectedIds: v }),
    }),
    {
      name: 'elmoghazi-ui',
      version: 2,
      // Only persist darkMode and login state, not temporary dialog states
      partialize: (state) => ({
        darkMode: state.darkMode,
        seeded: state.seeded,
      }),
      migrate: (persisted: any, version: number) => {
        if (version < 2) return { darkMode: false, seeded: false }
        return persisted
      },
    }
  )
)

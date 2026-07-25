import { create } from 'zustand'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Patient { id: string; fileNumber: string; name: string; phone?: string; phone2?: string; age?: number; gender?: string; address?: string; notes?: string; allergies?: string; medicalHistory?: string; starred?: boolean; improved?: boolean; publishable?: boolean; dangerous?: boolean; colorTag?: string; bloodType?: string; improvementScore?: number; improvementHistory?: string; createdAt: string; }
interface Visit { id: string; patientId: string; doctorId?: string; type: string; diagnosis?: string; notes?: string; date: string; }
interface Session { id: string; patientId: string; serviceId?: string; doctorId?: string; status: string; notes?: string; date: string; price: number; paid: boolean; }
interface Service { id: string; name: string; category?: string; price: number; duration?: number; active: boolean; }
interface Note { id: string; patientId?: string; userId?: string; content: string; important: boolean; section?: string; createdAt: string; }
interface Alert { id: string; patientId: string; type: string; message: string; active: boolean; }
interface Reminder { id: string; patientId?: string; title: string; description?: string; date: string; type: string; status: string; }
interface LaserRecord { id: string; patientId: string; bodyArea: string; skinType?: string; hairColor?: string; hairDensity?: string; totalSessions: number; price: number; totalPrice: number; paid: boolean; machineName?: string; energy?: number; pulse?: string; status: string; notes?: string; createdAt?: string; laserSessions?: LaserSession[]; patient?: { id: string; name: string; fileNumber: string; phone?: string; age?: number; gender?: string; }; _count?: { laserSessions: number; }; }
interface LaserSession { id: string; laserRecordId: string; sessionNumber: number; energy?: number; pulse?: string; painLevel?: number; reaction?: string; notes?: string; price: number; paid: boolean; date: string; createdAt?: string; }
interface LaserPackage { id: string; name: string; sessionsCount: number; price: number; bodyArea?: string; active: boolean; }
interface LaserSetting { id: string; machineName: string; bodyArea: string; defaultEnergy?: number; defaultPulse?: string; }
interface Transaction { id: string; type: string; category: string; amount: number; description?: string; date: string; }
interface Appointment { id: string; patientId?: string; date: string; duration: number; type: string; status: string; notes?: string; }
interface WaitingItem { id: string; patientId?: string; patientName?: string; priority: number; status: string; notes?: string; createdAt: string; patient?: { id: string; name: string; fileNumber?: string; phone?: string; } }
interface InventoryItem { id: string; name: string; category?: string; quantity: number; minQuantity: number; unitPrice: number; notes?: string; }
interface Medication { id: string; name: string; category?: string; description?: string; dosage?: string; instructions?: string; active: boolean; }
interface Prescription { id: string; patientId: string; doctorId?: string; diagnosis?: string; notes?: string; date: string; }
interface Notification { id: string; userId?: string; title: string; message: string; type: string; read: boolean; createdAt: string; }
interface Backup { id: string; type: string; size?: number; status: string; createdAt: string; }
interface PatientPhoto { id: string; patientId: string; type: string; description?: string; imageData: string; createdAt: string; }
interface PartnerDoctor { id: string; name: string; phone?: string; specialty?: string; checkupPercentage: number; revisitPercentage: number; laserPercentage: number; sessionPercentage: number; fixedAmount: number; active: boolean; notes?: string; createdAt: string; }
interface FollowUpRecord { id: string; patientId: string; condition: string; conditionCategory?: string; severity: string; status: string; frequency: string; customDays?: number; nextVisitDate?: string; lastVisitDate?: string; hasSubscription: boolean; subscriptionType?: string; subscriptionPrice: number; subscriptionStart?: string; subscriptionEnd?: string; sessionsIncluded: number; sessionsUsed: number; diagnosis?: string; treatmentPlan?: string; medications?: string; notes?: string; reminderEnabled: boolean; reminderDaysBefore: number; createdAt: string; patient?: Patient; followUpVisits?: FollowUpVisit[]; }
interface FollowUpVisit { id: string; followUpId: string; visitNumber: number; visitDate: string; type: string; findings?: string; vitals?: string; diagnosis?: string; treatmentNotes?: string; medications?: string; instructions?: string; paid: boolean; price: number; nextVisitDate?: string; status: string; notes?: string; createdAt: string; followUp?: FollowUpRecord & { patient?: Patient }; }

// ─── Re-export types for consumers ─────────────────────────────────────────

export type {
  Patient, Visit, Session, Service, Note, Alert, Reminder,
  LaserRecord, LaserSession, LaserPackage, LaserSetting,
  Transaction, Appointment, WaitingItem, InventoryItem,
  Medication, Prescription, Notification, Backup, PatientPhoto,
  PartnerDoctor, FollowUpRecord, FollowUpVisit,
}

// ─── API Helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    try {
      const errData = JSON.parse(text)
      throw new Error(errData.error || errData.details || JSON.stringify(errData) || `Error ${res.status}`)
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message && !parseErr.message.includes('JSON')) throw parseErr
      throw new Error(text || `Error ${res.status}`)
    }
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Data extraction helper ─────────────────────────────────────────────────

const extractData = (r: PromiseSettledResult<any>): any[] => {
  if (r.status !== 'fulfilled') return []
  const v = r.value
  return v?.data || v?.patients || v?.visits || v?.sessions || v?.services || v?.notes || v?.alerts || v?.reminders || v?.records || v?.packages || v?.settings || v?.transactions || v?.appointments || v?.queue || v?.items || v?.medications || v?.prescriptions || v?.backups || v?.notifications || v?.doctors || (Array.isArray(v) ? v : [])
}

// ─── Store Interface ────────────────────────────────────────────────────────

interface DataState {
  // Data arrays
  patients: Patient[]
  visits: Visit[]
  sessions: Session[]
  services: Service[]
  notes: Note[]
  alerts: Alert[]
  reminders: Reminder[]
  laserRecords: LaserRecord[]
  laserPackages: LaserPackage[]
  laserSettings: LaserSetting[]
  transactions: Transaction[]
  appointments: Appointment[]
  waitingQueue: WaitingItem[]
  inventoryItems: InventoryItem[]
  medications: Medication[]
  prescriptions: Prescription[]
  backups: Backup[]
  notifications: Notification[]
  doctors: PartnerDoctor[]
  followUpRecords: FollowUpRecord[]
  loading: boolean

  // Derived data
  personalTransactions: Transaction[]
  personalReminders: Reminder[]
  personalNotes: Note[]

  // Patient photos (loaded per-patient on demand)
  patientPhotos: PatientPhoto[]

  // Setters (exact names matching page.tsx useState setters)
  setPatients: (patients: Patient[]) => void
  setVisits: (visits: Visit[]) => void
  setSessions: (sessions: Session[]) => void
  setServices: (services: Service[]) => void
  setNotes: (notes: Note[]) => void
  setAlerts: (alerts: Alert[]) => void
  setReminders: (reminders: Reminder[]) => void
  setLaserRecords: (laserRecords: LaserRecord[]) => void
  setLaserPackages: (laserPackages: LaserPackage[]) => void
  setLaserSettings: (laserSettings: LaserSetting[]) => void
  setTransactions: (transactions: Transaction[]) => void
  setAppointments: (appointments: Appointment[]) => void
  setWaitingQueue: (waitingQueue: WaitingItem[]) => void
  setInventoryItems: (inventoryItems: InventoryItem[]) => void
  setMedications: (medications: Medication[]) => void
  setPrescriptions: (prescriptions: Prescription[]) => void
  setBackups: (backups: Backup[]) => void
  setNotifications: (notifications: Notification[]) => void
  setDoctors: (doctors: PartnerDoctor[]) => void
  setFollowUpRecords: (followUpRecords: FollowUpRecord[]) => void
  setLoading: (loading: boolean) => void

  setPersonalTransactions: (transactions: Transaction[]) => void
  setPersonalReminders: (reminders: Reminder[]) => void
  setPersonalNotes: (notes: Note[]) => void

  setPatientPhotos: (photos: PatientPhoto[]) => void

  // Actions
  loadAllData: () => Promise<void>
  refreshPatientPhotos: (patientId: string) => Promise<void>
}

// ─── Data Store ─────────────────────────────────────────────────────────────

export const useDataStore = create<DataState>()((set) => ({
  // Data arrays (initial empty state)
  patients: [],
  visits: [],
  sessions: [],
  services: [],
  notes: [],
  alerts: [],
  reminders: [],
  laserRecords: [],
  laserPackages: [],
  laserSettings: [],
  transactions: [],
  appointments: [],
  waitingQueue: [],
  inventoryItems: [],
  medications: [],
  prescriptions: [],
  backups: [],
  notifications: [],
  doctors: [],
  followUpRecords: [],
  loading: true,

  // Derived data
  personalTransactions: [],
  personalReminders: [],
  personalNotes: [],

  // Patient photos
  patientPhotos: [],

  // Setters
  setPatients: (patients) => set({ patients }),
  setVisits: (visits) => set({ visits }),
  setSessions: (sessions) => set({ sessions }),
  setServices: (services) => set({ services }),
  setNotes: (notes) => set({ notes }),
  setAlerts: (alerts) => set({ alerts }),
  setReminders: (reminders) => set({ reminders }),
  setLaserRecords: (laserRecords) => set({ laserRecords }),
  setLaserPackages: (laserPackages) => set({ laserPackages }),
  setLaserSettings: (laserSettings) => set({ laserSettings }),
  setTransactions: (transactions) => set({ transactions }),
  setAppointments: (appointments) => set({ appointments }),
  setWaitingQueue: (waitingQueue) => set({ waitingQueue }),
  setInventoryItems: (inventoryItems) => set({ inventoryItems }),
  setMedications: (medications) => set({ medications }),
  setPrescriptions: (prescriptions) => set({ prescriptions }),
  setBackups: (backups) => set({ backups }),
  setNotifications: (notifications) => set({ notifications }),
  setDoctors: (doctors) => set({ doctors }),
  setFollowUpRecords: (followUpRecords) => set({ followUpRecords }),
  setLoading: (loading) => set({ loading }),

  setPersonalTransactions: (personalTransactions) => set({ personalTransactions }),
  setPersonalReminders: (personalReminders) => set({ personalReminders }),
  setPersonalNotes: (personalNotes) => set({ personalNotes }),

  setPatientPhotos: (patientPhotos) => set({ patientPhotos }),

  // Load all data from API (same logic as page.tsx loadAllData)
  loadAllData: async () => {
    set({ loading: true })
    try {
      const results = await Promise.allSettled([
        apiFetch('/patients?limit=5000'), apiFetch('/visits?limit=10000'), apiFetch('/sessions?limit=10000'),
        apiFetch('/services?limit=500'), apiFetch('/notes?limit=5000'), apiFetch('/alerts?limit=1000'),
        apiFetch('/reminders?limit=1000'), apiFetch('/laser/records?limit=5000'), apiFetch('/laser/packages?limit=500'),
        apiFetch('/laser/settings?limit=500'), apiFetch('/finance/transactions?limit=10000'), apiFetch('/appointments?limit=5000'),
        apiFetch('/waiting?limit=500'), apiFetch('/inventory/items?limit=1000'), apiFetch('/medications?limit=1000'),
        apiFetch('/prescriptions?limit=5000'), apiFetch('/backups?limit=100'), apiFetch('/notifications?limit=1000'),
        apiFetch('/doctors?limit=100'),
        apiFetch('/follow-up/records?limit=5000'),
      ])
      const allPatients = extractData(results[0])
      const allVisits = extractData(results[1])
      const allSessions = extractData(results[2])
      const allServices = extractData(results[3])
      const allNotes = extractData(results[4])
      const allAlerts = extractData(results[5])
      const allReminders = extractData(results[6])
      const allLaserRecords = extractData(results[7])
      const allLaserPackages = extractData(results[8])
      const allLaserSettings = extractData(results[9])
      const allTransactions = extractData(results[10])
      const allAppointments = extractData(results[11])
      const allWaitingQueue = extractData(results[12])
      const allInventoryItems = extractData(results[13])
      const allMedications = extractData(results[14])
      const allPrescriptions = extractData(results[15])
      const allBackups = extractData(results[16])
      const allNotifications = extractData(results[17])
      const allDoctors = extractData(results[18])
      const allFollowUpRecords = extractData(results[19])

      // Derive personal data from main datasets (no duplicate API calls)
      const personalTxns = allTransactions.filter((t: any) => t.category === 'personal')
      const personalNotes = allNotes.filter((n: any) => n.section === 'personal')
      const personalReminders = allReminders.filter((r: any) => r.type === 'شخصي' || r.type === 'personal')

      set({
        patients: allPatients,
        visits: allVisits,
        sessions: allSessions,
        services: allServices,
        notes: allNotes,
        alerts: allAlerts,
        reminders: allReminders,
        laserRecords: allLaserRecords,
        laserPackages: allLaserPackages,
        laserSettings: allLaserSettings,
        transactions: allTransactions,
        appointments: allAppointments,
        waitingQueue: allWaitingQueue,
        inventoryItems: allInventoryItems,
        medications: allMedications,
        prescriptions: allPrescriptions,
        backups: allBackups,
        notifications: allNotifications,
        doctors: allDoctors,
        followUpRecords: allFollowUpRecords,
        personalTransactions: personalTxns,
        personalReminders: personalReminders,
        personalNotes: personalNotes,
      })
    } catch (e) {
      console.error(e)
    }
    set({ loading: false })
  },

  // Refresh patient photos for a specific patient
  refreshPatientPhotos: async (patientId: string) => {
    try {
      const res: any = await apiFetch(`/photos?patientId=${patientId}`)
      const photos = res?.data || res?.photos || (Array.isArray(res) ? res : [])
      set({ patientPhotos: photos })
    } catch {
      set({ patientPhotos: [] })
    }
  },
}))

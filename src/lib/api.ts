// ─── Elmoghazi Clinic – Comprehensive API Helpers ────────────────────────────
// All typed fetch functions for every entity in the clinic management system.

// ─── Base Types ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ─── Entity Types ────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'ASSISTANT'
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: string
  fileNumber: string
  name: string
  phone: string
  phone2?: string
  email?: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth?: string
  age?: number
  nationalId?: string
  address?: string
  medicalHistory?: string
  allergies?: string
  chronicConditions?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Visit {
  id: string
  patientId: string
  doctorId: string
  date: string
  chiefComplaint: string
  diagnosis?: string
  treatmentPlan?: string
  notes?: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  followUpDate?: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  visitId: string
  patientId: string
  serviceId: string
  doctorId: string
  date: string
  notes?: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  nameEn?: string
  category: string
  price: number
  duration?: number
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  patientId: string
  createdBy: string
  content: string
  type: 'GENERAL' | 'MEDICAL' | 'FOLLOW_UP' | 'ALERT'
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface Alert {
  id: string
  patientId: string
  type: 'ALLERGY' | 'CHRONIC' | 'MEDICATION' | 'CUSTOM'
  title: string
  description?: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  patientId: string
  type: 'FOLLOW_UP' | 'MEDICATION' | 'APPOINTMENT' | 'CUSTOM'
  title: string
  description?: string
  dueDate: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface LaserRecord {
  id: string
  patientId: string
  bodyArea: string
  hairType?: string
  skinType?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface LaserSession {
  id: string
  laserRecordId: string
  patientId: string
  settingId?: string
  packageId?: string
  sessionNumber: number
  date: string
  fluence?: number
  pulseWidth?: number
  spotSize?: number
  notes?: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  createdAt: string
  updatedAt: string
}

export interface LaserPackage {
  id: string
  name: string
  bodyArea: string
  totalSessions: number
  price: number
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LaserSetting {
  id: string
  name: string
  machineType: string
  fluence: number
  pulseWidth: number
  spotSize: number
  skinType: string
  hairType?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  patientId: string
  visitId?: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  description?: string
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'INSURANCE'
  date: string
  createdAt: string
  updatedAt: string
}

export interface FinanceSummary {
  totalIncome: number
  totalExpense: number
  netProfit: number
  pendingPayments: number
  monthlyBreakdown: { month: string; income: number; expense: number }[]
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  serviceId?: string
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface QueueItem {
  id: string
  patientId: string
  appointmentId?: string
  doctorId: string
  queueNumber: number
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  estimatedWait?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  name: string
  nameEn?: string
  category: string
  unit: string
  quantity: number
  minQuantity: number
  costPrice: number
  sellingPrice?: number
  supplier?: string
  expiryDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ItemTransaction {
  id: string
  itemId: string
  type: 'IN' | 'OUT'
  quantity: number
  reason?: string
  performedBy: string
  date: string
  createdAt: string
}

export interface TreatmentPlan {
  id: string
  patientId: string
  visitId?: string
  title: string
  description?: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface TreatmentPhase {
  id: string
  planId: string
  title: string
  description?: string
  order: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  duration?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: string
  patientId: string
  visitId?: string
  url: string
  type: 'BEFORE' | 'AFTER' | 'DURING' | 'MEDICAL' | 'GENERAL'
  description?: string
  takenAt: string
  createdAt: string
}

export interface Prescription {
  id: string
  patientId: string
  visitId?: string
  doctorId: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Medication {
  id: string
  prescriptionId: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ALERT' | 'REMINDER'
  isRead: boolean
  link?: string
  createdAt: string
}

export interface BackupRecord {
  id: string
  filename: string
  size: number
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  userId: string
  action: string
  entity: string
  entityId?: string
  details?: string
  ipAddress?: string
  createdAt: string
}

export interface DailyReport {
  date: string
  totalVisits: number
  totalIncome: number
  totalExpense: number
  newPatients: number
  completedAppointments: number
  cancelledAppointments: number
}

export interface WeeklyReport {
  weekStart: string
  weekEnd: string
  totalVisits: number
  totalIncome: number
  totalExpense: number
  newPatients: number
  dailyBreakdown: DailyReport[]
}

export interface MonthlyReport {
  month: string
  totalVisits: number
  totalIncome: number
  totalExpense: number
  newPatients: number
  weeklyBreakdown: WeeklyReport[]
  topServices: { serviceId: string; serviceName: string; count: number; revenue: number }[]
}

// ─── Base Fetch Helper ───────────────────────────────────────────────────────

async function fetchAPI<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${path}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `API Error ${response.status}: ${response.statusText} – ${errorBody}`
    )
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    fetchAPI<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () =>
    fetchAPI<ApiResponse<User>>('/auth/me'),
}

// ─── Patients ────────────────────────────────────────────────────────────────

export const patientsApi = {
  getPatients: (params?: PaginationParams & { gender?: string }) =>
    fetchAPI<PaginatedResponse<Patient>>(
      `/patients?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  getPatient: (id: string) =>
    fetchAPI<ApiResponse<Patient>>(`/patients/${id}`),

  createPatient: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Patient>>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePatient: (id: string, data: Partial<Patient>) =>
    fetchAPI<ApiResponse<Patient>>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePatient: (id: string) =>
    fetchAPI<void>(`/patients/${id}`, { method: 'DELETE' }),
}

// ─── Visits ──────────────────────────────────────────────────────────────────

export const visitsApi = {
  getVisits: (params?: PaginationParams & { patientId?: string; status?: string }) =>
    fetchAPI<PaginatedResponse<Visit>>(
      `/visits?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createVisit: (data: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Visit>>('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVisit: (id: string, data: Partial<Visit>) =>
    fetchAPI<ApiResponse<Visit>>(`/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteVisit: (id: string) =>
    fetchAPI<void>(`/visits/${id}`, { method: 'DELETE' }),
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export const sessionsApi = {
  getSessions: (params?: PaginationParams & { patientId?: string; visitId?: string }) =>
    fetchAPI<PaginatedResponse<Session>>(
      `/sessions?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createSession: (data: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Session>>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSession: (id: string, data: Partial<Session>) =>
    fetchAPI<ApiResponse<Session>>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSession: (id: string) =>
    fetchAPI<void>(`/sessions/${id}`, { method: 'DELETE' }),
}

// ─── Services ────────────────────────────────────────────────────────────────

export const servicesApi = {
  getServices: (params?: PaginationParams & { category?: string; isActive?: boolean }) =>
    fetchAPI<PaginatedResponse<Service>>(
      `/services?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createService: (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Service>>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateService: (id: string, data: Partial<Service>) =>
    fetchAPI<ApiResponse<Service>>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteService: (id: string) =>
    fetchAPI<void>(`/services/${id}`, { method: 'DELETE' }),
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export const notesApi = {
  getNotes: (params?: PaginationParams & { patientId?: string; type?: string }) =>
    fetchAPI<PaginatedResponse<Note>>(
      `/notes?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createNote: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Note>>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateNote: (id: string, data: Partial<Note>) =>
    fetchAPI<ApiResponse<Note>>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteNote: (id: string) =>
    fetchAPI<void>(`/notes/${id}`, { method: 'DELETE' }),
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export const alertsApi = {
  getAlerts: (params?: PaginationParams & { patientId?: string; severity?: string }) =>
    fetchAPI<PaginatedResponse<Alert>>(
      `/alerts?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createAlert: (data: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Alert>>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAlert: (id: string, data: Partial<Alert>) =>
    fetchAPI<ApiResponse<Alert>>(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAlert: (id: string) =>
    fetchAPI<void>(`/alerts/${id}`, { method: 'DELETE' }),
}

// ─── Reminders ───────────────────────────────────────────────────────────────

export const remindersApi = {
  getReminders: (params?: PaginationParams & { patientId?: string; type?: string }) =>
    fetchAPI<PaginatedResponse<Reminder>>(
      `/reminders?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createReminder: (data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Reminder>>('/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateReminder: (id: string, data: Partial<Reminder>) =>
    fetchAPI<ApiResponse<Reminder>>(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteReminder: (id: string) =>
    fetchAPI<void>(`/reminders/${id}`, { method: 'DELETE' }),
}

// ─── Laser ───────────────────────────────────────────────────────────────────

export const laserApi = {
  getLaserRecords: (params?: PaginationParams & { patientId?: string }) =>
    fetchAPI<PaginatedResponse<LaserRecord>>(
      `/laser/records?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createLaserRecord: (data: Omit<LaserRecord, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<LaserRecord>>('/laser/records', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLaserSessions: (params?: PaginationParams & { laserRecordId?: string; patientId?: string }) =>
    fetchAPI<PaginatedResponse<LaserSession>>(
      `/laser/sessions?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createLaserSession: (data: Omit<LaserSession, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<LaserSession>>('/laser/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLaserPackages: (params?: PaginationParams & { isActive?: boolean }) =>
    fetchAPI<PaginatedResponse<LaserPackage>>(
      `/laser/packages?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createLaserPackage: (data: Omit<LaserPackage, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<LaserPackage>>('/laser/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLaserSettings: (params?: PaginationParams & { machineType?: string; skinType?: string }) =>
    fetchAPI<PaginatedResponse<LaserSetting>>(
      `/laser/settings?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createLaserSetting: (data: Omit<LaserSetting, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<LaserSetting>>('/laser/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export const financeApi = {
  getTransactions: (params?: PaginationParams & { patientId?: string; type?: string; category?: string; dateFrom?: string; dateTo?: string }) =>
    fetchAPI<PaginatedResponse<Transaction>>(
      `/finance/transactions?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Transaction>>('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTransaction: (id: string, data: Partial<Transaction>) =>
    fetchAPI<ApiResponse<Transaction>>(`/finance/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTransaction: (id: string) =>
    fetchAPI<void>(`/finance/transactions/${id}`, { method: 'DELETE' }),

  getFinanceSummary: (params?: { period?: 'daily' | 'weekly' | 'monthly' | 'yearly'; dateFrom?: string; dateTo?: string }) =>
    fetchAPI<ApiResponse<FinanceSummary>>(
      `/finance/summary?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),
}

// ─── Appointments ────────────────────────────────────────────────────────────

export const appointmentsApi = {
  getAppointments: (params?: PaginationParams & { doctorId?: string; patientId?: string; date?: string; status?: string }) =>
    fetchAPI<PaginatedResponse<Appointment>>(
      `/appointments?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Appointment>>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAppointment: (id: string, data: Partial<Appointment>) =>
    fetchAPI<ApiResponse<Appointment>>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAppointment: (id: string) =>
    fetchAPI<void>(`/appointments/${id}`, { method: 'DELETE' }),
}

// ─── Waiting Queue ───────────────────────────────────────────────────────────

export const waitingApi = {
  getWaitingQueue: (params?: { doctorId?: string; status?: string }) =>
    fetchAPI<ApiResponse<QueueItem[]>>(
      `/waiting?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  addToQueue: (data: Omit<QueueItem, 'id' | 'createdAt' | 'updatedAt' | 'queueNumber'>) =>
    fetchAPI<ApiResponse<QueueItem>>('/waiting', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateQueueItem: (id: string, data: Partial<QueueItem>) =>
    fetchAPI<ApiResponse<QueueItem>>(`/waiting/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  removeFromQueue: (id: string) =>
    fetchAPI<void>(`/waiting/${id}`, { method: 'DELETE' }),
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export const inventoryApi = {
  getItems: (params?: PaginationParams & { category?: string; lowStock?: boolean }) =>
    fetchAPI<PaginatedResponse<InventoryItem>>(
      `/inventory?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createItem: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<InventoryItem>>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateItem: (id: string, data: Partial<InventoryItem>) =>
    fetchAPI<ApiResponse<InventoryItem>>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteItem: (id: string) =>
    fetchAPI<void>(`/inventory/${id}`, { method: 'DELETE' }),

  getItemTransactions: (itemId: string, params?: PaginationParams) =>
    fetchAPI<PaginatedResponse<ItemTransaction>>(
      `/inventory/${itemId}/transactions?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createItemTransaction: (itemId: string, data: Omit<ItemTransaction, 'id' | 'createdAt'>) =>
    fetchAPI<ApiResponse<ItemTransaction>>(`/inventory/${itemId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── Treatment Plans ─────────────────────────────────────────────────────────

export const treatmentPlansApi = {
  getPlans: (params?: PaginationParams & { patientId?: string; status?: string }) =>
    fetchAPI<PaginatedResponse<TreatmentPlan>>(
      `/treatment-plans?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createPlan: (data: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<TreatmentPlan>>('/treatment-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePlan: (id: string, data: Partial<TreatmentPlan>) =>
    fetchAPI<ApiResponse<TreatmentPlan>>(`/treatment-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePlan: (id: string) =>
    fetchAPI<void>(`/treatment-plans/${id}`, { method: 'DELETE' }),

  getPhases: (planId: string) =>
    fetchAPI<ApiResponse<TreatmentPhase[]>>(`/treatment-plans/${planId}/phases`),

  createPhase: (planId: string, data: Omit<TreatmentPhase, 'id' | 'planId' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<TreatmentPhase>>(`/treatment-plans/${planId}/phases`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── Photos ──────────────────────────────────────────────────────────────────

export const photosApi = {
  getPhotos: (params?: PaginationParams & { patientId?: string; visitId?: string; type?: string }) =>
    fetchAPI<PaginatedResponse<Photo>>(
      `/photos?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  uploadPhoto: (formData: FormData) =>
    fetch('/api/photos', {
      method: 'POST',
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      return res.json() as Promise<ApiResponse<Photo>>
    }),

  deletePhoto: (id: string) =>
    fetchAPI<void>(`/photos/${id}`, { method: 'DELETE' }),
}

// ─── Prescriptions ───────────────────────────────────────────────────────────

export const prescriptionsApi = {
  getPrescriptions: (params?: PaginationParams & { patientId?: string; visitId?: string }) =>
    fetchAPI<PaginatedResponse<Prescription>>(
      `/prescriptions?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  createPrescription: (data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ApiResponse<Prescription>>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMedications: (prescriptionId: string) =>
    fetchAPI<ApiResponse<Medication[]>>(`/prescriptions/${prescriptionId}/medications`),

  createMedication: (prescriptionId: string, data: Omit<Medication, 'id' | 'prescriptionId' | 'createdAt'>) =>
    fetchAPI<ApiResponse<Medication>>(`/prescriptions/${prescriptionId}/medications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationsApi = {
  getNotifications: (params?: PaginationParams & { isRead?: boolean }) =>
    fetchAPI<PaginatedResponse<Notification>>(
      `/notifications?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  markAsRead: (id: string) =>
    fetchAPI<ApiResponse<Notification>>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  createNotification: (data: Omit<Notification, 'id' | 'createdAt'>) =>
    fetchAPI<ApiResponse<Notification>>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── Backup ──────────────────────────────────────────────────────────────────

export const backupApi = {
  createBackup: () =>
    fetchAPI<ApiResponse<BackupRecord>>('/backup', { method: 'POST' }),

  getBackups: () =>
    fetchAPI<ApiResponse<BackupRecord[]>>('/backup'),

  restoreBackup: (id: string) =>
    fetchAPI<ApiResponse<{ success: boolean }>>(`/backup/${id}/restore`, {
      method: 'POST',
    }),
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export const auditLogApi = {
  getAuditLogs: (params?: PaginationParams & { userId?: string; action?: string; entity?: string }) =>
    fetchAPI<PaginatedResponse<AuditLogEntry>>(
      `/audit-logs?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  getDailyReport: (date?: string) =>
    fetchAPI<ApiResponse<DailyReport>>(
      `/reports/daily?${date ? new URLSearchParams({ date }).toString() : ''}`
    ),

  getWeeklyReport: (weekStart?: string) =>
    fetchAPI<ApiResponse<WeeklyReport>>(
      `/reports/weekly?${weekStart ? new URLSearchParams({ weekStart }).toString() : ''}`
    ),

  getMonthlyReport: (month?: string) =>
    fetchAPI<ApiResponse<MonthlyReport>>(
      `/reports/monthly?${month ? new URLSearchParams({ month }).toString() : ''}`
    ),
}

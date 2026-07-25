// ─── Shared Type Definitions ─────────────────────────────────────────
// Extracted from page.tsx for use by all components

export interface ImprovementEntry { score: number; date: string; note?: string }
export interface Patient { id: string; fileNumber: string; name: string; phone?: string; phone2?: string; age?: number; gender?: string; address?: string; notes?: string; allergies?: string; medicalHistory?: string; starred?: boolean; improved?: boolean; publishable?: boolean; dangerous?: boolean; colorTag?: string; bloodType?: string; improvementScore?: number; improvementHistory?: string; createdAt: string; }
export interface Visit { id: string; patientId: string; doctorId?: string; type: string; diagnosis?: string; notes?: string; date: string; }
export interface Session { id: string; patientId: string; serviceId?: string; doctorId?: string; status: string; notes?: string; date: string; price: number; paid: boolean; }
export interface Service { id: string; name: string; category?: string; price: number; duration?: number; active: boolean; }
export interface Note { id: string; patientId?: string; userId?: string; content: string; important: boolean; section?: string; createdAt: string; }
export interface Alert { id: string; patientId: string; type: string; message: string; active: boolean; }
export interface Reminder { id: string; patientId?: string; title: string; description?: string; date: string; type: string; status: string; }
export interface LaserRecord { id: string; patientId: string; bodyArea: string; skinType?: string; hairColor?: string; hairDensity?: string; totalSessions: number; price: number; totalPrice: number; paid: boolean; machineName?: string; energy?: number; pulse?: string; status: string; notes?: string; createdAt?: string; laserSessions?: LaserSession[]; patient?: { id: string; name: string; fileNumber: string; phone?: string; age?: number; gender?: string; }; _count?: { laserSessions: number; }; }
export interface LaserSession { id: string; laserRecordId: string; sessionNumber: number; energy?: number; pulse?: string; painLevel?: number; reaction?: string; notes?: string; price: number; paid: boolean; date: string; createdAt?: string; }
export interface LaserPackage { id: string; name: string; sessionsCount: number; price: number; bodyArea?: string; active: boolean; }
export interface LaserSetting { id: string; machineName: string; bodyArea: string; defaultEnergy?: number; defaultPulse?: string; }
export interface Transaction { id: string; type: string; category: string; amount: number; description?: string; date: string; }
export interface Appointment { id: string; patientId?: string; date: string; duration: number; type: string; status: string; notes?: string; }
export interface WaitingItem { id: string; patientId?: string; patientName?: string; priority: number; status: string; notes?: string; createdAt: string; patient?: { id: string; name: string; fileNumber?: string; phone?: string; } }
export interface InventoryItem { id: string; name: string; category?: string; quantity: number; minQuantity: number; unitPrice: number; notes?: string; }
export interface Medication { id: string; name: string; category?: string; description?: string; dosage?: string; instructions?: string; active: boolean; }
export interface Prescription { id: string; patientId: string; doctorId?: string; diagnosis?: string; notes?: string; date: string; }
export interface Notification { id: string; userId?: string; title: string; message: string; type: string; read: boolean; createdAt: string; }
export interface Backup { id: string; type: string; size?: number; status: string; createdAt: string; }
export interface PatientPhoto { id: string; patientId: string; type: string; description?: string; imageData: string; createdAt: string; }
export interface PartnerDoctor { id: string; name: string; phone?: string; specialty?: string; checkupPercentage: number; revisitPercentage: number; laserPercentage: number; sessionPercentage: number; fixedAmount: number; active: boolean; notes?: string; createdAt: string; }
export interface FollowUpRecord { id: string; patientId: string; condition: string; conditionCategory?: string; severity: string; status: string; frequency: string; customDays?: number; nextVisitDate?: string; lastVisitDate?: string; hasSubscription: boolean; subscriptionType?: string; subscriptionPrice: number; subscriptionStart?: string; subscriptionEnd?: string; sessionsIncluded: number; sessionsUsed: number; diagnosis?: string; treatmentPlan?: string; medications?: string; notes?: string; reminderEnabled: boolean; reminderDaysBefore: number; createdAt: string; patient?: Patient; followUpVisits?: FollowUpVisit[]; }
export interface FollowUpVisit { id: string; followUpId: string; visitNumber: number; visitDate: string; type: string; findings?: string; vitals?: string; diagnosis?: string; treatmentNotes?: string; medications?: string; instructions?: string; paid: boolean; price: number; nextVisitDate?: string; status: string; notes?: string; createdAt: string; followUp?: FollowUpRecord & { patient?: Patient }; }

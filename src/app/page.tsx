'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuthStore, useClinicStore, THEME_CONFIGS } from '@/lib/store'
import { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Stethoscope, Zap, MoreHorizontal,
  Search, Bell, Moon, Sun, LogOut, Plus, Edit3,
  Trash2, Star, StarOff, Phone, Calendar, Clock, DollarSign,
  Package, FileText, Activity, AlertTriangle, CheckCircle,
  ChevronDown, Settings, Shield, BarChart3, TrendingUp, Eye,
  Camera, Pill, Heart, Send, Bot, RefreshCw, Download, Upload,
  Filter, UserPlus, Sparkles, Hash, MapPin, Palette, X,
  Database, HardDrive, Archive, FileDown, FileUp, Timer, Tag,
  Scissors, Syringe, Layers, Wand2, ThermometerSun, Lock,
  CircleDot, Armchair, ScanFace, Hand, Circle,
  MousePointerClick, Target, ZapOff, BarChart2, Receipt,
  CalendarCheck, UsersRound, ClipboardCheck, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

// ─── Types ──────────────────────────────────────────────────────────────────
interface Patient { id: string; fileNumber: string; name: string; phone?: string; phone2?: string; age?: number; gender?: string; address?: string; notes?: string; allergies?: string; medicalHistory?: string; starred?: boolean; improved?: boolean; colorTag?: string; bloodType?: string; createdAt: string; }
interface Visit { id: string; patientId: string; doctorId?: string; type: string; diagnosis?: string; notes?: string; date: string; }
interface Session { id: string; patientId: string; serviceId?: string; doctorId?: string; status: string; notes?: string; date: string; price: number; paid: boolean; }
interface Service { id: string; name: string; category?: string; price: number; duration?: number; active: boolean; }
interface Note { id: string; patientId?: string; userId?: string; content: string; important: boolean; section?: string; createdAt: string; }
interface Alert { id: string; patientId: string; type: string; message: string; active: boolean; }
interface Reminder { id: string; patientId?: string; title: string; description?: string; date: string; type: string; status: string; }
interface LaserRecord { id: string; patientId: string; bodyArea: string; skinType?: string; hairColor?: string; hairDensity?: string; totalSessions: number; price: number; totalPrice: number; paid: boolean; machineName?: string; energy?: number; pulse?: string; status: string; notes?: string; createdAt?: string; }
interface LaserSession { id: string; laserRecordId: string; sessionNumber: number; energy?: number; pulse?: string; painLevel?: number; reaction?: string; notes?: string; date: string; }
interface LaserPackage { id: string; name: string; sessionsCount: number; price: number; bodyArea?: string; active: boolean; }
interface LaserSetting { id: string; machineName: string; bodyArea: string; defaultEnergy?: number; defaultPulse?: string; }
interface Transaction { id: string; type: string; category: string; amount: number; description?: string; date: string; }
interface Appointment { id: string; patientId?: string; date: string; duration: number; type: string; status: string; notes?: string; }
interface WaitingItem { id: string; patientId?: string; patientName?: string; priority: number; status: string; notes?: string; createdAt: string; }
interface InventoryItem { id: string; name: string; category?: string; quantity: number; minQuantity: number; unitPrice: number; notes?: string; }
interface Medication { id: string; name: string; category?: string; description?: string; dosage?: string; instructions?: string; active: boolean; }
interface Prescription { id: string; patientId: string; doctorId?: string; diagnosis?: string; notes?: string; date: string; }
interface Notification { id: string; userId?: string; title: string; message: string; type: string; read: boolean; createdAt: string; }
interface Backup { id: string; type: string; size?: number; status: string; createdAt: string; }
interface PatientPhoto { id: string; patientId: string; type: string; description?: string; imageData: string; createdAt: string; }
interface ChatMessage { role: 'user' | 'assistant'; content: string; }
interface PartnerDoctor { id: string; name: string; phone?: string; specialty?: string; checkupPercentage: number; revisitPercentage: number; laserPercentage: number; sessionPercentage: number; fixedAmount: number; active: boolean; notes?: string; createdAt: string; }

// ─── Helpers ────────────────────────────────────────────────────────────────
const CHART_COLORS = ['#047857', '#D4A843', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EC4899']
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!res.ok) { const e = await res.text().catch(() => ''); throw new Error(e || `Error ${res.status}`) }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Laser body areas with icons for professional laser center
const BODY_AREAS = [
  { id: 'face', label: 'الوجه', emoji: '😶', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { id: 'chin', label: 'الذقن', emoji: '🫠', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
  { id: 'upper_lip', label: 'الشفاة العليا', emoji: '👄', color: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' },
  { id: 'underarms', label: 'الإبط', emoji: '💪', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
  { id: 'arms', label: 'الذراعين', emoji: '💪', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { id: 'legs', label: 'الساقين', emoji: '🦵', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  { id: 'bikini', label: 'البيكيني', emoji: '🩱', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { id: 'back', label: 'الظهر', emoji: '🔙', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
  { id: 'chest', label: 'الصدر', emoji: '👕', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { id: 'abdomen', label: 'البطن', emoji: '🫃', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { id: 'neck', label: 'الرقبة', emoji: '🦒', color: 'bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400' },
  { id: 'shoulders', label: 'الكتفين', emoji: '🤷', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  { id: 'hands', label: 'اليدين', emoji: '🤲', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
  { id: 'feet', label: 'القدمين', emoji: '🦶', color: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400' },
  { id: 'full_body', label: 'جسم كامل', emoji: '🧍', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
]

const SKIN_TYPES = [
  { id: 'I', label: 'النوع I - أبيض فاتح جداً', color: 'bg-rose-50 border-rose-300' },
  { id: 'II', label: 'النوع II - أبيض فاتح', color: 'bg-orange-50 border-orange-300' },
  { id: 'III', label: 'النوع III - أبيض متوسط', color: 'bg-amber-50 border-amber-300' },
  { id: 'IV', label: 'النوع IV - حنطي', color: 'bg-yellow-50 border-yellow-300' },
  { id: 'V', label: 'النوع V - بني فاتح', color: 'bg-emerald-50 border-emerald-300' },
  { id: 'VI', label: 'النوع VI - بني غامق', color: 'bg-stone-50 border-stone-400' },
]

const HAIR_COLORS = [
  { id: 'black', label: 'أسود', color: 'bg-gray-800' },
  { id: 'dark_brown', label: 'بني غامق', color: 'bg-amber-900' },
  { id: 'brown', label: 'بني', color: 'bg-amber-700' },
  { id: 'light_brown', label: 'بني فاتح', color: 'bg-amber-500' },
  { id: 'red', label: 'أحمر', color: 'bg-red-600' },
  { id: 'blonde', label: 'أشقر', color: 'bg-yellow-400' },
  { id: 'gray', label: 'رمادي', color: 'bg-gray-400' },
  { id: 'white', label: 'أبيض', color: 'bg-gray-100' },
]

// Visit type config with colors + combo types
const VISIT_TYPES = [
  { id: 'checkup', label: 'كشف', emoji: '🩺', bg: 'bg-emerald-500', hoverBg: 'hover:bg-emerald-600', ring: 'ring-emerald-300' },
  { id: 'revisit', label: 'إعادة', emoji: '🔄', bg: 'bg-blue-500', hoverBg: 'hover:bg-blue-600', ring: 'ring-blue-300' },
  { id: 'session', label: 'جلسة', emoji: '⚡', bg: 'bg-violet-500', hoverBg: 'hover:bg-violet-600', ring: 'ring-violet-300' },
  { id: 'checkup_session', label: 'كشف + جلسة', emoji: '🩺⚡', bg: 'bg-gradient-to-l from-emerald-500 to-violet-500', hoverBg: 'hover:from-emerald-600 hover:to-violet-600', ring: 'ring-emerald-300' },
  { id: 'revisit_session', label: 'إعادة + جلسة', emoji: '🔄⚡', bg: 'bg-gradient-to-l from-blue-500 to-violet-500', hoverBg: 'hover:from-blue-600 hover:to-violet-600', ring: 'ring-blue-300' },
]

// ─── Main App ───────────────────────────────────────────────────────────────
export default function Home() {
  const { user, isAuthenticated, login, logout } = useAuthStore()
  const { activeTab, setActiveTab, theme, setTheme, statusColors, setStatusColors, autoBackup, setAutoBackup, backupInterval, setBackupInterval, lastBackup, setLastBackup } = useClinicStore()
  const [darkMode, setDarkMode] = useState(false)
  const [smartSearchOpen, setSmartSearchOpen] = useState(false)
  const [smartSearchQuery, setSmartSearchQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Data
  const [patients, setPatients] = useState<Patient[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [laserRecords, setLaserRecords] = useState<LaserRecord[]>([])
  const [laserPackages, setLaserPackages] = useState<LaserPackage[]>([])
  const [laserSettings, setLaserSettings] = useState<LaserSetting[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [waitingQueue, setWaitingQueue] = useState<WaitingItem[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [backups, setBackups] = useState<Backup[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  // UI
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [moreSubTab, setMoreSubTab] = useState('services')
  const [laserSubTab, setLaserSubTab] = useState('records')

  // Smart Patient Form
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')
  const [newPatientPhone2, setNewPatientPhone2] = useState('')
  const [newPatientAddress, setNewPatientAddress] = useState('')
  const [newPatientAge, setNewPatientAge] = useState('')
  const [newPatientGender, setNewPatientGender] = useState('')
  const [newPatientNotes, setNewPatientNotes] = useState('')
  const [selectedVisitType, setSelectedVisitType] = useState<string>('')
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  const [showAddLaserRecord, setShowAddLaserRecord] = useState(false)
  const [showAddLaserPackage, setShowAddLaserPackage] = useState(false)
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [showAddInventory, setShowAddInventory] = useState(false)

  // Laser form
  const [laserFormArea, setLaserFormArea] = useState('')
  const [laserFormSkinType, setLaserFormSkinType] = useState('')
  const [laserFormHairColor, setLaserFormHairColor] = useState('')
  const [laserFormHairDensity, setLaserFormHairDensity] = useState('')
  const [laserFormSessions, setLaserFormSessions] = useState('6')
  const [laserFormNotes, setLaserFormNotes] = useState('')
  const [laserFormPatientId, setLaserFormPatientId] = useState('')
  const [laserFormPatientSearch, setLaserFormPatientSearch] = useState('')
  const [laserFormPrice, setLaserFormPrice] = useState('')
  const [laserFormPaid, setLaserFormPaid] = useState(false)
  const [laserFormMachine, setLaserFormMachine] = useState('')
  const [laserFormEnergy, setLaserFormEnergy] = useState('')
  const [laserFormPulse, setLaserFormPulse] = useState('')
  const [laserFormDoctorId, setLaserFormDoctorId] = useState('')

  // AI Chat
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Login
  const [loginRole, setLoginRole] = useState<'doctor' | 'secretary' | null>(null)
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Service price editing & quick notes
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editingServicePrice, setEditingServicePrice] = useState('')
  const [customServicePrice, setCustomServicePrice] = useState('')
  const [visitPrice, setVisitPrice] = useState('')
  const [quickNote, setQuickNote] = useState('')

  // Patient filters & detail
  const [patientFilter, setPatientFilter] = useState<'all' | 'starred' | 'improved'>('all')
  const [patientDetailTab, setPatientDetailTab] = useState('overview')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')

  // Patient photos
  const [patientPhotos, setPatientPhotos] = useState<PatientPhoto[]>([])
  const [photoType, setPhotoType] = useState('general')
  const [photoDescription, setPhotoDescription] = useState('')

  // Add session/visit in patient profile
  const [showAddSessionProfile, setShowAddSessionProfile] = useState(false)
  const [profileSessionServiceId, setProfileSessionServiceId] = useState('')
  const [profileSessionPrice, setProfileSessionPrice] = useState('')
  const [profileSessionNotes, setProfileSessionNotes] = useState('')
  const [showAddVisitProfile, setShowAddVisitProfile] = useState(false)
  const [profileVisitType, setProfileVisitType] = useState('checkup')
  const [profileVisitPrice, setProfileVisitPrice] = useState('')
  const [profileVisitNotes, setProfileVisitNotes] = useState('')

  // Partner Doctors
  const [doctors, setDoctors] = useState<PartnerDoctor[]>([])
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null)
  const [doctorForm, setDoctorForm] = useState({ name: '', phone: '', specialty: '', checkupPercentage: '', revisitPercentage: '', laserPercentage: '', sessionPercentage: '', fixedAmount: '', notes: '' })

  // Patient edit/delete
  const [editingPatient, setEditingPatient] = useState(false)
  const [deletePatientConfirmOpen, setDeletePatientConfirmOpen] = useState(false)
  const [editPatientForm, setEditPatientForm] = useState({ name: '', phone: '', phone2: '', age: '', gender: '', address: '', bloodType: '', medicalHistory: '', notes: '' })
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)
  const [editVisitForm, setEditVisitForm] = useState({ type: '', notes: '', price: '' })
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editSessionForm, setEditSessionForm] = useState({ price: '', notes: '', status: '', paid: false })
  const [laserFinancePatientId, setLaserFinancePatientId] = useState('')
  const [laserFinancePrice, setLaserFinancePrice] = useState('')
  const [laserFinanceNotes, setLaserFinanceNotes] = useState('')
  const [noteSearch, setNoteSearch] = useState('')
  const [noteFilter, setNoteFilter] = useState<'all' | 'important' | 'dashboard' | 'patients' | 'laser' | 'finance' | 'general'>('all')

  // Role & Password system
  const [userRole, setUserRole] = useState<'doctor' | 'secretary'>('doctor')
  const [sectionPasswords, setSectionPasswords] = useState<Record<string, string>>({})
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [pendingTab, setPendingTab] = useState('')

  // Treatment Templates
  const [treatmentTemplates, setTreatmentTemplates] = useState<any[]>([
    { id: '1', name: 'علاج حب الشباب', description: 'بروتوكول علاجي كامل لحب الشباب', sessions: 6, estimatedPrice: 1500, category: 'جلدية' },
    { id: '2', name: 'تبييض البشرة', description: 'جلسات تبييض وتوحيد لون البشرة', sessions: 4, estimatedPrice: 2000, category: 'تجميل' },
    { id: '3', name: 'إزالة شعر كامل', description: 'إزالة شعر بالليزر - جسم كامل', sessions: 8, estimatedPrice: 4000, category: 'ليزر' },
    { id: '4', name: 'علاج التصبغات', description: 'علاج بقع وتصبغات البشرة', sessions: 5, estimatedPrice: 1800, category: 'جلدية' },
    { id: '5', name: 'تجديد البشرة', description: 'جلسات تجديد وتنضيج البشرة', sessions: 4, estimatedPrice: 2500, category: 'تجميل' },
  ])

  // Before/After Slider
  const [sliderPos, setSliderPos] = useState(50)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Waiting Queue form
  const [showAddWaiting, setShowAddWaiting] = useState(false)
  const [waitingFormName, setWaitingFormName] = useState('')
  const [waitingFormPriority, setWaitingFormPriority] = useState<'normal' | 'urgent'>('normal')
  const [waitingFormNotes, setWaitingFormNotes] = useState('')

  // Enhanced Reminder form
  const [reminderType, setReminderType] = useState('general')
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [reminderPatientId, setReminderPatientId] = useState('')
  const [celebratingId, setCelebratingId] = useState<string | null>(null)

  // Template apply dialog
  const [showApplyTemplate, setShowApplyTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [templatePatientId, setTemplatePatientId] = useState('')

  // More tab - Notes section
  const [notesSearch, setNotesSearch] = useState('')
  const [notesFilterSection, setNotesFilterSection] = useState('all')
  const [notesFilterImportant, setNotesFilterImportant] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteSection, setNewNoteSection] = useState('general')
  const [newNoteImportant, setNewNoteImportant] = useState(false)
  const [editingNoteIdMore, setEditingNoteIdMore] = useState<string | null>(null)
  const [editingNoteContentMore, setEditingNoteContentMore] = useState('')
  const [editingNoteSectionMore, setEditingNoteSectionMore] = useState('general')

  // Inventory enhanced states
  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low' | 'normal'>('all')
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all')
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null)
  const [editInventoryForm, setEditInventoryForm] = useState({ name: '', category: '', quantity: '', minQuantity: '', unitPrice: '', notes: '' })
  const [showStockTransaction, setShowStockTransaction] = useState(false)
  const [stockTransactionItemId, setStockTransactionItemId] = useState('')
  const [stockTransactionType, setStockTransactionType] = useState<'in' | 'out'>('in')
  const [stockTransactionQty, setStockTransactionQty] = useState('')
  const [stockTransactionNotes, setStockTransactionNotes] = useState('')
  const [deleteInventoryConfirmId, setDeleteInventoryConfirmId] = useState<string | null>(null)

  // Booking system states
  const [showAddBooking, setShowAddBooking] = useState(false)
  const [bookingFormPatientSearch, setBookingFormPatientSearch] = useState('')
  const [bookingFormPatientId, setBookingFormPatientId] = useState('')
  const [bookingFormDate, setBookingFormDate] = useState('')
  const [bookingFormTime, setBookingFormTime] = useState('')
  const [bookingFormType, setBookingFormType] = useState('checkup')
  const [bookingFormStatus, setBookingFormStatus] = useState('scheduled')
  const [bookingFormNotes, setBookingFormNotes] = useState('')
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all')
  const [bookingFilterDate, setBookingFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null)

  // Visits enhanced states
  const [visitFilterType, setVisitFilterType] = useState('all')
  const [deleteVisitConfirmId, setDeleteVisitConfirmId] = useState<string | null>(null)

  // ─── Password is verified server-side via /auth/login API ─────────────
  // No password stored on client - all verification is server-side

  // ─── Effects ──────────────────────────────────────────────────────────
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode) }, [darkMode])
  useEffect(() => { if (!seeded) { apiFetch('/seed', { method: 'POST' }).then(() => setSeeded(true)).catch(() => setSeeded(true)) } }, [seeded])
  useEffect(() => {
    if (!autoBackup) return
    const interval = setInterval(async () => { try { await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'auto' }) }); setLastBackup(new Date().toISOString()); toast.success('تم النسخ الاحتياطي التلقائي') } catch {} }, backupInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoBackup, backupInterval, setLastBackup])

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        apiFetch('/patients?limit=200'), apiFetch('/visits?limit=200'), apiFetch('/sessions?limit=200'),
        apiFetch('/services?limit=100'), apiFetch('/notes?limit=200'), apiFetch('/alerts?limit=100'),
        apiFetch('/reminders?limit=100'), apiFetch('/laser/records?limit=200'), apiFetch('/laser/packages?limit=50'),
        apiFetch('/laser/settings?limit=50'), apiFetch('/finance/transactions?limit=200'), apiFetch('/appointments?limit=200'),
        apiFetch('/waiting?limit=50'), apiFetch('/inventory/items?limit=100'), apiFetch('/medications?limit=200'),
        apiFetch('/prescriptions?limit=100'), apiFetch('/backups?limit=20'), apiFetch('/notifications?limit=50'),
        apiFetch('/doctors?limit=50'),
      ])
      const u = (r: PromiseSettledResult<any>) => { if (r.status !== 'fulfilled') return []; const v = r.value; return v?.data || v?.patients || v?.visits || v?.sessions || v?.services || v?.notes || v?.alerts || v?.reminders || v?.records || v?.packages || v?.settings || v?.transactions || v?.appointments || v?.queue || v?.items || v?.medications || v?.prescriptions || v?.backups || v?.notifications || v?.doctors || (Array.isArray(v) ? v : []) }
      setPatients(u(results[0])); setVisits(u(results[1])); setSessions(u(results[2])); setServices(u(results[3])); setNotes(u(results[4])); setAlerts(u(results[5])); setReminders(u(results[6])); setLaserRecords(u(results[7])); setLaserPackages(u(results[8])); setLaserSettings(u(results[9])); setTransactions(u(results[10])); setAppointments(u(results[11])); setWaitingQueue(u(results[12])); setInventoryItems(u(results[13])); setMedications(u(results[14])); setPrescriptions(u(results[15])); setBackups(u(results[16])); setNotifications(u(results[17])); setDoctors(u(results[18]))
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isAuthenticated) loadAllData() }, [isAuthenticated, loadAllData])

  // Load patient photos when selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      apiFetch(`/photos?patientId=${selectedPatient.id}`).then((res: any) => {
        const photos = res?.data || res?.photos || (Array.isArray(res) ? res : [])
        setPatientPhotos(photos)
      }).catch(() => setPatientPhotos([]))
    } else {
      setPatientPhotos([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id])

  // ─── Auto-suggest patient names ──────────────────────────────────────
  const patientSearchSuggestions = useMemo(() => {
    if (newPatientName.length < 1) return []
    const q = newPatientName.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5)
  }, [newPatientName, patients])

  // Laser patient search
  const laserPatientSuggestions = useMemo(() => {
    if (!laserFormPatientSearch) return []
    const q = laserFormPatientSearch.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5)
  }, [laserFormPatientSearch, patients])

  // Booking patient search
  const bookingPatientSuggestions = useMemo(() => {
    if (!bookingFormPatientSearch) return []
    const q = bookingFormPatientSearch.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5)
  }, [bookingFormPatientSearch, patients])

  // ─── CRUD ─────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginRole) { toast.error('اختر الدور أولاً'); return }
    if (!loginPassword) { toast.error('أدخل كلمة المرور'); return }
    setLoginLoading(true)
    try {
      const res = await apiFetch<{user: any}>('/auth/login', { method: 'POST', body: JSON.stringify({ role: loginRole, password: loginPassword }) })
      setUserRole(loginRole)
      login(res.user)
      toast.success(loginRole === 'doctor' ? 'مرحباً دكتور 🩺' : 'مرحباً 👩‍💼')
      if (loginRole === 'secretary') setActiveTab('patients')
    } catch (e: any) { toast.error(e.message === 'Invalid password' ? 'كلمة السر غير صحيحة' : e.message || 'خطأ في تسجيل الدخول') }
    setLoginLoading(false)
  }
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) }); const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.package || res?.setting || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.backup || res; if (item?.id) setter(prev => [item, ...prev]); toast.success('تمت الإضافة بنجاح'); return item } catch (e: any) { toast.error(e.message || 'خطأ'); return null }
  }
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: 'DELETE' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success('تم الحذف') } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // Delete patient with full finance cleanup
  const deletePatientWithFinance = async (patient: Patient) => {
    try {
      // Find all finance transactions related to this patient (by name in description)
      const relatedTxns = transactions.filter(t => t.description?.includes(patient.name))
      // Delete each related finance transaction
      for (const txn of relatedTxns) {
        try { await apiFetch(`/finance/transactions/${txn.id}`, { method: 'DELETE' }) } catch {}
      }
      // Remove deleted transactions from state
      const deletedTxnIds = new Set(relatedTxns.map(t => t.id))
      setTransactions(prev => prev.filter(t => !deletedTxnIds.has(t.id)))
      // Delete the patient (API should cascade delete visits, sessions, notes, etc.)
      await apiFetch(`/patients/${patient.id}`, { method: 'DELETE' })
      // Remove patient and related data from state
      setPatients(prev => prev.filter(p => p.id !== patient.id))
      setVisits(prev => prev.filter(v => v.patientId !== patient.id))
      setSessions(prev => prev.filter(s => s.patientId !== patient.id))
      setNotes(prev => prev.filter(n => n.patientId !== patient.id))
      setLaserRecords(prev => prev.filter(l => l.patientId !== patient.id))
      setSelectedPatient(null)
      setDeletePatientConfirmOpen(false)
      toast.success(`تم حذف المريض ${patient.name} وجميع البيانات المرتبطة`)
    } catch (e: any) { toast.error(e.message || 'خطأ في حذف المريض') }
  }

  // Delete visit with finance sync
  const deleteVisitWithFinance = async (visit: Visit, patientName: string) => {
    try {
      // Find and delete the corresponding finance transaction
      const visitCategory = visit.type === 'checkup' ? 'كشف' : visit.type === 'revisit' ? 'إعادة' : 'جلسات'
      const visitDate = visit.date?.split('T')[0]
      const relatedTxn = transactions.find(t =>
        t.description?.includes(patientName) &&
        t.category === visitCategory &&
        t.date?.startsWith(visitDate || '')
      )
      if (relatedTxn) {
        try { await apiFetch(`/finance/transactions/${relatedTxn.id}`, { method: 'DELETE' }) } catch {}
        setTransactions(prev => prev.filter(t => t.id !== relatedTxn.id))
      }
      // Delete the visit
      await apiFetch(`/visits/${visit.id}`, { method: 'DELETE' })
      setVisits(prev => prev.filter(v => v.id !== visit.id))
      toast.success('تم حذف الزيارة والمعاملة المالية المرتبطة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // Edit visit with finance sync
  const editVisitWithFinance = async (visit: Visit, newType: string, newNotes: string, patientName: string) => {
    try {
      const oldCategory = visit.type === 'checkup' ? 'كشف' : visit.type === 'revisit' ? 'إعادة' : 'جلسات'
      const newCategory = newType === 'checkup' ? 'كشف' : newType === 'revisit' ? 'إعادة' : 'جلسات'
      // Find related finance transaction
      const visitDate = visit.date?.split('T')[0]
      const relatedTxn = transactions.find(t =>
        t.description?.includes(patientName) &&
        t.category === oldCategory &&
        t.date?.startsWith(visitDate || '')
      )
      // Update visit
      await apiFetch(`/visits/${visit.id}`, { method: 'PUT', body: JSON.stringify({ type: newType, notes: newNotes || undefined }) })
      setVisits(prev => prev.map(v => v.id === visit.id ? { ...v, type: newType, notes: newNotes } : v))
      // Update finance transaction if category changed
      if (relatedTxn && oldCategory !== newCategory) {
        await apiFetch(`/finance/transactions/${relatedTxn.id}`, { method: 'PUT', body: JSON.stringify({ category: newCategory, description: relatedTxn.description?.replace(oldCategory, newCategory) }) })
        setTransactions(prev => prev.map(t => t.id === relatedTxn.id ? { ...t, category: newCategory, description: t.description?.replace(oldCategory, newCategory) } : t))
      }
      setEditingVisitId(null)
      toast.success('تم تعديل الزيارة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // Delete session with finance sync
  const deleteSessionWithFinance = async (session: Session, patientName: string) => {
    try {
      // Find and delete the corresponding finance transaction
      const sessionDate = session.date?.split('T')[0]
      const svcName = services.find(sv => sv.id === session.serviceId)?.name || 'جلسة'
      const relatedTxn = transactions.find(t =>
        t.description?.includes(patientName) &&
        (t.category === 'جلسات' || t.category === 'ليزر') &&
        t.date?.startsWith(sessionDate || '') &&
        t.amount === session.price
      )
      if (relatedTxn) {
        try { await apiFetch(`/finance/transactions/${relatedTxn.id}`, { method: 'DELETE' }) } catch {}
        setTransactions(prev => prev.filter(t => t.id !== relatedTxn.id))
      }
      // Delete the session
      await apiFetch(`/sessions/${session.id}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.id !== session.id))
      toast.success('تم حذف الجلسة والمعاملة المالية المرتبطة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // Edit session with finance sync
  const editSessionWithFinance = async (session: Session, newPrice: number, newNotes: string, newStatus: string, patientName: string) => {
    try {
      // Find related finance transaction
      const sessionDate = session.date?.split('T')[0]
      const relatedTxn = transactions.find(t =>
        t.description?.includes(patientName) &&
        (t.category === 'جلسات' || t.category === 'ليزر') &&
        t.date?.startsWith(sessionDate || '') &&
        t.amount === session.price
      )
      // Update session
      await apiFetch(`/sessions/${session.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice, notes: newNotes || undefined, status: newStatus }) })
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, price: newPrice, notes: newNotes, status: newStatus } : s))
      // Update finance transaction if price changed
      if (relatedTxn && newPrice !== session.price) {
        await apiFetch(`/finance/transactions/${relatedTxn.id}`, { method: 'PUT', body: JSON.stringify({ amount: newPrice }) })
        setTransactions(prev => prev.map(t => t.id === relatedTxn.id ? { ...t, amount: newPrice } : t))
      }
      setEditingSessionId(null)
      toast.success('تم تعديل الجلسة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // ─── Computed ─────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0]
  const todayVisits = visits.filter(v => v.date?.startsWith(todayStr))
  const todayIncome = transactions.filter(t => t.type === 'income' && t.date?.startsWith(todayStr)).reduce((s, t) => s + t.amount, 0)
  const todayAppointments = appointments.filter(a => a.date?.startsWith(todayStr))
  const activeAlerts = alerts.filter(a => a.active)
  const lowStockItems = inventoryItems.filter(i => i.quantity <= i.minQuantity)
  const maleCount = patients.filter(p => p.gender === 'male').length
  const femaleCount = patients.filter(p => p.gender === 'female').length
  const revenueChartData = useMemo(() => { const days: any[] = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0]; days.push({ name: d.toLocaleDateString('ar-EG', { weekday: 'short' }), إيراد: transactions.filter(t => t.type === 'income' && t.date?.startsWith(ds)).reduce((s, t) => s + t.amount, 0), مصروف: transactions.filter(t => t.type === 'expense' && t.date?.startsWith(ds)).reduce((s, t) => s + t.amount, 0) }) } return days }, [transactions])
  const genderData = [{ name: 'ذكور', value: maleCount || 1 }, { name: 'إناث', value: femaleCount || 1 }]
  const filteredPatients = useMemo(() => { let list = patients; if (searchQuery) list = list.filter(p => p.name.includes(searchQuery) || p.phone?.includes(searchQuery) || p.fileNumber?.includes(searchQuery)); if (patientFilter === 'starred') list = list.filter(p => p.starred); if (patientFilter === 'improved') list = list.filter(p => p.improved); return list }, [patients, searchQuery, patientFilter])

  // ─── Financial Computed Values ──────────────────────────────
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netProfit = totalIncome - totalExpense
  const checkupRevenue = transactions.filter(t => t.type === 'income' && t.category === 'كشف').reduce((s, t) => s + t.amount, 0)
  const revisitRevenue = transactions.filter(t => t.type === 'income' && t.category === 'إعادة').reduce((s, t) => s + t.amount, 0)
  const sessionRevenue = transactions.filter(t => t.type === 'income' && t.category === 'جلسات').reduce((s, t) => s + t.amount, 0)
  const otherRevenue = totalIncome - checkupRevenue - revisitRevenue - sessionRevenue
  const unpaidTotal = sessions.filter(s => !s.paid).reduce((s, ses) => s + ses.price, 0)
  const thisMonthIncome = transactions.filter(t => { const d = new Date(t.date); const now = new Date(); return t.type === 'income' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).reduce((s, t) => s + t.amount, 0)
  const thisWeekIncome = revenueChartData.reduce((s, d) => s + (d.إيراد || 0), 0)
  const revenueByCategory = useMemo(() => [
    { name: 'كشف', value: checkupRevenue || 0 },
    { name: 'إعادة', value: revisitRevenue || 0 },
    { name: 'جلسات', value: sessionRevenue || 0 },
    { name: 'أخرى', value: otherRevenue || 0 },
  ].filter(d => d.value > 0), [transactions])

  // Laser financial computed values
  const laserRevenue = useMemo(() => transactions.filter(t => t.type === 'income' && (t.category === 'ليزر' || t.description?.includes('ليزر'))).reduce((s, t) => s + t.amount, 0), [transactions])
  const laserRevenueByArea = useMemo(() => {
    const areaMap: Record<string, number> = {}
    laserRecords.forEach(r => {
      const area = r.bodyArea || 'غير محدد'
      const patientName = patients.find(p => p.id === r.patientId)?.name || ''
      const areaTxns = transactions.filter(t => t.type === 'income' && (t.category === 'ليزر' || t.description?.includes('ليزر')) && t.description?.includes(patientName))
      areaMap[area] = (areaMap[area] || 0) + areaTxns.reduce((s, t) => s + t.amount, 0)
    })
    return Object.entries(areaMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
  }, [transactions, laserRecords, patients])
  const laserRevenueByPackage = useMemo(() => {
    const pkgMap: Record<string, number> = {}
    laserPackages.forEach(pkg => {
      const areaTxns = transactions.filter(t => t.type === 'income' && (t.category === 'ليزر' || t.description?.includes('ليزر')) && t.description?.includes(pkg.bodyArea || pkg.name))
      pkgMap[pkg.name] = areaTxns.reduce((s, t) => s + t.amount, 0)
    })
    return Object.entries(pkgMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
  }, [transactions, laserPackages])

  // Smart search
  const smartSearchResults = useMemo(() => {
    if (!smartSearchQuery.trim()) return []
    const q = smartSearchQuery.toLowerCase()
    const r: { type: string; label: string; sub: string; id: string; icon: React.ReactNode }[] = []
    patients.forEach(p => { if (p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)) r.push({ type: 'patient', label: p.name, sub: `${p.fileNumber} | ${p.phone || ''}`, id: p.id, icon: <Users size={16} className="text-blue-500" /> }) })
    services.forEach(s => { if (s.name.toLowerCase().includes(q)) r.push({ type: 'service', label: s.name, sub: formatCurrency(s.price), id: s.id, icon: <Activity size={16} className="text-orange-500" /> }) })
    return r.slice(0, 20)
  }, [smartSearchQuery, patients, services])
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSmartSearchOpen(true) } if (e.key === 'Escape') setSmartSearchOpen(false) }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [])

  // ─── AI Chat ──────────────────────────────────────────────────────────
  const sendAiMessage = async () => {
    if (!aiInput.trim()) return; const msg = aiInput; setAiInput(''); setAiMessages(prev => [...prev, { role: 'user', content: msg }]); setAiLoading(true)
    // Check for navigation commands
    const navCommands: Record<string, { tab: string; subTab?: string; action?: string }> = {
      'عرض المرضى': { tab: 'patients' }, 'المرضى': { tab: 'patients' },
      'إضافة مريض': { tab: 'patients', action: 'addPatient' }, 'مريض جديد': { tab: 'patients', action: 'addPatient' },
      'الرئيسية': { tab: 'dashboard' }, 'لوحة التحكم': { tab: 'dashboard' },
      'الليزر': { tab: 'laser' }, 'سجل ليزر': { tab: 'laser' },
      'المالية': { tab: 'finance' }, 'التقارير': { tab: 'more', subTab: 'reports' },
      'المزيد': { tab: 'more' }, 'الخدمات': { tab: 'more', subTab: 'services' },
      'الإعدادات': { tab: 'more', subTab: 'settings' }, 'النسخ': { tab: 'more', subTab: 'backup' },
      'التذكيرات': { tab: 'more', subTab: 'reminders' }, 'المخزون': { tab: 'more', subTab: 'inventory' },
      'الأدوية': { tab: 'more', subTab: 'medications' }, 'الزيارات': { tab: 'more', subTab: 'visits' },
      'الحجز': { tab: 'more', subTab: 'bookings' }, 'المواعيد': { tab: 'more', subTab: 'bookings' },
      'قوالب العلاج': { tab: 'more', subTab: 'templates' }, 'قائمة الانتظار': { tab: 'more', subTab: 'waiting' },
    }
    const lowerMsg = msg.trim()
    const navTarget = navCommands[lowerMsg]
    // Check for data questions
    const dataQuestions: Record<string, string> = {
      'كم عدد المرضى اليوم': `عدد زيارات اليوم: ${todayVisits.length} زيارة`,
      'كم عدد المرضى': `إجمالي المرضى: ${patients.length} مريض`,
      'كم الإيرادات اليوم': `إيراد اليوم: ${formatCurrency(todayIncome)}`,
      'كم عدد الجلسات': `إجمالي الجلسات: ${sessions.length} جلسة`,
      'كم غير المدفوع': `إجمالي غير المدفوع: ${formatCurrency(unpaidTotal)}`,
      'كم عدد الموظفين': `عدد الأطباء المشاركين: ${doctors.length}`,
    }
    if (navTarget) {
      setActiveTab(navTarget.tab)
      if (navTarget.subTab) setMoreSubTab(navTarget.subTab)
      if (navTarget.action === 'addPatient') setShowAddPatient(true)
      setAiChatOpen(false)
      setAiMessages(prev => [...prev, { role: 'assistant', content: `✅ تم الانتقال إلى ${lowerMsg}` }])
      setAiLoading(false)
      return
    }
    if (dataQuestions[lowerMsg]) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: dataQuestions[lowerMsg] }])
      setAiLoading(false)
      return
    }
    try { const res = await apiFetch<{message: string}>('/ai/chat', { method: 'POST', body: JSON.stringify({ messages: [...aiMessages, { role: 'user', content: msg }] }) }); setAiMessages(prev => [...prev, { role: 'assistant', content: res.message || 'عذراً، لم أتمكن من الرد.' }]) } catch { setAiMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ.' }]) }
    setAiLoading(false)
  }

  // ─── Backup Functions ─────────────────────────────────────────────────
  const createBackup = async () => { try { await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'manual' }) }); setLastBackup(new Date().toISOString()); toast.success('تم إنشاء نسخة احتياطية'); loadAllData() } catch { toast.error('فشل إنشاء النسخة') } }
  const exportBackup = async (format: string) => {
    try {
      const data = { patients, visits, sessions, services, transactions, appointments, laserRecords, laserPackages, inventoryItems, medications, reminders, notes, exportDate: new Date().toISOString() }
      let content: string; let filename: string; let mimeType: string
      if (format === 'csv') { const headers = Object.keys(patients[0] || {}).join(','); const rows = patients.map(p => Object.values(p).join(',')).join('\n'); content = headers + '\n' + rows; filename = `elmoghazi-${todayStr}.csv`; mimeType = 'text/csv' }
      else { content = JSON.stringify(data, null, 2); filename = `elmoghazi-${todayStr}.json`; mimeType = 'application/json' }
      const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); toast.success(`تم تصدير النسخة ${format.toUpperCase()}`)
    } catch { toast.error('فشل التصدير') }
  }
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    try { const text = await file.text(); if (file.name.endsWith('.json')) { const data = JSON.parse(text); if (data?.patients) for (const p of data.patients) await addItem('/patients', p, setPatients); toast.success(`تم استيراد ${file.name}`) } else { toast.error('صيغة غير مدعومة') } } catch { toast.error('فشل الاستيراد') }
    e.target.value = ''
  }

  // ─── Handle Smart Patient Registration ────────────────────────────────
  const handleSmartPatientSubmit = async () => {
    if (!newPatientName.trim()) return toast.error('الاسم مطلوب')
    // Create patient
    const patient = await addItem('/patients', { name: newPatientName, phone: newPatientPhone, age: parseInt(newPatientAge) || null, gender: newPatientGender || null, address: newPatientAddress, notes: newPatientNotes }, setPatients)
    if (!patient) return

    const patientId = patient.id
    const now = new Date().toISOString()
    const vPrice = parseFloat(visitPrice) || 0
    const sPrice = parseFloat(customServicePrice) || 0

    // Determine visit and session needs based on selected type (including combos)
    const needsVisit = ['checkup', 'revisit', 'checkup_session', 'revisit_session'].includes(selectedVisitType)
    const needsSession = ['session', 'checkup_session', 'revisit_session'].includes(selectedVisitType)
    const visitType = selectedVisitType === 'checkup_session' ? 'checkup' : selectedVisitType === 'revisit_session' ? 'revisit' : selectedVisitType
    const visitCategory = visitType === 'checkup' ? 'كشف' : 'إعادة'

    // Create visit if needed + financial transaction for كشف/إعادة
    if (needsVisit && (visitType === 'checkup' || visitType === 'revisit')) {
      await addItem('/visits', { patientId, type: visitType, date: now }, setVisits)
      // Auto-create income transaction for كشف/إعادة
      if (vPrice > 0) {
        await addItem('/finance/transactions', { type: 'income', category: visitCategory, amount: vPrice, description: `${visitCategory} - ${newPatientName}`, date: now }, setTransactions)
      }
    }

    // Create sessions for selected services - use custom price entered by user
    if (needsSession && selectedServiceIds.length > 0) {
      for (const serviceId of selectedServiceIds) {
        await addItem('/sessions', { patientId, serviceId, status: 'scheduled', price: sPrice, paid: false, date: now }, setSessions)
      }
      // Auto-create income transaction for sessions
      if (sPrice > 0) {
        const svcNames = selectedServiceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')
        await addItem('/finance/transactions', { type: 'income', category: 'جلسات', amount: sPrice, description: `${svcNames || 'جلسة'} - ${newPatientName}`, date: now }, setTransactions)
      }
    }

    // Reset form
    setNewPatientName(''); setNewPatientPhone(''); setNewPatientAddress(''); setNewPatientAge(''); setNewPatientGender(''); setNewPatientNotes(''); setSelectedVisitType(''); setSelectedServiceIds([]); setCustomServicePrice(''); setVisitPrice(''); setShowAddPatient(false)
    toast.success(`تم تسجيل المريض ${newPatientName} بنجاح`)
  }

  // Services grouped by category for smart form (must be before early return - Rules of Hooks)
  const servicesByCategory = useMemo(() => {
    const cats: Record<string, Service[]> = {}
    services.filter(s => s.active).forEach(s => { const cat = s.category || 'عام'; if (!cats[cat]) cats[cat] = []; cats[cat].push(s) })
    return cats
  }, [services])

  // ─── Quick Notes helper - Professional Animated ────────────────────
  const renderQuickNotes = (section: string) => {
    const sectionNotesList = notes.filter(n => n.section === section)
    const noteColors = [
      'from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-300 dark:border-rose-700',
      'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-700',
      'from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700',
      'from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700',
      'from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-300 dark:border-violet-700',
      'from-cyan-100 to-sky-100 dark:from-cyan-900/20 dark:to-sky-900/20 border-cyan-300 dark:border-cyan-700',
    ]
    const noteEmojis = ['📝', '💡', '📌', '🔔', '⭐', '💬']
    return (
      <Card className="card-luxury mt-4 border-2 border-indigo-200 dark:border-indigo-800" key={`notes-${section}`}>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}><FileText size={14} className="text-indigo-500" /></motion.div> ملاحظات محترفة</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="✏️ أضف ملاحظة سريعة..." className="input-luxury rounded-xl h-9 text-sm border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-400" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section, createdAt: new Date().toISOString() }, setNotes); setQuickNote('') } }} />
            <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md" onClick={() => { if (quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section, createdAt: new Date().toISOString() }, setNotes); setQuickNote('') } }}><Plus size={16} /></motion.button>
          </div>
          <div className="space-y-1.5">
          {sectionNotesList.slice(0, 8).map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={cn('flex items-start gap-2 p-2.5 rounded-xl border bg-gradient-to-l transition-all hover:shadow-md', noteColors[i % noteColors.length])}>
              <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} className="text-sm">{noteEmojis[i % noteEmojis.length]}</motion.span>
              <p className="flex-1 text-xs font-medium">{n.content}</p>
              <span className="text-[9px] text-muted-foreground whitespace-nowrap">{formatDate(n.createdAt)}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteItem('/notes', n.id, setNotes)}><Trash2 size={10} className="text-red-400" /></Button>
            </motion.div>
          ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // ─── Role-based access control ────────────────────────────────────────
  const isDoctor = userRole === 'doctor'
  const allowedTabs = isDoctor ? ['dashboard', 'patients', 'laser', 'finance', 'more', 'settings'] : ['patients', 'laser']
  const handleTabSwitch = (tab: string) => {
    if (!allowedTabs.includes(tab)) {
      toast.error('هذا القسم غير متاح للسكرتيرة'); return
    }
    setActiveTab(tab)
    if (tab === 'patients') setSelectedPatient(null)
  }
  const verifyPassword = () => {
    // Password verification is now server-side only
    toast.error('يرجى تسجيل الخروج وإعادة الدخول')
  }

  // ─── Doctor financial calculations ────────────────────────────────────
  const doctorEarnings = useMemo(() => {
    return doctors.map(d => {
      const checkupEarn = checkupRevenue * (d.checkupPercentage / 100)
      const revisitEarn = revisitRevenue * (d.revisitPercentage / 100)
      const laserEarn = sessionRevenue * (d.laserPercentage / 100)
      const sessionEarn = sessionRevenue * (d.sessionPercentage / 100)
      const total = checkupEarn + revisitEarn + laserEarn + sessionEarn + d.fixedAmount
      return { ...d, checkupEarn, revisitEarn, laserEarn, sessionEarn, totalEarn: total }
    })
  }, [doctors, checkupRevenue, revisitRevenue, sessionRevenue])

  // ─── Bottom Nav ───────────────────────────────────────────────────────
  const allNavItems = [
    { id: 'dashboard', label: 'الرئيسية', emoji: '🏠', icon: <LayoutDashboard size={20} />, activeColor: 'from-emerald-400 to-teal-500', activeShadow: 'shadow-emerald-500/40', labelColor: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'patients', label: 'المرضى', emoji: '👥', icon: <Users size={20} />, activeColor: 'from-blue-400 to-indigo-500', activeShadow: 'shadow-blue-500/40', labelColor: 'text-blue-600 dark:text-blue-400' },
    { id: 'laser', label: 'الليزر', emoji: '💎', icon: <Zap size={20} />, activeColor: 'from-cyan-400 to-violet-500', activeShadow: 'shadow-cyan-500/40', labelColor: 'text-cyan-600 dark:text-cyan-400' },
    { id: 'finance', label: 'المالية', emoji: '💰', icon: <DollarSign size={20} />, activeColor: 'from-amber-400 to-orange-500', activeShadow: 'shadow-amber-500/40', labelColor: 'text-amber-600 dark:text-amber-400' },
    { id: 'more', label: 'المزيد', emoji: '📋', icon: <MoreHorizontal size={20} />, activeColor: 'from-rose-400 to-pink-500', activeShadow: 'shadow-rose-500/40', labelColor: 'text-rose-600 dark:text-rose-400' },
  ]
  const bottomNavItems = isDoctor ? allNavItems : allNavItems.filter(i => i.id === 'patients' || i.id === 'laser').map(i => i.id === 'laser' ? { ...i, label: 'الجلسات', emoji: '⚡' } : i)

  // ─── LOGIN ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-20 right-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl animate-float" /><div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} /></div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md mx-4">
          <Card className="glass-heavy border-emerald-700/30 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center mb-4 shadow-lg glow-emerald"><Stethoscope className="text-amber-300" size={48} /></div>
              <h1 className="text-3xl font-bold text-gradient-luxury">Elmoghazi Clinic</h1>
              <p className="text-emerald-200/80 mt-1">عيادة المغازى للجلدية والتجميل</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {!loginRole ? (
                <div className="space-y-3">
                  <p className="text-emerald-200 text-center text-sm font-bold mb-2">اختر دورك للدخول</p>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLoginRole('doctor')} className="w-full p-4 rounded-2xl border-2 border-amber-400/30 bg-gradient-to-l from-amber-900/30 to-emerald-900/30 hover:from-amber-900/50 hover:to-emerald-900/50 transition-all flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg"><Stethoscope className="text-white" size={28} /></div>
                    <div className="text-right"><p className="text-white font-bold text-lg">طبيب</p><p className="text-emerald-200/60 text-xs">دخول كامل لجميع الأقسام</p></div>
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLoginRole('secretary')} className="w-full p-4 rounded-2xl border-2 border-cyan-400/30 bg-gradient-to-l from-cyan-900/30 to-emerald-900/30 hover:from-cyan-900/50 hover:to-emerald-900/50 transition-all flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shadow-lg"><Users size={28} className="text-white" /></div>
                    <div className="text-right"><p className="text-white font-bold text-lg">سكرتيرة</p><p className="text-emerald-200/60 text-xs">المرضى والجلسات فقط</p></div>
                  </motion.button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-600/20">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', loginRole === 'doctor' ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-gradient-to-br from-cyan-500 to-cyan-700')}>
                      {loginRole === 'doctor' ? <Stethoscope className="text-white" size={18} /> : <Users size={18} className="text-white" />}
                    </div>
                    <div><p className="text-white font-bold text-sm">{loginRole === 'doctor' ? 'طبيب' : 'سكرتيرة'}</p><p className="text-emerald-200/60 text-[10px]">{loginRole === 'doctor' ? 'دخول كامل' : 'المرضى والجلسات فقط'}</p></div>
                    <button onClick={() => { setLoginRole(null); setLoginPassword('') }} className="mr-auto text-emerald-200/60 hover:text-white text-xs">تغيير</button>
                  </div>
                  <div><Label className="text-emerald-200">كلمة المرور</Label><Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="أدخل كلمة السر..." className="bg-emerald-900/50 border-emerald-600/30 text-white input-luxury rounded-xl h-12 text-center text-lg" onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus /></div>
                </motion.div>
              )}
            </CardContent>
            {loginRole && (
              <CardFooter><Button onClick={handleLogin} disabled={loginLoading || !loginPassword} className="w-full bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-6 text-lg btn-luxury rounded-xl shadow-lg">{loginLoading ? <RefreshCw className="animate-spin ml-2" size={20} /> : <Sparkles className="ml-2" size={20} />}دخول</Button></CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Top Bar ──────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 sticky top-0 z-30">
        <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center"><Stethoscope className="text-amber-300" size={16} /></div><span className="font-bold text-sm text-gradient-luxury hidden sm:block">Elmoghazi</span></div>
        <button onClick={() => setSmartSearchOpen(true)} className="flex-1 max-w-md flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground text-sm hover:bg-muted transition-colors cursor-pointer"><Search size={16} /><span>بحث ذكي...</span><kbd className="mr-auto text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border hidden sm:block">Ctrl+K</kbd></button>
        <div className="flex items-center gap-1 mr-auto">
          <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={() => setAiChatOpen(true)}><Bot size={16} /></Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={loadAllData}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9"><Avatar className="h-8 w-8 border-2 border-primary/30"><AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{user?.name?.charAt(0) || 'د'}</AvatarFallback></Avatar></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleTabSwitch('settings')}><Settings size={14} className="ml-2" /> الإعدادات</DropdownMenuItem><DropdownMenuItem onClick={() => { logout(); toast.success('تم تسجيل الخروج') }} className="text-red-500"><LogOut size={14} className="ml-2" /> خروج</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </header>

      {/* ─── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 md:px-6 pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>

            {/* ═══ DASHBOARD ═══ */}
            {activeTab === 'dashboard' && (
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3"><motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">🏥</motion.div><div><h1 className="text-2xl font-bold">لوحة التحكم</h1><p className="text-muted-foreground text-sm">مرحباً، {safeName(user?.name)}</p></div></div>
                    <Badge className="badge-gold text-sm">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Badge>
                  </div>
                </div>
                {/* Quick Actions - AT TOP */}
                <Card className="card-luxury border-2 border-emerald-200 dark:border-emerald-800"><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}>⚡</motion.span> إجراءات سريعة</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[
                    { label: 'مريض جديد', icon: <UserPlus size={22} />, color: 'bg-gradient-to-br from-blue-500 to-blue-700', action: () => setShowAddPatient(true) },
                    { label: 'سجل ليزر', icon: <Zap size={22} />, color: 'bg-gradient-to-br from-cyan-500 to-cyan-700', action: () => setShowAddLaserRecord(true) },
                    { label: 'معاملة', icon: <DollarSign size={22} />, color: 'bg-gradient-to-br from-amber-500 to-amber-700', action: () => setShowAddTransaction(true) },
                    { label: 'موعد', icon: <Calendar size={22} />, color: 'bg-gradient-to-br from-purple-500 to-purple-700', action: () => setShowAddAppointment(true) },
                    { label: 'مساعد ذكي', icon: <Bot size={22} />, color: 'bg-gradient-to-br from-emerald-500 to-emerald-700', action: () => setAiChatOpen(true) },
                    { label: 'بحث ذكي', icon: <Search size={22} />, color: 'bg-gradient-to-br from-indigo-500 to-indigo-700', action: () => setSmartSearchOpen(true) },
                  ].map((a, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08, y: -2 }} onClick={a.action} className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted/50 transition-all group"><motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, delay: i * 0.2 }} className={cn('p-3.5 rounded-2xl text-white shadow-xl group-hover:shadow-2xl transition-shadow', a.color)}>{a.icon}</motion.div><span className="text-[11px] font-bold">{a.label}</span></motion.button>
                  ))}
                </div></CardContent></Card>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '👥', label: 'إجمالي المرضى', value: patients.length, sub: `+${patients.filter(p => p.createdAt?.startsWith(todayStr)).length} اليوم`, gradient: 'from-blue-500 to-blue-700', anim: { scale: [1, 1.15, 1] } },
                    { icon: '🩺', label: 'زيارات اليوم', value: todayVisits.length, sub: `${todayVisits.filter(v => v.type === 'checkup').length} كشف`, gradient: 'from-emerald-500 to-emerald-700', anim: { rotate: [0, 10, -10, 0] } },
                    { icon: '💰', label: 'إيراد اليوم', value: formatCurrency(todayIncome), sub: `${transactions.filter(t => t.type === 'income').length} معاملة`, gradient: 'from-amber-500 to-amber-700', anim: { scale: [1, 1.2, 1] } },
                    { icon: '📅', label: 'مواعيد اليوم', value: todayAppointments.length, sub: `${appointments.filter(a => a.status === 'scheduled').length} مجدول`, gradient: 'from-purple-500 to-purple-700', anim: { y: [0, -5, 0] } },
                    { icon: '⚡', label: 'جلسات اليوم', value: sessions.filter(s => s.date?.startsWith(todayStr)).length, sub: `${sessions.filter(s => !s.paid).length} غير مدفوعة`, gradient: 'from-violet-500 to-violet-700', anim: { rotate: [0, 15, -15, 0] } },
                    { icon: '💎', label: 'سجلات الليزر', value: laserRecords.filter(r => r.status === 'active').length, sub: `${new Set(laserRecords.map(r => r.patientId)).size} مريض`, gradient: 'from-cyan-500 to-cyan-700', anim: { scale: [1, 1.1, 1] } },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring' }} className={cn('relative overflow-hidden rounded-2xl p-5 text-white shadow-xl bg-gradient-to-br', s.gradient)}>
                      <motion.div animate={s.anim} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-5xl mb-2 drop-shadow-lg">{s.icon}</motion.div>
                      <p className="text-sm font-medium text-white/80">{s.label}</p>
                      <p className="text-2xl font-black mt-1">{s.value}</p>
                      {s.sub && <p className="text-xs text-white/60 mt-1">{s.sub}</p>}
                      <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    </motion.div>
                  ))}
                </div>
                {/* ═══ End-of-Day Summary ═══ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Card className="card-luxury border-2 border-amber-300 dark:border-amber-700 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-l from-amber-50/50 via-orange-50/30 to-yellow-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20 pointer-events-none" />
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>📊</motion.span>
                          ملخص نهاية اليوم
                        </span>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow">
                          <Download size={14} /> طباعة الملخص
                        </motion.button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      {(() => {
                        const todayCheckupRev = transactions.filter(t => t.type === 'income' && t.category === 'كشف' && t.date?.startsWith(todayStr)).reduce((s, t) => s + t.amount, 0)
                        const todayRevisitRev = transactions.filter(t => t.type === 'income' && t.category === 'إعادة' && t.date?.startsWith(todayStr)).reduce((s, t) => s + t.amount, 0)
                        const todaySessionRev = transactions.filter(t => t.type === 'income' && t.category === 'جلسات' && t.date?.startsWith(todayStr)).reduce((s, t) => s + t.amount, 0)
                        const todayUnpaid = sessions.filter(s => !s.paid && s.date?.startsWith(todayStr)).reduce((s, ses) => s + ses.price, 0)
                        const todaySessionsCompleted = sessions.filter(s => s.status === 'completed' && s.date?.startsWith(todayStr)).length
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <motion.div whileHover={{ scale: 1.03 }} className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
                              <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl mb-1">👥</motion.div>
                              <p className="text-xs text-white/70">إجمالي المرضى اليوم</p>
                              <p className="text-2xl font-black">{todayVisits.length}</p>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
                              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} className="text-2xl mb-1">💰</motion.div>
                              <p className="text-xs text-white/70">إجمالي الإيرادات</p>
                              <p className="text-xl font-black">{formatCurrency(todayIncome)}</p>
                              <div className="mt-1.5 space-y-0.5">
                                <p className="text-[9px] text-white/60">🩺 كشف: {formatCurrency(todayCheckupRev)}</p>
                                <p className="text-[9px] text-white/60">🔄 إعادة: {formatCurrency(todayRevisitRev)}</p>
                                <p className="text-[9px] text-white/60">⚡ جلسات: {formatCurrency(todaySessionRev)}</p>
                              </div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg">
                              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-2xl mb-1">⚡</motion.div>
                              <p className="text-xs text-white/70">جلسات مكتملة</p>
                              <p className="text-2xl font-black">{todaySessionsCompleted}</p>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg">
                              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }} className="text-2xl mb-1">⚠️</motion.div>
                              <p className="text-xs text-white/70">مبالغ غير مدفوعة</p>
                              <p className="text-xl font-black">{formatCurrency(todayUnpaid)}</p>
                            </motion.div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="card-luxury lg:col-span-2"><CardHeader><CardTitle className="text-lg">الإيرادات والمصروفات</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={260}><BarChart data={revenueChartData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><RechartsTooltip /><Bar dataKey="إيراد" fill="#047857" radius={[4,4,0,0]} /><Bar dataKey="مصروف" fill="#D4A843" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></CardContent></Card>
                  <Card className="card-luxury"><CardHeader><CardTitle className="text-lg">توزيع المرضى</CardTitle></CardHeader><CardContent className="flex items-center justify-center"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{genderData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></CardContent></Card>
                </div>
                {renderQuickNotes('dashboard')}
              </div>
            )}

            {/* ═══ PATIENTS ═══ */}
            {activeTab === 'patients' && !selectedPatient && (
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-blue-50 dark:bg-blue-950/30">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">👥</motion.div><div><h1 className="text-2xl font-bold">إدارة المرضى</h1><p className="text-muted-foreground text-sm">{patients.length} مريض</p></div></div>
                    <Button className="btn-luxury bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-lg" onClick={() => setShowAddPatient(true)}><UserPlus size={16} className="ml-2" /> تسجيل مريض</Button>
                  </div>
                </div>
                {/* Search + Filter Buttons */}
                <div className="space-y-2">
                  <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input placeholder="بحث بالاسم أو الهاتف أو رقم الملف..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10 input-luxury rounded-xl h-12" /></div>
                  <div className="flex items-center gap-2">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPatientFilter(patientFilter === 'starred' ? 'all' : 'starred')} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2', patientFilter === 'starred' ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-950/20')}><Star size={16} className={patientFilter === 'starred' ? 'text-amber-500 fill-amber-500' : ''} /> ⭐ الحالات المميزة</motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPatientFilter(patientFilter === 'improved' ? 'all' : 'improved')} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2', patientFilter === 'improved' ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-400 dark:border-pink-600 text-pink-700 dark:text-pink-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-pink-50 dark:hover:bg-pink-950/20')}><Heart size={16} className={patientFilter === 'improved' ? 'text-pink-500 fill-pink-500' : ''} /> 💗 المتحسنين</motion.button>
                    {patientFilter !== 'all' && <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPatientFilter('all')}>إلغاء الفلتر</Button>}
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredPatients.length === 0 && <Card className="card-luxury p-8 text-center"><p className="text-muted-foreground">{patientFilter === 'starred' ? 'لا توجد حالات مميزة بعد' : patientFilter === 'improved' ? 'لا توجد حالات متحسنة بعد' : 'لا توجد نتائج'}</p></Card>}
                  {filteredPatients.map(p => (
                    <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="section-card p-4 cursor-pointer" onClick={() => setSelectedPatient(p)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2" style={{ borderColor: p.colorTag || (p.gender === 'female' ? '#ec4899' : '#3b82f6') }}><AvatarFallback className="bg-blue-500/10 text-blue-600 font-bold">{p.name?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="font-bold truncate">{safeName(p.name)}</p>{p.starred && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>⭐</motion.span>}{p.improved && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2, delay: 0.5 }}>💗</motion.span>}</div><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Hash size={10} />{p.fileNumber}</span>{p.phone && <span className="flex items-center gap-1"><Phone size={10} />{p.phone}</span>}{p.age && <span>{p.age} سنة</span>}</div></div>
                        <Badge className={cn('text-[10px]', p.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400')}>{p.gender === 'male' ? 'ذكر' : 'أنثى'}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {renderQuickNotes('patients')}
              </div>
            )}

            {/* ═══ PATIENT DETAIL - DEDICATED PROFILE ═══ */}
            {activeTab === 'patients' && selectedPatient && (
              <div className="space-y-4">
                <motion.button initial={{ x: -10 }} animate={{ x: 0 }} onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 text-primary text-sm font-bold hover:underline"><ChevronDown size={16} className="rotate-90" /> العودة للقائمة</motion.button>

                {/* Patient Header Card - Modern Redesign */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-violet-950/40 border-2 border-blue-200 dark:border-blue-800 shadow-xl">
                  {/* Decorative animated shapes */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200/30 dark:bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-violet-200/30 dark:bg-violet-500/10 rounded-full translate-x-1/4 translate-y-1/4 animate-float" style={{ animationDelay: '3s' }} />
                  <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-emerald-200/20 dark:bg-emerald-500/10 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
                  
                  <div className="relative z-10 p-5">
                    <div className="flex items-start gap-4">
                      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="relative">
                        <Avatar className="h-24 w-24 border-4 shadow-xl" style={{ borderColor: selectedPatient.colorTag || '#3b82f6' }}><AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold">{selectedPatient.name?.charAt(0)}</AvatarFallback></Avatar>
                        {selectedPatient.starred && <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }} className="absolute -top-1 -right-1 text-xl">⭐</motion.span>}
                        {selectedPatient.improved && <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 3, delay: 0.5 }} className="absolute -bottom-1 -right-1 text-xl">💗</motion.span>}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-black bg-gradient-to-l from-blue-700 to-indigo-700 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">{safeName(selectedPatient.name)}</h2>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg font-bold text-blue-700 dark:text-blue-300"><Hash size={12} />{selectedPatient.fileNumber}</span>
                          {selectedPatient.phone && <span className="flex items-center gap-1"><Phone size={12} />{selectedPatient.phone}</span>}
                          {selectedPatient.age && <span className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-lg text-amber-700 dark:text-amber-300">{selectedPatient.age} سنة</span>}
                          {selectedPatient.gender && <Badge className={cn('text-[9px] font-bold', selectedPatient.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300')}>{selectedPatient.gender === 'male' ? '♂ ذكر' : '♀ أنثى'}</Badge>}
                        </div>
                      </div>
                    </div>
                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setEditingPatient(!editingPatient); if (!editingPatient) setEditPatientForm({ name: selectedPatient.name, phone: selectedPatient.phone || '', phone2: selectedPatient.phone2 || '', age: String(selectedPatient.age || ''), gender: selectedPatient.gender || '', address: selectedPatient.address || '', bloodType: selectedPatient.bloodType || '', medicalHistory: selectedPatient.medicalHistory || '', notes: selectedPatient.notes || '' }) }} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2', editingPatient ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-blue-50')}><Edit3 size={16} className="text-blue-500" /> {editingPatient ? 'إلغاء التعديل' : 'تعديل البيانات'}</motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setDeletePatientConfirmOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"><Trash2 size={16} /> حذف المريض</motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ starred: !selectedPatient.starred }) }); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, starred: !p.starred } : p)); setSelectedPatient({ ...selectedPatient, starred: !selectedPatient.starred }); toast.success(selectedPatient.starred ? 'تم إزالة العلامة الذهبية' : 'تم إضافة العلامة الذهبية ⭐') } catch { toast.error('خطأ') } }} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2', selectedPatient.starred ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-amber-50')}><Star size={16} className={selectedPatient.starred ? 'text-amber-500 fill-amber-500' : ''} /> {selectedPatient.starred ? '⭐ مميز' : 'تمييز'}</motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ improved: !selectedPatient.improved }) }); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, improved: !p.improved } : p)); setSelectedPatient({ ...selectedPatient, improved: !selectedPatient.improved }); toast.success(selectedPatient.improved ? 'تم إزالة علامة التحسن' : 'تم تسجيل التحسن 💗') } catch { toast.error('خطأ') } }} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2', selectedPatient.improved ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-400 text-pink-700 dark:text-pink-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-pink-50')}><Heart size={16} className={selectedPatient.improved ? 'text-pink-500 fill-pink-500' : ''} /> {selectedPatient.improved ? '💗 متحسن' : 'تحسن'}</motion.button>
                      {selectedPatient.phone && <motion.button whileTap={{ scale: 0.9 }} onClick={() => window.open(`https://wa.me/${selectedPatient.phone?.replace(/[^0-9]/g, '')}`, '_blank')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-green-100 dark:bg-green-900/30 border-2 border-green-400 text-green-700 dark:text-green-300 hover:bg-green-200 shadow-sm"><Send size={14} /> واتساب</motion.button>}
                      {selectedPatient.phone2 && <motion.button whileTap={{ scale: 0.9 }} onClick={() => window.open(`https://wa.me/${selectedPatient.phone2?.replace(/[^0-9]/g, '')}`, '_blank')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-green-50 dark:bg-green-900/20 border-2 border-green-300 text-green-600 dark:text-green-400 hover:bg-green-100"><Send size={14} /> واتساب 2</motion.button>}
                    </div>
                    {/* Edit Patient Form */}
                    {editingPatient && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 space-y-3">
                        <h4 className="font-bold text-sm flex items-center gap-2"><Edit3 size={14} className="text-blue-500" /> تعديل بيانات المريض</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label className="text-xs font-bold">الاسم</Label><Input value={editPatientForm.name} onChange={e => setEditPatientForm(prev => ({ ...prev, name: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                          <div><Label className="text-xs font-bold">الهاتف</Label><Input value={editPatientForm.phone} onChange={e => setEditPatientForm(prev => ({ ...prev, phone: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                          <div><Label className="text-xs font-bold">هاتف آخر</Label><Input value={editPatientForm.phone2} onChange={e => setEditPatientForm(prev => ({ ...prev, phone2: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                          <div><Label className="text-xs font-bold">العمر</Label><Input type="number" value={editPatientForm.age} onChange={e => setEditPatientForm(prev => ({ ...prev, age: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                          <div><Label className="text-xs font-bold">الجنس</Label><Select value={editPatientForm.gender} onValueChange={v => setEditPatientForm(prev => ({ ...prev, gender: v }))}><SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">ذكر</SelectItem><SelectItem value="female">أنثى</SelectItem></SelectContent></Select></div>
                          <div><Label className="text-xs font-bold">فصيلة الدم</Label><Input value={editPatientForm.bloodType} onChange={e => setEditPatientForm(prev => ({ ...prev, bloodType: e.target.value }))} placeholder="A+, O-, ..." className="input-luxury rounded-xl h-10 mt-1" /></div>
                        </div>
                        <div><Label className="text-xs font-bold">العنوان</Label><Input value={editPatientForm.address} onChange={e => setEditPatientForm(prev => ({ ...prev, address: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                        <div><Label className="text-xs font-bold">التاريخ المرضي</Label><Textarea value={editPatientForm.medicalHistory} onChange={e => setEditPatientForm(prev => ({ ...prev, medicalHistory: e.target.value }))} className="input-luxury rounded-xl mt-1 min-h-[50px]" /></div>
                        <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={editPatientForm.notes} onChange={e => setEditPatientForm(prev => ({ ...prev, notes: e.target.value }))} className="input-luxury rounded-xl mt-1 min-h-[50px]" /></div>
                        <div className="flex gap-2"><Button className="btn-luxury rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white" onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ name: editPatientForm.name, phone: editPatientForm.phone || null, phone2: editPatientForm.phone2 || null, age: parseInt(editPatientForm.age) || null, gender: editPatientForm.gender || null, address: editPatientForm.address || null, bloodType: editPatientForm.bloodType || null, medicalHistory: editPatientForm.medicalHistory || null, notes: editPatientForm.notes || null }) }); const updated = { ...selectedPatient, name: editPatientForm.name, phone: editPatientForm.phone || undefined, phone2: editPatientForm.phone2 || undefined, age: parseInt(editPatientForm.age) || undefined, gender: editPatientForm.gender || undefined, address: editPatientForm.address || undefined, bloodType: editPatientForm.bloodType || undefined, medicalHistory: editPatientForm.medicalHistory || undefined, notes: editPatientForm.notes || undefined }; setSelectedPatient(updated); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updated : p)); setEditingPatient(false); toast.success('تم تحديث بيانات المريض') } catch { toast.error('خطأ في التحديث') } }}>حفظ التعديلات</Button><Button variant="ghost" onClick={() => setEditingPatient(false)}>إلغاء</Button></div>
                      </motion.div>
                    )}
                    {/* Color Tag Selector */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground font-bold">لون الحالة:</span>
                      {['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#6366f1'].map(c => (
                        <button key={c} onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ colorTag: c }) }); const updatedPatient = { ...selectedPatient, colorTag: c }; setSelectedPatient(updatedPatient); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p)); toast.success('تم تغيير اللون') } catch { toast.error('خطأ في تغيير اللون') } }} className={cn('w-7 h-7 rounded-full border-2 transition-all hover:scale-125 cursor-pointer', selectedPatient.colorTag === c ? 'border-foreground scale-125 shadow-lg ring-2 ring-foreground/30' : 'border-transparent')} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Patient Detail Tabs - Enhanced */}
                {/* Edit/Delete Patient Buttons */}
                <div className="flex gap-2 mb-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => { if (selectedPatient) { setEditPatientForm({ name: selectedPatient.name, phone: selectedPatient.phone || '', phone2: selectedPatient.phone2 || '', age: String(selectedPatient.age || ''), gender: selectedPatient.gender || '', address: selectedPatient.address || '', bloodType: selectedPatient.bloodType || '', medicalHistory: selectedPatient.medicalHistory || '', notes: selectedPatient.notes || '' }); setEditingPatient(true) } }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-200 shadow-sm"><Edit3 size={16} /> تعديل البيانات</motion.button>
                  <AlertDialog><AlertDialogTrigger asChild><motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-red-100 dark:bg-red-900/30 border-2 border-red-400 text-red-700 dark:text-red-300 hover:bg-red-200 shadow-sm"><Trash2 size={16} /> حذف المريض</motion.button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>حذف المريض</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف {selectedPatient?.name}؟ سيتم حذف جميع البيانات المرتبطة بما فيها السجلات المالية القديمة.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={async () => { if (!selectedPatient) return; try { const pName = selectedPatient.name; const pVisits = visits.filter(v => v.patientId === selectedPatient.id); const pSessions = sessions.filter(s => s.patientId === selectedPatient.id); for (const v of pVisits) { await apiFetch(`/visits/${v.id}`, { method: 'DELETE' }); } for (const s of pSessions) { await apiFetch(`/sessions/${s.id}`, { method: 'DELETE' }); } const relatedTx = transactions.filter(t => t.description?.includes(pName)); for (const tx of relatedTx) { await apiFetch(`/finance/transactions/${tx.id}`, { method: 'DELETE' }); } await apiFetch(`/patients/${selectedPatient.id}`, { method: 'DELETE' }); setPatients(prev => prev.filter(p => p.id !== selectedPatient.id)); setVisits(prev => prev.filter(v => v.patientId !== selectedPatient.id)); setSessions(prev => prev.filter(s => s.patientId !== selectedPatient.id)); setTransactions(prev => prev.filter(t => !t.description?.includes(pName))); setSelectedPatient(null); toast.success('تم حذف المريض وكل البيانات المرتبطة') } catch { toast.error('خطأ في الحذف') } }}>حذف نهائي</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                </div>

                {/* Inline Edit Patient Form */}
                {editingPatient && selectedPatient && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 space-y-3">
                    <h4 className="font-bold text-sm flex items-center gap-2"><Edit3 size={14} className="text-blue-500" /> تعديل بيانات المريض</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs font-bold">الاسم</Label><Input value={editPatientForm.name} onChange={e => setEditPatientForm(p => ({ ...p, name: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                      <div><Label className="text-xs font-bold">الهاتف</Label><Input value={editPatientForm.phone} onChange={e => setEditPatientForm(p => ({ ...p, phone: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                      <div><Label className="text-xs font-bold">هاتف 2</Label><Input value={editPatientForm.phone2} onChange={e => setEditPatientForm(p => ({ ...p, phone2: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                      <div><Label className="text-xs font-bold">العمر</Label><Input type="number" value={editPatientForm.age} onChange={e => setEditPatientForm(p => ({ ...p, age: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                      <div><Label className="text-xs font-bold">الجنس</Label><Select value={editPatientForm.gender} onValueChange={v => setEditPatientForm(p => ({ ...p, gender: v }))}><SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">ذكر</SelectItem><SelectItem value="female">أنثى</SelectItem></SelectContent></Select></div>
                      <div><Label className="text-xs font-bold">العنوان</Label><Input value={editPatientForm.address} onChange={e => setEditPatientForm(p => ({ ...p, address: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                      <div><Label className="text-xs font-bold">فصيلة الدم</Label><Select value={editPatientForm.bloodType} onValueChange={v => setEditPatientForm(p => ({ ...p, bloodType: v }))}><SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger><SelectContent>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                      <div><Label className="text-xs font-bold">التاريخ المرضي</Label><Input value={editPatientForm.medicalHistory} onChange={e => setEditPatientForm(p => ({ ...p, medicalHistory: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
                    </div>
                    <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={editPatientForm.notes} onChange={e => setEditPatientForm(p => ({ ...p, notes: e.target.value }))} className="input-luxury rounded-xl mt-1" rows={2} /></div>
                    <div className="flex gap-2"><Button className="btn-luxury rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white" onClick={async () => { try { await apiFetch(`/patients/${selectedPatient!.id}`, { method: 'PUT', body: JSON.stringify({ name: editPatientForm.name, phone: editPatientForm.phone || null, phone2: editPatientForm.phone2 || null, age: parseInt(editPatientForm.age) || null, gender: editPatientForm.gender || null, address: editPatientForm.address || null, bloodType: editPatientForm.bloodType || null, medicalHistory: editPatientForm.medicalHistory || null, notes: editPatientForm.notes || null }) }); const updated = { ...selectedPatient!, name: editPatientForm.name, phone: editPatientForm.phone || undefined, phone2: editPatientForm.phone2 || undefined, age: parseInt(editPatientForm.age) || undefined, gender: editPatientForm.gender || undefined, address: editPatientForm.address || undefined, bloodType: editPatientForm.bloodType || undefined, medicalHistory: editPatientForm.medicalHistory || undefined, notes: editPatientForm.notes || undefined }; setSelectedPatient(updated); setPatients(prev => prev.map(p => p.id === updated.id ? updated : p)); setEditingPatient(false); toast.success('تم تحديث البيانات') } catch { toast.error('خطأ في التحديث') } }}>حفظ</Button><Button variant="ghost" onClick={() => setEditingPatient(false)}>إلغاء</Button></div>
                  </motion.div>
                )}

                <Tabs value={patientDetailTab} onValueChange={setPatientDetailTab}>
                  <TabsList className="w-full flex flex-wrap gap-1"><TabsTrigger value="overview" className="flex-1 text-[10px] min-w-[60px]">📋 نظرة عامة</TabsTrigger><TabsTrigger value="visits" className="flex-1 text-[10px] min-w-[60px]">🩺 الزيارات</TabsTrigger><TabsTrigger value="sessions" className="flex-1 text-[10px] min-w-[60px]">⚡ الجلسات</TabsTrigger><TabsTrigger value="photos" className="flex-1 text-[10px] min-w-[60px]">📷 الصور</TabsTrigger><TabsTrigger value="laser" className="flex-1 text-[10px] min-w-[60px]">💎 الليزر</TabsTrigger><TabsTrigger value="finance" className="flex-1 text-[10px] min-w-[60px]">💰 المالية</TabsTrigger><TabsTrigger value="notes" className="flex-1 text-[10px] min-w-[60px]">📝 ملاحظات</TabsTrigger></TabsList>

                  {/* Overview Tab - No Allergies - ENHANCED TIMELINE */}
                  <TabsContent value="overview" className="space-y-3 mt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Card className="card-luxury border-2 border-blue-200 dark:border-blue-800"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Phone size={14} className="text-blue-500" /> بيانات الاتصال</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{selectedPatient.phone && <p className="flex items-center gap-2"><Phone size={12} className="text-blue-500" /><span className="text-muted-foreground">الهاتف:</span> <a href={`tel:${selectedPatient.phone}`} className="text-primary hover:underline font-bold">{selectedPatient.phone}</a></p>}{selectedPatient.phone2 && <p className="flex items-center gap-2"><Phone size={12} className="text-teal-500" /><span className="text-muted-foreground">هاتف آخر:</span> <a href={`tel:${selectedPatient.phone2}`} className="text-primary hover:underline">{selectedPatient.phone2}</a></p>}{selectedPatient.address && <p className="flex items-center gap-2"><MapPin size={12} className="text-indigo-500" /><span className="text-muted-foreground">العنوان:</span> {selectedPatient.address}</p>}{!selectedPatient.phone && !selectedPatient.phone2 && !selectedPatient.address && <p className="text-muted-foreground text-xs">لا توجد بيانات اتصال</p>}</CardContent></Card>
                      <Card className="card-luxury border-2 border-red-200 dark:border-red-800"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart size={14} className="text-red-500" /> بيانات طبية</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{selectedPatient.bloodType && <p><span className="text-muted-foreground">فصيلة الدم:</span> <Badge variant="outline" className="font-bold">{selectedPatient.bloodType}</Badge></p>}{selectedPatient.medicalHistory && <p><span className="text-muted-foreground">التاريخ المرضي:</span> {selectedPatient.medicalHistory}</p>}{selectedPatient.notes && <p><span className="text-muted-foreground">ملاحظات:</span> {selectedPatient.notes}</p>}{!selectedPatient.bloodType && !selectedPatient.medicalHistory && !selectedPatient.notes && <p className="text-muted-foreground text-xs">لا توجد بيانات طبية مسجلة</p>}</CardContent></Card>
                    </div>
                    {/* Quick Stats - Animated */}
                    <div className="grid grid-cols-4 gap-3">
                      <motion.div whileHover={{ scale: 1.03 }} className="section-card p-3 text-center border-2 border-blue-200 dark:border-blue-800 rounded-2xl cursor-pointer" onClick={() => setPatientDetailTab('visits')}><motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl mb-1">🩺</motion.div><p className="text-2xl font-black text-blue-600">{visits.filter(v => v.patientId === selectedPatient.id).length}</p><p className="text-[10px] text-muted-foreground font-bold">زيارة</p></motion.div>
                      <motion.div whileHover={{ scale: 1.03 }} className="section-card p-3 text-center border-2 border-violet-200 dark:border-violet-800 rounded-2xl cursor-pointer" onClick={() => setPatientDetailTab('sessions')}><motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} className="text-2xl mb-1">⚡</motion.div><p className="text-2xl font-black text-violet-600">{sessions.filter(s => s.patientId === selectedPatient.id).length}</p><p className="text-[10px] text-muted-foreground font-bold">جلسة</p></motion.div>
                      <motion.div whileHover={{ scale: 1.03 }} className="section-card p-3 text-center border-2 border-cyan-200 dark:border-cyan-800 rounded-2xl cursor-pointer" onClick={() => setPatientDetailTab('laser')}><motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} className="text-2xl mb-1">💎</motion.div><p className="text-2xl font-black text-cyan-600">{laserRecords.filter(l => l.patientId === selectedPatient.id).length}</p><p className="text-[10px] text-muted-foreground font-bold">سجل ليزر</p></motion.div>
                      <motion.div whileHover={{ scale: 1.03 }} className="section-card p-3 text-center border-2 border-amber-200 dark:border-amber-800 rounded-2xl cursor-pointer" onClick={() => setPatientDetailTab('notes')}><motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.9 }} className="text-2xl mb-1">📝</motion.div><p className="text-2xl font-black text-amber-600">{notes.filter(n => n.patientId === selectedPatient.id).length}</p><p className="text-[10px] text-muted-foreground font-bold">ملاحظة</p></motion.div>
                    </div>
                    {/* COMPREHENSIVE ACTIVITY TIMELINE */}
                    <Card className="card-luxury border-2 border-indigo-200 dark:border-indigo-800">
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity size={14} className="text-indigo-500" /> سجل كل العمليات</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {(() => {
                          const pVisits = visits.filter(v => v.patientId === selectedPatient.id).map(v => ({ id: v.id, type: 'visit' as const, date: v.date, icon: '🩺', label: VISIT_TYPES.find(t => t.id === v.type)?.label || v.type, detail: v.notes || v.diagnosis || '', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', canDelete: true, canEdit: false, deletePath: '/visits' }))
                          const pSessions = sessions.filter(s => s.patientId === selectedPatient.id).map(s => ({ id: s.id, type: 'session' as const, date: s.date, icon: '⚡', label: (services.find(sv => sv.id === s.serviceId)?.name || 'جلسة') + (s.paid ? ' ✅' : ' ⏳'), detail: `${formatCurrency(s.price)}${s.notes ? ' - ' + s.notes : ''}`, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300', canDelete: true, canEdit: false, deletePath: '/sessions' }))
                          const pNotes = notes.filter(n => n.patientId === selectedPatient.id).map(n => ({ id: n.id, type: 'note' as const, date: n.createdAt, icon: '📝', label: 'ملاحظة', detail: n.content, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', canDelete: true, canEdit: true, deletePath: '/notes' }))
                          const timeline = [...pVisits, ...pSessions, ...pNotes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          if (timeline.length === 0) return <div className="text-center py-6"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">📋</motion.div><p className="text-muted-foreground text-sm">لا توجد عمليات مسجلة بعد</p></div>
                          return timeline.map(item => (
                            <div key={`${item.type}-${item.id}`} className={cn('flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-md', item.color.split(' ')[0])}>
                              <span className="text-lg mt-0.5">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2"><Badge className={cn('text-[9px]', item.color)}>{item.label}</Badge><span className="text-[10px] text-muted-foreground">{formatDate(item.date)}</span></div>
                                {item.detail && <p className="text-xs mt-1 truncate">{item.detail}</p>}
                              </div>
                              <div className="flex gap-1">
                                {item.canEdit && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingNoteId(item.id); setEditingNoteContent(item.detail) }}><Edit3 size={10} className="text-blue-500" /></Button>}
                                {item.canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { deleteItem(item.deletePath, item.id, item.type === 'visit' ? setVisits : item.type === 'session' ? setSessions : setNotes) }}><Trash2 size={10} className="text-red-500" /></Button>}
                              </div>
                            </div>
                          ))
                        })()}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Visits Tab - With Add Visit + Price */}
                  <TabsContent value="visits" className="space-y-3 mt-3">
                    <div className="flex items-center justify-between"><h3 className="font-bold flex items-center gap-2"><Stethoscope size={16} className="text-violet-500" /> سجل الزيارات</h3><div className="flex gap-2"><Badge variant="outline">{visits.filter(v => v.patientId === selectedPatient.id).length} زيارة</Badge><Button size="sm" className="btn-luxury rounded-xl bg-gradient-to-l from-violet-600 to-violet-700 text-white" onClick={() => setShowAddVisitProfile(true)}><Plus size={14} className="ml-1" /> زيارة</Button></div></div>
                    {/* Add Visit Inline Form */}
                    {showAddVisitProfile && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-2xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 space-y-3">
                        <h4 className="font-bold text-sm flex items-center gap-2"><Stethoscope size={14} className="text-violet-500" /> إضافة زيارة جديدة</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {VISIT_TYPES.slice(0, 3).map(vt => (
                            <motion.button key={vt.id} whileTap={{ scale: 0.95 }} onClick={() => setProfileVisitType(vt.id)} className={cn('flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-sm font-bold', profileVisitType === vt.id ? 'border-violet-500 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shadow-lg' : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-violet-50')}><span>{vt.emoji}</span>{vt.label}</motion.button>
                          ))}
                        </div>
                        <div><Label className="text-xs font-bold">قيمة {profileVisitType === 'checkup' ? 'الكشف' : profileVisitType === 'revisit' ? 'الإعادة' : 'الجلسة'} (ج.م)</Label><Input type="number" value={profileVisitPrice} onChange={e => setProfileVisitPrice(e.target.value)} placeholder="السعر بالجنيه..." className="input-luxury rounded-xl h-10 mt-1" /></div>
                        <div><Label className="text-xs font-bold">ملاحظات</Label><Input value={profileVisitNotes} onChange={e => setProfileVisitNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-10 mt-1" /></div>
                        <div className="flex gap-2"><Button className="btn-luxury rounded-xl bg-gradient-to-l from-violet-600 to-violet-700 text-white" onClick={async () => { const now = new Date().toISOString(); await addItem('/visits', { patientId: selectedPatient.id, type: profileVisitType, notes: profileVisitNotes || undefined, date: now }, setVisits); const vPrice = parseFloat(profileVisitPrice) || 0; if (vPrice > 0) { const cat = profileVisitType === 'checkup' ? 'كشف' : 'إعادة'; await addItem('/finance/transactions', { type: 'income', category: cat, amount: vPrice, description: `${cat} - ${selectedPatient.name}`, date: now }, setTransactions); } setShowAddVisitProfile(false); setProfileVisitPrice(''); setProfileVisitNotes(''); toast.success('تم إضافة الزيارة') }}>حفظ</Button><Button variant="ghost" onClick={() => setShowAddVisitProfile(false)}>إلغاء</Button></div>
                      </motion.div>
                    )}
                    {visits.filter(v => v.patientId === selectedPatient.id).length === 0 && !showAddVisitProfile && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">🩺</motion.div><p className="text-muted-foreground">لا توجد زيارات مسجلة</p></Card>}
                    {visits.filter(v => v.patientId === selectedPatient.id).map(v => {
                      const vt = VISIT_TYPES.find(t => t.id === v.type)
                      return <Card key={v.id} className="section-card p-3 border-2 border-transparent hover:border-violet-200 dark:hover:border-violet-800 transition-all">
                        {editingVisitId === v.id ? (
                          <div className="space-y-2 p-2 rounded-xl bg-violet-50 dark:bg-violet-950/20 border-2 border-violet-300">
                            <div className="grid grid-cols-2 gap-2">
                              <Select value={editVisitForm.type} onValueChange={val => setEditVisitForm(f => ({ ...f, type: val }))}><SelectTrigger className="rounded-xl h-9"><SelectValue /></SelectTrigger><SelectContent>{VISIT_TYPES.slice(0,3).map(vt => <SelectItem key={vt.id} value={vt.id}>{vt.emoji} {vt.label}</SelectItem>)}</SelectContent></Select>
                              <Input value={editVisitForm.notes} onChange={e => setEditVisitForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات..." className="input-luxury rounded-xl h-9" />
                            </div>
                            <div><Label className="text-xs">السعر (ج.م)</Label><Input type="number" value={editVisitForm.price} onChange={e => setEditVisitForm(f => ({ ...f, price: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
                            <div className="flex gap-2"><Button size="sm" className="rounded-xl bg-violet-600 text-white" onClick={async () => { try { await apiFetch(`/visits/${v.id}`, { method: 'PUT', body: JSON.stringify({ type: editVisitForm.type, notes: editVisitForm.notes || undefined }) }); const oldCat = v.type === 'checkup' ? 'كشف' : 'إعادة'; const newCat = editVisitForm.type === 'checkup' ? 'كشف' : 'إعادة'; const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === oldCat); if (relatedTx) { const newPrice = parseFloat(editVisitForm.price) || relatedTx.amount; await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'PUT', body: JSON.stringify({ category: newCat, amount: newPrice, description: `${newCat} - ${selectedPatient!.name}` }) }); setTransactions(prev => prev.map(t => t.id === relatedTx.id ? { ...t, category: newCat, amount: newPrice, description: `${newCat} - ${selectedPatient!.name}` } : t)); } setVisits(prev => prev.map(vv => vv.id === v.id ? { ...vv, type: editVisitForm.type, notes: editVisitForm.notes || undefined } : vv)); setEditingVisitId(null); toast.success('تم تعديل الزيارة') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" onClick={() => setEditingVisitId(null)}>إلغاء</Button></div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-2.5 rounded-xl text-white shadow-md', vt?.bg || 'bg-gray-500')}>{vt?.emoji || '📝'}</div><div><div className="flex items-center gap-2"><Badge className={cn('text-white text-[9px]', vt?.bg || 'bg-gray-500')}>{vt?.label || v.type}</Badge>{v.diagnosis && <span className="text-sm font-medium">{v.diagnosis}</span>}</div>{v.notes && <p className="text-xs text-muted-foreground mt-0.5">{v.notes}</p>}</div></div><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{formatDate(v.date)}</span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingVisitId(v.id); setEditVisitForm({ type: v.type, notes: v.notes || '', price: String(transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === (v.type === 'checkup' ? 'كشف' : 'إعادة'))?.amount || '') }) }}><Edit3 size={10} className="text-violet-500" /></Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { const cat = v.type === 'checkup' ? 'كشف' : 'إعادة'; const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === cat); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/visits/${v.id}`, { method: 'DELETE' }); setVisits(prev => prev.filter(vv => vv.id !== v.id)); toast.success('تم حذف الزيارة') } catch { toast.error('خطأ') } }}><Trash2 size={10} className="text-red-500" /></Button></div></div>
                        )}
                      </Card>
                    })}
                  </TabsContent>

                  {/* Sessions Tab - With Add Session + Price → Finance */}
                  <TabsContent value="sessions" className="space-y-3 mt-3">
                    <div className="flex items-center justify-between"><h3 className="font-bold flex items-center gap-2"><Zap size={16} className="text-orange-500" /> سجل الجلسات</h3><div className="flex gap-2"><Badge variant="outline">{sessions.filter(s => s.patientId === selectedPatient.id).length} جلسة</Badge><Button size="sm" className="btn-luxury rounded-xl bg-gradient-to-l from-orange-500 to-orange-600 text-white" onClick={() => setShowAddSessionProfile(true)}><Plus size={14} className="ml-1" /> جلسة</Button></div></div>
                    {/* Add Session Inline Form */}
                    {showAddSessionProfile && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 space-y-3">
                        <h4 className="font-bold text-sm flex items-center gap-2"><Zap size={14} className="text-orange-500" /> إضافة جلسة جديدة</h4>
                        {services.length > 0 && <div><Label className="text-xs font-bold">الخدمة</Label><Select value={profileSessionServiceId} onValueChange={setProfileSessionServiceId}><SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue placeholder="اختر الخدمة..." /></SelectTrigger><SelectContent>{services.filter(s => s.active).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>}
                        <div><Label className="text-xs font-bold flex items-center gap-1"><DollarSign size={12} /> قيمة الجلسة (ج.م)</Label><Input type="number" value={profileSessionPrice} onChange={e => setProfileSessionPrice(e.target.value)} placeholder="السعر بالجنيه..." className="input-luxury rounded-xl h-10 mt-1 text-lg font-bold" /></div>
                        <div><Label className="text-xs font-bold">ملاحظات</Label><Input value={profileSessionNotes} onChange={e => setProfileSessionNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-10 mt-1" /></div>
                        <div className="flex gap-2"><Button className="btn-luxury rounded-xl bg-gradient-to-l from-orange-500 to-orange-600 text-white" onClick={async () => { const now = new Date().toISOString(); const sPrice = parseFloat(profileSessionPrice) || 0; await addItem('/sessions', { patientId: selectedPatient.id, serviceId: profileSessionServiceId || undefined, status: 'scheduled', price: sPrice, paid: false, notes: profileSessionNotes || undefined, date: now }, setSessions); if (sPrice > 0) { const svcName = services.find(sv => sv.id === profileSessionServiceId)?.name || 'جلسة'; await addItem('/finance/transactions', { type: 'income', category: 'جلسات', amount: sPrice, description: `${svcName} - ${selectedPatient.name}`, date: now }, setTransactions); } setShowAddSessionProfile(false); setProfileSessionServiceId(''); setProfileSessionPrice(''); setProfileSessionNotes(''); toast.success('تم إضافة الجلسة') }}>حفظ</Button><Button variant="ghost" onClick={() => setShowAddSessionProfile(false)}>إلغاء</Button></div>
                      </motion.div>
                    )}
                    {sessions.filter(s => s.patientId === selectedPatient.id).length === 0 && !showAddSessionProfile && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">⚡</motion.div><p className="text-muted-foreground">لا توجد جلسات مسجلة</p></Card>}
                    {sessions.filter(s => s.patientId === selectedPatient.id).map(s => {
                      const svc = services.find(sv => sv.id === s.serviceId)
                      return <Card key={s.id} className="section-card p-3 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800 transition-all">
                        {editingSessionId === s.id ? (
                          <div className="space-y-2 p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300">
                            <div className="grid grid-cols-2 gap-2">
                              <div><Label className="text-xs">السعر (ج.م)</Label><Input type="number" value={editSessionForm.price} onChange={e => setEditSessionForm(f => ({ ...f, price: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
                              <div><Label className="text-xs">الحالة</Label><Select value={editSessionForm.status} onValueChange={val => setEditSessionForm(f => ({ ...f, status: val }))}><SelectTrigger className="rounded-xl h-9 mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">مجدولة</SelectItem><SelectItem value="completed">مكتملة</SelectItem><SelectItem value="cancelled">ملغاة</SelectItem></SelectContent></Select></div>
                            </div>
                            <Input value={editSessionForm.notes} onChange={e => setEditSessionForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات..." className="input-luxury rounded-xl h-9" />
                            <div className="flex gap-2"><Button size="sm" className="rounded-xl bg-orange-600 text-white" onClick={async () => { try { const newPrice = parseFloat(editSessionForm.price) || s.price; await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice, status: editSessionForm.status, notes: editSessionForm.notes || undefined }) }); const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === 'جلسات'); if (relatedTx && newPrice !== s.price) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'PUT', body: JSON.stringify({ amount: newPrice }) }); setTransactions(prev => prev.map(t => t.id === relatedTx.id ? { ...t, amount: newPrice } : t)); } setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, price: newPrice, status: editSessionForm.status, notes: editSessionForm.notes || undefined } : ss)); setEditingSessionId(null); toast.success('تم تعديل الجلسة') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" onClick={() => setEditingSessionId(null)}>إلغاء</Button></div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-2.5 rounded-xl shadow-sm', s.paid ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>{s.paid ? <CheckCircle className="text-emerald-600" size={16} /> : <Clock className="text-amber-600" size={16} />}</div><div><p className="font-bold text-sm">{svc?.name || 'جلسة'}</p><div className="flex items-center gap-2"><Badge style={{ backgroundColor: statusColors[s.status as keyof typeof statusColors] + '20', color: statusColors[s.status as keyof typeof statusColors] }} className="border text-[9px]">{s.status}</Badge>{s.paid ? <span className="text-[9px] text-emerald-600 font-bold">مدفوعة ✅</span> : <span className="text-[9px] text-amber-600 font-bold">غير مدفوعة ⏳</span>}</div>{s.notes && <p className="text-xs text-muted-foreground mt-0.5">{s.notes}</p>}</div></div><div className="flex items-center gap-2"><div className="text-left"><p className="font-black text-sm text-orange-600">{formatCurrency(s.price)}</p><p className="text-[10px] text-muted-foreground">{formatDate(s.date)}</p>{!s.paid && <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) }); setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss)); toast.success('تم تأكيد الدفع') } catch { toast.error('خطأ') } }} className="mt-1 px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[9px] font-bold shadow-md">تأكيد الدفع</motion.button>}</div><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingSessionId(s.id); setEditSessionForm({ price: String(s.price), notes: s.notes || '', status: s.status, paid: s.paid }) }}><Edit3 size={10} className="text-orange-500" /></Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === 'جلسات'); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/sessions/${s.id}`, { method: 'DELETE' }); setSessions(prev => prev.filter(ss => ss.id !== s.id)); toast.success('تم حذف الجلسة') } catch { toast.error('خطأ') } }}><Trash2 size={10} className="text-red-500" /></Button></div></div>
                        )}
                      </Card>
                    })}
                  </TabsContent>

                  {/* Photos Tab - New Section */}
                  <TabsContent value="photos" className="space-y-3 mt-3">
                    <div className="flex items-center justify-between"><h3 className="font-bold flex items-center gap-2"><Camera size={16} className="text-pink-500" /> صور المريض</h3><Badge variant="outline">{patientPhotos.length} صورة</Badge></div>
                    {/* Upload Photo */}
                    <Card className="card-luxury border-2 border-pink-200 dark:border-pink-800">
                      <CardContent className="p-4 space-y-3">
                        <h4 className="font-bold text-sm flex items-center gap-2"><Plus size={14} className="text-pink-500" /> إضافة صورة</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div><Label className="text-xs font-bold">النوع</Label><Select value={photoType} onValueChange={setPhotoType}><SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">📷 عام</SelectItem><SelectItem value="before">🔵 قبل</SelectItem><SelectItem value="after">🟢 بعد</SelectItem></SelectContent></Select></div>
                          <div><Label className="text-xs font-bold">الوصف</Label><Input value={photoDescription} onChange={e => setPhotoDescription(e.target.value)} placeholder="وصف الصورة..." className="input-luxury rounded-xl h-10 mt-1" /></div>
                        </div>
                        <div><Label className="text-xs font-bold">الصورة</Label><Input type="file" accept="image/*" className="input-luxury rounded-xl h-10 mt-1" onChange={async (e) => { const file = e.target.files?.[0]; if (!file || !selectedPatient) return; const reader = new FileReader(); reader.onload = async (ev) => { const base64 = ev.target?.result as string; try { await addItem('/photos', { patientId: selectedPatient.id, type: photoType, description: photoDescription || undefined, imageData: base64 }, setPatientPhotos); setPhotoDescription(''); toast.success('تم إضافة الصورة'); } catch { toast.error('خطأ في إضافة الصورة') } }; reader.readAsDataURL(file); e.target.value = '' }} /></div>
                      </CardContent>
                    </Card>
                    {/* Before & After Interactive Comparison Slider */}
                    {patientPhotos.filter(p => p.type === 'before').length > 0 && patientPhotos.filter(p => p.type === 'after').length > 0 && (() => {
                      const beforePhoto = patientPhotos.filter(p => p.type === 'before')[0]
                      const afterPhoto = patientPhotos.filter(p => p.type === 'after')[0]
                      const handleSliderMove = (clientX: number) => {
                        if (!sliderRef.current) return
                        const rect = sliderRef.current.getBoundingClientRect()
                        const x = clientX - rect.left
                        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
                        setSliderPos(pct)
                      }
                      return (
                        <Card className="card-luxury border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span className="flex items-center gap-2">🔄 مقارنة تفاعلية قبل وبعد</span>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">تحسن {Math.round(100 - sliderPos)}%</Badge>
                                <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-xl" onClick={() => {
                                  const canvas = document.createElement('canvas')
                                  const ctx = canvas.getContext('2d')
                                  if (!ctx) return
                                  const img1 = new Image(); const img2 = new Image()
                                  img1.crossOrigin = 'anonymous'; img2.crossOrigin = 'anonymous'
                                  img1.onload = () => { img2.onload = () => {
                                    canvas.width = img1.width + img2.width; canvas.height = Math.max(img1.height, img2.height)
                                    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height)
                                    ctx.drawImage(img1, 0, 0); ctx.drawImage(img2, img1.width, 0)
                                    ctx.font = 'bold 24px Arial'; ctx.fillStyle = '#3b82f6'; ctx.fillText('قبل', 20, 40)
                                    ctx.fillStyle = '#10b981'; ctx.fillText('بعد', img1.width + 20, 40)
                                    const link = document.createElement('a'); link.download = 'comparison.png'; link.href = canvas.toDataURL(); link.click()
                                    toast.success('تم تحميل المقارنة')
                                  }; img2.src = afterPhoto.imageData }
                                  img1.src = beforePhoto.imageData
                                }}><Download size={12} className="ml-1" /> تحميل</Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div ref={sliderRef} className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden cursor-ew-resize select-none border-2 border-emerald-200 dark:border-emerald-800"
                              onMouseDown={() => setIsDragging(true)}
                              onMouseMove={(e) => { if (isDragging) handleSliderMove(e.clientX) }}
                              onMouseUp={() => setIsDragging(false)}
                              onMouseLeave={() => setIsDragging(false)}
                              onTouchStart={() => setIsDragging(true)}
                              onTouchMove={(e) => { if (isDragging) handleSliderMove(e.touches[0].clientX) }}
                              onTouchEnd={() => setIsDragging(false)}
                            >
                              {/* After image (full width background) */}
                              <img src={afterPhoto.imageData} alt="بعد" className="absolute inset-0 w-full h-full object-cover" />
                              <Badge className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] z-20 shadow-lg">🟢 بعد</Badge>
                              {/* Before image (clipped) */}
                              <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                                <img src={beforePhoto.imageData} alt="قبل" className="absolute inset-0 w-full h-full object-cover" style={{ width: sliderRef.current ? `${sliderRef.current.offsetWidth}px` : '100%' }} />
                              </div>
                              <Badge className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] z-20 shadow-lg">🔵 قبل</Badge>
                              {/* Slider line */}
                              <div className="absolute top-0 bottom-0 z-10" style={{ left: `${sliderPos}%` }}>
                                <div className="w-1 h-full bg-white shadow-xl" />
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-2xl border-4 border-emerald-500 flex items-center justify-center">
                                  <span className="text-xs font-black text-emerald-600">⇔</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>🔵 قبل</span>
                              <span>اسحب للمقارنة ← →</span>
                              <span>🟢 بعد</span>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })()}
                    {/* All Photos Grid */}
                    {patientPhotos.length === 0 ? <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">📷</motion.div><p className="text-muted-foreground">لا توجد صور بعد</p></Card> : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {patientPhotos.map(p => (
                          <motion.div key={p.id} whileHover={{ scale: 1.02 }} className="relative rounded-xl overflow-hidden border-2 border-muted shadow-md group">
                            <img src={p.imageData} alt={p.description || 'صورة'} className="w-full h-32 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Badge className={cn('absolute top-1.5 right-1.5 text-[8px]', p.type === 'before' ? 'bg-blue-500 text-white' : p.type === 'after' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white')}>{p.type === 'before' ? '🔵 قبل' : p.type === 'after' ? '🟢 بعد' : '📷 عام'}</Badge>
                            {p.description && <p className="absolute bottom-1.5 right-1.5 left-1.5 text-[8px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">{p.description}</p>}
                            <Button variant="ghost" size="icon" className="absolute top-1.5 left-1.5 h-6 w-6 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" onClick={async () => { try { await apiFetch(`/photos/${p.id}`, { method: 'DELETE' }); setPatientPhotos(prev => prev.filter(pp => pp.id !== p.id)); toast.success('تم حذف الصورة') } catch { toast.error('خطأ') } }}><Trash2 size={10} /></Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Laser Tab */}
                  <TabsContent value="laser" className="space-y-3 mt-3">
                    <div className="flex items-center justify-between"><h3 className="font-bold flex items-center gap-2"><Zap size={16} className="text-cyan-500" /> سجلات الليزر</h3></div>
                    {laserRecords.filter(l => l.patientId === selectedPatient.id).length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">💎</motion.div><p className="text-muted-foreground">لا توجد سجلات ليزر</p></Card>}
                    {laserRecords.filter(l => l.patientId === selectedPatient.id).map(l => {
                      const laserSessCount = l.laserSessions?.length || 0
                      const completedCount = laserSessCount
                      const progressPercent = l.totalSessions > 0 ? Math.min((completedCount / l.totalSessions) * 100, 100) : 0
                      const areaInfo = BODY_AREAS.find(a => a.id === l.bodyArea || a.label === l.bodyArea)
                      return <Card key={l.id} className="section-card p-3 border-2 border-transparent hover:border-cyan-200 dark:hover:border-cyan-800 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2.5 rounded-xl text-lg shadow-sm', areaInfo?.color || 'bg-cyan-100 dark:bg-cyan-900/30')}>{areaInfo?.emoji || '💎'}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{areaInfo?.label || l.bodyArea}</span>
                              <Badge style={{ backgroundColor: statusColors[l.status as keyof typeof statusColors] + '20', color: statusColors[l.status as keyof typeof statusColors] }} className="text-[9px]">{l.status === 'active' ? 'نشط' : l.status === 'completed' ? 'مكتمل' : l.status}</Badge>
                              {l.paid ? <span className="text-[9px] text-emerald-600 font-bold">✅ مدفوع</span> : l.price > 0 && <span className="text-[9px] text-amber-600 font-bold">⏳ غير مدفوع</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {l.skinType && <span>بشرة {l.skinType}</span>}
                              {l.hairColor && <span>| شعر {l.hairColor}</span>}
                              {l.machineName && <span>| {l.machineName}</span>}
                            </div>
                            {l.price > 0 && <p className="text-xs font-bold text-emerald-600 mt-0.5">{formatCurrency(l.price)}/جلسة - إجمالي: {formatCurrency(l.totalPrice || l.price * l.totalSessions)}</p>}
                            <div className="mt-1"><div className="flex items-center justify-between text-[9px] mb-0.5"><span>{completedCount} من {l.totalSessions} جلسة</span><span>{Math.round(progressPercent)}%</span></div><Progress value={progressPercent} className="h-1.5" /></div>
                          </div>
                        </div>
                      </Card>
                    })}
                  </TabsContent>

                  {/* Finance Tab for this patient */}
                  <TabsContent value="finance" className="space-y-3 mt-3">
                    <h3 className="font-bold flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" /> الملخص المالي</h3>
                    {(() => {
                      const pSessions = sessions.filter(s => s.patientId === selectedPatient.id)
                      const totalPaid = pSessions.filter(s => s.paid).reduce((s, ses) => s + ses.price, 0)
                      const totalUnpaid = pSessions.filter(s => !s.paid).reduce((s, ses) => s + ses.price, 0)
                      const pTransactions = transactions.filter(t => t.description?.includes(selectedPatient.name))
                      const pIncome = pTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
                      return <div className="grid grid-cols-2 gap-3">
                        <motion.div whileHover={{ scale: 1.02 }} className="section-card p-3 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800"><p className="text-[10px] text-muted-foreground">إجمالي الإيرادات</p><p className="text-lg font-black text-emerald-600">{formatCurrency(pIncome)}</p></motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="section-card p-3 rounded-2xl border-2 border-blue-200 dark:border-blue-800"><p className="text-[10px] text-muted-foreground">صافي المدفوع</p><p className="text-lg font-black text-blue-600">{formatCurrency(totalPaid)}</p></motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="section-card p-3 rounded-2xl border-2 border-red-200 dark:border-red-800"><p className="text-[10px] text-muted-foreground">غير المدفوع</p><p className="text-lg font-black text-red-600">{formatCurrency(totalUnpaid)}</p></motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="section-card p-3 rounded-2xl border-2 border-violet-200 dark:border-violet-800"><p className="text-[10px] text-muted-foreground">عدد الجلسات</p><p className="text-lg font-black text-violet-600">{pSessions.length}</p></motion.div>
                      </div>
                    })()}
                    <div className="space-y-2">{transactions.filter(t => t.description?.includes(selectedPatient.name)).slice(0, 20).map(t => <Card key={t.id} className="section-card p-2"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={cn('p-1.5 rounded-lg', t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30')}><DollarSign className={t.type === 'income' ? 'text-emerald-600' : 'text-red-600'} size={12} /></div><div><p className="text-xs font-medium">{t.description || t.category}</p><p className="text-[9px] text-muted-foreground">{formatDate(t.date)}</p></div></div><span className={cn('text-xs font-bold', t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span></div></Card>)}</div>
                  </TabsContent>

                  {/* Notes Tab - Instant add/delete/edit */}
                  <TabsContent value="notes" className="space-y-3 mt-3">
                    <h3 className="font-bold flex items-center gap-2"><FileText size={16} className="text-purple-500" /> ملاحظات المريض</h3>
                    <div className="flex gap-2">
                      <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="أضف ملاحظة سريعة..." className="input-luxury rounded-xl h-10" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim() && selectedPatient) { const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: selectedPatient.id, section: 'patient' }, setNotes) } }} />
                      <Button className="rounded-xl bg-gradient-to-l from-purple-500 to-purple-600 text-white" onClick={() => { if (quickNote.trim() && selectedPatient) { const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: selectedPatient.id, section: 'patient' }, setNotes) } }}><Plus size={16} /></Button>
                    </div>
                    {notes.filter(n => n.patientId === selectedPatient.id).length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">📝</motion.div><p className="text-muted-foreground">لا توجد ملاحظات - أضف ملاحظة جديدة</p></Card>}
                    <div className="space-y-2">{notes.filter(n => n.patientId === selectedPatient.id).map(n => (
                      <Card key={n.id} className="section-card p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            {editingNoteId === n.id ? (
                              <div className="flex gap-2"><Input value={editingNoteContent} onChange={e => setEditingNoteContent(e.target.value)} className="input-luxury rounded-xl h-8 text-sm" autoFocus /><Button size="sm" className="rounded-lg h-8 bg-purple-600 text-white" onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent }) }); setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent } : nn)); setEditingNoteId(null); toast.success('تم التعديل') } catch { toast.error('خطأ في التعديل') } }}>حفظ</Button><Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingNoteId(null)}>✕</Button></div>
                            ) : <p className="text-sm">{n.content}</p>}
                            <p className="text-[9px] text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                          </div>
                          {editingNoteId !== n.id && <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingNoteId(n.id); setEditingNoteContent(n.content) }}><Edit3 size={10} className="text-blue-500" /></Button>
                            <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 size={10} className="text-red-500" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>حذف الملاحظة</AlertDialogTitle><AlertDialogDescription>هل تريد حذف هذه الملاحظة؟</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem('/notes', n.id, setNotes)}>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                          </div>}
                        </div>
                      </Card>
                    ))}</div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* ═══ LASER ═══ - Professional Laser Center Management */}
            {/* ═══ SESSIONS VIEW FOR SECRETARY ═══ */}
            {activeTab === 'laser' && !isDoctor && (
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-violet-50 dark:bg-violet-950/30">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3"><motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }} className="text-4xl">⚡</motion.div><div><h1 className="text-2xl font-bold">إدارة الجلسات</h1><p className="text-muted-foreground text-sm">متابعة وتسجيل الجلسات</p></div></div>
                    <Button className="btn-luxury bg-gradient-to-l from-violet-600 to-violet-700 text-white shadow-lg" onClick={() => setShowAddLaserRecord(true)}><Plus size={14} className="ml-1" /> جلسة جديدة</Button>
                  </div>
                </div>
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg"><Zap className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">إجمالي الجلسات</p><p className="text-xl font-bold">{sessions.length}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg"><CheckCircle className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">مدفوعة</p><p className="text-xl font-bold">{sessions.filter(s => s.paid).length}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg"><Clock className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">غير مدفوعة</p><p className="text-xl font-bold">{sessions.filter(s => !s.paid).length}</p></div></div></motion.div>
                </div>
                {/* All Sessions List */}
                <Card className="card-luxury border-2 border-violet-200 dark:border-violet-800">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap size={16} className="text-violet-500" /> سجل الجلسات</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {sessions.length === 0 && <div className="text-center py-8"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">⚡</motion.div><p className="text-muted-foreground">لا توجد جلسات مسجلة</p></div>}
                    {sessions.slice(0, 50).map(s => {
                      const p = patients.find(pt => pt.id === s.patientId)
                      const svc = services.find(sv => sv.id === s.serviceId)
                      return (
                        <div key={s.id} className={cn('flex items-center justify-between p-3 rounded-xl border transition-all', s.paid ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800')}>
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg text-white', s.paid ? 'bg-emerald-500' : 'bg-amber-500')}>
                              {s.paid ? <CheckCircle size={14} /> : <Clock size={14} />}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{p?.name || 'مريض'}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{svc?.name || s.notes || 'جلسة'}</span>
                                <span>{formatDate(s.date)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm">{formatCurrency(s.price)}</span>
                            {!s.paid && <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) }); setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss)); toast.success('تم تأكيد الدفع ✅') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold shadow-md">دفع</motion.button>}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══ LASER FOR DOCTOR ═══ */}
            {activeTab === 'laser' && isDoctor && (
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-cyan-50 dark:bg-cyan-950/30">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3"><motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }} className="text-4xl">💎</motion.div><div><h1 className="text-2xl font-bold">مركز الليزر</h1><p className="text-muted-foreground text-sm">إدارة شاملة لليزر إزالة الشعر</p></div></div>
                    <div className="flex gap-2">
                      <Button className="btn-luxury bg-gradient-to-l from-cyan-600 to-cyan-700 text-white shadow-lg" onClick={() => setShowAddLaserRecord(true)}><Plus size={14} className="ml-1" /> سجل جديد</Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => setShowAddLaserPackage(true)}><Package size={14} className="ml-1" /> باقة</Button>
                    </div>
                  </div>
                </div>

                {/* Laser Stats - 4 cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-lg"><Activity className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">سجلات نشطة</p><p className="text-xl font-bold">{laserRecords.filter(r => r.status === 'active').length}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg"><Zap className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">جلسات اليوم</p><p className="text-xl font-bold">{sessions.filter(s => s.date?.startsWith(todayStr) && services.find(sv => sv.id === s.serviceId)?.category?.includes('ليزر')).length}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg"><DollarSign className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">إيراد الليزر</p><p className="text-xl font-bold">{formatCurrency(laserPackages.reduce((s, p) => s + p.price, 0))}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg"><Package className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">باقات نشطة</p><p className="text-xl font-bold">{laserPackages.filter(p => p.active).length}</p></div></div></motion.div>
                </div>

                <Tabs value={laserSubTab} onValueChange={setLaserSubTab}>
                  <TabsList className="w-full flex flex-wrap"><TabsTrigger value="records" className="flex-1 text-xs min-w-[60px]">📋 السجلات</TabsTrigger><TabsTrigger value="sessions" className="flex-1 text-xs min-w-[60px]">⚡ الجلسات</TabsTrigger><TabsTrigger value="packages" className="flex-1 text-xs min-w-[60px]">📦 الباقات</TabsTrigger><TabsTrigger value="bodymap" className="flex-1 text-xs min-w-[60px]">🗺️ المناطق</TabsTrigger><TabsTrigger value="finance" className="flex-1 text-xs min-w-[60px]">💰 المالي</TabsTrigger><TabsTrigger value="settings" className="flex-1 text-xs min-w-[60px]">⚙️ الأجهزة</TabsTrigger></TabsList>

                  {/* Laser Records - Full CRUD */}
                  <TabsContent value="records" className="space-y-3 mt-4">
                    {laserRecords.length === 0 && <Card className="card-luxury p-8 text-center"><motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">💎</motion.div><p className="text-lg font-bold mb-1">لا توجد سجلات ليزر بعد</p><p className="text-muted-foreground text-sm mb-3">ابدأ بإضافة سجل جديد لمريض</p><Button className="btn-luxury rounded-xl bg-gradient-to-l from-cyan-600 to-cyan-700 text-white" onClick={() => setShowAddLaserRecord(true)}><Plus size={14} className="ml-1" /> إنشاء سجل</Button></Card>}
                    {laserRecords.map(r => {
                      const p = patients.find(pt => pt.id === r.patientId)
                      const areaInfo = BODY_AREAS.find(a => a.id === r.bodyArea || a.label === r.bodyArea)
                      const laserSessCount = r.laserSessions?.length || (r as any)._count?.laserSessions || 0
                      const progressPercent = r.totalSessions > 0 ? Math.min((laserSessCount / r.totalSessions) * 100, 100) : 0
                      return (
                        <Card key={r.id} className="section-card p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2.5 rounded-xl text-xl', areaInfo?.color || 'bg-cyan-100 dark:bg-cyan-900/30')}>{areaInfo?.emoji || '💎'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2"><p className="font-bold text-sm">{p?.name || 'مريض'}</p><Badge style={{ backgroundColor: statusColors[r.status as keyof typeof statusColors] + '20', color: statusColors[r.status as keyof typeof statusColors] }} className="text-[10px]">{r.status === 'active' ? 'نشط' : r.status === 'completed' ? 'مكتمل' : r.status}</Badge>{r.paid ? <span className="text-[9px] text-emerald-600 font-bold">✅</span> : r.price > 0 && <span className="text-[9px] text-amber-600 font-bold">⏳</span>}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{areaInfo?.label || r.bodyArea}</span>{r.skinType && <span>| بشرة {r.skinType}</span>}{r.hairColor && <span>| شعر {r.hairColor}</span>}{r.machineName && <span>| {r.machineName}</span>}</div>
                              {r.price > 0 && <p className="text-xs font-bold text-emerald-600 mt-0.5">{formatCurrency(r.price)}/جلسة - إجمالي: {formatCurrency(r.totalPrice || r.price * r.totalSessions)}</p>}
                              <div className="mt-2"><div className="flex items-center justify-between text-[10px] mb-1"><span>{laserSessCount} من {r.totalSessions} جلسة</span><span className="font-medium">{Math.round(progressPercent)}%</span></div><Progress value={progressPercent} className="h-2" /></div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7" onClick={() => deleteItem('/laser/records', r.id, setLaserRecords)}><Trash2 size={10} /></Button>
                              {p && <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7" onClick={() => { setSelectedPatient(p); setActiveTab('patients') }}><Eye size={10} /></Button>}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </TabsContent>

                  {/* Laser Sessions - Track individual sessions */}
                  <TabsContent value="sessions" className="space-y-3 mt-4">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Zap size={18} className="text-violet-500" /> جلسات الليزر</h3><Badge variant="outline">{sessions.length} جلسة</Badge></div>
                    {sessions.filter(s => services.find(sv => sv.id === s.serviceId)?.category?.includes('ليزر') || s.serviceId === undefined).length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">⚡</p><p className="text-muted-foreground">لا توجد جلسات ليزر مسجلة</p><p className="text-xs text-muted-foreground mt-1">سيتم إنشاء الجلسات تلقائياً عند تسجيل مريض بجلسات ليزر</p></Card>}
                    <div className="space-y-2">
                      {sessions.slice(0, 30).map(s => {
                        const p = patients.find(pt => pt.id === s.patientId)
                        const svc = services.find(sv => sv.id === s.serviceId)
                        return (
                          <Card key={s.id} className="section-card p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn('p-2 rounded-lg text-white', s.status === 'completed' ? 'bg-emerald-500' : s.status === 'scheduled' ? 'bg-blue-500' : s.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500')}>
                                  {s.status === 'completed' ? <CheckCircle size={14} /> : s.status === 'scheduled' ? <Calendar size={14} /> : <Clock size={14} />}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{p?.name || 'مريض'} - {svc?.name || 'جلسة ليزر'}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(s.date)} {s.paid ? '✅ مدفوعة' : '⏳ غير مدفوعة'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{formatCurrency(s.price)}</span>
                                {!s.paid && <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) }); setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss)); toast.success('تم تأكيد الدفع') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-200">دفع</motion.button>}
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>

                  {/* Laser Packages - Enhanced */}
                  <TabsContent value="packages" className="space-y-3 mt-4">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Package size={18} className="text-amber-500" /> باقات الليزر</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {laserPackages.length === 0 && <Card className="card-luxury p-6 text-center col-span-2"><p className="text-3xl mb-2">📦</p><p className="text-muted-foreground">لا توجد باقات ليزر</p><Button className="mt-3 btn-luxury rounded-xl" onClick={() => setShowAddLaserPackage(true)}><Plus size={14} className="ml-1" /> إنشاء باقة</Button></Card>}
                      {laserPackages.map(pkg => {
                        const pricePerSession = pkg.sessionsCount > 0 ? pkg.price / pkg.sessionsCount : 0
                        return (
                          <Card key={pkg.id} className={cn('section-card p-4', !pkg.active && 'opacity-50')}>
                            <div className="flex items-center justify-between mb-2"><h3 className="font-bold">{pkg.name}</h3><Badge className={pkg.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>{pkg.active ? 'نشط' : 'معطل'}</Badge></div>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-primary">{formatCurrency(pkg.price)}</p>
                              <p className="text-xs text-muted-foreground">{pkg.sessionsCount} جلسة{pkg.bodyArea ? ` - ${pkg.bodyArea}` : ''}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(pricePerSession)} / جلسة</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button variant="outline" size="sm" className="rounded-lg flex-1" onClick={() => deleteItem('/laser/packages', pkg.id, setLaserPackages)}><Trash2 size={12} className="ml-1" /> حذف</Button>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>

                  {/* Body Area Map - Interactive */}
                  <TabsContent value="bodymap" className="mt-4">
                    <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={18} /> مناطق الجسم - إزالة الشعر بالليزر</CardTitle><CardDescription>اضغط على أي منطقة لعرض سجلاتها</CardDescription></CardHeader><CardContent>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {BODY_AREAS.map(area => {
                          const count = laserRecords.filter(r => r.bodyArea === area.id || r.bodyArea === area.label).length
                          const areaRevenue = laserPackages.filter(p => p.bodyArea === area.label).reduce((s, p) => s + p.price, 0)
                          return (
                            <motion.button key={area.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className={cn('flex flex-col items-center gap-1 p-3 rounded-xl border transition-all relative', area.color, count > 0 ? 'ring-2 ring-primary/30' : 'border-dashed')}>
                              <span className="text-2xl">{area.emoji}</span>
                              <span className="text-xs font-medium">{area.label}</span>
                              {count > 0 && <Badge variant="secondary" className="text-[9px]">{count} سجل</Badge>}
                            </motion.button>
                          )
                        })}
                      </div>
                    </CardContent></Card>
                  </TabsContent>

                  {/* Laser Financial Summary - Full System */}
                  <TabsContent value="finance" className="space-y-4 mt-4">
                    {/* Laser Revenue from Transactions */}
                    {(() => { const laserTx = transactions.filter(t => t.type === 'income' && (t.category === 'ليزر' || t.description?.includes('ليزر') || t.description?.includes('Laser'))); const laserTotal = laserTx.reduce((s, t) => s + t.amount, 0); const laserUnpaid = sessions.filter(s => !s.paid && services.find(sv => sv.id === s.serviceId)?.category?.includes('laser')).reduce((s, ses) => s + ses.price, 0); const laserCompleted = sessions.filter(s => s.status === 'completed' && services.find(sv => sv.id === s.serviceId)?.category?.includes('laser')).length; return (<>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الليزر الفعلية</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(laserTotal)}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30"><Receipt className="text-amber-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">غير المدفوع ليزر</p><p className="text-lg font-bold text-amber-600">{formatCurrency(laserUnpaid)}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30"><ClipboardCheck className="text-blue-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">جلسات مكتملة</p><p className="text-lg font-bold text-blue-600">{laserCompleted}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30"><UsersRound className="text-violet-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">مرضى الليزر</p><p className="text-lg font-bold text-violet-600">{new Set(laserRecords.map(r => r.patientId)).size}</p></div></div></Card>
                    </div>
                    {/* Laser Revenue by Area */}
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin size={16} className="text-cyan-500" /> الإيرادات حسب المنطقة</CardTitle></CardHeader><CardContent>
                      <div className="space-y-2">{BODY_AREAS.map(area => { const areaRecords = laserRecords.filter(r => r.bodyArea === area.id || r.bodyArea === area.label); if (areaRecords.length === 0) return null; const areaPatients = areaRecords.map(r => r.patientId); const areaTx = laserTx.filter(t => areaPatients.some(pid => t.description?.includes(patients.find(p => p.id === pid)?.name || '___'))); const areaTotal = areaTx.reduce((s, t) => s + t.amount, 0); return <div key={area.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div className="flex items-center gap-2"><span>{area.emoji}</span><span className="text-sm font-medium">{area.label}</span><Badge variant="outline" className="text-[9px]">{areaRecords.length} سجل</Badge></div><span className="font-bold text-sm text-emerald-600">{formatCurrency(areaTotal)}</span></div> })}
                      </div>
                    </CardContent></Card>
                    {/* Laser Service Pricing */}
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Tag size={16} className="text-amber-500" /> أسعار خدمات الليزر</CardTitle></CardHeader><CardContent className="space-y-2">
                      {services.filter(s => s.category?.includes('laser') || s.name?.toLowerCase().includes('laser')).map(s => <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.duration ? `${s.duration} دقيقة` : ''}</p></div><div className="flex items-center gap-2"><Badge variant="outline" className="font-bold">{s.price} ج.م</Badge>{editingServiceId === s.id ? (<div className="flex items-center gap-1"><Input type="number" value={editingServicePrice} onChange={e => setEditingServicePrice(e.target.value)} className="w-20 h-7 text-xs rounded-lg" /><Button size="sm" className="h-7 rounded-lg text-[10px]" onClick={async () => { const newPrice = parseFloat(editingServicePrice) || 0; try { await apiFetch(`/services/${s.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice }) }); setServices(prev => prev.map(sv => sv.id === s.id ? { ...sv, price: newPrice } : sv)); toast.success('تم تحديث السعر') } catch { toast.error('خطأ') } setEditingServiceId(null) }}>حفظ</Button></div>) : <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingServiceId(s.id); setEditingServicePrice(String(s.price)) }}><Edit3 size={10} className="text-amber-500" /></Button>}</div></div>)}
                    </CardContent></Card>
                    {/* Register Laser Session */}
                    <Card className="card-luxury border-2 border-cyan-200 dark:border-cyan-800"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Plus size={16} className="text-cyan-500" /> تسجيل جلسة ليزر جديدة</CardTitle></CardHeader><CardContent className="space-y-3">
                      <Select value={laserFinancePatientId} onValueChange={setLaserFinancePatientId}><SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="اختار المريض..." /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.fileNumber})</SelectItem>)}</SelectContent></Select>
                      <div><Label className="text-xs font-bold flex items-center gap-1"><DollarSign size={12} /> قيمة الجلسة (ج.م)</Label><Input type="number" value={laserFinancePrice} onChange={e => setLaserFinancePrice(e.target.value)} placeholder="السعر بالجنيه..." className="input-luxury rounded-xl h-10 mt-1 text-lg font-bold" /></div>
                      <Input value={laserFinanceNotes} onChange={e => setLaserFinanceNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-10" />
                      <Button className="btn-luxury rounded-xl w-full bg-gradient-to-l from-cyan-600 to-cyan-700 text-white" onClick={async () => { if (!laserFinancePatientId || !laserFinancePrice) return toast.error('اختار المريض وحدد السعر'); const now = new Date().toISOString(); const price = parseFloat(laserFinancePrice) || 0; const pName = patients.find(p => p.id === laserFinancePatientId)?.name || 'مريض'; await addItem('/sessions', { patientId: laserFinancePatientId, status: 'scheduled', price, paid: false, notes: laserFinanceNotes || undefined, date: now }, setSessions); if (price > 0) { await addItem('/finance/transactions', { type: 'income', category: 'ليزر', amount: price, description: `جلسة ليزر - ${pName}`, date: now }, setTransactions); } setLaserFinancePatientId(''); setLaserFinancePrice(''); setLaserFinanceNotes(''); toast.success('تم تسجيل جلسة الليزر') }}>تسجيل الجلسة</Button>
                    </CardContent></Card>
                    {/* Unpaid Dues */}
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Receipt size={16} /> المبالغ المستحقة</CardTitle></CardHeader><CardContent className="space-y-2">
                      {sessions.filter(s => !s.paid).slice(0, 15).map(s => { const p = patients.find(pt => pt.id === s.patientId); const svc = services.find(sv => sv.id === s.serviceId); return <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"><div><p className="font-medium text-sm">{p?.name || 'مريض'}</p><p className="text-xs text-muted-foreground">{svc?.name || 'جلسة'}</p></div><div className="flex items-center gap-2"><span className="font-bold text-red-600">{formatCurrency(s.price)}</span><motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) }); setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss)); toast.success('تم الدفع') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold">تأكيد الدفع</motion.button></div></div> })}
                      {sessions.filter(s => !s.paid).length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد مبالغ مستحقة ✅</p>}
                    </CardContent></Card>
                    </>) })()}
                  </TabsContent>

                  {/* Machine Settings */}
                  <TabsContent value="settings" className="mt-4">
                    <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Settings size={18} /> إعدادات الأجهزة</CardTitle><CardDescription>إعدادات الطاقة والنبض لكل جهاز</CardDescription></CardHeader><CardContent>
                      {laserSettings.length === 0 ? <div className="text-center py-8"><motion.div animate={{ rotate: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="text-4xl mb-2 inline-block">⚙️</motion.div><p className="text-muted-foreground">لا توجد إعدادات أجهزة</p><p className="text-xs text-muted-foreground mt-1">أضف إعدادات من لوحة تحكم الأجهزة</p></div> :
                        <div className="space-y-2">{laserSettings.map(s => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30"><Wand2 className="text-cyan-600" size={16} /></div><div><p className="font-medium text-sm">{s.machineName}</p><p className="text-xs text-muted-foreground">{s.bodyArea}</p></div></div><div className="flex gap-2"><Badge variant="outline" className="text-[10px]">⚡ طاقة: {s.defaultEnergy || '-'}</Badge><Badge variant="outline" className="text-[10px]">📢 نبض: {s.defaultPulse || '-'}</Badge></div></div>)}</div>
                      }
                    </CardContent></Card>
                  </TabsContent>
                </Tabs>
                {renderQuickNotes('laser')}
              </div>
            )}

            {/* ═══ FINANCE ═══ */}
            {activeTab === 'finance' && (
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-amber-50 dark:bg-amber-950/30">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="text-4xl">💰</motion.div><div><h1 className="text-2xl font-bold">الإدارة المالية</h1><p className="text-muted-foreground text-sm">إيرادات ومصروفات العيادة</p></div></div>
                    <Button className="btn-luxury bg-gradient-to-l from-amber-500 to-amber-600 text-white shadow-lg" onClick={() => setShowAddTransaction(true)}><Plus size={14} className="ml-1" /> معاملة</Button>
                  </div>
                </div>
                {/* Main Financial Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">الإيرادات</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30"><TrendingUp className="text-red-600 rotate-180" size={20} /></div><div><p className="text-[11px] text-muted-foreground">المصروفات</p><p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30"><BarChart3 className="text-blue-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">صافي الربح</p><p className={cn('text-xl font-bold', netProfit >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(netProfit)}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30"><Receipt className="text-amber-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">غير المدفوع</p><p className="text-xl font-bold text-amber-600">{formatCurrency(unpaidTotal)}</p></div></div></Card>
                </div>
                {/* Revenue by Category */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Receipt size={16} className="text-amber-600" /> الإيرادات حسب النوع</CardTitle></CardHeader><CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🩺</span><span className="text-sm font-bold">كشف</span></div><span className="font-bold text-emerald-600">{formatCurrency(checkupRevenue)}</span></div>
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🔄</span><span className="text-sm font-bold">إعادة</span></div><span className="font-bold text-blue-600">{formatCurrency(revisitRevenue)}</span></div>
                    <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">⚡</span><span className="text-sm font-bold">جلسات</span></div><span className="font-bold text-violet-600">{formatCurrency(sessionRevenue)}</span></div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">📊</span><span className="text-sm font-bold">أخرى</span></div><span className="font-bold text-gray-600">{formatCurrency(otherRevenue)}</span></div>
                  </div>
                  {/* Revenue Category Pie Chart */}
                  {revenueByCategory.length > 0 && <div className="mt-4"><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></div>}
                </CardContent></Card>
                {/* Period Summary */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar size={16} className="text-purple-600" /> ملخص الفترات</CardTitle></CardHeader><CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center"><p className="text-[9px] text-muted-foreground">اليوم</p><p className="text-sm font-bold text-emerald-600">{formatCurrency(todayIncome)}</p></div>
                    <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-center"><p className="text-[9px] text-muted-foreground">الأسبوع</p><p className="text-sm font-bold text-violet-600">{formatCurrency(thisWeekIncome)}</p></div>
                    <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-center"><p className="text-[9px] text-muted-foreground">الشهر</p><p className="text-sm font-bold text-teal-600">{formatCurrency(thisMonthIncome)}</p></div>
                  </div>
                </CardContent></Card>
                {/* Recent Transactions */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><DollarSign size={16} className="text-emerald-600" /> آخر المعاملات</CardTitle></CardHeader><CardContent className="space-y-2">
                  {transactions.slice(0, 20).map(t => <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div className="flex items-center gap-2"><div className={cn('p-1.5 rounded-lg', t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30')}><DollarSign className={t.type === 'income' ? 'text-emerald-600' : 'text-red-600'} size={12} /></div><div><p className="text-xs font-medium">{t.description || t.category}</p><div className="flex items-center gap-2"><Badge variant="outline" className="text-[8px]">{t.category}</Badge><span className="text-[9px] text-muted-foreground">{formatDate(t.date)}</span></div></div></div><span className={cn('text-sm font-bold', t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span></div>)}
                  {transactions.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد معاملات بعد</p>}
                </CardContent></Card>
                {renderQuickNotes('finance')}
              </div>
            )}

            {/* ═══ MORE ═══ - ALL SUB-TABS WORKING */}
            {activeTab === 'more' && (
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-pink-50 dark:bg-pink-950/30">
                  <div className="relative z-10 flex items-center gap-3"><motion.div animate={{ rotate: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">📋</motion.div><div><h1 className="text-2xl font-bold">المزيد</h1><p className="text-muted-foreground text-sm">خدمات وأدوات إضافية</p></div></div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[
                    { id: 'services', label: 'الخدمات', emoji: '⚙️', gradient: 'from-teal-500 to-teal-700' },
                    { id: 'visits', label: 'الزيارات', emoji: '🩺', gradient: 'from-violet-500 to-violet-700' },
                    { id: 'doctors', label: 'الأطباء المشاركون', emoji: '👨‍⚕️', gradient: 'from-emerald-500 to-emerald-700' },
                    { id: 'inventory', label: 'المخزون', emoji: '📦', gradient: 'from-amber-500 to-amber-700' },
                    { id: 'bookings', label: 'الحجز', emoji: '📅', gradient: 'from-sky-500 to-sky-700' },
                    { id: 'medications', label: 'الأدوية', emoji: '💊', gradient: 'from-green-500 to-green-700' },
                    { id: 'reminders', label: 'التذكيرات', emoji: '⏰', gradient: 'from-rose-500 to-rose-700' },
                    { id: 'templates', label: 'قوالب العلاج', emoji: '📋', gradient: 'from-lime-500 to-lime-700' },
                    { id: 'waiting', label: 'قائمة الانتظار', emoji: '⏳', gradient: 'from-red-500 to-red-700' },
                    { id: 'reports', label: 'التقارير', emoji: '📊', gradient: 'from-cyan-500 to-cyan-700' },
                    { id: 'backup', label: 'النسخ', emoji: '💾', gradient: 'from-slate-500 to-slate-700' },
                    { id: 'notes', label: 'الملاحظات', emoji: '📝', gradient: 'from-fuchsia-500 to-fuchsia-700' },
                    { id: 'settings', label: 'الإعدادات', emoji: '🎨', gradient: 'from-indigo-500 to-indigo-700' },
                  ].map(s => (
                    <motion.button key={s.id} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} onClick={() => setMoreSubTab(s.id)} className={cn('flex flex-col items-center gap-1 p-3 rounded-xl transition-all border', moreSubTab === s.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-transparent hover:bg-muted/50')}>
                      <motion.div animate={moreSubTab === s.id ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.5, repeat: moreSubTab === s.id ? 2 : 0 }} className="text-2xl">{s.emoji}</motion.div>
                      <span className="text-[11px] font-medium">{s.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Services Sub-tab - Enhanced with Price Editing */}
                {moreSubTab === 'services' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Tag size={18} className="text-teal-500" /> الخدمات</h3><div className="flex items-center gap-2"><Badge variant="outline">{services.length} خدمة</Badge><Button className="btn-luxury rounded-xl bg-gradient-to-l from-teal-600 to-teal-700 text-white" onClick={() => setShowAddService(true)}><Plus size={14} className="ml-1" /> خدمة جديدة</Button></div></div>
                  {services.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">⚙️</p><p className="text-muted-foreground">لا توجد خدمات بعد</p></Card>}
                  {Object.entries(servicesByCategory).map(([cat, svcs]) => <Card key={cat} className="card-luxury"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Tag size={14} className="text-teal-500" /> {cat} <Badge variant="secondary" className="text-[9px]">{svcs.length}</Badge></CardTitle></CardHeader><CardContent className="space-y-2">{svcs.map(s => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-transparent hover:border-primary/20 transition-all"><div className="flex items-center gap-3"><div className={cn('w-2 h-8 rounded-full', s.active ? 'bg-emerald-500' : 'bg-red-400')} /><div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.duration ? `${s.duration} دقيقة` : 'بدون مدة محددة'}</p></div></div><div className="flex items-center gap-2">{editingServiceId === s.id ? (<div className="flex items-center gap-1 bg-white dark:bg-muted/50 p-1.5 rounded-lg border-2 border-teal-300 dark:border-teal-700 shadow-md"><Input type="number" value={editingServicePrice} onChange={e => setEditingServicePrice(e.target.value)} className="w-24 h-8 text-sm rounded-lg font-bold" autoFocus onKeyDown={e => { if (e.key === 'Enter') { const newPrice = parseFloat(editingServicePrice); if (isNaN(newPrice)) { toast.error('أدخل سعر صحيح'); return }; (async () => { try { await apiFetch(`/services/${s.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice }) }); setServices(prev => prev.map(sv => sv.id === s.id ? { ...sv, price: newPrice } : sv)); toast.success('تم تحديث السعر ✓'); setEditingServiceId(null) } catch (e: any) { toast.error(e?.message || 'خطأ في تحديث السعر'); setEditingServiceId(null) } })() } if (e.key === 'Escape') setEditingServiceId(null) }} /><Button size="sm" className="h-8 rounded-lg text-xs bg-teal-600 text-white" onClick={async () => { const newPrice = parseFloat(editingServicePrice); if (isNaN(newPrice)) { toast.error('أدخل سعر صحيح'); return } try { await apiFetch(`/services/${s.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice }) }); setServices(prev => prev.map(sv => sv.id === s.id ? { ...sv, price: newPrice } : sv)); toast.success('تم تحديث السعر ✓'); setEditingServiceId(null) } catch (e: any) { toast.error(e?.message || 'خطأ في تحديث السعر'); setEditingServiceId(null) } }}>✓</Button><Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => setEditingServiceId(null)}>✕</Button></div>) : (<><motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-dashed border-teal-300 dark:border-teal-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-all cursor-pointer" onClick={() => { setEditingServiceId(s.id); setEditingServicePrice(String(s.price)) }}><span className="font-bold text-sm text-teal-700 dark:text-teal-300">{s.price}</span><span className="text-xs text-muted-foreground">ج.م</span><Edit3 size={10} className="text-teal-400" /></motion.button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingServiceId(s.id); setEditingServicePrice(String(s.price)) }}><Edit3 size={11} className="text-teal-500" /></Button></>)}<Badge className={s.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]'}>{s.active ? 'نشط' : 'معطل'}</Badge><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/services', s.id, setServices)}><Trash2 size={12} className="text-red-500" /></Button></div></div>)}</CardContent></Card>)}
                </div>)}

                {/* Visits Sub-tab - ENHANCED */}
                {moreSubTab === 'visits' && (<div className="space-y-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Stethoscope size={18} className="text-violet-500" /> الزيارات</h3><div className="flex items-center gap-2"><Badge variant="outline">{visits.length} زيارة</Badge></div></div>
                  
                  {/* Filter by visit type */}
                  <div className="flex gap-2 flex-wrap">
                    {[{ id: 'all', label: 'الكل', emoji: '📋' }, ...VISIT_TYPES.slice(0, 3)].map(vt => (
                      <motion.button key={vt.id} whileTap={{ scale: 0.95 }} onClick={() => setVisitFilterType(vt.id)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all', visitFilterType === vt.id ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 shadow-md' : 'border-transparent bg-muted/50 hover:bg-muted')}>
                        <span>{vt.id === 'all' ? '📋' : vt.emoji}</span><span>{vt.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {visits.length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">🩺</motion.div><p className="text-muted-foreground">لا توجد زيارات بعد</p></Card>}
                  <div className="space-y-3">{(() => {
                    const filtered = visits.filter(v => visitFilterType === 'all' || v.type === visitFilterType).slice(0, 50)
                    return filtered.map((v, idx) => {
                      const p = patients.find(pt => pt.id === v.patientId)
                      const vt = VISIT_TYPES.find(t => t.id === v.type)
                      const isEditing = editingVisitId === v.id
                      return (
                        <motion.div key={v.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                          <Card className="section-card p-4 border-2 border-violet-100 dark:border-violet-900 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }} className={cn('p-2 rounded-xl text-white text-lg', vt?.bg || 'bg-gray-500')}>{vt?.emoji || '📝'}</motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm">{p?.name || 'مريض'}</span>
                                    <Badge className={cn('text-white text-[9px]', vt?.bg || 'bg-gray-500')}>{vt?.label || v.type}</Badge>
                                  </div>
                                  {isEditing ? (
                                    <div className="space-y-2 mt-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                                      <div><Label className="text-xs font-bold">نوع الزيارة</Label><div className="flex gap-1.5 mt-1">{VISIT_TYPES.slice(0, 3).map(vt => (<motion.button key={vt.id} whileTap={{ scale: 0.95 }} onClick={() => setEditVisitForm(prev => ({ ...prev, type: vt.id }))} className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[10px] font-bold transition-all', vt.bg, editVisitForm.type === vt.id ? 'ring-2 ring-white shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}><span>{vt.emoji}</span>{vt.label}</motion.button>))}</div></div>
                                      <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={editVisitForm.notes} onChange={e => setEditVisitForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="ملاحظات الزيارة..." className="input-luxury rounded-xl h-16 text-xs mt-1" /></div>
                                      <div className="flex gap-2"><Button size="sm" className="rounded-xl bg-violet-600 text-white text-xs" onClick={() => editVisitWithFinance(v, editVisitForm.type, editVisitForm.notes, p?.name || '')}>حفظ</Button><Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => setEditingVisitId(null)}>إلغاء</Button></div>
                                    </div>
                                  ) : (
                                    <>
                                      {v.diagnosis && <p className="text-xs text-muted-foreground mb-1">🔍 {v.diagnosis}</p>}
                                      {v.notes && <p className="text-xs text-muted-foreground">📝 {v.notes}</p>}
                                      <span className="text-[10px] text-muted-foreground">{formatDate(v.date)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {!isEditing && (
                                <div className="flex flex-col gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingVisitId(v.id); setEditVisitForm({ type: v.type, notes: v.notes || '', price: '' }) }}><Edit3 size={12} className="text-violet-500" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteVisitConfirmId(v.id)}><Trash2 size={12} className="text-red-500" /></Button>
                                </div>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })
                  })()}</div>

                  {/* Delete Visit Confirm */}
                  <AlertDialog open={!!deleteVisitConfirmId} onOpenChange={() => setDeleteVisitConfirmId(null)}>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف الزيارة</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذه الزيارة والمعاملة المالية المرتبطة بها؟</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={async () => { if (deleteVisitConfirmId) { const v = visits.find(vv => vv.id === deleteVisitConfirmId); const p = v ? patients.find(pt => pt.id === v.patientId) : null; if (v && p) await deleteVisitWithFinance(v, p.name); else if (v) { await apiFetch(`/visits/${v.id}`, { method: 'DELETE' }); setVisits(prev => prev.filter(vv => vv.id !== deleteVisitConfirmId)); toast.success('تم حذف الزيارة') } setDeleteVisitConfirmId(null) } }}>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>)}

                {/* Partner Doctors Sub-tab - Complete System */}
                {moreSubTab === 'doctors' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Stethoscope size={18} className="text-emerald-500" /> الأطباء المشاركون</h3><Button className="btn-luxury rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-700 text-white" onClick={() => { setDoctorForm({ name: '', phone: '', specialty: '', checkupPercentage: '', revisitPercentage: '', laserPercentage: '', sessionPercentage: '', fixedAmount: '', notes: '' }); setShowAddDoctor(true) }}><Plus size={14} className="ml-1" /> طبيب جديد</Button></div>
                  {/* Doctor Revenue Summary */}
                  {doctors.length > 0 && <Card className="card-luxury border-2 border-emerald-200 dark:border-emerald-800"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign size={14} className="text-emerald-500" /> ملخص حصص الأطباء</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الكشف</p><p className="text-sm font-bold text-emerald-600">{formatCurrency(checkupRevenue)}</p></div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الإعادة</p><p className="text-sm font-bold text-blue-600">{formatCurrency(revisitRevenue)}</p></div>
                      <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الجلسات</p><p className="text-sm font-bold text-violet-600">{formatCurrency(sessionRevenue)}</p></div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-[10px] text-muted-foreground">إجمالي الإيرادات</p><p className="text-sm font-bold text-amber-600">{formatCurrency(totalIncome)}</p></div>
                    </div>
                  </CardContent></Card>}
                  {doctors.length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">👨‍⚕️</motion.div><p className="text-muted-foreground">لا يوجد أطباء مشاركون بعد</p><p className="text-xs text-muted-foreground mt-1">أضف أطباء مشاركين مع تحديد نسبهم</p></Card>}
                  {doctorEarnings.map(d => (
                    <Card key={d.id} className="section-card p-4 border-2 border-emerald-100 dark:border-emerald-900">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-emerald-400"><AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-lg">{d.name.charAt(0)}</AvatarFallback></Avatar>
                          <div><p className="font-bold">{d.name}</p>{d.specialty && <p className="text-xs text-muted-foreground">{d.specialty}</p>}{d.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={10} />{d.phone}</p>}</div>
                        </div>
                        <div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingDoctorId(d.id); setDoctorForm({ name: d.name, phone: d.phone || '', specialty: d.specialty || '', checkupPercentage: String(d.checkupPercentage), revisitPercentage: String(d.revisitPercentage), laserPercentage: String(d.laserPercentage), sessionPercentage: String(d.sessionPercentage), fixedAmount: String(d.fixedAmount), notes: d.notes || '' }); setShowAddDoctor(true) }}><Edit3 size={12} className="text-emerald-500" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/doctors', d.id, setDoctors)}><Trash2 size={12} className="text-red-500" /></Button></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center"><p className="text-[9px] text-muted-foreground">كشف {d.checkupPercentage}%</p><p className="text-xs font-bold text-emerald-600">{formatCurrency(d.checkupEarn)}</p></div>
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"><p className="text-[9px] text-muted-foreground">إعادة {d.revisitPercentage}%</p><p className="text-xs font-bold text-blue-600">{formatCurrency(d.revisitEarn)}</p></div>
                        <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-center"><p className="text-[9px] text-muted-foreground">ليزر {d.laserPercentage}%</p><p className="text-xs font-bold text-violet-600">{formatCurrency(d.laserEarn)}</p></div>
                        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center"><p className="text-[9px] text-muted-foreground">جلسات {d.sessionPercentage}%</p><p className="text-xs font-bold text-orange-600">{formatCurrency(d.sessionEarn)}</p></div>
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center"><p className="text-[9px] text-muted-foreground">ثابت</p><p className="text-xs font-bold text-amber-600">{formatCurrency(d.fixedAmount)}</p></div>
                        <div className="p-2 rounded-lg bg-primary/10 text-center border-2 border-primary/30"><p className="text-[9px] text-muted-foreground font-bold">الإجمالي</p><p className="text-sm font-black text-primary">{formatCurrency(d.totalEarn)}</p></div>
                      </div>
                    </Card>
                  ))}
                </div>)}

                {/* Inventory Sub-tab - PROFESSIONAL */}
                {moreSubTab === 'inventory' && (<div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Package size={18} className="text-amber-500" /> المخزون</h3><div className="flex items-center gap-2">{lowStockItems.length > 0 && <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}><Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]">{lowStockItems.length} منخفض</Badge></motion.div>}<Button className="btn-luxury rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 text-white" onClick={() => { setEditingInventoryId(null); setEditInventoryForm({ name: '', category: '', quantity: '', minQuantity: '', unitPrice: '', notes: '' }); setShowAddInventory(true) }}><Plus size={14} className="ml-1" /> عنصر</Button></div></div>
                  
                  {/* Dashboard Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                      <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-3 text-center">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl mb-1">📦</motion.div>
                        <p className="text-xl font-black text-amber-700 dark:text-amber-300">{inventoryItems.length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">إجمالي العناصر</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-3 text-center">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="text-2xl mb-1">💰</motion.div>
                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(inventoryItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">إجمالي القيمة</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Card className={cn('border-2 p-3 text-center', lowStockItems.length > 0 ? 'border-red-300 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20' : 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20')}>
                        <motion.div animate={lowStockItems.length > 0 ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: lowStockItems.length > 0 ? Infinity : 0 }} className="text-2xl mb-1">{lowStockItems.length > 0 ? '⚠️' : '✅'}</motion.div>
                        <p className={cn('text-xl font-black', lowStockItems.length > 0 ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300')}>{lowStockItems.length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">مخزون منخفض</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card className="border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-3 text-center">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="text-2xl mb-1">🏷️</motion.div>
                        <p className="text-xl font-black text-violet-700 dark:text-violet-300">{new Set(inventoryItems.map(i => i.category || 'عام')).size}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">الفئات</p>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex-1 min-w-[150px] relative"><Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" /><Input value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} placeholder="بحث بالاسم..." className="input-luxury rounded-xl h-9 pr-9 text-sm border-amber-200 dark:border-amber-800" /></div>
                    <Select value={inventoryFilter} onValueChange={v => setInventoryFilter(v as any)}><SelectTrigger className="rounded-xl h-9 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="low">⚠️ منخفض</SelectItem><SelectItem value="normal">✅ طبيعي</SelectItem></SelectContent></Select>
                    <Select value={inventoryCategoryFilter} onValueChange={setInventoryCategoryFilter}><SelectTrigger className="rounded-xl h-9 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الفئات</SelectItem>{[...new Set(inventoryItems.map(i => i.category || 'عام'))].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                  </div>

                  {/* Items List */}
                  {inventoryItems.length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">📦</motion.div><p className="text-muted-foreground">لا توجد عناصر في المخزون</p><p className="text-xs text-muted-foreground mt-1">أضف عناصر للبدء في إدارة المخزون</p></Card>}
                  <div className="space-y-3">{(() => {
                    const filtered = inventoryItems.filter(i => {
                      if (inventorySearch && !i.name.toLowerCase().includes(inventorySearch.toLowerCase())) return false
                      if (inventoryFilter === 'low' && i.quantity > i.minQuantity) return false
                      if (inventoryFilter === 'normal' && i.quantity <= i.minQuantity) return false
                      if (inventoryCategoryFilter !== 'all' && (i.category || 'عام') !== inventoryCategoryFilter) return false
                      return true
                    })
                    if (filtered.length === 0) return <Card className="p-6 text-center"><p className="text-muted-foreground text-sm">لا توجد نتائج</p></Card>
                    return filtered.map((item, idx) => {
                      const isLow = item.quantity <= item.minQuantity
                      const isCritical = item.quantity === 0
                      const stockPercent = item.minQuantity > 0 ? Math.min((item.quantity / (item.minQuantity * 2)) * 100, 100) : 100
                      const stockColor = isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      const borderColor = isCritical ? 'border-red-400 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20' : isLow ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/10' : 'border-emerald-200 dark:border-emerald-800'
                      return (
                        <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                          <Card className={cn('section-card p-4 border-2 transition-all hover:shadow-lg', borderColor)}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <motion.div animate={isLow ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: isLow ? Infinity : 0 }} className={cn('p-2.5 rounded-xl', isCritical ? 'bg-red-100 dark:bg-red-900/30' : isLow ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30')}>
                                  {isCritical ? <AlertTriangle className="text-red-600" size={20} /> : isLow ? <AlertTriangle className="text-amber-600" size={20} /> : <Package className="text-emerald-600" size={20} />}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold text-sm">{item.name}</p>
                                    {item.category && <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-[9px]">{item.category}</Badge>}
                                    {isCritical && <Badge className="bg-red-500 text-white text-[9px] animate-pulse">🚫 نفد</Badge>}
                                    {isLow && !isCritical && <Badge className="bg-amber-500 text-white text-[9px]">⚠️ منخفض</Badge>}
                                  </div>
                                  {/* Quantity Progress Bar */}
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.quantity} / {item.minQuantity}</span>
                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${stockPercent}%` }} transition={{ duration: 0.8, delay: idx * 0.05 }} className={cn('h-full rounded-full', stockColor)} /></div>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>سعر الوحدة: {formatCurrency(item.unitPrice)}</span>
                                    <span>القيمة: <span className="font-bold text-amber-600">{formatCurrency(item.quantity * item.unitPrice)}</span></span>
                                  </div>
                                  {item.notes && <p className="text-[10px] text-muted-foreground mt-1">📝 {item.notes}</p>}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setStockTransactionItemId(item.id); setStockTransactionType('in'); setStockTransactionQty(''); setStockTransactionNotes(''); setShowStockTransaction(true) }}><FileUp size={12} className="text-emerald-500" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setStockTransactionItemId(item.id); setStockTransactionType('out'); setStockTransactionQty(''); setStockTransactionNotes(''); setShowStockTransaction(true) }}><FileDown size={12} className="text-orange-500" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingInventoryId(item.id); setEditInventoryForm({ name: item.name, category: item.category || '', quantity: String(item.quantity), minQuantity: String(item.minQuantity), unitPrice: String(item.unitPrice), notes: item.notes || '' }); setShowAddInventory(true) }}><Edit3 size={12} className="text-amber-500" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteInventoryConfirmId(item.id)}><Trash2 size={12} className="text-red-500" /></Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })
                  })()}</div>

                  {/* Delete Inventory Confirm */}
                  <AlertDialog open={!!deleteInventoryConfirmId} onOpenChange={() => setDeleteInventoryConfirmId(null)}>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>حذف العنصر</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا العنصر من المخزون؟</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={async () => { if (deleteInventoryConfirmId) { await deleteItem('/inventory/items', deleteInventoryConfirmId, setInventoryItems); setDeleteInventoryConfirmId(null) } }}>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>)}

                {/* Bookings Sub-tab - PROFESSIONAL */}
                {moreSubTab === 'bookings' && (<div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}><CalendarCheck size={18} className="text-sky-500" /></motion.div> نظام الحجز</h3><div className="flex items-center gap-2"><Badge variant="outline">{appointments.length} حجز</Badge><Button className="btn-luxury rounded-xl bg-gradient-to-l from-sky-500 to-sky-600 text-white" onClick={() => { setEditingBookingId(null); setBookingFormPatientSearch(''); setBookingFormPatientId(''); setBookingFormDate(''); setBookingFormTime(''); setBookingFormType('checkup'); setBookingFormStatus('scheduled'); setBookingFormNotes(''); setShowAddBooking(true) }}><Plus size={14} className="ml-1" /> حجز جديد</Button></div></div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 p-3 text-center">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl mb-1">📅</motion.div>
                        <p className="text-xl font-black text-sky-700 dark:text-sky-300">{appointments.filter(a => a.date?.startsWith(todayStr)).length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">حجز اليوم</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-3 text-center">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="text-2xl mb-1">📆</motion.div>
                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{(() => { const now = new Date(); const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); return appointments.filter(a => new Date(a.date) >= weekStart && new Date(a.date) <= now).length })()}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">هذا الأسبوع</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-3 text-center">
                        <motion.div animate={appointments.filter(a => a.status === 'scheduled').length > 0 ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1, repeat: appointments.filter(a => a.status === 'scheduled').length > 0 ? Infinity : 0 }} className="text-2xl mb-1">⏳</motion.div>
                        <p className="text-xl font-black text-amber-700 dark:text-amber-300">{appointments.filter(a => a.status === 'scheduled').length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">قيد الانتظار</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card className="border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-3 text-center">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="text-2xl mb-1">✅</motion.div>
                        <p className="text-xl font-black text-violet-700 dark:text-violet-300">{appointments.filter(a => a.status === 'confirmed').length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">مؤكد</p>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2 flex-wrap">
                    <Select value={bookingFilterStatus} onValueChange={setBookingFilterStatus}><SelectTrigger className="rounded-xl h-9 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem><SelectItem value="scheduled">⏳ مجدول</SelectItem><SelectItem value="confirmed">✅ مؤكد</SelectItem><SelectItem value="completed">🏁 مكتمل</SelectItem><SelectItem value="cancelled">❌ ملغي</SelectItem></SelectContent></Select>
                    <Select value={bookingFilterDate} onValueChange={v => setBookingFilterDate(v as any)}><SelectTrigger className="rounded-xl h-9 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الأوقات</SelectItem><SelectItem value="today">📅 اليوم</SelectItem><SelectItem value="week">📆 هذا الأسبوع</SelectItem><SelectItem value="month">🗓️ هذا الشهر</SelectItem></SelectContent></Select>
                  </div>

                  {/* Appointments List */}
                  {appointments.length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">📅</motion.div><p className="text-muted-foreground">لا توجد حجوزات بعد</p><p className="text-xs text-muted-foreground mt-1">أضف حجز جديد للبدء</p></Card>}
                  <div className="space-y-3">{(() => {
                    const filtered = appointments.filter(a => {
                      if (bookingFilterStatus !== 'all' && a.status !== bookingFilterStatus) return false
                      if (bookingFilterDate !== 'all') {
                        const aDate = new Date(a.date)
                        const now = new Date()
                        if (bookingFilterDate === 'today' && !a.date?.startsWith(todayStr)) return false
                        if (bookingFilterDate === 'week') { const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); if (aDate < weekStart) return false }
                        if (bookingFilterDate === 'month' && (aDate.getMonth() !== now.getMonth() || aDate.getFullYear() !== now.getFullYear())) return false
                      }
                      return true
                    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                    if (filtered.length === 0) return <Card className="p-6 text-center"><p className="text-muted-foreground text-sm">لا توجد حجوزات مطابقة</p></Card>

                    const statusConfig: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
                      scheduled: { emoji: '⏳', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700' },
                      confirmed: { emoji: '✅', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-300 dark:border-emerald-700' },
                      completed: { emoji: '🏁', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100 dark:bg-sky-900/30', border: 'border-sky-300 dark:border-sky-700' },
                      cancelled: { emoji: '❌', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700' },
                    }
                    const typeConfig: Record<string, { label: string; color: string }> = { checkup: { label: 'كشف', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }, revisit: { label: 'إعادة', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' }, session: { label: 'جلسة', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' }, consultation: { label: 'استشارة', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' } }

                    return filtered.map((apt, idx) => {
                      const p = patients.find(pt => pt.id === apt.patientId)
                      const sc = statusConfig[apt.status] || statusConfig.scheduled
                      const tc = typeConfig[apt.type] || typeConfig.consultation
                      const aptDate = new Date(apt.date)
                      const isPast = aptDate < new Date() && apt.status === 'scheduled'
                      const isToday = apt.date?.startsWith(todayStr)

                      return (
                        <motion.div key={apt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                          <Card className={cn('section-card p-4 border-2 transition-all hover:shadow-lg', sc.border, isPast && 'bg-amber-50/30 dark:bg-amber-950/10', isToday && 'bg-sky-50/30 dark:bg-sky-950/10')}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <motion.div animate={apt.status === 'scheduled' ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: apt.status === 'scheduled' ? Infinity : 0 }} className={cn('p-2.5 rounded-xl text-lg', sc.bg)}>
                                  {sc.emoji}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm">{p?.name || 'بدون مريض'}</span>
                                    <Badge className={cn('text-[9px]', tc.color)}>{tc.label}</Badge>
                                    <Badge className={cn('text-[9px]', sc.bg, sc.color)}>{sc.emoji} {apt.status === 'scheduled' ? 'مجدول' : apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'completed' ? 'مكتمل' : 'ملغي'}</Badge>
                                    {isToday && <Badge className="bg-sky-500 text-white text-[9px]">اليوم</Badge>}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(apt.date)}</span>
                                    {apt.duration && <span className="flex items-center gap-1"><Clock size={10} />{apt.duration} دقيقة</span>}
                                    {p?.phone && <span className="flex items-center gap-1"><Phone size={10} dir="ltr">{p.phone}</Phone></span>}
                                  </div>
                                  {apt.notes && <p className="text-xs text-muted-foreground mt-1">📝 {apt.notes}</p>}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                {p?.phone && <motion.button whileTap={{ scale: 0.85 }} className="h-8 w-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all" onClick={() => { const msg = encodeURIComponent(`مرحباً ${p.name}، نود تذكيرك بموعدك في عيادةالمغازي بتاريخ ${formatDate(apt.date)} الساعة ${aptDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}. نتطلع لرؤيتك! 🏥`); window.open(`https://wa.me/2${p.phone?.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank') }}><Send size={14} className="text-green-600" /></motion.button>}
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingBookingId(apt.id); setBookingFormPatientSearch(p?.name || ''); setBookingFormPatientId(apt.patientId || ''); setBookingFormDate(apt.date?.split('T')[0] || ''); setBookingFormTime(aptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })); setBookingFormType(apt.type); setBookingFormStatus(apt.status); setBookingFormNotes(apt.notes || ''); setShowAddBooking(true) }}><Edit3 size={12} className="text-sky-500" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/appointments', apt.id, setAppointments)}><Trash2 size={12} className="text-red-500" /></Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })
                  })()}</div>
                </div>)}

                {/* Medications Sub-tab - Enhanced */}
                {moreSubTab === 'medications' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Pill size={18} className="text-green-500" /> الأدوية</h3><Button className="btn-luxury rounded-xl bg-gradient-to-l from-green-600 to-green-700 text-white" onClick={() => setShowAddMedication(true)}><Plus size={14} className="ml-1" /> دواء</Button></div>
                  {medications.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">💊</p><p className="text-muted-foreground">لا توجد أدوية بعد</p></Card>}
                  <div className="space-y-2">{medications.map(m => <Card key={m.id} className="section-card p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-1.5 rounded-lg', m.active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-900/30')}><Pill className={m.active ? 'text-green-600' : 'text-gray-400'} size={14} /></div><div><p className="font-medium text-sm">{m.name}</p><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{m.category || 'عام'}</span>{m.dosage && <span className="text-xs text-muted-foreground">- الجرعة: {m.dosage}</span>}{m.instructions && <span className="text-xs text-muted-foreground">- {m.instructions}</span>}</div></div></div><div className="flex items-center gap-2"><Badge className={m.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]'}>{m.active ? 'نشط' : 'معطل'}</Badge><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/medications', m.id, setMedications)}><Trash2 size={12} className="text-red-500" /></Button></div></div></Card>)}</div>
                </div>)}

                {/* Reminders Sub-tab - ENHANCED Professional */}
                {moreSubTab === 'reminders' && (<div className="space-y-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Bell size={18} className="text-rose-500" /> التذكيرات</h3><Button className="btn-luxury rounded-xl bg-gradient-to-l from-rose-500 to-rose-600 text-white" onClick={() => setShowAddReminder(true)}><Plus size={14} className="ml-1" /> تذكير</Button></div>
                  
                  {/* Today's Reminders Highlighted Card */}
                  {(() => {
                    const todayReminders = reminders.filter(r => r.date?.startsWith(todayStr) && r.status !== 'completed')
                    if (todayReminders.length === 0) return null
                    return (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="border-2 border-amber-400 dark:border-amber-600 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-l from-amber-100/50 via-orange-100/30 to-yellow-100/50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/30 pointer-events-none" />
                          <CardHeader className="pb-2 relative z-10"><CardTitle className="text-sm flex items-center gap-2"><motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>📌</motion.span> تذكيرات اليوم <Badge className="bg-amber-500 text-white text-[9px]">{todayReminders.length}</Badge></CardTitle></CardHeader>
                          <CardContent className="space-y-2 relative z-10">
                            {todayReminders.map(r => {
                              const rTypeConfig: Record<string, { emoji: string; color: string; bg: string }> = { urgent: { emoji: '🔴', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' }, important: { emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' }, followup: { emoji: '🔵', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' }, general: { emoji: '🟢', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' } }
                              const cfg = rTypeConfig[r.type as string] || rTypeConfig.general
                              return (
                                <motion.div key={r.id} layout className={cn('p-3 rounded-xl border-2', cfg.bg)}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{cfg.emoji}</span>
                                      <div><p className="font-bold text-sm">{r.title}</p>{r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {r.patientId && (() => { const rp = patients.find(p => p.id === r.patientId); return rp?.phone ? <motion.button whileTap={{ scale: 0.9 }} onClick={() => window.open(`https://wa.me/${rp.phone?.replace(/[^0-9]/g, '')}`, '_blank')} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600"><Send size={12} /></motion.button> : null })()}
                                      <motion.button whileTap={{ scale: 0.85 }} onClick={async () => { try { await apiFetch(`/reminders/${r.id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) }); setReminders(prev => prev.map(rm => rm.id === r.id ? { ...rm, status: 'completed' } : rm)); setCelebratingId(r.id); setTimeout(() => setCelebratingId(null), 2000); toast.success('🎉 تم إكمال التذكير!') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">✓ تم</motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })()}

                  {/* Celebration overlay */}
                  <AnimatePresence>{celebratingId && (<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"><motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: 2 }} className="text-6xl">🎉</motion.div></motion.div>)}</AnimatePresence>

                  {reminders.length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">⏰</motion.div><p className="text-muted-foreground">لا توجد تذكيرات</p><p className="text-xs text-muted-foreground mt-1">أضف تذكيراً جديداً للبدء</p></Card>}
                  <div className="space-y-2">{reminders.map(r => {
                    const isPast = new Date(r.date) < new Date()
                    const rTypeConfig: Record<string, { emoji: string; color: string; bg: string; gradient: string }> = { urgent: { emoji: '🔴', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700', gradient: 'from-red-500 to-red-700' }, important: { emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700', gradient: 'from-amber-500 to-amber-700' }, followup: { emoji: '🔵', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700', gradient: 'from-blue-500 to-blue-700' }, general: { emoji: '🟢', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700', gradient: 'from-emerald-500 to-emerald-700' } }
                    const cfg = rTypeConfig[r.type as string] || rTypeConfig.general
                    const reminderDate = new Date(r.date)
                    const now = new Date()
                    const diffMs = reminderDate.getTime() - now.getTime()
                    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                    const countdownText = diffMs > 0 ? (diffDays === 0 ? 'اليوم' : diffDays === 1 ? 'غداً' : `بعد ${diffDays} يوم`) : (r.status === 'completed' ? '' : '⏰ متأخر!')
                    return (
                      <motion.div key={r.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={cn('relative overflow-hidden rounded-xl border-2 p-3', r.status === 'completed' ? 'bg-muted/50 border-muted' : cfg.bg)}>
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b rounded-r-xl" style={{ background: `linear-gradient(to bottom, var(--tw-gradient-stops))` }} />
                        <div className={cn('absolute top-0 left-0 w-1.5 h-full rounded-r-xl bg-gradient-to-b', cfg.gradient)} />
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <motion.div animate={r.status !== 'completed' && isPast ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: r.status !== 'completed' && isPast ? Infinity : 0 }} className="text-lg">{cfg.emoji}</motion.div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={cn('font-medium text-sm', r.status === 'completed' && 'line-through text-muted-foreground')}>{r.title}</p>
                                {countdownText && r.status !== 'completed' && <Badge className={cn('text-[8px]', isPast ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>{countdownText}</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">{formatDate(r.date)} {r.description && `- ${r.description}`}</p>
                              {r.patientId && (() => { const rp = patients.find(p => p.id === r.patientId); return rp ? <p className="text-[10px] text-muted-foreground">👤 {rp.name}</p> : null })()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {r.status !== 'completed' && r.patientId && (() => { const rp = patients.find(p => p.id === r.patientId); return rp?.phone ? <motion.button whileTap={{ scale: 0.9 }} onClick={() => window.open(`https://wa.me/${rp.phone?.replace(/[^0-9]/g, '')}`, '_blank')} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors"><Send size={12} /></motion.button> : null })()}
                            <Badge variant="outline" className={r.status === 'completed' ? 'border-emerald-500 text-emerald-600 text-[9px]' : r.status === 'pending' ? 'border-amber-500 text-amber-600 text-[9px]' : 'border-blue-500 text-blue-600 text-[9px]'}>{r.status === 'completed' ? 'مكتمل ✓' : r.status === 'pending' ? 'قيد الانتظار' : r.status}</Badge>
                            {r.status !== 'completed' && <motion.button whileTap={{ scale: 0.85 }} onClick={async () => { try { await apiFetch(`/reminders/${r.id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) }); setReminders(prev => prev.map(rm => rm.id === r.id ? { ...rm, status: 'completed' } : rm)); setCelebratingId(r.id); setTimeout(() => setCelebratingId(null), 2000); toast.success('🎉 تم إكمال التذكير!') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-600 transition-colors">✓ تم</motion.button>}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem('/reminders', r.id, setReminders)}><Trash2 size={10} className="text-red-500" /></Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}</div>
                </div>)}

                {/* Treatment Templates Sub-tab - قوالب العلاج */}
                {moreSubTab === 'templates' && (<div className="space-y-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Layers size={18} className="text-lime-500" /> قوالب العلاج</h3><Button className="btn-luxury rounded-xl bg-gradient-to-l from-lime-500 to-lime-600 text-white" onClick={() => { const name = prompt('اسم القالب:'); if (!name) return; const desc = prompt('الوصف:') || ''; const sess = parseInt(prompt('عدد الجلسات:', '6') || '6'); const price = parseFloat(prompt('السعر التقديري:', '1000') || '1000'); const cat = prompt('الفئة:', 'جلدية') || 'جلدية'; setTreatmentTemplates(prev => [...prev, { id: Date.now().toString(), name, description: desc, sessions: sess, estimatedPrice: price, category: cat }]); toast.success('تم إضافة القالب') }}><Plus size={14} className="ml-1" /> قالب جديد</Button></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {treatmentTemplates.map((t, i) => {
                      const catColors: Record<string, string> = { 'جلدية': 'from-blue-500 to-blue-700', 'تجميل': 'from-pink-500 to-pink-700', 'ليزر': 'from-cyan-500 to-cyan-700' }
                      const gradient = catColors[t.category] || 'from-lime-500 to-lime-700'
                      return (
                        <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                          <Card className="card-luxury border-2 border-lime-200 dark:border-lime-800 overflow-hidden">
                            <div className={cn('h-2 bg-gradient-to-l', gradient)} />
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold text-base">{t.name}</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                                </div>
                                <Badge className={cn('text-white text-[9px] bg-gradient-to-l', gradient)}>{t.category}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"><p className="text-[9px] text-muted-foreground">الجلسات</p><p className="text-sm font-bold text-blue-600">{t.sessions}</p></div>
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center"><p className="text-[9px] text-muted-foreground">السعر</p><p className="text-sm font-bold text-emerald-600">{formatCurrency(t.estimatedPrice)}</p></div>
                                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center"><p className="text-[9px] text-muted-foreground">للجلسة</p><p className="text-sm font-bold text-amber-600">{formatCurrency(t.estimatedPrice / t.sessions)}</p></div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="btn-luxury rounded-xl flex-1 bg-gradient-to-l from-lime-500 to-lime-600 text-white text-xs" onClick={() => { setSelectedTemplate(t); setShowApplyTemplate(true) }}><Sparkles size={12} className="ml-1" /> تطبيق على مريض</Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setTreatmentTemplates(prev => prev.filter(tp => tp.id !== t.id)); toast.success('تم حذف القالب') }}><Trash2 size={12} className="text-red-500" /></Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                  {treatmentTemplates.length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">📋</motion.div><p className="text-muted-foreground">لا توجد قوالب علاج بعد</p></Card>}
                </div>)}

                {/* Waiting Queue Sub-tab - قائمة الانتظار */}
                {moreSubTab === 'waiting' && (<div className="space-y-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Clock size={18} className="text-red-500" /> قائمة الانتظار</h3><Button className="btn-luxury rounded-xl bg-gradient-to-l from-red-500 to-red-600 text-white" onClick={() => setShowAddWaiting(true)}><Plus size={14} className="ml-1" /> إضافة مريض</Button></div>
                  
                  {/* Queue Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center border border-amber-200 dark:border-amber-800"><motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-xl mb-1">⏳</motion.div><p className="text-lg font-black text-amber-600">{waitingQueue.filter(w => w.status === 'waiting').length}</p><p className="text-[9px] text-muted-foreground">في الانتظار</p></div>
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center border border-blue-200 dark:border-blue-800"><motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-xl mb-1">🩺</motion.div><p className="text-lg font-black text-blue-600">{waitingQueue.filter(w => w.status === 'in-progress').length}</p><p className="text-[9px] text-muted-foreground">جاري الكشف</p></div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center border border-emerald-200 dark:border-emerald-800"><motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-xl mb-1">✅</motion.div><p className="text-lg font-black text-emerald-600">{waitingQueue.filter(w => w.status === 'done' || w.status === 'left').length}</p><p className="text-[9px] text-muted-foreground">تم/غادر</p></div>
                  </div>

                  {/* Active Queue */}
                  {(() => {
                    const activeQueue = waitingQueue
                      .filter(w => w.status === 'waiting' || w.status === 'in-progress')
                      .sort((a, b) => {
                        if (a.priority !== b.priority) return b.priority - a.priority
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                      })
                    const doneQueue = waitingQueue.filter(w => w.status === 'done' || w.status === 'left')
                    return (
                      <>
                        {activeQueue.length === 0 && doneQueue.length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">⏳</motion.div><p className="text-muted-foreground">قائمة الانتظار فارغة</p></Card>}
                        <div className="space-y-2">
                          {activeQueue.map((w, i) => {
                            const waitMinutes = Math.round((Date.now() - new Date(w.createdAt).getTime()) / 60000)
                            const isUrgent = w.priority >= 2
                            return (
                              <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={cn('relative overflow-hidden rounded-xl border-2 p-3', w.status === 'in-progress' ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' : isUrgent ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10' : 'border-amber-200 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10')}>
                                <div className={cn('absolute top-0 left-0 w-1.5 h-full rounded-r-xl', isUrgent ? 'bg-red-500' : 'bg-amber-400')} />
                                <div className="flex items-center justify-between relative z-10">
                                  <div className="flex items-center gap-3">
                                    <div className={cn('flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-white', isUrgent ? 'bg-red-500' : 'bg-amber-500')}>{i + 1}</div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm">{w.patientName || 'مريض'}</p>
                                        {isUrgent && <Badge className="bg-red-500 text-white text-[8px]">عاجل</Badge>}
                                        {w.status === 'in-progress' && <Badge className="bg-blue-500 text-white text-[8px]">🩺 جاري الكشف</Badge>}
                                      </div>
                                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <span>⏱ {waitMinutes > 60 ? `${Math.floor(waitMinutes / 60)} س ${waitMinutes % 60} د` : `${waitMinutes} دقيقة`}</span>
                                        {w.notes && <span>📝 {w.notes}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {w.status === 'waiting' && <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'in-progress' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'in-progress' } : q)); toast.success('جاري الكشف') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'in-progress' } : q)); toast.success('جاري الكشف') } }} className="px-2 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition-colors">🩺 كشف</motion.button>}
                                    {w.status === 'in-progress' && <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'done' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'done' } : q)); toast.success('تم الكشف ✅') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'done' } : q)); toast.success('تم الكشف ✅') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-colors">✅ تم</motion.button>}
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'left' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'left' } : q)); toast.success('تم تسجيل المغادرة') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'left' } : q)); toast.success('تم تسجيل المغادرة') } }} className="px-2 py-1 rounded-lg bg-gray-400 text-white text-[10px] font-bold hover:bg-gray-500 transition-colors">🚪 غادر</motion.button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem('/waiting', w.id, setWaitingQueue)}><Trash2 size={10} className="text-red-500" /></Button>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                        {doneQueue.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-xs text-muted-foreground font-bold mb-2">✅ مكتمل / غادر</h4>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {doneQueue.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                                  <span className="text-muted-foreground line-through">{w.patientName || 'مريض'}</span>
                                  <Badge variant="outline" className={w.status === 'done' ? 'border-emerald-500 text-emerald-600 text-[8px]' : 'border-gray-400 text-gray-500 text-[8px]'}>{w.status === 'done' ? 'تم' : 'غادر'}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>)}

                {/* Reports Sub-tab - التقارير المحترفة */}
                {moreSubTab === 'reports' && (<div className="space-y-4">
                  {/* Financial Summary */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={18} className="text-cyan-600" /> الملخص المالي الشامل</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">إجمالي الإيرادات</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome)}</p></div>
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20"><p className="text-xs text-muted-foreground">إجمالي المصروفات</p><p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p></div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">صافي الربح</p><p className={cn('text-lg font-bold', netProfit >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(netProfit)}</p></div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">غير المدفوع</p><p className="text-lg font-bold text-amber-600">{formatCurrency(unpaidTotal)}</p></div>
                      <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-xs text-muted-foreground">إيراد الأسبوع</p><p className="text-lg font-bold text-violet-600">{formatCurrency(thisWeekIncome)}</p></div>
                      <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20"><p className="text-xs text-muted-foreground">إيراد الشهر</p><p className="text-lg font-bold text-teal-600">{formatCurrency(thisMonthIncome)}</p></div>
                    </div>
                  </CardContent></Card>

                  {/* Revenue by Category */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Receipt size={18} className="text-amber-600" /> الإيرادات حسب النوع</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span>🩺</span><span className="text-sm font-bold">كشف</span></div><span className="font-bold text-emerald-600">{formatCurrency(checkupRevenue)}</span></div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span>🔄</span><span className="text-sm font-bold">إعادة</span></div><span className="font-bold text-blue-600">{formatCurrency(revisitRevenue)}</span></div>
                      <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span>⚡</span><span className="text-sm font-bold">جلسات</span></div><span className="font-bold text-violet-600">{formatCurrency(sessionRevenue)}</span></div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span>📊</span><span className="text-sm font-bold">أخرى</span></div><span className="font-bold text-gray-600">{formatCurrency(otherRevenue)}</span></div>
                    </div>
                    {revenueByCategory.length > 0 && <div className="mt-4"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></div>}
                  </CardContent></Card>

                  {/* Patient Stats */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Users size={18} className="text-blue-600" /> إحصائيات المرضى</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">إجمالي المرضى</p><p className="text-lg font-bold text-blue-600">{patients.length}</p></div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">جدد هذا الشهر</p><p className="text-lg font-bold text-emerald-600">{patients.filter(p => { const d = new Date(p.createdAt); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).length}</p></div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">⭐ حالات مميزة</p><p className="text-lg font-bold text-amber-600">{patients.filter(p => p.starred).length}</p></div>
                      <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20"><p className="text-xs text-muted-foreground">💗 متحسنين</p><p className="text-lg font-bold text-pink-600">{patients.filter(p => p.improved).length}</p></div>
                      <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20"><p className="text-xs text-muted-foreground">ذكور</p><p className="text-lg font-bold text-sky-600">{maleCount}</p></div>
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20"><p className="text-xs text-muted-foreground">إناث</p><p className="text-lg font-bold text-rose-600">{femaleCount}</p></div>
                    </div>
                  </CardContent></Card>

                  {/* Session Stats */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-orange-600" /> إحصائيات الجلسات</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20"><p className="text-xs text-muted-foreground">إجمالي الجلسات</p><p className="text-lg font-bold text-orange-600">{sessions.length}</p></div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">مكتملة</p><p className="text-lg font-bold text-emerald-600">{sessions.filter(s => s.status === 'completed').length}</p></div>
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20"><p className="text-xs text-muted-foreground">غير مدفوعة</p><p className="text-lg font-bold text-red-600">{sessions.filter(s => !s.paid).length}</p></div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">إجمالي غير مدفوعة</p><p className="text-lg font-bold text-amber-600">{formatCurrency(unpaidTotal)}</p></div>
                    </div>
                  </CardContent></Card>

                  {/* Laser Stats */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-cyan-600" /> إحصائيات الليزر</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20"><p className="text-xs text-muted-foreground">سجلات نشطة</p><p className="text-lg font-bold text-cyan-600">{laserRecords.filter(r => r.status === 'active').length}</p></div>
                      <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-xs text-muted-foreground">مكتملة</p><p className="text-lg font-bold text-violet-600">{laserRecords.filter(r => r.status === 'completed').length}</p></div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">إيراد الليزر</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(sessionRevenue)}</p></div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">مرضى الليزر</p><p className="text-lg font-bold text-blue-600">{new Set(laserRecords.map(r => r.patientId)).size}</p></div>
                    </div>
                  </CardContent></Card>

                  {/* Visit Type Distribution */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 size={18} className="text-purple-600" /> توزيع أنواع الزيارات</CardTitle></CardHeader><CardContent className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart><Pie data={[{ name: 'كشف', value: visits.filter(v => v.type === 'checkup').length || 1 }, { name: 'إعادة', value: visits.filter(v => v.type === 'revisit').length || 1 }, { name: 'جلسة', value: visits.filter(v => v.type === 'session').length || 1 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{[0,1,2].map(i => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer>
                    </CardContent></Card>

                  {/* Weekly Revenue Bar Chart */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={18} className="text-emerald-600" /> الإيرادات الأسبوعية</CardTitle></CardHeader><CardContent>
                    <ResponsiveContainer width="100%" height={260}><BarChart data={revenueChartData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><RechartsTooltip /><Bar dataKey="إيراد" fill="#047857" radius={[4,4,0,0]} /><Bar dataKey="مصروف" fill="#D4A843" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
                  </CardContent></Card>
                </div>)}

                {/* Backup Sub-tab */}
                {moreSubTab === 'backup' && (<div className="space-y-4">
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Database size={20} /> النسخ الاحتياطي</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Timer className="text-blue-600" size={18} /></div><div><p className="font-medium text-sm">نسخ تلقائي</p><p className="text-xs text-muted-foreground">كل فترة محددة</p></div></div><Switch checked={autoBackup} onCheckedChange={setAutoBackup} /></div>
                    {autoBackup && <Select value={String(backupInterval)} onValueChange={v => setBackupInterval(Number(v))}><SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 دقيقة</SelectItem><SelectItem value="30">30 دقيقة</SelectItem><SelectItem value="60">ساعة</SelectItem><SelectItem value="360">6 ساعات</SelectItem><SelectItem value="1440">يومياً</SelectItem></SelectContent></Select>}
                    {lastBackup && <p className="text-xs text-muted-foreground">آخر نسخة: {formatDate(lastBackup)}</p>}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={createBackup} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800"><HardDrive className="text-emerald-600" size={24} /><span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">إنشاء نسخة</span></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => exportBackup('json')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"><FileDown className="text-blue-600" size={24} /><span className="text-sm font-medium text-blue-700 dark:text-blue-400">تصدير JSON</span></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => { fileInputRef.current?.click() }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800"><FileUp className="text-amber-600" size={24} /><span className="text-sm font-medium text-amber-700 dark:text-amber-400">استيراد</span></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => exportBackup('csv')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 border border-violet-200 dark:border-violet-800"><Archive className="text-violet-600" size={24} /><span className="text-sm font-medium text-violet-700 dark:text-violet-400">تصدير CSV</span></motion.button>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".json,.csv" className="hidden" onChange={handleFileImport} />
                    {backups.length > 0 && <div className="space-y-2">{backups.map(b => <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"><div className="flex items-center gap-2"><Database size={14} className="text-muted-foreground" /><span>{b.type === 'auto' ? 'تلقائي' : 'يدوي'}</span></div><Badge variant="outline" className={b.status === 'completed' ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}>{b.status === 'completed' ? 'مكتمل' : b.status}</Badge></div>)}</div>}
                  </CardContent></Card>
                </div>)}

                {/* Notes Sub-tab - Professional Colorful Animated */}
                {moreSubTab === 'notes' && (<div className="space-y-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><FileText size={18} className="text-fuchsia-500" /> الملاحظات</h3><Badge variant="outline">{notes.length} ملاحظة</Badge></div>
                  {/* Search & Filter */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative"><Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-fuchsia-500" /><Input value={noteSearch} onChange={e => setNoteSearch(e.target.value)} placeholder="بحث في الملاحظات..." className="input-luxury rounded-xl h-10 pr-9 border-fuchsia-200 dark:border-fuchsia-800" /></div>
                    <Select value={noteFilter} onValueChange={v => setNoteFilter(v as any)}><SelectTrigger className="rounded-xl h-10 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="important">⭐ مهمة</SelectItem><SelectItem value="dashboard">🏠 الرئيسية</SelectItem><SelectItem value="patients">👥 المرضى</SelectItem><SelectItem value="laser">💎 الليزر</SelectItem><SelectItem value="finance">💰 المالية</SelectItem><SelectItem value="general">📌 عام</SelectItem></SelectContent></Select>
                  </div>
                  {/* Add Note */}
                  <Card className="card-luxury border-2 border-fuchsia-300 dark:border-fuchsia-700 bg-gradient-to-br from-fuchsia-50/50 to-violet-50/50 dark:from-fuchsia-950/20 dark:to-violet-950/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex gap-2">
                        <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="✏️ أضف ملاحظة جديدة..." className="input-luxury rounded-xl h-10 flex-1 border-fuchsia-200 dark:border-fuchsia-800 focus:border-fuchsia-500" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: newNoteSection, createdAt: new Date().toISOString() }, setNotes); setQuickNote('') } }} />
                        <Select value={newNoteSection} onValueChange={setNewNoteSection}><SelectTrigger className="rounded-xl h-10 w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">📌 عام</SelectItem><SelectItem value="dashboard">🏠 رئيسية</SelectItem><SelectItem value="patients">👥 مرضى</SelectItem><SelectItem value="laser">💎 ليزر</SelectItem><SelectItem value="finance">💰 مالية</SelectItem></SelectContent></Select>
                        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-xl bg-gradient-to-l from-fuchsia-500 to-violet-500 text-white font-bold shadow-lg" onClick={() => { if (quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: newNoteSection, createdAt: new Date().toISOString() }, setNotes); setQuickNote('') } }}><Plus size={18} /></motion.button>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Notes List */}
                  {(() => {
                    const filteredNotes = notes.filter(n => {
                      if (noteSearch && !n.content.toLowerCase().includes(noteSearch.toLowerCase())) return false;
                      if (noteFilter === 'important' && !n.important) return false;
                      if (!['all', 'important'].includes(noteFilter) && n.section !== noteFilter) return false;
                      return true;
                    });
                    const noteColors = [
                      'from-rose-200/80 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/20 border-rose-400 dark:border-rose-600',
                      'from-blue-200/80 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20 border-blue-400 dark:border-blue-600',
                      'from-emerald-200/80 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/20 border-emerald-400 dark:border-emerald-600',
                      'from-amber-200/80 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/20 border-amber-400 dark:border-amber-600',
                      'from-violet-200/80 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/20 border-violet-400 dark:border-violet-600',
                      'from-cyan-200/80 to-sky-100 dark:from-cyan-900/30 dark:to-sky-900/20 border-cyan-400 dark:border-cyan-600',
                      'from-fuchsia-200/80 to-pink-100 dark:from-fuchsia-900/30 dark:to-pink-900/20 border-fuchsia-400 dark:border-fuchsia-600',
                      'from-lime-200/80 to-green-100 dark:from-lime-900/30 dark:to-green-900/20 border-lime-400 dark:border-lime-600',
                    ];
                    const noteEmojis = ['📝', '💡', '📌', '🔔', '⭐', '💬', '🎯', '✨'];
                    const sectionConfig: Record<string, { emoji: string; color: string }> = { dashboard: { emoji: '🏠', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' }, patients: { emoji: '👥', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }, laser: { emoji: '💎', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' }, finance: { emoji: '💰', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }, general: { emoji: '📌', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300' } };
                    if (filteredNotes.length === 0) return <Card className="card-luxury p-8 text-center"><motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">📝</motion.div><p className="text-lg font-bold mb-1">لا توجد ملاحظات</p><p className="text-muted-foreground text-sm">أضف ملاحظاتك اليومية هنا</p></Card>;
                    return filteredNotes.map((n, i) => {
                      const sec = sectionConfig[n.section || 'general'] || sectionConfig.general;
                      return (
                        <motion.div key={n.id} initial={{ opacity: 0, x: -10, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }} className={cn('relative p-4 rounded-2xl border-2 bg-gradient-to-l transition-all hover:shadow-xl', noteColors[i % noteColors.length])}>
                          {n.important && <motion.div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-l from-amber-400 to-yellow-300" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />}
                          <div className="flex items-start gap-3">
                            <motion.div animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }} className="text-2xl mt-0.5">{noteEmojis[i % noteEmojis.length]}</motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <motion.div animate={n.important ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.8, repeat: n.important ? Infinity : 0, repeatDelay: 1 }}>
                                  {n.important ? <span className="text-lg">⭐</span> : null}
                                </motion.div>
                                <Badge className={cn('text-[9px]', sec.color)}>{sec.emoji} {n.section || 'عام'}</Badge>
                                <span className="text-[10px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                              </div>
                              {editingNoteId === n.id ? (
                                <div className="space-y-2 mt-2 p-3 rounded-xl bg-white/80 dark:bg-black/20 border border-fuchsia-300 dark:border-fuchsia-700">
                                  <Input value={editingNoteContent} onChange={e => setEditingNoteContent(e.target.value)} className="input-luxury rounded-xl h-9 text-sm" autoFocus onKeyDown={e => { if (e.key === 'Enter') { apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent, section: editingNoteSectionMore }) }).then(() => { setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent, section: editingNoteSectionMore } : nn)); setEditingNoteId(null); toast.success('تم التعديل ✓') }).catch(() => toast.error('خطأ')) } }} />
                                  <Select value={editingNoteSectionMore} onValueChange={setEditingNoteSectionMore}><SelectTrigger className="rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">📌 عام</SelectItem><SelectItem value="dashboard">🏠 رئيسية</SelectItem><SelectItem value="patients">👥 مرضى</SelectItem><SelectItem value="laser">💎 ليزر</SelectItem><SelectItem value="finance">💰 مالية</SelectItem></SelectContent></Select>
                                  <div className="flex gap-2"><Button size="sm" className="rounded-xl h-8 bg-fuchsia-600 text-white text-[10px]" onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent, section: editingNoteSectionMore }) }); setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent, section: editingNoteSectionMore } : nn)); setEditingNoteId(null); toast.success('تم التعديل ✓') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingNoteId(null)}>✕</Button></div>
                                </div>
                              ) : (
                                <p className="text-sm font-medium leading-relaxed">{n.content}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.15 }} className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-all', n.important ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-muted/50 hover:bg-amber-50 dark:hover:bg-amber-900/20')} onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ important: !n.important }) }); setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, important: !nn.important } : nn)); toast.success(n.important ? 'تم إزالة الأهمية' : 'تم التمييز كمهم ⭐') } catch { toast.error('خطأ') } }}><Star size={14} className={n.important ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'} /></motion.button>
                              <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.15 }} className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 transition-all" onClick={() => { setEditingNoteId(n.id); setEditingNoteContent(n.content); setEditingNoteSectionMore(n.section || 'general') }}><Edit3 size={14} className="text-fuchsia-500" /></motion.button>
                              <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.15 }} className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" onClick={() => deleteItem('/notes', n.id, setNotes)}><Trash2 size={14} className="text-red-500" /></motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                </div>)}

                {/* Settings Sub-tab - ENHANCED */}
                {moreSubTab === 'settings' && (<div className="space-y-4">
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Shield size={20} className="text-indigo-500" /> تخصيص الصلاحيات</CardTitle><CardDescription>تحديد دور المستخدم وصلاحياته</CardDescription></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setUserRole('doctor'); toast.success('تم تفعيل صلاحيات الطبيب') }} className={cn('p-4 rounded-xl border-2 transition-all text-center', userRole === 'doctor' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg' : 'border-transparent bg-muted/50 hover:bg-muted')}>
                        <motion.div animate={userRole === 'doctor' ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }} className="text-3xl mb-2">👨‍⚕️</motion.div>
                        <p className="font-bold text-sm">طبيب</p>
                        <p className="text-[9px] text-muted-foreground mt-1">صلاحية كاملة على جميع الأقسام</p>
                        {userRole === 'doctor' && <Badge className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">فعّال ✓</Badge>}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setUserRole('secretary'); toast.success('تم تفعيل صلاحيات السكرتارية') }} className={cn('p-4 rounded-xl border-2 transition-all text-center', userRole === 'secretary' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-lg' : 'border-transparent bg-muted/50 hover:bg-muted')}>
                        <motion.div animate={userRole === 'secretary' ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }} className="text-3xl mb-2">👩‍💼</motion.div>
                        <p className="font-bold text-sm">سكرتارية</p>
                        <p className="text-[9px] text-muted-foreground mt-1">المرضى والليزر فقط</p>
                        {userRole === 'secretary' && <Badge className="mt-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[9px]">فعّال ✓</Badge>}
                      </motion.button>
                    </div>
                  </CardContent></Card>

                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Lock size={20} className="text-red-500" /> كلمات سر الأقسام</CardTitle><CardDescription>حماية الأقسام بكلمة سر</CardDescription></CardHeader><CardContent className="space-y-3">
                    {[
                      { key: 'finance', label: 'القسم المالي', emoji: '💰' },
                      { key: 'settings', label: 'الإعدادات', emoji: '🎨' },
                      { key: 'more', label: 'المزيد', emoji: '📋' },
                      { key: 'dashboard', label: 'لوحة التحكم', emoji: '🏠' },
                    ].map(s => (
                      <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2"><span className="text-lg">{s.emoji}</span><div><p className="text-sm font-medium">{s.label}</p><p className="text-[9px] text-muted-foreground">{(sectionPasswords as Record<string,string>)[s.key] ? 'محمي بكلمة سر' : 'غير محمي'}</p></div></div>
                        <div className="flex items-center gap-2">
                          <Input type="password" value={(sectionPasswords as Record<string,string>)[s.key] || ''} onChange={e => setSectionPasswords(prev => ({ ...prev, [s.key]: e.target.value }))} placeholder="كلمة السر" className="w-28 h-8 text-xs rounded-lg" />
                          {(sectionPasswords as Record<string,string>)[s.key] && <Button variant="ghost" size="sm" className="h-8 text-[10px] text-red-500" onClick={() => setSectionPasswords(prev => ({ ...prev, [s.key]: '' }))}>إلغاء</Button>}
                        </div>
                      </div>
                    ))}
                  </CardContent></Card>

                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><RefreshCw size={20} className="text-blue-500" /> حالة المزامنة</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-xl">🔄</motion.div><div><p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">متصل</p><p className="text-[9px] text-muted-foreground">قاعدة البيانات محلية (SQLite)</p></div></div>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">نشط ✓</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"><p className="text-[9px] text-muted-foreground">المرضى</p><p className="text-sm font-bold text-blue-600">{patients.length}</p></div>
                      <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-center"><p className="text-[9px] text-muted-foreground">الزيارات</p><p className="text-sm font-bold text-violet-600">{visits.length}</p></div>
                      <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center"><p className="text-[9px] text-muted-foreground">الجلسات</p><p className="text-sm font-bold text-orange-600">{sessions.length}</p></div>
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center"><p className="text-[9px] text-muted-foreground">المعاملات</p><p className="text-sm font-bold text-emerald-600">{transactions.length}</p></div>
                    </div>
                    {lastBackup && <p className="text-[10px] text-muted-foreground text-center">آخر مزامنة: {formatDate(lastBackup)}</p>}
                  </CardContent></Card>

                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Palette size={20} /> ألوان التطبيق</CardTitle><CardDescription>10 ألوان مميزة</CardDescription></CardHeader><CardContent><div className="grid grid-cols-5 gap-3">{THEME_CONFIGS.map(tc => <motion.button key={tc.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} onClick={() => setTheme(tc.id)} className={cn('theme-swatch flex flex-col items-center justify-center gap-1 p-2', theme === tc.id && 'selected')} style={{ background: `linear-gradient(135deg, ${tc.primary}, ${tc.primaryDark})` }}><span className="text-xl">{tc.icon}</span><span className="text-[9px] font-bold text-white/90 truncate w-full text-center">{tc.name}</span>{theme === tc.id && <CheckCircle className="text-white absolute top-1 right-1" size={14} />}</motion.button>)}</div></CardContent></Card>
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Tag size={20} /> ألوان الحالات</CardTitle></CardHeader><CardContent className="space-y-3">{[
                    { key: 'completed' as const, label: 'مكتمل' }, { key: 'active' as const, label: 'نشط' }, { key: 'pending' as const, label: 'قيد الانتظار' }, { key: 'cancelled' as const, label: 'ملغي' }, { key: 'scheduled' as const, label: 'مجدول' },
                  ].map(s => <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span className="text-sm font-medium">{s.label}</span><div className="flex items-center gap-2"><input type="color" value={statusColors[s.key]} onChange={e => setStatusColors({ ...statusColors, [s.key]: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border-0" /><Badge style={{ backgroundColor: statusColors[s.key] + '20', color: statusColors[s.key] }} className="border">{statusColors[s.key]}</Badge></div></div>)}</CardContent></Card>
                  <Card className="card-luxury"><CardHeader><CardTitle>إعدادات عامة</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">الوضع الداكن</p></div><Switch checked={darkMode} onCheckedChange={setDarkMode} /></div>
                  </CardContent></Card>
                </div>)}
              </div>
            )}

            {/* ═══ SETTINGS direct ═══ */}
            {activeTab === 'settings' && (<div className="space-y-4"><div className="section-header-animated rounded-2xl bg-indigo-50 dark:bg-indigo-950/30"><div className="relative z-10 flex items-center gap-3"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="text-4xl">🎨</motion.div><div><h1 className="text-2xl font-bold">الإعدادات</h1></div></div></div><Card className="card-luxury"><CardHeader><CardTitle>ألوان التطبيق</CardTitle></CardHeader><CardContent><div className="grid grid-cols-5 gap-3">{THEME_CONFIGS.map(tc => <motion.button key={tc.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} onClick={() => setTheme(tc.id)} className={cn('theme-swatch flex flex-col items-center justify-center gap-1 p-2', theme === tc.id && 'selected')} style={{ background: `linear-gradient(135deg, ${tc.primary}, ${tc.primaryDark})` }}><span className="text-xl">{tc.icon}</span><span className="text-[9px] font-bold text-white/90 truncate w-full text-center">{tc.name}</span>{theme === tc.id && <CheckCircle className="text-white absolute top-1 right-1" size={14} />}</motion.button>)}</div></CardContent></Card></div>)}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Bottom Navigation ──────────────────────────────────────────── */}
      <nav className="bottom-nav"><div className="flex items-center justify-around max-w-lg mx-auto">
        {bottomNavItems.map(item => {
          const isActive = activeTab === item.id || (item.id === 'more' && ['more', 'settings'].includes(activeTab))
          const isLocked = !isDoctor && !['patients', 'laser'].includes(item.id)
          return (
            <button key={item.id} onClick={() => handleTabSwitch(item.id)} className={cn('bottom-nav-item', isActive && 'active')} style={isActive ? { '--active-color-from': item.activeColor?.split(' ')[0]?.replace('from-', ''), '--active-color-to': item.activeColor?.split(' ')[1]?.replace('to-', '') } as React.CSSProperties : undefined}>
              <div className={cn('nav-icon-wrapper', isActive && `bg-gradient-to-br ${item.activeColor} ${item.activeShadow} shadow-lg`)}>
                {isActive ? <span className="text-xl">{item.emoji}</span> : item.icon}
                {isLocked && <Lock size={8} className="absolute -top-1 -left-1 text-amber-500" />}
              </div>
              <span className={cn('nav-label', isActive && item.labelColor)}>{item.label}</span>
            </button>
          )
        })}
      </div></nav>

      {/* ─── Smart Search ────────────────────────────────────────────────── */}
      <AnimatePresence>{smartSearchOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="smart-search-overlay" onClick={() => setSmartSearchOpen(false)} /><div className="smart-search-panel"><Card className="border-0 shadow-2xl">
        <div className="p-4 border-b border-border"><div className="flex items-center gap-3"><Search size={20} className="text-primary" /><Input value={smartSearchQuery} onChange={e => setSmartSearchQuery(e.target.value)} placeholder="بحث ذكي..." className="border-0 focus-visible:ring-0 text-lg" autoFocus /><Button variant="ghost" size="icon" onClick={() => setSmartSearchOpen(false)}><X size={18} /></Button></div></div>
        <ScrollArea className="max-h-[50vh]">
          {smartSearchQuery && smartSearchResults.length === 0 && <div className="p-8 text-center text-muted-foreground"><p>لا توجد نتائج</p></div>}
          {smartSearchResults.map((r, i) => (<button key={`${r.type}-${r.id}`} onClick={() => { if (r.type === 'patient') { const p = patients.find(pt => pt.id === r.id); if (p) { setSelectedPatient(p); setActiveTab('patients') } } setSmartSearchOpen(false); setSmartSearchQuery('') }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-right"><div className="p-1.5 rounded-lg bg-muted">{r.icon}</div><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{r.label}</p><p className="text-xs text-muted-foreground truncate">{r.sub}</p></div><Badge variant="outline" className="text-[9px]">{r.type === 'patient' ? 'مريض' : 'خدمة'}</Badge></button>))}
        </ScrollArea>
      </Card></div></motion.div>)}</AnimatePresence>

      {/* ─── AI Chat - Smart Assistant ──────────────────────────────────────── */}
      <Dialog open={aiChatOpen} onOpenChange={setAiChatOpen}><DialogContent className="max-w-md h-[85vh] flex flex-col"><DialogHeader><DialogTitle className="flex items-center gap-2"><motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}><Bot size={22} className="text-primary" /></motion.div> المساعد الذكي</DialogTitle><DialogDescription>مساعدك الشامل لإدارة العيادة</DialogDescription></DialogHeader>
        {/* Quick Actions in AI Chat - ENHANCED */}
        <div className="grid grid-cols-3 gap-1.5 pb-2 border-b border-border">
          {[
            { label: 'مريض جديد', emoji: '👤', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', action: () => { setAiChatOpen(false); setShowAddPatient(true) } },
            { label: 'سجل ليزر', emoji: '💎', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800', action: () => { setAiChatOpen(false); setShowAddLaserRecord(true) } },
            { label: 'معاملة', emoji: '💰', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', action: () => { setAiChatOpen(false); setShowAddTransaction(true) } },
            { label: 'بحث', emoji: '🔍', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', action: () => { setAiChatOpen(false); setSmartSearchOpen(true) } },
            { label: 'المواعيد', emoji: '📅', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', action: () => { setAiChatOpen(false); setActiveTab('more'); setMoreSubTab('bookings') } },
            { label: 'التقارير', emoji: '📊', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', action: () => { setAiChatOpen(false); setActiveTab('more'); setMoreSubTab('reports') } },
            { label: 'المرضى', emoji: '👥', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', action: () => { setAiChatOpen(false); setActiveTab('patients') } },
            { label: 'الرئيسية', emoji: '🏠', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', action: () => { setAiChatOpen(false); setActiveTab('dashboard') } },
            { label: 'الانتظار', emoji: '⏳', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800', action: () => { setAiChatOpen(false); setActiveTab('more'); setMoreSubTab('waiting') } },
            { label: 'قوالب', emoji: '📋', color: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800', action: () => { setAiChatOpen(false); setActiveTab('more'); setMoreSubTab('templates') } },
            { label: 'المالية', emoji: '💵', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', action: () => { setAiChatOpen(false); setActiveTab('finance') } },
            { label: 'الليزر', emoji: '⚡', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800', action: () => { setAiChatOpen(false); setActiveTab('laser') } },
          ].map((btn, i) => (
            <motion.button key={i} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={btn.action} className={cn('flex flex-col items-center gap-0.5 p-1.5 rounded-xl border-2 transition-all text-[9px] font-bold', btn.color)}>
              <span className="text-sm">{btn.emoji}</span>{btn.label}
            </motion.button>
          ))}
        </div>
        <ScrollArea className="flex-1 p-2"><div className="space-y-3">{aiMessages.length === 0 && <div className="text-center text-muted-foreground text-sm py-6"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">🤖</motion.div><p className="font-bold text-lg mb-1">مرحباً! أنا مساعدك الذكي</p><p className="text-xs">اسألني أي سؤال عن العيادة أو استخدم الأزرار السريعة أعلاه</p></div>}{aiMessages.map((m, i) => <div key={i} className={cn('p-3 rounded-xl text-sm max-w-[85%]', m.role === 'user' ? 'bg-primary text-primary-foreground mr-auto' : 'bg-muted ml-auto')}><p className="whitespace-pre-wrap">{m.content}</p></div>)}{aiLoading && <div className="bg-muted p-3 rounded-xl ml-auto max-w-[85%]"><RefreshCw className="animate-spin text-muted-foreground" size={16} /></div>}</div></ScrollArea>
        <div className="flex items-center gap-2 pt-2 border-t border-border"><Input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="اكتب سؤالك..." className="flex-1 input-luxury rounded-xl" onKeyDown={e => e.key === 'Enter' && sendAiMessage()} /><Button onClick={sendAiMessage} size="icon" className="rounded-xl"><Send size={16} /></Button></div>
      </DialogContent></Dialog>

      {/* ═══ SMART PATIENT REGISTRATION DIALOG - REDESIGNED ═══ */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-lg"><UserPlus size={20} className="text-primary" /> تسجيل مريض جديد</DialogTitle><DialogDescription>أدخل بيانات المريض واختر نوع الزيارة</DialogDescription></DialogHeader>
          <div className="space-y-4">

            {/* ─── 1. NAME FIELD - PROMINENT AT TOP ─── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
              <div className={cn('rounded-2xl p-4 border-2 transition-all', newPatientName.trim() ? 'border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30' : 'border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20')}>
                <Label className="text-sm font-bold flex items-center gap-1.5 mb-2 text-amber-700 dark:text-amber-400">
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>✏️</motion.span>
                  اسم المريض <span className="text-red-500">*</span>
                </Label>
                <Input value={newPatientName} onChange={e => setNewPatientName(e.target.value)} placeholder="اكتب اسم المريض أو ابحث عن مريض موجود..." className={cn('rounded-xl h-12 text-base font-bold border-2 transition-all', newPatientName.trim() ? 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-black/20 focus:border-emerald-500' : 'border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-black/10 focus:border-amber-500')} autoFocus />
                {patientSearchSuggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border-2 border-emerald-300 dark:border-emerald-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800"><p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><Search size={12} /> مرضى موجودين</p></div>
                    {patientSearchSuggestions.map(p => (
                      <button key={p.id} onClick={() => { setSelectedPatient(p); setShowAddPatient(false); setActiveTab('patients') }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-right text-sm border-b border-border/50 last:border-0 transition-colors">
                        <Avatar className="h-9 w-9 border-2 border-emerald-300 dark:border-emerald-700"><AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs font-bold">{p.name?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0"><p className="font-bold truncate text-sm">{p.name}</p><p className="text-xs text-muted-foreground flex items-center gap-2"><Hash size={10} />{p.fileNumber}{p.phone && <><Phone size={10} />{p.phone}</>}</p></div>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">فتح</Badge>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* ─── 2. VISIT TYPE SELECTION - WITH COMBOS ─── */}
            <div>
              <Label className="text-sm font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 mb-2"><Stethoscope size={14} /> نوع الزيارة</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {/* First row: كشف / إعادة / جلسة */}
                {VISIT_TYPES.slice(0, 3).map(vt => (
                  <motion.button key={vt.id} whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.03 }} onClick={() => setSelectedVisitType(selectedVisitType === vt.id ? '' : vt.id)} className={cn('flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all text-white font-medium', vt.bg, selectedVisitType === vt.id ? 'ring-2 shadow-lg scale-[1.02]' : 'opacity-50 hover:opacity-80', selectedVisitType === vt.id && vt.ring)}>
                    <span className="text-sm">{vt.emoji}</span>
                    <span className="text-[10px] font-bold">{vt.label}</span>
                  </motion.button>
                ))}
              </div>
              {/* Second row: Combo types - كشف+جلسة / إعادة+جلسة */}
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {VISIT_TYPES.slice(3).map(vt => (
                  <motion.button key={vt.id} whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.03 }} onClick={() => setSelectedVisitType(selectedVisitType === vt.id ? '' : vt.id)} className={cn('flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-all text-white font-medium', vt.bg, selectedVisitType === vt.id ? 'ring-2 shadow-lg scale-[1.02]' : 'opacity-50 hover:opacity-80', selectedVisitType === vt.id && vt.ring)}>
                    <span className="text-xs">{vt.emoji}</span>
                    <span className="text-[9px] font-bold">{vt.label}</span>
                  </motion.button>
                ))}
              </div>
              {/* Combo indicator */}
              {['checkup_session', 'revisit_session'].includes(selectedVisitType) && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-2.5 rounded-xl bg-gradient-to-l from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 border border-violet-200 dark:border-violet-800">
                  <p className="text-xs font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1"><Sparkles size={12} /> زيارة مدمجة: سيتم تسجيل {selectedVisitType === 'checkup_session' ? 'كشف + جلسة' : 'إعادة + جلسة'} معاً</p>
                </motion.div>
              )}
              {/* Service Value - Manual Input */}
              {['session', 'checkup_session', 'revisit_session'].includes(selectedVisitType) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                  <Label className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>💰</motion.span>
                    قيمة الخدمة (ج.م) <span className="text-red-500">*</span>
                  </Label>
                  <Input type="number" value={customServicePrice} onChange={e => setCustomServicePrice(e.target.value)} placeholder="اكتب قيمة الخدمة بالجنيه المصري..." className="rounded-xl h-12 text-lg font-bold border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-black/20 focus:border-emerald-500 text-emerald-700 dark:text-emerald-300" />
                  <p className="text-[10px] text-muted-foreground mt-1.5">سيتم تسجيل هذا المبلغ في المالية تلقائياً</p>
                </motion.div>
              )}
            </div>

            {/* ─── 3. CONTACT INFO - Side by side ─── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Phone size={14} /> الهاتف</Label>
                <Input value={newPatientPhone} onChange={e => setNewPatientPhone(e.target.value)} placeholder="01xxxxxxxxx" className="input-luxury rounded-xl h-11 mt-1 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10" />
              </div>
              <div>
                <Label className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><MapPin size={14} /> العنوان</Label>
                <Input value={newPatientAddress} onChange={e => setNewPatientAddress(e.target.value)} placeholder="العنوان" className="input-luxury rounded-xl h-11 mt-1 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10" />
              </div>
            </div>

            {/* ─── 4. PERSONAL INFO ROW ─── */}
            <div className="grid grid-cols-2 gap-3">
              <Input value={newPatientAge} onChange={e => setNewPatientAge(e.target.value)} type="number" placeholder="🎂 العمر" className="input-luxury rounded-xl h-11 border-amber-200 dark:border-amber-800 focus:border-amber-500 bg-amber-50/30 dark:bg-amber-950/10" />
              <Select value={newPatientGender} onValueChange={setNewPatientGender}><SelectTrigger className="rounded-xl h-11 border-pink-200 dark:border-pink-800 bg-pink-50/30 dark:bg-pink-950/10"><SelectValue placeholder="⚧ الجنس" /></SelectTrigger><SelectContent><SelectItem value="male">♂ ذكر</SelectItem><SelectItem value="female">♀ أنثى</SelectItem></SelectContent></Select>
            </div>

            {/* ─── 5. VISIT PRICE (for كشف/إعادة) ─── */}
            {['checkup', 'revisit', 'checkup_session', 'revisit_session'].includes(selectedVisitType) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <Label className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>🩺</motion.span>
                  قيمة {selectedVisitType === 'checkup' || selectedVisitType === 'checkup_session' ? 'الكشف' : 'الإعادة'} (ج.م)
                </Label>
                <Input type="number" value={visitPrice} onChange={e => setVisitPrice(e.target.value)} placeholder="اكتب قيمة الكشف أو الإعادة بالجنيه المصري..." className="rounded-xl h-12 text-lg font-bold border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-black/20 focus:border-blue-500 text-blue-700 dark:text-blue-300" />
                <p className="text-[10px] text-muted-foreground mt-1.5">سيتم تسجيل هذا المبلغ في المالية تلقائياً</p>
              </motion.div>
            )}

            {/* ─── 6. NOTES ─── */}
            <div>
              <Label className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1"><FileText size={14} /> ملاحظات</Label>
              <Textarea value={newPatientNotes} onChange={e => setNewPatientNotes(e.target.value)} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl mt-1 border-purple-300 dark:border-purple-800 focus:border-purple-500 min-h-[60px] bg-gradient-to-br from-purple-50/50 to-fuchsia-50/50 dark:from-purple-950/10 dark:to-fuchsia-950/10" />
            </div>

            {/* ─── 7. SERVICES - AT THE BOTTOM, ELEGANT ─── */}
            {['session', 'checkup_session', 'revisit_session'].includes(selectedVisitType) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                <div className="p-4 rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/20 dark:to-amber-950/20">
                  <Label className="text-sm font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5 mb-3">
                    <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}>⚡</motion.span>
                    اختر الخدمة
                  </Label>
                  {Object.entries(servicesByCategory).length === 0 && (
                    <div className="text-center py-4"><p className="text-sm text-muted-foreground">لا توجد خدمات متاحة</p><p className="text-xs text-muted-foreground mt-1">أضف خدمات من قسم المزيد ← الخدمات</p></div>
                  )}
                  {Object.entries(servicesByCategory).map(([cat, svcs]) => (
                    <div key={cat} className="mb-3 last:mb-0">
                      <p className="text-xs text-muted-foreground mb-1.5 font-bold flex items-center gap-1"><Tag size={10} /> {cat}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {svcs.map(s => {
                          const isSelected = selectedServiceIds.includes(s.id)
                          return (
                            <motion.button key={s.id} whileTap={{ scale: 0.9 }} onClick={() => setSelectedServiceIds(prev => isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id])} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all', isSelected ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-200 dark:shadow-orange-900/30' : 'bg-white/80 dark:bg-black/10 border-orange-200 dark:border-orange-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20')}>
                              {isSelected ? <CheckCircle size={12} /> : <Circle size={12} className="text-orange-300" />}
                              <span className="font-bold">{s.name}</span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {selectedServiceIds.length > 0 && customServicePrice && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-300 dark:border-orange-700 flex items-center justify-between">
                      <span className="text-sm font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5"><DollarSign size={14} /> قيمة الجلسة</span>
                      <span className="text-lg font-bold text-orange-700 dark:text-orange-300">{parseFloat(customServicePrice) || 0} ج.م</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white font-bold h-12 text-base w-full" onClick={handleSmartPatientSubmit}>
              <Sparkles size={16} className="ml-2" /> تسجيل المريض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ LASER RECORD DIALOG - REDESIGNED ═══ */}
      <Dialog open={showAddLaserRecord} onOpenChange={setShowAddLaserRecord}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 gap-0">
          {/* Animated Header */}
          <div className="relative bg-gradient-to-l from-cyan-600 via-teal-600 to-emerald-700 p-5 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 opacity-15">
              <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-0 right-10 w-24 h-24 bg-white rounded-full blur-2xl" />
              <motion.div animate={{ x: [0, -20, 0], y: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-0 left-10 w-32 h-32 bg-cyan-300 rounded-full blur-3xl" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-2 left-1/2 w-8 h-8 bg-teal-200 rounded-full blur-lg" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }} className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Zap size={24} className="text-white" />
                </motion.div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">سجل ليزر جديد</DialogTitle>
                  <DialogDescription className="text-cyan-100 text-xs">بيانات العميل والخدمة - متصل بالنظام المالي تلقائياً</DialogDescription>
                </div>
              </div>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-[10px] px-3 py-1">💎 مركز الليزر</Badge>
              </motion.div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* ═══ Section 1: بيانات العميل - LARGE & PROMINENT ═══ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-cyan-300 dark:border-cyan-700 overflow-hidden shadow-lg shadow-cyan-500/10">
              <div className="bg-gradient-to-l from-cyan-100 via-sky-50 to-blue-50 dark:from-cyan-950/40 dark:via-cyan-950/20 dark:to-sky-950/40 px-5 py-3 border-b-2 border-cyan-200 dark:border-cyan-800">
                <h3 className="text-base font-black flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                  <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}>👤</motion.span>
                  بيانات العميل
                  <Badge className="bg-red-500 text-white text-[9px] mr-auto px-2 py-0.5">مطلوب *</Badge>
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {/* Patient Search - BIG & CLEAR */}
                <div>
                  <Label className="text-sm font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-2 mb-2">
                    <Search size={16} /> ابحث عن المريض بالاسم أو رقم الهاتف
                  </Label>
                  <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500" size={22} />
                    <Input value={laserFormPatientSearch} onChange={e => { setLaserFormPatientSearch(e.target.value); if (laserFormPatientId) setLaserFormPatientId('') }} placeholder="اكتب اسم المريض أو رقم التليفون هنا..." className="rounded-2xl h-14 pr-12 text-lg font-bold border-2 border-cyan-300 dark:border-cyan-700 focus:border-cyan-500 shadow-md" autoFocus />
                    {laserFormPatientSearch && !laserFormPatientId && (
                      <button onClick={() => { setLaserFormPatientSearch(''); setLaserFormPatientId('') }} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center"><X size={14} /></button>
                    )}
                  </div>
                  {/* Search Results - IN-FLOW always visible, no overflow hidden */}
                  {laserPatientSuggestions.length > 0 && !laserFormPatientId && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 border-2 border-cyan-300 dark:border-cyan-700 rounded-2xl overflow-hidden bg-card shadow-xl">
                      <div className="px-4 py-2.5 bg-gradient-to-l from-cyan-500 to-blue-600 flex items-center justify-between">
                        <p className="text-sm font-bold text-white flex items-center gap-2"><Search size={14} /> نتائج البحث</p>
                        <Badge className="bg-white/25 text-white text-[10px]">{laserPatientSuggestions.length} نتيجة</Badge>
                      </div>
                      <div className="max-h-[260px] overflow-y-auto">
                        {laserPatientSuggestions.map((p, i) => (
                          <motion.button key={p.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => { setLaserFormPatientId(p.id); setLaserFormPatientSearch(p.name) }} className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-right transition-all border-b border-cyan-100 dark:border-cyan-900/20 last:border-0">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg flex-shrink-0">{p.name?.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-lg leading-tight truncate">{p.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                                <Badge variant="outline" className="text-[10px] font-bold border-cyan-400 text-cyan-600">#{p.fileNumber}</Badge>
                                {p.phone && <span className="flex items-center gap-1"><Phone size={12} />{p.phone}</span>}
                                {p.age && <span>{p.age} سنة</span>}
                              </div>
                            </div>
                            <ChevronDown size={18} className="text-cyan-400 rotate-[-90deg] flex-shrink-0" />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Selected Patient - LARGE BEAUTIFUL CARD */}
                {laserFormPatientId && (() => {
                  const sp = patients.find(p => p.id === laserFormPatientId)
                  if (!sp) return null
                  return (
                    <motion.div initial={{ opacity: 0, scale: 0.97, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="rounded-2xl border-2 border-cyan-300 dark:border-cyan-700 bg-gradient-to-l from-cyan-50 via-white to-sky-50 dark:from-cyan-950/30 dark:via-card dark:to-sky-950/30 shadow-xl overflow-hidden">
                      <div className="bg-gradient-to-l from-cyan-500 to-blue-600 p-4 flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-3 border-white shadow-2xl"><AvatarFallback className="bg-white text-cyan-600 text-2xl font-black">{sp.name?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black text-xl">{sp.name}</p>
                          <div className="flex items-center gap-2 flex-wrap text-cyan-100 text-xs mt-1">
                            <Badge className="bg-white/20 text-white border-white/30 text-[10px]">#{sp.fileNumber}</Badge>
                            <Badge className={cn('text-[10px]', sp.gender === 'male' ? 'bg-blue-400/30 text-white' : 'bg-pink-400/30 text-white')}>{sp.gender === 'male' ? '♂ ذكر' : '♀ أنثى'}</Badge>
                            {sp.age && <span>🎂 {sp.age} سنة</span>}
                            {sp.phone && <span className="flex items-center gap-1"><Phone size={11} /> {sp.phone}</span>}
                          </div>
                        </div>
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setLaserFormPatientId(''); setLaserFormPatientSearch('') }} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"><X size={18} /></motion.button>
                      </div>
                      {(sp.phone2 || sp.bloodType || sp.address || sp.medicalHistory || sp.allergies) && (
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {sp.phone2 && <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"><p className="text-[9px] text-muted-foreground font-bold">📱 هاتف 2</p><p className="text-xs font-bold text-blue-700 dark:text-blue-300" dir="ltr">{sp.phone2}</p></div>}
                          {sp.bloodType && <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><p className="text-[9px] text-muted-foreground font-bold">🩸 فصيلة الدم</p><p className="text-xs font-bold text-red-700 dark:text-red-300">{sp.bloodType}</p></div>}
                          {sp.address && <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"><p className="text-[9px] text-muted-foreground font-bold">📍 العنوان</p><p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate">{sp.address}</p></div>}
                          {sp.medicalHistory && <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-800"><p className="text-[9px] text-orange-600 font-bold">⚠️ التاريخ المرضي</p><p className="text-xs font-bold text-orange-700 dark:text-orange-300 truncate">{sp.medicalHistory}</p></div>}
                          {sp.allergies && <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 col-span-2 sm:col-span-4"><p className="text-[9px] text-red-600 font-bold">🚨 حساسية</p><p className="text-xs font-bold text-red-700 dark:text-red-300">{sp.allergies}</p></div>}
                        </div>
                      )}
                    </motion.div>
                  )
                })()}
              </div>
            </motion.div>

            {/* ═══ Section 2: بيانات الليزر - OPTIONAL DROPDOWNS ═══ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border-2 border-violet-200 dark:border-violet-800 overflow-hidden shadow-lg shadow-violet-500/5">
              <div className="bg-gradient-to-l from-violet-100 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-violet-950/20 dark:to-fuchsia-950/40 px-5 py-3 border-b-2 border-violet-200 dark:border-violet-800">
                <h3 className="text-base font-black flex items-center gap-2 text-violet-700 dark:text-violet-300">
                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}>⚡</motion.span>
                  بيانات الليزر
                  <Badge className="bg-violet-500 text-white text-[9px] mr-auto px-2 py-0.5">اختياري</Badge>
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {/* Row 1: Doctor + Body Area */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Doctor Selection */}
                  <div>
                    <Label className="text-sm font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 mb-1.5"><Stethoscope size={14} /> الطبيب المعالج</Label>
                    <Select value={laserFormDoctorId} onValueChange={setLaserFormDoctorId}>
                      <SelectTrigger className="rounded-xl h-11 border-2 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 text-sm font-bold">
                        <SelectValue placeholder="👨‍⚕️ اختر الطبيب..." />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.active).map(d => (
                          <SelectItem key={d.id} value={d.id}>👨‍⚕️ {d.name}{d.specialty && <span className="text-muted-foreground text-xs"> ({d.specialty})</span>}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Body Area - Dropdown */}
                  <div>
                    <Label className="text-sm font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 mb-1.5"><MapPin size={14} /> منطقة الجسم *</Label>
                    <Select value={laserFormArea} onValueChange={setLaserFormArea}>
                      <SelectTrigger className="rounded-xl h-11 border-2 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 text-sm font-bold">
                        <SelectValue placeholder="اختر المنطقة..." />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_AREAS.map(area => (
                          <SelectItem key={area.id} value={area.id}>{area.emoji} {area.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Row 2: Skin Type + Hair Color + Density */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Skin Type - Dropdown */}
                  <div>
                    <Label className="text-sm font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 mb-1.5"><ThermometerSun size={14} /> نوع البشرة</Label>
                    <Select value={laserFormSkinType} onValueChange={setLaserFormSkinType}>
                      <SelectTrigger className="rounded-xl h-11 border-2 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 text-sm font-bold">
                        <SelectValue placeholder="اختر النوع..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SKIN_TYPES.map(st => (
                          <SelectItem key={st.id} value={st.id}>{st.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Hair Color - Dropdown */}
                  <div>
                    <Label className="text-sm font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 mb-1.5"><Palette size={14} /> لون الشعر</Label>
                    <Select value={laserFormHairColor} onValueChange={setLaserFormHairColor}>
                      <SelectTrigger className="rounded-xl h-11 border-2 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 text-sm font-bold">
                        <SelectValue placeholder="اختر اللون..." />
                      </SelectTrigger>
                      <SelectContent>
                        {HAIR_COLORS.map(hc => (
                          <SelectItem key={hc.id} value={hc.id}>{hc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Hair Density - Dropdown */}
                  <div>
                    <Label className="text-sm font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 mb-1.5"><Layers size={14} /> كثافة الشعر</Label>
                    <Select value={laserFormHairDensity} onValueChange={setLaserFormHairDensity}>
                      <SelectTrigger className="rounded-xl h-11 border-2 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 text-sm font-bold">
                        <SelectValue placeholder="اختر الكثافة..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">🍃 خفيف</SelectItem>
                        <SelectItem value="medium">🌿 متوسط</SelectItem>
                        <SelectItem value="dense">🌳 كثيف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ═══ Section 3: إعدادات الجلسة ═══ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 overflow-hidden shadow-lg shadow-amber-500/5">
              <div className="bg-gradient-to-l from-amber-100 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-amber-950/20 dark:to-yellow-950/40 px-5 py-3 border-b-2 border-amber-200 dark:border-amber-800">
                <h3 className="text-base font-black flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <motion.span animate={{ rotate: [0, 180, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>⚙️</motion.span>
                  إعدادات الجلسة
                  <Badge className="bg-amber-500 text-white text-[9px] mr-auto px-2 py-0.5">اختياري</Badge>
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1.5 block">🔧 اسم الجهاز</Label><Input value={laserFormMachine} onChange={e => setLaserFormMachine(e.target.value)} placeholder="Soprano" className="rounded-xl h-11 text-sm border-2 border-amber-200 dark:border-amber-800" /></div>
                  <div><Label className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1.5 block">⚡ الطاقة (J)</Label><Input type="number" value={laserFormEnergy} onChange={e => setLaserFormEnergy(e.target.value)} placeholder="14" className="rounded-xl h-11 text-sm border-2 border-amber-200 dark:border-amber-800" /></div>
                  <div><Label className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1.5 block">💫 النبض (ms)</Label><Input value={laserFormPulse} onChange={e => setLaserFormPulse(e.target.value)} placeholder="20" className="rounded-xl h-11 text-sm border-2 border-amber-200 dark:border-amber-800" /></div>
                </div>
              </div>
            </motion.div>

            {/* ═══ Section 4: التكلفة ═══ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 overflow-hidden shadow-lg shadow-emerald-500/5">
              <div className="bg-gradient-to-l from-emerald-100 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-teal-950/40 px-5 py-3 border-b-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-base font-black flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>💰</motion.span>
                  التكلفة
                  <Badge className="bg-emerald-500 text-white text-[9px] mr-auto px-2 py-0.5">متصل مالي ✅</Badge>
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1.5 block">🔢 عدد الجلسات</Label><Input value={laserFormSessions} onChange={e => setLaserFormSessions(e.target.value)} type="number" className="rounded-xl h-12 text-lg font-bold text-center border-2 border-emerald-200 dark:border-emerald-800" /></div>
                  <div><Label className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1.5 block">💰 سعر الجلسة (ج.م) *</Label><Input type="number" value={laserFormPrice} onChange={e => setLaserFormPrice(e.target.value)} placeholder="0" className="rounded-xl h-12 text-lg font-black text-emerald-600 text-center border-2 border-emerald-200 dark:border-emerald-800" /></div>
                </div>
                {laserFormPrice && parseInt(laserFormSessions) > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-gradient-to-l from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-300 dark:border-emerald-700 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">إجمالي الباقة ({laserFormSessions} جلسة)</p>
                        <p className="text-[10px] text-muted-foreground">سيتم تسجيله تلقائياً في النظام المالي</p>
                      </div>
                      <motion.p animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(parseFloat(laserFormPrice) * parseInt(laserFormSessions))}</motion.p>
                    </div>
                  </motion.div>
                )}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
                  <Label className="text-sm font-bold text-emerald-700 dark:text-emerald-300">حالة الدفع:</Label>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLaserFormPaid(true)} className={cn('px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm', laserFormPaid ? 'bg-emerald-500 text-white shadow-md' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>✅ مدفوع</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLaserFormPaid(false)} className={cn('px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm', !laserFormPaid ? 'bg-amber-500 text-white shadow-md' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>⏳ غير مدفوع</motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ═══ Section 5: ملاحظات ═══ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden shadow-lg shadow-indigo-500/5">
              <div className="bg-gradient-to-l from-indigo-100 via-violet-50 to-purple-50 dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-purple-950/40 px-5 py-3 border-b-2 border-indigo-200 dark:border-indigo-800">
                <h3 className="text-base font-black flex items-center gap-2 text-indigo-700 dark:text-indigo-300">📝 ملاحظات إضافية</h3>
              </div>
              <div className="p-5">
                <Textarea value={laserFormNotes} onChange={e => setLaserFormNotes(e.target.value)} placeholder="ملاحظات عن الحالة أو التعليمات الخاصة..." className="rounded-xl min-h-[80px] text-sm border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-400" />
              </div>
            </motion.div>
          </div>

          <DialogFooter className="gap-2 p-4 border-t bg-muted/30">
            <Button variant="ghost" onClick={() => setShowAddLaserRecord(false)} className="rounded-xl">إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-cyan-600 via-teal-600 to-emerald-600 text-white font-bold h-12 px-10 shadow-lg" onClick={async () => {
              if (!laserFormPatientId) return toast.error('اختر المريض أولاً')
              if (!laserFormArea) return toast.error('اختر منطقة الجسم')
              const now = new Date().toISOString()
              const patientName = patients.find(p => p.id === laserFormPatientId)?.name || 'مريض'
              const areaLabel = BODY_AREAS.find(a => a.id === laserFormArea)?.label || laserFormArea
              const sessionPrice = parseFloat(laserFormPrice) || 0
              let newRecordId: string | null = null

              // 1. Create the laser record with full price & machine data
              const totalPrice = sessionPrice * (parseInt(laserFormSessions) || 6)
              try {
                const recordRes = await apiFetch<any>('/laser/records', {
                  method: 'POST',
                  body: JSON.stringify({
                    patientId: laserFormPatientId,
                    bodyArea: areaLabel,
                    skinType: laserFormSkinType || undefined,
                    hairColor: laserFormHairColor || undefined,
                    hairDensity: laserFormHairDensity || undefined,
                    totalSessions: parseInt(laserFormSessions) || 6,
                    price: sessionPrice,
                    totalPrice: totalPrice,
                    paid: laserFormPaid,
                    machineName: laserFormMachine || undefined,
                    energy: parseFloat(laserFormEnergy) || undefined,
                    pulse: laserFormPulse || undefined,
                    status: 'active',
                    notes: laserFormNotes || undefined
                  })
                })
                const newRecord = recordRes?.record || recordRes?.data || recordRes
                if (newRecord?.id) { setLaserRecords(prev => [newRecord, ...prev]); newRecordId = newRecord.id }
              } catch (e: any) {
                toast.error('خطأ في إنشاء سجل الليزر: ' + (e.message || ''))
                return
              }

              // 2. Create the first laser session (non-blocking)
              if (newRecordId) {
                try {
                  await apiFetch('/laser/sessions', { method: 'POST', body: JSON.stringify({ laserRecordId: newRecordId, energy: parseFloat(laserFormEnergy) || undefined, pulse: laserFormPulse || undefined, date: now }) })
                } catch { /* non-critical */ }
              }

              // 3. Create financial transaction connected to finance system
              if (sessionPrice > 0) {
                try {
                  const finRes = await apiFetch<any>('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'ليزر', amount: sessionPrice, description: `ليزر ${areaLabel} - ${patientName}${laserFormPaid ? '' : ' (غير مدفوع)'}`, date: now }) })
                  const finItem = finRes?.data || finRes?.transaction || finRes
                  if (finItem?.id) setTransactions(prev => [finItem, ...prev])
                } catch { /* non-critical */ }
              }

              // 4. Create a session linked to patient for tracking
              try {
                const sessRes = await apiFetch<any>('/sessions', { method: 'POST', body: JSON.stringify({ patientId: laserFormPatientId, status: laserFormPaid ? 'completed' : 'scheduled', price: sessionPrice, paid: laserFormPaid, notes: `ليزر - ${areaLabel}${laserFormMachine ? ` - ${laserFormMachine}` : ''}`, date: now }) })
                const sessItem = sessRes?.data || sessRes?.session || sessRes
                if (sessItem?.id) setSessions(prev => [sessItem, ...prev])
              } catch { /* non-critical */ }

              // Reset form
              setLaserFormArea(''); setLaserFormSkinType(''); setLaserFormHairColor(''); setLaserFormHairDensity(''); setLaserFormSessions('6'); setLaserFormNotes(''); setLaserFormPatientId(''); setLaserFormPatientSearch(''); setLaserFormPrice(''); setLaserFormPaid(false); setLaserFormMachine(''); setLaserFormEnergy(''); setLaserFormPulse(''); setShowAddLaserRecord(false)
              toast.success('تم تسجيل سجل الليزر بنجاح 💎')
            }}><Zap size={16} className="ml-2" /> حفظ السجل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Other Dialogs ═══ */}
      {/* Add Service */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Tag size={18} className="text-teal-500" /> خدمة جديدة</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>اسم الخدمة *</Label><Input id="svName" placeholder="اسم الخدمة أو الجلسة" className="input-luxury rounded-xl" /></div><div><Label>الفئة</Label><Input id="svCat" placeholder="الفئة (مثال: ليزر، جلدية...)" className="input-luxury rounded-xl" /></div><div><Label>السعر (ج.م)</Label><Input id="svPrice" type="number" placeholder="اتركه فارغ - يتم تحديد السعر عند الجلسة" className="input-luxury rounded-xl" /></div><div><Label>المدة (دقيقة)</Label><Input id="svDur" type="number" placeholder="30" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-teal-600 to-teal-700 text-white" onClick={() => { const name = (document.getElementById('svName') as HTMLInputElement)?.value; if (!name) return toast.error('الاسم مطلوب'); addItem('/services', { name, category: (document.getElementById('svCat') as HTMLInputElement)?.value, price: parseFloat((document.getElementById('svPrice') as HTMLInputElement)?.value) || 0, duration: parseInt((document.getElementById('svDur') as HTMLInputElement)?.value) || 30, active: true }, setServices); setShowAddService(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Transaction */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>معاملة مالية</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>النوع</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="النوع" /></SelectTrigger><SelectContent><SelectItem value="income">إيراد</SelectItem><SelectItem value="expense">مصروف</SelectItem></SelectContent></Select></div><div><Label>الفئة</Label><Input id="tCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div><div><Label>المبلغ *</Label><Input id="tAmt" type="number" placeholder="0" className="input-luxury rounded-xl" /></div><div><Label>الوصف</Label><Textarea id="tDesc" placeholder="وصف المعاملة" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/finance/transactions', { type: 'income', category: (document.getElementById('tCat') as HTMLInputElement)?.value || 'عام', amount: parseFloat((document.getElementById('tAmt') as HTMLInputElement)?.value) || 0, description: (document.getElementById('tDesc') as HTMLTextAreaElement)?.value, date: new Date().toISOString() }, setTransactions); setShowAddTransaction(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add/Edit Booking - Professional */}
      <Dialog open={showAddBooking} onOpenChange={setShowAddBooking}><DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarCheck size={18} className="text-sky-500" /> {editingBookingId ? 'تعديل الحجز' : 'حجز جديد'}</DialogTitle><DialogDescription>{editingBookingId ? 'تعديل بيانات الحجز' : 'حجز موعد جديد للعيادة'}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          {/* Patient Search */}
          <div className="relative">
            <Label className="text-xs font-bold text-sky-700 dark:text-sky-300">بحث المريض</Label>
            <div className="relative mt-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500" size={16} /><Input value={bookingFormPatientSearch} onChange={e => { setBookingFormPatientSearch(e.target.value); if (bookingFormPatientId) setBookingFormPatientId('') }} placeholder="ابحث عن المريض..." className="input-luxury rounded-xl h-11 pr-9 border-sky-200 dark:border-sky-800" /></div>
            {bookingPatientSuggestions.length > 0 && !bookingFormPatientId && (
              <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-card border-2 border-sky-300 dark:border-sky-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                {bookingPatientSuggestions.map(p => (
                  <button key={p.id} onClick={() => { setBookingFormPatientId(p.id); setBookingFormPatientSearch(p.name) }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-sky-50 dark:hover:bg-sky-950/30 text-right text-sm border-b border-sky-100 dark:border-sky-900/30 last:border-0 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center font-bold text-white">{p.name?.charAt(0)}</div>
                    <div><p className="font-bold text-sm">{p.name}</p><div className="flex items-center gap-1 text-xs text-muted-foreground"><Badge variant="outline" className="text-[8px]">#{p.fileNumber}</Badge>{p.phone && <span>{p.phone}</span>}</div></div>
                  </button>
                ))}
              </div>
            )}
            {bookingFormPatientId && (() => { const sp = patients.find(p => p.id === bookingFormPatientId); return sp ? <div className="mt-2 p-2 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 flex items-center gap-2"><span className="font-bold text-sm">{sp.name}</span>{sp.phone && <span className="text-xs text-muted-foreground" dir="ltr">{sp.phone}</span>}<Button variant="ghost" size="sm" className="h-6 text-xs mr-auto" onClick={() => { setBookingFormPatientId(''); setBookingFormPatientSearch('') }}>✕</Button></div> : null })()}
          </div>
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold">التاريخ *</Label><Input type="date" value={bookingFormDate} onChange={e => setBookingFormDate(e.target.value)} className="input-luxury rounded-xl h-10 mt-1 border-sky-200 dark:border-sky-800" /></div>
            <div><Label className="text-xs font-bold">الوقت</Label><Input type="time" value={bookingFormTime} onChange={e => setBookingFormTime(e.target.value)} className="input-luxury rounded-xl h-10 mt-1 border-sky-200 dark:border-sky-800" /></div>
          </div>
          {/* Visit Type */}
          <div><Label className="text-xs font-bold">نوع الزيارة</Label><div className="flex gap-1.5 mt-1">{VISIT_TYPES.slice(0, 3).map(vt => (<motion.button key={vt.id} whileTap={{ scale: 0.95 }} onClick={() => setBookingFormType(vt.id)} className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-[10px] font-bold transition-all', vt.bg, bookingFormType === vt.id ? 'ring-2 ring-white shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}><span>{vt.emoji}</span>{vt.label}</motion.button>))}</div></div>
          {/* Status */}
          <div><Label className="text-xs font-bold">الحالة</Label><div className="flex gap-1.5 mt-1 flex-wrap">{[{ id: 'scheduled', label: '⏳ مجدول', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' }, { id: 'confirmed', label: '✅ مؤكد', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' }, { id: 'completed', label: '🏁 مكتمل', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700' }, { id: 'cancelled', label: '❌ ملغي', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' }].map(s => (<motion.button key={s.id} whileTap={{ scale: 0.95 }} onClick={() => setBookingFormStatus(s.id)} className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all', s.color, bookingFormStatus === s.id ? 'ring-2 ring-primary shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}>{s.label}</motion.button>))}</div></div>
          {/* Notes */}
          <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={bookingFormNotes} onChange={e => setBookingFormNotes(e.target.value)} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl mt-1 min-h-[60px] border-sky-200 dark:border-sky-800" /></div>
        </div>
        <DialogFooter>
          {bookingFormPatientId && bookingFormDate && (
            <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 text-xs font-bold hover:bg-green-200 transition-all" onClick={() => { const p = patients.find(pt => pt.id === bookingFormPatientId); if (p?.phone) { const timeStr = bookingFormTime ? bookingFormTime : 'غير محدد'; const msg = encodeURIComponent(`مرحباً ${p.name}، نود تذكيرك بموعدك في عيادةالمغازي بتاريخ ${bookingFormDate} الساعة ${timeStr}. نتطلع لرؤيتك! 🏥`); window.open(`https://wa.me/2${p.phone?.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank') } else { toast.error('لا يوجد هاتف للمريض') } }}><Send size={14} /> واتساب</motion.button>
          )}
          <Button className="btn-luxury rounded-xl bg-gradient-to-l from-sky-500 to-sky-600 text-white" onClick={async () => { if (!bookingFormDate) return toast.error('التاريخ مطلوب'); const dateStr = bookingFormTime ? `${bookingFormDate}T${bookingFormTime}:00` : bookingFormDate; if (editingBookingId) { try { await apiFetch(`/appointments/${editingBookingId}`, { method: 'PUT', body: JSON.stringify({ patientId: bookingFormPatientId || null, date: dateStr, type: bookingFormType, status: bookingFormStatus, notes: bookingFormNotes || null }) }); setAppointments(prev => prev.map(a => a.id === editingBookingId ? { ...a, patientId: bookingFormPatientId || undefined, date: dateStr, type: bookingFormType, status: bookingFormStatus, notes: bookingFormNotes } : a)); toast.success('تم تعديل الحجز ✓') } catch { toast.error('خطأ في التعديل') } } else { await addItem('/appointments', { patientId: bookingFormPatientId || null, date: dateStr, duration: 30, type: bookingFormType, status: bookingFormStatus, notes: bookingFormNotes || null }, setAppointments) } setShowAddBooking(false); setEditingBookingId(null) }}>حفظ</Button>
        </DialogFooter>
      </DialogContent></Dialog>

      {/* Add Laser Package */}
      <Dialog open={showAddLaserPackage} onOpenChange={setShowAddLaserPackage}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>باقة ليزر جديدة</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>اسم الباقة *</Label><Input id="lpName" placeholder="اسم الباقة" className="input-luxury rounded-xl" /></div><div className="grid grid-cols-2 gap-3"><div><Label>عدد الجلسات</Label><Input id="lpSess" type="number" placeholder="6" className="input-luxury rounded-xl" /></div><div><Label>السعر</Label><Input id="lpPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div></div><div><Label>منطقة الجسم</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المنطقة" /></SelectTrigger><SelectContent>{BODY_AREAS.map(a => <SelectItem key={a.id} value={a.label}>{a.emoji} {a.label}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/laser/packages', { name: (document.getElementById('lpName') as HTMLInputElement)?.value, sessionsCount: parseInt((document.getElementById('lpSess') as HTMLInputElement)?.value) || 6, price: parseFloat((document.getElementById('lpPrice') as HTMLInputElement)?.value) || 0, active: true }, setLaserPackages); setShowAddLaserPackage(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Medication */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>دواء جديد</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>الاسم *</Label><Input id="medName" placeholder="اسم الدواء" className="input-luxury rounded-xl" /></div><div><Label>الفئة</Label><Input id="medCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div><div><Label>الجرعة</Label><Input id="medDosage" placeholder="الجرعة" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/medications', { name: (document.getElementById('medName') as HTMLInputElement)?.value, category: (document.getElementById('medCat') as HTMLInputElement)?.value, dosage: (document.getElementById('medDosage') as HTMLInputElement)?.value, active: true }, setMedications); setShowAddMedication(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Reminder - ENHANCED */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Bell size={18} className="text-rose-500" /> تذكير جديد</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>العنوان *</Label><Input id="remTitle" placeholder="عنوان التذكير" className="input-luxury rounded-xl" /></div><div><Label>النوع</Label><div className="grid grid-cols-4 gap-2 mt-1">{[{ id: 'urgent', label: 'عاجل', emoji: '🔴', bg: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' }, { id: 'important', label: 'مهم', emoji: '🟡', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' }, { id: 'followup', label: 'متابعة', emoji: '🔵', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' }, { id: 'general', label: 'عام', emoji: '🟢', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' }].map(t => (<motion.button key={t.id} whileTap={{ scale: 0.9 }} onClick={() => setReminderType(t.id)} className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-bold', t.bg, reminderType === t.id ? 'ring-2 ring-primary shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}><span className="text-lg">{t.emoji}</span>{t.label}</motion.button>))}</div></div><div className="grid grid-cols-2 gap-2"><div><Label>التاريخ</Label><Input id="remDate" type="date" className="input-luxury rounded-xl" /></div><div><Label>الوقت</Label><Input id="remTime" type="time" className="input-luxury rounded-xl" /></div></div><div><Label>المريض (اختياري)</Label><Select value={reminderPatientId} onValueChange={setReminderPatientId}><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent><SelectItem value="none">بدون مريض</SelectItem>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { const title = (document.getElementById('remTitle') as HTMLInputElement)?.value; const date = (document.getElementById('remDate') as HTMLInputElement)?.value; const time = (document.getElementById('remTime') as HTMLInputElement)?.value; const dateStr = date ? (time ? `${date}T${time}:00` : date) : new Date().toISOString(); addItem('/reminders', { title, date: dateStr, type: reminderType, patientId: reminderPatientId === 'none' ? undefined : reminderPatientId || undefined, status: 'pending' }, setReminders); setShowAddReminder(false); setReminderType('general'); setReminderPatientId(''); toast.success('تم إضافة التذكير') }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add/Edit Inventory - Enhanced */}
      <Dialog open={showAddInventory} onOpenChange={setShowAddInventory}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Package size={18} className="text-amber-500" /> {editingInventoryId ? 'تعديل عنصر المخزون' : 'عنصر مخزون جديد'}</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>الاسم *</Label><Input value={editInventoryForm.name} onChange={e => setEditInventoryForm(prev => ({ ...prev, name: e.target.value }))} placeholder="اسم العنصر" className="input-luxury rounded-xl" /></div><div><Label>الفئة</Label><Select value={editInventoryForm.category || 'عام'} onValueChange={v => setEditInventoryForm(prev => ({ ...prev, category: v }))}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="عام">📌 عام</SelectItem><SelectItem value="أدوية">💊 أدوية</SelectItem><SelectItem value="مستلزمات طبية">🏥 مستلزمات طبية</SelectItem><SelectItem value="مستلزمات ليزر">💎 مستلزمات ليزر</SelectItem><SelectItem value="كريمات">🧴 كريمات</SelectItem><SelectItem value="أدوات">🔧 أدوات</SelectItem></SelectContent></Select></div><div className="grid grid-cols-3 gap-3"><div><Label>الكمية</Label><Input type="number" value={editInventoryForm.quantity} onChange={e => setEditInventoryForm(prev => ({ ...prev, quantity: e.target.value }))} placeholder="0" className="input-luxury rounded-xl" /></div><div><Label>الحد الأدنى</Label><Input type="number" value={editInventoryForm.minQuantity} onChange={e => setEditInventoryForm(prev => ({ ...prev, minQuantity: e.target.value }))} placeholder="5" className="input-luxury rounded-xl" /></div><div><Label>السعر</Label><Input type="number" value={editInventoryForm.unitPrice} onChange={e => setEditInventoryForm(prev => ({ ...prev, unitPrice: e.target.value }))} placeholder="0" className="input-luxury rounded-xl" /></div></div><div><Label>ملاحظات</Label><Input value={editInventoryForm.notes} onChange={e => setEditInventoryForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 text-white" onClick={async () => { if (!editInventoryForm.name.trim()) return toast.error('الاسم مطلوب'); if (editingInventoryId) { try { await apiFetch(`/inventory/items/${editingInventoryId}`, { method: 'PUT', body: JSON.stringify({ name: editInventoryForm.name, category: editInventoryForm.category || null, quantity: parseInt(editInventoryForm.quantity) || 0, minQuantity: parseInt(editInventoryForm.minQuantity) || 5, unitPrice: parseFloat(editInventoryForm.unitPrice) || 0, notes: editInventoryForm.notes || null }) }); setInventoryItems(prev => prev.map(i => i.id === editingInventoryId ? { ...i, name: editInventoryForm.name, category: editInventoryForm.category, quantity: parseInt(editInventoryForm.quantity) || 0, minQuantity: parseInt(editInventoryForm.minQuantity) || 5, unitPrice: parseFloat(editInventoryForm.unitPrice) || 0, notes: editInventoryForm.notes } : i)); toast.success('تم تعديل العنصر') } catch { toast.error('خطأ في التعديل') } } else { await addItem('/inventory/items', { name: editInventoryForm.name, category: editInventoryForm.category || null, quantity: parseInt(editInventoryForm.quantity) || 0, minQuantity: parseInt(editInventoryForm.minQuantity) || 5, unitPrice: parseFloat(editInventoryForm.unitPrice) || 0, notes: editInventoryForm.notes || null }, setInventoryItems) } setShowAddInventory(false); setEditingInventoryId(null); setEditInventoryForm({ name: '', category: '', quantity: '', minQuantity: '', unitPrice: '', notes: '' }) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Stock Transaction Dialog */}
      <Dialog open={showStockTransaction} onOpenChange={setShowStockTransaction}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle className="flex items-center gap-2">{stockTransactionType === 'in' ? <FileUp size={18} className="text-emerald-500" /> : <FileDown size={18} className="text-orange-500" />} {stockTransactionType === 'in' ? 'توريد مخزون' : 'صرف مخزون'}</DialogTitle></DialogHeader><div className="space-y-3"><div className="flex gap-2">{[{ type: 'in' as const, label: 'توريد', emoji: '📥', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' }, { type: 'out' as const, label: 'صرف', emoji: '📤', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300' }].map(t => (<motion.button key={t.type} whileTap={{ scale: 0.95 }} onClick={() => setStockTransactionType(t.type)} className={cn('flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', t.color, stockTransactionType === t.type ? 'ring-2 ring-primary shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}><span>{t.emoji}</span>{t.label}</motion.button>))}</div><div><Label>الكمية *</Label><Input type="number" value={stockTransactionQty} onChange={e => setStockTransactionQty(e.target.value)} placeholder="الكمية" className="input-luxury rounded-xl" /></div><div><Label>ملاحظات</Label><Input value={stockTransactionNotes} onChange={e => setStockTransactionNotes(e.target.value)} placeholder="سبب التوريد/الصرف..." className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className={cn('btn-luxury rounded-xl text-white', stockTransactionType === 'in' ? 'bg-gradient-to-l from-emerald-500 to-emerald-600' : 'bg-gradient-to-l from-orange-500 to-orange-600')} onClick={async () => { const qty = parseInt(stockTransactionQty); if (!qty || qty <= 0) return toast.error('أدخل كمية صحيحة'); try { await apiFetch('/inventory/transactions', { method: 'POST', body: JSON.stringify({ itemId: stockTransactionItemId, type: stockTransactionType, quantity: qty, notes: stockTransactionNotes || null, date: new Date().toISOString() }) }); const item = inventoryItems.find(i => i.id === stockTransactionItemId); if (item) { const newQty = stockTransactionType === 'in' ? item.quantity + qty : Math.max(0, item.quantity - qty); setInventoryItems(prev => prev.map(i => i.id === stockTransactionItemId ? { ...i, quantity: newQty } : i)) } toast.success(stockTransactionType === 'in' ? `تم توريد ${qty} وحدة` : `تم صرف ${qty} وحدة`); setShowStockTransaction(false) } catch { toast.error('خطأ في العملية') } }}>تأكيد</Button></DialogFooter></DialogContent></Dialog>

      {/* Add/Edit Partner Doctor Dialog */}
      <Dialog open={showAddDoctor} onOpenChange={setShowAddDoctor}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Stethoscope size={20} className="text-emerald-500" /> {editingDoctorId ? 'تعديل الطبيب' : 'طبيب مشارك جديد'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold">الاسم *</Label><Input value={doctorForm.name} onChange={e => setDoctorForm(prev => ({ ...prev, name: e.target.value }))} placeholder="اسم الطبيب" className="input-luxury rounded-xl h-10" /></div>
            <div><Label className="text-xs font-bold">التخصص</Label><Input value={doctorForm.specialty} onChange={e => setDoctorForm(prev => ({ ...prev, specialty: e.target.value }))} placeholder="التخصص" className="input-luxury rounded-xl h-10" /></div>
          </div>
          <div><Label className="text-xs font-bold">الهاتف</Label><Input value={doctorForm.phone} onChange={e => setDoctorForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="رقم الهاتف" className="input-luxury rounded-xl h-10" /></div>
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign size={14} className="text-emerald-500" /> النسب المئوية</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-bold text-emerald-600">نسبة الكشف %</Label><Input type="number" value={doctorForm.checkupPercentage} onChange={e => setDoctorForm(prev => ({ ...prev, checkupPercentage: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
              <div><Label className="text-xs font-bold text-blue-600">نسبة الإعادة %</Label><Input type="number" value={doctorForm.revisitPercentage} onChange={e => setDoctorForm(prev => ({ ...prev, revisitPercentage: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
              <div><Label className="text-xs font-bold text-violet-600">نسبة الليزر %</Label><Input type="number" value={doctorForm.laserPercentage} onChange={e => setDoctorForm(prev => ({ ...prev, laserPercentage: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
              <div><Label className="text-xs font-bold text-orange-600">نسبة الجلسات %</Label><Input type="number" value={doctorForm.sessionPercentage} onChange={e => setDoctorForm(prev => ({ ...prev, sessionPercentage: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
              <div className="col-span-2"><Label className="text-xs font-bold text-amber-600">مبلغ ثابت (ج.م)</Label><Input type="number" value={doctorForm.fixedAmount} onChange={e => setDoctorForm(prev => ({ ...prev, fixedAmount: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
            </CardContent>
          </Card>
          <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={doctorForm.notes} onChange={e => setDoctorForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl" /></div>
        </div>
        <DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-700 text-white" onClick={async () => {
          if (!doctorForm.name.trim()) return toast.error('الاسم مطلوب')
          if (editingDoctorId) {
            try {
              await apiFetch(`/doctors/${editingDoctorId}`, { method: 'PUT', body: JSON.stringify({ name: doctorForm.name, phone: doctorForm.phone || null, specialty: doctorForm.specialty || null, checkupPercentage: parseFloat(doctorForm.checkupPercentage) || 0, revisitPercentage: parseFloat(doctorForm.revisitPercentage) || 0, laserPercentage: parseFloat(doctorForm.laserPercentage) || 0, sessionPercentage: parseFloat(doctorForm.sessionPercentage) || 0, fixedAmount: parseFloat(doctorForm.fixedAmount) || 0, notes: doctorForm.notes || null }) })
              setDoctors(prev => prev.map(d => d.id === editingDoctorId ? { ...d, name: doctorForm.name, phone: doctorForm.phone, specialty: doctorForm.specialty, checkupPercentage: parseFloat(doctorForm.checkupPercentage) || 0, revisitPercentage: parseFloat(doctorForm.revisitPercentage) || 0, laserPercentage: parseFloat(doctorForm.laserPercentage) || 0, sessionPercentage: parseFloat(doctorForm.sessionPercentage) || 0, fixedAmount: parseFloat(doctorForm.fixedAmount) || 0, notes: doctorForm.notes } : d))
              toast.success('تم تعديل الطبيب')
            } catch { toast.error('خطأ في التعديل') }
          } else {
            await addItem('/doctors', { name: doctorForm.name, phone: doctorForm.phone || null, specialty: doctorForm.specialty || null, checkupPercentage: parseFloat(doctorForm.checkupPercentage) || 0, revisitPercentage: parseFloat(doctorForm.revisitPercentage) || 0, laserPercentage: parseFloat(doctorForm.laserPercentage) || 0, sessionPercentage: parseFloat(doctorForm.sessionPercentage) || 0, fixedAmount: parseFloat(doctorForm.fixedAmount) || 0, notes: doctorForm.notes || null }, setDoctors)
          }
          setShowAddDoctor(false); setEditingDoctorId(null); setDoctorForm({ name: '', phone: '', specialty: '', checkupPercentage: '', revisitPercentage: '', laserPercentage: '', sessionPercentage: '', fixedAmount: '', notes: '' })
        }}>حفظ</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* Password Verification Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}><DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Lock size={20} className="text-red-500" /> كلمة السر مطلوبة</DialogTitle><DialogDescription>هذا القسم محمي بكلمة سر</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <Input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="أدخل كلمة السر..." className="input-luxury rounded-xl h-12 text-center text-lg font-bold" onKeyDown={e => e.key === 'Enter' && verifyPassword()} autoFocus />
        </div>
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={() => setPasswordDialogOpen(false)}>إلغاء</Button><Button className="btn-luxury rounded-xl" onClick={verifyPassword}>دخول</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* Add to Waiting Queue Dialog */}
      <Dialog open={showAddWaiting} onOpenChange={setShowAddWaiting}><DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Clock size={18} className="text-red-500" /> إضافة لقائمة الانتظار</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs font-bold">اسم المريض أو اختر من القائمة</Label><Select value={waitingFormName} onValueChange={v => { const p = patients.find(pp => pp.id === v); if (p) setWaitingFormName(p.name) }}><SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر مريض موجود..." /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs font-bold">أو اكتب اسم المريض</Label><Input value={waitingFormName} onChange={e => setWaitingFormName(e.target.value)} placeholder="اسم المريض..." className="input-luxury rounded-xl mt-1" /></div>
          <div><Label className="text-xs font-bold">الأولوية</Label><div className="grid grid-cols-2 gap-2 mt-1"><motion.button whileTap={{ scale: 0.95 }} onClick={() => setWaitingFormPriority('normal')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', waitingFormPriority === 'normal' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-lg' : 'border-transparent bg-muted/50 text-muted-foreground')}>🟢 عادي</motion.button><motion.button whileTap={{ scale: 0.95 }} onClick={() => setWaitingFormPriority('urgent')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', waitingFormPriority === 'urgent' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-lg' : 'border-transparent bg-muted/50 text-muted-foreground')}>🔴 عاجل</motion.button></div></div>
          <div><Label className="text-xs font-bold">ملاحظات</Label><Input value={waitingFormNotes} onChange={e => setWaitingFormNotes(e.target.value)} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl mt-1" /></div>
        </div>
        <DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-red-500 to-red-600 text-white" onClick={async () => { if (!waitingFormName.trim()) return toast.error('اسم المريض مطلوب'); const priority = waitingFormPriority === 'urgent' ? 2 : 1; await addItem('/waiting', { patientName: waitingFormName, priority, status: 'waiting', notes: waitingFormNotes || undefined }, setWaitingQueue); setWaitingFormName(''); setWaitingFormPriority('normal'); setWaitingFormNotes(''); setShowAddWaiting(false) }}>إضافة للقائمة</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* Apply Template to Patient Dialog */}
      <Dialog open={showApplyTemplate} onOpenChange={setShowApplyTemplate}><DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Layers size={18} className="text-lime-500" /> تطبيق قالب العلاج</DialogTitle><DialogDescription>{selectedTemplate?.name} - {selectedTemplate?.sessions} جلسات</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <Card className="border-2 border-lime-200 dark:border-lime-800 bg-gradient-to-br from-lime-50 to-emerald-50 dark:from-lime-950/20 dark:to-emerald-950/20 p-4">
            <div className="space-y-1 text-sm">
              <p className="font-bold">{selectedTemplate?.name}</p>
              <p className="text-xs text-muted-foreground">{selectedTemplate?.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-[9px]">{selectedTemplate?.sessions} جلسات</Badge>
                <Badge variant="outline" className="text-[9px]">{formatCurrency(selectedTemplate?.estimatedPrice || 0)}</Badge>
                <Badge variant="outline" className="text-[9px]">{selectedTemplate?.category}</Badge>
              </div>
            </div>
          </Card>
          <div><Label className="text-xs font-bold">اختر المريض *</Label><Select value={templatePatientId} onValueChange={setTemplatePatientId}><SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.fileNumber})</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-lime-500 to-lime-600 text-white" onClick={async () => { if (!templatePatientId) return toast.error('اختر المريض'); const patient = patients.find(p => p.id === templatePatientId); const now = new Date().toISOString(); for (let i = 0; i < (selectedTemplate?.sessions || 0); i++) { await addItem('/sessions', { patientId: templatePatientId, status: 'scheduled', price: selectedTemplate?.estimatedPrice / selectedTemplate?.sessions || 0, paid: false, notes: `قالب: ${selectedTemplate?.name} - جلسة ${i + 1}`, date: now }, setSessions) } toast.success(`تم تطبيق قالب "${selectedTemplate?.name}" على ${patient?.name}`); setShowApplyTemplate(false); setTemplatePatientId(''); setSelectedTemplate(null) }}><Sparkles size={14} className="ml-1" /> تطبيق القالب</Button></DialogFooter>
      </DialogContent></Dialog>

    </div>
  )
}

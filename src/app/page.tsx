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
  ChevronDown, ChevronLeft, ChevronRight, Settings, Shield,
  BarChart3, TrendingUp, Eye, Camera, Pill, Heart, Send,
  MessageSquare, Bot, RefreshCw, Download, Upload, Filter,
  ArrowUpDown, UserPlus, ClipboardList, Scissors, Sparkles,
  Hash, MapPin, BriefcaseMedical, Syringe, Palette, X,
  Database, HardDrive, Archive, FileDown, FileUp, RotateCcw,
  Clock4, Timer, Inbox, Tag, Layers, Wand2, BookOpen
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Patient {
  id: string; fileNumber: string; name: string; phone?: string; phone2?: string;
  age?: number; gender?: string; address?: string; notes?: string; allergies?: string;
  medicalHistory?: string; starred?: boolean; bloodType?: string; createdAt: string;
}
interface Visit { id: string; patientId: string; doctorId?: string; type: string; diagnosis?: string; notes?: string; date: string; }
interface Session { id: string; patientId: string; serviceId?: string; doctorId?: string; status: string; notes?: string; date: string; price: number; paid: boolean; }
interface Service { id: string; name: string; category?: string; price: number; duration?: number; active: boolean; }
interface Note { id: string; patientId?: string; userId?: string; content: string; important: boolean; section?: string; createdAt: string; }
interface Alert { id: string; patientId: string; type: string; message: string; active: boolean; }
interface Reminder { id: string; patientId?: string; title: string; description?: string; date: string; type: string; status: string; }
interface LaserRecord { id: string; patientId: string; bodyArea: string; skinType?: string; hairColor?: string; totalSessions: number; status: string; notes?: string; }
interface LaserSession { id: string; laserRecordId: string; sessionNumber: number; energy?: number; pulse?: string; painLevel?: number; reaction?: string; notes?: string; date: string; }
interface LaserPackage { id: string; name: string; sessionsCount: number; price: number; bodyArea?: string; active: boolean; }
interface LaserSetting { id: string; machineName: string; bodyArea: string; defaultEnergy?: number; defaultPulse?: string; }
interface Transaction { id: string; type: string; category: string; amount: number; description?: string; date: string; }
interface Appointment { id: string; patientId?: string; date: string; duration: number; type: string; status: string; notes?: string; }
interface WaitingItem { id: string; patientId?: string; patientName?: string; priority: number; status: string; notes?: string; createdAt: string; }
interface InventoryItem { id: string; name: string; category?: string; quantity: number; minQuantity: number; unitPrice: number; notes?: string; }
interface InventoryTransaction { id: string; itemId: string; type: string; quantity: number; notes?: string; date: string; }
interface TreatmentPlan { id: string; patientId: string; title: string; description?: string; status: string; startDate: string; }
interface TreatmentPhase { id: string; planId: string; name: string; description?: string; order: number; status: string; }
interface PatientPhoto { id: string; patientId: string; type: string; description?: string; imageData: string; createdAt: string; }
interface Medication { id: string; name: string; category?: string; description?: string; dosage?: string; instructions?: string; active: boolean; }
interface Prescription { id: string; patientId: string; doctorId?: string; diagnosis?: string; notes?: string; date: string; }
interface PrescriptionItem { id: string; prescriptionId: string; medicationId: string; dosage?: string; frequency?: string; duration?: string; instructions?: string; }
interface Notification { id: string; userId?: string; title: string; message: string; type: string; read: boolean; createdAt: string; }
interface Backup { id: string; type: string; size?: number; status: string; createdAt: string; }
interface AuditLog { id: string; userId?: string; action: string; entity?: string; entityId?: string; details?: string; createdAt: string; }
interface ChatMessage { role: 'user' | 'assistant'; content: string; }

// ─── Helper ─────────────────────────────────────────────────────────────────

const CHART_COLORS = ['#047857', '#D4A843', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EC4899']

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!res.ok) { const e = await res.text().catch(() => ''); throw new Error(e || `Error ${res.status}`) }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Section colors & icons for animated cards
const SECTION_STYLES: Record<string, { gradient: string; icon: React.ReactNode; emoji: string; color: string; lightBg: string; darkBg: string }> = {
  dashboard: { gradient: 'from-emerald-500 to-teal-600', icon: <LayoutDashboard size={32} />, emoji: '🏥', color: 'text-emerald-600 dark:text-emerald-400', lightBg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-950/30' },
  patients: { gradient: 'from-blue-500 to-indigo-600', icon: <Users size={32} />, emoji: '👥', color: 'text-blue-600 dark:text-blue-400', lightBg: 'bg-blue-50', darkBg: 'dark:bg-blue-950/30' },
  visits: { gradient: 'from-violet-500 to-purple-600', icon: <Stethoscope size={32} />, emoji: '🩺', color: 'text-violet-600 dark:text-violet-400', lightBg: 'bg-violet-50', darkBg: 'dark:bg-violet-950/30' },
  sessions: { gradient: 'from-orange-500 to-red-500', icon: <Activity size={32} />, emoji: '⚡', color: 'text-orange-600 dark:text-orange-400', lightBg: 'bg-orange-50', darkBg: 'dark:bg-orange-950/30' },
  laser: { gradient: 'from-cyan-500 to-blue-600', icon: <Zap size={32} />, emoji: '💎', color: 'text-cyan-600 dark:text-cyan-400', lightBg: 'bg-cyan-50', darkBg: 'dark:bg-cyan-950/30' },
  finance: { gradient: 'from-amber-500 to-yellow-600', icon: <DollarSign size={32} />, emoji: '💰', color: 'text-amber-600 dark:text-amber-400', lightBg: 'bg-amber-50', darkBg: 'dark:bg-amber-950/30' },
  more: { gradient: 'from-pink-500 to-rose-600', icon: <MoreHorizontal size={32} />, emoji: '📋', color: 'text-pink-600 dark:text-pink-400', lightBg: 'bg-pink-50', darkBg: 'dark:bg-pink-950/30' },
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function Home() {
  const { user, isAuthenticated, login, logout } = useAuthStore()
  const { activeTab, setActiveTab, theme, setTheme, statusColors, setStatusColors, autoBackup, setAutoBackup, backupInterval, setBackupInterval, lastBackup, setLastBackup } = useClinicStore()
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [smartSearchOpen, setSmartSearchOpen] = useState(false)
  const [smartSearchQuery, setSmartSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Data states
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
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [photos, setPhotos] = useState<PatientPhoto[]>([])
  const [backups, setBackups] = useState<Backup[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  // Detail states
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientDetailTab, setPatientDetailTab] = useState('overview')
  const [moreSubTab, setMoreSubTab] = useState('services')
  const [laserSubTab, setLaserSubTab] = useState('records')

  // Dialog states
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showAddVisit, setShowAddVisit] = useState(false)
  const [showAddSession, setShowAddSession] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  const [showAddLaserRecord, setShowAddLaserRecord] = useState(false)
  const [showAddLaserPackage, setShowAddLaserPackage] = useState(false)
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showAddPrescription, setShowAddPrescription] = useState(false)
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [showAddInventory, setShowAddInventory] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)

  // AI Chat
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('doctor@elmoghazi.com')
  const [loginPassword, setLoginPassword] = useState('123456')
  const [loginLoading, setLoginLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)

  // Backup import
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Dark Mode ──────────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // ─── Seed Data ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!seeded) {
      apiFetch('/seed', { method: 'POST' }).then(() => setSeeded(true)).catch(() => setSeeded(true))
    }
  }, [seeded])

  // ─── Auto Backup ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!autoBackup) return
    const interval = setInterval(async () => {
      try {
        await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'auto' }) })
        setLastBackup(new Date().toISOString())
        toast.success('تم النسخ الاحتياطي التلقائي')
      } catch { /* silent */ }
    }, backupInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoBackup, backupInterval, setLastBackup])

  // ─── Load Data ──────────────────────────────────────────────────────────

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        apiFetch('/patients?limit=200'),
        apiFetch('/visits?limit=200'),
        apiFetch('/sessions?limit=200'),
        apiFetch('/services?limit=100'),
        apiFetch('/notes?limit=200'),
        apiFetch('/alerts?limit=100'),
        apiFetch('/reminders?limit=100'),
        apiFetch('/laser/records?limit=200'),
        apiFetch('/laser/packages?limit=50'),
        apiFetch('/laser/settings?limit=50'),
        apiFetch('/finance/transactions?limit=200'),
        apiFetch('/appointments?limit=200'),
        apiFetch('/waiting?limit=50'),
        apiFetch('/inventory/items?limit=100'),
        apiFetch('/treatment-plans?limit=100'),
        apiFetch('/medications?limit=200'),
        apiFetch('/prescriptions?limit=100'),
        apiFetch('/photos?limit=200'),
        apiFetch('/backups?limit=20'),
        apiFetch('/audit-logs?limit=100'),
        apiFetch('/notifications?limit=50'),
      ])
      const u = (r: PromiseSettledResult<any>) => {
        if (r.status !== 'fulfilled') return []
        const v = r.value
        return v?.data || v?.patients || v?.visits || v?.sessions || v?.services || v?.notes || v?.alerts || v?.reminders || v?.records || v?.packages || v?.settings || v?.transactions || v?.appointments || v?.queue || v?.items || v?.plans || v?.medications || v?.prescriptions || v?.photos || v?.backups || v?.logs || v?.notifications || (Array.isArray(v) ? v : [])
      }
      setPatients(u(results[0])); setVisits(u(results[1])); setSessions(u(results[2]))
      setServices(u(results[3])); setNotes(u(results[4])); setAlerts(u(results[5]))
      setReminders(u(results[6])); setLaserRecords(u(results[7])); setLaserPackages(u(results[8]))
      setLaserSettings(u(results[9])); setTransactions(u(results[10])); setAppointments(u(results[11]))
      setWaitingQueue(u(results[12])); setInventoryItems(u(results[13])); setTreatmentPlans(u(results[14]))
      setMedications(u(results[15])); setPrescriptions(u(results[16])); setPhotos(u(results[17]))
      setBackups(u(results[18])); setAuditLogs(u(results[19])); setNotifications(u(results[20]))
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) loadAllData()
  }, [isAuthenticated, loadAllData])

  // ─── Login ──────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    setLoginLoading(true)
    try {
      const res = await apiFetch<{user: any}>('/auth/login', { method: 'POST', body: JSON.stringify({ email: loginEmail, password: loginPassword }) })
      login(res.user)
      toast.success('مرحباً بك في عيادة المغازى')
    } catch (e: any) { toast.error(e.message || 'خطأ في تسجيل الدخول') }
    setLoginLoading(false)
  }

  // ─── CRUD Helpers ───────────────────────────────────────────────────────

  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try {
      const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) })
      const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.package || res?.setting || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.photo || res?.backup || res?.notification || res
      if (item?.id) setter(prev => [item, ...prev])
      toast.success('تمت الإضافة بنجاح')
      return item
    } catch (e: any) { toast.error(e.message || 'خطأ'); return null }
  }

  const updateItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try {
      const res = await apiFetch<{data: any}>(path, { method: 'PUT', body: JSON.stringify(body) })
      setter(prev => prev.map((item: any) => item.id === body.id ? { ...item, ...res.data } : item))
      toast.success('تم التحديث')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try {
      await apiFetch(`${path}/${id}`, { method: 'DELETE' })
      setter(prev => prev.filter((item: any) => item.id !== id))
      toast.success('تم الحذف')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // ─── Computed Data ──────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().split('T')[0]
  const todayVisits = visits.filter(v => v.date?.startsWith(todayStr))
  const todayIncome = transactions.filter(t => t.type === 'income' && t.date?.startsWith(todayStr)).reduce((s, t) => s + t.amount, 0)
  const todayAppointments = appointments.filter(a => a.date?.startsWith(todayStr))
  const activeAlerts = alerts.filter(a => a.active)
  const lowStockItems = inventoryItems.filter(i => i.quantity <= i.minQuantity)
  const maleCount = patients.filter(p => p.gender === 'male').length
  const femaleCount = patients.filter(p => p.gender === 'female').length

  const revenueChartData = useMemo(() => {
    const days: any[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' })
      const inc = transactions.filter(t => t.type === 'income' && t.date?.startsWith(ds)).reduce((s, t) => s + t.amount, 0)
      const exp = transactions.filter(t => t.type === 'expense' && t.date?.startsWith(ds)).reduce((s, t) => s + t.amount, 0)
      days.push({ name: dayName, إيراد: inc, مصروف: exp })
    }
    return days
  }, [transactions])

  const genderData = [
    { name: 'ذكور', value: maleCount || 1 },
    { name: 'إناث', value: femaleCount || 1 },
  ]

  const filteredPatients = useMemo(() => {
    let list = patients
    if (searchQuery) list = list.filter(p => p.name.includes(searchQuery) || p.phone?.includes(searchQuery) || p.fileNumber?.includes(searchQuery))
    return list
  }, [patients, searchQuery])

  // ─── Smart Search ───────────────────────────────────────────────────────

  const smartSearchResults = useMemo(() => {
    if (!smartSearchQuery.trim()) return []
    const q = smartSearchQuery.toLowerCase()
    const results: { type: string; label: string; sub: string; id: string; icon: React.ReactNode }[] = []
    patients.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q))
        results.push({ type: 'patient', label: p.name, sub: `${p.fileNumber} | ${p.phone || ''}`, id: p.id, icon: <Users size={16} className="text-blue-500" /> })
    })
    visits.forEach(v => {
      const p = patients.find(p => p.id === v.patientId)
      if (v.diagnosis?.toLowerCase().includes(q) || v.type?.toLowerCase().includes(q))
        results.push({ type: 'visit', label: p?.name || 'زيارة', sub: v.diagnosis || v.type, id: v.id, icon: <Stethoscope size={16} className="text-violet-500" /> })
    })
    services.forEach(s => {
      if (s.name.toLowerCase().includes(q))
        results.push({ type: 'service', label: s.name, sub: formatCurrency(s.price), id: s.id, icon: <Activity size={16} className="text-orange-500" /> })
    })
    medications.forEach(m => {
      if (m.name.toLowerCase().includes(q))
        results.push({ type: 'medication', label: m.name, sub: m.category || '', id: m.id, icon: <Pill size={16} className="text-green-500" /> })
    })
    return results.slice(0, 20)
  }, [smartSearchQuery, patients, visits, services, medications])

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSmartSearchOpen(true) }
      if (e.key === 'Escape') setSmartSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ─── AI Chat ────────────────────────────────────────────────────────────

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return
    const msg = aiInput
    setAiInput('')
    setAiMessages(prev => [...prev, { role: 'user', content: msg }])
    setAiLoading(true)
    try {
      const res = await apiFetch<{message: string}>('/ai/chat', { method: 'POST', body: JSON.stringify({ messages: [...aiMessages, { role: 'user', content: msg }] }) })
      setAiMessages(prev => [...prev, { role: 'assistant', content: res.message || 'عذراً، لم أتمكن من الرد.' }])
    } catch { setAiMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي.' }]) }
    setAiLoading(false)
  }

  // ─── Backup Functions ───────────────────────────────────────────────────

  const createBackup = async () => {
    try {
      await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'manual' }) })
      setLastBackup(new Date().toISOString())
      toast.success('تم إنشاء نسخة احتياطية بنجاح')
      loadAllData()
    } catch { toast.error('فشل إنشاء النسخة الاحتياطية') }
  }

  const exportBackup = async (format: string) => {
    try {
      const data = { patients, visits, sessions, services, transactions, appointments, laserRecords, laserPackages, inventoryItems, medications, prescriptions, reminders, notes, exportDate: new Date().toISOString(), appVersion: '2.0' }
      let content: string; let filename: string; let mimeType: string

      if (format === 'json') { content = JSON.stringify(data, null, 2); filename = `elmoghazi-backup-${todayStr}.json`; mimeType = 'application/json' }
      else if (format === 'csv') {
        const headers = Object.keys(patients[0] || {}).join(',')
        const rows = patients.map(p => Object.values(p).join(',')).join('\n')
        content = headers + '\n' + rows; filename = `elmoghazi-backup-${todayStr}.csv`; mimeType = 'text/csv'
      } else {
        content = JSON.stringify(data, null, 2); filename = `elmoghazi-backup-${todayStr}.json`; mimeType = 'application/json'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
      toast.success(`تم تصدير النسخة بصيغة ${format.toUpperCase()}`)
    } catch { toast.error('فشل تصدير النسخة') }
  }

  const importBackup = () => { fileInputRef.current?.click() }

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const text = await file.text()
      let data: any
      if (file.name.endsWith('.json')) { data = JSON.parse(text) }
      else if (file.name.endsWith('.csv')) { toast.info('جاري استيراد CSV...'); return }
      else { toast.error('صيغة الملف غير مدعومة'); return }

      if (data?.patients) { for (const p of data.patients) { await addItem('/patients', p, setPatients) } }
      if (data?.visits) { for (const v of data.visits) { await addItem('/visits', v, setVisits) } }
      if (data?.services) { for (const s of data.services) { await addItem('/services', s, setServices) } }
      toast.success(`تم استيراد البيانات من ${file.name}`)
    } catch { toast.error('فشل استيراد الملف') }
    e.target.value = ''
  }

  // ─── Bottom Nav Items ──────────────────────────────────────────────────

  const bottomNavItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard size={20} />, emoji: '🏠' },
    { id: 'patients', label: 'المرضى', icon: <Users size={20} />, emoji: '👥' },
    { id: 'laser', label: 'الليزر', icon: <Zap size={20} />, emoji: '💎' },
    { id: 'finance', label: 'المالية', icon: <DollarSign size={20} />, emoji: '💰' },
    { id: 'more', label: 'المزيد', icon: <MoreHorizontal size={20} />, emoji: '📋' },
  ]

  // ─── LOGIN SCREEN ───────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md mx-4">
          <Card className="glass-heavy border-emerald-700/30 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center mb-4 shadow-lg glow-emerald">
                <Stethoscope className="text-amber-300" size={48} />
              </div>
              <h1 className="text-3xl font-bold text-gradient-luxury">Elmoghazi Clinic</h1>
              <p className="text-emerald-200/80 mt-1 text-lg">عيادة المغازى للجلدية والتجميل</p>
              <p className="text-emerald-300/50 text-sm mt-1">نظام إدارة ذكي متكامل</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-emerald-200">البريد الإلكتروني</Label>
                <Input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="bg-emerald-900/50 border-emerald-600/30 text-white placeholder:text-emerald-400/50 input-luxury rounded-xl h-12" placeholder="doctor@elmoghazi.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-200">كلمة المرور</Label>
                <Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="bg-emerald-900/50 border-emerald-600/30 text-white placeholder:text-emerald-400/50 input-luxury rounded-xl h-12" placeholder="••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogin} disabled={loginLoading} className="w-full bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-6 text-lg btn-luxury rounded-xl shadow-lg">
                {loginLoading ? <RefreshCw className="animate-spin ml-2" size={20} /> : <Sparkles className="ml-2" size={20} />}
                تسجيل الدخول
              </Button>
            </CardFooter>
          </Card>
          <p className="text-center text-emerald-400/60 text-xs mt-4">doctor@elmoghazi.com / 123456</p>
        </motion.div>
      </div>
    )
  }

  // ─── MAIN RENDER ────────────────────────────────────────────────────────

  const currentTheme = THEME_CONFIGS.find(t => t.id === theme) || THEME_CONFIGS[0]
  const sectionStyle = SECTION_STYLES[activeTab] || SECTION_STYLES.dashboard

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Top Bar ──────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Stethoscope className="text-amber-300" size={16} />
          </div>
          <span className="font-bold text-sm text-gradient-luxury hidden sm:block">Elmoghazi</span>
        </div>

        {/* Smart Search Trigger */}
        <button onClick={() => setSmartSearchOpen(true)} className="flex-1 max-w-md flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground text-sm hover:bg-muted transition-colors cursor-pointer">
          <Search size={16} />
          <span>بحث ذكي...</span>
          <kbd className="mr-auto text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border hidden sm:block">Ctrl+K</kbd>
        </button>

        <div className="flex items-center gap-1 mr-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell size={18} />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">{activeAlerts.length}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {activeAlerts.length === 0 ? <div className="p-4 text-center text-muted-foreground text-sm">لا توجد تنبيهات</div> :
                activeAlerts.slice(0, 5).map(a => (
                  <DropdownMenuItem key={a.id} className="gap-2 p-3">
                    <AlertTriangle className={cn('shrink-0', a.type === 'danger' ? 'text-red-500' : 'text-amber-500')} size={16} />
                    <span className="text-sm truncate">{a.message}</span>
                  </DropdownMenuItem>
                ))
              }
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={loadAllData} title="تحديث">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setAiChatOpen(true)}>
            <Bot size={16} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Avatar className="h-8 w-8 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{user?.name?.charAt(0) || 'د'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2 border-b border-border">
                <p className="font-medium text-sm">{safeName(user?.name)}</p>
                <p className="text-xs text-muted-foreground">{user?.role === 'doctor' ? 'طبيب' : user?.role === 'secretary' ? 'سكرتير' : 'مدير'}</p>
              </div>
              <DropdownMenuItem onClick={() => setActiveTab('settings')} className="gap-2"><Settings size={14} /> الإعدادات</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { logout(); toast.success('تم تسجيل الخروج') }} className="gap-2 text-red-500"><LogOut size={14} /> خروج</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ─── Page Content ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 md:px-6 pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>

            {/* ═══ DASHBOARD ═══ */}
            {activeTab === 'dashboard' && (
              <div className="space-y-5">
                {/* Section Header with animated background */}
                <div className={cn('section-header-animated rounded-2xl', sectionStyle.lightBg, sectionStyle.darkBg)}>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">
                          {sectionStyle.emoji}
                        </motion.div>
                        <div>
                          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
                          <p className="text-muted-foreground text-sm">مرحباً، {safeName(user?.name)}</p>
                        </div>
                      </div>
                      <Badge className="badge-gold text-sm">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Badge>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: <Users className="text-emerald-100" size={20} />, label: 'إجمالي المرضى', value: patients.length, color: 'bg-gradient-to-br from-emerald-600 to-emerald-800', sub: `+${patients.filter(p => p.createdAt?.startsWith(todayStr)).length} اليوم` },
                    { icon: <Stethoscope className="text-blue-100" size={20} />, label: 'زيارات اليوم', value: todayVisits.length, color: 'bg-gradient-to-br from-blue-600 to-blue-800' },
                    { icon: <DollarSign className="text-amber-100" size={20} />, label: 'إيراد اليوم', value: formatCurrency(todayIncome), color: 'bg-gradient-to-br from-amber-500 to-amber-700' },
                    { icon: <Calendar className="text-purple-100" size={20} />, label: 'مواعيد اليوم', value: todayAppointments.length, color: 'bg-gradient-to-br from-purple-600 to-purple-800', sub: `${todayAppointments.filter(a => a.status === 'completed').length} مكتمل` },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="section-card p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2.5 rounded-xl shadow-lg', s.color)}>{s.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-muted-foreground truncate">{s.label}</p>
                          <p className="text-xl font-bold mt-0.5">{s.value}</p>
                          {s.sub && <p className="text-[10px] text-muted-foreground">{s.sub}</p>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="card-luxury lg:col-span-2">
                    <CardHeader><CardTitle className="text-lg">الإيرادات والمصروفات</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                          <RechartsTooltip />
                          <Bar dataKey="إيراد" fill="#047857" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="مصروف" fill="#D4A843" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="card-luxury">
                    <CardHeader><CardTitle className="text-lg">توزيع المرضى</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {genderData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions Grid */}
                <Card className="card-luxury">
                  <CardHeader><CardTitle className="text-lg">إجراءات سريعة</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {[
                        { label: 'مريض جديد', icon: <UserPlus size={20} />, color: 'bg-blue-500', action: () => setShowAddPatient(true) },
                        { label: 'زيارة جديدة', icon: <Stethoscope size={20} />, color: 'bg-violet-500', action: () => setShowAddVisit(true) },
                        { label: 'جلسة جديدة', icon: <Activity size={20} />, color: 'bg-orange-500', action: () => setShowAddSession(true) },
                        { label: 'موعد جديد', icon: <Calendar size={20} />, color: 'bg-purple-500', action: () => setShowAddAppointment(true) },
                        { label: 'مساعد ذكي', icon: <Bot size={20} />, color: 'bg-emerald-500', action: () => setAiChatOpen(true) },
                      ].map((a, i) => (
                        <motion.button key={i} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={a.action} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                          <div className={cn('p-3 rounded-xl text-white shadow-lg', a.color)}>{a.icon}</div>
                          <span className="text-xs font-medium">{a.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Smart Alerts */}
                {activeAlerts.length > 0 && (
                  <Card className="card-luxury border-red-200 dark:border-red-900/30">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="text-amber-500" size={20} /> تنبيهات ذكية</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {activeAlerts.slice(0, 5).map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                          <AlertTriangle className={cn('shrink-0', a.type === 'danger' ? 'text-red-500' : 'text-amber-500')} size={16} />
                          <span className="text-sm">{a.message}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recent Patients */}
                <Card className="card-luxury">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">أحدث المرضى</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('patients')} className="text-primary">عرض الكل</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patients.slice(0, 5).map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => { setSelectedPatient(p); setActiveTab('patients') }}>
                          <Avatar className="h-10 w-10 border border-primary/20"><AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">{p.name?.charAt(0)}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{safeName(p.name)}</p><p className="text-xs text-muted-foreground">{p.phone || 'بدون رقم'}</p></div>
                          <Badge variant="outline" className="text-[10px]">{p.fileNumber}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══ PATIENTS ═══ */}
            {activeTab === 'patients' && !selectedPatient && (
              <div className="space-y-5">
                <div className={cn('section-header-animated rounded-2xl', SECTION_STYLES.patients.lightBg, SECTION_STYLES.patients.darkBg)}>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">👥</motion.div>
                      <div><h1 className="text-2xl font-bold">إدارة المرضى</h1><p className="text-muted-foreground text-sm">{patients.length} مريض مسجل</p></div>
                    </div>
                    <Button className="btn-luxury bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-lg" onClick={() => setShowAddPatient(true)}><UserPlus size={16} className="ml-2" /> مريض جديد</Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input placeholder="بحث بالاسم أو الهاتف أو رقم الملف..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10 input-luxury rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  {filteredPatients.map(p => (
                    <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="section-card p-4 cursor-pointer" onClick={() => setSelectedPatient(p)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800"><AvatarFallback className="bg-blue-500/10 text-blue-600 font-bold">{p.name?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2"><p className="font-bold truncate">{safeName(p.name)}</p>{p.starred && <Star className="text-amber-500 fill-amber-500" size={14} />}</div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Hash size={10} />{p.fileNumber}</span>
                            {p.phone && <span className="flex items-center gap-1"><Phone size={10} />{p.phone}</span>}
                            {p.age && <span>{p.age} سنة</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn('text-[10px]', p.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400')}>{p.gender === 'male' ? 'ذكر' : 'أنثى'}</Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); addItem('/alerts', { patientId: p.id, type: 'info', message: `تذكير: مريض ${p.name}` }, setAlerts) }}><Phone size={14} /></Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ PATIENT DETAIL ═══ */}
            {activeTab === 'patients' && selectedPatient && (
              <div className="space-y-4">
                <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 text-primary text-sm font-medium hover:underline"><ChevronRight size={16} /> العودة للقائمة</button>
                <div className={cn('section-header-animated rounded-2xl', SECTION_STYLES.patients.lightBg, SECTION_STYLES.patients.darkBg)}>
                  <div className="relative z-10 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/30"><AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{selectedPatient.name?.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <div className="flex items-center gap-2"><h2 className="text-2xl font-bold">{safeName(selectedPatient.name)}</h2><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateItem('/patients', { id: selectedPatient.id, starred: !selectedPatient.starred }, setPatients)}>{selectedPatient.starred ? <Star className="text-amber-500 fill-amber-500" size={16} /> : <StarOff size={16} />}</Button></div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><span>{selectedPatient.fileNumber}</span>{selectedPatient.phone && <span>{selectedPatient.phone}</span>}{selectedPatient.age && <span>{selectedPatient.age} سنة</span>}</div>
                    </div>
                  </div>
                </div>
                <Tabs value={patientDetailTab} onValueChange={setPatientDetailTab}>
                  <TabsList className="w-full flex"><TabsTrigger value="overview" className="flex-1">نظرة عامة</TabsTrigger><TabsTrigger value="visits" className="flex-1">الزيارات</TabsTrigger><TabsTrigger value="sessions" className="flex-1">الجلسات</TabsTrigger><TabsTrigger value="laser" className="flex-1">الليزر</TabsTrigger><TabsTrigger value="prescriptions" className="flex-1">الوصفات</TabsTrigger></TabsList>
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="card-luxury"><CardHeader><CardTitle className="text-sm">معلومات أساسية</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
                        {selectedPatient.phone && <p><span className="text-muted-foreground">الهاتف:</span> {selectedPatient.phone}</p>}
                        {selectedPatient.phone2 && <p><span className="text-muted-foreground">هاتف آخر:</span> {selectedPatient.phone2}</p>}
                        {selectedPatient.address && <p><span className="text-muted-foreground">العنوان:</span> {selectedPatient.address}</p>}
                        {selectedPatient.bloodType && <p><span className="text-muted-foreground">فصيلة الدم:</span> {selectedPatient.bloodType}</p>}
                      </CardContent></Card>
                      <Card className="card-luxury"><CardHeader><CardTitle className="text-sm">معلومات طبية</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
                        {selectedPatient.allergies && <p><span className="text-muted-foreground">الحساسية:</span> {selectedPatient.allergies}</p>}
                        {selectedPatient.medicalHistory && <p><span className="text-muted-foreground">التاريخ المرضي:</span> {selectedPatient.medicalHistory}</p>}
                        {selectedPatient.notes && <p><span className="text-muted-foreground">ملاحظات:</span> {selectedPatient.notes}</p>}
                      </CardContent></Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="visits" className="mt-4"><div className="space-y-3">
                    <Button size="sm" className="btn-luxury" onClick={() => setShowAddVisit(true)}><Plus size={14} className="ml-1" /> زيارة جديدة</Button>
                    {visits.filter(v => v.patientId === selectedPatient.id).map(v => (
                      <Card key={v.id} className="p-4"><div className="flex items-center justify-between"><div><Badge variant="outline">{v.type}</Badge><p className="text-sm mt-1">{v.diagnosis || 'بدون تشخيص'}</p></div><span className="text-xs text-muted-foreground">{formatDate(v.date)}</span></div></Card>
                    ))}
                  </div></TabsContent>
                  <TabsContent value="sessions" className="mt-4"><div className="space-y-3">
                    <Button size="sm" className="btn-luxury" onClick={() => setShowAddSession(true)}><Plus size={14} className="ml-1" /> جلسة جديدة</Button>
                    {sessions.filter(s => s.patientId === selectedPatient.id).map(s => (
                      <Card key={s.id} className="p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Badge variant="outline" style={{ backgroundColor: statusColors[s.status as keyof typeof statusColors] + '20', color: statusColors[s.status as keyof typeof statusColors], borderColor: statusColors[s.status as keyof typeof statusColors] + '40' }}>{s.status}</Badge><span className="text-sm">{formatCurrency(s.price)}</span></div><span className="text-xs text-muted-foreground">{formatDate(s.date)}</span></div></Card>
                    ))}
                  </div></TabsContent>
                  <TabsContent value="laser" className="mt-4"><div className="space-y-3">
                    {laserRecords.filter(l => l.patientId === selectedPatient.id).map(l => (
                      <Card key={l.id} className="p-4"><div className="flex items-center justify-between"><div><p className="font-medium">{l.bodyArea}</p><p className="text-xs text-muted-foreground">{l.totalSessions} جلسات</p></div><Badge style={{ backgroundColor: statusColors[l.status as keyof typeof statusColors] + '20', color: statusColors[l.status as keyof typeof statusColors] }}>{l.status}</Badge></div></Card>
                    ))}
                  </div></TabsContent>
                  <TabsContent value="prescriptions" className="mt-4"><div className="space-y-3">
                    <Button size="sm" className="btn-luxury" onClick={() => setShowAddPrescription(true)}><Plus size={14} className="ml-1" /> وصفة جديدة</Button>
                    {prescriptions.filter(p => p.patientId === selectedPatient.id).map(p => (
                      <Card key={p.id} className="p-4"><div className="flex items-center justify-between"><p className="text-sm">{p.diagnosis || 'وصفة طبية'}</p><span className="text-xs text-muted-foreground">{formatDate(p.date)}</span></div></Card>
                    ))}
                  </div></TabsContent>
                </Tabs>
              </div>
            )}

            {/* ═══ LASER ═══ */}
            {activeTab === 'laser' && (
              <div className="space-y-5">
                <div className={cn('section-header-animated rounded-2xl', SECTION_STYLES.laser.lightBg, SECTION_STYLES.laser.darkBg)}>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }} className="text-4xl">💎</motion.div>
                      <div><h1 className="text-2xl font-bold">إدارة الليزر</h1><p className="text-muted-foreground text-sm">{laserRecords.length} سجل ليزر</p></div>
                    </div>
                  </div>
                </div>
                <Tabs value={laserSubTab} onValueChange={setLaserSubTab}>
                  <TabsList className="w-full flex"><TabsTrigger value="records" className="flex-1">السجلات</TabsTrigger><TabsTrigger value="packages" className="flex-1">الباقات</TabsTrigger><TabsTrigger value="settings" className="flex-1">الإعدادات</TabsTrigger></TabsList>
                  <TabsContent value="records" className="space-y-3 mt-4">
                    <Button className="btn-luxury" onClick={() => setShowAddLaserRecord(true)}><Plus size={14} className="ml-1" /> سجل جديد</Button>
                    {laserRecords.map(r => {
                      const p = patients.find(pt => pt.id === r.patientId)
                      return <Card key={r.id} className="section-card p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30"><Zap className="text-cyan-600 dark:text-cyan-400" size={18} /></div><div><p className="font-medium text-sm">{p?.name || 'مريض'}</p><p className="text-xs text-muted-foreground">{r.bodyArea} - {r.totalSessions} جلسات</p></div></div><Badge style={{ backgroundColor: statusColors[r.status as keyof typeof statusColors] + '20', color: statusColors[r.status as keyof typeof statusColors] }}>{r.status}</Badge></div></Card>
                    })}
                  </TabsContent>
                  <TabsContent value="packages" className="space-y-3 mt-4">
                    <Button className="btn-luxury" onClick={() => setShowAddLaserPackage(true)}><Plus size={14} className="ml-1" /> باقة جديدة</Button>
                    {laserPackages.map(p => <Card key={p.id} className="section-card p-4"><div className="flex items-center justify-between"><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.sessionsCount} جلسة - {formatCurrency(p.price)}</p></div><Badge variant="outline" className={p.active ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-500'}>{p.active ? 'نشط' : 'معطل'}</Badge></div></Card>)}
                  </TabsContent>
                  <TabsContent value="settings" className="mt-4"><Card className="card-luxury p-4"><p className="text-sm text-muted-foreground">إعدادات أجهزة الليزر</p></Card></TabsContent>
                </Tabs>
              </div>
            )}

            {/* ═══ FINANCE ═══ */}
            {activeTab === 'finance' && (
              <div className="space-y-5">
                <div className={cn('section-header-animated rounded-2xl', SECTION_STYLES.finance.lightBg, SECTION_STYLES.finance.darkBg)}>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="text-4xl">💰</motion.div>
                      <div><h1 className="text-2xl font-bold">الإدارة المالية</h1><p className="text-muted-foreground text-sm">إيرادات ومصروفات العيادة</p></div>
                    </div>
                    <Button className="btn-luxury bg-gradient-to-l from-amber-500 to-amber-600 text-white shadow-lg" onClick={() => setShowAddTransaction(true)}><Plus size={14} className="ml-1" /> معاملة جديدة</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">إجمالي الإيرادات</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30"><TrendingUp className="text-red-600 rotate-180" size={20} /></div><div><p className="text-[11px] text-muted-foreground">إجمالي المصروفات</p><p className="text-xl font-bold text-red-600">{formatCurrency(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}</p></div></div></Card>
                </div>
                <div className="space-y-2">
                  {transactions.slice(0, 30).map(t => (
                    <Card key={t.id} className="section-card p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-2 rounded-lg', t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30')}><DollarSign className={t.type === 'income' ? 'text-emerald-600' : 'text-red-600'} size={16} /></div><div><p className="font-medium text-sm">{t.description || t.category}</p><p className="text-xs text-muted-foreground">{formatDate(t.date)}</p></div></div><span className={cn('font-bold', t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span></div></Card>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ MORE ═══ */}
            {activeTab === 'more' && (
              <div className="space-y-5">
                <div className={cn('section-header-animated rounded-2xl', SECTION_STYLES.more.lightBg, SECTION_STYLES.more.darkBg)}>
                  <div className="relative z-10 flex items-center gap-3">
                    <motion.div animate={{ rotate: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">📋</motion.div>
                    <div><h1 className="text-2xl font-bold">المزيد</h1><p className="text-muted-foreground text-sm">خدمات وأدوات إضافية</p></div>
                  </div>
                </div>

                {/* Section Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'services', label: 'الخدمات', emoji: '⚙️', color: 'from-teal-500 to-teal-700', count: services.length },
                    { id: 'visits', label: 'الزيارات', emoji: '🩺', color: 'from-violet-500 to-violet-700', count: visits.length },
                    { id: 'sessions', label: 'الجلسات', emoji: '⚡', color: 'from-orange-500 to-orange-700', count: sessions.length },
                    { id: 'appointments', label: 'المواعيد', emoji: '📅', color: 'from-purple-500 to-purple-700', count: appointments.length },
                    { id: 'inventory', label: 'المخزون', emoji: '📦', color: 'from-amber-500 to-amber-700', count: inventoryItems.length },
                    { id: 'medications', label: 'الأدوية', emoji: '💊', color: 'from-green-500 to-green-700', count: medications.length },
                    { id: 'reminders', label: 'التذكيرات', emoji: '⏰', color: 'from-rose-500 to-rose-700', count: reminders.length },
                    { id: 'backup', label: 'النسخ الاحتياطي', emoji: '💾', color: 'from-slate-500 to-slate-700', count: backups.length },
                    { id: 'settings', label: 'الإعدادات', emoji: '🎨', color: 'from-indigo-500 to-indigo-700', count: 0 },
                  ].map(s => (
                    <motion.button key={s.id} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} onClick={() => setMoreSubTab(s.id)} className={cn('section-card p-4 text-center', moreSubTab === s.id && 'ring-2 ring-primary')}>
                      <motion.div animate={moreSubTab === s.id ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: moreSubTab === s.id ? Infinity : 0, repeatDelay: 2 }} className="text-3xl mb-2">{s.emoji}</motion.div>
                      <p className="font-medium text-sm">{s.label}</p>
                      {s.count > 0 && <Badge variant="secondary" className="text-[10px] mt-1">{s.count}</Badge>}
                    </motion.button>
                  ))}
                </div>

                {/* Sub-tab Content */}
                {moreSubTab === 'services' && (
                  <div className="space-y-3">
                    <Button className="btn-luxury" onClick={() => setShowAddService(true)}><Plus size={14} className="ml-1" /> خدمة جديدة</Button>
                    {services.map(s => <Card key={s.id} className="section-card p-4"><div className="flex items-center justify-between"><div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.category || 'عام'} - {formatCurrency(s.price)}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteItem('/services', s.id, setServices)}><Trash2 size={14} /></Button></div></div></Card>)}
                  </div>
                )}
                {moreSubTab === 'visits' && (
                  <div className="space-y-3">
                    <Button className="btn-luxury" onClick={() => setShowAddVisit(true)}><Plus size={14} className="ml-1" /> زيارة جديدة</Button>
                    {visits.slice(0, 30).map(v => { const p = patients.find(pt => pt.id === v.patientId); return <Card key={v.id} className="section-card p-4"><div className="flex items-center justify-between"><div><p className="font-medium text-sm">{p?.name || 'مريض'}</p><p className="text-xs text-muted-foreground">{v.type} - {v.diagnosis || 'بدون تشخيص'}</p></div><span className="text-xs text-muted-foreground">{formatDate(v.date)}</span></div></Card> })}
                  </div>
                )}
                {moreSubTab === 'sessions' && (
                  <div className="space-y-3">
                    <Button className="btn-luxury" onClick={() => setShowAddSession(true)}><Plus size={14} className="ml-1" /> جلسة جديدة</Button>
                    {sessions.slice(0, 30).map(s => { const p = patients.find(pt => pt.id === s.patientId); return <Card key={s.id} className="section-card p-4"><div className="flex items-center justify-between"><div><p className="font-medium text-sm">{p?.name || 'مريض'}</p><p className="text-xs text-muted-foreground">{formatCurrency(s.price)} - {s.paid ? 'مدفوع' : 'غير مدفوع'}</p></div><Badge style={{ backgroundColor: statusColors[s.status as keyof typeof statusColors] + '20', color: statusColors[s.status as keyof typeof statusColors] }}>{s.status}</Badge></div></Card> })}
                  </div>
                )}
                {moreSubTab === 'appointments' && (
                  <div className="space-y-3">
                    <Button className="btn-luxury" onClick={() => setShowAddAppointment(true)}><Plus size={14} className="ml-1" /> موعد جديد</Button>
                    {appointments.slice(0, 30).map(a => { const p = patients.find(pt => pt.id === a.patientId); return <Card key={a.id} className="section-card p-4"><div className="flex items-center justify-between"><div><p className="font-medium text-sm">{p?.name || 'موعد'}</p><p className="text-xs text-muted-foreground">{a.type} - {a.duration} دقيقة</p></div><Badge style={{ backgroundColor: statusColors[a.status as keyof typeof statusColors] + '20', color: statusColors[a.status as keyof typeof statusColors] }}>{a.status}</Badge></div></Card> })}
                  </div>
                )}
                {moreSubTab === 'inventory' && (
                  <div className="space-y-3">
                    <Button className="btn-luxury" onClick={() => setShowAddInventory(true)}><Plus size={14} className="ml-1" /> عنصر جديد</Button>
                    {inventoryItems.map(i => <Card key={i.id} className={cn('section-card p-4', i.quantity <= i.minQuantity && 'border-red-300 dark:border-red-800')}><div className="flex items-center justify-between"><div><p className="font-medium text-sm">{i.name}</p><p className="text-xs text-muted-foreground">{i.category || 'عام'} - الكمية: {i.quantity}</p></div>{i.quantity <= i.minQuantity && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">منخفض</Badge>}</div></Card>)}
                  </div>
                )}
                {moreSubTab === 'medications' && (
                  <div className="space-y-3">
                    <Button className="btn-luxury" onClick={() => setShowAddMedication(true)}><Plus size={14} className="ml-1" /> دواء جديد</Button>
                    {medications.map(m => <Card key={m.id} className="section-card p-4"><div className="flex items-center justify-between"><div><p className="font-medium text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.category || 'عام'} - {m.dosage || ''}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteItem('/medications', m.id, setMedications)}><Trash2 size={14} /></Button></div></div></Card>)}
                  </div>
                )}
                {moreSubTab === 'reminders' && (
                  <div className="space-y-3">
                    <Button className="btn-luxury" onClick={() => setShowAddReminder(true)}><Plus size={14} className="ml-1" /> تذكير جديد</Button>
                    {reminders.map(r => <Card key={r.id} className="section-card p-4"><div className="flex items-center justify-between"><div><p className="font-medium text-sm">{r.title}</p><p className="text-xs text-muted-foreground">{r.description || ''} - {formatDate(r.date)}</p></div><Badge variant="outline">{r.status}</Badge></div></Card>)}
                  </div>
                )}

                {/* ═══ BACKUP SECTION ═══ */}
                {moreSubTab === 'backup' && (
                  <div className="space-y-4">
                    <Card className="card-luxury">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Database size={20} /> النسخ الاحتياطي</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {/* Auto Backup */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Timer className="text-blue-600" size={18} /></div>
                            <div><p className="font-medium text-sm">نسخ احتياطي تلقائي</p><p className="text-xs text-muted-foreground">يتم النسخ تلقائياً كل فترة محددة</p></div>
                          </div>
                          <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
                        </div>
                        {autoBackup && (
                          <div className="flex items-center gap-3 px-4">
                            <Label className="text-sm">كل</Label>
                            <Select value={String(backupInterval)} onValueChange={v => setBackupInterval(Number(v))}>
                              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 دقيقة</SelectItem>
                                <SelectItem value="30">30 دقيقة</SelectItem>
                                <SelectItem value="60">ساعة</SelectItem>
                                <SelectItem value="360">6 ساعات</SelectItem>
                                <SelectItem value="720">12 ساعة</SelectItem>
                                <SelectItem value="1440">يومياً</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {lastBackup && <p className="text-xs text-muted-foreground px-4">آخر نسخة: {formatDate(lastBackup)}</p>}

                        {/* Manual Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <motion.button whileTap={{ scale: 0.95 }} onClick={createBackup} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-200 dark:border-emerald-800">
                            <HardDrive className="text-emerald-600" size={24} />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">إنشاء نسخة</span>
                            <span className="text-[10px] text-muted-foreground">نسخ احتياطي يدوي</span>
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => exportBackup('json')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800">
                            <FileDown className="text-blue-600" size={24} />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">تصدير نسخة</span>
                            <span className="text-[10px] text-muted-foreground">JSON / CSV</span>
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={importBackup} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors border border-amber-200 dark:border-amber-800">
                            <FileUp className="text-amber-600" size={24} />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">استيراد نسخة</span>
                            <span className="text-[10px] text-muted-foreground">JSON / CSV</span>
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => exportBackup('csv')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors border border-violet-200 dark:border-violet-800">
                            <Archive className="text-violet-600" size={24} />
                            <span className="text-sm font-medium text-violet-700 dark:text-violet-400">تصدير CSV</span>
                            <span className="text-[10px] text-muted-foreground">للجداول والبرامج الأخرى</span>
                          </motion.button>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".json,.csv" className="hidden" onChange={handleFileImport} />

                        {/* Existing Backups */}
                        {backups.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <p className="text-sm font-medium">النسخ الاحتياطية السابقة</p>
                            {backups.map(b => (
                              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                                <div className="flex items-center gap-2"><Database size={14} className="text-muted-foreground" /><span>{b.type === 'auto' ? 'تلقائي' : 'يدوي'}</span></div>
                                <div className="flex items-center gap-2"><Badge variant="outline" className={b.status === 'completed' ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}>{b.status === 'completed' ? 'مكتمل' : b.status}</Badge><span className="text-xs text-muted-foreground">{formatDate(b.createdAt)}</span></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ═══ SETTINGS SECTION ═══ */}
                {moreSubTab === 'settings' && (
                  <div className="space-y-4">
                    {/* Color Theme Selection */}
                    <Card className="card-luxury">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Palette size={20} /> تخصيص ألوان التطبيق</CardTitle><CardDescription>اختر من 10 ألوان مميزة</CardDescription></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-5 gap-3">
                          {THEME_CONFIGS.map(tc => (
                            <motion.button key={tc.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} onClick={() => setTheme(tc.id)} className={cn('theme-swatch flex flex-col items-center justify-center gap-1 p-2', theme === tc.id && 'selected')} style={{ background: `linear-gradient(135deg, ${tc.primary}, ${tc.primaryDark})` }}>
                              <span className="text-xl">{tc.icon}</span>
                              <span className="text-[9px] font-bold text-white/90 truncate w-full text-center">{tc.name}</span>
                              {theme === tc.id && <CheckCircle className="text-white absolute top-1 right-1" size={14} />}
                            </motion.button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Status Color Customization */}
                    <Card className="card-luxury">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Tag size={20} /> تخصيص ألوان الحالات</CardTitle><CardDescription>اختر ألوان لحالات المرضى والجلسات</CardDescription></CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { key: 'completed' as const, label: 'مكتمل', defaultColor: '#10b981' },
                          { key: 'active' as const, label: 'نشط', defaultColor: '#3b82f6' },
                          { key: 'pending' as const, label: 'قيد الانتظار', defaultColor: '#f59e0b' },
                          { key: 'cancelled' as const, label: 'ملغي', defaultColor: '#ef4444' },
                          { key: 'scheduled' as const, label: 'مجدول', defaultColor: '#8b5cf6' },
                        ].map(s => (
                          <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span className="text-sm font-medium">{s.label}</span>
                            <div className="flex items-center gap-2">
                              <input type="color" value={statusColors[s.key]} onChange={e => setStatusColors({ ...statusColors, [s.key]: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border-0" />
                              <Badge style={{ backgroundColor: statusColors[s.key] + '20', color: statusColors[s.key], borderColor: statusColors[s.key] + '40' }} className="border">{statusColors[s.key]}</Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* General Settings */}
                    <Card className="card-luxury">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Settings size={20} /> إعدادات عامة</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div><p className="text-sm font-medium">الوضع الداكن</p><p className="text-xs text-muted-foreground">تبديل المظهر</p></div>
                          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div><p className="text-sm font-medium">حساب المشرف</p><p className="text-xs text-muted-foreground">{user?.email}</p></div>
                          <Badge variant="outline">{user?.role === 'doctor' ? 'طبيب' : user?.role === 'secretary' ? 'سكرتير' : 'مدير'}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* ═══ SETTINGS (direct tab) ═══ */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="section-header-animated rounded-2xl bg-indigo-50 dark:bg-indigo-950/30">
                  <div className="relative z-10 flex items-center gap-3">
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="text-4xl">🎨</motion.div>
                    <div><h1 className="text-2xl font-bold">الإعدادات</h1><p className="text-muted-foreground text-sm">تخصيص التطبيق</p></div>
                  </div>
                </div>
                {/* Same settings content as in more/settings */}
                <Card className="card-luxury">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Palette size={20} /> ألوان التطبيق</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-3">
                      {THEME_CONFIGS.map(tc => (
                        <motion.button key={tc.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} onClick={() => setTheme(tc.id)} className={cn('theme-swatch flex flex-col items-center justify-center gap-1 p-2', theme === tc.id && 'selected')} style={{ background: `linear-gradient(135deg, ${tc.primary}, ${tc.primaryDark})` }}>
                          <span className="text-xl">{tc.icon}</span>
                          <span className="text-[9px] font-bold text-white/90 truncate w-full text-center">{tc.name}</span>
                          {theme === tc.id && <CheckCircle className="text-white absolute top-1 right-1" size={14} />}
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Bottom Navigation Bar ──────────────────────────────────────── */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {bottomNavItems.map(item => {
            const isActive = activeTab === item.id || (item.id === 'more' && ['more', 'settings'].includes(activeTab))
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); if (item.id === 'patients') setSelectedPatient(null) }} className={cn('bottom-nav-item', isActive && 'active')}>
                <div className="nav-icon-wrapper">
                  {isActive ? <span className="text-xl">{item.emoji}</span> : item.icon}
                </div>
                <span className="nav-label">{item.label}</span>
                {item.id === 'more' && lowStockItems.length > 0 && (
                  <span className="absolute top-1 left-1/2 w-3 h-3 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center">{lowStockItems.length}</span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ─── Smart Search Overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {smartSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="smart-search-overlay" onClick={() => setSmartSearchOpen(false)} />
            <div className="smart-search-panel">
              <Card className="border-0 shadow-2xl">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Search size={20} className="text-primary" />
                    <Input value={smartSearchQuery} onChange={e => setSmartSearchQuery(e.target.value)} placeholder="بحث ذكي في كل البيانات..." className="border-0 focus-visible:ring-0 text-lg" autoFocus />
                    <Button variant="ghost" size="icon" onClick={() => setSmartSearchOpen(false)}><X size={18} /></Button>
                  </div>
                </div>
                <ScrollArea className="max-h-[50vh]">
                  {smartSearchQuery && smartSearchResults.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground"><Search size={32} className="mx-auto mb-2 opacity-30" /><p>لا توجد نتائج</p></div>
                  )}
                  {smartSearchResults.map((r, i) => (
                    <button key={`${r.type}-${r.id}`} onClick={() => {
                      if (r.type === 'patient') { const p = patients.find(p => p.id === r.id); if (p) { setSelectedPatient(p); setActiveTab('patients') } }
                      setSmartSearchOpen(false); setSmartSearchQuery('')
                    }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-right">
                      <div className="p-1.5 rounded-lg bg-muted">{r.icon}</div>
                      <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{r.label}</p><p className="text-xs text-muted-foreground truncate">{r.sub}</p></div>
                      <Badge variant="outline" className="text-[9px]">{r.type === 'patient' ? 'مريض' : r.type === 'visit' ? 'زيارة' : r.type === 'service' ? 'خدمة' : 'دواء'}</Badge>
                    </button>
                  ))}
                </ScrollArea>
                {smartSearchQuery && smartSearchResults.length > 0 && (
                  <div className="p-3 border-t border-border text-center"><p className="text-xs text-muted-foreground">{smartSearchResults.length} نتيجة</p></div>
                )}
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AI Chat Drawer ────────────────────────────────────────────── */}
      <Dialog open={aiChatOpen} onOpenChange={setAiChatOpen}>
        <DialogContent className="max-w-md h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bot size={20} className="text-primary" /> المساعد الذكي</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-3">
              {aiMessages.length === 0 && <div className="text-center text-muted-foreground text-sm py-8"><Bot size={40} className="mx-auto mb-2 opacity-30" /><p>مرحباً! أنا مساعدك الذكي</p><p className="text-xs mt-1">اسألني عن أي شيء يتعلق بالعيادة</p></div>}
              {aiMessages.map((m, i) => (
                <div key={i} className={cn('p-3 rounded-xl text-sm max-w-[85%]', m.role === 'user' ? 'bg-primary text-primary-foreground mr-auto' : 'bg-muted ml-auto')}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
              {aiLoading && <div className="bg-muted p-3 rounded-xl ml-auto max-w-[85%]"><RefreshCw className="animate-spin text-muted-foreground" size={16} /></div>}
            </div>
          </ScrollArea>
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="اكتب سؤالك..." className="flex-1 input-luxury rounded-xl" onKeyDown={e => e.key === 'Enter' && sendAiMessage()} />
            <Button onClick={sendAiMessage} size="icon" className="rounded-xl"><Send size={16} /></Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Add Patient Dialog ────────────────────────────────────────── */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>إضافة مريض جديد</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>الاسم *</Label><Input id="pName" placeholder="اسم المريض" className="input-luxury rounded-xl" /></div>
            <div><Label>الهاتف</Label><Input id="pPhone" placeholder="رقم الهاتف" className="input-luxury rounded-xl" /></div>
            <div><Label>هاتف آخر</Label><Input id="pPhone2" placeholder="رقم إضافي" className="input-luxury rounded-xl" /></div>
            <div><Label>العمر</Label><Input id="pAge" type="number" placeholder="العمر" className="input-luxury rounded-xl" /></div>
            <div><Label>الجنس</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="الجنس" /></SelectTrigger><SelectContent><SelectItem value="male">ذكر</SelectItem><SelectItem value="female">أنثى</SelectItem></SelectContent></Select></div>
            <div className="col-span-2"><Label>العنوان</Label><Input id="pAddr" placeholder="العنوان" className="input-luxury rounded-xl" /></div>
            <div className="col-span-2"><Label>الحساسية</Label><Input id="pAllergy" placeholder="أي حساسية" className="input-luxury rounded-xl" /></div>
            <div className="col-span-2"><Label>التاريخ المرضي</Label><Textarea id="pHistory" placeholder="التاريخ المرضي" className="input-luxury rounded-xl" /></div>
            <div className="col-span-2"><Label>ملاحظات</Label><Textarea id="pNotes" placeholder="ملاحظات إضافية" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const name = (document.getElementById('pName') as HTMLInputElement)?.value
              if (!name) return toast.error('الاسم مطلوب')
              addItem('/patients', { name, phone: (document.getElementById('pPhone') as HTMLInputElement)?.value, phone2: (document.getElementById('pPhone2') as HTMLInputElement)?.value, age: parseInt((document.getElementById('pAge') as HTMLInputElement)?.value) || null, gender: (document.querySelector('[data-state="checked"]')?.getAttribute('data-value')) || null, address: (document.getElementById('pAddr') as HTMLInputElement)?.value, allergies: (document.getElementById('pAllergy') as HTMLInputElement)?.value, medicalHistory: (document.getElementById('pHistory') as HTMLTextAreaElement)?.value, notes: (document.getElementById('pNotes') as HTMLTextAreaElement)?.value }, setPatients)
              setShowAddPatient(false)
            }} className="btn-luxury rounded-xl">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Visit Dialog ──────────────────────────────────────────── */}
      <Dialog open={showAddVisit} onOpenChange={setShowAddVisit}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>زيارة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>المريض</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>نوع الزيارة</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="النوع" /></SelectTrigger><SelectContent><SelectItem value="consultation">استشارة</SelectItem><SelectItem value="followup">متابعة</SelectItem><SelectItem value="emergency">طوارئ</SelectItem></SelectContent></Select></div>
            <div><Label>التشخيص</Label><Textarea id="vDiag" placeholder="التشخيص" className="input-luxury rounded-xl" /></div>
            <div><Label>ملاحظات</Label><Textarea id="vNotes" placeholder="ملاحظات" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/visits', { patientId: selectedPatient?.id || patients[0]?.id, type: 'consultation', diagnosis: (document.getElementById('vDiag') as HTMLTextAreaElement)?.value, notes: (document.getElementById('vNotes') as HTMLTextAreaElement)?.value, date: new Date().toISOString() }, setVisits); setShowAddVisit(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Session Dialog ────────────────────────────────────────── */}
      <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>جلسة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>المريض</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>الخدمة</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر الخدمة" /></SelectTrigger><SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>السعر</Label><Input id="sPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/sessions', { patientId: selectedPatient?.id || patients[0]?.id, status: 'scheduled', price: parseFloat((document.getElementById('sPrice') as HTMLInputElement)?.value) || 0, paid: false, date: new Date().toISOString() }, setSessions); setShowAddSession(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Service Dialog ────────────────────────────────────────── */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>خدمة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>اسم الخدمة *</Label><Input id="svName" placeholder="اسم الخدمة" className="input-luxury rounded-xl" /></div>
            <div><Label>الفئة</Label><Input id="svCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div>
            <div><Label>السعر *</Label><Input id="svPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div>
            <div><Label>المدة (دقيقة)</Label><Input id="svDur" type="number" placeholder="30" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { const name = (document.getElementById('svName') as HTMLInputElement)?.value; if (!name) return toast.error('الاسم مطلوب'); addItem('/services', { name, category: (document.getElementById('svCat') as HTMLInputElement)?.value, price: parseFloat((document.getElementById('svPrice') as HTMLInputElement)?.value) || 0, duration: parseInt((document.getElementById('svDur') as HTMLInputElement)?.value) || 30, active: true }, setServices); setShowAddService(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Transaction Dialog ────────────────────────────────────── */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>معاملة مالية جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>النوع</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="النوع" /></SelectTrigger><SelectContent><SelectItem value="income">إيراد</SelectItem><SelectItem value="expense">مصروف</SelectItem></SelectContent></Select></div>
            <div><Label>الفئة</Label><Input id="tCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div>
            <div><Label>المبلغ *</Label><Input id="tAmt" type="number" placeholder="0" className="input-luxury rounded-xl" /></div>
            <div><Label>الوصف</Label><Textarea id="tDesc" placeholder="وصف المعاملة" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/finance/transactions', { type: 'income', category: (document.getElementById('tCat') as HTMLInputElement)?.value || 'عام', amount: parseFloat((document.getElementById('tAmt') as HTMLInputElement)?.value) || 0, description: (document.getElementById('tDesc') as HTMLTextAreaElement)?.value, date: new Date().toISOString() }, setTransactions); setShowAddTransaction(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Appointment Dialog ────────────────────────────────────── */}
      <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>موعد جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>المريض</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>النوع</Label><Input id="apType" placeholder="نوع الموعد" className="input-luxury rounded-xl" /></div>
            <div><Label>المدة (دقيقة)</Label><Input id="apDur" type="number" placeholder="30" className="input-luxury rounded-xl" /></div>
            <div><Label>ملاحظات</Label><Textarea id="apNotes" placeholder="ملاحظات" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/appointments', { patientId: patients[0]?.id, type: (document.getElementById('apType') as HTMLInputElement)?.value || 'استشارة', duration: parseInt((document.getElementById('apDur') as HTMLInputElement)?.value) || 30, status: 'scheduled', notes: (document.getElementById('apNotes') as HTMLTextAreaElement)?.value, date: new Date().toISOString() }, setAppointments); setShowAddAppointment(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Laser Record Dialog ───────────────────────────────────── */}
      <Dialog open={showAddLaserRecord} onOpenChange={setShowAddLaserRecord}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>سجل ليزر جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>المريض</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>منطقة الجسم *</Label><Input id="lrArea" placeholder="منطقة الجسم" className="input-luxury rounded-xl" /></div>
            <div><Label>عدد الجلسات</Label><Input id="lrSess" type="number" placeholder="6" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/laser/records', { patientId: patients[0]?.id, bodyArea: (document.getElementById('lrArea') as HTMLInputElement)?.value, totalSessions: parseInt((document.getElementById('lrSess') as HTMLInputElement)?.value) || 6, status: 'active' }, setLaserRecords); setShowAddLaserRecord(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Laser Package Dialog ──────────────────────────────────── */}
      <Dialog open={showAddLaserPackage} onOpenChange={setShowAddLaserPackage}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>باقة ليزر جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>اسم الباقة *</Label><Input id="lpName" placeholder="اسم الباقة" className="input-luxury rounded-xl" /></div>
            <div><Label>عدد الجلسات</Label><Input id="lpSess" type="number" placeholder="6" className="input-luxury rounded-xl" /></div>
            <div><Label>السعر</Label><Input id="lpPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/laser/packages', { name: (document.getElementById('lpName') as HTMLInputElement)?.value, sessionsCount: parseInt((document.getElementById('lpSess') as HTMLInputElement)?.value) || 6, price: parseFloat((document.getElementById('lpPrice') as HTMLInputElement)?.value) || 0, active: true }, setLaserPackages); setShowAddLaserPackage(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Medication Dialog ─────────────────────────────────────── */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>دواء جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>اسم الدواء *</Label><Input id="medName" placeholder="اسم الدواء" className="input-luxury rounded-xl" /></div>
            <div><Label>الفئة</Label><Input id="medCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div>
            <div><Label>الجرعة</Label><Input id="medDosage" placeholder="الجرعة" className="input-luxury rounded-xl" /></div>
            <div><Label>التعليمات</Label><Textarea id="medInst" placeholder="تعليمات الاستخدام" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/medications', { name: (document.getElementById('medName') as HTMLInputElement)?.value, category: (document.getElementById('medCat') as HTMLInputElement)?.value, dosage: (document.getElementById('medDosage') as HTMLInputElement)?.value, instructions: (document.getElementById('medInst') as HTMLTextAreaElement)?.value, active: true }, setMedications); setShowAddMedication(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Prescription Dialog ───────────────────────────────────── */}
      <Dialog open={showAddPrescription} onOpenChange={setShowAddPrescription}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>وصفة طبية جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>التشخيص</Label><Input id="prDiag" placeholder="التشخيص" className="input-luxury rounded-xl" /></div>
            <div><Label>ملاحظات</Label><Textarea id="prNotes" placeholder="ملاحظات" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/prescriptions', { patientId: selectedPatient?.id || patients[0]?.id, diagnosis: (document.getElementById('prDiag') as HTMLInputElement)?.value, notes: (document.getElementById('prNotes') as HTMLTextAreaElement)?.value, date: new Date().toISOString() }, setPrescriptions); setShowAddPrescription(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Reminder Dialog ───────────────────────────────────────── */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>تذكير جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>العنوان *</Label><Input id="remTitle" placeholder="عنوان التذكير" className="input-luxury rounded-xl" /></div>
            <div><Label>الوصف</Label><Textarea id="remDesc" placeholder="الوصف" className="input-luxury rounded-xl" /></div>
            <div><Label>التاريخ</Label><Input id="remDate" type="date" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/reminders', { title: (document.getElementById('remTitle') as HTMLInputElement)?.value, description: (document.getElementById('remDesc') as HTMLTextAreaElement)?.value, date: (document.getElementById('remDate') as HTMLInputElement)?.value || new Date().toISOString(), type: 'general', status: 'pending' }, setReminders); setShowAddReminder(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Inventory Dialog ──────────────────────────────────────── */}
      <Dialog open={showAddInventory} onOpenChange={setShowAddInventory}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>عنصر مخزون جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>الاسم *</Label><Input id="invName" placeholder="اسم العنصر" className="input-luxury rounded-xl" /></div>
            <div><Label>الفئة</Label><Input id="invCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div>
            <div><Label>الكمية</Label><Input id="invQty" type="number" placeholder="0" className="input-luxury rounded-xl" /></div>
            <div><Label>الحد الأدنى</Label><Input id="invMin" type="number" placeholder="5" className="input-luxury rounded-xl" /></div>
            <div><Label>سعر الوحدة</Label><Input id="invPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/inventory/items', { name: (document.getElementById('invName') as HTMLInputElement)?.value, category: (document.getElementById('invCat') as HTMLInputElement)?.value, quantity: parseInt((document.getElementById('invQty') as HTMLInputElement)?.value) || 0, minQuantity: parseInt((document.getElementById('invMin') as HTMLInputElement)?.value) || 5, unitPrice: parseFloat((document.getElementById('invPrice') as HTMLInputElement)?.value) || 0 }, setInventoryItems); setShowAddInventory(false) }}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

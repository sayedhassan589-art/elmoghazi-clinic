'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuthStore, useClinicStore } from '@/lib/store'
import { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Stethoscope, Zap, MoreHorizontal,
  Search, Bell, Moon, Sun, LogOut, Menu, X, Plus, Edit3,
  Trash2, Star, StarOff, Phone, Calendar, Clock, DollarSign,
  Package, FileText, Activity, AlertTriangle, CheckCircle,
  ChevronDown, ChevronLeft, ChevronRight, Settings, Shield,
  BarChart3, TrendingUp, Eye, Camera, Pill, Heart, Send,
  MessageSquare, Bot, RefreshCw, Download, Upload, Filter,
  ArrowUpDown, UserPlus, ClipboardList, Scissors, Sparkles,
  Hash, MapPin, BriefcaseMedical, Syringe, Palette
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
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

function statCard(icon: React.ReactNode, label: string, value: string | number, color: string, sub?: string) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-luxury p-5">
      <div className="flex items-center gap-3">
        <div className={cn('p-2.5 rounded-xl', color)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function Home() {
  const { user, isAuthenticated, login, logout } = useAuthStore()
  const { activeTab, setActiveTab, sidebarCollapsed, toggleSidebar, theme, setTheme } = useClinicStore()
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)

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

  const loadDataOnce = useCallback(async () => {
    if (isAuthenticated) {
      await loadAllData()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    loadDataOnce()
  }, [loadDataOnce])

  // ─── Login ──────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    setLoginLoading(true)
    try {
      const res = await apiFetch<{user: any}>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      login(res.user)
      toast.success('تم تسجيل الدخول بنجاح')
    } catch (e: any) {
      toast.error(e.message || 'خطأ في تسجيل الدخول')
    }
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

  // ─── AI Chat ────────────────────────────────────────────────────────────

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return
    const msg = aiInput
    setAiInput('')
    setAiMessages(prev => [...prev, { role: 'user', content: msg }])
    setAiLoading(true)
    try {
      const res = await apiFetch<{message: string}>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [...aiMessages, { role: 'user', content: msg }] })
      })
      setAiMessages(prev => [...prev, { role: 'assistant', content: res.message || 'عذراً، لم أتمكن من الرد.' }])
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي.' }])
    }
    setAiLoading(false)
  }

  // ─── Sidebar Nav Items ──────────────────────────────────────────────────

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard size={20} /> },
    { id: 'patients', label: 'المرضى', icon: <Users size={20} /> },
    { id: 'visits', label: 'الزيارات', icon: <Stethoscope size={20} /> },
    { id: 'sessions', label: 'الجلسات', icon: <Activity size={20} /> },
    { id: 'laser', label: 'الليزر', icon: <Zap size={20} /> },
    { id: 'more', label: 'المزيد', icon: <MoreHorizontal size={20} /> },
  ]

  // ─── LOGIN SCREEN ───────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md mx-4">
          <Card className="glass-heavy border-emerald-700/30 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center mb-4 shadow-lg glow-emerald">
                <Stethoscope className="text-amber-300" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-gradient-luxury">Elmoghazi Clinic</h1>
              <p className="text-emerald-200/80 mt-1">عيادة المغازى للجلدية والتجميل</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-emerald-200">البريد الإلكتروني</Label>
                <Input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="bg-emerald-900/50 border-emerald-600/30 text-white placeholder:text-emerald-400/50 input-luxury" placeholder="doctor@elmoghazi.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-200">كلمة المرور</Label>
                <Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="bg-emerald-900/50 border-emerald-600/30 text-white placeholder:text-emerald-400/50 input-luxury" placeholder="••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
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

  // ─── Sidebar Content ────────────────────────────────────────────────────

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 sidebar-header-luxury">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
            <Stethoscope className="text-emerald-900" size={22} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gradient-gold">Elmoghazi</h2>
            <p className="text-[10px] text-sidebar-foreground/60">عيادة الجلدية والتجميل</p>
          </div>
        </div>
      </div>
      <div className="divider-gold" />
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); if (item.id === 'patients') setSelectedPatient(null) }}
            className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
              activeTab === item.id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md glow-emerald'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}>
            {item.icon}
            <span>{item.label}</span>
            {item.id === 'more' && lowStockItems.length > 0 && (
              <Badge className="mr-auto bg-amber-500 text-white text-[10px] px-1.5">{lowStockItems.length}</Badge>
            )}
          </button>
        ))}
      </nav>
      <div className="divider-gold" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 border-2 border-amber-500/50">
            <AvatarFallback className="bg-emerald-700 text-amber-300 text-sm font-bold">{user?.name?.charAt(0) || 'د'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{safeName(user?.name)}</p>
            <p className="text-[10px] text-sidebar-foreground/50">{user?.role === 'doctor' ? 'طبيب' : user?.role === 'secretary' ? 'سكرتير' : 'مدير'}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { logout(); toast.success('تم تسجيل الخروج') }}
          className="w-full text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 justify-start gap-2">
          <LogOut size={16} /> خروج
        </Button>
      </div>
    </div>
  )

  // ─── MAIN RENDER ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn('hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-l border-sidebar-border',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={22} />
          </Button>
          <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={toggleSidebar}>
            {sidebarCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </Button>
          <div className="flex-1 relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pr-10 input-luxury rounded-xl bg-muted/50" />
          </div>
          <div className="flex items-center gap-2 mr-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  {activeAlerts.length > 0 && (
                    <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{activeAlerts.length}</span>
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
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={loadAllData} title="تحديث البيانات">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

              {/* ═══ DASHBOARD ═══ */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
                      <p className="text-muted-foreground text-sm">مرحباً، {safeName(user?.name)}</p>
                    </div>
                    <Badge className="badge-gold text-sm">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCard(<Users className="text-emerald-100" size={22} />, 'إجمالي المرضى', patients.length, 'bg-emerald-700', `+${patients.filter(p => p.createdAt?.startsWith(todayStr)).length} اليوم`)}
                    {statCard(<Stethoscope className="text-blue-100" size={22} />, 'زيارات اليوم', todayVisits.length, 'bg-blue-700')}
                    {statCard(<DollarSign className="text-amber-100" size={22} />, 'إيراد اليوم', formatCurrency(todayIncome), 'bg-amber-600')}
                    {statCard(<Calendar className="text-purple-100" size={22} />, 'مواعيد اليوم', todayAppointments.length, 'bg-purple-700', `${todayAppointments.filter(a => a.status === 'completed').length} مكتمل`)}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="card-luxury lg:col-span-2">
                      <CardHeader><CardTitle className="text-lg">الإيرادات والمصروفات</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
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
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                              {genderData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Smart Alerts */}
                  {activeAlerts.length > 0 && (
                    <Card className="card-luxury border-red-200 dark:border-red-900/30">
                      <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="text-amber-500" size={20} /> تنبيهات ذكية</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {activeAlerts.slice(0, 5).map(a => (
                          <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
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
                      <div className="space-y-3">
                        {patients.slice(0, 5).map(p => (
                          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => { setSelectedPatient(p); setActiveTab('patients') }}>
                            <Avatar className="h-10 w-10 border border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">{p.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{safeName(p.name)}</p>
                              <p className="text-xs text-muted-foreground">{p.phone || 'بدون رقم'}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">{p.fileNumber}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Notes */}
                  <Card className="card-luxury">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">ملاحظات سريعة</CardTitle>
                      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
                        <DialogTrigger asChild><Button size="sm" className="btn-luxury"><Plus size={14} className="ml-1" /> إضافة</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>ملاحظة جديدة</DialogTitle></DialogHeader>
                          <div className="space-y-3">
                            <Textarea id="noteContent" placeholder="اكتب الملاحظة..." />
                            <div className="flex items-center gap-2">
                              <Label htmlFor="noteImportant">مهمة</Label>
                              <Switch id="noteImportant" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => {
                              const c = (document.getElementById('noteContent') as HTMLTextAreaElement)?.value
                              const imp = (document.getElementById('noteImportant') as HTMLInputElement)?.checked
                              if (c) { addItem('/notes', { content: c, important: imp, section: 'dashboard' }, setNotes); setShowAddNote(false) }
                            }}>حفظ</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {notes.filter(n => n.section === 'dashboard').length === 0 ?
                          <p className="text-sm text-muted-foreground text-center py-4">لا توجد ملاحظات</p> :
                          notes.filter(n => n.section === 'dashboard').map(n => (
                            <div key={n.id} className={cn('p-3 rounded-lg text-sm', n.important ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-muted/50')}>
                              <div className="flex items-start justify-between gap-2">
                                <p>{n.content}</p>
                                <Button variant="ghost" size="icon" className="shrink-0 h-6 w-6" onClick={() => deleteItem('/notes', n.id, setNotes)}><Trash2 size={12} /></Button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══ PATIENTS ═══ */}
              {activeTab === 'patients' && !selectedPatient && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h1 className="text-2xl font-bold">المرضى</h1>
                    <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
                      <DialogTrigger asChild><Button className="btn-luxury"><UserPlus size={16} className="ml-2" /> مريض جديد</Button></DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>إضافة مريض جديد</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2"><Label>الاسم *</Label><Input id="pName" placeholder="اسم المريض" /></div>
                          <div><Label>الهاتف</Label><Input id="pPhone" placeholder="رقم الهاتف" /></div>
                          <div><Label>هاتف آخر</Label><Input id="pPhone2" placeholder="رقم إضافي" /></div>
                          <div><Label>العمر</Label><Input id="pAge" type="number" placeholder="العمر" /></div>
                          <div><Label>الجنس</Label>
                            <Select><SelectTrigger><SelectValue placeholder="الجنس" /></SelectTrigger>
                              <SelectContent><SelectItem value="male">ذكر</SelectItem><SelectItem value="female">أنثى</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2"><Label>العنوان</Label><Input id="pAddr" placeholder="العنوان" /></div>
                          <div className="col-span-2"><Label>الحساسية</Label><Input id="pAllergy" placeholder="أي حساسية" /></div>
                          <div className="col-span-2"><Label>التاريخ المرضي</Label><Textarea id="pHistory" placeholder="التاريخ المرضي" /></div>
                          <div className="col-span-2"><Label>ملاحظات</Label><Textarea id="pNotes" placeholder="ملاحظات إضافية" /></div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => {
                            const name = (document.getElementById('pName') as HTMLInputElement)?.value
                            if (!name) return toast.error('الاسم مطلوب')
                            addItem('/patients', {
                              name, phone: (document.getElementById('pPhone') as HTMLInputElement)?.value,
                              phone2: (document.getElementById('pPhone2') as HTMLInputElement)?.value,
                              age: parseInt((document.getElementById('pAge') as HTMLInputElement)?.value) || null,
                              gender: (document.querySelector('[data-state="checked"]')?.closest('[role="combobox"]')?.textContent?.trim() === 'ذكر') ? 'male' : 'female',
                              address: (document.getElementById('pAddr') as HTMLInputElement)?.value,
                              allergies: (document.getElementById('pAllergy') as HTMLInputElement)?.value,
                              medicalHistory: (document.getElementById('pHistory') as HTMLTextAreaElement)?.value,
                              notes: (document.getElementById('pNotes') as HTMLTextAreaElement)?.value,
                            }, setPatients); setShowAddPatient(false)
                          }}>حفظ</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 rounded-xl shimmer" />)}
                  </div> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPatients.map(p => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-luxury p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                          onClick={() => { setSelectedPatient(p) }}>
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">{p.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold truncate">{safeName(p.name)}</p>
                                <button onClick={e => { e.stopPropagation(); updateItem('/patients', { id: p.id, starred: !p.starred }, setPatients) }}>
                                  {p.starred ? <Star className="text-amber-500" size={16} /> : <StarOff className="text-muted-foreground" size={16} />}
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{p.fileNumber}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            {p.phone && <span className="flex items-center gap-1"><Phone size={12} />{p.phone}</span>}
                            {p.age && <span className="flex items-center gap-1"><Hash size={12} />{p.age} سنة</span>}
                            {p.gender && <Badge className={cn('text-[10px]', p.gender === 'male' ? 'badge-emerald' : 'badge-gold')}>{p.gender === 'male' ? 'ذكر' : 'أنثى'}</Badge>}
                          </div>
                        </motion.div>
                      ))}
                      {filteredPatients.length === 0 && <div className="col-span-full text-center py-16 text-muted-foreground"><Users size={48} className="mx-auto mb-3 opacity-30" /><p>لا يوجد مرضى</p></div>}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ PATIENT DETAIL ═══ */}
              {activeTab === 'patients' && selectedPatient && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(null)}><ChevronRight size={20} /></Button>
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{selectedPatient.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-xl font-bold">{safeName(selectedPatient.name)}</h1>
                      <p className="text-sm text-muted-foreground">{selectedPatient.fileNumber} {selectedPatient.phone && `• ${selectedPatient.phone}`}</p>
                    </div>
                  </div>
                  <Tabs value={patientDetailTab} onValueChange={setPatientDetailTab}>
                    <TabsList className="flex-wrap h-auto gap-1">
                      <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                      <TabsTrigger value="visits">الزيارات</TabsTrigger>
                      <TabsTrigger value="sessions">الجلسات</TabsTrigger>
                      <TabsTrigger value="laser">الليزر</TabsTrigger>
                      <TabsTrigger value="prescriptions">الوصفات</TabsTrigger>
                      <TabsTrigger value="photos">الصور</TabsTrigger>
                      <TabsTrigger value="plans">خطط العلاج</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="card-luxury">
                          <CardHeader><CardTitle className="text-base">بيانات المريض</CardTitle></CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">الاسم:</span><span className="font-medium">{safeName(selectedPatient.name)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">رقم الملف:</span><span className="font-medium">{selectedPatient.fileNumber}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">الهاتف:</span><span className="font-medium">{selectedPatient.phone || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">العمر:</span><span className="font-medium">{selectedPatient.age || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">الجنس:</span><span className="font-medium">{selectedPatient.gender === 'male' ? 'ذكر' : selectedPatient.gender === 'female' ? 'أنثى' : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">العنوان:</span><span className="font-medium">{selectedPatient.address || '-'}</span></div>
                          </CardContent>
                        </Card>
                        <Card className="card-luxury">
                          <CardHeader><CardTitle className="text-base">معلومات طبية</CardTitle></CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div><span className="text-muted-foreground">الحساسية:</span><p className="mt-1">{selectedPatient.allergies || 'لا توجد'}</p></div>
                            <Separator />
                            <div><span className="text-muted-foreground">التاريخ المرضي:</span><p className="mt-1">{selectedPatient.medicalHistory || 'لا يوجد'}</p></div>
                            <Separator />
                            <div><span className="text-muted-foreground">ملاحظات:</span><p className="mt-1">{selectedPatient.notes || 'لا توجد'}</p></div>
                          </CardContent>
                        </Card>
                      </div>
                      {/* Patient Alerts */}
                      {alerts.filter(a => a.patientId === selectedPatient.id && a.active).length > 0 && (
                        <Card className="border-red-200 dark:border-red-900/30">
                          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="text-red-500" size={16} /> تنبيهات</CardTitle></CardHeader>
                          <CardContent className="space-y-2">
                            {alerts.filter(a => a.patientId === selectedPatient.id && a.active).map(a => (
                              <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm">
                                <AlertTriangle size={14} className="text-red-500 shrink-0" />{a.message}
                                <Button variant="ghost" size="icon" className="h-6 w-6 mr-auto" onClick={() => deleteItem('/alerts', a.id, setAlerts)}><Trash2 size={12} /></Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="visits" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddVisit(true)}><Plus size={14} className="ml-1" /> زيارة جديدة</Button>
                      </div>
                      <div className="space-y-3">
                        {visits.filter(v => v.patientId === selectedPatient.id).map(v => (
                          <Card key={v.id} className="card-luxury">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Badge className={v.type === 'consultation' ? 'badge-emerald' : v.type === 'emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'badge-gold'}>
                                    {v.type === 'consultation' ? 'كشف' : v.type === 'followup' ? 'متابعة' : 'طوارئ'}
                                  </Badge>
                                  <p className="text-sm mt-2">{v.diagnosis || 'بدون تشخيص'}</p>
                                  {v.notes && <p className="text-xs text-muted-foreground mt-1">{v.notes}</p>}
                                </div>
                                <div className="text-left">
                                  <p className="text-xs text-muted-foreground">{formatDate(v.date)}</p>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 mt-1" onClick={() => deleteItem('/visits', v.id, setVisits)}><Trash2 size={14} className="text-red-400" /></Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {visits.filter(v => v.patientId === selectedPatient.id).length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد زيارات</p>}
                      </div>
                    </TabsContent>

                    <TabsContent value="sessions" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddSession(true)}><Plus size={14} className="ml-1" /> جلسة جديدة</Button>
                      </div>
                      <div className="space-y-3">
                        {sessions.filter(s => s.patientId === selectedPatient.id).map(s => (
                          <Card key={s.id} className="card-luxury">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div>
                                <Badge className={s.status === 'completed' ? 'badge-emerald' : s.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'badge-gold'}>
                                  {s.status === 'completed' ? 'مكتملة' : s.status === 'cancelled' ? 'ملغاة' : s.status === 'no_show' ? 'لم يحضر' : 'مجدولة'}
                                </Badge>
                                <p className="text-sm mt-2">{formatCurrency(s.price)} {s.paid ? '✓ مدفوع' : '✗ غير مدفوع'}</p>
                              </div>
                              <div className="text-left">
                                <p className="text-xs text-muted-foreground">{formatDate(s.date)}</p>
                                <Button variant="ghost" size="icon" className="h-7 w-7 mt-1" onClick={() => deleteItem('/sessions', s.id, setSessions)}><Trash2 size={14} className="text-red-400" /></Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {sessions.filter(s => s.patientId === selectedPatient.id).length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد جلسات</p>}
                      </div>
                    </TabsContent>

                    <TabsContent value="laser" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddLaserRecord(true)}><Plus size={14} className="ml-1" /> سجل ليزر جديد</Button>
                      </div>
                      <div className="space-y-3">
                        {laserRecords.filter(l => l.patientId === selectedPatient.id).map(r => (
                          <Card key={r.id} className="card-luxury">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge className="badge-gold">{r.bodyArea}</Badge>
                                    <span className="text-sm">{r.totalSessions} جلسات</span>
                                  </div>
                                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                    {r.skinType && <span>نوع البشرة: {r.skinType}</span>}
                                    {r.hairColor && <span>لون الشعر: {r.hairColor}</span>}
                                  </div>
                                </div>
                                <Badge className={r.status === 'active' ? 'badge-emerald' : 'bg-muted text-muted-foreground'}>{r.status === 'active' ? 'نشط' : r.status === 'completed' ? 'مكتمل' : 'متوقف'}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {laserRecords.filter(l => l.patientId === selectedPatient.id).length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد سجلات ليزر</p>}
                      </div>
                    </TabsContent>

                    <TabsContent value="prescriptions" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddPrescription(true)}><Plus size={14} className="ml-1" /> وصفة جديدة</Button>
                      </div>
                      <div className="space-y-3">
                        {prescriptions.filter(p => p.patientId === selectedPatient.id).map(p => (
                          <Card key={p.id} className="card-luxury">
                            <CardContent className="p-4">
                              <p className="text-sm font-medium">{p.diagnosis || 'بدون تشخيص'}</p>
                              {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                              <p className="text-xs text-muted-foreground mt-2">{formatDate(p.date)}</p>
                            </CardContent>
                          </Card>
                        ))}
                        {prescriptions.filter(p => p.patientId === selectedPatient.id).length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد وصفات</p>}
                      </div>
                    </TabsContent>

                    <TabsContent value="photos" className="mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {photos.filter(p => p.patientId === selectedPatient.id).map(p => (
                          <div key={p.id} className="card-luxury overflow-hidden group relative">
                            <img src={p.imageData} alt={p.description || 'صورة'} className="w-full h-40 object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button variant="ghost" size="icon" className="text-white" onClick={() => deleteItem('/photos', p.id, setPhotos)}><Trash2 size={16} /></Button>
                            </div>
                            <Badge className="absolute top-2 right-2 text-[10px]">{p.type === 'before' ? 'قبل' : p.type === 'after' ? 'بعد' : 'عامة'}</Badge>
                          </div>
                        ))}
                        {photos.filter(p => p.patientId === selectedPatient.id).length === 0 && <div className="col-span-full text-center text-muted-foreground py-8">لا توجد صور</div>}
                      </div>
                    </TabsContent>

                    <TabsContent value="plans" className="mt-4">
                      <div className="space-y-3">
                        {treatmentPlans.filter(t => t.patientId === selectedPatient.id).map(t => (
                          <Card key={t.id} className="card-luxury">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{t.title}</p>
                                  {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                                </div>
                                <Badge className={t.status === 'active' ? 'badge-emerald' : t.status === 'completed' ? 'badge-gold' : 'bg-muted text-muted-foreground'}>{t.status === 'active' ? 'نشطة' : t.status === 'completed' ? 'مكتملة' : 'متوقفة'}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {treatmentPlans.filter(t => t.patientId === selectedPatient.id).length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد خطط علاج</p>}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* ═══ VISITS ═══ */}
              {activeTab === 'visits' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">الزيارات</h1>
                    <Button className="btn-luxury" onClick={() => setShowAddVisit(true)}><Plus size={16} className="ml-2" /> زيارة جديدة</Button>
                  </div>
                  <div className="space-y-3">
                    {visits.map(v => {
                      const pat = patients.find(p => p.id === v.patientId)
                      return (
                        <Card key={v.id} className="card-luxury">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-sm">{pat?.name?.charAt(0) || '?'}</AvatarFallback></Avatar>
                              <div>
                                <p className="font-medium text-sm">{safeName(pat?.name)}</p>
                                <p className="text-xs text-muted-foreground">{v.diagnosis || v.notes || 'بدون تفاصيل'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={v.type === 'consultation' ? 'badge-emerald' : v.type === 'emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'badge-gold'}>
                                {v.type === 'consultation' ? 'كشف' : v.type === 'followup' ? 'متابعة' : 'طوارئ'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(v.date)}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/visits', v.id, setVisits)}><Trash2 size={14} className="text-red-400" /></Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                    {visits.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد زيارات</p>}
                  </div>
                </div>
              )}

              {/* ═══ SESSIONS ═══ */}
              {activeTab === 'sessions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">الجلسات</h1>
                    <Button className="btn-luxury" onClick={() => setShowAddSession(true)}><Plus size={16} className="ml-2" /> جلسة جديدة</Button>
                  </div>
                  <Card className="card-luxury overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المريض</TableHead>
                          <TableHead>الخدمة</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>السعر</TableHead>
                          <TableHead>التاريخ</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map(s => {
                          const pat = patients.find(p => p.id === s.patientId)
                          const srv = services.find(sv => sv.id === s.serviceId)
                          return (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium">{safeName(pat?.name)}</TableCell>
                              <TableCell>{srv?.name || '-'}</TableCell>
                              <TableCell><Badge className={s.status === 'completed' ? 'badge-emerald' : s.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'badge-gold'}>{s.status === 'completed' ? 'مكتملة' : s.status === 'cancelled' ? 'ملغاة' : s.status === 'no_show' ? 'لم يحضر' : 'مجدولة'}</Badge></TableCell>
                              <TableCell>{formatCurrency(s.price)} {s.paid ? '✓' : '✗'}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{formatDate(s.date)}</TableCell>
                              <TableCell><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/sessions', s.id, setSessions)}><Trash2 size={14} className="text-red-400" /></Button></TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    {sessions.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد جلسات</p>}
                  </Card>
                </div>
              )}

              {/* ═══ LASER ═══ */}
              {activeTab === 'laser' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">الليزر</h1>
                  <Tabs value={laserSubTab} onValueChange={setLaserSubTab}>
                    <TabsList>
                      <TabsTrigger value="records">السجلات</TabsTrigger>
                      <TabsTrigger value="packages">الباقات</TabsTrigger>
                      <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                      <TabsTrigger value="stats">إحصائيات</TabsTrigger>
                    </TabsList>

                    <TabsContent value="records" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddLaserRecord(true)}><Plus size={14} className="ml-1" /> سجل جديد</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {laserRecords.map(r => {
                          const pat = patients.find(p => p.id === r.patientId)
                          return (
                            <Card key={r.id} className="card-luxury">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium">{safeName(pat?.name)}</p>
                                  <Badge className={r.status === 'active' ? 'badge-emerald' : 'badge-gold'}>{r.status === 'active' ? 'نشط' : r.status === 'completed' ? 'مكتمل' : 'متوقف'}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><span className="text-muted-foreground">المنطقة:</span> {r.bodyArea}</div>
                                  <div><span className="text-muted-foreground">الجلسات:</span> {r.totalSessions}</div>
                                  {r.skinType && <div><span className="text-muted-foreground">البشرة:</span> {r.skinType}</div>}
                                  {r.hairColor && <div><span className="text-muted-foreground">الشعر:</span> {r.hairColor}</div>}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="packages" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddLaserPackage(true)}><Plus size={14} className="ml-1" /> باقة جديدة</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {laserPackages.map(p => (
                          <Card key={p.id} className="card-luxury">
                            <CardContent className="p-5 text-center">
                              <Package className="mx-auto text-amber-500 mb-2" size={28} />
                              <p className="font-bold text-lg">{p.name}</p>
                              <p className="text-2xl font-bold text-gradient-luxury mt-2">{formatCurrency(p.price)}</p>
                              <p className="text-sm text-muted-foreground">{p.sessionsCount} جلسات</p>
                              {p.bodyArea && <Badge className="badge-gold mt-2">{p.bodyArea}</Badge>}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-4">
                      <div className="space-y-3">
                        {laserSettings.map(s => (
                          <Card key={s.id} className="card-luxury">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div>
                                <p className="font-medium">{s.machineName}</p>
                                <p className="text-sm text-muted-foreground">{s.bodyArea} {s.defaultEnergy && `• طاقة: ${s.defaultEnergy}`}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => deleteItem('/laser/settings', s.id, setLaserSettings)}><Trash2 size={14} className="text-red-400" /></Button>
                            </CardContent>
                          </Card>
                        ))}
                        {laserSettings.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد إعدادات</p>}
                      </div>
                    </TabsContent>

                    <TabsContent value="stats" className="mt-4">
                      <Card className="card-luxury">
                        <CardHeader><CardTitle>جلسات الليزر حسب المنطقة</CardTitle></CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={Object.entries(laserRecords.reduce((acc, r) => { acc[r.bodyArea] = (acc[r.bodyArea] || 0) + r.totalSessions; return acc }, {} as Record<string, number>)).map(([name, value]) => ({ name, جلسات: value }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                              <RechartsTooltip />
                              <Bar dataKey="جلسات" fill="#047857" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* ═══ MORE ═══ */}
              {activeTab === 'more' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">المزيد</h1>
                  <Tabs value={moreSubTab} onValueChange={setMoreSubTab}>
                    <TabsList className="flex-wrap h-auto gap-1">
                      <TabsTrigger value="services">الخدمات</TabsTrigger>
                      <TabsTrigger value="finance">المالية</TabsTrigger>
                      <TabsTrigger value="inventory">المخزن</TabsTrigger>
                      <TabsTrigger value="appointments">المواعيد</TabsTrigger>
                      <TabsTrigger value="waiting">الانتظار</TabsTrigger>
                      <TabsTrigger value="medications">الأدوية</TabsTrigger>
                      <TabsTrigger value="reminders">التذكيرات</TabsTrigger>
                      <TabsTrigger value="reports">التقارير</TabsTrigger>
                      <TabsTrigger value="backup">النسخ</TabsTrigger>
                      <TabsTrigger value="audit">السجل</TabsTrigger>
                      <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                    </TabsList>

                    {/* Services */}
                    <TabsContent value="services" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddService(true)}><Plus size={14} className="ml-1" /> خدمة جديدة</Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map(s => (
                          <Card key={s.id} className="card-luxury p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{s.name}</p>
                                <p className="text-sm text-muted-foreground">{formatCurrency(s.price)} {s.duration ? `• ${s.duration} دقيقة` : ''}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge className="badge-emerald">{s.category || 'عام'}</Badge>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/services', s.id, setServices)}><Trash2 size={14} className="text-red-400" /></Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Finance */}
                    <TabsContent value="finance" className="mt-4 space-y-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddTransaction(true)}><Plus size={14} className="ml-1" /> معاملة جديدة</Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {statCard(<TrendingUp className="text-emerald-100" size={20} />, 'الإيرادات', formatCurrency(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)), 'bg-emerald-700')}
                        {statCard(<DollarSign className="text-red-100" size={20} />, 'المصروفات', formatCurrency(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)), 'bg-red-700')}
                        {statCard(<BarChart3 className="text-amber-100" size={20} />, 'صافي الربح', formatCurrency(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)), 'bg-amber-600')}
                      </div>
                      <Card className="card-luxury overflow-hidden">
                        <CardHeader><CardTitle>آخر المعاملات</CardTitle></CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {transactions.slice(0, 20).map(t => (
                              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                  <div className={cn('p-2 rounded-lg', t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30')}>
                                    {t.type === 'income' ? <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={16} /> : <DollarSign className="text-red-600 dark:text-red-400" size={16} />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{t.description || (t.type === 'income' ? 'إيراد' : 'مصروف')}</p>
                                    <p className="text-xs text-muted-foreground">{t.category === 'clinic' ? 'عيادي' : 'شخصي'} • {formatDate(t.date)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={cn('font-bold', t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                  </span>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/finance/transactions', t.id, setTransactions)}><Trash2 size={12} className="text-red-400" /></Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Inventory */}
                    <TabsContent value="inventory" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddInventory(true)}><Plus size={14} className="ml-1" /> صنف جديد</Button>
                      </div>
                      {lowStockItems.length > 0 && (
                        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                          <AlertTriangle className="text-amber-500" size={18} />
                          <span className="text-sm">{lowStockItems.length} صنف أقل من الحد الأدنى</span>
                        </div>
                      )}
                      <Card className="card-luxury overflow-hidden">
                        <Table>
                          <TableHeader><TableRow><TableHead>الصنف</TableHead><TableHead>الكمية</TableHead><TableHead>الحد الأدنى</TableHead><TableHead>السعر</TableHead><TableHead></TableHead></TableRow></TableHeader>
                          <TableBody>
                            {inventoryItems.map(i => (
                              <TableRow key={i.id}>
                                <TableCell className="font-medium">{i.name}</TableCell>
                                <TableCell><Badge className={i.quantity <= i.minQuantity ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'badge-emerald'}>{i.quantity}</Badge></TableCell>
                                <TableCell>{i.minQuantity}</TableCell>
                                <TableCell>{formatCurrency(i.unitPrice)}</TableCell>
                                <TableCell><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/inventory/items', i.id, setInventoryItems)}><Trash2 size={14} className="text-red-400" /></Button></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    </TabsContent>

                    {/* Appointments */}
                    <TabsContent value="appointments" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddAppointment(true)}><Plus size={14} className="ml-1" /> موعد جديد</Button>
                      </div>
                      <div className="space-y-3">
                        {appointments.map(a => {
                          const pat = patients.find(p => p.id === a.patientId)
                          return (
                            <Card key={a.id} className="card-luxury">
                              <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-primary/10"><Calendar className="text-primary" size={18} /></div>
                                  <div>
                                    <p className="font-medium text-sm">{safeName(pat?.name) || 'بدون مريض'}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(a.date)} • {a.duration} دقيقة</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={a.status === 'scheduled' ? 'badge-gold' : a.status === 'completed' ? 'badge-emerald' : a.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'badge-emerald'}>
                                    {a.status === 'scheduled' ? 'مجدول' : a.status === 'completed' ? 'مكتمل' : a.status === 'cancelled' ? 'ملغي' : a.status === 'confirmed' ? 'مؤكد' : 'لم يحضر'}
                                  </Badge>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/appointments', a.id, setAppointments)}><Trash2 size={14} className="text-red-400" /></Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                        {appointments.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد مواعيد</p>}
                      </div>
                    </TabsContent>

                    {/* Waiting Queue */}
                    <TabsContent value="waiting" className="mt-4">
                      <div className="space-y-3">
                        {waitingQueue.map((w, i) => (
                          <Card key={w.id} className="card-luxury">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{i + 1}</div>
                                <div>
                                  <p className="font-medium">{w.patientName || 'مريض'}</p>
                                  <p className="text-xs text-muted-foreground">{w.notes || ''}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={w.status === 'waiting' ? 'badge-gold' : w.status === 'in_progress' ? 'badge-emerald' : 'bg-muted text-muted-foreground'}>
                                  {w.status === 'waiting' ? 'في الانتظار' : w.status === 'in_progress' ? 'جاري الكشف' : w.status === 'done' ? 'انتهى' : 'غادر'}
                                </Badge>
                                {w.status === 'waiting' && <Button size="sm" variant="outline" onClick={() => updateItem('/waiting', { id: w.id, status: 'in_progress' }, setWaitingQueue)}>بدء الكشف</Button>}
                                {w.status === 'in_progress' && <Button size="sm" variant="outline" onClick={() => updateItem('/waiting', { id: w.id, status: 'done' }, setWaitingQueue)}>إنهاء</Button>}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {waitingQueue.length === 0 && <p className="text-center text-muted-foreground py-8">قائمة الانتظار فارغة</p>}
                      </div>
                    </TabsContent>

                    {/* Medications */}
                    <TabsContent value="medications" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddMedication(true)}><Plus size={14} className="ml-1" /> دواء جديد</Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {medications.map(m => (
                          <Card key={m.id} className="card-luxury p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Pill className="text-primary" size={18} />
                                <div>
                                  <p className="font-medium">{m.name}</p>
                                  {m.category && <Badge className="badge-emerald mt-1">{m.category === 'cream' ? 'كريم' : m.category === 'ointment' ? 'مرهم' : m.category === 'tablet' ? 'أقراص' : m.category === 'injection' ? 'حقن' : m.category === 'lotion' ? 'لوشن' : 'جل'}</Badge>}
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/medications', m.id, setMedications)}><Trash2 size={14} className="text-red-400" /></Button>
                            </div>
                            {m.description && <p className="text-xs text-muted-foreground mt-2">{m.description}</p>}
                            {m.dosage && <p className="text-xs mt-1"><span className="text-muted-foreground">الجرعة:</span> {m.dosage}</p>}
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Reminders */}
                    <TabsContent value="reminders" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" className="btn-luxury" onClick={() => setShowAddReminder(true)}><Plus size={14} className="ml-1" /> تذكير جديد</Button>
                      </div>
                      <div className="space-y-3">
                        {reminders.map(r => (
                          <Card key={r.id} className="card-luxury">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn('p-2 rounded-lg', r.status === 'done' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
                                  <Bell className={r.status === 'done' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} size={16} />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{r.title}</p>
                                  {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                                  <p className="text-xs text-muted-foreground mt-1">{formatDate(r.date)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={r.status === 'pending' ? 'badge-gold' : r.status === 'done' ? 'badge-emerald' : 'bg-muted text-muted-foreground'}>
                                  {r.status === 'pending' ? 'قيد الانتظار' : r.status === 'done' ? 'تم' : r.status === 'sent' ? 'تم الإرسال' : 'تم التجاهل'}
                                </Badge>
                                {r.status === 'pending' && <Button size="sm" variant="outline" onClick={() => updateItem('/reminders', { id: r.id, status: 'done' }, setReminders)}>تم</Button>}
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/reminders', r.id, setReminders)}><Trash2 size={14} className="text-red-400" /></Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {reminders.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد تذكيرات</p>}
                      </div>
                    </TabsContent>

                    {/* Reports */}
                    <TabsContent value="reports" className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {statCard(<Stethoscope className="text-emerald-100" size={18} />, 'إجمالي الزيارات', visits.length, 'bg-emerald-700')}
                        {statCard(<Users className="text-blue-100" size={18} />, 'مرضى جدد', patients.length, 'bg-blue-700')}
                        {statCard(<DollarSign className="text-amber-100" size={18} />, 'إجمالي الإيرادات', formatCurrency(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)), 'bg-amber-600')}
                      </div>
                      <Card className="card-luxury">
                        <CardHeader><CardTitle>الإيرادات الشهرية</CardTitle></CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                              <RechartsTooltip />
                              <Line type="monotone" dataKey="إيراد" stroke="#047857" strokeWidth={2} dot={{ fill: '#047857' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      <Card className="card-luxury">
                        <CardHeader><CardTitle>أكثر الخدمات طلباً</CardTitle></CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {services.slice(0, 5).map((s, i) => {
                              const count = sessions.filter(ss => ss.serviceId === s.id).length
                              return (
                                <div key={s.id} className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium">{s.name}</span>
                                      <span className="text-xs text-muted-foreground">{count} جلسة</span>
                                    </div>
                                    <Progress value={sessions.length > 0 ? (count / sessions.length) * 100 : 0} className="h-2" />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Backup */}
                    <TabsContent value="backup" className="mt-4">
                      <div className="flex justify-end mb-3">
                        <Button className="btn-luxury" onClick={async () => {
                          try { await apiFetch('/backups', { method: 'POST' }); toast.success('تم إنشاء نسخة احتياطية'); loadAllData() }
                          catch (e: any) { toast.error(e.message) }
                        }}><Download size={16} className="ml-2" /> نسخ احتياطي الآن</Button>
                      </div>
                      <div className="space-y-3">
                        {backups.map(b => (
                          <Card key={b.id} className="card-luxury">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{b.type === 'manual' ? 'نسخة يدوية' : 'نسخة تلقائية'}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(b.createdAt)} {b.size && `• ${(b.size / 1024).toFixed(1)} KB`}</p>
                              </div>
                              <Badge className={b.status === 'completed' ? 'badge-emerald' : 'bg-red-100 text-red-700'}>{b.status === 'completed' ? 'مكتمل' : 'فشل'}</Badge>
                            </CardContent>
                          </Card>
                        ))}
                        {backups.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد نسخ احتياطية</p>}
                      </div>
                    </TabsContent>

                    {/* Audit Log */}
                    <TabsContent value="audit" className="mt-4">
                      <Card className="card-luxury overflow-hidden">
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader><TableRow><TableHead>الإجراء</TableHead><TableHead>التفاصيل</TableHead><TableHead>التاريخ</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {auditLogs.slice(0, 50).map(l => (
                                <TableRow key={l.id}>
                                  <TableCell><Badge className="badge-emerald">{l.action}</Badge></TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{l.details || l.entity || '-'}</TableCell>
                                  <TableCell className="text-xs text-muted-foreground">{formatDate(l.createdAt)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {auditLogs.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد سجلات</p>}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Settings */}
                    <TabsContent value="settings" className="mt-4 space-y-4">
                      <Card className="card-luxury">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Palette size={18} /> السمة</CardTitle></CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span>الوضع الداكن</span>
                            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="card-luxury">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Shield size={18} /> الأمان</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">تسجيل الدخول محمي بكلمة مرور. تأكد من تغيير كلمة المرور الافتراضية.</p>
                          <Button variant="outline" size="sm">تغيير كلمة المرور</Button>
                        </CardContent>
                      </Card>
                      <Card className="card-luxury">
                        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare size={18} /> واتساب</CardTitle></CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">ربط حساب واتساب بيزنس لإرسال التذكيرات تلقائياً.</p>
                          <Button variant="outline" size="sm" className="mt-3">ربط واتساب</Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ═══ DIALOGS ═══ */}

      {/* Add Visit Dialog */}
      <Dialog open={showAddVisit} onOpenChange={setShowAddVisit}>
        <DialogContent>
          <DialogHeader><DialogTitle>زيارة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>المريض</Label>
              <Select onValueChange={v => { }}>
                <SelectTrigger><SelectValue placeholder="اختر المريض" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{safeName(p.name)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>النوع</Label>
              <Select defaultValue="consultation">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">كشف</SelectItem>
                  <SelectItem value="followup">متابعة</SelectItem>
                  <SelectItem value="emergency">طوارئ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>التشخيص</Label><Textarea id="visitDiag" placeholder="التشخيص" /></div>
            <div><Label>ملاحظات</Label><Textarea id="visitNotes" placeholder="ملاحظات" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const selEl = document.querySelector('[aria-selected="true"]')
              const patientId = selectedPatient?.id || patients[0]?.id
              if (!patientId) return toast.error('اختر المريض')
              addItem('/visits', { patientId, type: 'consultation', diagnosis: (document.getElementById('visitDiag') as HTMLTextAreaElement)?.value, notes: (document.getElementById('visitNotes') as HTMLTextAreaElement)?.value }, setVisits)
              setShowAddVisit(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Session Dialog */}
      <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
        <DialogContent>
          <DialogHeader><DialogTitle>جلسة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>الخدمة</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="اختر الخدمة" /></SelectTrigger>
                <SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>السعر</Label><Input id="sessionPrice" type="number" placeholder="0" /></div>
              <div><Label>الحالة</Label>
                <Select defaultValue="scheduled"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="scheduled">مجدولة</SelectItem><SelectItem value="completed">مكتملة</SelectItem><SelectItem value="cancelled">ملغاة</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2"><Label>مدفوع</Label><Switch id="sessionPaid" /></div>
            <div><Label>ملاحظات</Label><Textarea id="sessionNotes" placeholder="ملاحظات" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const patientId = selectedPatient?.id || patients[0]?.id
              if (!patientId) return toast.error('اختر المريض')
              addItem('/sessions', { patientId, serviceId: services[0]?.id, status: 'scheduled', price: parseFloat((document.getElementById('sessionPrice') as HTMLInputElement)?.value) || 0, paid: (document.getElementById('sessionPaid') as HTMLInputElement)?.checked, notes: (document.getElementById('sessionNotes') as HTMLTextAreaElement)?.value }, setSessions)
              setShowAddSession(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent>
          <DialogHeader><DialogTitle>خدمة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>اسم الخدمة *</Label><Input id="srvName" placeholder="اسم الخدمة" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>السعر</Label><Input id="srvPrice" type="number" placeholder="0" /></div>
              <div><Label>المدة (دقيقة)</Label><Input id="srvDuration" type="number" placeholder="30" /></div>
            </div>
            <div><Label>الفئة</Label>
              <Select><SelectTrigger><SelectValue placeholder="الفئة" /></SelectTrigger>
                <SelectContent><SelectItem value="consultation">كشف</SelectItem><SelectItem value="laser">ليزر</SelectItem><SelectItem value="treatment">علاج</SelectItem><SelectItem value="cosmetic">تجميل</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const name = (document.getElementById('srvName') as HTMLInputElement)?.value
              if (!name) return toast.error('الاسم مطلوب')
              addItem('/services', { name, price: parseFloat((document.getElementById('srvPrice') as HTMLInputElement)?.value) || 0, duration: parseInt((document.getElementById('srvDuration') as HTMLInputElement)?.value) || null, category: 'consultation', active: true }, setServices)
              setShowAddService(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent>
          <DialogHeader><DialogTitle>معاملة مالية جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>النوع</Label>
              <Select defaultValue="income"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="income">إيراد</SelectItem><SelectItem value="expense">مصروف</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>الفئة</Label>
              <Select defaultValue="clinic"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="clinic">عيادي</SelectItem><SelectItem value="personal">شخصي</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>المبلغ *</Label><Input id="txAmount" type="number" placeholder="0" /></div>
            <div><Label>الوصف</Label><Input id="txDesc" placeholder="وصف المعاملة" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const amount = parseFloat((document.getElementById('txAmount') as HTMLInputElement)?.value)
              if (!amount) return toast.error('المبلغ مطلوب')
              addItem('/finance/transactions', { type: 'income', category: 'clinic', amount, description: (document.getElementById('txDesc') as HTMLInputElement)?.value }, setTransactions)
              setShowAddTransaction(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Appointment Dialog */}
      <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
        <DialogContent>
          <DialogHeader><DialogTitle>موعد جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>المريض</Label>
              <Select><SelectTrigger><SelectValue placeholder="اختر المريض" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{safeName(p.name)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>التاريخ</Label><Input id="apptDate" type="datetime-local" /></div>
            <div><Label>المدة (دقيقة)</Label><Input id="apptDuration" type="number" defaultValue="30" /></div>
            <div><Label>ملاحظات</Label><Textarea id="apptNotes" placeholder="ملاحظات" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const patientId = patients[0]?.id
              const date = (document.getElementById('apptDate') as HTMLInputElement)?.value
              if (!date) return toast.error('التاريخ مطلوب')
              addItem('/appointments', { patientId, date, duration: parseInt((document.getElementById('apptDuration') as HTMLInputElement)?.value) || 30, type: 'consultation', status: 'scheduled', notes: (document.getElementById('apptNotes') as HTMLTextAreaElement)?.value }, setAppointments)
              setShowAddAppointment(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Laser Record Dialog */}
      <Dialog open={showAddLaserRecord} onOpenChange={setShowAddLaserRecord}>
        <DialogContent>
          <DialogHeader><DialogTitle>سجل ليزر جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>المريض</Label>
              <Select><SelectTrigger><SelectValue placeholder="اختر المريض" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{safeName(p.name)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>المنطقة *</Label><Input id="laserArea" placeholder="مثال: الوجه، الذراعين" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>نوع البشرة</Label>
                <Select><SelectTrigger><SelectValue placeholder="نوع البشرة" /></SelectTrigger>
                  <SelectContent>{['I','II','III','IV','V','VI'].map(t => <SelectItem key={t} value={t}>النوع {t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>لون الشعر</Label><Input id="laserHair" placeholder="لون الشعر" /></div>
            </div>
            <div><Label>ملاحظات</Label><Textarea id="laserNotes" placeholder="ملاحظات" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const patientId = selectedPatient?.id || patients[0]?.id
              const bodyArea = (document.getElementById('laserArea') as HTMLInputElement)?.value
              if (!bodyArea) return toast.error('المنطقة مطلوبة')
              addItem('/laser/records', { patientId, bodyArea, skinType: 'III', hairColor: (document.getElementById('laserHair') as HTMLInputElement)?.value, totalSessions: 0, status: 'active', notes: (document.getElementById('laserNotes') as HTMLTextAreaElement)?.value }, setLaserRecords)
              setShowAddLaserRecord(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Laser Package Dialog */}
      <Dialog open={showAddLaserPackage} onOpenChange={setShowAddLaserPackage}>
        <DialogContent>
          <DialogHeader><DialogTitle>باقة ليزر جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>اسم الباقة *</Label><Input id="lpName" placeholder="اسم الباقة" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>عدد الجلسات</Label><Input id="lpSessions" type="number" placeholder="6" /></div>
              <div><Label>السعر</Label><Input id="lpPrice" type="number" placeholder="0" /></div>
            </div>
            <div><Label>المنطقة</Label><Input id="lpArea" placeholder="المنطقة" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const name = (document.getElementById('lpName') as HTMLInputElement)?.value
              if (!name) return toast.error('الاسم مطلوب')
              addItem('/laser/packages', { name, sessionsCount: parseInt((document.getElementById('lpSessions') as HTMLInputElement)?.value) || 6, price: parseFloat((document.getElementById('lpPrice') as HTMLInputElement)?.value) || 0, bodyArea: (document.getElementById('lpArea') as HTMLInputElement)?.value, active: true }, setLaserPackages)
              setShowAddLaserPackage(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent>
          <DialogHeader><DialogTitle>دواء جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>اسم الدواء *</Label><Input id="medName" placeholder="اسم الدواء" /></div>
            <div><Label>الفئة</Label>
              <Select defaultValue="cream"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="cream">كريم</SelectItem><SelectItem value="ointment">مرهم</SelectItem><SelectItem value="tablet">أقراص</SelectItem><SelectItem value="injection">حقن</SelectItem><SelectItem value="lotion">لوشن</SelectItem><SelectItem value="gel">جل</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>الوصف</Label><Textarea id="medDesc" placeholder="وصف الدواء" /></div>
            <div><Label>الجرعة</Label><Input id="medDosage" placeholder="الجرعة" /></div>
            <div><Label>التعليمات</Label><Textarea id="medInstr" placeholder="تعليمات الاستخدام" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const name = (document.getElementById('medName') as HTMLInputElement)?.value
              if (!name) return toast.error('الاسم مطلوب')
              addItem('/medications', { name, category: 'cream', description: (document.getElementById('medDesc') as HTMLTextAreaElement)?.value, dosage: (document.getElementById('medDosage') as HTMLInputElement)?.value, instructions: (document.getElementById('medInstr') as HTMLTextAreaElement)?.value, active: true }, setMedications)
              setShowAddMedication(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Prescription Dialog */}
      <Dialog open={showAddPrescription} onOpenChange={setShowAddPrescription}>
        <DialogContent>
          <DialogHeader><DialogTitle>وصفة طبية جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>التشخيص</Label><Input id="prescDiag" placeholder="التشخيص" /></div>
            <div><Label>ملاحظات</Label><Textarea id="prescNotes" placeholder="ملاحظات" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const patientId = selectedPatient?.id || patients[0]?.id
              if (!patientId) return toast.error('اختر المريض')
              addItem('/prescriptions', { patientId, diagnosis: (document.getElementById('prescDiag') as HTMLInputElement)?.value, notes: (document.getElementById('prescNotes') as HTMLTextAreaElement)?.value }, setPrescriptions)
              setShowAddPrescription(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Reminder Dialog */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
        <DialogContent>
          <DialogHeader><DialogTitle>تذكير جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>العنوان *</Label><Input id="remTitle" placeholder="عنوان التذكير" /></div>
            <div><Label>الوصف</Label><Textarea id="remDesc" placeholder="وصف التذكير" /></div>
            <div><Label>التاريخ</Label><Input id="remDate" type="datetime-local" /></div>
            <div><Label>النوع</Label>
              <Select defaultValue="follow_up"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="follow_up">متابعة</SelectItem><SelectItem value="appointment">موعد</SelectItem><SelectItem value="medication">دواء</SelectItem><SelectItem value="custom">مخصص</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const title = (document.getElementById('remTitle') as HTMLInputElement)?.value
              if (!title) return toast.error('العنوان مطلوب')
              const date = (document.getElementById('remDate') as HTMLInputElement)?.value || new Date().toISOString()
              addItem('/reminders', { title, description: (document.getElementById('remDesc') as HTMLTextAreaElement)?.value, date, type: 'follow_up', status: 'pending' }, setReminders)
              setShowAddReminder(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Dialog */}
      <Dialog open={showAddInventory} onOpenChange={setShowAddInventory}>
        <DialogContent>
          <DialogHeader><DialogTitle>صنف مخزني جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>اسم الصنف *</Label><Input id="invName" placeholder="اسم الصنف" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الكمية</Label><Input id="invQty" type="number" defaultValue="0" /></div>
              <div><Label>الحد الأدنى</Label><Input id="invMin" type="number" defaultValue="5" /></div>
            </div>
            <div><Label>السعر</Label><Input id="invPrice" type="number" placeholder="0" /></div>
            <div><Label>الفئة</Label><Input id="invCat" placeholder="الفئة" /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const name = (document.getElementById('invName') as HTMLInputElement)?.value
              if (!name) return toast.error('الاسم مطلوب')
              addItem('/inventory/items', { name, quantity: parseInt((document.getElementById('invQty') as HTMLInputElement)?.value) || 0, minQuantity: parseInt((document.getElementById('invMin') as HTMLInputElement)?.value) || 5, unitPrice: parseFloat((document.getElementById('invPrice') as HTMLInputElement)?.value) || 0, category: (document.getElementById('invCat') as HTMLInputElement)?.value }, setInventoryItems)
              setShowAddInventory(false)
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ AI ASSISTANT FAB ═══ */}
      <motion.div className="fixed bottom-6 left-6 z-50" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }}>
        <Button onClick={() => setAiChatOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-bl from-emerald-600 to-emerald-800 shadow-xl glow-emerald hover:scale-105 transition-transform">
          <Bot size={24} className="text-amber-300" />
        </Button>
      </motion.div>

      {/* AI Chat Dialog */}
      <Dialog open={aiChatOpen} onOpenChange={setAiChatOpen}>
        <DialogContent className="sm:max-w-md h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bot className="text-primary" size={20} /> المساعد الذكي</DialogTitle>
            <DialogDescription>اسأل أي سؤال عن المرضى أو العلاجات</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-3 py-2">
              {aiMessages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Bot size={40} className="mx-auto mb-3 opacity-30" />
                  <p>مرحباً! أنا المساعد الذكي لعيادة المغازى.</p>
                  <p className="mt-1">اسألني عن أي مريض أو علاج أو تشخيص.</p>
                </div>
              )}
              {aiMessages.map((m, i) => (
                <div key={i} className={cn('flex', m.role === 'user' ? 'justify-start' : 'justify-end')}>
                  <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                    m.role === 'user' ? 'bg-primary text-primary-foreground rounded-bl-md' : 'bg-muted rounded-br-md'
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {aiLoading && <div className="flex justify-end"><div className="bg-muted rounded-2xl rounded-br-md px-4 py-2.5"><RefreshCw className="animate-spin text-muted-foreground" size={16} /></div></div>}
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-2 border-t">
            <Input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="اكتب سؤالك..." onKeyDown={e => e.key === 'Enter' && sendAiMessage()} className="input-luxury" />
            <Button onClick={sendAiMessage} disabled={aiLoading || !aiInput.trim()} className="btn-luxury"><Send size={16} /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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
  Scissors, Syringe, Layers, Wand2, ThermometerSun,
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
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

// ─── Types ──────────────────────────────────────────────────────────────────
interface Patient { id: string; fileNumber: string; name: string; phone?: string; phone2?: string; age?: number; gender?: string; address?: string; notes?: string; allergies?: string; medicalHistory?: string; starred?: boolean; bloodType?: string; createdAt: string; }
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
interface Medication { id: string; name: string; category?: string; description?: string; dosage?: string; instructions?: string; active: boolean; }
interface Prescription { id: string; patientId: string; doctorId?: string; diagnosis?: string; notes?: string; date: string; }
interface Notification { id: string; userId?: string; title: string; message: string; type: string; read: boolean; createdAt: string; }
interface Backup { id: string; type: string; size?: number; status: string; createdAt: string; }
interface ChatMessage { role: 'user' | 'assistant'; content: string; }

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
  const [newPatientAllergy, setNewPatientAllergy] = useState('')
  const [selectedVisitType, setSelectedVisitType] = useState<string>('')
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [patientSearchSuggestions, setPatientSearchSuggestions] = useState<Patient[]>([])
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
  const [laserFormSessions, setLaserFormSessions] = useState('6')
  const [laserFormNotes, setLaserFormNotes] = useState('')
  const [laserFormPatientId, setLaserFormPatientId] = useState('')
  const [laserFormPatientSearch, setLaserFormPatientSearch] = useState('')

  // AI Chat
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Login
  const [loginEmail, setLoginEmail] = useState('doctor@elmoghazi.com')
  const [loginPassword, setLoginPassword] = useState('123456')
  const [loginLoading, setLoginLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      ])
      const u = (r: PromiseSettledResult<any>) => { if (r.status !== 'fulfilled') return []; const v = r.value; return v?.data || v?.patients || v?.visits || v?.sessions || v?.services || v?.notes || v?.alerts || v?.reminders || v?.records || v?.packages || v?.settings || v?.transactions || v?.appointments || v?.queue || v?.items || v?.medications || v?.prescriptions || v?.backups || v?.notifications || (Array.isArray(v) ? v : []) }
      setPatients(u(results[0])); setVisits(u(results[1])); setSessions(u(results[2])); setServices(u(results[3])); setNotes(u(results[4])); setAlerts(u(results[5])); setReminders(u(results[6])); setLaserRecords(u(results[7])); setLaserPackages(u(results[8])); setLaserSettings(u(results[9])); setTransactions(u(results[10])); setAppointments(u(results[11])); setWaitingQueue(u(results[12])); setInventoryItems(u(results[13])); setMedications(u(results[14])); setPrescriptions(u(results[15])); setBackups(u(results[16])); setNotifications(u(results[17]))
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])
  useEffect(() => { if (isAuthenticated) loadAllData() }, [isAuthenticated, loadAllData])

  // ─── Auto-suggest patient names ──────────────────────────────────────
  useEffect(() => {
    if (newPatientName.length >= 1) {
      const q = newPatientName.toLowerCase()
      setPatientSearchSuggestions(patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5))
    } else { setPatientSearchSuggestions([]) }
  }, [newPatientName, patients])

  // Laser patient search
  const laserPatientSuggestions = useMemo(() => {
    if (!laserFormPatientSearch) return []
    const q = laserFormPatientSearch.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5)
  }, [laserFormPatientSearch, patients])

  // ─── CRUD ─────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginLoading(true)
    try { const res = await apiFetch<{user: any}>('/auth/login', { method: 'POST', body: JSON.stringify({ email: loginEmail, password: loginPassword }) }); login(res.user); toast.success('مرحباً بك') } catch (e: any) { toast.error(e.message || 'خطأ في تسجيل الدخول') }
    setLoginLoading(false)
  }
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) }); const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.package || res?.setting || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.backup || res; if (item?.id) setter(prev => [item, ...prev]); toast.success('تمت الإضافة بنجاح'); return item } catch (e: any) { toast.error(e.message || 'خطأ'); return null }
  }
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: 'DELETE' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success('تم الحذف') } catch (e: any) { toast.error(e.message || 'خطأ') }
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
  const filteredPatients = useMemo(() => { let list = patients; if (searchQuery) list = list.filter(p => p.name.includes(searchQuery) || p.phone?.includes(searchQuery) || p.fileNumber?.includes(searchQuery)); return list }, [patients, searchQuery])

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
    const patient = await addItem('/patients', { name: newPatientName, phone: newPatientPhone, phone2: newPatientPhone2, age: parseInt(newPatientAge) || null, gender: newPatientGender || null, address: newPatientAddress, notes: newPatientNotes, allergies: newPatientAllergy }, setPatients)
    if (!patient) return

    const patientId = patient.id

    // Determine visit and session needs based on selected type (including combos)
    const needsVisit = ['checkup', 'revisit', 'checkup_session', 'revisit_session'].includes(selectedVisitType)
    const needsSession = ['session', 'checkup_session', 'revisit_session'].includes(selectedVisitType)
    const visitType = selectedVisitType === 'checkup_session' ? 'checkup' : selectedVisitType === 'revisit_session' ? 'revisit' : selectedVisitType

    // Create visit if needed
    if (needsVisit && (visitType === 'checkup' || visitType === 'revisit')) {
      await addItem('/visits', { patientId, type: visitType, date: new Date().toISOString() }, setVisits)
    }

    // Create sessions for selected services
    if (needsSession && selectedServiceIds.length > 0) {
      for (const serviceId of selectedServiceIds) {
        const svc = services.find(s => s.id === serviceId)
        await addItem('/sessions', { patientId, serviceId, status: 'scheduled', price: svc?.price || 0, paid: false, date: new Date().toISOString() }, setSessions)
      }
    }

    // Reset form
    setNewPatientName(''); setNewPatientPhone(''); setNewPatientPhone2(''); setNewPatientAddress(''); setNewPatientAge(''); setNewPatientGender(''); setNewPatientNotes(''); setNewPatientAllergy(''); setSelectedVisitType(''); setSelectedServiceIds([]); setShowAddPatient(false)
    toast.success(`تم تسجيل المريض ${newPatientName} بنجاح`)
  }

  // Services grouped by category for smart form (must be before early return - Rules of Hooks)
  const servicesByCategory = useMemo(() => {
    const cats: Record<string, Service[]> = {}
    services.filter(s => s.active).forEach(s => { const cat = s.category || 'عام'; if (!cats[cat]) cats[cat] = []; cats[cat].push(s) })
    return cats
  }, [services])

  // ─── Bottom Nav ───────────────────────────────────────────────────────
  const bottomNavItems = [
    { id: 'dashboard', label: 'الرئيسية', emoji: '🏠', icon: <LayoutDashboard size={20} /> },
    { id: 'patients', label: 'المرضى', emoji: '👥', icon: <Users size={20} /> },
    { id: 'laser', label: 'الليزر', emoji: '💎', icon: <Zap size={20} /> },
    { id: 'finance', label: 'المالية', emoji: '💰', icon: <DollarSign size={20} /> },
    { id: 'more', label: 'المزيد', emoji: '📋', icon: <MoreHorizontal size={20} /> },
  ]

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
              <div><Label className="text-emerald-200">البريد الإلكتروني</Label><Input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="bg-emerald-900/50 border-emerald-600/30 text-white input-luxury rounded-xl h-12" /></div>
              <div><Label className="text-emerald-200">كلمة المرور</Label><Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="bg-emerald-900/50 border-emerald-600/30 text-white input-luxury rounded-xl h-12" onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
            </CardContent>
            <CardFooter><Button onClick={handleLogin} disabled={loginLoading} className="w-full bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-6 text-lg btn-luxury rounded-xl shadow-lg">{loginLoading ? <RefreshCw className="animate-spin ml-2" size={20} /> : <Sparkles className="ml-2" size={20} />}تسجيل الدخول</Button></CardFooter>
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
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9"><Avatar className="h-8 w-8 border-2 border-primary/30"><AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{user?.name?.charAt(0) || 'د'}</AvatarFallback></Avatar></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setActiveTab('settings')}><Settings size={14} className="ml-2" /> الإعدادات</DropdownMenuItem><DropdownMenuItem onClick={() => { logout(); toast.success('تم تسجيل الخروج') }} className="text-red-500"><LogOut size={14} className="ml-2" /> خروج</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: <Users className="text-emerald-100" size={20} />, label: 'إجمالي المرضى', value: patients.length, color: 'bg-gradient-to-br from-emerald-600 to-emerald-800', sub: `+${patients.filter(p => p.createdAt?.startsWith(todayStr)).length} اليوم` },
                    { icon: <Stethoscope className="text-blue-100" size={20} />, label: 'زيارات اليوم', value: todayVisits.length, color: 'bg-gradient-to-br from-blue-600 to-blue-800' },
                    { icon: <DollarSign className="text-amber-100" size={20} />, label: 'إيراد اليوم', value: formatCurrency(todayIncome), color: 'bg-gradient-to-br from-amber-500 to-amber-700' },
                    { icon: <Calendar className="text-purple-100" size={20} />, label: 'مواعيد اليوم', value: todayAppointments.length, color: 'bg-gradient-to-br from-purple-600 to-purple-800' },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="section-card p-4"><div className="flex items-center gap-3"><div className={cn('p-2.5 rounded-xl shadow-lg', s.color)}>{s.icon}</div><div className="flex-1 min-w-0"><p className="text-[11px] text-muted-foreground truncate">{s.label}</p><p className="text-xl font-bold mt-0.5">{s.value}</p>{s.sub && <p className="text-[10px] text-muted-foreground">{s.sub}</p>}</div></div></motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="card-luxury lg:col-span-2"><CardHeader><CardTitle className="text-lg">الإيرادات والمصروفات</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={260}><BarChart data={revenueChartData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><RechartsTooltip /><Bar dataKey="إيراد" fill="#047857" radius={[4,4,0,0]} /><Bar dataKey="مصروف" fill="#D4A843" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></CardContent></Card>
                  <Card className="card-luxury"><CardHeader><CardTitle className="text-lg">توزيع المرضى</CardTitle></CardHeader><CardContent className="flex items-center justify-center"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{genderData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></CardContent></Card>
                </div>
                {/* Quick Actions */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-lg">إجراءات سريعة</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'مريض جديد', icon: <UserPlus size={20} />, color: 'bg-blue-500', action: () => setShowAddPatient(true) },
                    { label: 'سجل ليزر', icon: <Zap size={20} />, color: 'bg-cyan-500', action: () => setShowAddLaserRecord(true) },
                    { label: 'معاملة', icon: <DollarSign size={20} />, color: 'bg-amber-500', action: () => setShowAddTransaction(true) },
                    { label: 'موعد', icon: <Calendar size={20} />, color: 'bg-purple-500', action: () => setShowAddAppointment(true) },
                    { label: 'مساعد ذكي', icon: <Bot size={20} />, color: 'bg-emerald-500', action: () => setAiChatOpen(true) },
                  ].map((a, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={a.action} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors"><div className={cn('p-3 rounded-xl text-white shadow-lg', a.color)}>{a.icon}</div><span className="text-xs font-medium">{a.label}</span></motion.button>
                  ))}
                </div></CardContent></Card>
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
                <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input placeholder="بحث بالاسم أو الهاتف أو رقم الملف..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10 input-luxury rounded-xl h-12" /></div>
                <div className="space-y-2">
                  {filteredPatients.map(p => (
                    <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="section-card p-4 cursor-pointer" onClick={() => setSelectedPatient(p)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800"><AvatarFallback className="bg-blue-500/10 text-blue-600 font-bold">{p.name?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="font-bold truncate">{safeName(p.name)}</p>{p.starred && <Star className="text-amber-500 fill-amber-500" size={14} />}</div><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Hash size={10} />{p.fileNumber}</span>{p.phone && <span className="flex items-center gap-1"><Phone size={10} />{p.phone}</span>}{p.age && <span>{p.age} سنة</span>}</div></div>
                        <Badge className={cn('text-[10px]', p.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400')}>{p.gender === 'male' ? 'ذكر' : 'أنثى'}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ PATIENT DETAIL ═══ */}
            {activeTab === 'patients' && selectedPatient && (
              <div className="space-y-4">
                <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 text-primary text-sm font-medium hover:underline"><ChevronRight size={16} /> العودة</button>
                <div className="section-header-animated rounded-2xl bg-blue-50 dark:bg-blue-950/30">
                  <div className="relative z-10 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/30"><AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{selectedPatient.name?.charAt(0)}</AvatarFallback></Avatar>
                    <div><h2 className="text-2xl font-bold">{safeName(selectedPatient.name)}</h2><div className="flex items-center gap-3 text-sm text-muted-foreground"><span>{selectedPatient.fileNumber}</span>{selectedPatient.phone && <span>{selectedPatient.phone}</span>}{selectedPatient.age && <span>{selectedPatient.age} سنة</span>}</div></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="card-luxury"><CardHeader><CardTitle className="text-sm">معلومات أساسية</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{selectedPatient.phone && <p><span className="text-muted-foreground">الهاتف:</span> {selectedPatient.phone}</p>}{selectedPatient.phone2 && <p><span className="text-muted-foreground">هاتف آخر:</span> {selectedPatient.phone2}</p>}{selectedPatient.address && <p><span className="text-muted-foreground">العنوان:</span> {selectedPatient.address}</p>}{selectedPatient.bloodType && <p><span className="text-muted-foreground">فصيلة الدم:</span> {selectedPatient.bloodType}</p>}</CardContent></Card>
                  <Card className="card-luxury"><CardHeader><CardTitle className="text-sm">معلومات طبية</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{selectedPatient.allergies && <p><span className="text-muted-foreground">الحساسية:</span> {selectedPatient.allergies}</p>}{selectedPatient.medicalHistory && <p><span className="text-muted-foreground">التاريخ المرضي:</span> {selectedPatient.medicalHistory}</p>}{selectedPatient.notes && <p><span className="text-muted-foreground">ملاحظات:</span> {selectedPatient.notes}</p>}</CardContent></Card>
                </div>
                {/* Patient sessions */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-sm">جلسات المريض</CardTitle></CardHeader><CardContent className="space-y-2">{sessions.filter(s => s.patientId === selectedPatient.id).map(s => { const svc = services.find(sv => sv.id === s.serviceId); return <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div className="flex items-center gap-2"><Badge style={{ backgroundColor: statusColors[s.status as keyof typeof statusColors] + '20', color: statusColors[s.status as keyof typeof statusColors], borderColor: statusColors[s.status as keyof typeof statusColors] + '40' }} className="border">{s.status}</Badge><span className="text-sm">{svc?.name || 'جلسة'}</span></div><span className="text-sm font-medium">{formatCurrency(s.price)}</span></div> })}</CardContent></Card>
                {/* Patient laser records */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-sm">سجلات الليزر</CardTitle></CardHeader><CardContent className="space-y-2">{laserRecords.filter(l => l.patientId === selectedPatient.id).map(l => <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20"><div className="flex items-center gap-2"><Zap size={14} className="text-cyan-600" /><span className="text-sm">{l.bodyArea}</span></div><Badge variant="outline">{l.totalSessions} جلسات</Badge></div>)}</CardContent></Card>
              </div>
            )}

            {/* ═══ LASER ═══ - Professional Laser Center Management */}
            {activeTab === 'laser' && (
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
                      const patientSessions = sessions.filter(s => s.patientId === r.patientId)
                      const completedCount = patientSessions.filter(s => s.status === 'completed').length
                      const progressPercent = r.totalSessions > 0 ? Math.min((completedCount / r.totalSessions) * 100, 100) : 0
                      return (
                        <Card key={r.id} className="section-card p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2.5 rounded-xl text-xl', areaInfo?.color || 'bg-cyan-100 dark:bg-cyan-900/30')}>{areaInfo?.emoji || '💎'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2"><p className="font-bold text-sm">{p?.name || 'مريض'}</p><Badge style={{ backgroundColor: statusColors[r.status as keyof typeof statusColors] + '20', color: statusColors[r.status as keyof typeof statusColors] }} className="text-[10px]">{r.status === 'active' ? 'نشط' : r.status === 'completed' ? 'مكتمل' : r.status}</Badge></div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{areaInfo?.label || r.bodyArea}</span>{r.skinType && <span>| بشرة {r.skinType}</span>}{r.hairColor && <span>| شعر {r.hairColor}</span>}</div>
                              <div className="mt-2"><div className="flex items-center justify-between text-[10px] mb-1"><span>{completedCount} من {r.totalSessions} جلسة</span><span className="font-medium">{Math.round(progressPercent)}%</span></div><Progress value={progressPercent} className="h-2" /></div>
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
                                {!s.paid && <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/sessions/${s.id}`, { method: 'PATCH', body: JSON.stringify({ paid: true }) }); setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss)); toast.success('تم تأكيد الدفع') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-200">دفع</motion.button>}
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

                  {/* Laser Financial Summary */}
                  <TabsContent value="finance" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الليزر</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(laserPackages.filter(p => p.active).reduce((s, p) => s + p.price, 0))}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30"><Receipt className="text-amber-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">جلسات غير مدفوعة</p><p className="text-lg font-bold text-amber-600">{sessions.filter(s => !s.paid).length}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30"><ClipboardCheck className="text-blue-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">جلسات مكتملة</p><p className="text-lg font-bold text-blue-600">{sessions.filter(s => s.status === 'completed').length}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30"><UsersRound className="text-violet-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">مرضى الليزر</p><p className="text-lg font-bold text-violet-600">{new Set(laserRecords.map(r => r.patientId)).size}</p></div></div></Card>
                    </div>
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Receipt size={16} /> المبالغ المستحقة</CardTitle></CardHeader><CardContent className="space-y-2">
                      {sessions.filter(s => !s.paid).slice(0, 15).map(s => { const p = patients.find(pt => pt.id === s.patientId); const svc = services.find(sv => sv.id === s.serviceId); return <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"><div><p className="font-medium text-sm">{p?.name || 'مريض'}</p><p className="text-xs text-muted-foreground">{svc?.name || 'جلسة'}</p></div><div className="flex items-center gap-2"><span className="font-bold text-red-600">{formatCurrency(s.price)}</span><motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/sessions/${s.id}`, { method: 'PATCH', body: JSON.stringify({ paid: true }) }); setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss)); toast.success('تم الدفع') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold">تأكيد الدفع</motion.button></div></div> })}
                      {sessions.filter(s => !s.paid).length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد مبالغ مستحقة ✅</p>}
                    </CardContent></Card>
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
                <div className="grid grid-cols-2 gap-3">
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">الإيرادات</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30"><TrendingUp className="text-red-600 rotate-180" size={20} /></div><div><p className="text-[11px] text-muted-foreground">المصروفات</p><p className="text-xl font-bold text-red-600">{formatCurrency(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}</p></div></div></Card>
                </div>
                <div className="space-y-2">{transactions.slice(0, 30).map(t => <Card key={t.id} className="section-card p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-2 rounded-lg', t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30')}><DollarSign className={t.type === 'income' ? 'text-emerald-600' : 'text-red-600'} size={16} /></div><div><p className="font-medium text-sm">{t.description || t.category}</p><p className="text-xs text-muted-foreground">{formatDate(t.date)}</p></div></div><span className={cn('font-bold', t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span></div></Card>)}</div>
              </div>
            )}

            {/* ═══ MORE ═══ - ALL SUB-TABS WORKING */}
            {activeTab === 'more' && (
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-pink-50 dark:bg-pink-950/30">
                  <div className="relative z-10 flex items-center gap-3"><motion.div animate={{ rotate: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">📋</motion.div><div><h1 className="text-2xl font-bold">المزيد</h1><p className="text-muted-foreground text-sm">خدمات وأدوات إضافية</p></div></div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'services', label: 'الخدمات', emoji: '⚙️', gradient: 'from-teal-500 to-teal-700' },
                    { id: 'visits', label: 'الزيارات', emoji: '🩺', gradient: 'from-violet-500 to-violet-700' },
                    { id: 'sessions', label: 'الجلسات', emoji: '⚡', gradient: 'from-orange-500 to-orange-700' },
                    { id: 'appointments', label: 'المواعيد', emoji: '📅', gradient: 'from-purple-500 to-purple-700' },
                    { id: 'inventory', label: 'المخزون', emoji: '📦', gradient: 'from-amber-500 to-amber-700' },
                    { id: 'medications', label: 'الأدوية', emoji: '💊', gradient: 'from-green-500 to-green-700' },
                    { id: 'reminders', label: 'التذكيرات', emoji: '⏰', gradient: 'from-rose-500 to-rose-700' },
                    { id: 'backup', label: 'النسخ', emoji: '💾', gradient: 'from-slate-500 to-slate-700' },
                    { id: 'settings', label: 'الإعدادات', emoji: '🎨', gradient: 'from-indigo-500 to-indigo-700' },
                  ].map(s => (
                    <motion.button key={s.id} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} onClick={() => setMoreSubTab(s.id)} className={cn('flex flex-col items-center gap-1 p-3 rounded-xl transition-all border', moreSubTab === s.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-transparent hover:bg-muted/50')}>
                      <motion.div animate={moreSubTab === s.id ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.5, repeat: moreSubTab === s.id ? 2 : 0 }} className="text-2xl">{s.emoji}</motion.div>
                      <span className="text-[11px] font-medium">{s.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Services Sub-tab - Enhanced */}
                {moreSubTab === 'services' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Tag size={18} className="text-teal-500" /> الخدمات</h3><div className="flex items-center gap-2"><Badge variant="outline">{services.length} خدمة</Badge><Button className="btn-luxury rounded-xl bg-gradient-to-l from-teal-600 to-teal-700 text-white" onClick={() => setShowAddService(true)}><Plus size={14} className="ml-1" /> خدمة جديدة</Button></div></div>
                  {services.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">⚙️</p><p className="text-muted-foreground">لا توجد خدمات بعد</p></Card>}
                  {Object.entries(servicesByCategory).map(([cat, svcs]) => <Card key={cat} className="card-luxury"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Tag size={14} className="text-teal-500" /> {cat} <Badge variant="secondary" className="text-[9px]">{svcs.length}</Badge></CardTitle></CardHeader><CardContent className="space-y-2">{svcs.map(s => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-transparent hover:border-primary/20 transition-all"><div className="flex items-center gap-3"><div className={cn('w-2 h-8 rounded-full', s.active ? 'bg-emerald-500' : 'bg-red-400')} /><div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.duration ? `${s.duration} دقيقة` : 'بدون مدة محددة'}</p></div></div><div className="flex items-center gap-2"><Badge variant="outline" className="font-bold">{formatCurrency(s.price)}</Badge><Badge className={s.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]'}>{s.active ? 'نشط' : 'معطل'}</Badge><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/services', s.id, setServices)}><Trash2 size={12} className="text-red-500" /></Button></div></div>)}</CardContent></Card>)}
                </div>)}

                {/* Visits Sub-tab - Enhanced */}
                {moreSubTab === 'visits' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Stethoscope size={18} className="text-violet-500" /> الزيارات</h3><Badge variant="outline">{visits.length} زيارة</Badge></div>
                  {visits.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">🩺</p><p className="text-muted-foreground">لا توجد زيارات بعد</p></Card>}
                  <div className="space-y-2">{visits.slice(0, 30).map(v => { const p = patients.find(pt => pt.id === v.patientId); const vt = VISIT_TYPES.find(t => t.id === v.type); return <Card key={v.id} className="section-card p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-1.5 rounded-lg text-white', vt?.bg || 'bg-gray-500')}>{vt?.emoji || '📝'}</div><div><div className="flex items-center gap-2"><span className="font-medium text-sm">{p?.name || 'مريض'}</span><Badge className={cn('text-white text-[9px]', vt?.bg || 'bg-gray-500')}>{vt?.label || v.type}</Badge></div>{v.diagnosis && <p className="text-xs text-muted-foreground">{v.diagnosis}</p>}</div></div><span className="text-xs text-muted-foreground">{formatDate(v.date)}</span></div></Card> })}</div>
                </div>)}

                {/* Sessions Sub-tab - Enhanced with payment */}
                {moreSubTab === 'sessions' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Zap size={18} className="text-orange-500" /> الجلسات</h3><div className="flex items-center gap-2"><Badge variant="outline">{sessions.length} جلسة</Badge><Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[9px]">{sessions.filter(s => !s.paid).length} غير مدفوعة</Badge></div></div>
                  {sessions.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">⚡</p><p className="text-muted-foreground">لا توجد جلسات بعد</p></Card>}
                  <div className="space-y-2">{sessions.slice(0, 30).map(s => { const p = patients.find(pt => pt.id === s.patientId); const svc = services.find(sv => sv.id === s.serviceId); return <Card key={s.id} className="section-card p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-1.5 rounded-lg', s.paid ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>{s.paid ? <CheckCircle className="text-emerald-600" size={14} /> : <Clock className="text-amber-600" size={14} />}</div><div><p className="font-medium text-sm">{p?.name || 'مريض'} - {svc?.name || 'جلسة'}</p><div className="flex items-center gap-2"><Badge style={{ backgroundColor: statusColors[s.status as keyof typeof statusColors] + '20', color: statusColors[s.status as keyof typeof statusColors] }} className="border text-[9px]">{s.status}</Badge><span className="text-xs text-muted-foreground">{formatDate(s.date)}</span></div></div></div><div className="flex items-center gap-2"><span className="font-bold text-sm">{formatCurrency(s.price)}</span>{!s.paid && <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/sessions/${s.id}`, { method: 'PATCH', body: JSON.stringify({ paid: true }) }); setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss)); toast.success('تم الدفع') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold">دفع</motion.button>}</div></div></Card> })}</div>
                </div>)}

                {/* Appointments Sub-tab - Enhanced */}
                {moreSubTab === 'appointments' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Calendar size={18} className="text-purple-500" /> المواعيد</h3><Button className="btn-luxury rounded-xl bg-gradient-to-l from-purple-600 to-purple-700 text-white" onClick={() => setShowAddAppointment(true)}><Plus size={14} className="ml-1" /> موعد</Button></div>
                  {appointments.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">📅</p><p className="text-muted-foreground">لا توجد مواعيد بعد</p></Card>}
                  <div className="space-y-2">{appointments.slice(0, 30).map(a => { const p = patients.find(pt => pt.id === a.patientId); const isToday = a.date?.startsWith(todayStr); return <Card key={a.id} className={cn('section-card p-3', isToday && 'border-purple-300 dark:border-purple-800 ring-1 ring-purple-200 dark:ring-purple-900')}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-1.5 rounded-lg text-white', isToday ? 'bg-purple-500' : 'bg-gray-400')}><CalendarCheck size={14} /></div><div><p className="font-medium text-sm">{p?.name || 'موعد'}</p><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{a.type} - {a.duration} دقيقة</span>{isToday && <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[9px]">اليوم</Badge>}</div></div></div><Badge style={{ backgroundColor: statusColors[a.status as keyof typeof statusColors] + '20', color: statusColors[a.status as keyof typeof statusColors] }}>{a.status}</Badge></div></Card> })}</div>
                </div>)}

                {/* Inventory Sub-tab - Enhanced with stock alerts */}
                {moreSubTab === 'inventory' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Package size={18} className="text-amber-500" /> المخزون</h3><div className="flex items-center gap-2">{lowStockItems.length > 0 && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]">{lowStockItems.length} منخفض</Badge>}<Button className="btn-luxury rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 text-white" onClick={() => setShowAddInventory(true)}><Plus size={14} className="ml-1" /> عنصر</Button></div></div>
                  {inventoryItems.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">📦</p><p className="text-muted-foreground">لا توجد عناصر في المخزون</p></Card>}
                  <div className="space-y-2">{inventoryItems.map(i => { const isLow = i.quantity <= i.minQuantity; return <Card key={i.id} className={cn('section-card p-3', isLow && 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10')}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-1.5 rounded-lg', isLow ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30')}>{isLow ? <AlertTriangle className="text-red-600" size={14} /> : <Package className="text-emerald-600" size={14} />}</div><div><p className="font-medium text-sm">{i.name}</p><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{i.category || 'عام'}</span><span className={cn('text-xs font-bold', isLow ? 'text-red-600' : 'text-emerald-600')}>الكمية: {i.quantity} / الحد: {i.minQuantity}</span></div></div></div><div className="flex items-center gap-2">{isLow && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]">⚠️ منخفض</Badge>}<span className="text-xs text-muted-foreground">{formatCurrency(i.unitPrice)}</span></div></div></Card> })}</div>
                </div>)}

                {/* Medications Sub-tab - Enhanced */}
                {moreSubTab === 'medications' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Pill size={18} className="text-green-500" /> الأدوية</h3><Button className="btn-luxury rounded-xl bg-gradient-to-l from-green-600 to-green-700 text-white" onClick={() => setShowAddMedication(true)}><Plus size={14} className="ml-1" /> دواء</Button></div>
                  {medications.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">💊</p><p className="text-muted-foreground">لا توجد أدوية بعد</p></Card>}
                  <div className="space-y-2">{medications.map(m => <Card key={m.id} className="section-card p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-1.5 rounded-lg', m.active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-900/30')}><Pill className={m.active ? 'text-green-600' : 'text-gray-400'} size={14} /></div><div><p className="font-medium text-sm">{m.name}</p><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{m.category || 'عام'}</span>{m.dosage && <span className="text-xs text-muted-foreground">- الجرعة: {m.dosage}</span>}{m.instructions && <span className="text-xs text-muted-foreground">- {m.instructions}</span>}</div></div></div><div className="flex items-center gap-2"><Badge className={m.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]'}>{m.active ? 'نشط' : 'معطل'}</Badge><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/medications', m.id, setMedications)}><Trash2 size={12} className="text-red-500" /></Button></div></div></Card>)}</div>
                </div>)}

                {/* Reminders Sub-tab - Enhanced */}
                {moreSubTab === 'reminders' && (<div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Bell size={18} className="text-rose-500" /> التذكيرات</h3><Button className="btn-luxury rounded-xl bg-gradient-to-l from-rose-500 to-rose-600 text-white" onClick={() => setShowAddReminder(true)}><Plus size={14} className="ml-1" /> تذكير</Button></div>
                  {reminders.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">⏰</p><p className="text-muted-foreground">لا توجد تذكيرات</p></Card>}
                  <div className="space-y-2">{reminders.map(r => { const isPast = new Date(r.date) < new Date(); return <Card key={r.id} className={cn('section-card p-3', isPast && r.status !== 'completed' && 'border-amber-300 dark:border-amber-800')}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-1.5 rounded-lg', r.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' : isPast ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30')}><Bell className={r.status === 'completed' ? 'text-emerald-600' : isPast ? 'text-amber-600' : 'text-blue-600'} size={14} /></div><div><p className="font-medium text-sm">{r.title}</p><p className="text-xs text-muted-foreground">{formatDate(r.date)} {r.description && `- ${r.description}`}</p></div></div><div className="flex items-center gap-2"><Badge variant="outline" className={r.status === 'completed' ? 'border-emerald-500 text-emerald-600' : r.status === 'pending' ? 'border-amber-500 text-amber-600' : 'border-blue-500 text-blue-600'}>{r.status === 'completed' ? 'مكتمل' : r.status === 'pending' ? 'قيد الانتظار' : r.status}</Badge>{r.status !== 'completed' && <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { try { await apiFetch(`/reminders/${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) }); setReminders(prev => prev.map(rm => rm.id === r.id ? { ...rm, status: 'completed' } : rm)); toast.success('تم إكمال التذكير') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold">تم</motion.button>}</div></div></Card> })}</div>
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

                {/* Settings Sub-tab */}
                {moreSubTab === 'settings' && (<div className="space-y-4">
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
          return <button key={item.id} onClick={() => { setActiveTab(item.id); if (item.id === 'patients') setSelectedPatient(null) }} className={cn('bottom-nav-item', isActive && 'active')}><div className="nav-icon-wrapper">{isActive ? <span className="text-xl">{item.emoji}</span> : item.icon}</div><span className="nav-label">{item.label}</span></button>
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

      {/* ─── AI Chat ──────────────────────────────────────────────────────── */}
      <Dialog open={aiChatOpen} onOpenChange={setAiChatOpen}><DialogContent className="max-w-md h-[80vh] flex flex-col"><DialogHeader><DialogTitle className="flex items-center gap-2"><Bot size={20} className="text-primary" /> المساعد الذكي</DialogTitle></DialogHeader>
        <ScrollArea className="flex-1 p-2"><div className="space-y-3">{aiMessages.length === 0 && <div className="text-center text-muted-foreground text-sm py-8"><Bot size={40} className="mx-auto mb-2 opacity-30" /><p>مرحباً! أنا مساعدك الذكي</p></div>}{aiMessages.map((m, i) => <div key={i} className={cn('p-3 rounded-xl text-sm max-w-[85%]', m.role === 'user' ? 'bg-primary text-primary-foreground mr-auto' : 'bg-muted ml-auto')}><p className="whitespace-pre-wrap">{m.content}</p></div>)}{aiLoading && <div className="bg-muted p-3 rounded-xl ml-auto max-w-[85%]"><RefreshCw className="animate-spin text-muted-foreground" size={16} /></div>}</div></ScrollArea>
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
              <div className="grid grid-cols-3 gap-2">
                {/* First row: كشف / إعادة / جلسة */}
                {VISIT_TYPES.slice(0, 3).map(vt => (
                  <motion.button key={vt.id} whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.03 }} onClick={() => setSelectedVisitType(selectedVisitType === vt.id ? '' : vt.id)} className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-white font-medium', vt.bg, selectedVisitType === vt.id ? 'ring-4 shadow-lg scale-[1.03]' : 'opacity-50 hover:opacity-80', selectedVisitType === vt.id && vt.ring)}>
                    <span className="text-xl">{vt.emoji}</span>
                    <span className="text-xs font-bold">{vt.label}</span>
                  </motion.button>
                ))}
              </div>
              {/* Second row: Combo types - كشف+جلسة / إعادة+جلسة */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {VISIT_TYPES.slice(3).map(vt => (
                  <motion.button key={vt.id} whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.03 }} onClick={() => setSelectedVisitType(selectedVisitType === vt.id ? '' : vt.id)} className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-white font-medium', vt.bg, selectedVisitType === vt.id ? 'ring-4 shadow-lg scale-[1.03]' : 'opacity-50 hover:opacity-80', selectedVisitType === vt.id && vt.ring)}>
                    <span className="text-lg">{vt.emoji}</span>
                    <span className="text-xs font-bold">{vt.label}</span>
                  </motion.button>
                ))}
              </div>
              {/* Combo indicator */}
              {['checkup_session', 'revisit_session'].includes(selectedVisitType) && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-2.5 rounded-xl bg-gradient-to-l from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 border border-violet-200 dark:border-violet-800">
                  <p className="text-xs font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1"><Sparkles size={12} /> زيارة مدمجة: سيتم تسجيل {selectedVisitType === 'checkup_session' ? 'كشف + جلسة' : 'إعادة + جلسة'} معاً</p>
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
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1"><Phone size={14} /> هاتف آخر</Label>
                <Input value={newPatientPhone2} onChange={e => setNewPatientPhone2(e.target.value)} placeholder="رقم إضافي" className="input-luxury rounded-xl h-11 mt-1 border-teal-200 dark:border-teal-800 focus:border-teal-500 bg-teal-50/30 dark:bg-teal-950/10" />
              </div>
              <div>
                <Label className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1"><Hash size={14} /> العمر</Label>
                <Input value={newPatientAge} onChange={e => setNewPatientAge(e.target.value)} type="number" placeholder="العمر" className="input-luxury rounded-xl h-11 mt-1 border-amber-200 dark:border-amber-800 focus:border-amber-500 bg-amber-50/30 dark:bg-amber-950/10" />
              </div>
              <div>
                <Label className="text-sm font-bold text-pink-600 dark:text-pink-400">الجنس</Label>
                <Select value={newPatientGender} onValueChange={setNewPatientGender}><SelectTrigger className="rounded-xl h-11 mt-1 border-pink-200 dark:border-pink-800 bg-pink-50/30 dark:bg-pink-950/10"><SelectValue placeholder="الجنس" /></SelectTrigger><SelectContent><SelectItem value="male">ذكر</SelectItem><SelectItem value="female">أنثى</SelectItem></SelectContent></Select>
              </div>
            </div>

            {/* ─── 5. ALLERGY ─── */}
            <div>
              <Label className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1"><Heart size={14} /> الحساسية</Label>
              <Input value={newPatientAllergy} onChange={e => setNewPatientAllergy(e.target.value)} placeholder="أي حساسية" className="input-luxury rounded-xl h-11 mt-1 border-red-200 dark:border-red-800 focus:border-red-500 bg-red-50/30 dark:bg-red-950/10" />
            </div>

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
                    اختر الخدمات
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
                              <span className={cn('text-[10px]', isSelected ? 'text-orange-100' : 'text-muted-foreground')}>{formatCurrency(s.price)}</span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {selectedServiceIds.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-300 dark:border-orange-700 flex items-center justify-between">
                      <span className="text-sm font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5"><Activity size={14} /> الإجمالي</span>
                      <span className="text-lg font-bold text-orange-700 dark:text-orange-300">{formatCurrency(selectedServiceIds.reduce((sum, id) => { const s = services.find(sv => sv.id === id); return sum + (s?.price || 0) }, 0))}</span>
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

      {/* ═══ LASER RECORD DIALOG ═══ */}
      <Dialog open={showAddLaserRecord} onOpenChange={setShowAddLaserRecord}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Zap size={20} className="text-cyan-600" /> سجل ليزر جديد</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Patient search */}
            <div className="relative">
              <Label className="text-sm font-bold">المريض *</Label>
              <Input value={laserFormPatientSearch} onChange={e => setLaserFormPatientSearch(e.target.value)} placeholder="ابحث بالاسم أو الهاتف..." className="input-luxury rounded-xl h-11 mt-1" />
              {laserPatientSuggestions.length > 0 && <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">{laserPatientSuggestions.map(p => (<button key={p.id} onClick={() => { setLaserFormPatientId(p.id); setLaserFormPatientSearch(p.name) }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 text-right text-sm"><span className="font-medium">{p.name}</span><span className="text-xs text-muted-foreground">{p.phone}</span></button>))}</div>}
            </div>

            {/* Body Area Selection with emojis */}
            <div>
              <Label className="text-sm font-bold">منطقة الجسم *</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
                {BODY_AREAS.map(area => (
                  <motion.button key={area.id} whileTap={{ scale: 0.9 }} onClick={() => setLaserFormArea(laserFormArea === area.id ? '' : area.id)} className={cn('flex flex-col items-center gap-1 p-2 rounded-xl border transition-all', area.color, laserFormArea === area.id ? 'ring-2 ring-primary shadow-md' : 'opacity-60 hover:opacity-100')}>
                    <span className="text-xl">{area.emoji}</span>
                    <span className="text-[10px] font-medium text-center">{area.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Skin Type */}
            <div>
              <Label className="text-sm font-bold">نوع البشرة</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {SKIN_TYPES.map(st => (
                  <motion.button key={st.id} whileTap={{ scale: 0.95 }} onClick={() => setLaserFormSkinType(laserFormSkinType === st.id ? '' : st.id)} className={cn('p-2 rounded-lg border text-xs text-center transition-all', st.color, laserFormSkinType === st.id ? 'ring-2 ring-primary shadow-md' : 'opacity-60 hover:opacity-100')}>
                    {st.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div>
              <Label className="text-sm font-bold">لون الشعر</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {HAIR_COLORS.map(hc => (
                  <motion.button key={hc.id} whileTap={{ scale: 0.9 }} onClick={() => setLaserFormHairColor(laserFormHairColor === hc.id ? '' : hc.id)} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all', laserFormHairColor === hc.id ? 'ring-2 ring-primary shadow-md' : 'opacity-60 hover:opacity-100')}>
                    <div className={cn('w-4 h-4 rounded-full', hc.color)} /> {hc.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label>عدد الجلسات</Label><Input value={laserFormSessions} onChange={e => setLaserFormSessions(e.target.value)} type="number" className="input-luxury rounded-xl mt-1" /></div>
              <div><Label>ملاحظات</Label><Input value={laserFormNotes} onChange={e => setLaserFormNotes(e.target.value)} placeholder="ملاحظات" className="input-luxury rounded-xl mt-1" /></div>
            </div>
          </div>
          <DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-cyan-600 to-cyan-700 text-white font-bold h-12" onClick={async () => {
            if (!laserFormPatientId || !laserFormArea) return toast.error('اختر المريض ومنطقة الجسم')
            await addItem('/laser/records', { patientId: laserFormPatientId, bodyArea: BODY_AREAS.find(a => a.id === laserFormArea)?.label || laserFormArea, skinType: laserFormSkinType || null, hairColor: laserFormHairColor || null, totalSessions: parseInt(laserFormSessions) || 6, status: 'active', notes: laserFormNotes }, setLaserRecords)
            setLaserFormArea(''); setLaserFormSkinType(''); setLaserFormHairColor(''); setLaserFormSessions('6'); setLaserFormNotes(''); setLaserFormPatientId(''); setLaserFormPatientSearch(''); setShowAddLaserRecord(false)
          }}><Zap size={16} className="ml-2" /> حفظ السجل</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Other Dialogs ═══ */}
      {/* Add Service */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>خدمة جديدة</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>الاسم *</Label><Input id="svName" placeholder="اسم الخدمة" className="input-luxury rounded-xl" /></div><div><Label>الفئة</Label><Input id="svCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div><div><Label>السعر *</Label><Input id="svPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div><div><Label>المدة (دقيقة)</Label><Input id="svDur" type="number" placeholder="30" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { const name = (document.getElementById('svName') as HTMLInputElement)?.value; if (!name) return toast.error('الاسم مطلوب'); addItem('/services', { name, category: (document.getElementById('svCat') as HTMLInputElement)?.value, price: parseFloat((document.getElementById('svPrice') as HTMLInputElement)?.value) || 0, duration: parseInt((document.getElementById('svDur') as HTMLInputElement)?.value) || 30, active: true }, setServices); setShowAddService(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Transaction */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>معاملة مالية</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>النوع</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="النوع" /></SelectTrigger><SelectContent><SelectItem value="income">إيراد</SelectItem><SelectItem value="expense">مصروف</SelectItem></SelectContent></Select></div><div><Label>الفئة</Label><Input id="tCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div><div><Label>المبلغ *</Label><Input id="tAmt" type="number" placeholder="0" className="input-luxury rounded-xl" /></div><div><Label>الوصف</Label><Textarea id="tDesc" placeholder="وصف المعاملة" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/finance/transactions', { type: 'income', category: (document.getElementById('tCat') as HTMLInputElement)?.value || 'عام', amount: parseFloat((document.getElementById('tAmt') as HTMLInputElement)?.value) || 0, description: (document.getElementById('tDesc') as HTMLTextAreaElement)?.value, date: new Date().toISOString() }, setTransactions); setShowAddTransaction(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Appointment */}
      <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>موعد جديد</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>المريض</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div><div><Label>النوع</Label><Input id="apType" placeholder="نوع الموعد" className="input-luxury rounded-xl" /></div><div><Label>المدة</Label><Input id="apDur" type="number" placeholder="30" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/appointments', { patientId: patients[0]?.id, type: (document.getElementById('apType') as HTMLInputElement)?.value || 'استشارة', duration: parseInt((document.getElementById('apDur') as HTMLInputElement)?.value) || 30, status: 'scheduled', date: new Date().toISOString() }, setAppointments); setShowAddAppointment(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Laser Package */}
      <Dialog open={showAddLaserPackage} onOpenChange={setShowAddLaserPackage}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>باقة ليزر جديدة</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>اسم الباقة *</Label><Input id="lpName" placeholder="اسم الباقة" className="input-luxury rounded-xl" /></div><div className="grid grid-cols-2 gap-3"><div><Label>عدد الجلسات</Label><Input id="lpSess" type="number" placeholder="6" className="input-luxury rounded-xl" /></div><div><Label>السعر</Label><Input id="lpPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div></div><div><Label>منطقة الجسم</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المنطقة" /></SelectTrigger><SelectContent>{BODY_AREAS.map(a => <SelectItem key={a.id} value={a.label}>{a.emoji} {a.label}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/laser/packages', { name: (document.getElementById('lpName') as HTMLInputElement)?.value, sessionsCount: parseInt((document.getElementById('lpSess') as HTMLInputElement)?.value) || 6, price: parseFloat((document.getElementById('lpPrice') as HTMLInputElement)?.value) || 0, active: true }, setLaserPackages); setShowAddLaserPackage(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Medication */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>دواء جديد</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>الاسم *</Label><Input id="medName" placeholder="اسم الدواء" className="input-luxury rounded-xl" /></div><div><Label>الفئة</Label><Input id="medCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div><div><Label>الجرعة</Label><Input id="medDosage" placeholder="الجرعة" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/medications', { name: (document.getElementById('medName') as HTMLInputElement)?.value, category: (document.getElementById('medCat') as HTMLInputElement)?.value, dosage: (document.getElementById('medDosage') as HTMLInputElement)?.value, active: true }, setMedications); setShowAddMedication(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Reminder */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>تذكير جديد</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>العنوان *</Label><Input id="remTitle" placeholder="عنوان التذكير" className="input-luxury rounded-xl" /></div><div><Label>التاريخ</Label><Input id="remDate" type="date" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/reminders', { title: (document.getElementById('remTitle') as HTMLInputElement)?.value, date: (document.getElementById('remDate') as HTMLInputElement)?.value || new Date().toISOString(), type: 'general', status: 'pending' }, setReminders); setShowAddReminder(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Inventory */}
      <Dialog open={showAddInventory} onOpenChange={setShowAddInventory}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>عنصر مخزون</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>الاسم *</Label><Input id="invName" placeholder="اسم العنصر" className="input-luxury rounded-xl" /></div><div className="grid grid-cols-3 gap-3"><div><Label>الكمية</Label><Input id="invQty" type="number" placeholder="0" className="input-luxury rounded-xl" /></div><div><Label>الحد الأدنى</Label><Input id="invMin" type="number" placeholder="5" className="input-luxury rounded-xl" /></div><div><Label>السعر</Label><Input id="invPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/inventory/items', { name: (document.getElementById('invName') as HTMLInputElement)?.value, quantity: parseInt((document.getElementById('invQty') as HTMLInputElement)?.value) || 0, minQuantity: parseInt((document.getElementById('invMin') as HTMLInputElement)?.value) || 5, unitPrice: parseFloat((document.getElementById('invPrice') as HTMLInputElement)?.value) || 0 }, setInventoryItems); setShowAddInventory(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

    </div>
  )
}

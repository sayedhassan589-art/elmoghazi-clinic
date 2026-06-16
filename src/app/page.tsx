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
  CalendarCheck, UsersRound, ClipboardCheck, AlertCircle,
  Wallet, TrendingDown, StickyNote, Coffee, Home as HomeIcon,
  GraduationCap, Shirt, Flame, Gift, Award, Building2, Car,
  Utensils, Gamepad2, HeartPulse, PiggyBank, CheckCircle2,
  Lightbulb, Sparkle, Copy
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
interface ImprovementEntry { score: number; date: string; note?: string }
interface Patient { id: string; fileNumber: string; name: string; phone?: string; phone2?: string; age?: number; gender?: string; address?: string; notes?: string; allergies?: string; medicalHistory?: string; starred?: boolean; improved?: boolean; colorTag?: string; bloodType?: string; improvementScore?: number; improvementHistory?: string; createdAt: string; }
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
interface WaitingItem { id: string; patientId?: string; patientName?: string; priority: number; status: string; notes?: string; createdAt: string; }
interface InventoryItem { id: string; name: string; category?: string; quantity: number; minQuantity: number; unitPrice: number; notes?: string; }
interface Medication { id: string; name: string; category?: string; description?: string; dosage?: string; instructions?: string; active: boolean; }
interface Prescription { id: string; patientId: string; doctorId?: string; diagnosis?: string; notes?: string; date: string; }
interface Notification { id: string; userId?: string; title: string; message: string; type: string; read: boolean; createdAt: string; }
interface Backup { id: string; type: string; size?: number; status: string; createdAt: string; }
interface PatientPhoto { id: string; patientId: string; type: string; description?: string; imageData: string; createdAt: string; }
interface ChatMessage { role: 'user' | 'assistant'; content: string; }
interface PartnerDoctor { id: string; name: string; phone?: string; specialty?: string; checkupPercentage: number; revisitPercentage: number; laserPercentage: number; sessionPercentage: number; fixedAmount: number; active: boolean; notes?: string; createdAt: string; }
interface FollowUpRecord { id: string; patientId: string; condition: string; conditionCategory?: string; severity: string; status: string; frequency: string; customDays?: number; nextVisitDate?: string; lastVisitDate?: string; hasSubscription: boolean; subscriptionType?: string; subscriptionPrice: number; subscriptionStart?: string; subscriptionEnd?: string; sessionsIncluded: number; sessionsUsed: number; diagnosis?: string; treatmentPlan?: string; medications?: string; notes?: string; reminderEnabled: boolean; reminderDaysBefore: number; createdAt: string; patient?: Patient; followUpVisits?: FollowUpVisit[]; }
interface FollowUpVisit { id: string; followUpId: string; visitNumber: number; visitDate: string; type: string; findings?: string; vitals?: string; diagnosis?: string; treatmentNotes?: string; medications?: string; instructions?: string; paid: boolean; price: number; nextVisitDate?: string; status: string; notes?: string; createdAt: string; followUp?: FollowUpRecord & { patient?: Patient }; }

// ─── Helpers ────────────────────────────────────────────────────────────────
const CHART_COLORS = ['#047857', '#D4A843', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EC4899']

// Helper: normalize any Arabic/Persian numerals and symbols to Latin
const normalizePhone = (phone: string): string => {
  return phone
    // Convert Arabic-Indic numerals (٠-٩) used in Egypt/Arabic
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    // Convert Persian/Urdu numerals (۰-۹) used in some keyboards
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    // Convert Arabic full-width plus sign to Latin +
    .replace(/＋/g, '+')
    // Convert Arabic comma/dash/space to Latin equivalents
    .replace(/[،٬]/g, ',')
    .replace(/ـ/g, '-')
    // Remove common RTL/LTR marks and Arabic tatweel
    .replace(/[\u200E\u200F\u200C\u200D\u0640]/g, '')
}

// Helper: format phone for WhatsApp (adds Egypt country code +20 if missing)
const waPhone = (phone?: string) => {
  if (!phone) return ''
  // Step 1: Normalize ALL Arabic/Persian numerals to Latin
  const normalized = normalizePhone(phone)
  // Step 2: Extract only digits
  const digits = normalized.replace(/[^0-9]/g, '')
  if (!digits || digits.length < 3) return '' // too short to be valid
  // Step 3: Add Egypt country code if missing
  if (digits.startsWith('20')) return digits // already has country code
  if (digits.startsWith('0')) return '2' + digits // starts with 0 → add 2
  return '20' + digits // no prefix → add 20
}

// Helper: get local date string in Cairo timezone (fixes UTC offset issue)
const getLocalDateStr = (date?: Date | string) => {
  const d = date ? new Date(date) : new Date()
  return d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })
}

// Helper: get Cairo weekday name from a YYYY-MM-DD date string — bulletproof timezone handling
// Uses noon UTC (T12:00:00Z) so the date never crosses a day boundary regardless of timezone offset
const getCairoWeekday = (dateStr: string): string => {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('ar-EG', { weekday: 'long', timeZone: 'Africa/Cairo' })
}

// Helper: get Cairo formatted date label from a YYYY-MM-DD date string — always shows correct Cairo date
const getCairoDateLabel = (dateStr: string): string => {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' })
}

// Helper: get Cairo timezone date parts (year, month, day) — avoids UTC offset on Vercel
const getCairoDateParts = (date?: Date | string) => {
  const d = date ? new Date(date) : new Date()
  const parts = d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }).split('-').map(Number)
  return { year: parts[0], month: parts[1], day: parts[2], dateStr: parts.join('-') }
}

// Helper: get all 7 days of the current Egyptian week (Saturday–Friday) as date strings
// Returns array of { dateStr, dayName } from Saturday to Friday of the current week
const getEgyptianWeekDays = () => {
  const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
  const dayOfWeek = nowCairo.getDay() // 0=Sun, 6=Sat
  const daysSinceSaturday = (dayOfWeek + 1) % 7 // Sat=0, Sun=1, ..., Fri=6
  const saturday = new Date(nowCairo)
  saturday.setDate(nowCairo.getDate() - daysSinceSaturday)
  const days: { dateStr: string; dayName: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(saturday)
    d.setDate(saturday.getDate() + i)
    days.push({
      dateStr: d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }),
      dayName: d.toLocaleDateString('ar-EG', { weekday: 'short', timeZone: 'Africa/Cairo' })
    })
  }
  return days
}
// Helper: get current Cairo time as ISO string (UTC) — timezone-aware
// Creates a Date object representing "now" in Cairo, then returns its UTC ISO string
// This ensures the server (which runs in UTC) stores the correct Cairo-local time
const cairoISO = () => {
  const now = new Date()
  // Get Cairo's local date/time components
  const cairoStr = now.toLocaleString('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  // en-CA with time gives "2024/06/14, 13:04:09" format
  // We need to parse it to create a proper Cairo-local → UTC conversion
  return now.toISOString()
}

// Helper: get today's date in Cairo timezone as YYYY-MM-DD (for date input defaults)
const cairoTodayInput = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })

// Helper: get current time in Cairo as HH:MM (for time input defaults)
const cairoTimeInput = () => {
  const now = new Date()
  return now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' })
}

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

// Laser body areas - text only, comprehensive list
const BODY_AREAS = [
  { id: 'face', label: 'الوجه', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { id: 'forehead', label: 'الجبين', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { id: 'cheeks', label: 'الخدود', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
  { id: 'chin', label: 'الذقن', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
  { id: 'upper_lip', label: 'الشفاة العليا', color: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' },
  { id: 'lower_lip', label: 'الشفاة السفلى', color: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' },
  { id: 'jawline', label: 'خط الفك', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
  { id: 'nose', label: 'الأنف', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { id: 'ears', label: 'الأذنين', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { id: 'sideburns', label: 'السوالف', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { id: 'neck_front', label: 'الرقبة الأمامية', color: 'bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400' },
  { id: 'neck_back', label: 'الرقبة الخلفية', color: 'bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400' },
  { id: 'neck', label: 'الرقبة كاملة', color: 'bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400' },
  { id: 'shoulders', label: 'الكتفين', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  { id: 'upper_arms', label: 'الذراعين العلويين', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { id: 'lower_arms', label: 'الذراعين السفليين', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { id: 'arms', label: 'الذراعين كاملة', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
  { id: 'hands', label: 'اليدين', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
  { id: 'fingers', label: 'الأصابع', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
  { id: 'underarms', label: 'الإبط', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
  { id: 'chest', label: 'الصدر', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { id: 'chest_between', label: 'بين الثديين', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { id: 'abdomen_upper', label: 'البطن العلوي', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { id: 'abdomen_lower', label: 'البطن السفلي', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { id: 'abdomen', label: 'البطن كاملة', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { id: 'navel_line', label: 'خط السرة', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { id: 'back_upper', label: 'الظهر العلوي', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
  { id: 'back_lower', label: 'الظهر السفلي', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
  { id: 'back', label: 'الظهر كامل', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
  { id: 'bikini', label: 'البيكيني', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { id: 'bikini_full', label: 'البيكيني الكامل', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { id: 'buttocks', label: 'الأرداف', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { id: 'thighs_front', label: 'الفخذين الأمامي', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  { id: 'thighs_back', label: 'الفخذين الخلفي', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  { id: 'thighs', label: 'الفخذين كاملة', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  { id: 'calves', label: 'الساقين', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  { id: 'shins', label: 'الساق الأمامية', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  { id: 'legs', label: 'الرجلين كاملة', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  { id: 'feet', label: 'القدمين', color: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400' },
  { id: 'toes', label: 'أصابع القدم', color: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400' },
  { id: 'full_body', label: 'جسم كامل', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  { id: 'half_body_upper', label: 'نصف الجسم العلوي', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  { id: 'half_body_lower', label: 'نصف الجسم السفلي', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
]

const SKIN_TYPES = [
  { id: 'I', label: 'النوع I - أبيض فاتح جداً (Always burns, never tans)', color: 'bg-rose-50 border-rose-300' },
  { id: 'II', label: 'النوع II - أبيض فاتح (Burns easily, tans minimally)', color: 'bg-orange-50 border-orange-300' },
  { id: 'III', label: 'النوع III - أبيض متوسط (Burns moderately, tans gradually)', color: 'bg-amber-50 border-amber-300' },
  { id: 'IV', label: 'النوع IV - حنطي (Burns minimally, tans easily)', color: 'bg-yellow-50 border-yellow-300' },
  { id: 'V', label: 'النوع V - بني فاتح (Rarely burns, tans darkly)', color: 'bg-emerald-50 border-emerald-300' },
  { id: 'VI', label: 'النوع VI - بني غامق (Never burns, deeply pigmented)', color: 'bg-stone-50 border-stone-400' },
  { id: 'sensitive', label: 'بشرة حساسة', color: 'bg-red-50 border-red-300' },
  { id: 'oily', label: 'بشرة دهنية', color: 'bg-yellow-50 border-yellow-300' },
  { id: 'dry', label: 'بشرة جافة', color: 'bg-blue-50 border-blue-300' },
  { id: 'combination', label: 'بشرة مختلطة', color: 'bg-purple-50 border-purple-300' },
  { id: 'normal', label: 'بشرة عادية', color: 'bg-green-50 border-green-300' },
  { id: 'acne_prone', label: 'بشرة عرضة لحب الشباب', color: 'bg-pink-50 border-pink-300' },
]

const HAIR_COLORS = [
  { id: 'black', label: 'أسود', color: 'bg-gray-800' },
  { id: 'dark_brown', label: 'بني غامق جداً', color: 'bg-gray-700' },
  { id: 'brown', label: 'بني غامق', color: 'bg-amber-900' },
  { id: 'medium_brown', label: 'بني متوسط', color: 'bg-amber-700' },
  { id: 'light_brown', label: 'بني فاتح', color: 'bg-amber-500' },
  { id: 'dark_blonde', label: 'أشقر غامق', color: 'bg-amber-400' },
  { id: 'blonde', label: 'أشقر', color: 'bg-yellow-400' },
  { id: 'light_blonde', label: 'أشقر فاتح', color: 'bg-yellow-300' },
  { id: 'platinum', label: 'أشقر بلاتيني', color: 'bg-gray-200' },
  { id: 'red', label: 'أحمر', color: 'bg-red-600' },
  { id: 'auburn', label: 'بني محمر', color: 'bg-red-800' },
  { id: 'strawberry', label: 'أشقر محمر', color: 'bg-red-400' },
  { id: 'copper', label: 'نحاسي', color: 'bg-orange-600' },
  { id: 'gray', label: 'رمادي', color: 'bg-gray-400' },
  { id: 'white', label: 'أبيض', color: 'bg-gray-100' },
  { id: 'mixed', label: 'مختلط', color: 'bg-gray-500' },
]

// Improvement Score helpers
const getImprovementColor = (score: number) => {
  if (score <= 3) return { ring: '#ef4444', bg: 'bg-red-500', text: 'text-red-600', label: 'سيء' }
  if (score <= 5) return { ring: '#f97316', bg: 'bg-orange-500', text: 'text-orange-600', label: 'متوسط' }
  if (score <= 7) return { ring: '#eab308', bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'جيد' }
  if (score <= 9) return { ring: '#22c55e', bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'ممتاز' }
  return { ring: '#047857', bg: 'bg-emerald-700', text: 'text-emerald-700', label: 'مثالي' }
}

const getImprovementEmoji = (score: number) => {
  if (score <= 3) return '😟'
  if (score <= 5) return '😐'
  if (score <= 7) return '🙂'
  if (score <= 9) return '😊'
  return '🤩'
}

const getImprovementHistory = (historyStr?: string): ImprovementEntry[] => {
  if (!historyStr) return []
  try { return JSON.parse(historyStr) } catch { return [] }
}

// ─── Smart Search Helpers ────────────────────────────────────────────
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Arabic text normalization: remove diacritics, normalize alef/yaa/taa
const normalizeArabic = (text: string): string => {
  return text
    .replace(/[أإآا]/g, 'ا')  // normalize alef variants
    .replace(/[ة]/g, 'ه')      // taa marbuta → haa
    .replace(/[ى]/g, 'ي')      // alef maqsura → yaa
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove diacritics/tashkeel
    .replace(/\s+/g, ' ')      // normalize whitespace
    .trim()
    .toLowerCase()
}

// Fuzzy match: checks if query characters appear in order in target
const fuzzyMatch = (query: string, target: string): boolean => {
  const nq = normalizeArabic(query)
  const nt = normalizeArabic(target)
  if (nt.includes(nq)) return true // direct substring match (normalized)
  // Character-by-character fuzzy match
  let qi = 0
  for (let ti = 0; ti < nt.length && qi < nq.length; ti++) {
    if (nt[ti] === nq[qi]) qi++
  }
  return qi === nq.length
}

// Smart search: tries exact, then normalized, then fuzzy
const smartSearch = (query: string, fields: (string | undefined)[]): { match: boolean; score: number } => {
  if (!query.trim()) return { match: false, score: 0 }
  const nq = normalizeArabic(query)
  let bestScore = 0
  for (const field of fields) {
    if (!field) continue
    const nf = normalizeArabic(field)
    // Exact substring (highest score)
    if (nf.includes(nq)) {
      const score = nq.length / nf.length + 1 // prefer longer matches
      if (score > bestScore) bestScore = score
    }
    // Fuzzy match (lower score)
    else if (fuzzyMatch(query, field)) {
      const score = 0.5
      if (score > bestScore) bestScore = score
    }
  }
  return { match: bestScore > 0, score: bestScore }
}

// Helper: map visit type to financial category — single source of truth
const getVisitCategory = (type: string): string => {
  switch (type) {
    case 'checkup': return 'كشف'
    case 'revisit': return 'إعادة'
    case 'session': return 'جلسات'
    case 'checkup_session': return 'كشف'
    case 'revisit_session': return 'إعادة'
    default: return 'كشف'
  }
}

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
  const { user, isAuthenticated, login, logout, userRole, setUserRole } = useAuthStore()
  const { activeTab, setActiveTab, theme, setTheme, statusColors, setStatusColors, autoBackup, setAutoBackup, backupInterval, setBackupInterval, lastBackup, setLastBackup, sectionPasswords, setSectionPasswords } = useClinicStore()
  const [darkMode, setDarkMode] = useState(false)
  const [smartSearchOpen, setSmartSearchOpen] = useState(false)
  const [smartSearchQuery, setSmartSearchQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchField, setSearchField] = useState<'all' | 'name' | 'address' | 'diagnosis' | 'phone' | 'notes'>('all')
  const [patientDisplayCount, setPatientDisplayCount] = useState(50)

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
  const [newPatientDiagnosis, setNewPatientDiagnosis] = useState('')
  const [newPatientNotes, setNewPatientNotes] = useState('')
  const [selectedVisitType, setSelectedVisitType] = useState<string>('')
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [expandedFinanceDay, setExpandedFinanceDay] = useState<string | null>(null)
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  // Transaction form
  const [txnFormType, setTxnFormType] = useState<'income' | 'expense'>('income')
  const [txnFormCategory, setTxnFormCategory] = useState('كشف')
  const [txnFormAmount, setTxnFormAmount] = useState('')
  const [txnFormDescription, setTxnFormDescription] = useState('')
  const [txnFormDate, setTxnFormDate] = useState('')
  // Service form
  const [serviceFormName, setServiceFormName] = useState('')
  const [serviceFormCategory, setServiceFormCategory] = useState('عام')
  const [serviceFormPrice, setServiceFormPrice] = useState('')
  const [serviceFormDuration, setServiceFormDuration] = useState('')
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
  const patientImportInputRef = useRef<HTMLInputElement>(null)
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false)
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null)

  // Full restore from backup file — uses dedicated import endpoint
  const restoreFromBackup = async (backupData: any) => {
    try {
      // apiFetch already parses JSON and throws on non-ok responses
      const result: any = await apiFetch('/backups/import', {
        method: 'POST',
        body: JSON.stringify(backupData),
      })
      await loadAllData()
      setRestoreConfirmOpen(false)
      setPendingRestoreData(null)
      toast.success(`تمت الاستعادة بنجاح - ${result.totalRestored || ''} عنصر`)
    } catch (e: any) {
      toast.error('خطأ في الاستعادة: ' + (e.message || ''))
    }
  }

  // Service price editing & quick notes
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editingServicePrice, setEditingServicePrice] = useState('')
  const [editingServiceName, setEditingServiceName] = useState('')
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
  const [profileVisitDate, setProfileVisitDate] = useState('')
  const [profileSessionDate, setProfileSessionDate] = useState('')

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

  // Laser Record Detail View
  const [selectedLaserRecordId, setSelectedLaserRecordId] = useState<string | null>(null)
  const [showAddLaserSessionForm, setShowAddLaserSessionForm] = useState(false)
  const [editingLaserSessionId, setEditingLaserSessionId] = useState<string | null>(null)
  const [editLaserSessionForm, setEditLaserSessionForm] = useState({ energy: '', pulse: '', painLevel: '', reaction: '', notes: '', date: '', price: '', paid: false })
  const [newLaserSessionForm, setNewLaserSessionForm] = useState({ energy: '', pulse: '', painLevel: '', reaction: '', notes: '', date: '', price: '', paid: false })
  const [laserDetailTab, setLaserDetailTab] = useState<'overview' | 'sessions' | 'payments' | 'notes'>('overview')
  const [editingLaserRecordId, setEditingLaserRecordId] = useState<string | null>(null)
  const [editLaserRecordForm, setEditLaserRecordForm] = useState({ bodyArea: '', skinType: '', hairColor: '', hairDensity: '', totalSessions: '', price: '', totalPrice: '', paid: false, machineName: '', energy: '', pulse: '', status: '', notes: '' })

  // Role & Password system (userRole is now persisted in auth store, sectionPasswords in clinic store)
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
  const [deleteLaserRecordConfirmId, setDeleteLaserRecordConfirmId] = useState<string | null>(null)
  const [deleteLaserSessionConfirmId, setDeleteLaserSessionConfirmId] = useState<string | null>(null)

  // Personal Section States
  const [personalSubTab, setPersonalSubTab] = useState<'finance' | 'reminders' | 'notes' | 'reports'>('finance')
  const [personalReportPeriod, setPersonalReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [personalTransactions, setPersonalTransactions] = useState<Transaction[]>([])
  const [personalReminders, setPersonalReminders] = useState<Reminder[]>([])
  const [personalNotes, setPersonalNotes] = useState<Note[]>([])
  const [personalSearchQuery, setPersonalSearchQuery] = useState('')
  const [showAddPersonalTxn, setShowAddPersonalTxn] = useState(false)
  const [personalTxnForm, setPersonalTxnForm] = useState({ type: 'income' as 'income'|'expense', category: '', amount: '', description: '', date: '' })
  const [editingPersonalTxnId, setEditingPersonalTxnId] = useState<string | null>(null)
  const [showAddPersonalReminder, setShowAddPersonalReminder] = useState(false)
  const [personalReminderForm, setPersonalReminderForm] = useState({ title: '', description: '', date: '', type: 'شخصي' })
  const [editingPersonalReminderId, setEditingPersonalReminderId] = useState<string | null>(null)
  const [showAddPersonalNote, setShowAddPersonalNote] = useState(false)
  const [personalNoteForm, setPersonalNoteForm] = useState({ content: '', important: false })
  const [editingPersonalNoteId, setEditingPersonalNoteId] = useState<string | null>(null)
  const [editingPersonalNoteContent, setEditingPersonalNoteContent] = useState('')
  const [personalTxnFilter, setPersonalTxnFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [personalTxnCategoryFilter, setPersonalTxnCategoryFilter] = useState('all')
  const [personalDateFrom, setPersonalDateFrom] = useState('')
  const [personalDateTo, setPersonalDateTo] = useState('')
  const [reportPeriod, setReportPeriod] = useState<'all' | 'weekly' | 'monthly'>('all')
  const [celebratingPersonalId, setCelebratingPersonalId] = useState<string | null>(null)

  // Follow-up System States
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([])
  const [followUpSearch, setFollowUpSearch] = useState('')
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'active' | 'paused' | 'completed' | 'discharged'>('all')
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null)
  const [followUpDetailTab, setFollowUpDetailTab] = useState<'overview' | 'visits' | 'subscription'>('overview')
  const [showAddFollowUp, setShowAddFollowUp] = useState(false)
  const [fuFormPatientSearch, setFuFormPatientSearch] = useState('')
  const [fuFormPatientId, setFuFormPatientId] = useState('')
  const [fuFormCondition, setFuFormCondition] = useState('')
  const [fuFormCategory, setFuFormCategory] = useState('جلدية')
  const [fuFormSeverity, setFuFormSeverity] = useState('moderate')
  const [fuFormFrequency, setFuFormFrequency] = useState('monthly')
  const [fuFormCustomDays, setFuFormCustomDays] = useState('')
  const [fuFormNextVisit, setFuFormNextVisit] = useState('')
  const [fuFormDiagnosis, setFuFormDiagnosis] = useState('')
  const [fuFormTreatmentPlan, setFuFormTreatmentPlan] = useState('')
  const [fuFormMedications, setFuFormMedications] = useState('')
  const [fuFormNotes, setFuFormNotes] = useState('')
  const [fuFormHasSubscription, setFuFormHasSubscription] = useState(false)
  const [fuFormSubType, setFuFormSubType] = useState('monthly')
  const [fuFormSubPrice, setFuFormSubPrice] = useState('')
  const [fuFormSubStart, setFuFormSubStart] = useState('')
  const [fuFormSubEnd, setFuFormSubEnd] = useState('')
  const [fuFormSubSessions, setFuFormSubSessions] = useState('')
  const [showAddFollowUpVisit, setShowAddFollowUpVisit] = useState(false)
  const [fuVisitForm, setFuVisitForm] = useState({ findings: '', vitals: '', diagnosis: '', treatmentNotes: '', medications: '', instructions: '', paid: false, price: '', nextVisitDate: '', notes: '', type: 'followup', date: '' })
  const [deleteFollowUpConfirmId, setDeleteFollowUpConfirmId] = useState<string | null>(null)
  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(null)

  // Patient registration date override
  const [newPatientDate, setNewPatientDate] = useState('')

  // Patient Copy Search
  const [patientCopySearch, setPatientCopySearch] = useState('')
  const [showImprovementSlider, setShowImprovementSlider] = useState(false)
  const [improvementSliderValue, setImprovementSliderValue] = useState(5)
  const [improvementNote, setImprovementNote] = useState('')
  const [celebratingImprovement, setCelebratingImprovement] = useState(false)

  // Patient Import
  const [showPatientImport, setShowPatientImport] = useState(false)
  const [patientImportData, setPatientImportData] = useState<any[]>([])
  const [patientImportPreview, setPatientImportPreview] = useState(false)
  const [patientImportFile, setPatientImportFile] = useState<File | null>(null)
  const [patientImportLoading, setPatientImportLoading] = useState(false)
  const [patientImportProgress, setPatientImportProgress] = useState('')
  const [patientImportDragOver, setPatientImportDragOver] = useState(false)

  // ─── Password is verified server-side via /auth/login API ─────────────
  // No password stored on client - all verification is server-side

  // ─── Effects ──────────────────────────────────────────────────────────
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode) }, [darkMode])
  useEffect(() => { if (!seeded) { apiFetch('/seed', { method: 'POST' }).then(() => setSeeded(true)).catch(() => setSeeded(true)) } }, [seeded])
  useEffect(() => {
    if (!autoBackup) return
    // Run first backup immediately on enable
    const runBackup = async () => {
      try {
        await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'auto' }) })
        setLastBackup(cairoISO())
        toast.success('تم النسخ الاحتياطي التلقائي ✓')
      } catch (e) {
        console.error('Auto backup failed:', e)
      }
    }
    runBackup()
    const interval = setInterval(runBackup, backupInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoBackup, backupInterval, setLastBackup])

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        apiFetch('/patients?limit=50000'), apiFetch('/visits?limit=100000'), apiFetch('/sessions?limit=100000'),
        apiFetch('/services?limit=1000'), apiFetch('/notes?limit=50000'), apiFetch('/alerts?limit=5000'),
        apiFetch('/reminders?limit=5000'), apiFetch('/laser/records?limit=50000'), apiFetch('/laser/packages?limit=500'),
        apiFetch('/laser/settings?limit=500'), apiFetch('/finance/transactions?limit=100000'), apiFetch('/appointments?limit=10000'),
        apiFetch('/waiting?limit=1000'), apiFetch('/inventory/items?limit=5000'), apiFetch('/medications?limit=5000'),
        apiFetch('/prescriptions?limit=10000'), apiFetch('/backups?limit=100'), apiFetch('/notifications?limit=5000'),
        apiFetch('/doctors?limit=500'),
        apiFetch('/follow-up/records?limit=50000'),
      ])
      const u = (r: PromiseSettledResult<any>) => { if (r.status !== 'fulfilled') return []; const v = r.value; return v?.data || v?.patients || v?.visits || v?.sessions || v?.services || v?.notes || v?.alerts || v?.reminders || v?.records || v?.packages || v?.settings || v?.transactions || v?.appointments || v?.queue || v?.items || v?.medications || v?.prescriptions || v?.backups || v?.notifications || v?.doctors || (Array.isArray(v) ? v : []) }
      setPatients(u(results[0])); setVisits(u(results[1])); setSessions(u(results[2])); setServices(u(results[3])); setNotes(u(results[4])); setAlerts(u(results[5])); setReminders(u(results[6])); setLaserRecords(u(results[7])); setLaserPackages(u(results[8])); setLaserSettings(u(results[9])); setTransactions(u(results[10])); setAppointments(u(results[11])); setWaitingQueue(u(results[12])); setInventoryItems(u(results[13])); setMedications(u(results[14])); setPrescriptions(u(results[15])); setBackups(u(results[16])); setNotifications(u(results[17])); setDoctors(u(results[18]))
      setFollowUpRecords(u(results[19]))
      // Derive personal data from main datasets (no duplicate API calls)
      const allTxns = u(results[10]); setPersonalTransactions(allTxns.filter((t: any) => t.category === 'personal'))
      const allNotes = u(results[4]); setPersonalNotes(allNotes.filter((n: any) => n.section === 'personal'))
      const allReminders = u(results[6]); setPersonalReminders(allReminders.filter((r: any) => r.type === 'شخصي' || r.type === 'personal'))
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

  // ─── Personal Section Computed ──────────────────────────────────
  const PERSONAL_INCOME_CATS = ['راتب', 'استثمار', 'مكافأة', 'هدية', 'أخرى']
  const PERSONAL_EXPENSE_CATS = ['طعام', 'مواصلات', 'سكن', 'ترفيه', 'صحة', 'تعليم', 'ملابس', 'فواتير', 'أخرى']
  const PERSONAL_REMINDER_TYPES = ['شخصي', 'عمل', 'عائلي', 'صحي', 'مالي', 'مهم', 'أخرى']

  const personalTotalIncomeAll = useMemo(() => personalTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0), [personalTransactions])
  const personalTotalExpenseAll = useMemo(() => personalTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0), [personalTransactions])

  const filteredPersonalTxns = useMemo(() => {
    return personalTransactions.filter(t => {
      if (personalTxnFilter !== 'all' && t.type !== personalTxnFilter) return false
      if (personalTxnCategoryFilter !== 'all' && t.category !== personalTxnCategoryFilter) return false
      if (personalDateFrom) {
        const tDate = getLocalDateStr(t.date)
        if (tDate < personalDateFrom) return false
      }
      if (personalDateTo) {
        const tDate = getLocalDateStr(t.date)
        if (tDate > personalDateTo) return false
      }
      return true
    })
  }, [personalTransactions, personalTxnFilter, personalTxnCategoryFilter, personalDateFrom, personalDateTo])

  const personalTotalIncome = useMemo(() => filteredPersonalTxns.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0), [filteredPersonalTxns])
  const personalTotalExpense = useMemo(() => filteredPersonalTxns.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0), [filteredPersonalTxns])
  const personalNetBalance = personalTotalIncome - personalTotalExpense

  const personalMonthlyChart = useMemo(() => {
    const months: Record<string, { month: string; income: number; expense: number }> = {}
    personalTransactions.forEach(t => {
      const parts = getCairoDateParts(t.date)
      const key = `${parts.year}-${String(parts.month).padStart(2, '0')}`
      const label = `${parts.month}/${parts.year}`
      if (!months[key]) months[key] = { month: label, income: 0, expense: 0 }
      if (t.type === 'income') months[key].income += t.amount || 0
      else months[key].expense += t.amount || 0
    })
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  }, [personalTransactions])

  const personalSearchResults = useMemo(() => {
    if (!personalSearchQuery.trim()) return []
    const q = personalSearchQuery.toLowerCase()
    const results: { type: string; id: string; label: string; sub: string; icon: React.ReactNode; action?: () => void }[] = []
    // Search personal transactions
    personalTransactions.filter(t => (t.description || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q)).forEach(t => {
      results.push({ type: 'transaction', id: t.id, label: t.description || t.category, sub: `${formatCurrency(t.amount)} • ${t.type === 'income' ? 'إيراد' : 'مصروف'}`, icon: t.type === 'income' ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" /> })
    })
    // Search personal reminders
    personalReminders.filter(r => (r.title || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)).forEach(r => {
      results.push({ type: 'reminder', id: r.id, label: r.title, sub: `${r.type} • ${formatDate(r.date)}`, icon: <Bell size={14} className="text-amber-500" /> })
    })
    // Search personal notes
    personalNotes.filter(n => (n.content || '').toLowerCase().includes(q)).forEach(n => {
      results.push({ type: 'note', id: n.id, label: n.content.slice(0, 50), sub: n.important ? 'مهم' : 'عادي', icon: <StickyNote size={14} className="text-sky-500" /> })
    })
    // Search patient names
    patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5).forEach(p => {
      results.push({ type: 'patient', id: p.id, label: p.name, sub: `${p.fileNumber} • ${p.phone || ''}`, icon: <Users size={14} className="text-blue-500" /> })
    })
    return results
  }, [personalSearchQuery, personalTransactions, personalReminders, personalNotes, patients])

  // Personal reports computed values
  const personalReportData = useMemo(() => {
    const _cairoNow = getCairoDateParts()
    const _todayStr = _cairoNow.dateStr

    const filterByPeriod = (period: 'daily' | 'weekly' | 'monthly') => {
      return personalTransactions.filter(t => {
        const tCairo = getCairoDateParts(t.date)
        const tDateStr = tCairo.dateStr
        if (period === 'daily') return tDateStr === _todayStr
        if (period === 'weekly') {
          const todayDate = new Date(_todayStr + 'T12:00:00Z')
          const tDate = new Date(tDateStr + 'T12:00:00Z')
          const diffDays = (todayDate.getTime() - tDate.getTime()) / (24 * 60 * 60 * 1000)
          return diffDays >= 0 && diffDays < 7
        }
        // monthly
        return tCairo.year === _cairoNow.year && tCairo.month === _cairoNow.month
      })
    }

    const filtered = filterByPeriod(personalReportPeriod)
    const income = filtered.filter(t => t.type === 'income')
    const expense = filtered.filter(t => t.type === 'expense')
    const totalIncome = income.reduce((s, t) => s + (t.amount || 0), 0)
    const totalExpense = expense.reduce((s, t) => s + (t.amount || 0), 0)

    // Category breakdown
    const incomeByCategory: Record<string, number> = {}
    income.forEach(t => { incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + (t.amount || 0) })
    const expenseByCategory: Record<string, number> = {}
    expense.forEach(t => { expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + (t.amount || 0) })

    // Reminders stats
    const periodReminders = personalReminders.filter(r => {
      const rCairo = getCairoDateParts(r.date)
      if (personalReportPeriod === 'daily') return rCairo.dateStr === _todayStr
      if (personalReportPeriod === 'weekly') {
        const todayDate = new Date(_todayStr + 'T12:00:00Z')
        const rDate = new Date(rCairo.dateStr + 'T12:00:00Z')
        const diffDays = (todayDate.getTime() - rDate.getTime()) / (24 * 60 * 60 * 1000)
        return diffDays >= 0 && diffDays < 7
      }
      return rCairo.year === _cairoNow.year && rCairo.month === _cairoNow.month
    })
    const doneReminders = periodReminders.filter(r => r.status === 'done').length
    const pendingReminders = periodReminders.filter(r => r.status !== 'done').length

    // Notes stats
    const periodNotes = personalNotes.filter(n => {
      const nCairo = getCairoDateParts(n.createdAt)
      if (personalReportPeriod === 'daily') return nCairo.dateStr === _todayStr
      if (personalReportPeriod === 'weekly') {
        const todayDate = new Date(_todayStr + 'T12:00:00Z')
        const nDate = new Date(nCairo.dateStr + 'T12:00:00Z')
        const diffDays = (todayDate.getTime() - nDate.getTime()) / (24 * 60 * 60 * 1000)
        return diffDays >= 0 && diffDays < 7
      }
      return nCairo.year === _cairoNow.year && nCairo.month === _cairoNow.month
    })
    const importantNotes = periodNotes.filter(n => n.important).length

    // Chart data for daily breakdown (Cairo timezone - Egyptian week: Saturday→Friday)
    let chartData: { label: string; income: number; expense: number }[] = []
    if (personalReportPeriod === 'daily') {
      // Current Egyptian week (Saturday–Friday)
      const weekDays = getEgyptianWeekDays()
      chartData = weekDays.map(wd => {
        const dayIncome = income.filter(t => getLocalDateStr(t.date) === wd.dateStr).reduce((s, t) => s + (t.amount || 0), 0)
        const dayExpense = expense.filter(t => getLocalDateStr(t.date) === wd.dateStr).reduce((s, t) => s + (t.amount || 0), 0)
        return { label: wd.dayName, income: dayIncome, expense: dayExpense }
      })
    } else if (personalReportPeriod === 'weekly') {
      // Last 4 weeks (Saturday–Friday Egyptian weeks)
      for (let i = 3; i >= 0; i--) {
        const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
        const dayOfWeek = nowCairo.getDay()
        const daysSinceSaturday = (dayOfWeek + 1) % 7
        // End of the target week (Friday + end offset)
        const weekEndDate = new Date(nowCairo)
        weekEndDate.setDate(nowCairo.getDate() - (i * 7) + (6 - daysSinceSaturday))
        const weekStartDate = new Date(weekEndDate)
        weekStartDate.setDate(weekEndDate.getDate() - 6) // 7 days including start
        const weekDays = new Set<string>()
        for (let d = 0; d < 7; d++) {
          const day = new Date(weekStartDate)
          day.setDate(weekStartDate.getDate() + d)
          weekDays.add(day.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }))
        }
        const weekIncome = income.filter(t => weekDays.has(getLocalDateStr(t.date))).reduce((s, t) => s + (t.amount || 0), 0)
        const weekExpense = expense.filter(t => weekDays.has(getLocalDateStr(t.date))).reduce((s, t) => s + (t.amount || 0), 0)
        chartData.push({ label: `أسبوع ${4 - i}`, income: weekIncome, expense: weekExpense })
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const m = _cairoNow.month - i
        const year = _cairoNow.year + Math.floor((m - 1) / 12)
        const month = ((m - 1) % 12 + 12) % 12 + 1
        const monthIncome = income.filter(t => { const td = getCairoDateParts(t.date); return td.year === year && td.month === month }).reduce((s, t) => s + (t.amount || 0), 0)
        const monthExpense = expense.filter(t => { const td = getCairoDateParts(t.date); return td.year === year && td.month === month }).reduce((s, t) => s + (t.amount || 0), 0)
        const d = new Date(year, month - 1, 1)
        chartData.push({ label: d.toLocaleDateString('ar-EG', { month: 'short' }), income: monthIncome, expense: monthExpense })
      }
    }

    // Pie chart data for expense categories
    const expensePieData = Object.entries(expenseByCategory).map(([cat, amount]) => ({ name: cat, value: amount })).sort((a, b) => b.value - a.value)
    const incomePieData = Object.entries(incomeByCategory).map(([cat, amount]) => ({ name: cat, value: amount })).sort((a, b) => b.value - a.value)

    // Top expenses
    const topExpenses = [...expense].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 5)

    return {
      totalIncome, totalExpense, netBalance: totalIncome - totalExpense,
      incomeByCategory, expenseByCategory, expensePieData, incomePieData,
      chartData, topExpenses,
      transactionCount: filtered.length, incomeCount: income.length, expenseCount: expense.length,
      doneReminders, pendingReminders, periodReminders: periodReminders.length,
      periodNotes: periodNotes.length, importantNotes,
    }
  }, [personalTransactions, personalReminders, personalNotes, personalReportPeriod])

  // Personal CRUD handlers
  const addPersonalTransaction = async () => {
    if (!personalTxnForm.amount || !personalTxnForm.category) return toast.error('المبلغ والفئة مطلوبان')
    const amount = parseFloat(personalTxnForm.amount)
    if (isNaN(amount) || amount <= 0) return toast.error('أدخل مبلغ صحيح')
    try {
      const res = await apiFetch<any>('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: personalTxnForm.type, category: 'personal', amount, description: personalTxnForm.description || personalTxnForm.category, date: personalTxnForm.date || cairoISO() }) })
      const item = res?.data || res?.transaction || res
      if (item?.id) {
        setPersonalTransactions(prev => [item, ...prev])
        toast.success('تم إضافة المعاملة')
      }
      setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' })
      setShowAddPersonalTxn(false)
      setEditingPersonalTxnId(null)
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const editPersonalTransaction = async () => {
    if (!editingPersonalTxnId || !personalTxnForm.amount) return
    const amount = parseFloat(personalTxnForm.amount)
    if (isNaN(amount) || amount <= 0) return toast.error('أدخل مبلغ صحيح')
    try {
      await apiFetch(`/finance/transactions/${editingPersonalTxnId}`, { method: 'PUT', body: JSON.stringify({ type: personalTxnForm.type, amount, description: personalTxnForm.description || personalTxnForm.category, date: personalTxnForm.date || undefined }) })
      setPersonalTransactions(prev => prev.map(t => t.id === editingPersonalTxnId ? { ...t, type: personalTxnForm.type, amount, description: personalTxnForm.description || personalTxnForm.category, date: personalTxnForm.date || t.date } : t))
      toast.success('تم تعديل المعاملة')
      setEditingPersonalTxnId(null)
      setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' })
      setShowAddPersonalTxn(false)
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const deletePersonalTransaction = async (id: string) => {
    try {
      await apiFetch(`/finance/transactions/${id}`, { method: 'DELETE' })
      setPersonalTransactions(prev => prev.filter(t => t.id !== id))
      toast.success('تم حذف المعاملة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const startEditPersonalTxn = (txn: Transaction) => {
    setEditingPersonalTxnId(txn.id)
    setPersonalTxnForm({ type: txn.type as 'income' | 'expense', category: txn.category, amount: String(txn.amount), description: txn.description || '', date: txn.date?.split('T')[0] || '' })
    setShowAddPersonalTxn(true)
  }

  const addPersonalReminder = async () => {
    if (!personalReminderForm.title) return toast.error('العنوان مطلوب')
    try {
      const res = await apiFetch<any>('/reminders', { method: 'POST', body: JSON.stringify({ title: personalReminderForm.title, description: personalReminderForm.description || undefined, date: personalReminderForm.date || cairoISO(), type: 'personal', status: 'pending' }) })
      const item = res?.data || res?.reminder || res
      if (item?.id) {
        setPersonalReminders(prev => [item, ...prev])
        toast.success('تم إضافة التذكير')
      }
      setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' })
      setShowAddPersonalReminder(false)
      setEditingPersonalReminderId(null)
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const editPersonalReminder = async () => {
    if (!editingPersonalReminderId || !personalReminderForm.title) return
    try {
      await apiFetch(`/reminders/${editingPersonalReminderId}`, { method: 'PUT', body: JSON.stringify({ title: personalReminderForm.title, description: personalReminderForm.description || undefined, date: personalReminderForm.date || undefined }) })
      setPersonalReminders(prev => prev.map(r => r.id === editingPersonalReminderId ? { ...r, title: personalReminderForm.title, description: personalReminderForm.description || r.description, date: personalReminderForm.date || r.date } : r))
      toast.success('تم تعديل التذكير')
      setEditingPersonalReminderId(null)
      setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' })
      setShowAddPersonalReminder(false)
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const deletePersonalReminder = async (id: string) => {
    try {
      await apiFetch(`/reminders/${id}`, { method: 'DELETE' })
      setPersonalReminders(prev => prev.filter(r => r.id !== id))
      toast.success('تم حذف التذكير')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const togglePersonalReminderDone = async (reminder: Reminder) => {
    try {
      const newStatus = reminder.status === 'done' ? 'pending' : 'done'
      await apiFetch(`/reminders/${reminder.id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
      setPersonalReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, status: newStatus } : r))
      if (newStatus === 'done') { setCelebratingPersonalId(reminder.id); setTimeout(() => setCelebratingPersonalId(null), 1500) }
      toast.success(newStatus === 'done' ? 'تم إنجاز التذكير 🎉' : 'تم إلغاء الإنجاز')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const startEditPersonalReminder = (r: Reminder) => {
    setEditingPersonalReminderId(r.id)
    setPersonalReminderForm({ title: r.title, description: r.description || '', date: r.date?.split('T')[0] || '', type: 'شخصي' })
    setShowAddPersonalReminder(true)
  }

  const addPersonalNote = async () => {
    if (!personalNoteForm.content) return toast.error('المحتوى مطلوب')
    try {
      const res = await apiFetch<any>('/notes', { method: 'POST', body: JSON.stringify({ content: personalNoteForm.content, important: personalNoteForm.important, section: 'personal' }) })
      const item = res?.data || res?.note || res
      if (item?.id) {
        setPersonalNotes(prev => [item, ...prev])
        toast.success('تم إضافة الملاحظة')
      }
      setPersonalNoteForm({ content: '', important: false })
      setShowAddPersonalNote(false)
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const editPersonalNote = async (id: string, content: string, important: boolean) => {
    try {
      await apiFetch(`/notes/${id}`, { method: 'PUT', body: JSON.stringify({ content, important }) })
      setPersonalNotes(prev => prev.map(n => n.id === id ? { ...n, content, important } : n))
      toast.success('تم تعديل الملاحظة')
      setEditingPersonalNoteId(null)
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const deletePersonalNote = async (id: string) => {
    try {
      await apiFetch(`/notes/${id}`, { method: 'DELETE' })
      setPersonalNotes(prev => prev.filter(n => n.id !== id))
      toast.success('تم حذف الملاحظة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  const togglePersonalNoteImportance = async (note: Note) => {
    try {
      await apiFetch(`/notes/${note.id}`, { method: 'PUT', body: JSON.stringify({ important: !note.important }) })
      setPersonalNotes(prev => prev.map(n => n.id === note.id ? { ...n, important: !n.important } : n))
      toast.success(note.important ? 'تم إلغاء الأهمية' : 'تم وضع علامة مهم ⭐')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginRole) { toast.error('اختر الدور أولاً'); return }
    if (!loginPassword) { toast.error('أدخل كلمة المرور'); return }
    setLoginLoading(true)
    try {
      const res = await apiFetch<{user: any}>('/auth/login', { method: 'POST', body: JSON.stringify({ role: loginRole, password: loginPassword }) })
      login(res.user, loginRole)
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

  // Mark session as paid + create finance transaction (fixes: "pay" button was not recording revenue)
  const markSessionPaid = async (s: Session) => {
    try {
      await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) })
      // Create corresponding finance transaction
      const patientName = patients.find(p => p.id === s.patientId)?.name || 'مريض'
      const svc = services.find(sv => sv.id === s.serviceId)
      const category = s.notes?.includes('ليزر') ? 'ليزر' : 'جلسات'
      const description = `${svc?.name || (category === 'ليزر' ? 'جلسة ليزر' : 'جلسة')} - ${patientName}`
      const txnDate = s.date || cairoISO()
      try {
        const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category, amount: s.price, description, date: txnDate }) })
        const newTxn = txnRes?.transaction || txnRes?.data || txnRes
        if (newTxn?.id) {
          setTransactions(prev => [newTxn, ...prev])
        } else {
          setTransactions(prev => [...prev, { id: 'sp-' + Date.now(), type: 'income', category, amount: s.price, description, date: txnDate }])
        }
      } catch { setTransactions(prev => [...prev, { id: 'sp-' + Date.now(), type: 'income', category, amount: s.price, description, date: txnDate }]) }
      setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss))
      toast.success('تم الدفع ✅')
    } catch { toast.error('خطأ') }
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
      const visitCategory = getVisitCategory(visit.type)
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
      const oldCategory = getVisitCategory(visit.type)
      const newCategory = getVisitCategory(newType)
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
  // Live Cairo time state - single source of truth for ALL date/time in the app
  // Updates every second; drives the clock display AND all date computations
  const [cairoTimeTick, setCairoTimeTick] = useState(0)
  useEffect(() => { const timer = setInterval(() => setCairoTimeTick(t => t + 1), 1000); return () => clearInterval(timer) }, [])
  // Derived display values from the tick
  const cairoClock = useMemo(() => new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Cairo', hour12: true }), [cairoTimeTick])
  const cairoDateDisplay = useMemo(() => new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' }), [cairoTimeTick])
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), [cairoTimeTick, transactions.length, visits.length, sessions.length]) // Cairo timezone - re-computed every second + when data changes
  // Memoized Cairo date parts for "now" — derived from the live tick
  const cairoNow = useMemo(() => getCairoDateParts(), [cairoTimeTick, todayStr, patients.length, visits.length, sessions.length]) // recomputes every second
  const todayStats = useMemo(() => {
    let todayIncome = 0, todayExpense = 0
    for (const t of transactions) {
      if (t.category === 'personal') continue
      if (getLocalDateStr(t.date) === todayStr) {
        if (t.type === 'income') todayIncome += t.amount
        else todayExpense += t.amount
      }
    }
    return { todayIncome, todayExpense, todayNetProfit: todayIncome - todayExpense }
  }, [transactions, todayStr])
  const todayIncome = todayStats.todayIncome
  const todayExpense = todayStats.todayExpense
  const todayNetProfit = todayStats.todayNetProfit
  const todayVisits = useMemo(() => visits.filter(v => getLocalDateStr(v.date) === todayStr), [visits, todayStr])

  // Daily finance data - grouped by real date (Cairo timezone)
  const dailyFinanceData = useMemo(() => {
    const dayMap: Record<string, { date: string; income: number; expense: number; net: number; transactions: Transaction[] }> = {}
    transactions.filter(t => t.category !== 'personal').forEach(t => {
      const key = getLocalDateStr(t.date)
      if (!dayMap[key]) dayMap[key] = { date: key, income: 0, expense: 0, net: 0, transactions: [] }
      if (t.type === 'income') dayMap[key].income += t.amount || 0
      else dayMap[key].expense += t.amount || 0
      dayMap[key].net = dayMap[key].income - dayMap[key].expense
      dayMap[key].transactions.push(t)
    })
    return Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions])
  const todayAppointments = useMemo(() => appointments.filter(a => getLocalDateStr(a.date) === todayStr), [appointments, todayStr])
  const activeAlerts = useMemo(() => alerts.filter(a => a.active), [alerts])

  // Daily visit/session stats for reports (Cairo timezone)
  const dailyVisitStats = useMemo(() => {
    const dayMap: Record<string, { date: string; checkupCount: number; revisitCount: number; sessionCount: number; checkupRevenue: number; revisitRevenue: number; sessionRevenue: number }> = {}
    // Process visits (counts only, NOT revenue - revenue comes from transactions)
    visits.forEach(v => {
      const key = getLocalDateStr(v.date)
      if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }
      if (v.type === 'checkup' || v.type === 'checkup_session') dayMap[key].checkupCount++
      else if (v.type === 'revisit' || v.type === 'revisit_session') dayMap[key].revisitCount++
    })
    // Count completed sessions (counts only, NOT revenue - to avoid double-counting with transactions)
    sessions.filter(s => s.status === 'completed').forEach(s => {
      const key = getLocalDateStr(s.date)
      if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }
      dayMap[key].sessionCount++
    })
    // Process ALL revenue from transactions ONLY (single source of truth - matches Finance section)
    transactions.filter(t => t.category !== 'personal').forEach(t => {
      const key = getLocalDateStr(t.date)
      if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }
      if (t.type === 'income' && t.category === 'كشف') dayMap[key].checkupRevenue += t.amount || 0
      else if (t.type === 'income' && t.category === 'إعادة') dayMap[key].revisitRevenue += t.amount || 0
      else if (t.type === 'income' && (t.category === 'جلسات' || t.category === 'ليزر' || t.category === 'متابعة')) dayMap[key].sessionRevenue += t.amount || 0
    })
    return Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date))
  }, [visits, sessions, transactions])
  const lowStockItems = useMemo(() => inventoryItems.filter(i => i.quantity <= i.minQuantity), [inventoryItems])
  const patientGenderCounts = useMemo(() => ({ male: patients.filter(p => p.gender === 'male').length, female: patients.filter(p => p.gender === 'female').length }), [patients])
  const maleCount = patientGenderCounts.male
  const femaleCount = patientGenderCounts.female
  const revenueChartData = useMemo(() => {
    // Pre-compute transaction date map for O(1) lookup
    const txByDate: Record<string, { income: number; expense: number }> = {}
    for (const t of transactions) {
      if (t.category === 'personal') continue
      const ds = getLocalDateStr(t.date)
      if (!txByDate[ds]) txByDate[ds] = { income: 0, expense: 0 }
      if (t.type === 'income') txByDate[ds].income += t.amount
      else txByDate[ds].expense += t.amount
    }
    // Use Egyptian week days (Saturday→Friday) for consistent week display
    const weekDays = getEgyptianWeekDays()
    const days: { name: string; إيراد: number; مصروف: number }[] = weekDays.map(wd => {
      const dayData = txByDate[wd.dateStr] || { income: 0, expense: 0 }
      return { name: wd.dayName, إيراد: dayData.income, مصروف: dayData.expense }
    })
    return days
  }, [transactions])
  const genderData = [{ name: 'ذكور', value: maleCount || 1 }, { name: 'إناث', value: femaleCount || 1 }]
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250)
  const filteredPatients = useMemo(() => {
    let list = patients
    if (debouncedSearchQuery) {
      const results = patients.map(p => {
        // Get all related visit diagnoses and notes
        const patientVisits = visits.filter(v => v.patientId === p.id)
        const visitDiagnoses = patientVisits.map(v => v.diagnosis).filter(Boolean).join(' ')
        const visitNotes = patientVisits.map(v => v.notes).filter(Boolean).join(' ')
        // Get all related session notes
        const patientSessions = sessions.filter(s => s.patientId === p.id)
        const sessionNotes = patientSessions.map(s => s.notes).filter(Boolean).join(' ')

        // Determine which fields to search based on searchField filter
        let fields: (string | undefined)[]
        switch(searchField) {
          case 'name': fields = [p.name]; break
          case 'address': fields = [p.address]; break
          case 'diagnosis': fields = [visitDiagnoses, p.medicalHistory]; break
          case 'phone': fields = [p.phone, p.phone2]; break
          case 'notes': fields = [p.notes, visitNotes, sessionNotes]; break
          default: fields = [p.name, p.phone, p.phone2, p.fileNumber, p.notes, p.address, p.allergies, p.medicalHistory, p.bloodType, p.gender, visitDiagnoses, visitNotes, sessionNotes]
        }

        const { match, score } = smartSearch(debouncedSearchQuery, fields)
        return { patient: p, match, score }
      }).filter(r => r.match).sort((a, b) => b.score - a.score).map(r => r.patient)
      list = results
    }
    if (patientFilter === 'starred') list = list.filter(p => p.starred)
    if (patientFilter === 'improved') list = list.filter(p => p.improved)
    return list
  }, [patients, visits, sessions, debouncedSearchQuery, patientFilter, searchField])
  useEffect(() => { setPatientDisplayCount(50) }, [debouncedSearchQuery])

  // ─── Financial Computed Values ──────────────────────────────
  // All clinic financials EXCLUDE personal transactions (category !== 'personal')
  const clinicTransactions = useMemo(() => transactions.filter(t => t.category !== 'personal'), [transactions])
  const clinicFinancials = useMemo(() => {
    let totalIncome = 0, totalExpense = 0, checkupRev = 0, revisitRev = 0, laserRev = 0, followUpRev = 0, sessionRev = 0, monthIncome = 0
    for (const t of clinicTransactions) {
      if (t.type === 'income') {
        totalIncome += t.amount
        if (t.category === 'كشف') checkupRev += t.amount
        else if (t.category === 'إعادة') revisitRev += t.amount
        else if (t.category === 'ليزر') laserRev += t.amount
        else if (t.category === 'متابعة') followUpRev += t.amount
        else if (t.category === 'جلسات') sessionRev += t.amount
        const td = getCairoDateParts(t.date)
        if (td.year === cairoNow.year && td.month === cairoNow.month) monthIncome += t.amount
      } else {
        totalExpense += t.amount
      }
    }
    return { totalIncome, totalExpense, checkupRevenue: checkupRev, revisitRevenue: revisitRev, laserRevenue: laserRev, followUpRevenue: followUpRev, sessionRevenue: sessionRev, thisMonthIncome: monthIncome }
  }, [clinicTransactions, cairoNow])
  const totalIncome = clinicFinancials.totalIncome
  const totalExpense = clinicFinancials.totalExpense
  const netProfit = totalIncome - totalExpense
  const checkupRevenue = clinicFinancials.checkupRevenue
  const revisitRevenue = clinicFinancials.revisitRevenue
  const laserRevenue = clinicFinancials.laserRevenue
  const followUpRevenue = clinicFinancials.followUpRevenue
  const sessionRevenue = clinicFinancials.sessionRevenue
  const otherRevenue = totalIncome - checkupRevenue - revisitRevenue - sessionRevenue - laserRevenue - followUpRevenue
  const thisMonthIncome = clinicFinancials.thisMonthIncome
  const unpaidTotal = useMemo(() => sessions.filter(s => !s.paid).reduce((s, ses) => s + ses.price, 0), [sessions])
  const thisWeekIncome = revenueChartData.reduce((s, d) => s + (d.إيراد || 0), 0)
  const revenueByCategory = useMemo(() => [
    { name: 'كشف', value: checkupRevenue || 0 },
    { name: 'إعادة', value: revisitRevenue || 0 },
    { name: 'جلسات', value: sessionRevenue || 0 },
    { name: 'ليزر', value: laserRevenue || 0 },
    { name: 'متابعة', value: followUpRevenue || 0 },
    { name: 'أخرى', value: otherRevenue || 0 },
  ].filter(d => d.value > 0), [checkupRevenue, revisitRevenue, sessionRevenue, laserRevenue, followUpRevenue, otherRevenue])

  // ─── Weekly Revenue Comparison (Saturday–Friday Egyptian week) ───
  const weeklyComparison = useMemo(() => {
    // Calculate Saturday-to-Friday week boundaries in Cairo timezone
    const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
    const dayOfWeek = nowCairo.getDay() // 0=Sun, 6=Sat
    const daysSinceSaturday = (dayOfWeek + 1) % 7 // Sat=0, Sun=1, ..., Fri=6
    // This week: from Saturday to today
    const thisWeekDays = new Set<string>()
    for (let i = daysSinceSaturday; i >= 0; i--) {
      const d = new Date(nowCairo)
      d.setDate(d.getDate() - i)
      thisWeekDays.add(d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }))
    }
    // Last week: the 7 days before this Saturday
    const lastWeekDays = new Set<string>()
    for (let i = daysSinceSaturday + 1; i <= daysSinceSaturday + 7; i++) {
      const d = new Date(nowCairo)
      d.setDate(d.getDate() - i)
      lastWeekDays.add(d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }))
    }
    const thisWeekTxns = clinicTransactions.filter(t => t.type === 'income' && thisWeekDays.has(getLocalDateStr(t.date)))
    const thisWeekTotal = thisWeekTxns.reduce((s, t) => s + t.amount, 0)
    const lastWeekTxns = clinicTransactions.filter(t => t.type === 'income' && lastWeekDays.has(getLocalDateStr(t.date)))
    const lastWeekTotal = lastWeekTxns.reduce((s, t) => s + t.amount, 0)
    const changePercent = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : thisWeekTotal > 0 ? 100 : 0
    return { thisWeekTotal, lastWeekTotal, changePercent, isUp: thisWeekTotal >= lastWeekTotal }
  }, [clinicTransactions])

  // ─── Top Patients by Visits ───
  const topPatientsByVisits = useMemo(() => {
    const countMap: Record<string, { patient: Patient; visitCount: number; sessionCount: number; totalSpent: number }> = {}
    patients.forEach(p => {
      const pVisits = visits.filter(v => v.patientId === p.id).length
      const pSessions = sessions.filter(s => s.patientId === p.id).length
      const pSpent = transactions.filter(t => t.type === 'income' && t.category !== 'personal' && t.description?.includes(p.name)).reduce((s, t) => s + t.amount, 0)
      if (pVisits + pSessions > 0) countMap[p.id] = { patient: p, visitCount: pVisits, sessionCount: pSessions, totalSpent: pSpent }
    })
    return Object.values(countMap).sort((a, b) => (b.visitCount + b.sessionCount) - (a.visitCount + a.sessionCount)).slice(0, 5)
  }, [patients, visits, sessions, transactions])

  // ─── Laser Session Progress ───
  const laserProgressData = useMemo(() => {
    return laserRecords.filter(r => r.status === 'active').map(r => {
      const patient = patients.find(p => p.id === r.patientId)
      const completedSessions = (r as any)?.laserSessions?.length || (r as any)?._count?.laserSessions || 0
      const progress = r.totalSessions > 0 ? (completedSessions / r.totalSessions) * 100 : 0
      const areaLabel = BODY_AREAS.find(a => a.id === r.bodyArea)?.label || r.bodyArea
      return { record: r, patient, completedSessions, totalSessions: r.totalSessions, progress, areaLabel }
    }).sort((a, b) => b.progress - a.progress)
  }, [laserRecords, patients])

  // ─── WhatsApp Daily Summary ───
  const shareDailySummary = () => {
    const cairoNow = getCairoDateParts()
    const todayStats = dailyVisitStats.find(d => d.date === todayStr)
    const summary = `🏥 *تقرير عيادة المجازي اليومي*
📅 ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' })}

🩺 كشف: ${todayStats?.checkupCount || 0} (${formatCurrency(todayStats?.checkupRevenue || 0)})
🔄 إعادة: ${todayStats?.revisitCount || 0} (${formatCurrency(todayStats?.revisitRevenue || 0)})
⚡ جلسات: ${todayStats?.sessionCount || 0} (${formatCurrency(todayStats?.sessionRevenue || 0)})

💰 إيراد اليوم: ${formatCurrency(todayIncome)}
📉 مصروفات: ${formatCurrency(todayExpense)}
📊 صافي الربح: ${formatCurrency(todayNetProfit)}

👥 إجمالي المرضى: ${patients.length}
📅 مواعيد اليوم: ${todayAppointments.length}`
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank')
  }

  // Laser hair removal sessions - pre-computed for performance and stability
  const laserHairSessions = useMemo(() => sessions.filter(s => {
    try {
      const svc = services.find(sv => sv.id === s.serviceId)
      if (svc?.category?.includes('ليزر')) return true
      if (s.notes?.startsWith('ليزر')) return true
      return false
    } catch { return false }
  }), [sessions, services])

  // Laser financial computed values - based on transactions for accuracy (avoids double-counting)
  // laserRevenue is already defined above from clinicTransactions
  const laserRevenueByArea = useMemo(() => {
    const areaMap: Record<string, number> = {}
    laserRecords.forEach(r => {
      const area = r.bodyArea || 'غير محدد'
      const paid = (r.laserSessions || []).filter(s => s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
      areaMap[area] = (areaMap[area] || 0) + paid
    })
    return Object.entries(areaMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
  }, [laserRecords])
  const laserRevenueByPackage = useMemo(() => {
    const pkgMap: Record<string, number> = {}
    laserPackages.forEach(pkg => {
      const matchingRecords = laserRecords.filter(r => r.bodyArea === pkg.bodyArea || r.bodyArea === pkg.name)
      const paid = matchingRecords.flatMap(r => (r.laserSessions || []).filter(s => s.paid)).reduce((sum, s) => sum + (s.price || 0), 0)
      if (paid > 0) pkgMap[pkg.name] = paid
    })
    return Object.entries(pkgMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
  }, [laserRecords, laserPackages])

  // Smart search
  const smartSearchResults = useMemo(() => {
    if (!smartSearchQuery.trim()) return []
    const r: { type: string; label: string; sub: string; id: string; icon: React.ReactNode }[] = []
    patients.forEach(p => {
      const patientVisits = visits.filter(v => v.patientId === p.id)
      const visitDiagnoses = patientVisits.map(v => v.diagnosis).filter(Boolean).join(' ')
      const { match } = smartSearch(smartSearchQuery, [p.name, p.phone, p.phone2, p.fileNumber, p.notes, p.address, p.allergies, p.medicalHistory, p.bloodType, p.gender, visitDiagnoses])
      if (match) r.push({ type: 'patient', label: p.name, sub: `${p.fileNumber} | ${p.phone || ''}`, id: p.id, icon: <Users size={16} className="text-blue-500" /> })
    })
    services.forEach(s => { if (s.name.toLowerCase().includes(smartSearchQuery.toLowerCase())) r.push({ type: 'service', label: s.name, sub: formatCurrency(s.price), id: s.id, icon: <Activity size={16} className="text-orange-500" /> }) })
    return r.slice(0, 20)
  }, [smartSearchQuery, patients, services, visits])
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

  // ─── Patient Import Parser (supports JSON, CSV, TSV, XLSX) ───
  const parsePatientFile = async (file: File): Promise<any[]> => {
    const fileName = file.name.toLowerCase()
    const text = await file.text()

    // Remove BOM if present
    const cleanText = text.replace(/^\uFEFF/, '')

    // ─── JSON ───
    if (fileName.endsWith('.json')) {
      const data = JSON.parse(cleanText)
      // Support multiple JSON formats:
      // 1. { patients: [...] }
      // 2. { type: 'patients-only', patients: [...] }
      // 3. [ {...}, {...} ]  (array directly)
      // 4. { data: [...] }
      const patientList = data?.patients || data?.data || (Array.isArray(data) ? data : [])
      if (!Array.isArray(patientList) || patientList.length === 0) throw new Error('الملف لا يحتوي على بيانات مرضى')
      return patientList.map(normalizePatientFields)
    }

    // ─── XLSX ───
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const firstSheet = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheet]
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
      if (!jsonData.length) throw new Error('ملف Excel فارغ')
      return jsonData.map(normalizePatientFields)
    }

    // ─── CSV / TSV / TXT ───
    if (fileName.endsWith('.csv') || fileName.endsWith('.tsv') || fileName.endsWith('.txt')) {
      // Auto-detect delimiter: tab for TSV, comma for CSV, semicolon as fallback
      const firstLine = cleanText.split('\n')[0] || ''
      let delimiter = ','
      if (fileName.endsWith('.tsv') || firstLine.includes('\t')) delimiter = '\t'
      else if (!firstLine.includes(',') && firstLine.includes(';')) delimiter = ';'

      const lines = cleanText.split(/\r?\n/).filter(l => l.trim())
      if (lines.length < 2) throw new Error('الملف فارغ أو لا يحتوي على بيانات')

      // Parse headers
      const headers = parseCSVLine(lines[0], delimiter).map(h => h.trim().replace(/^"|"$/g, ''))

      // Parse data rows
      const patients: any[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], delimiter)
        const obj: Record<string, string> = {}
        headers.forEach((h, idx) => {
          obj[h] = (values[idx] || '').trim().replace(/^"|"$/g, '')
        })
        patients.push(normalizePatientFields(obj))
      }
      const validPatients = patients.filter(p => p.name)
      if (!validPatients.length) throw new Error('لم يتم العثور على أسماء مرضى في الملف')
      return validPatients
    }

    throw new Error('صيغة الملف غير مدعومة. استخدم JSON أو CSV أو Excel')
  }

  // Parse a single CSV line respecting quoted fields
  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"' // Escaped quote
            i++
          } else {
            inQuotes = false // End of quoted field
          }
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === delimiter) {
          result.push(current)
          current = ''
        } else {
          current += char
        }
      }
    }
    result.push(current)
    return result
  }

  // Normalize patient fields from various header names (Arabic/English)
  const normalizePatientFields = (raw: any): any => {
    const find = (...keys: string[]): any => {
      for (const k of keys) {
        if (raw[k] !== undefined && raw[k] !== null && String(raw[k]).trim() !== '') return raw[k]
      }
      return undefined
    }
    const name = find('name', 'الاسم', 'Name', 'اسم المريض', 'اسم', 'Patient Name', 'patient_name')
    const phone = find('phone', 'الموبايل', 'هاتف', 'Phone', 'موبايل', 'موبايل ١', 'رقم الهاتف', 'التليفون', 'phone1')
    const phone2 = find('phone2', 'الموبايل ٢', 'موبايل ٢', 'Phone2', 'هاتف ٢', 'رقم هاتف ٢', 'phone_2')
    const age = find('age', 'العمر', 'Age', 'عمر')
    const gender = find('gender', 'الجنس', 'Gender', 'جنس')
    const bloodType = find('bloodType', 'فصيلة الدم', 'BloodType', 'فصيلة', 'blood_type')
    const address = find('address', 'العنوان', 'Address', 'عنوان')
    const notes = find('notes', 'ملاحظات', 'Notes', 'الملاحظات', 'ملاحظه', 'ملاحظة')
    const allergies = find('allergies', 'الحساسية', 'Allergies', 'حساسية', 'حساسيه')
    const medicalHistory = find('medicalHistory', 'التاريخ المرضي', 'MedicalHistory', 'تاريخ مرضي', 'medical_history', 'أمراض مزمنة', 'امراض')

    // Normalize gender
    let normalizedGender: string | null = null
    const genderStr = gender?.toString().trim().toLowerCase()
    if (genderStr) {
      if (['male', 'm', 'ذكر', 'ذكرى'].includes(genderStr)) normalizedGender = 'male'
      else if (['female', 'f', 'أنثى', 'انثى'].includes(genderStr)) normalizedGender = 'female'
      else normalizedGender = genderStr
    }

    return {
      name: name?.toString().trim() || '',
      phone: phone?.toString().trim() || null,
      phone2: phone2?.toString().trim() || null,
      age: age ? (parseInt(String(age)) || null) : null,
      gender: normalizedGender,
      bloodType: bloodType?.toString().trim() || null,
      address: address?.toString().trim() || null,
      notes: notes?.toString().trim() || null,
      allergies: allergies?.toString().trim() || null,
      medicalHistory: medicalHistory?.toString().trim() || null,
    }
  }

  // ─── Backup Functions ─────────────────────────────────────────────────
  const createBackup = async () => { try { await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'manual' }) }); setLastBackup(cairoISO()); toast.success('تم إنشاء نسخة احتياطية'); loadAllData() } catch { toast.error('فشل إنشاء النسخة') } }
  // Strip virtual/relation fields that aren't real DB columns (e.g. _count, patient, visits, etc.)
  const stripVirtualFields = (record: any) => {
    if (!record || typeof record !== 'object') return record
    const virtualFields = ['_count', 'patient', 'doctor', 'user', 'service', 'laserRecord',
      'laserPackage', 'inventoryItem', 'treatmentPlan', 'phase', 'followUpVisits',
      'visits', 'sessions', 'alerts', 'patientNotes', 'laserRecords',
      'appointments', 'photos', 'treatmentPlans', 'reminders',
      'waitingQueue', 'prescriptions', 'followUpRecords', 'items', 'transactions', 'notes', 'medications']
    const cleaned = { ...record }
    for (const f of virtualFields) delete cleaned[f]
    return cleaned
  }

  const exportBackup = async (format: string) => {
    try {
      // Use server-side backup for comprehensive JSON export (includes ALL data types)
      if (format === 'json') {
        const backupRes: any = await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'export' }) })
        // Now fetch the backup data
        const backupDetail: any = await apiFetch(`/backups/${backupRes.backup?.id || ''}`)
        const backupData = backupDetail?.data
        if (backupData) {
          const parsed = typeof backupData === 'string' ? JSON.parse(backupData) : backupData
          const content = JSON.stringify(parsed, null, 2)
          const blob = new Blob([content], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = `elmoghazi-full-${todayStr}.json`; a.click()
          URL.revokeObjectURL(url)
          toast.success('تم تصدير نسخة احتياطية كاملة')
          return
        }
      }
      // Fallback: client-side export (strips virtual fields for safe re-import)
      const data = {
        patients: patients.map(stripVirtualFields),
        visits, sessions, services, transactions, appointments,
        laserRecords: laserRecords.map(stripVirtualFields),
        laserPackages, inventoryItems, medications, reminders, notes, alerts,
        followUpRecords: followUpRecords.map(stripVirtualFields),
        exportDate: cairoISO()
      }
      let content: string; let filename: string; let mimeType: string
      if (format === 'csv') { const headers = Object.keys(patients[0] || {}).join(','); const rows = patients.map(p => Object.values(p).join(',')).join('\n'); content = headers + '\n' + rows; filename = `elmoghazi-${todayStr}.csv`; mimeType = 'text/csv' }
      else { content = JSON.stringify(data, null, 2); filename = `elmoghazi-${todayStr}.json`; mimeType = 'application/json' }
      const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); toast.success(`تم تصدير النسخة ${format.toUpperCase()}`)
    } catch (e: any) { console.error('Export error:', e); toast.error('فشل التصدير: ' + (e.message || '')) }
  }
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const text = await file.text()
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        // Support both backup formats:
        // 1. Full backup with wrapper: { exportedAt, version, data: { ... } }
        // 2. Direct data format: { patients: [...], visits: [...], ... }
        const backupData = data?.data || data
        // Check if this looks like a full backup
        const knownKeys = ['users','patients','services','visits','sessions','transactions','laserRecords','laserSessions','laserNotes','laserPackages','laserSettings','appointments','notes','alerts','reminders','medications','inventoryItems','inventoryTransactions','treatmentPlans','treatmentPhases','treatmentPlanSessions','patientPhotos','prescriptions','prescriptionItems','notifications','auditLogs','partnerDoctors','followUpRecords','followUpVisits']
        const hasBackupData = knownKeys.some(k => Array.isArray(backupData?.[k]) && backupData[k].length > 0)
        if (hasBackupData) {
          // Full backup restore via dedicated import endpoint
          setRestoreConfirmOpen(true)
          setPendingRestoreData(backupData)
        } else if (data?.patients && Array.isArray(data.patients)) {
          // Simple patient import (only patients, no other data)
          for (const p of data.patients) await addItem('/patients', p, setPatients)
          toast.success(`تم استيراد ${data.patients.length} مريض`)
        } else {
          toast.error('صيغة الملف غير مدعومة - الملف لا يحتوي على بيانات صالحة')
        }
      } else { toast.error('صيغة غير مدعومة - يجب أن يكون الملف بامتداد .json') }
    } catch (err: any) { toast.error('فشل الاستيراد: ' + (err.message || 'ملف تالف')) }
    e.target.value = ''
  }

  // ─── Handle Smart Patient Registration ────────────────────────────────
  const handleSmartPatientSubmit = async () => {
    if (!newPatientName.trim()) return toast.error('الاسم مطلوب')
    // Create patient
    const patient = await addItem('/patients', { name: newPatientName, phone: newPatientPhone, age: parseInt(newPatientAge) || null, gender: newPatientDiagnosis || null, address: newPatientAddress, notes: newPatientNotes }, setPatients)
    if (!patient) return

    const patientId = patient.id
    // Use custom date if provided, otherwise let the server use Cairo time (no date = server defaults to Cairo now)
    const customDate = newPatientDate || undefined
    const vPrice = parseFloat(visitPrice) || 0
    const sPrice = parseFloat(customServicePrice) || 0

    // Determine visit and session needs based on selected type (including combos)
    const needsVisit = ['checkup', 'revisit', 'checkup_session', 'revisit_session'].includes(selectedVisitType)
    const needsSession = ['session', 'checkup_session', 'revisit_session'].includes(selectedVisitType)
    const visitType = selectedVisitType === 'checkup_session' ? 'checkup' : selectedVisitType === 'revisit_session' ? 'revisit' : selectedVisitType
    const visitCategory = getVisitCategory(visitType)

    // Create visit if needed + financial transaction for كشف/إعادة
    if (needsVisit && (visitType === 'checkup' || visitType === 'revisit')) {
      await addItem('/visits', { patientId, type: visitType, date: customDate }, setVisits)
      // Auto-create income transaction for كشف/إعادة
      if (vPrice > 0) {
        await addItem('/finance/transactions', { type: 'income', category: visitCategory, amount: vPrice, description: `${visitCategory} - ${newPatientName}`, date: customDate }, setTransactions)
      }
    }

    // Create sessions for selected services - use custom price entered by user
    if (needsSession && selectedServiceIds.length > 0) {
      for (const serviceId of selectedServiceIds) {
        await addItem('/sessions', { patientId, serviceId, status: 'completed', price: sPrice, paid: true, date: customDate }, setSessions)
      }
      // Auto-create income transaction for sessions
      if (sPrice > 0) {
        const svcNames = selectedServiceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')
        await addItem('/finance/transactions', { type: 'income', category: 'جلسات', amount: sPrice, description: `${svcNames || 'جلسة'} - ${newPatientName}`, date: customDate }, setTransactions)
      }
    }

    // Reset form
    setNewPatientName(''); setNewPatientPhone(''); setNewPatientAddress(''); setNewPatientAge(''); setNewPatientDiagnosis(''); setNewPatientNotes(''); setSelectedVisitType(''); setSelectedServiceIds([]); setCustomServicePrice(''); setVisitPrice(''); setNewPatientDate(''); setShowAddPatient(false)
    // Reload transactions from DB to ensure financial data is in sync
    try { const txnRes = await apiFetch<any>('/finance/transactions?limit=100000'); const dbTxns = txnRes?.transactions || []; if (dbTxns.length > 0) setTransactions(dbTxns) } catch {}
    toast.success(`تم تسجيل المريض ${newPatientName} بنجاح`)
  }

  // Services grouped by category for smart form (must be before early return - Rules of Hooks)
  const servicesByCategory = useMemo(() => {
    const cats: Record<string, Service[]> = {}
    services.filter(s => s.active).forEach(s => { const cat = s.category || 'عام'; if (!cats[cat]) cats[cat] = []; cats[cat].push(s) })
    return cats
  }, [services])

  // Selected follow-up record (component-level so dialogs can access it)
  const selectedFU = useMemo(() => followUpRecords.find(f => f.id === selectedFollowUpId), [followUpRecords, selectedFollowUpId])

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
            <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="✏️ أضف ملاحظة سريعة..." className="input-luxury rounded-xl h-9 text-sm border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-400" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section, createdAt: cairoISO() }, setNotes); setQuickNote('') } }} />
            <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md" onClick={() => { if (quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section, createdAt: cairoISO() }, setNotes); setQuickNote('') } }}><Plus size={16} /></motion.button>
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
  const allowedTabs = isDoctor ? ['dashboard', 'patients', 'sessions', 'laser', 'finance', 'more', 'settings'] : ['patients', 'laser']
  const handleTabSwitch = (tab: string) => {
    if (!allowedTabs.includes(tab)) {
      toast.error('هذا القسم غير متاح للسكرتيرة'); return
    }
    // Check section password protection
    if (sectionPasswords[tab]) {
      setPendingTab(tab)
      setPasswordTarget(tab)
      setPasswordInput('')
      setPasswordDialogOpen(true)
      return
    }
    setActiveTab(tab)
    if (tab === 'patients') setSelectedPatient(null)
  }
  const verifyPassword = () => {
    const storedPassword = sectionPasswords[passwordTarget]
    if (passwordInput === storedPassword) {
      setPasswordDialogOpen(false)
      setActiveTab(pendingTab)
      if (pendingTab === 'patients') setSelectedPatient(null)
      toast.success('تم التحقق بنجاح ✓')
    } else {
      toast.error('كلمة السر غير صحيحة')
    }
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
  const bottomNavItems = isDoctor ? allNavItems : allNavItems.filter(i => ['patients', 'laser'].includes(i.id))

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
                    <div className="text-right"><p className="text-white font-bold text-lg">سكرتيرة</p><p className="text-emerald-200/60 text-xs">المرضى والليزر فقط</p></div>
                  </motion.button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-600/20">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', loginRole === 'doctor' ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-gradient-to-br from-cyan-500 to-cyan-700')}>
                      {loginRole === 'doctor' ? <Stethoscope className="text-white" size={18} /> : <Users size={18} className="text-white" />}
                    </div>
                    <div><p className="text-white font-bold text-sm">{loginRole === 'doctor' ? 'طبيب' : 'سكرتيرة'}</p><p className="text-emerald-200/60 text-[10px]">{loginRole === 'doctor' ? 'دخول كامل' : 'المرضى والليزر فقط'}</p></div>
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
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-l from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20">
            <Clock size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono" dir="ltr">{cairoClock}</span>
          </div>
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
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-l from-amber-500/90 to-orange-600/90 dark:from-amber-600/90 dark:to-orange-700/90 shadow-lg shadow-amber-500/20">
                        <Clock size={20} className="text-white animate-pulse" />
                        <span className="text-white font-black text-xl tracking-wide font-mono" dir="ltr">{cairoClock}</span>
                      </div>
                      <Badge className="badge-gold text-xs">{cairoDateDisplay}</Badge>
                    </div>
                  </div>
                </div>
                {/* Quick Actions - AT TOP */}
                <Card className="card-luxury border-2 border-emerald-200 dark:border-emerald-800"><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}>⚡</motion.span> إجراءات سريعة</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[
                    { label: 'مريض جديد', icon: <UserPlus size={22} />, color: 'bg-gradient-to-br from-blue-500 to-blue-700', action: () => setShowAddPatient(true) },
                    { label: 'سجل ليزر', icon: <Zap size={22} />, color: 'bg-gradient-to-br from-cyan-500 to-cyan-700', action: () => setShowAddLaserRecord(true) },
                    { label: 'معاملة', icon: <DollarSign size={22} />, color: 'bg-gradient-to-br from-amber-500 to-amber-700', action: () => { setTxnFormDate(cairoTodayInput()); setShowAddTransaction(true) } },
                    { label: 'موعد', icon: <Calendar size={22} />, color: 'bg-gradient-to-br from-purple-500 to-purple-700', action: () => setShowAddAppointment(true) },
                    { label: 'مساعد ذكي', icon: <Bot size={22} />, color: 'bg-gradient-to-br from-emerald-500 to-emerald-700', action: () => setAiChatOpen(true) },
                    { label: 'بحث ذكي', icon: <Search size={22} />, color: 'bg-gradient-to-br from-indigo-500 to-indigo-700', action: () => setSmartSearchOpen(true) },
                  ].map((a, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08, y: -2 }} onClick={a.action} className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted/50 transition-all group"><motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, delay: i * 0.2 }} className={cn('p-3.5 rounded-2xl text-white shadow-xl group-hover:shadow-2xl transition-shadow', a.color)}>{a.icon}</motion.div><span className="text-[11px] font-bold">{a.label}</span></motion.button>
                  ))}
                </div></CardContent></Card>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '👥', label: 'إجمالي المرضى', value: patients.length, sub: `+${patients.filter(p => getLocalDateStr(p.createdAt) === todayStr).length} اليوم`, gradient: 'from-blue-500 to-blue-700', anim: { scale: [1, 1.15, 1] } },
                    { icon: '🩺', label: 'زيارات اليوم', value: todayVisits.length, sub: `${todayVisits.filter(v => v.type === 'checkup').length} كشف`, gradient: 'from-emerald-500 to-emerald-700', anim: { rotate: [0, 10, -10, 0] } },
                    { icon: '💰', label: 'إيراد اليوم', value: formatCurrency(todayIncome), sub: `${transactions.filter(t => t.type === 'income').length} معاملة`, gradient: 'from-amber-500 to-amber-700', anim: { scale: [1, 1.2, 1] } },
                    { icon: '📅', label: 'مواعيد اليوم', value: todayAppointments.length, sub: `${appointments.filter(a => a.status === 'scheduled').length} مجدول`, gradient: 'from-purple-500 to-purple-700', anim: { y: [0, -5, 0] } },
                    { icon: '⚡', label: 'جلسات اليوم', value: sessions.filter(s => getLocalDateStr(s.date) === todayStr).length, sub: `${sessions.filter(s => !s.paid).length} غير مدفوعة`, gradient: 'from-violet-500 to-violet-700', anim: { rotate: [0, 15, -15, 0] } },
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
                        const todayCheckupRev = transactions.filter(t => t.type === 'income' && t.category === 'كشف' && getLocalDateStr(t.date) === todayStr).reduce((s, t) => s + t.amount, 0)
                        const todayRevisitRev = transactions.filter(t => t.type === 'income' && t.category === 'إعادة' && getLocalDateStr(t.date) === todayStr).reduce((s, t) => s + t.amount, 0)
                        const todaySessionRev = transactions.filter(t => t.type === 'income' && (t.category === 'جلسات' || t.category === 'ليزر' || t.category === 'متابعة') && getLocalDateStr(t.date) === todayStr).reduce((s, t) => s + t.amount, 0)
                        const todayUnpaid = sessions.filter(s => !s.paid && getLocalDateStr(s.date) === todayStr).reduce((s, ses) => s + ses.price, 0)
                        const todaySessionsCompleted = sessions.filter(s => s.status === 'completed' && getLocalDateStr(s.date) === todayStr).length
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
                <div className="section-header-animated rounded-2xl bg-gradient-to-l from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-violet-950/30 relative overflow-hidden">
                  {/* Floating decorative dots */}
                  <div className="float-dot w-3 h-3 bg-blue-400 dark:bg-blue-500 top-3 right-10" style={{animationDelay: '0s'}} />
                  <div className="float-dot w-2 h-2 bg-indigo-400 dark:bg-indigo-500 top-8 right-24" style={{animationDelay: '1s'}} />
                  <div className="float-dot w-4 h-4 bg-violet-300 dark:bg-violet-600 bottom-3 left-16" style={{animationDelay: '2s'}} />
                  <div className="float-dot w-2 h-2 bg-pink-400 dark:bg-pink-500 bottom-6 left-8" style={{animationDelay: '0.5s'}} />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="header-3d-icon">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30" style={{transformStyle: 'preserve-3d'}}>
                          <Users size={28} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold">إدارة المرضى</h1>
                        <p className="text-sm"><span className="patient-count-animated font-black text-lg">{patients.length}</span> <span className="text-muted-foreground">مريض</span></p>
                      </div>
                    </div>
                    <Button className="btn-luxury bg-gradient-to-l from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow" onClick={() => setShowAddPatient(true)}>
                      <UserPlus size={16} className="ml-2" /> تسجيل مريض
                    </Button>
                  </div>
                </div>
                {/* Search + Smart Filters */}
                <div className="space-y-3">
                  {/* Enhanced Search Bar */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-l from-violet-500 via-fuchsia-500 to-rose-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-opacity" />
                    <div className="relative">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                      <Input 
                        placeholder="بحث ذكي... الاسم أو الهاتف أو العنوان أو التشخيص" 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        className="pr-12 input-luxury rounded-2xl h-14 text-base border-2 border-transparent focus:border-violet-400 bg-background" 
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  {searchQuery && debouncedSearchQuery !== searchQuery && <p className="text-[10px] text-muted-foreground animate-pulse">جاري البحث...</p>}
                  {debouncedSearchQuery && filteredPatients.length === 0 && patients.length > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <Search size={14} className="text-amber-500" />
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">لا توجد نتائج لـ &quot;{debouncedSearchQuery}&quot; — يتم البحث بتصحيح تلقائي</p>
                    </div>
                  )}
                  {debouncedSearchQuery && filteredPatients.length > 0 && filteredPatients.length < patients.length && (
                    <p className="text-[10px] text-muted-foreground">عُثر على {filteredPatients.length} نتيجة</p>
                  )}

                  {/* Smart Filter Chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { id: 'all', label: 'الكل', emoji: '🏷️', gradient: 'from-violet-500 to-fuchsia-500' },
                      { id: 'name', label: 'الاسم', emoji: '👤', gradient: 'from-blue-500 to-cyan-500' },
                      { id: 'address', label: 'العنوان', emoji: '📍', gradient: 'from-emerald-500 to-teal-500' },
                      { id: 'diagnosis', label: 'التشخيص', emoji: '🩺', gradient: 'from-rose-500 to-pink-500' },
                      { id: 'phone', label: 'الهاتف', emoji: '📞', gradient: 'from-amber-500 to-orange-500' },
                      { id: 'notes', label: 'الملاحظات', emoji: '📋', gradient: 'from-purple-500 to-violet-500' },
                    ].map(chip => (
                      <motion.button
                        key={chip.id}
                        whileTap={{ scale: 0.93 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSearchField(chip.id as 'all' | 'name' | 'address' | 'diagnosis' | 'phone' | 'notes')}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all border-2 shadow-sm',
                          searchField === chip.id
                            ? `bg-gradient-to-l ${chip.gradient} text-white border-transparent shadow-md`
                            : 'bg-card border-border text-muted-foreground hover:border-violet-300 dark:hover:border-violet-700'
                        )}
                      >
                        <span className="text-base">{chip.emoji}</span>
                        <span style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{chip.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Starred/Improved filters */}
                  <div className="flex items-center gap-2">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPatientFilter(patientFilter === 'starred' ? 'all' : 'starred')} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2', patientFilter === 'starred' ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-950/20')}><Star size={16} className={patientFilter === 'starred' ? 'text-amber-500 fill-amber-500' : ''} /> ⭐ المميزة</motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPatientFilter(patientFilter === 'improved' ? 'all' : 'improved')} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2', patientFilter === 'improved' ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-400 dark:border-pink-600 text-pink-700 dark:text-pink-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-pink-50 dark:hover:bg-pink-950/20')}><Heart size={16} className={patientFilter === 'improved' ? 'text-pink-500 fill-pink-500' : ''} /> 💗 المتحسنين</motion.button>
                    {patientFilter !== 'all' && <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPatientFilter('all')}>إلغاء الفلتر</Button>}
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredPatients.length === 0 && <Card className="card-luxury p-8 text-center"><p className="text-muted-foreground">{patientFilter === 'starred' ? 'لا توجد حالات مميزة بعد' : patientFilter === 'improved' ? 'لا توجد حالات متحسنة بعد' : 'لا توجد نتائج'}</p></Card>}
                  {filteredPatients.slice(0, patientDisplayCount).map(p => {
                    const stripeGradient = p.gender === 'female' ? 'bg-gradient-to-b from-pink-400 to-rose-500' : p.gender === 'male' ? 'bg-gradient-to-b from-blue-400 to-indigo-500' : 'bg-gradient-to-b from-gray-400 to-gray-500'
                    // Get latest diagnosis from visits
                    const latestDiagnosis = visits.filter(v => v.patientId === p.id && v.diagnosis).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.diagnosis
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="patient-card-3d rounded-2xl border border-border bg-card text-card-foreground p-4 cursor-pointer relative" onClick={() => setSelectedPatient(p)}>
                        <div className={`patient-stripe ${stripeGradient}`} />
                        <div className="flex items-center gap-3">
                          <Avatar className="h-14 w-14 border-2 shadow-md" style={{ borderColor: p.colorTag || (p.gender === 'female' ? '#ec4899' : '#3b82f6') }}>
                            <AvatarFallback className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 font-black text-xl" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{p.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-black text-base truncate" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{safeName(p.name)}</p>
                              {p.starred && <span className="badge-glow text-amber-500 text-sm">⭐</span>}
                              {p.improved && <span className="badge-glow text-pink-500 text-sm" style={{animationDelay: '0.5s'}}>💗</span>}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full"><Hash size={9} />{p.fileNumber}</span>
                              {p.phone && <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full"><Phone size={9} />{p.phone}</span>}
                              {p.age && <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-[10px] font-bold rounded-full">🎂 {p.age} سنة</span>}
                            </div>
                            {p.address && <p className="text-[10px] text-muted-foreground mt-1 truncate flex items-center gap-1"><MapPin size={9} className="text-teal-500 flex-shrink-0" />{p.address}</p>}
                            {latestDiagnosis && <p className="text-[10px] text-muted-foreground mt-0.5 truncate flex items-center gap-1"><Stethoscope size={9} className="text-rose-500 flex-shrink-0" />{latestDiagnosis}</p>}
                          </div>
                          {p.gender && <Badge className={cn('text-[10px] font-bold', p.gender === 'female' ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 dark:from-pink-900/30 dark:to-rose-900/30 dark:text-pink-400' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400')}>{p.gender === 'female' ? '♀' : '♂'} {p.gender}</Badge>}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                {filteredPatients.length > patientDisplayCount && (
                  <Button variant="outline" className="w-full rounded-xl text-sm font-bold" onClick={() => setPatientDisplayCount(c => c + 50)}>
                    عرض المزيد ({filteredPatients.length - patientDisplayCount} متبقي)
                  </Button>
                )}
                {renderQuickNotes('patients')}
              </div>
            )}

            {/* ═══ PATIENT DETAIL - DEDICATED PROFILE ═══ */}
            {activeTab === 'patients' && selectedPatient && (
              <div className="space-y-4">
                <motion.button initial={{ x: -10 }} animate={{ x: 0 }} whileTap={{ scale: 0.95 }} whileHover={{ x: -3 }} onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-bold hover:shadow-md transition-all"><ChevronDown size={16} className="rotate-90" /> العودة للقائمة</motion.button>

                {/* ═══ PATIENT HEADER — Luxury Premium Design ═══ */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl shadow-xl border-0">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700" />
                  <div className="absolute inset-0 opacity-20">
                    <motion.div animate={{ x: [0, 120, 0], y: [0, -60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full blur-3xl" />
                    <motion.div animate={{ x: [0, -90, 0], y: [0, 70, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }} className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-300/15 rounded-full blur-3xl" />
                    <motion.div animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-1/2 left-1/2 w-36 h-36 bg-amber-200/10 rounded-full blur-3xl" />
                  </div>
                  <div className="relative z-10 p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-22 w-22 border-4 shadow-2xl" style={{ borderColor: selectedPatient.colorTag || '#818cf8', width: 88, height: 88 }}><AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-3xl font-black" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.name?.charAt(0)}</AvatarFallback></Avatar>
                        {selectedPatient.starred && <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="absolute -top-1 -right-1 text-xl">⭐</motion.span>}
                        {selectedPatient.improved && <span className="absolute -bottom-1 -right-1 text-lg">💗</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{safeName(selectedPatient.name)}</h2>
                          {/* Improvement Ring */}
                          {(() => {
                            const score = selectedPatient.improvementScore || 0
                            const colors = getImprovementColor(score)
                            const history = getImprovementHistory(selectedPatient.improvementHistory)
                            const prevScore = history.length >= 2 ? history[history.length - 2]?.score : undefined
                            const trend = prevScore !== undefined ? (score > prevScore ? 'up' : score < prevScore ? 'down' : 'same') : undefined
                            const radius = 28
                            const circumference = 2 * Math.PI * radius
                            const progress = score > 0 ? (score / 10) * circumference : 0
                            return (
                              <div className="improvement-ring" style={{ width: 68, height: 68 }} onClick={() => { setImprovementSliderValue(score || 5); setImprovementNote(''); setShowImprovementSlider(true) }}>
                                <svg width="68" height="68" viewBox="0 0 68 68">
                                  <circle cx="34" cy="34" r={radius} fill="none" stroke="var(--muted)" strokeWidth="5" />
                                  {score > 0 && <motion.circle cx="34" cy="34" r={radius} fill="none" stroke={colors.ring} strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - progress }} transition={{ duration: 1, ease: 'easeOut' }} />}
                                </svg>
                                <div className="improvement-ring-label">
                                  <span className="emoji">{score > 0 ? getImprovementEmoji(score) : '➕'}</span>
                                  <span className="score text-sm" style={{ color: score > 0 ? colors.ring : 'var(--muted-foreground)' }}>{score > 0 ? score : '-'}</span>
                                </div>
                                {trend && (
                                  <span className={cn('improvement-trend absolute -top-1 -left-1', trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
                                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                                  </span>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2 flex-wrap">
                          <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg font-bold text-white/90 text-xs border border-white/10"><Hash size={11} />{selectedPatient.fileNumber}</span>
                          {selectedPatient.phone && <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white/90 text-xs border border-white/10"><Phone size={11} />{selectedPatient.phone}</span>}
                          {selectedPatient.age && <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white/90 text-xs border border-white/10">🎂 {selectedPatient.age} سنة</span>}
                          {selectedPatient.gender && <Badge className="text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">🔬 {selectedPatient.gender}</Badge>}
                        </div>
                      </div>
                    </div>
                    {/* Quick Actions — Glass Style */}
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} onClick={() => { setEditingPatient(!editingPatient); if (!editingPatient) setEditPatientForm({ name: selectedPatient.name, phone: selectedPatient.phone || '', phone2: selectedPatient.phone2 || '', age: String(selectedPatient.age || ''), gender: selectedPatient.gender || '', address: selectedPatient.address || '', bloodType: selectedPatient.bloodType || '', medicalHistory: selectedPatient.medicalHistory || '', notes: selectedPatient.notes || '' }) }} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border backdrop-blur-sm', editingPatient ? 'bg-white/30 border-white/40 text-white shadow-lg' : 'bg-white/15 border-white/20 text-white/90 hover:bg-white/25')}><Edit3 size={13} /> تعديل</motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} onClick={() => setDeletePatientConfirmOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-red-100 hover:bg-red-500/40 transition-all"><Trash2 size={13} /> حذف</motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ starred: !selectedPatient.starred }) }); const u = { ...selectedPatient, starred: !selectedPatient.starred }; setSelectedPatient(u); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p)); toast.success(selectedPatient.starred ? 'تم إزالة التمييز' : 'تم التمييز ⭐') } catch { toast.error('خطأ') } }} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border backdrop-blur-sm', selectedPatient.starred ? 'bg-amber-400/30 border-amber-400/40 text-amber-100' : 'bg-white/15 border-white/20 text-white/90 hover:bg-white/25')}><Star size={13} className={selectedPatient.starred ? 'fill-amber-300' : ''} /> {selectedPatient.starred ? 'مميز' : 'تمييز'}</motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ improved: !selectedPatient.improved }) }); const u = { ...selectedPatient, improved: !selectedPatient.improved }; setSelectedPatient(u); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p)); toast.success(selectedPatient.improved ? 'تم إزالة التحسن' : 'تم تسجيل التحسن 💗') } catch { toast.error('خطأ') } }} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border backdrop-blur-sm', selectedPatient.improved ? 'bg-pink-400/30 border-pink-400/40 text-pink-100' : 'bg-white/15 border-white/20 text-white/90 hover:bg-white/25')}><Heart size={13} className={selectedPatient.improved ? 'fill-pink-300' : ''} /> {selectedPatient.improved ? 'متحسن' : 'تحسن'}</motion.button>
                      {selectedPatient.phone && <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} onClick={() => { const wp = waPhone(selectedPatient.phone); if (wp) window.open(`https://wa.me/${wp}`, '_blank') }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/30 text-emerald-100 hover:bg-emerald-500/40 transition-all"><Send size={12} /> واتساب</motion.button>}
                    </div>
                    {/* Edit Patient Form */}
                    {editingPatient && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label className="text-xs font-bold">الاسم</Label><Input value={editPatientForm.name} onChange={e => setEditPatientForm(prev => ({ ...prev, name: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
                          <div><Label className="text-xs font-bold">الهاتف</Label><Input value={editPatientForm.phone} onChange={e => setEditPatientForm(prev => ({ ...prev, phone: normalizePhone(e.target.value) }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
                          <div><Label className="text-xs font-bold">هاتف آخر</Label><Input value={editPatientForm.phone2} onChange={e => setEditPatientForm(prev => ({ ...prev, phone2: normalizePhone(e.target.value) }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
                          <div><Label className="text-xs font-bold">العمر</Label><Input type="number" value={editPatientForm.age} onChange={e => setEditPatientForm(prev => ({ ...prev, age: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
                          <div><Label className="text-xs font-bold">التشخيص</Label><Input value={editPatientForm.gender} onChange={e => setEditPatientForm(prev => ({ ...prev, gender: e.target.value }))} placeholder="أدخل التشخيص..." className="rounded-xl h-9 mt-1" /></div>
                          <div><Label className="text-xs font-bold">فصيلة الدم</Label><Select value={editPatientForm.bloodType} onValueChange={v => setEditPatientForm(p => ({ ...p, bloodType: v }))}><SelectTrigger className="rounded-xl h-9 mt-1"><SelectValue /></SelectTrigger><SelectContent>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                          <div><Label className="text-xs font-bold">العنوان</Label><Input value={editPatientForm.address} onChange={e => setEditPatientForm(prev => ({ ...prev, address: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
                          <div><Label className="text-xs font-bold">التاريخ المرضي</Label><Input value={editPatientForm.medicalHistory} onChange={e => setEditPatientForm(prev => ({ ...prev, medicalHistory: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
                        </div>
                        <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={editPatientForm.notes} onChange={e => setEditPatientForm(prev => ({ ...prev, notes: e.target.value }))} className="input-luxury rounded-xl mt-1" rows={2} /></div>
                        <div className="flex gap-2"><Button className="rounded-xl bg-blue-600 text-white" onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ name: editPatientForm.name, phone: editPatientForm.phone || null, phone2: editPatientForm.phone2 || null, age: parseInt(editPatientForm.age) || null, gender: editPatientForm.gender || null, address: editPatientForm.address || null, bloodType: editPatientForm.bloodType || null, medicalHistory: editPatientForm.medicalHistory || null, notes: editPatientForm.notes || null }) }); const updated = { ...selectedPatient, name: editPatientForm.name, phone: editPatientForm.phone || undefined, phone2: editPatientForm.phone2 || undefined, age: parseInt(editPatientForm.age) || undefined, gender: editPatientForm.gender || undefined, address: editPatientForm.address || undefined, bloodType: editPatientForm.bloodType || undefined, medicalHistory: editPatientForm.medicalHistory || undefined, notes: editPatientForm.notes || undefined }; setSelectedPatient(updated); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updated : p)); setEditingPatient(false); toast.success('تم تحديث البيانات') } catch { toast.error('خطأ في التحديث') } }}>حفظ</Button><Button variant="outline" onClick={() => setEditingPatient(false)}>إلغاء</Button></div>
                      </motion.div>
                    )}
                    {/* Color Tag — Glass Style */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] text-white/60 font-bold">لون:</span>
                      {['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#6366f1'].map(c => (
                        <button key={c} onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ colorTag: c }) }); const u = { ...selectedPatient, colorTag: c }; setSelectedPatient(u); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p)); toast.success('تم تغيير اللون') } catch { toast.error('خطأ') } }} className={cn('w-6 h-6 rounded-full border-2 transition-all hover:scale-125', selectedPatient.colorTag === c ? 'border-white scale-125 shadow-lg shadow-white/20' : 'border-white/30 hover:border-white/60')} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {/* Improvement History Timeline */}
                    {(() => {
                      const history = getImprovementHistory(selectedPatient.improvementHistory)
                      if (history.length === 0) return null
                      return (
                        <div className="mt-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity size={14} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">سجل مؤشر التحسن</span>
                          </div>
                          <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-0">
                            {history.slice().reverse().map((entry, idx) => {
                              const entryColor = getImprovementColor(entry.score)
                              return (
                                <div key={idx} className="improvement-timeline-item">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm flex-shrink-0" style={{ backgroundColor: entryColor.ring }} />
                                    <span className="text-xs font-bold" style={{ color: entryColor.ring }}>{entry.score}/10</span>
                                    <span className="text-[10px]">{getImprovementEmoji(entry.score)}</span>
                                    <span className="text-[10px] text-muted-foreground">{formatDate(entry.date)}</span>
                                    {entry.note && <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">- {entry.note}</span>}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </motion.div>

                {/* Improvement Score Slider Dialog */}
                <Dialog open={showImprovementSlider} onOpenChange={setShowImprovementSlider}>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Activity size={18} className="text-emerald-600" /> مؤشر التحسن
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      {/* Preview Ring */}
                      {(() => {
                        const previewColors = getImprovementColor(improvementSliderValue)
                        const pRadius = 44
                        const pCircumference = 2 * Math.PI * pRadius
                        const pProgress = (improvementSliderValue / 10) * pCircumference
                        return (
                          <div className="flex justify-center">
                            <div className="improvement-ring" style={{ width: 100, height: 100 }}>
                              <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r={pRadius} fill="none" stroke="var(--muted)" strokeWidth="7" />
                                <motion.circle cx="50" cy="50" r={pRadius} fill="none" stroke={previewColors.ring} strokeWidth="7" strokeLinecap="round" strokeDasharray={pCircumference} animate={{ strokeDashoffset: pCircumference - pProgress }} transition={{ duration: 0.4 }} />
                              </svg>
                              <div className="improvement-ring-label">
                                <span className="text-2xl">{getImprovementEmoji(improvementSliderValue)}</span>
                                <span className="score text-2xl" style={{ color: previewColors.ring }}>{improvementSliderValue}</span>
                                <span className="text-[10px] font-bold" style={{ color: previewColors.ring }}>{previewColors.label}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                      {/* Score Buttons 1-10 */}
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                          const nColors = getImprovementColor(n)
                          return (
                            <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => setImprovementSliderValue(n)}
                              className={cn('w-9 h-9 rounded-xl text-sm font-black transition-all border-2', improvementSliderValue === n ? 'text-white shadow-lg scale-110' : 'bg-white dark:bg-slate-800 border-border text-muted-foreground hover:scale-105')}
                              style={improvementSliderValue === n ? { backgroundColor: nColors.ring, borderColor: nColors.ring } : {}}>
                              {n}
                            </motion.button>
                          )
                        })}
                      </div>
                      {/* Note */}
                      <div>
                        <Label className="text-xs font-bold">ملاحظة (اختياري)</Label>
                        <Input value={improvementNote} onChange={e => setImprovementNote(e.target.value)} placeholder="سبب التغيير..." className="input-luxury rounded-xl h-9 mt-1" />
                      </div>
                      <Button className="w-full rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-700 text-white shadow-lg" onClick={async () => {
                        try {
                          const history = getImprovementHistory(selectedPatient.improvementHistory)
                          const newEntry: ImprovementEntry = { score: improvementSliderValue, date: cairoISO(), note: improvementNote || undefined }
                          const newHistory = [...history, newEntry]
                          const historyStr = JSON.stringify(newHistory)
                          await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ improvementScore: improvementSliderValue, improvementHistory: historyStr }) })
                          const u = { ...selectedPatient, improvementScore: improvementSliderValue, improvementHistory: historyStr }
                          setSelectedPatient(u)
                          setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p))
                          if (improvementSliderValue >= 8) {
                            setCelebratingImprovement(true)
                            setTimeout(() => setCelebratingImprovement(false), 2000)
                            toast.success(`🎉 مؤشر التحسن: ${improvementSliderValue}/10 - ممتاز!`)
                          } else {
                            toast.success(`تم تحديث مؤشر التحسن: ${improvementSliderValue}/10`)
                          }
                          setShowImprovementSlider(false)
                        } catch { toast.error('خطأ في التحديث') }
                      }}>
                        حفظ مؤشر التحسن
                      </Button>
                    </div>
                    {/* Celebration Effect */}
                    {celebratingImprovement && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="confetti-particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${30 + Math.random() * 40}%`,
                            backgroundColor: ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6'][i % 6],
                            animationDelay: `${i * 0.08}s`,
                          }} />
                        ))}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Delete Patient Confirmation */}
                <AlertDialog open={deletePatientConfirmOpen} onOpenChange={setDeletePatientConfirmOpen}>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف المريض</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف {selectedPatient?.name}؟ سيتم حذف جميع البيانات المرتبطة بما فيها سجلات وجلسات الليزر.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={async () => { if (!selectedPatient) return; try { const pVisits = visits.filter(v => v.patientId === selectedPatient.id); const pSessions = sessions.filter(s => s.patientId === selectedPatient.id); for (const v of pVisits) { await apiFetch(`/visits/${v.id}`, { method: 'DELETE' }); } for (const s of pSessions) { await apiFetch(`/sessions/${s.id}`, { method: 'DELETE' }); } const relatedTx = transactions.filter(t => t.description?.includes(selectedPatient.name)); for (const tx of relatedTx) { await apiFetch(`/finance/transactions/${tx.id}`, { method: 'DELETE' }); } const relatedNotes = notes.filter(n => n.patientId === selectedPatient.id); for (const n of relatedNotes) { await apiFetch(`/notes/${n.id}`, { method: 'DELETE' }); } await apiFetch(`/patients/${selectedPatient.id}`, { method: 'DELETE' }); setPatients(prev => prev.filter(p => p.id !== selectedPatient.id)); setVisits(prev => prev.filter(v => v.patientId !== selectedPatient.id)); setSessions(prev => prev.filter(s => s.patientId !== selectedPatient.id)); setTransactions(prev => prev.filter(t => !t.description?.includes(selectedPatient.name))); setNotes(prev => prev.filter(n => n.patientId !== selectedPatient.id)); setLaserRecords(prev => prev.filter(r => r.patientId !== selectedPatient.id)); setSelectedPatient(null); setDeletePatientConfirmOpen(false); toast.success('تم حذف المريض وكل البيانات المرتبطة ✅') } catch { toast.error('خطأ في الحذف') } }}>حذف نهائي</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>

                {/* ═══ PATIENT DETAIL TABS — Elegant Navigation ═══ */}
                <Tabs value={patientDetailTab} onValueChange={setPatientDetailTab}>
                  <TabsList className="w-full flex flex-wrap gap-1.5 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
                    <TabsTrigger value="overview" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Activity size={12} className="inline ml-1" />نظرة</TabsTrigger>
                    <TabsTrigger value="visits" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Stethoscope size={12} className="inline ml-1" />زيارات</TabsTrigger>
                    <TabsTrigger value="sessions" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Zap size={12} className="inline ml-1" />جلسات</TabsTrigger>
                    <TabsTrigger value="laser" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Zap size={12} className="inline ml-1 text-cyan-500" />ليزر</TabsTrigger>
                    <TabsTrigger value="reminders" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Bell size={12} className="inline ml-1 text-rose-500" />تذكيرات</TabsTrigger>
                    <TabsTrigger value="finance" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><DollarSign size={12} className="inline ml-1 text-emerald-500" />مالية</TabsTrigger>
                    <TabsTrigger value="notes" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><FileText size={12} className="inline ml-1 text-amber-500" />ملاحظات</TabsTrigger>
                  </TabsList>

                  {/* ═══ OVERVIEW — Premium Dashboard Style ═══ */}
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    {(() => {
                      const pVisits = visits.filter(v => v.patientId === selectedPatient.id)
                      const pSessions = sessions.filter(s => s.patientId === selectedPatient.id)
                      const pLaser = laserRecords.filter(l => l.patientId === selectedPatient.id)
                      const pLaserSessions = pLaser.flatMap(r => r.laserSessions || [])
                      const pNotes = notes.filter(n => n.patientId === selectedPatient.id)
                      const totalSpent = pSessions.reduce((a, s) => a + s.price, 0) + pLaserSessions.reduce((a, s) => a + (s.price || 0), 0)
                      const totalPaid = pSessions.filter(s => s.paid).reduce((a, s) => a + s.price, 0) + pLaserSessions.filter(s => s.paid).reduce((a, s) => a + (s.price || 0), 0)
                      const totalUnpaid = totalSpent - totalPaid
                      const latestVisit = pVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                      const latestDiagnosis = latestVisit?.diagnosis || latestVisit?.notes
                      return (
                    <>

                    {/* ─── Hero Info Cards ─── */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Contact Card */}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="relative overflow-hidden rounded-2xl border-2 border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-slate-900/40 dark:to-indigo-950/20 p-4 shadow-sm">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/30 dark:bg-blue-700/10 rounded-full -translate-y-4 translate-x-4 blur-xl" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md"><Phone size={14} className="text-white" /></div>
                            <h4 className="text-sm font-black text-blue-700 dark:text-blue-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>بيانات الاتصال</h4>
                          </div>
                          <div className="space-y-2">
                            {selectedPatient.phone && <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/80 dark:bg-blue-900/20"><Phone size={13} className="text-blue-500" /><div><p className="text-[10px] text-muted-foreground font-bold">الهاتف</p><a href={`tel:${selectedPatient.phone}`} className="text-sm font-bold text-blue-700 dark:text-blue-300 hover:underline" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.phone}</a></div></div>}
                            {selectedPatient.phone2 && <div className="flex items-center gap-2 p-2 rounded-xl bg-teal-50/80 dark:bg-teal-900/20"><Phone size={13} className="text-teal-500" /><div><p className="text-[10px] text-muted-foreground font-bold">هاتف آخر</p><a href={`tel:${selectedPatient.phone2}`} className="text-sm font-bold text-teal-700 dark:text-teal-300 hover:underline" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.phone2}</a></div></div>}
                            {selectedPatient.address && <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-900/20"><MapPin size={13} className="text-indigo-500" /><div><p className="text-[10px] text-muted-foreground font-bold">العنوان</p><p className="text-sm font-bold text-indigo-700 dark:text-indigo-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.address}</p></div></div>}
                            {!selectedPatient.phone && !selectedPatient.phone2 && !selectedPatient.address && <p className="text-center text-muted-foreground text-xs py-3">لا توجد بيانات اتصال</p>}
                          </div>
                        </div>
                      </motion.div>

                      {/* Medical Card */}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative overflow-hidden rounded-2xl border-2 border-rose-200 dark:border-rose-800/60 bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-slate-900/40 dark:to-pink-950/20 p-4 shadow-sm">
                        <div className="absolute top-0 left-0 w-16 h-16 bg-rose-200/30 dark:bg-rose-700/10 rounded-full -translate-y-4 -translate-x-4 blur-xl" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-md"><Heart size={14} className="text-white" /></div>
                            <h4 className="text-sm font-black text-rose-700 dark:text-rose-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>البيانات الطبية</h4>
                          </div>
                          <div className="space-y-2">
                            {selectedPatient.bloodType && <div className="flex items-center gap-2 p-2 rounded-xl bg-red-50/80 dark:bg-red-900/20"><div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-black text-xs shadow-sm">{selectedPatient.bloodType}</div><div><p className="text-[10px] text-muted-foreground font-bold">فصيلة الدم</p><p className="text-sm font-bold text-red-700 dark:text-red-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.bloodType}</p></div></div>}
                            {selectedPatient.allergies && <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/80 dark:bg-amber-900/20"><AlertTriangle size={13} className="text-amber-500" /><div><p className="text-[10px] text-muted-foreground font-bold">الحساسية</p><p className="text-sm font-bold text-amber-700 dark:text-amber-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.allergies}</p></div></div>}
                            {selectedPatient.medicalHistory && <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/80 dark:bg-purple-900/20"><ClipboardCheck size={13} className="text-purple-500" /><div><p className="text-[10px] text-muted-foreground font-bold">التاريخ المرضي</p><p className="text-sm font-bold text-purple-700 dark:text-purple-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.medicalHistory}</p></div></div>}
                            {latestDiagnosis && <div className="flex items-center gap-2 p-2 rounded-xl bg-violet-50/80 dark:bg-violet-900/20"><Stethoscope size={13} className="text-violet-500" /><div><p className="text-[10px] text-muted-foreground font-bold">آخر تشخيص</p><p className="text-sm font-bold text-violet-700 dark:text-violet-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{latestDiagnosis}</p></div></div>}
                            {!selectedPatient.bloodType && !selectedPatient.medicalHistory && !selectedPatient.allergies && !latestDiagnosis && <p className="text-center text-muted-foreground text-xs py-3">لا توجد بيانات طبية</p>}
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* ─── Patient Notes ─── */}
                    {selectedPatient.notes && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative overflow-hidden rounded-2xl border-2 border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-slate-900/40 dark:to-orange-950/20 p-4 shadow-sm">
                        <div className="absolute top-0 left-0 w-20 h-20 bg-amber-200/30 dark:bg-amber-700/10 rounded-full -translate-y-6 -translate-x-6 blur-2xl" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md"><StickyNote size={14} className="text-white" /></div>
                            <h4 className="text-sm font-black text-amber-700 dark:text-amber-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>ملاحظات المريض</h4>
                          </div>
                          <p className="text-[15px] font-semibold leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif", lineHeight: '1.9' }}>{selectedPatient.notes}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── Quick Stats — Modern Dashboard Cards ─── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} whileTap={{ scale: 0.95 }} onClick={() => setPatientDetailTab('visits')} className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer border-2 border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-sm hover:shadow-lg transition-all group">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200/20 dark:bg-blue-700/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        <div className="relative z-10">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 w-fit mx-auto mb-2 shadow-md"><Stethoscope size={18} className="text-white" /></div>
                          <p className="text-2xl font-black text-blue-600 dark:text-blue-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{pVisits.length}</p>
                          <p className="text-xs font-bold text-blue-500/70 mt-0.5" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>زيارة</p>
                        </div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} whileTap={{ scale: 0.95 }} onClick={() => setPatientDetailTab('sessions')} className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer border-2 border-orange-200 dark:border-orange-800/60 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 shadow-sm hover:shadow-lg transition-all group">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-200/20 dark:bg-orange-700/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        <div className="relative z-10">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 w-fit mx-auto mb-2 shadow-md"><Zap size={18} className="text-white" /></div>
                          <p className="text-2xl font-black text-orange-600 dark:text-orange-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{pSessions.length}</p>
                          <p className="text-xs font-bold text-orange-500/70 mt-0.5" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>جلسة</p>
                        </div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} whileTap={{ scale: 0.95 }} onClick={() => setPatientDetailTab('laser')} className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer border-2 border-cyan-200 dark:border-cyan-800/60 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 shadow-sm hover:shadow-lg transition-all group">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-cyan-200/20 dark:bg-cyan-700/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        <div className="relative z-10">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 w-fit mx-auto mb-2 shadow-md"><Zap size={18} className="text-white" /></div>
                          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{pLaser.length}</p>
                          <p className="text-xs font-bold text-cyan-500/70 mt-0.5" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>ليزر</p>
                        </div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} whileTap={{ scale: 0.95 }} onClick={() => setPatientDetailTab('finance')} className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer border-2 border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 shadow-sm hover:shadow-lg transition-all group">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-200/20 dark:bg-emerald-700/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        <div className="relative z-10">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 w-fit mx-auto mb-2 shadow-md"><DollarSign size={18} className="text-white" /></div>
                          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{formatCurrency(totalSpent)}</p>
                          <p className="text-xs font-bold text-emerald-500/70 mt-0.5" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>إجمالي</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* ─── Financial Summary ─── */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-green-950/20 p-4 shadow-sm">
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/20 dark:bg-emerald-700/10 rounded-full translate-y-8 -translate-x-8 blur-2xl" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-md"><Wallet size={14} className="text-white" /></div>
                          <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>الملخص المالي</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                            <p className="text-[10px] text-muted-foreground font-bold mb-1">المدفوع</p>
                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{formatCurrency(totalPaid)}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                            <p className="text-[10px] text-muted-foreground font-bold mb-1">المتبقي</p>
                            <p className="text-lg font-black text-amber-600 dark:text-amber-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{formatCurrency(totalUnpaid)}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* ─── Activity Timeline — Premium ─── */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="relative overflow-hidden rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-violet-950/20 p-4 shadow-sm">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200/20 dark:bg-indigo-700/10 rounded-full -translate-y-6 translate-x-6 blur-2xl" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md"><Activity size={14} className="text-white" /></div>
                          <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>سجل النشاط</h4>
                          <Badge variant="outline" className="text-[9px] font-bold">{pVisits.length + pSessions.length + pNotes.length} حدث</Badge>
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                          {(() => {
                            const pV = visits.filter(v => v.patientId === selectedPatient.id).map(v => ({ id: v.id, t: 'visit' as const, date: v.date, icon: <Stethoscope size={14} className="text-violet-500" />, label: VISIT_TYPES.find(ti => ti.id === v.type)?.label || v.type, detail: v.notes || v.diagnosis || '', color: 'bg-violet-500' }))
                            const pS = sessions.filter(s => s.patientId === selectedPatient.id).map(s => ({ id: s.id, t: 'session' as const, date: s.date, icon: <Zap size={14} className={s.paid ? 'text-emerald-500' : 'text-amber-500'} />, label: (services.find(sv => sv.id === s.serviceId)?.name || 'جلسة') + (s.paid ? ' ✅' : ''), detail: `${formatCurrency(s.price)}`, color: s.paid ? 'bg-emerald-500' : 'bg-amber-500' }))
                            const pN = notes.filter(n => n.patientId === selectedPatient.id).map(n => ({ id: n.id, t: 'note' as const, date: n.createdAt, icon: <FileText size={14} className="text-amber-500" />, label: 'ملاحظة', detail: n.content, color: 'bg-amber-500' }))
                            const tl = [...pV, ...pS, ...pN].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            if (tl.length === 0) return <div className="text-center py-8"><p className="text-sm font-bold text-muted-foreground" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>لا توجد عمليات بعد</p></div>
                            return tl.slice(0, 15).map((item, idx) => (
                              <div key={`${item.t}-${item.id}`} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/40 hover:bg-white/90 dark:hover:bg-slate-800/60 transition-all border border-slate-100 dark:border-slate-800">
                                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm', item.color)}>{item.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px] font-bold" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{item.label}</Badge><span className="text-[10px] text-muted-foreground font-medium">{formatDate(item.date)}</span></div>
                                  {item.detail && <p className="text-[13px] mt-1 font-medium text-slate-700 dark:text-slate-300 truncate" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{item.detail}</p>}
                                </div>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    </motion.div>
                    </>
                    )})()}
                  </TabsContent>

                  {/* ═══ VISITS ═══ */}
                  <TabsContent value="visits" className="space-y-3 mt-3">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-2"><Stethoscope size={15} className="text-violet-500" /> الزيارات</h3><Button size="sm" className="rounded-xl bg-violet-600 text-white h-8 text-xs" onClick={() => { setProfileVisitType('checkup'); setProfileVisitPrice(''); setProfileVisitNotes(''); setProfileVisitDate(''); setShowAddVisitProfile(true) }}><Plus size={12} className="ml-1" /> زيارة</Button></div>
                    {showAddVisitProfile && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 space-y-2">
                        <div className="grid grid-cols-2 gap-2">{VISIT_TYPES.slice(0, 3).map(vt => (<motion.button key={vt.id} whileTap={{ scale: 0.95 }} onClick={() => setProfileVisitType(vt.id)} className={cn('flex items-center gap-1.5 p-2 rounded-xl border-2 text-xs font-bold transition-all', profileVisitType === vt.id ? 'border-violet-500 bg-violet-100 dark:bg-violet-900/30 text-violet-700' : 'border-transparent bg-muted/50 text-muted-foreground')}><span>{vt.emoji}</span>{vt.label}</motion.button>))}</div>
                        <div className="grid grid-cols-2 gap-2"><div><Label className="text-[10px] font-bold">السعر (ج.م)</Label><Input type="number" value={profileVisitPrice} onChange={e => setProfileVisitPrice(e.target.value)} placeholder="0" className="input-luxury rounded-xl h-9 mt-0.5" /></div><div><Label className="text-[10px] font-bold">ملاحظات</Label><Input value={profileVisitNotes} onChange={e => setProfileVisitNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-9 mt-0.5" /></div></div>
                        <div><Label className="text-[10px] font-bold text-cyan-600 flex items-center gap-1"><Calendar size={10} /> تاريخ الزيارة (اختياري)</Label><Input type="date" value={profileVisitDate || cairoTodayInput()} onChange={e => setProfileVisitDate(e.target.value)} className="rounded-xl h-9 text-xs mt-0.5 border-cyan-200 dark:border-cyan-800" placeholder="اتركه فارغاً لتاريخ اليوم" /></div>
                        <div className="flex gap-2"><Button size="sm" className="rounded-xl bg-violet-600 text-white" onClick={async () => { const vDate = profileVisitDate || cairoTodayInput(); await addItem('/visits', { patientId: selectedPatient.id, type: profileVisitType, notes: profileVisitNotes || undefined, date: vDate }, setVisits); const vPrice = parseFloat(profileVisitPrice) || 0; if (vPrice > 0) { const cat = getVisitCategory(profileVisitType); await addItem('/finance/transactions', { type: 'income', category: cat, amount: vPrice, description: `${cat} - ${selectedPatient.name}`, date: vDate }, setTransactions); } setShowAddVisitProfile(false); setProfileVisitPrice(''); setProfileVisitNotes(''); setProfileVisitDate(''); try { const txnRes = await apiFetch<any>('/finance/transactions?limit=100000'); const dbTxns = txnRes?.transactions || []; if (dbTxns.length > 0) setTransactions(dbTxns) } catch {} toast.success('تم إضافة الزيارة') }}>حفظ</Button><Button variant="ghost" size="sm" onClick={() => setShowAddVisitProfile(false)}>إلغاء</Button></div>
                      </motion.div>
                    )}
                    {visits.filter(v => v.patientId === selectedPatient.id).length === 0 && !showAddVisitProfile && <p className="text-center text-muted-foreground text-xs py-6">لا توجد زيارات</p>}
                    {visits.filter(v => v.patientId === selectedPatient.id).map(v => { const vt = VISIT_TYPES.find(t => t.id === v.type); return <Card key={v.id} className="border border-slate-200 dark:border-slate-800 p-3">{editingVisitId === v.id ? (<div className="space-y-2 p-2 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-300"><div className="grid grid-cols-2 gap-2"><Select value={editVisitForm.type} onValueChange={val => setEditVisitForm(f => ({ ...f, type: val }))}><SelectTrigger className="rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{VISIT_TYPES.slice(0,3).map(vt => <SelectItem key={vt.id} value={vt.id}>{vt.emoji} {vt.label}</SelectItem>)}</SelectContent></Select><Input value={editVisitForm.notes} onChange={e => setEditVisitForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات..." className="input-luxury rounded-xl h-8 text-xs" /></div><div><Label className="text-[10px]">السعر</Label><Input type="number" value={editVisitForm.price} onChange={e => setEditVisitForm(f => ({ ...f, price: e.target.value }))} className="input-luxury rounded-xl h-8 text-xs" /></div><div className="flex gap-2"><Button size="sm" className="rounded-xl bg-violet-600 text-white text-xs h-7" onClick={async () => { try { await apiFetch(`/visits/${v.id}`, { method: 'PUT', body: JSON.stringify({ type: editVisitForm.type, notes: editVisitForm.notes || undefined }) }); const oldCat = getVisitCategory(v.type); const newCat = getVisitCategory(editVisitForm.type); const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === oldCat); if (relatedTx) { const newPrice = parseFloat(editVisitForm.price) || relatedTx.amount; await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'PUT', body: JSON.stringify({ category: newCat, amount: newPrice, description: `${newCat} - ${selectedPatient!.name}` }) }); setTransactions(prev => prev.map(t => t.id === relatedTx.id ? { ...t, category: newCat, amount: newPrice, description: `${newCat} - ${selectedPatient!.name}` } : t)); } setVisits(prev => prev.map(vv => vv.id === v.id ? { ...vv, type: editVisitForm.type, notes: editVisitForm.notes || undefined } : vv)); setEditingVisitId(null); toast.success('تم التعديل') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setEditingVisitId(null)}>إلغاء</Button></div></div>) : (<div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={cn('p-2 rounded-lg text-white', vt?.bg || 'bg-gray-500')}>{vt?.emoji || '📝'}</div><div><div className="flex items-center gap-1.5"><Badge className={cn('text-white text-[8px]', vt?.bg || 'bg-gray-500')}>{vt?.label || v.type}</Badge><span className="text-[9px] text-muted-foreground">{formatDate(v.date)}</span></div>{v.notes && <p className="text-[11px] text-muted-foreground mt-0.5">{v.notes}</p>}</div></div><div className="flex gap-0.5"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingVisitId(v.id); setEditVisitForm({ type: v.type, notes: v.notes || '', price: String(transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === getVisitCategory(v.type))?.amount || '') }) }}><Edit3 size={10} className="text-violet-500" /></Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { const cat = getVisitCategory(v.type); const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === cat); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/visits/${v.id}`, { method: 'DELETE' }); setVisits(prev => prev.filter(vv => vv.id !== v.id)); toast.success('تم الحذف') } catch { toast.error('خطأ') } }}><Trash2 size={10} className="text-red-500" /></Button></div></div>)}</Card> })}
                  </TabsContent>

                  {/* ═══ SESSIONS ═══ */}
                  <TabsContent value="sessions" className="space-y-3 mt-3">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-2"><Zap size={15} className="text-orange-500" /> الجلسات</h3><Button size="sm" className="rounded-xl bg-orange-500 text-white h-8 text-xs" onClick={() => setShowAddSessionProfile(true)}><Plus size={12} className="ml-1" /> جلسة</Button></div>
                    {showAddSessionProfile && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 space-y-2">
                        {services.length > 0 && <div><Label className="text-[10px] font-bold">الخدمة</Label><Select value={profileSessionServiceId} onValueChange={setProfileSessionServiceId}><SelectTrigger className="rounded-xl h-9 mt-0.5 text-xs"><SelectValue placeholder="اختر الخدمة..." /></SelectTrigger><SelectContent>{services.filter(s => s.active).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>}
                        <div className="grid grid-cols-2 gap-2"><div><Label className="text-[10px] font-bold">السعر (ج.م)</Label><Input type="number" value={profileSessionPrice} onChange={e => setProfileSessionPrice(e.target.value)} placeholder="0" className="input-luxury rounded-xl h-9 mt-0.5" /></div><div><Label className="text-[10px] font-bold">ملاحظات</Label><Input value={profileSessionNotes} onChange={e => setProfileSessionNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-9 mt-0.5" /></div></div>
                        <div><Label className="text-[10px] font-bold text-cyan-600 flex items-center gap-1"><Calendar size={10} /> تاريخ الجلسة (اختياري)</Label><Input type="date" value={profileSessionDate} onChange={e => setProfileSessionDate(e.target.value)} className="rounded-xl h-9 text-xs mt-0.5 border-cyan-200 dark:border-cyan-800" placeholder="اتركه فارغاً لتاريخ اليوم" /></div>
                        <div className="flex gap-2"><Button size="sm" className="rounded-xl bg-orange-500 text-white" onClick={async () => { const sDate = profileSessionDate || undefined; const sPrice = parseFloat(profileSessionPrice) || 0; await addItem('/sessions', { patientId: selectedPatient.id, serviceId: profileSessionServiceId || undefined, status: 'completed', price: sPrice, paid: true, notes: profileSessionNotes || undefined, date: sDate }, setSessions); if (sPrice > 0) { const svcName = services.find(sv => sv.id === profileSessionServiceId)?.name || 'جلسة'; await addItem('/finance/transactions', { type: 'income', category: 'جلسات', amount: sPrice, description: `${svcName} - ${selectedPatient.name}`, date: sDate }, setTransactions); } setShowAddSessionProfile(false); setProfileSessionServiceId(''); setProfileSessionPrice(''); setProfileSessionNotes(''); setProfileSessionDate(''); try { const txnRes = await apiFetch<any>('/finance/transactions?limit=100000'); const dbTxns = txnRes?.transactions || []; if (dbTxns.length > 0) setTransactions(dbTxns) } catch {} toast.success('تم إضافة الجلسة') }}>حفظ</Button><Button variant="ghost" size="sm" onClick={() => setShowAddSessionProfile(false)}>إلغاء</Button></div>
                      </motion.div>
                    )}
                    {sessions.filter(s => s.patientId === selectedPatient.id).length === 0 && !showAddSessionProfile && <p className="text-center text-muted-foreground text-xs py-6">لا توجد جلسات</p>}
                    {sessions.filter(s => s.patientId === selectedPatient.id).map(s => { const svc = services.find(sv => sv.id === s.serviceId); return <Card key={s.id} className="border border-slate-200 dark:border-slate-800 p-3">{editingSessionId === s.id ? (<div className="space-y-2 p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-300"><div className="grid grid-cols-2 gap-2"><div><Label className="text-[10px]">السعر</Label><Input type="number" value={editSessionForm.price} onChange={e => setEditSessionForm(f => ({ ...f, price: e.target.value }))} className="input-luxury rounded-xl h-8 text-xs" /></div><div><Label className="text-[10px]">الحالة</Label><Select value={editSessionForm.status} onValueChange={val => setEditSessionForm(f => ({ ...f, status: val }))}><SelectTrigger className="rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">مجدولة</SelectItem><SelectItem value="completed">مكتملة</SelectItem><SelectItem value="cancelled">ملغاة</SelectItem></SelectContent></Select></div></div><Input value={editSessionForm.notes} onChange={e => setEditSessionForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات..." className="input-luxury rounded-xl h-8 text-xs" /><div className="flex gap-2"><Button size="sm" className="rounded-xl bg-orange-500 text-white text-xs h-7" onClick={async () => { try { const newPrice = parseFloat(editSessionForm.price) || s.price; await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice, status: editSessionForm.status, notes: editSessionForm.notes || undefined }) }); const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && (t.category === 'جلسات' || t.category === 'ليزر')); if (relatedTx && newPrice !== s.price) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'PUT', body: JSON.stringify({ amount: newPrice }) }); setTransactions(prev => prev.map(t => t.id === relatedTx.id ? { ...t, amount: newPrice } : t)); } setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, price: newPrice, status: editSessionForm.status, notes: editSessionForm.notes || undefined } : ss)); setEditingSessionId(null); toast.success('تم التعديل') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setEditingSessionId(null)}>إلغاء</Button></div></div>) : (<div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={cn('p-2 rounded-lg', s.paid ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>{s.paid ? <CheckCircle className="text-emerald-600" size={14} /> : <Clock className="text-amber-600" size={14} />}</div><div><p className="font-bold text-xs">{svc?.name || 'جلسة'}</p><div className="flex items-center gap-1.5"><Badge variant="outline" className="text-[8px]">{s.status === 'completed' ? 'مكتملة' : s.status === 'cancelled' ? 'ملغاة' : 'مجدولة'}</Badge>{s.paid ? <span className="text-[8px] text-emerald-600 font-bold">مدفوعة</span> : <span className="text-[8px] text-amber-600 font-bold">غير مدفوعة</span>}</div>{s.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{s.notes}</p>}</div></div><div className="flex items-center gap-1"><div className="text-left"><p className="font-black text-xs text-orange-600">{formatCurrency(s.price)}</p><p className="text-[9px] text-muted-foreground">{formatDate(s.date)}</p>{!s.paid && <motion.button whileTap={{ scale: 0.9 }} onClick={() => markSessionPaid(s)} className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[8px] font-bold mt-0.5">دفع</motion.button>}</div><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { setEditingSessionId(s.id); setEditSessionForm({ price: String(s.price), notes: s.notes || '', status: s.status, paid: s.paid }) }}><Edit3 size={9} className="text-orange-500" /></Button><Button variant="ghost" size="icon" className="h-5 w-5" onClick={async () => { try { const sDateStr = s.date ? new Date(s.date).toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }) : ''; const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && (t.category === 'جلسات' || t.category === 'ليزر') && t.amount === s.price && (sDateStr ? new Date(t.date).toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }) === sDateStr : true)); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/sessions/${s.id}`, { method: 'DELETE' }); setSessions(prev => prev.filter(ss => ss.id !== s.id)); toast.success('تم الحذف') } catch { toast.error('خطأ') } }}><Trash2 size={9} className="text-red-500" /></Button></div></div>)}</Card> })}
                  </TabsContent>

                  {/* ═══ LASER ═══ */}
                  <TabsContent value="laser" className="space-y-3 mt-3">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-2"><Zap size={15} className="text-cyan-500" /> سجلات الليزر</h3></div>
                    {laserRecords.filter(l => l.patientId === selectedPatient.id).length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl mb-2">💎</motion.div><p className="text-muted-foreground text-xs">لا توجد سجلات ليزر</p><Button size="sm" className="mt-2 rounded-xl bg-gradient-to-l from-cyan-500 to-teal-600 text-white text-xs" onClick={() => { setActiveTab('laser'); setShowAddLaserRecord(true); setLaserFormPatientId(selectedPatient.id); setLaserFormPatientSearch(selectedPatient.name) }}><Plus size={12} className="ml-1" /> إنشاء سجل</Button></Card>}
                    {laserRecords.filter(l => l.patientId === selectedPatient.id).map(l => {
                      const areaInfo = BODY_AREAS.find(a => a.id === l.bodyArea || a.label === l.bodyArea)
                      const lSess = l.laserSessions || []
                      const laserSessCount = lSess.length || l._count?.laserSessions || 0
                      const progressPercent = l.totalSessions > 0 ? Math.min((laserSessCount / l.totalSessions) * 100, 100) : 0
                      const paidCount = lSess.filter(s => s.paid).length
                      const unpaidCount = lSess.filter(s => !s.paid).length
                      const totalSessionPaid = lSess.filter(s => s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
                      return (
                        <motion.div key={l.id} whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}>
                          <Card className="border-2 border-cyan-200 dark:border-cyan-800 p-3 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setActiveTab('laser'); setSelectedLaserRecordId(l.id); setLaserDetailTab('overview') }}>
                            <div className="flex items-center gap-3">
                              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md"><Zap size={16} /></motion.div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2"><span className="font-bold text-sm">{areaInfo?.label || l.bodyArea}</span><Badge className={cn('text-[8px]', l.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>{l.status === 'active' ? '🟢 نشط' : l.status === 'completed' ? '🔵 مكتمل' : l.status === 'paused' ? '⏸️ متوقف' : l.status}</Badge></div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">{l.skinType && <span>بشرة {l.skinType}</span>}{l.hairColor && <span>شعر {l.hairColor}</span>}{l.machineName && <span>| {l.machineName}</span>}</div>
                                {l.price > 0 && <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{formatCurrency(l.price)}/جلسة - إجمالي: {formatCurrency(l.totalPrice || l.price * l.totalSessions)}</p>}
                                <div className="mt-1.5"><div className="flex items-center justify-between text-[9px] mb-0.5"><span>{laserSessCount}/{l.totalSessions} جلسة</span><span>{Math.round(progressPercent)}%</span></div><Progress value={progressPercent} className="h-1.5" /></div>
                                {laserSessCount > 0 && <div className="flex items-center gap-2 mt-1 text-[9px]"><span className="text-emerald-600 font-bold">✅ {paidCount} مدفوعة</span>{unpaidCount > 0 && <span className="text-amber-600 font-bold">⏳ {unpaidCount} متبقية</span>}<span className="text-muted-foreground">({formatCurrency(totalSessionPaid)})</span></div>}
                              </div>
                              <div className="flex flex-col items-center gap-1"><Eye size={14} className="text-cyan-500" /><span className="text-[8px] text-cyan-500 font-bold">عرض</span></div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </TabsContent>

                  {/* ═══ REMINDERS ═══ */}
                  <TabsContent value="reminders" className="space-y-3 mt-3">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-2"><Bell size={15} className="text-rose-500" /> التذكيرات</h3><Button size="sm" className="rounded-xl bg-rose-500 text-white h-8 text-xs" onClick={() => { setReminderPatientId(selectedPatient.id); setShowAddReminder(true) }}><Plus size={12} className="ml-1" /> تذكير</Button></div>
                    {reminders.filter(r => r.patientId === selectedPatient.id).length === 0 && <p className="text-center text-muted-foreground text-xs py-6">لا توجد تذكيرات</p>}
                    {reminders.filter(r => r.patientId === selectedPatient.id).map(r => (
                      <Card key={r.id} className="border border-slate-200 dark:border-slate-800 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <div className={cn('p-1.5 rounded-lg mt-0.5', r.type === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' : r.type === 'important' ? 'bg-amber-100 dark:bg-amber-900/30' : r.type === 'followup' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30')}><Bell size={12} className={r.type === 'urgent' ? 'text-red-500' : r.type === 'important' ? 'text-amber-500' : r.type === 'followup' ? 'text-blue-500' : 'text-emerald-500'} /></div>
                            <div><p className="font-bold text-xs">{r.title}</p>{r.description && <p className="text-[10px] text-muted-foreground">{r.description}</p>}<div className="flex items-center gap-2 mt-1"><Badge variant="outline" className="text-[8px]">{r.type === 'urgent' ? 'عاجل' : r.type === 'important' ? 'مهم' : r.type === 'followup' ? 'متابعة' : 'عام'}</Badge><span className="text-[9px] text-muted-foreground">{formatDate(r.date)}</span><Badge variant="outline" className={cn('text-[8px]', r.status === 'pending' ? 'border-amber-300 text-amber-600' : r.status === 'completed' ? 'border-emerald-300 text-emerald-600' : 'border-red-300 text-red-600')}>{r.status === 'pending' ? 'قيد الانتظار' : r.status === 'completed' ? 'مكتمل' : r.status}</Badge></div></div>
                          </div>
                          <div className="flex gap-0.5">
                            {r.status === 'pending' && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { await apiFetch(`/reminders/${r.id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) }); setReminders(prev => prev.map(rm => rm.id === r.id ? { ...rm, status: 'completed' } : rm)); toast.success('تم إكمال التذكير') } catch { toast.error('خطأ') } }}><CheckCircle size={10} className="text-emerald-500" /></Button>}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem('/reminders', r.id, setReminders)}><Trash2 size={10} className="text-red-500" /></Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* ═══ FINANCE ═══ */}
                  <TabsContent value="finance" className="space-y-3 mt-3">
                    <h3 className="font-bold text-sm flex items-center gap-2"><DollarSign size={15} className="text-emerald-500" /> الملخص المالي</h3>
                    {(() => {
                      const pSessions = sessions.filter(s => s.patientId === selectedPatient.id);
                      const sessPaid = pSessions.filter(s => s.paid).reduce((a, s) => a + s.price, 0);
                      const sessUnpaid = pSessions.filter(s => !s.paid).reduce((a, s) => a + s.price, 0);
                      const pLaserRecords = laserRecords.filter(r => r.patientId === selectedPatient.id);
                      const pLaserSessions = pLaserRecords.flatMap(r => (r.laserSessions || []));
                      const laserPaid = pLaserSessions.filter(s => s.paid).reduce((a, s) => a + (s.price || 0), 0);
                      const laserUnpaid = pLaserSessions.filter(s => !s.paid).reduce((a, s) => a + (s.price || 0), 0);
                      const pTransactions = transactions.filter(t => t.description?.includes(selectedPatient.name));
                      const pIncome = pTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
                      const pExpenses = pTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
                      const combinedPaid = sessPaid + laserPaid;
                      const combinedUnpaid = sessUnpaid + laserUnpaid;
                      const visitIncome = pTransactions.filter(t => t.type === 'income' && (t.category === 'كشف' || t.category === 'إعادة')).reduce((a, t) => a + t.amount, 0);
                      const sessionIncome = pTransactions.filter(t => t.type === 'income' && t.category === 'جلسات').reduce((a, t) => a + t.amount, 0);
                      const laserIncome = pTransactions.filter(t => t.type === 'income' && t.category === 'ليزر').reduce((a, t) => a + t.amount, 0);
                      return (<>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"><p className="text-[9px] text-muted-foreground">إجمالي الإيرادات</p><p className="text-sm font-black text-emerald-600">{formatCurrency(pIncome)}</p></div>
                          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"><p className="text-[9px] text-muted-foreground">المدفوع الكلي</p><p className="text-sm font-black text-blue-600">{formatCurrency(combinedPaid)}</p></div>
                          <div className="p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"><p className="text-[9px] text-muted-foreground">غير المدفوع الكلي</p><p className="text-sm font-black text-red-600">{formatCurrency(combinedUnpaid)}</p></div>
                          <div className="p-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20"><p className="text-[9px] text-muted-foreground">إجمالي الجلسات</p><p className="text-sm font-black text-violet-600">{pSessions.length + pLaserSessions.length}</p></div>
                        </div>
                        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
                          <div className="bg-gradient-to-l from-slate-600 to-slate-700 p-2 flex items-center gap-2"><Receipt size={14} className="text-white" /><p className="text-xs text-white font-bold">تفصيل الإيرادات</p></div>
                          <CardContent className="p-2 space-y-1.5">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20"><div className="flex items-center gap-2"><Stethoscope size={12} className="text-violet-500" /><span className="text-xs">كشف/إعادة</span></div><span className="font-bold text-xs text-violet-600">{formatCurrency(visitIncome)}</span></div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20"><div className="flex items-center gap-2"><Zap size={12} className="text-orange-500" /><span className="text-xs">جلسات عادية</span><span className="text-[9px] text-muted-foreground">({pSessions.filter(s => s.paid).length} مدفوعة / {pSessions.filter(s => !s.paid).length} متبقية)</span></div><span className="font-bold text-xs text-orange-600">{formatCurrency(sessPaid)}<span className="text-amber-600"> / {formatCurrency(sessUnpaid)}</span></span></div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20"><div className="flex items-center gap-2"><Zap size={12} className="text-cyan-500" /><span className="text-xs">ليزر</span><span className="text-[9px] text-muted-foreground">({pLaserSessions.filter(s => s.paid).length} مدفوعة / {pLaserSessions.filter(s => !s.paid).length} متبقية)</span></div><span className="font-bold text-xs text-cyan-600">{formatCurrency(laserPaid)}<span className="text-amber-600"> / {formatCurrency(laserUnpaid)}</span></span></div>
                            <Separator />
                            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20"><span className="text-xs font-bold">الإجمالي المدفوع</span><span className="font-black text-sm text-emerald-600">{formatCurrency(combinedPaid)}</span></div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20"><span className="text-xs font-bold">الإجمالي المتبقي</span><span className="font-black text-sm text-amber-600">{formatCurrency(combinedUnpaid)}</span></div>
                          </CardContent>
                        </Card>
                      </>)
                    })()}
                    <h4 className="font-bold text-xs flex items-center gap-2 mt-2"><FileText size={13} className="text-slate-500" /> سجل المعاملات</h4>
                    <div className="space-y-1.5">{transactions.filter(t => t.description?.includes(selectedPatient.name)).slice(0, 20).map(t => <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50"><div className="flex items-center gap-2"><div className={cn('p-1 rounded', t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30')}><DollarSign className={t.type === 'income' ? 'text-emerald-600' : 'text-red-600'} size={10} /></div><div><p className="text-[10px] font-medium">{t.description || t.category}</p><div className="flex items-center gap-1.5"><Badge className={cn('text-[7px] px-1', t.category === 'ليزر' ? 'bg-cyan-100 text-cyan-700' : t.category === 'كشف' ? 'bg-violet-100 text-violet-700' : t.category === 'إعادة' ? 'bg-blue-100 text-blue-700' : t.category === 'جلسات' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700')}>{t.category}</Badge><span className="text-[8px] text-muted-foreground">{formatDate(t.date)}</span></div></div></div><div className="flex items-center gap-1"><span className={cn('text-xs font-bold', t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span><Button variant="ghost" size="icon" className="h-5 w-5" onClick={async () => { try { await apiFetch(`/finance/transactions/${t.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(tx => tx.id !== t.id)); toast.success('تم حذف المعاملة المالية') } catch { toast.error('خطأ في الحذف') } }}><Trash2 size={9} className="text-red-400" /></Button></div></div>)}</div>
                  </TabsContent>

                  {/* ═══ NOTES — Premium Professional Design ═══ */}
                  <TabsContent value="notes" className="space-y-4 mt-4">
                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">
                          <FileText size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>الملاحظات</h3>
                          <p className="text-[11px] text-muted-foreground font-medium">{notes.filter(n => n.patientId === selectedPatient.id).length} ملاحظة مسجلة</p>
                        </div>
                      </div>
                    </div>

                    {/* Add Note Input — Premium Card */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 border-2 border-amber-200/70 dark:border-amber-800/50 p-4 shadow-md">
                      <div className="absolute top-0 left-0 w-24 h-24 bg-amber-200/20 dark:bg-amber-700/10 rounded-full -translate-x-8 -translate-y-8 blur-2xl" />
                      <div className="relative z-10">
                        <Label className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                          <Sparkles size={14} /> إضافة ملاحظة جديدة
                        </Label>
                        <div className="flex gap-2">
                          <Textarea value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="اكتب ملاحظتك هنا... اضغط Enter للحفظ" className="flex-1 rounded-xl min-h-[52px] text-sm font-medium border-2 border-amber-200 dark:border-amber-800 focus:border-amber-400 focus:ring-amber-400/20 bg-white/80 dark:bg-slate-900/60 resize-none" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif", fontSize: '14px' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && quickNote.trim() && selectedPatient) { e.preventDefault(); const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: selectedPatient.id, section: 'patient' }, setNotes) } }} />
                          <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-300/30 dark:shadow-amber-900/30 flex items-center gap-1.5 text-sm self-end" onClick={() => { if (quickNote.trim() && selectedPatient) { const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: selectedPatient.id, section: 'patient' }, setNotes) } }}>
                            <Plus size={16} /> إضافة
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Notes List */}
                    {notes.filter(n => n.patientId === selectedPatient.id).length === 0 && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">📝</motion.div>
                        <p className="text-lg font-bold text-slate-600 dark:text-slate-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>لا توجد ملاحظات بعد</p>
                        <p className="text-sm text-muted-foreground mt-1">ابدأ بإضافة ملاحظتك الأولى أعلاه</p>
                      </motion.div>
                    )}
                    <div className="space-y-3">
                      {notes.filter(n => n.patientId === selectedPatient.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((n, idx) => {
                        const noteColors = [
                          { border: 'border-indigo-200 dark:border-indigo-800/60', bg: 'from-indigo-50 via-white to-blue-50 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-blue-950/20', accent: 'bg-indigo-500', accentLight: 'bg-indigo-100 dark:bg-indigo-900/30', accentText: 'text-indigo-600 dark:text-indigo-400' },
                          { border: 'border-violet-200 dark:border-violet-800/60', bg: 'from-violet-50 via-white to-purple-50 dark:from-violet-950/20 dark:via-slate-900/40 dark:to-purple-950/20', accent: 'bg-violet-500', accentLight: 'bg-violet-100 dark:bg-violet-900/30', accentText: 'text-violet-600 dark:text-violet-400' },
                          { border: 'border-emerald-200 dark:border-emerald-800/60', bg: 'from-emerald-50 via-white to-teal-50 dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-teal-950/20', accent: 'bg-emerald-500', accentLight: 'bg-emerald-100 dark:bg-emerald-900/30', accentText: 'text-emerald-600 dark:text-emerald-400' },
                          { border: 'border-cyan-200 dark:border-cyan-800/60', bg: 'from-cyan-50 via-white to-sky-50 dark:from-cyan-950/20 dark:via-slate-900/40 dark:to-sky-950/20', accent: 'bg-cyan-500', accentLight: 'bg-cyan-100 dark:bg-cyan-900/30', accentText: 'text-cyan-600 dark:text-cyan-400' },
                          { border: 'border-rose-200 dark:border-rose-800/60', bg: 'from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-slate-900/40 dark:to-pink-950/20', accent: 'bg-rose-500', accentLight: 'bg-rose-100 dark:bg-rose-900/30', accentText: 'text-rose-600 dark:text-rose-400' },
                          { border: 'border-amber-200 dark:border-amber-800/60', bg: 'from-amber-50 via-white to-yellow-50 dark:from-amber-950/20 dark:via-slate-900/40 dark:to-yellow-950/20', accent: 'bg-amber-500', accentLight: 'bg-amber-100 dark:bg-amber-900/30', accentText: 'text-amber-600 dark:text-amber-400' },
                        ]
                        const color = noteColors[idx % noteColors.length]
                        const isEditing = editingNoteId === n.id
                        const timeAgo = (() => { const diff = Date.now() - new Date(n.createdAt).getTime(); const mins = Math.floor(diff / 60000); if (mins < 1) return 'الآن'; if (mins < 60) return `منذ ${mins} دقيقة`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `منذ ${hrs} ساعة`; const days = Math.floor(hrs / 24); return `منذ ${days} يوم` })()

                        return (
                          <motion.div key={n.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                            className={cn('relative overflow-hidden rounded-2xl border-2 bg-gradient-to-l p-0 shadow-sm hover:shadow-md transition-all', color.border, color.bg)}>
                            {/* Side accent bar */}
                            <div className={cn('absolute top-0 right-0 w-1.5 h-full rounded-r-2xl', color.accent)} />
                            <div className="p-4 pr-5">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <Textarea value={editingNoteContent} onChange={e => setEditingNoteContent(e.target.value)} className="rounded-xl min-h-[60px] text-sm font-medium border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 bg-white dark:bg-slate-900 resize-none" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif", fontSize: '14px' }} autoFocus onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent }) }).then(() => { setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent } : nn)); setEditingNoteId(null); toast.success('تم التعديل بنجاح ✓') }).catch(() => toast.error('خطأ في التعديل')) } }} />
                                  <div className="flex gap-2">
                                    <Button size="sm" className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md h-8 px-4" onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent }) }); setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent } : nn)); setEditingNoteId(null); toast.success('تم التعديل بنجاح ✓') } catch { toast.error('خطأ في التعديل') } }}>
                                      <CheckCircle size={14} className="ml-1" /> حفظ
                                    </Button>
                                    <Button variant="ghost" size="sm" className="rounded-xl h-8 text-xs" onClick={() => setEditingNoteId(null)}>إلغاء</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-3">
                                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm', color.accent)}>
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-semibold leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif", lineHeight: '1.8' }}>{n.content}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-lg', color.accentLight, color.accentText)}>{timeAgo}</span>
                                      <span className="text-[11px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1 flex-shrink-0">
                                    <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }} className="h-8 w-8 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all" onClick={() => { setEditingNoteId(n.id); setEditingNoteContent(n.content) }}>
                                      <Edit3 size={14} className="text-blue-600 dark:text-blue-400" />
                                    </motion.button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }} className="h-8 w-8 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
                                          <Trash2 size={14} className="text-red-500 dark:text-red-400" />
                                        </motion.button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف الملاحظة</AlertDialogTitle>
                                          <AlertDialogDescription>هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'DELETE' }); setNotes(prev => prev.filter(nn => nn.id !== n.id)); toast.success('تم حذف الملاحظة ✓') } catch { toast.error('خطأ في الحذف') } }}>حذف</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
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
                      {isDoctor && <Button variant="outline" className="rounded-xl" onClick={() => setShowAddLaserPackage(true)}><Package size={14} className="ml-1" /> باقة</Button>}
                    </div>
                  </div>
                </div>

                {/* Laser Stats - 4 cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-lg"><Activity className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">سجلات نشطة</p><p className="text-xl font-bold">{laserRecords.filter(r => r.status === 'active').length}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg"><Zap className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">جلسات اليوم</p><p className="text-xl font-bold">{laserHairSessions.filter(s => getLocalDateStr(s.date) === todayStr).length}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg"><DollarSign className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">إيراد الليزر</p><p className="text-xl font-bold">{formatCurrency(laserRevenue)}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg"><Package className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">باقات نشطة</p><p className="text-xl font-bold">{laserPackages.filter(p => p.active).length}</p></div></div></motion.div>
                </div>

                {/* ═══ Laser Sub-section Navigation ═══ */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'records', icon: '📋', label: 'السجلات', color: 'from-cyan-500 to-cyan-700', count: laserRecords.length },
                    { id: 'sessions', icon: '⚡', label: 'الجلسات', color: 'from-violet-500 to-violet-700', count: laserHairSessions.length },
                    { id: 'packages', icon: '📦', label: 'الباقات', color: 'from-amber-500 to-amber-700', count: laserPackages.length },
                    { id: 'bodymap', icon: '🗺️', label: 'المناطق', color: 'from-emerald-500 to-emerald-700', count: BODY_AREAS.length },
                    { id: 'finance', icon: '💰', label: 'المالي', color: 'from-green-500 to-green-700', count: 0 },
                    { id: 'settings', icon: '⚙️', label: 'الأجهزة', color: 'from-slate-500 to-slate-700', count: laserSettings.length },
                  ].map(tab => (
                    <motion.button key={tab.id} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03, y: -2 }}
                      onClick={() => setLaserSubTab(tab.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all text-white shadow-lg',
                        laserSubTab === tab.id
                          ? `bg-gradient-to-br ${tab.color} border-white/30 scale-105 shadow-xl`
                          : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="text-[10px] font-bold">{tab.label}</span>
                      {tab.count > 0 && <Badge className={cn('text-[8px] px-1 py-0', laserSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground')}>{tab.count}</Badge>}
                    </motion.button>
                  ))}
                </div>

                {/* ═══ Laser Records - COMPREHENSIVE PATIENT FILE SYSTEM ═══ */}
                {laserSubTab === 'records' && (<div className="space-y-3 mt-4">
                    {/* ─── Detail View for Selected Laser Record ─── */}
                    {selectedLaserRecordId ? (() => {
                      const rec = laserRecords.find(r => r.id === selectedLaserRecordId)
                      if (!rec) return <Card className="card-luxury p-8 text-center"><p className="text-muted-foreground">لم يتم العثور على السجل</p><Button className="mt-3" onClick={() => setSelectedLaserRecordId(null)}>رجوع</Button></Card>
                      const pat = rec.patient || patients.find(pt => pt.id === rec.patientId)
                      const areaInfo = BODY_AREAS.find(a => a.id === rec.bodyArea || a.label === rec.bodyArea)
                      const laserSess = (rec.laserSessions || []).sort((a, b) => (b.sessionNumber || 0) - (a.sessionNumber || 0))
                      const sessCount = laserSess.length || rec._count?.laserSessions || 0
                      const progressPct = rec.totalSessions > 0 ? Math.min((sessCount / rec.totalSessions) * 100, 100) : 0
                      const remainingSessions = Math.max(rec.totalSessions - sessCount, 0)
                      // Calculate payments from actual laser sessions
                      const totalPaidFromSessions = laserSess.filter(s => s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
                      const totalUnpaidFromSessions = laserSess.filter(s => !s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
                      const grandTotal = rec.totalPrice || (rec.price * rec.totalSessions)
                      const totalPaid = rec.paid ? grandTotal : totalPaidFromSessions
                      const totalRemaining = rec.paid ? 0 : Math.max(grandTotal - totalPaid, 0)
                      const isEditingRecord = editingLaserRecordId === rec.id
                      const skinInfo = SKIN_TYPES.find(s => s.id === rec.skinType)
                      const hairInfo = HAIR_COLORS.find(h => h.id === rec.hairColor)

                      return (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                          {/* ─── Animated Header ─── */}
                          <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 p-5 shadow-xl">
                            <div className="absolute inset-0 opacity-15">
                              <motion.div animate={{ x: [0, 120, 0], y: [0, -60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                              <motion.div animate={{ x: [0, -90, 0], y: [0, 70, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }} className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-300/20 rounded-full blur-3xl" />
                            </div>
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-3">
                                <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05, x: -3 }} onClick={() => { setSelectedLaserRecordId(null); setLaserDetailTab('overview') }} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-white text-sm font-bold border border-white/20 hover:bg-white/25 transition-all">
                                  <ChevronDown size={16} className="rotate-90" /> رجوع
                                </motion.button>
                                <div className="flex gap-2">
                                  <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => { setEditingLaserRecordId(isEditingRecord ? null : rec.id); setEditLaserRecordForm({ bodyArea: rec.bodyArea, skinType: rec.skinType || '', hairColor: rec.hairColor || '', hairDensity: rec.hairDensity || '', totalSessions: String(rec.totalSessions), price: String(rec.price), totalPrice: String(rec.totalPrice), paid: rec.paid, machineName: rec.machineName || '', energy: String(rec.energy || ''), pulse: rec.pulse || '', status: rec.status, notes: rec.notes || '' }) }} className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs font-bold border border-white/20 hover:bg-white/25 transition-all flex items-center gap-1.5">
                                    {isEditingRecord ? <><X size={12} /> إلغاء</> : <><Edit3 size={12} /> تعديل</>}
                                  </motion.button>
                                  <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => { setShowAddLaserSessionForm(true); setNewLaserSessionForm({ energy: String(rec.energy || ''), pulse: rec.pulse || '', painLevel: '', reaction: '', notes: '', date: getLocalDateStr() }) }} className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs font-bold border border-white/20 hover:bg-white/25 transition-all flex items-center gap-1.5">
                                    <Plus size={12} /> جلسة جديدة
                                  </motion.button>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-5xl">💎</motion.div>
                                <div className="flex-1">
                                  <h2 className="text-2xl font-black text-white">{pat?.name || 'مريض'}</h2>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    {pat?.fileNumber && <Badge className="bg-white/20 text-white border-white/30 text-xs">#{pat.fileNumber}</Badge>}
                                    <Badge className={cn('text-xs', rec.status === 'active' ? 'bg-emerald-400/80 text-white' : rec.status === 'completed' ? 'bg-blue-400/80 text-white' : 'bg-amber-400/80 text-white')}>{rec.status === 'active' ? '🟢 نشط' : rec.status === 'completed' ? '🔵 مكتمل' : rec.status === 'paused' ? '⏸️ متوقف' : rec.status}</Badge>
                                    <Badge className="bg-white/20 text-white border-white/30 text-xs">{areaInfo?.label || rec.bodyArea}</Badge>
                                    {rec.machineName && <Badge className="bg-white/20 text-white border-white/30 text-xs">⚙️ {rec.machineName}</Badge>}
                                  </div>
                                </div>
                                <div className="text-left">
                                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }} className="text-4xl font-black text-white">{Math.round(progressPct)}%</motion.div>
                                  <p className="text-cyan-200 text-[10px]">{sessCount} من {rec.totalSessions} جلسة</p>
                                </div>
                              </div>
                              <div className="mt-3"><Progress value={progressPct} className="h-3 bg-white/20 [&>div]:bg-gradient-to-l [&>div]:from-white [&>div]:to-cyan-200 rounded-full" /></div>
                            </div>
                          </motion.div>

                          {/* ─── Quick Stats ─── */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { icon: <Zap size={16} />, label: 'الجلسات المتبقية', value: remainingSessions, gradient: 'from-violet-500 to-purple-600', emoji: '⚡' },
                              { icon: <DollarSign size={16} />, label: 'المدفوع', value: formatCurrency(totalPaid), gradient: 'from-emerald-500 to-teal-600', emoji: '✅' },
                              { icon: <Receipt size={16} />, label: 'المتبقي', value: formatCurrency(totalRemaining), gradient: 'from-amber-500 to-orange-600', emoji: '⏳' },
                              { icon: <Package size={16} />, label: 'سعر الجلسة', value: formatCurrency(rec.price), gradient: 'from-cyan-500 to-blue-600', emoji: '💰' },
                            ].map((stat, idx) => (
                              <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }} whileHover={{ scale: 1.03, y: -2 }} className="relative overflow-hidden">
                                <div className={cn('p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg', stat.gradient)}>
                                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }} className="absolute top-1 left-1 text-2xl opacity-15">{stat.emoji}</motion.div>
                                  <div className="relative z-10 flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">{stat.icon}</div>
                                    <div><p className="text-[9px] text-white/70">{stat.label}</p><p className="text-base font-black">{stat.value}</p></div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* ─── Detail Sub-tabs ─── */}
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {[
                              { id: 'overview' as const, label: 'نظرة عامة', emoji: '📋', color: 'from-cyan-500 to-teal-600' },
                              { id: 'sessions' as const, label: 'سجل الجلسات', emoji: '⚡', color: 'from-violet-500 to-purple-600' },
                              { id: 'payments' as const, label: 'المدفوعات', emoji: '💰', color: 'from-emerald-500 to-green-600' },
                              { id: 'notes' as const, label: 'ملاحظات', emoji: '📝', color: 'from-amber-500 to-orange-600' },
                            ].map(tab => (
                              <motion.button key={tab.id} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03, y: -1 }} onClick={() => setLaserDetailTab(tab.id)} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap', laserDetailTab === tab.id ? `bg-gradient-to-l ${tab.color} text-white shadow-lg` : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
                                <span>{tab.emoji}</span> {tab.label}
                                {tab.id === 'sessions' && laserSess.length > 0 && <Badge className={cn('text-[8px] px-1', laserDetailTab === tab.id ? 'bg-white/20 text-white' : '')}>{laserSess.length}</Badge>}
                              </motion.button>
                            ))}
                          </div>

                          {/* ─── OVERVIEW TAB ─── */}
                          {laserDetailTab === 'overview' && (<div className="space-y-4">
                            {/* Patient & Treatment Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                <Card className="card-luxury overflow-hidden h-full">
                                  <div className="bg-gradient-to-l from-blue-500 to-indigo-600 p-3 flex items-center gap-2"><motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-xl">👤</motion.div><CardTitle className="text-sm text-white font-bold">بيانات المريض</CardTitle></div>
                                  <CardContent className="p-3 space-y-2">
                                    {pat && <><div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"><Users size={14} className="text-blue-500" /><div><p className="text-xs text-muted-foreground">الاسم</p><p className="font-bold text-sm">{pat.name}</p></div></div>
                                    {pat.phone && <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20"><Phone size={14} className="text-green-500" /><div><p className="text-xs text-muted-foreground">الهاتف</p><p className="font-bold text-sm" dir="ltr">{pat.phone}</p></div></div>}
                                    {pat.age && <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20"><Calendar size={14} className="text-purple-500" /><div><p className="text-xs text-muted-foreground">العمر</p><p className="font-bold text-sm">{pat.age} سنة</p></div></div>}
                                    {pat.gender && <div className="flex items-center gap-2 p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20"><Heart size={14} className="text-pink-500" /><div><p className="text-xs text-muted-foreground">الجنس</p><p className="font-bold text-sm">{pat.gender === 'male' ? 'ذكر' : pat.gender === 'female' ? 'أنثى' : pat.gender}</p></div></div>}</>}
                                    {pat?.phone && <motion.a href={`https://wa.me/${waPhone(pat.phone)}`} target="_blank" rel="noopener" whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-l from-green-500 to-emerald-600 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all"><Send size={14} /> واتساب</motion.a>}
                                  </CardContent>
                                </Card>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                <Card className="card-luxury overflow-hidden h-full">
                                  <div className="bg-gradient-to-l from-cyan-500 to-teal-600 p-3 flex items-center gap-2"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="text-xl">🔬</motion.div><CardTitle className="text-sm text-white font-bold">بيانات العلاج</CardTitle></div>
                                  <CardContent className="p-3 space-y-2">
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20"><MapPin size={14} className="text-cyan-500" /><div><p className="text-xs text-muted-foreground">منطقة العلاج</p><p className="font-bold text-sm">{areaInfo?.label || rec.bodyArea}</p></div></div>
                                    {rec.skinType && <div className={cn('flex items-center gap-2 p-2 rounded-lg border', skinInfo?.color || 'bg-muted/50')}><ThermometerSun size={14} className="text-amber-500" /><div><p className="text-xs text-muted-foreground">نوع البشرة</p><p className="font-bold text-sm">{skinInfo?.label || rec.skinType}</p></div></div>}
                                    {rec.hairColor && <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20"><div className={cn('w-4 h-4 rounded-full', hairInfo?.color || 'bg-gray-400')} /><div><p className="text-xs text-muted-foreground">لون الشعر</p><p className="font-bold text-sm">{hairInfo?.label || rec.hairColor}</p></div></div>}
                                    {rec.hairDensity && <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20"><Layers size={14} className="text-violet-500" /><div><p className="text-xs text-muted-foreground">كثافة الشعر</p><p className="font-bold text-sm">{rec.hairDensity === 'low' ? 'خفيف' : rec.hairDensity === 'medium' ? 'متوسط' : rec.hairDensity === 'high' ? 'كثيف' : rec.hairDensity}</p></div></div>}
                                    {rec.machineName && <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/20"><Settings size={14} className="text-slate-500" /><div><p className="text-xs text-muted-foreground">جهاز الليزر</p><p className="font-bold text-sm">{rec.machineName}</p></div></div>}
                                    {rec.energy && <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"><Zap size={14} className="text-yellow-500" /><div><p className="text-xs text-muted-foreground">الطاقة الافتراضية</p><p className="font-bold text-sm">{rec.energy} جول</p></div></div>}
                                    {rec.pulse && <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"><Activity size={14} className="text-indigo-500" /><div><p className="text-xs text-muted-foreground">النبض الافتراضي</p><p className="font-bold text-sm">{rec.pulse}</p></div></div>}
                                    {rec.notes && <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20"><StickyNote size={14} className="text-orange-500 mt-0.5" /><div><p className="text-xs text-muted-foreground">ملاحظات عامة</p><p className="text-sm">{rec.notes}</p></div></div>}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </div>

                            {/* Contraindications & Safety */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                              <Card className="card-luxury overflow-hidden border-2 border-red-200 dark:border-red-800/50">
                                <div className="bg-gradient-to-l from-red-500 to-rose-600 p-3 flex items-center gap-2"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }} className="text-xl">⚠️</motion.div><CardTitle className="text-sm text-white font-bold">موانع الاستخدام والاحتياطات</CardTitle></div>
                                <CardContent className="p-3">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {['حمل', 'رضاعة', 'أدوية حساسة للضوء', 'هرمونات/كورتيزون', 'أمراض جلدية نشطة', 'تاريخ ندبات', 'كريمات ريتينول (5 أيام)', 'حساسية ضوئية', 'مرض السكري (غير منضبط)', 'وخز حديث (أسبوعين)'].map(item => (
                                      <div key={item} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-red-50/50 dark:bg-red-900/10 text-[10px]"><AlertTriangle size={10} className="text-red-500 shrink-0" /><span className="text-muted-foreground">{item}</span></div>
                                    ))}
                                  </div>
                                  {pat?.medicalHistory && <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30"><p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">تاريخ طبي للمريض:</p><p className="text-xs">{pat.medicalHistory}</p></div>}
                                </CardContent>
                              </Card>
                            </motion.div>

                            {/* Patch Test & Next Session */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <Card className="card-luxury overflow-hidden">
                                  <div className="bg-gradient-to-l from-green-500 to-emerald-600 p-3 flex items-center gap-2"><motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} className="text-xl">🧪</motion.div><CardTitle className="text-sm text-white font-bold">اختبار البقعة (Patch Test)</CardTitle></div>
                                  <CardContent className="p-3 space-y-2">
                                    <p className="text-xs text-muted-foreground">يُنصح بإجراء اختبار بقعة قبل أول جلسة ليزر، خاصة للمرضى الجدد أو أصحاب البشرة الحساسة. يتم اختبار منطقة صغيرة ومراقبتها لمدة 24-48 ساعة.</p>
                                    <div className="flex items-center gap-2"><Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">✅ مطلوب قبل الجلسة الأولى</Badge></div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                <Card className="card-luxury overflow-hidden">
                                  <div className="bg-gradient-to-l from-indigo-500 to-blue-600 p-3 flex items-center gap-2"><motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-xl">📅</motion.div><CardTitle className="text-sm text-white font-bold">الجلسة القادمة</CardTitle></div>
                                  <CardContent className="p-3 space-y-2">
                                    {remainingSessions > 0 ? (<>
                                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"><p className="text-xs text-muted-foreground">الفترة الموصى بها بين الجلسات</p><p className="font-bold text-sm">4-6 أسابيع (حسب دورة نمو الشعر)</p></div>
                                      {rec.energy && <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">إعدادات موصى بها</p><p className="font-bold text-sm">⚡ طاقة: {rec.energy} جول | نبض: {rec.pulse || '-'}</p></div>}
                                      <p className="text-[10px] text-muted-foreground">💡 يُنصح بزيادة الطاقة تدريجياً 10-15% كل جلسة حسب تحمل المريض</p>
                                    </>) : <div className="text-center py-3"><motion.div animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl mb-2">🎉</motion.div><p className="font-bold text-sm text-emerald-600">تم الانتهاء من جميع الجلسات!</p></div>}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </div>

                            {/* Edit Record Form */}
                            {isEditingRecord && (
                              <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}>
                                <Card className="card-luxury border-2 border-cyan-300 dark:border-cyan-700 overflow-hidden">
                                  <div className="bg-gradient-to-l from-cyan-500 to-teal-600 p-3 flex items-center gap-2"><Edit3 size={16} className="text-white" /><CardTitle className="text-sm text-white font-bold">تعديل بيانات السجل</CardTitle></div>
                                  <CardContent className="p-3 space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      <div><Label className="text-xs font-bold">منطقة العلاج</Label><Select value={editLaserRecordForm.bodyArea} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, bodyArea: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent>{BODY_AREAS.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent></Select></div>
                                      <div><Label className="text-xs font-bold">نوع البشرة</Label><Select value={editLaserRecordForm.skinType} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, skinType: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue placeholder="اختار..." /></SelectTrigger><SelectContent>{SKIN_TYPES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                      <div><Label className="text-xs font-bold">لون الشعر</Label><Select value={editLaserRecordForm.hairColor} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, hairColor: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue placeholder="اختار..." /></SelectTrigger><SelectContent>{HAIR_COLORS.map(h => <SelectItem key={h.id} value={h.id}>{h.label}</SelectItem>)}</SelectContent></Select></div>
                                      <div><Label className="text-xs font-bold">كثافة الشعر</Label><Select value={editLaserRecordForm.hairDensity} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, hairDensity: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue placeholder="اختار..." /></SelectTrigger><SelectContent><SelectItem value="low">خفيف</SelectItem><SelectItem value="medium">متوسط</SelectItem><SelectItem value="high">كثيف</SelectItem></SelectContent></Select></div>
                                      <div><Label className="text-xs font-bold">عدد الجلسات</Label><Input type="number" value={editLaserRecordForm.totalSessions} onChange={e => setEditLaserRecordForm(p => ({ ...p, totalSessions: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">سعر الجلسة</Label><Input type="number" value={editLaserRecordForm.price} onChange={e => setEditLaserRecordForm(p => ({ ...p, price: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">الإجمالي</Label><Input type="number" value={editLaserRecordForm.totalPrice} onChange={e => setEditLaserRecordForm(p => ({ ...p, totalPrice: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">الجهاز</Label><Input value={editLaserRecordForm.machineName} onChange={e => setEditLaserRecordForm(p => ({ ...p, machineName: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">الحالة</Label><Select value={editLaserRecordForm.status} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, status: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">نشط</SelectItem><SelectItem value="completed">مكتمل</SelectItem><SelectItem value="paused">متوقف</SelectItem></SelectContent></Select></div>
                                    </div>
                                    <div className="flex items-center gap-3"><Label className="text-xs font-bold">تم الدفع</Label><Switch checked={editLaserRecordForm.paid} onCheckedChange={v => setEditLaserRecordForm(p => ({ ...p, paid: v }))} /></div>
                                    <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={editLaserRecordForm.notes} onChange={e => setEditLaserRecordForm(p => ({ ...p, notes: e.target.value }))} className="rounded-xl text-xs mt-1" rows={2} /></div>
                                    <div className="flex gap-2">
                                      <Button className="rounded-xl bg-gradient-to-l from-cyan-600 to-teal-600 text-white" onClick={async () => { try { await apiFetch(`/laser/records/${rec.id}`, { method: 'PUT', body: JSON.stringify({ bodyArea: editLaserRecordForm.bodyArea, skinType: editLaserRecordForm.skinType || undefined, hairColor: editLaserRecordForm.hairColor || undefined, hairDensity: editLaserRecordForm.hairDensity || undefined, totalSessions: parseInt(editLaserRecordForm.totalSessions) || 0, price: parseFloat(editLaserRecordForm.price) || 0, totalPrice: parseFloat(editLaserRecordForm.totalPrice) || 0, paid: editLaserRecordForm.paid, machineName: editLaserRecordForm.machineName || undefined, status: editLaserRecordForm.status, notes: editLaserRecordForm.notes || undefined }) }); setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, bodyArea: editLaserRecordForm.bodyArea, skinType: editLaserRecordForm.skinType, hairColor: editLaserRecordForm.hairColor, hairDensity: editLaserRecordForm.hairDensity, totalSessions: parseInt(editLaserRecordForm.totalSessions) || 0, price: parseFloat(editLaserRecordForm.price) || 0, totalPrice: parseFloat(editLaserRecordForm.totalPrice) || 0, paid: editLaserRecordForm.paid, machineName: editLaserRecordForm.machineName, status: editLaserRecordForm.status, notes: editLaserRecordForm.notes } : r)); toast.success('تم تحديث السجل ✅'); setEditingLaserRecordId(null) } catch { toast.error('خطأ في التحديث') } }}>حفظ التعديلات</Button>
                                      <Button variant="outline" className="rounded-xl" onClick={() => setEditingLaserRecordId(null)}>إلغاء</Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </div>)}

                          {/* ─── SESSIONS TAB ─── */}
                          {laserDetailTab === 'sessions' && (<div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-lg flex items-center gap-2"><Zap size={18} className="text-violet-500" /> سجل الجلسات</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{laserSess.length} جلسة</Badge>
                                <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => { setShowAddLaserSessionForm(true); setNewLaserSessionForm({ energy: String(rec.energy || ''), pulse: rec.pulse || '', painLevel: '', reaction: '', notes: '', date: getLocalDateStr() }) }} className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 text-white text-xs font-bold shadow-lg flex items-center gap-1"><Plus size={12} /> جلسة</motion.button>
                              </div>
                            </div>
                            {laserSess.length === 0 && <Card className="card-luxury p-6 text-center"><motion.div animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">⚡</motion.div><p className="font-bold mb-1">لا توجد جلسات مسجلة</p><p className="text-muted-foreground text-xs mb-3">ابدأ بتسجيل أول جلسة ليزر لهذا المريض</p><Button className="rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 text-white" onClick={() => { setShowAddLaserSessionForm(true); setNewLaserSessionForm({ energy: String(rec.energy || ''), pulse: rec.pulse || '', painLevel: '', reaction: '', notes: '', date: getLocalDateStr() }) }}><Plus size={14} className="ml-1" /> تسجيل جلسة</Button></Card>}

                            {laserSess.map((ls, idx) => {
                              const isEditing = editingLaserSessionId === ls.id
                              const isFirst = idx === 0
                              return (
                                <motion.div key={ls.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                                  <Card className={cn('section-card overflow-hidden transition-all', ls.paid ? 'border-r-4 border-r-emerald-400' : 'border-r-4 border-r-amber-400', isEditing ? 'ring-2 ring-violet-400 dark:ring-violet-600' : isFirst ? 'shadow-md' : '', isFirst && !ls.paid && 'border-2 border-amber-200 dark:border-amber-700', isFirst && ls.paid && 'border-2 border-emerald-200 dark:border-emerald-700')}>
                                    {/* Session Header */}
                                    <div className={cn('p-3 flex items-center justify-between gap-2', isEditing ? 'bg-violet-50 dark:bg-violet-950/30' : isFirst ? 'bg-gradient-to-l from-cyan-50/80 via-teal-50/50 to-emerald-50/80 dark:from-cyan-950/20 dark:via-teal-950/10 dark:to-emerald-950/20' : '')}>
                                      <div className="flex items-center gap-3">
                                        <motion.div animate={isFirst ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 2, repeat: isFirst ? Infinity : 0, repeatDelay: 2 }} className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md text-lg font-black', ls.paid ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-amber-400 to-orange-500')}>
                                          {ls.sessionNumber}
                                        </motion.div>
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-sm">الجلسة رقم {ls.sessionNumber}</p>
                                            {isFirst && <Badge className="bg-gradient-to-l from-cyan-500 to-teal-500 text-white text-[9px] border-0 shadow-sm">⭐ الأخيرة</Badge>}
                                            <Badge className={cn('text-[9px]', ls.paid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>{ls.paid ? '✅ مدفوعة' : '⏳ غير مدفوعة'}</Badge>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <Calendar size={10} /><span>{formatDate(ls.date)}</span>
                                            <DollarSign size={10} className="text-emerald-500" /><span className="font-bold text-emerald-600">{formatCurrency(ls.price || rec.price)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {!ls.paid && <motion.div whileTap={{ scale: 0.9 }}><Button size="sm" className="h-7 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-bold shadow-sm" onClick={async () => { try { await apiFetch(`/laser/sessions/${ls.id}`, { method: 'PUT', body: JSON.stringify({ paid: true, price: ls.price || rec.price }) }); const txnAmount = ls.price || rec.price; const txnDesc = `جلسة ليزر #${ls.sessionNumber} - ${pat?.name || 'مريض'} - ${areaInfo?.label || rec.bodyArea}`; const txnDate = ls.date || ls.createdAt || cairoISO(); try { const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }) }); const newTxn = txnRes?.transaction || txnRes?.data || txnRes; if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]); } else { setTransactions(prev => [...prev, { id: 'laser-' + Date.now(), type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }]); } } catch { setTransactions(prev => [...prev, { id: 'laser-' + Date.now(), type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }]); } setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, laserSessions: (r.laserSessions || []).map(s => s.id === ls.id ? { ...s, paid: true } : s) } : r)); toast.success('تم تأكيد الدفع ✅') } catch { toast.error('خطأ') } }}>💰 دفع</Button></motion.div>}
                                        <Button size="sm" variant="outline" className="h-7 px-2.5 rounded-lg text-violet-600 border-violet-200 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-[9px] font-bold" onClick={() => { setEditingLaserSessionId(isEditing ? null : ls.id); setEditLaserSessionForm({ energy: String(ls.energy || ''), pulse: ls.pulse || '', painLevel: String(ls.painLevel || ''), reaction: ls.reaction || '', notes: ls.notes || '', date: ls.date ? ls.date.split('T')[0] : '', price: String(ls.price ?? rec.price), paid: ls.paid }) }}><Edit3 size={10} className="ml-0.5" /> تعديل</Button>
                                        <Button size="sm" variant="outline" className="h-7 px-2.5 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[9px] font-bold" onClick={() => setDeleteLaserSessionConfirmId(ls.id)}><Trash2 size={10} className="ml-0.5" /> حذف</Button>
                                      </div>
                                    </div>
                                    {isEditing ? (
                                      <CardContent className="p-3 space-y-2 bg-violet-50/50 dark:bg-violet-950/10">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                          <div><Label className="text-[10px] font-bold">⚡ الطاقة (جول)</Label><Input type="number" value={editLaserSessionForm.energy} onChange={e => setEditLaserSessionForm(p => ({ ...p, energy: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">📢 النبض</Label><Input value={editLaserSessionForm.pulse} onChange={e => setEditLaserSessionForm(p => ({ ...p, pulse: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">😣 مستوى الألم (1-10)</Label><Input type="number" min="1" max="10" value={editLaserSessionForm.painLevel} onChange={e => setEditLaserSessionForm(p => ({ ...p, painLevel: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">🔴 رد الفعل</Label><Input value={editLaserSessionForm.reaction} onChange={e => setEditLaserSessionForm(p => ({ ...p, reaction: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">💰 السعر</Label><Input type="number" value={editLaserSessionForm.price} onChange={e => setEditLaserSessionForm(p => ({ ...p, price: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">📅 التاريخ</Label><Input type="date" value={editLaserSessionForm.date} onChange={e => setEditLaserSessionForm(p => ({ ...p, date: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                        </div>
                                        <div className="flex items-center gap-3"><Label className="text-[10px] font-bold">تم الدفع</Label><Switch checked={editLaserSessionForm.paid} onCheckedChange={v => setEditLaserSessionForm(p => ({ ...p, paid: v }))} /></div>
                                        <div><Label className="text-[10px] font-bold">📝 ملاحظات</Label><Textarea value={editLaserSessionForm.notes} onChange={e => setEditLaserSessionForm(p => ({ ...p, notes: e.target.value }))} className="rounded-lg text-xs mt-0.5" rows={2} /></div>
                                        <div className="flex gap-2">
                                          <Button size="sm" className="rounded-lg bg-gradient-to-l from-violet-600 to-purple-600 text-white text-xs shadow-sm" onClick={async () => { try { const updatedPrice = parseFloat(editLaserSessionForm.price) || rec.price; await apiFetch(`/laser/sessions/${ls.id}`, { method: 'PUT', body: JSON.stringify({ energy: parseFloat(editLaserSessionForm.energy) || undefined, pulse: editLaserSessionForm.pulse || undefined, painLevel: parseInt(editLaserSessionForm.painLevel) || undefined, reaction: editLaserSessionForm.reaction || undefined, notes: editLaserSessionForm.notes || undefined, price: updatedPrice, paid: editLaserSessionForm.paid, date: editLaserSessionForm.date || undefined }) }); setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, laserSessions: (r.laserSessions || []).map(s => s.id === ls.id ? { ...s, energy: parseFloat(editLaserSessionForm.energy) || undefined, pulse: editLaserSessionForm.pulse || undefined, painLevel: parseInt(editLaserSessionForm.painLevel) || undefined, reaction: editLaserSessionForm.reaction || undefined, notes: editLaserSessionForm.notes || undefined, price: updatedPrice, paid: editLaserSessionForm.paid, date: editLaserSessionForm.date || s.date } : s) } : r)); toast.success('تم تحديث الجلسة ✅'); setEditingLaserSessionId(null) } catch { toast.error('خطأ') } }}>✅ حفظ</Button>
                                          <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setEditingLaserSessionId(null)}>إلغاء</Button>
                                        </div>
                                      </CardContent>
                                    ) : (
                                      <CardContent className="p-3">
                                        <div className={cn('grid gap-2', isFirst ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4')}>
                                          {ls.energy && <div className="p-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-center border border-yellow-100 dark:border-yellow-800/30"><p className="text-[9px] text-muted-foreground">⚡ طاقة</p><p className="font-bold text-xs">{ls.energy} جول</p></div>}
                                          {ls.pulse && <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-center border border-indigo-100 dark:border-indigo-800/30"><p className="text-[9px] text-muted-foreground">📢 نبض</p><p className="font-bold text-xs">{ls.pulse}</p></div>}
                                          {ls.painLevel && <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-center border border-red-100 dark:border-red-800/30"><p className="text-[9px] text-muted-foreground">😣 ألم</p><p className="font-bold text-xs">{ls.painLevel}/10</p></div>}
                                          {ls.reaction && <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-center border border-orange-100 dark:border-orange-800/30"><p className="text-[9px] text-muted-foreground">🔴 رد فعل</p><p className="font-bold text-xs">{ls.reaction}</p></div>}
                                          {/* For first session, show default values if not set */}
                                          {isFirst && !ls.energy && rec.energy && <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-center border border-cyan-100 dark:border-cyan-800/30"><p className="text-[9px] text-muted-foreground">⚡ طاقة افتراضية</p><p className="font-bold text-xs">{rec.energy} جول</p></div>}
                                          {isFirst && !ls.pulse && rec.pulse && <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-center border border-cyan-100 dark:border-cyan-800/30"><p className="text-[9px] text-muted-foreground">📢 نبض افتراضي</p><p className="font-bold text-xs">{rec.pulse}</p></div>}
                                          {/* Show empty placeholder for alignment when no data */}
                                          {!ls.energy && !ls.pulse && !ls.painLevel && !ls.reaction && (!isFirst || (!rec.energy && !rec.pulse)) && <div className="p-2 rounded-xl bg-muted/30 text-center border border-dashed border-muted-foreground/20 col-span-2"><p className="text-[10px] text-muted-foreground">لا توجد تفاصيل إضافية مسجلة لهذه الجلسة</p></div>}
                                        </div>
                                        {ls.notes && <div className="mt-2 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/30 text-xs"><span className="text-teal-600 dark:text-teal-400 font-semibold">📝 </span>{ls.notes}</div>}
                                      </CardContent>
                                    )}
                                  </Card>
                                </motion.div>
                              )
                            })}

                            {/* Add Laser Session Form */}
                            {showAddLaserSessionForm && (
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="card-luxury border-2 border-violet-300 dark:border-violet-700 overflow-hidden">
                                  <div className="bg-gradient-to-l from-violet-500 to-purple-600 p-3 flex items-center justify-between"><div className="flex items-center gap-2"><Plus size={16} className="text-white" /><CardTitle className="text-sm text-white font-bold">تسجيل جلسة جديدة</CardTitle></div><Button variant="ghost" size="icon" className="h-7 w-7 text-white" onClick={() => setShowAddLaserSessionForm(false)}><X size={14} /></Button></div>
                                  <CardContent className="p-3 space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      <div><Label className="text-xs font-bold">⚡ الطاقة (جول)</Label><Input type="number" value={newLaserSessionForm.energy} onChange={e => setNewLaserSessionForm(p => ({ ...p, energy: e.target.value }))} placeholder="مثال: 15" className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">📢 النبض</Label><Input value={newLaserSessionForm.pulse} onChange={e => setNewLaserSessionForm(p => ({ ...p, pulse: e.target.value }))} placeholder="مثال: 20ms" className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">😣 مستوى الألم (1-10)</Label><Input type="number" min="1" max="10" value={newLaserSessionForm.painLevel} onChange={e => setNewLaserSessionForm(p => ({ ...p, painLevel: e.target.value }))} placeholder="1-10" className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">🔴 رد الفعل</Label><Input value={newLaserSessionForm.reaction} onChange={e => setNewLaserSessionForm(p => ({ ...p, reaction: e.target.value }))} placeholder="احمرار، تورم..." className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">📅 التاريخ</Label><Input type="date" value={newLaserSessionForm.date} onChange={e => setNewLaserSessionForm(p => ({ ...p, date: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div><Label className="text-xs font-bold">💰 سعر الجلسة (ج.م)</Label><Input type="number" value={newLaserSessionForm.price || String(rec.price)} onChange={e => setNewLaserSessionForm(p => ({ ...p, price: e.target.value }))} className="rounded-xl h-9 text-xs mt-1 font-bold" /></div>
                                      <div className="flex items-end gap-2 pb-1"><Label className="text-xs font-bold">تم الدفع</Label><Switch checked={newLaserSessionForm.paid} onCheckedChange={v => setNewLaserSessionForm(p => ({ ...p, paid: v }))} /></div>
                                    </div>
                                    <div><Label className="text-xs font-bold">📝 ملاحظات الجلسة</Label><Textarea value={newLaserSessionForm.notes} onChange={e => setNewLaserSessionForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات عن الجلسة، استجابة المريض، تعديلات..." className="rounded-xl text-xs mt-1" rows={2} /></div>
                                    <div className="flex gap-2">
                                      <Button className="rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 text-white flex-1" onClick={async () => { try { const sessionPrice = parseFloat(newLaserSessionForm.price) || rec.price; const res = await apiFetch<any>('/laser/sessions', { method: 'POST', body: JSON.stringify({ laserRecordId: rec.id, energy: parseFloat(newLaserSessionForm.energy) || undefined, pulse: newLaserSessionForm.pulse || undefined, painLevel: parseInt(newLaserSessionForm.painLevel) || undefined, reaction: newLaserSessionForm.reaction || undefined, notes: newLaserSessionForm.notes || undefined, price: sessionPrice, paid: newLaserSessionForm.paid, date: newLaserSessionForm.date || cairoISO() }) }); const newSession = res?.session; if (newSession) { setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, laserSessions: [...(r.laserSessions || []), newSession], _count: { laserSessions: (r._count?.laserSessions || 0) + 1 } } : r)); } if (newLaserSessionForm.paid && sessionPrice > 0) { try { const txnRes = await apiFetch<any>('/finance/transactions?limit=5&page=1'); const latestTxns = txnRes?.transactions || []; if (latestTxns.length > 0) { const newest = latestTxns[0]; if (newest?.id && newest.category === 'ليزر') { setTransactions(prev => [newest, ...prev]); } } } catch {} } toast.success('تم تسجيل الجلسة ✅'); setShowAddLaserSessionForm(false); setNewLaserSessionForm({ energy: '', pulse: '', painLevel: '', reaction: '', notes: '', date: '' }) } catch { toast.error('خطأ في تسجيل الجلسة') } }}>تسجيل الجلسة</Button>
                                      <Button variant="outline" className="rounded-xl" onClick={() => setShowAddLaserSessionForm(false)}>إلغاء</Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </div>)}

                          {/* ─── PAYMENTS TAB ─── */}
                          {laserDetailTab === 'payments' && (<div className="space-y-3">
                            <h3 className="font-bold text-lg flex items-center gap-2"><DollarSign size={18} className="text-emerald-500" /> المدفوعات والمالية</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}>
                                <Card className="card-luxury overflow-hidden border-2 border-emerald-200 dark:border-emerald-800/50">
                                  <div className="bg-gradient-to-l from-emerald-500 to-green-600 p-3 flex items-center gap-2"><CheckCircle size={16} className="text-white" /><p className="text-sm text-white font-bold">المدفوع</p></div>
                                  <CardContent className="p-3 text-center"><motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-2xl font-black text-emerald-600">{formatCurrency(totalPaid)}</motion.div></CardContent>
                                </Card>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.02 }}>
                                <Card className="card-luxury overflow-hidden border-2 border-amber-200 dark:border-amber-800/50">
                                  <div className="bg-gradient-to-l from-amber-500 to-orange-600 p-3 flex items-center gap-2"><Clock size={16} className="text-white" /><p className="text-sm text-white font-bold">المتبقي</p></div>
                                  <CardContent className="p-3 text-center"><motion.div animate={totalRemaining > 0 ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 1.5, repeat: totalRemaining > 0 ? Infinity : 0, repeatDelay: 2 }} className="text-2xl font-black text-amber-600">{formatCurrency(totalRemaining)}</motion.div></CardContent>
                                </Card>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }}>
                                <Card className="card-luxury overflow-hidden border-2 border-blue-200 dark:border-blue-800/50">
                                  <div className="bg-gradient-to-l from-blue-500 to-indigo-600 p-3 flex items-center gap-2"><Receipt size={16} className="text-white" /><p className="text-sm text-white font-bold">الإجمالي</p></div>
                                  <CardContent className="p-3 text-center"><div className="text-2xl font-black text-blue-600">{formatCurrency(grandTotal)}</div></CardContent>
                                </Card>
                              </motion.div>
                            </div>
                            {/* Payment Progress */}
                            <Card className="card-luxury p-4">
                              <p className="text-sm font-bold mb-2 flex items-center gap-2"><BarChart3 size={16} className="text-emerald-500" /> نسبة السداد</p>
                              <div className="flex h-6 rounded-full overflow-hidden bg-muted">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((totalPaid / Math.max(grandTotal, 1)) * 100)}%` }} transition={{ duration: 1 }} className="bg-gradient-to-l from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">{Math.round((totalPaid / Math.max(grandTotal, 1)) * 100)}%</motion.div>
                              </div>
                            </Card>
                            {/* Individual Session Payments */}
                            <Card className="card-luxury overflow-hidden">
                              <div className="bg-gradient-to-l from-violet-500 to-purple-600 p-3 flex items-center gap-2"><Zap size={16} className="text-white" /><p className="text-sm text-white font-bold">مدفوعات الجلسات</p></div>
                              <CardContent className="p-3 space-y-2">
                                {laserSess.length === 0 && <p className="text-center text-muted-foreground text-sm py-3">لا توجد جلسات مسجلة بعد</p>}
                                {laserSess.map((ls, idx) => (
                                  <motion.div key={ls.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={cn('flex items-center justify-between p-2.5 rounded-xl border transition-all', ls.paid ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30' : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30')}>
                                    <div className="flex items-center gap-2.5">
                                      <div className={cn('p-1.5 rounded-lg text-white text-[10px] font-bold', ls.paid ? 'bg-emerald-500' : 'bg-amber-500')}>{ls.sessionNumber}</div>
                                      <div>
                                        <p className="text-xs font-bold">الجلسة رقم {ls.sessionNumber}</p>
                                        <p className="text-[10px] text-muted-foreground">{formatDate(ls.date)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={cn('font-bold text-sm', ls.paid ? 'text-emerald-600' : 'text-amber-600')}>{formatCurrency(ls.price || rec.price)}</span>
                                      {ls.paid ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">✅</Badge> : <motion.button whileTap={{ scale: 0.85 }} onClick={async () => { try { await apiFetch(`/laser/sessions/${ls.id}`, { method: 'PUT', body: JSON.stringify({ paid: true, price: ls.price || rec.price }) }); const txnAmount = ls.price || rec.price; const txnDesc = `جلسة ليزر #${ls.sessionNumber} - ${pat?.name || 'مريض'} - ${areaInfo?.label || rec.bodyArea}`; const txnDate = ls.date || cairoISO(); try { const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }) }); const newTxn = txnRes?.transaction || txnRes?.data || txnRes; if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]); } else { setTransactions(prev => [...prev, { id: 'laser-' + Date.now(), type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }]); } } catch { setTransactions(prev => [...prev, { id: 'laser-' + Date.now(), type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }]); } setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, laserSessions: (r.laserSessions || []).map(s => s.id === ls.id ? { ...s, paid: true } : s) } : r)); toast.success('تم تأكيد الدفع ✅') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-bold shadow-md hover:bg-emerald-600">💰 دفع</motion.button>}
                                      <Button size="sm" variant="outline" className="h-6 px-1.5 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[9px]" onClick={() => setDeleteLaserSessionConfirmId(ls.id)}><Trash2 size={9} className="ml-0.5" /> حذف</Button>
                                    </div>
                                  </motion.div>
                                ))}
                              </CardContent>
                            </Card>
                            {/* Payment Summary */}
                            <Card className="card-luxury overflow-hidden">
                              <div className="bg-gradient-to-l from-slate-600 to-slate-700 p-3 flex items-center gap-2"><FileText size={16} className="text-white" /><p className="text-sm text-white font-bold">ملخص الفاتورة</p></div>
                              <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 text-sm"><span>سعر الجلسة الواحدة</span><span className="font-bold">{formatCurrency(rec.price)}</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 text-sm"><span>عدد الجلسات الكلي</span><span className="font-bold">{rec.totalSessions} جلسة</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 text-sm"><span>جلسات تمت</span><span className="font-bold">{laserSess.length} جلسة</span></div>
                                <Separator />
                                <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm"><span className="font-bold">الإجمالي</span><span className="font-bold text-blue-600">{formatCurrency(grandTotal)}</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm"><span>المدفوع ({laserSess.filter(s => s.paid).length} جلسة)</span><span className="font-bold text-emerald-600">{formatCurrency(totalPaid)}</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm"><span>المتبقي ({laserSess.filter(s => !s.paid).length} جلسة)</span><span className="font-bold text-amber-600">{formatCurrency(totalUnpaidFromSessions)}</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg text-sm"><span>حالة الدفع</span><Badge className={rec.paid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>{rec.paid ? '✅ مدفوع بالكامل' : '⏳ يوجد متبقي'}</Badge></div>
                              </CardContent>
                            </Card>
                            {!rec.paid && <Button className="rounded-xl w-full bg-gradient-to-l from-emerald-500 to-green-600 text-white" onClick={async () => { try { await apiFetch(`/laser/records/${rec.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) }); setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, paid: true } : r)); toast.success('تم تأكيد الدفع الكامل ✅') } catch { toast.error('خطأ') } }}>تأكيد الدفع الكامل</Button>}
                          </div>)}

                          {/* ─── NOTES TAB ─── */}
                          {laserDetailTab === 'notes' && (<div className="space-y-3">
                            <h3 className="font-bold text-lg flex items-center gap-2"><StickyNote size={18} className="text-amber-500" /> ملاحظات العلاج</h3>
                            {/* Quick Note Add */}
                            <div className="flex gap-2">
                              <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="أضف ملاحظة سريعة..." className="input-luxury rounded-xl h-9 text-xs" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: rec.patientId, section: 'laser' }, setNotes) } }} />
                              <Button size="sm" className="rounded-xl bg-amber-500 text-white h-9" onClick={() => { if (quickNote.trim()) { const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: rec.patientId, section: 'laser' }, setNotes) } }}><Plus size={14} /></Button>
                            </div>
                            {/* Laser Notes */}
                            {notes.filter(n => n.patientId === rec.patientId && (n.section === 'laser' || n.section === 'patient')).length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-muted-foreground text-sm">لا توجد ملاحظات بعد</p></Card>}
                            <div className="space-y-2">{notes.filter(n => n.patientId === rec.patientId && (n.section === 'laser' || n.section === 'patient' || !n.section)).map(n => (
                              <Card key={n.id} className="section-card p-3 border border-amber-200/50 dark:border-amber-800/30">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1">
                                    {editingNoteId === n.id ? (<div className="flex gap-1.5"><Input value={editingNoteContent} onChange={e => setEditingNoteContent(e.target.value)} className="input-luxury rounded-lg h-7 text-xs" autoFocus /><Button size="sm" className="rounded-lg h-7 bg-amber-500 text-white text-[10px] px-2" onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent }) }); setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent } : nn)); setEditingNoteId(null); toast.success('تم التعديل') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => setEditingNoteId(null)}>✕</Button></div>) : <><p className="text-xs">{n.content}</p><p className="text-[8px] text-muted-foreground mt-0.5">{formatDate(n.createdAt)}{n.important && ' ⭐ مهم'}</p></>}
                                  </div>
                                  {editingNoteId !== n.id && <div className="flex gap-0.5"><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { setEditingNoteId(n.id); setEditingNoteContent(n.content) }}><Edit3 size={9} className="text-amber-500" /></Button><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteItem('/notes', n.id, setNotes)}><Trash2 size={9} className="text-red-500" /></Button></div>}
                                </div>
                              </Card>
                            ))}</div>

                            {/* Professional Treatment Notes */}
                            <Card className="card-luxury overflow-hidden border-2 border-teal-200 dark:border-teal-800/50">
                              <div className="bg-gradient-to-l from-teal-500 to-emerald-600 p-3 flex items-center gap-2"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="text-lg">💡</motion.div><CardTitle className="text-sm text-white font-bold">نصائح مهنية - ما بعد الجلسة</CardTitle></div>
                              <CardContent className="p-3 space-y-2">
                                {['تجنب التعرض لأشعة الشمس المباشرة لمدة أسبوعين', 'استخدم واقي شمس SPF 50+ يومياً', 'تجنب التقشير الكيميائي لمدة أسبوع', 'لا تستخدم مزيل شعر بالشمع بين الجلسات', 'استخدم كريم مهدئ (ألوفيرا) بعد الجلسة', 'تجنب الماء الساخن على المنطقة لمدة 24 ساعة', 'تجنب ممارسة الرياضة الشاقة لمدة 24-48 ساعة', 'لا تقوم بفرك المنطقة أو حكها'].map((tip, i) => (
                                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2 p-1.5 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 text-xs"><CheckCircle size={12} className="text-teal-500 shrink-0 mt-0.5" /><span>{tip}</span></motion.div>
                                ))}
                              </CardContent>
                            </Card>
                          </div>)}
                        </motion.div>
                      )
                    })() : (<div className="space-y-3">
                    {/* ─── Records List (when no record selected) ─── */}
                    {laserRecords.length === 0 && <Card className="card-luxury p-8 text-center"><motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">💎</motion.div><p className="text-lg font-bold mb-1">لا توجد سجلات ليزر بعد</p><p className="text-muted-foreground text-sm mb-3">ابدأ بإضافة سجل جديد لمريض</p><Button className="btn-luxury rounded-xl bg-gradient-to-l from-cyan-600 to-cyan-700 text-white" onClick={() => setShowAddLaserRecord(true)}><Plus size={14} className="ml-1" /> إنشاء سجل</Button></Card>}
                    {laserRecords.map(r => {
                      const p = r.patient || patients.find(pt => pt.id === r.patientId)
                      const areaInfo = BODY_AREAS.find(a => a.id === r.bodyArea || a.label === r.bodyArea)
                      const rSess = r.laserSessions || []
                      const laserSessCount = rSess.length || r._count?.laserSessions || 0
                      const progressPercent = r.totalSessions > 0 ? Math.min((laserSessCount / r.totalSessions) * 100, 100) : 0
                      const paidSessions = rSess.filter(s => s.paid).length
                      const unpaidSessions = rSess.filter(s => !s.paid).length
                      const totalPaid = rSess.filter(s => s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
                      const grandTotal = r.totalPrice || (r.price * r.totalSessions)
                      const totalRemaining = r.paid ? 0 : Math.max(grandTotal - totalPaid, 0)
                      return (
                        <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
                          <Card className={cn('section-card overflow-hidden cursor-pointer hover:shadow-xl transition-all', r.paid ? 'border-r-4 border-r-emerald-400' : totalRemaining > 0 ? 'border-r-4 border-r-amber-400' : 'border-r-4 border-r-cyan-400')} onClick={() => { setSelectedLaserRecordId(r.id); setLaserDetailTab('overview') }}>
                            <div className="p-3.5">
                              <div className="flex items-start gap-3">
                                {/* Area Icon */}
                                <div className={cn('p-2.5 rounded-xl flex-shrink-0', areaInfo?.color || 'bg-cyan-100 dark:bg-cyan-900/30')}>
                                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-lg">💎</motion.div>
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-sm">{p?.name || 'مريض'}</p>
                                    <Badge className={cn('text-[9px]', r.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>{r.status === 'active' ? '🟢 نشط' : r.status === 'completed' ? '🔵 مكتمل' : '⏸️ متوقف'}</Badge>
                                    {areaInfo && <Badge className={cn('text-[9px]', areaInfo.color)}>{areaInfo.label}</Badge>}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">{r.machineName && <span>⚙️ {r.machineName}</span>}</div>
                                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-[10px]"><Zap size={11} className="text-violet-500" /><span className="font-bold">{laserSessCount}/{r.totalSessions} جلسة</span></div>
                                    {r.price > 0 && <div className="flex items-center gap-1.5 text-[10px]"><DollarSign size={11} className="text-emerald-500" /><span className="font-bold text-emerald-600">{formatCurrency(totalPaid)}</span>{totalRemaining > 0 && <span className="text-amber-600">/ {formatCurrency(grandTotal)}</span>}</div>}
                                    {laserSessCount > 0 && <div className="flex items-center gap-1.5 text-[10px]">{paidSessions > 0 && <span className="text-emerald-600 font-bold">✅ {paidSessions}</span>}{unpaidSessions > 0 && <span className="text-amber-600 font-bold">⏳ {unpaidSessions}</span>}</div>}
                                  </div>
                                  {/* Progress */}
                                  <div className="mt-2"><div className="flex items-center justify-between text-[9px] mb-1"><span className="text-muted-foreground">التقدم</span><span className="font-bold">{Math.round(progressPercent)}%</span></div><Progress value={progressPercent} className="h-2" /></div>
                                </div>
                                {/* Actions */}
                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                  <Button size="sm" className="h-8 px-3 rounded-lg bg-gradient-to-l from-cyan-500 to-teal-500 text-white text-[10px] font-bold shadow-sm hover:shadow-md" onClick={e => { e.stopPropagation(); setSelectedLaserRecordId(r.id); setLaserDetailTab('overview') }}><Eye size={12} className="ml-1" /> فتح</Button>
                                  <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[10px] font-bold" onClick={e => { e.stopPropagation(); setDeleteLaserRecordConfirmId(r.id) }}><Trash2 size={12} className="ml-1" /> حذف</Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>)}
                </div>)}

                {/* Laser Sessions */}
                {laserSubTab === 'sessions' && (<div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Zap size={18} className="text-violet-500" /> جلسات الليزر</h3><Badge variant="outline">{laserHairSessions.length} جلسة</Badge></div>
                    {laserHairSessions.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">⚡</p><p className="text-muted-foreground">لا توجد جلسات ليزر مسجلة</p><p className="text-xs text-muted-foreground mt-1">سيتم إنشاء الجلسات تلقائياً عند تسجيل مريض بجلسات ليزر</p></Card>}
                    <div className="space-y-2">
                      {laserHairSessions.slice(0, 30).map(s => {
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
                                {!s.paid && <motion.button whileTap={{ scale: 0.9 }} onClick={() => markSessionPaid(s)} className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-200">دفع</motion.button>}
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                </div>)}

                {/* Laser Packages - Enhanced */}
                {laserSubTab === 'packages' && (<div className="space-y-3 mt-4">
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
                </div>)}

                {/* Body Area Map - Interactive */}
                {laserSubTab === 'bodymap' && (<div className="mt-4">
                    <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={18} /> مناطق الجسم - إزالة الشعر بالليزر</CardTitle><CardDescription>اضغط على أي منطقة لعرض سجلاتها</CardDescription></CardHeader><CardContent>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {BODY_AREAS.map(area => {
                          const count = laserRecords.filter(r => r.bodyArea === area.id || r.bodyArea === area.label).length
                          const areaRevenue = laserPackages.filter(p => p.bodyArea === area.label).reduce((s, p) => s + p.price, 0)
                          return (
                            <motion.button key={area.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className={cn('flex items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all relative', area.color, count > 0 ? 'ring-2 ring-primary/30' : 'border-dashed')}>
                              <MapPin size={14} />
                              <span className="text-xs font-bold">{area.label}</span>
                              {count > 0 && <Badge variant="secondary" className="text-[9px]">{count} سجل</Badge>}
                            </motion.button>
                          )
                        })}
                      </div>
                    </CardContent></Card>
                </div>)}

                {/* Laser Financial Summary - Full System */}
                {laserSubTab === 'finance' && (<div className="space-y-4 mt-4">
                    {/* Laser Revenue from actual paid sessions */}
                    {(() => {
                      const allLaserSessions = laserRecords.flatMap(r => (r.laserSessions || []));
                      const paidSessions = allLaserSessions.filter(s => s.paid);
                      const unpaidSessions = allLaserSessions.filter(s => !s.paid);
                      const totalLaserPaid = paidSessions.reduce((s, sess) => s + (sess.price || 0), 0);
                      const totalLaserUnpaid = unpaidSessions.reduce((s, sess) => s + (sess.price || 0), 0);
                      const totalLaserGrand = laserRecords.reduce((s, r) => s + (r.totalPrice || r.price * r.totalSessions), 0);
                      const totalRemaining = Math.max(totalLaserGrand - totalLaserPaid, 0);
                      return (<>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الليزر</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(totalLaserPaid)}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30"><Receipt className="text-amber-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">غير المدفوع ليزر</p><p className="text-lg font-bold text-amber-600">{formatCurrency(totalLaserUnpaid)}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30"><ClipboardCheck className="text-blue-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">جلسات مدفوعة</p><p className="text-lg font-bold text-blue-600">{paidSessions.length} / {allLaserSessions.length}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30"><UsersRound className="text-violet-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">مرضى الليزر</p><p className="text-lg font-bold text-violet-600">{new Set(laserRecords.map(r => r.patientId)).size}</p></div></div></Card>
                    </div>
                    {/* Laser Revenue by Area */}
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin size={16} className="text-cyan-500" /> الإيرادات حسب المنطقة</CardTitle></CardHeader><CardContent>
                      <div className="space-y-2">{BODY_AREAS.map(area => { const areaRecords = laserRecords.filter(r => r.bodyArea === area.id || r.bodyArea === area.label); if (areaRecords.length === 0) return null; const areaPaid = areaRecords.flatMap(r => (r.laserSessions || []).filter(s => s.paid)).reduce((sum, s) => sum + (s.price || 0), 0); const areaSessCount = areaRecords.flatMap(r => (r.laserSessions || [])).length; return <div key={area.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div className="flex items-center gap-2"><MapPin size={14} className="text-cyan-500" /><span className="text-sm font-medium">{area.label}</span><Badge variant="outline" className="text-[9px]">{areaRecords.length} سجل | {areaSessCount} جلسة</Badge></div><span className="font-bold text-sm text-emerald-600">{formatCurrency(areaPaid)}</span></div> })}
                      </div>
                    </CardContent></Card>
                    {/* Laser Service Pricing */}
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Tag size={16} className="text-amber-500" /> أسعار خدمات الليزر</CardTitle></CardHeader><CardContent className="space-y-2">
                      {services.filter(s => s.category?.includes('ليزر') || s.name?.toLowerCase().includes('laser')).map(s => <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.duration ? `${s.duration} دقيقة` : ''}</p></div><div className="flex items-center gap-2"><Badge variant="outline" className="font-bold">{s.price} ج.م</Badge>{editingServiceId === s.id ? (<div className="flex items-center gap-1"><Input type="number" value={editingServicePrice} onChange={e => setEditingServicePrice(e.target.value)} className="w-20 h-7 text-xs rounded-lg" /><Button size="sm" className="h-7 rounded-lg text-[10px]" onClick={async () => { const newPrice = parseFloat(editingServicePrice) || 0; try { await apiFetch(`/services/${s.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice }) }); setServices(prev => prev.map(sv => sv.id === s.id ? { ...sv, price: newPrice } : sv)); toast.success('تم تحديث السعر') } catch { toast.error('خطأ') } setEditingServiceId(null) }}>حفظ</Button></div>) : <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingServiceId(s.id); setEditingServicePrice(String(s.price)) }}><Edit3 size={10} className="text-amber-500" /></Button>}</div></div>)}
                    </CardContent></Card>
                    {/* Register Laser Session */}
                    <Card className="card-luxury border-2 border-cyan-200 dark:border-cyan-800"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Plus size={16} className="text-cyan-500" /> تسجيل جلسة ليزر جديدة</CardTitle></CardHeader><CardContent className="space-y-3">
                      <Select value={laserFinancePatientId} onValueChange={setLaserFinancePatientId}><SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="اختار المريض..." /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.fileNumber})</SelectItem>)}</SelectContent></Select>
                      <div><Label className="text-xs font-bold flex items-center gap-1"><DollarSign size={12} /> قيمة الجلسة (ج.م)</Label><Input type="number" value={laserFinancePrice} onChange={e => setLaserFinancePrice(e.target.value)} placeholder="السعر بالجنيه..." className="input-luxury rounded-xl h-10 mt-1 text-lg font-bold" /></div>
                      <Input value={laserFinanceNotes} onChange={e => setLaserFinanceNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-10" />
                      <Button className="btn-luxury rounded-xl w-full bg-gradient-to-l from-cyan-600 to-cyan-700 text-white" onClick={async () => { if (!laserFinancePatientId || !laserFinancePrice) return toast.error('اختار المريض وحدد السعر'); const price = parseFloat(laserFinancePrice) || 0; const pName = patients.find(p => p.id === laserFinancePatientId)?.name || 'مريض'; await addItem('/sessions', { patientId: laserFinancePatientId, status: 'completed', price, paid: true, notes: laserFinanceNotes ? `ليزر - ${laserFinanceNotes}` : 'ليزر' }, setSessions); if (price > 0) { await addItem('/finance/transactions', { type: 'income', category: 'ليزر', amount: price, description: `جلسة ليزر - ${pName}` }, setTransactions); } setLaserFinancePatientId(''); setLaserFinancePrice(''); setLaserFinanceNotes(''); toast.success('تم تسجيل جلسة الليزر') }}>تسجيل الجلسة</Button>
                    </CardContent></Card>
                    {/* Unpaid Dues */}
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Receipt size={16} /> المبالغ المستحقة</CardTitle></CardHeader><CardContent className="space-y-2">
                      {laserHairSessions.filter(s => !s.paid).slice(0, 15).map(s => { const p = patients.find(pt => pt.id === s.patientId); const svc = services.find(sv => sv.id === s.serviceId); return <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"><div><p className="font-medium text-sm">{p?.name || 'مريض'}</p><p className="text-xs text-muted-foreground">{svc?.name || s.notes || 'جلسة ليزر'}</p></div><div className="flex items-center gap-2"><span className="font-bold text-red-600">{formatCurrency(s.price)}</span><motion.button whileTap={{ scale: 0.9 }} onClick={() => markSessionPaid(s)} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold">تأكيد الدفع</motion.button></div></div> })}
                      {laserHairSessions.filter(s => !s.paid).length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد مبالغ مستحقة ✅</p>}
                    </CardContent></Card>
                    </>) })()}
                </div>)}

                {/* Machine Settings */}
                {laserSubTab === 'settings' && (<div className="mt-4">
                    <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Settings size={18} /> إعدادات الأجهزة</CardTitle><CardDescription>إعدادات الطاقة والنبض لكل جهاز</CardDescription></CardHeader><CardContent>
                      {laserSettings.length === 0 ? <div className="text-center py-8"><motion.div animate={{ rotate: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="text-4xl mb-2 inline-block">⚙️</motion.div><p className="text-muted-foreground">لا توجد إعدادات أجهزة</p><p className="text-xs text-muted-foreground mt-1">أضف إعدادات من لوحة تحكم الأجهزة</p></div> :
                        <div className="space-y-2">{laserSettings.map(s => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30"><Wand2 className="text-cyan-600" size={16} /></div><div><p className="font-medium text-sm">{s.machineName}</p><p className="text-xs text-muted-foreground">{s.bodyArea}</p></div></div><div className="flex gap-2"><Badge variant="outline" className="text-[10px]">⚡ طاقة: {s.defaultEnergy || '-'}</Badge><Badge variant="outline" className="text-[10px]">📢 نبض: {s.defaultPulse || '-'}</Badge></div></div>)}</div>
                      }
                    </CardContent></Card>
                </div>)}
                {renderQuickNotes('laser')}
              </div>
            )}

            {/* ═══ FINANCE ═══ */}
            {activeTab === 'finance' && (
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-amber-50 dark:bg-amber-950/30">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="text-4xl">💰</motion.div><div><h1 className="text-2xl font-bold">الإدارة المالية</h1><p className="text-muted-foreground text-sm">إيرادات ومصروفات العيادة - يومية بالتاريخ</p></div></div>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-l from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20">
                        <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono" dir="ltr">{cairoClock}</span>
                        <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">|</span>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{cairoDateDisplay}</span>
                      </div>
                      <Button className="btn-luxury bg-gradient-to-l from-green-500 to-green-600 text-white shadow-lg" onClick={shareDailySummary}><Send size={14} className="ml-1" /> مشاركة واتساب</Button>
                      <Button className="btn-luxury bg-gradient-to-l from-amber-500 to-amber-600 text-white shadow-lg" onClick={() => { setTxnFormDate(cairoTodayInput()); setShowAddTransaction(true) }}><Plus size={14} className="ml-1" /> معاملة</Button>
                    </div>
                  </div>
                </div>
                {/* Today's Summary Cards */}
                {/* Cairo Time Indicator - always visible, links time to financial system */}
                <div className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20">
                  <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono" dir="ltr">{cairoClock}</span>
                  <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">|</span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{cairoDateDisplay}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="section-card p-4 border-2 border-emerald-200 dark:border-emerald-800"><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={18} /></div><div><p className="text-[10px] text-muted-foreground">إيراد اليوم</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(todayIncome)}</p></div></div></Card>
                  <Card className="section-card p-4 border-2 border-red-200 dark:border-red-800"><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30"><TrendingDown className="text-red-600" size={18} /></div><div><p className="text-[10px] text-muted-foreground">مصروفات اليوم</p><p className="text-lg font-bold text-red-600">{formatCurrency(todayExpense)}</p></div></div></Card>
                  <Card className="section-card p-4 border-2 border-blue-200 dark:border-blue-800"><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30"><BarChart3 className="text-blue-600" size={18} /></div><div><p className="text-[10px] text-muted-foreground">صافي اليوم</p><p className={cn('text-lg font-bold', todayNetProfit >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(todayNetProfit)}</p></div></div></Card>
                </div>
                {/* Period + Overall Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">إجمالي الإيرادات</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30"><TrendingDown className="text-red-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">إجمالي المصروفات</p><p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30"><BarChart3 className="text-blue-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">صافي الربح الكلي</p><p className={cn('text-xl font-bold', netProfit >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(netProfit)}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30"><Receipt className="text-amber-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">غير المدفوع</p><p className="text-xl font-bold text-amber-600">{formatCurrency(unpaidTotal)}</p></div></div></Card>
                </div>
                {/* ═══ Weekly Revenue Comparison ═══ */}
                <Card className="card-luxury border-2 border-indigo-200 dark:border-indigo-800">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp size={16} className="text-indigo-600" /> مقارنة الإيرادات الأسبوعية</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                        <p className="text-[10px] text-muted-foreground">هذا الأسبوع</p>
                        <p className="text-lg font-black text-emerald-600">{formatCurrency(weeklyComparison.thisWeekTotal)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 text-center">
                        <p className="text-[10px] text-muted-foreground">الأسبوع السابق</p>
                        <p className="text-lg font-black text-gray-600">{formatCurrency(weeklyComparison.lastWeekTotal)}</p>
                      </div>
                      <div className={cn('p-3 rounded-xl text-center', weeklyComparison.isUp ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20')}>
                        <p className="text-[10px] text-muted-foreground">نسبة التغير</p>
                        <p className={cn('text-lg font-black flex items-center justify-center gap-1', weeklyComparison.isUp ? 'text-emerald-600' : 'text-red-600')}>
                          {weeklyComparison.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(weeklyComparison.changePercent).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={weeklyComparison.lastWeekTotal > 0 ? Math.min((weeklyComparison.thisWeekTotal / weeklyComparison.lastWeekTotal) * 100, 150) : (weeklyComparison.thisWeekTotal > 0 ? 100 : 0)} className={cn('h-3 rounded-full', weeklyComparison.isUp ? '[&>div]:bg-emerald-500' : '[&>div]:bg-red-500')} />
                      <p className="text-[9px] text-muted-foreground mt-1 text-center">{weeklyComparison.isUp ? '📈 ارتفاع عن الأسبوع الماضي' : '📉 انخفاض عن الأسبوع الماضي'}</p>
                    </div>
                  </CardContent>
                </Card>
                {/* Revenue by Category - Compact */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Receipt size={16} className="text-amber-600" /> الإيرادات حسب النوع</CardTitle></CardHeader><CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🩺</span><span className="text-sm font-bold">كشف</span></div><span className="font-bold text-emerald-600">{formatCurrency(checkupRevenue)}</span></div>
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🔄</span><span className="text-sm font-bold">إعادة</span></div><span className="font-bold text-blue-600">{formatCurrency(revisitRevenue)}</span></div>
                    <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">⚡</span><span className="text-sm font-bold">جلسات</span></div><span className="font-bold text-violet-600">{formatCurrency(sessionRevenue)}</span></div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">📊</span><span className="text-sm font-bold">أخرى</span></div><span className="font-bold text-gray-600">{formatCurrency(otherRevenue)}</span></div>
                  </div>
                  {revenueByCategory.length > 0 && <div className="mt-4"><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></div>}
                </CardContent></Card>
                {/* Daily Revenue Chart */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp size={16} className="text-emerald-600" /> الإيرادات والمصروفات - آخر 7 أيام</CardTitle></CardHeader><CardContent>
                  <ResponsiveContainer width="100%" height={260}><BarChart data={revenueChartData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><RechartsTooltip /><Bar dataKey="إيراد" fill="#047857" radius={[4,4,0,0]} /><Bar dataKey="مصروف" fill="#D4A843" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
                </CardContent></Card>
                {/* ═══ Daily Financial Ledger ═══ */}
                <Card className="card-luxury border-2 border-amber-300 dark:border-amber-700">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CalendarCheck size={16} className="text-amber-600" /> السجل المالي اليومي بالتاريخ</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dailyFinanceData.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد معاملات بعد</p>}
                    {dailyFinanceData.map(day => {
                      const isToday = day.date === todayStr
                      const isExpanded = expandedFinanceDay === day.date
                      const dayName = getCairoWeekday(day.date)
                      const dayLabel = getCairoDateLabel(day.date)
                      return (
                        <div key={day.date} className={cn('rounded-xl border-2 overflow-hidden transition-all', isToday ? 'border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/20' : 'border-border bg-card')}>
                          <motion.div whileTap={{ scale: 0.99 }} onClick={() => setExpandedFinanceDay(isExpanded ? null : day.date)} className="p-3 cursor-pointer hover:bg-muted/50 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn('p-2 rounded-lg', isToday ? 'bg-amber-200 dark:bg-amber-800' : 'bg-muted')}>
                                  <CalendarCheck size={14} className={isToday ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm">{dayLabel}</span>
                                    {isToday && <Badge className="bg-amber-500 text-white text-[8px]">اليوم</Badge>}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">{dayName}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="text-center"><p className="text-[8px] text-muted-foreground">إيراد</p><p className="text-xs font-bold text-emerald-600">{formatCurrency(day.income)}</p></div>
                                    <div className="text-center"><p className="text-[8px] text-muted-foreground">مصروف</p><p className="text-xs font-bold text-red-600">{formatCurrency(day.expense)}</p></div>
                                    <div className="text-center"><p className="text-[8px] text-muted-foreground">صافي</p><p className={cn('text-xs font-bold', day.net >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(day.net)}</p></div>
                                  </div>
                                </div>
                                <ChevronDown size={14} className={cn('text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                              </div>
                            </div>
                          </motion.div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-3 pb-3 space-y-1.5 border-t border-dashed pt-2">
                                  {day.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                      <div className="flex items-center gap-2">
                                        <div className={cn('p-1 rounded-lg', t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30')}>
                                          <DollarSign className={t.type === 'income' ? 'text-emerald-600' : 'text-red-600'} size={10} />
                                        </div>
                                        <div>
                                          <p className="text-[11px] font-medium">{t.description || t.category}</p>
                                          <div className="flex items-center gap-1.5">
                                            <Badge variant="outline" className="text-[7px] px-1 py-0">{t.category}</Badge>
                                            <span className="text-[9px] text-muted-foreground">{formatTime(t.date)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className={cn('text-xs font-bold', t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={async () => { try { await apiFetch(`/finance/transactions/${t.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(tx => tx.id !== t.id)); toast.success('تم حذف المعاملة') } catch { toast.error('خطأ في الحذف') } }}><Trash2 size={9} className="text-red-500" /></Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                {renderQuickNotes('finance')}
              </div>
            )}

            {/* ═══ MORE ═══ - ALL SUB-TABS WORKING */}
            {activeTab === 'more' && (
              <div className="space-y-5">
                {/* ─── Ultra Premium Header ─── */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6366F1] via-[#A855F7] to-[#EC4899] p-6 shadow-2xl">
                  <div className="absolute inset-0">
                    <motion.div animate={{ x: [0, 120, 0], y: [0, -60, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                    <motion.div animate={{ x: [0, -80, 0], y: [0, 80, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} className="absolute bottom-0 left-0 w-36 h-36 bg-pink-300/20 rounded-full blur-3xl" />
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/10 rounded-full blur-3xl" />
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute -top-10 -left-10 w-32 h-32 border border-white/10 rounded-full" />
                    <motion.div animate={{ rotate: [360, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-8 -right-8 w-40 h-40 border border-white/10 rounded-full" />
                  </div>
                  <div className="relative z-10 flex items-center gap-4">
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg border border-white/20">📋</motion.div>
                    <div>
                      <h1 className="text-3xl font-black text-white drop-shadow-lg" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>المزيد</h1>
                      <p className="text-white/90 text-sm font-medium">خدمات وأدوات إضافية لإدارة عيادتك</p>
                    </div>
                  </div>
                </motion.div>

                {/* ─── Ultra Premium Navigation Grid ─── */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {[
                    { id: 'followup', label: 'المتابعات', emoji: '🔄', gradient: 'from-[#06B6D4] to-[#0891B2]', glow: 'shadow-cyan-500/40', ring: 'ring-cyan-400/60' },
                    { id: 'services', label: 'الخدمات', emoji: '⚙️', gradient: 'from-[#14B8A6] to-[#0D9488]', glow: 'shadow-teal-500/40', ring: 'ring-teal-400/60' },
                    { id: 'sessions', label: 'الجلسات', emoji: '⚡', gradient: 'from-[#8B5CF6] to-[#7C3AED]', glow: 'shadow-violet-500/40', ring: 'ring-violet-400/60' },
                    { id: 'visits', label: 'الزيارات', emoji: '🩺', gradient: 'from-[#3B82F6] to-[#2563EB]', glow: 'shadow-blue-500/40', ring: 'ring-blue-400/60' },
                    { id: 'doctors', label: 'الأطباء', emoji: '👨‍⚕️', gradient: 'from-[#10B981] to-[#059669]', glow: 'shadow-emerald-500/40', ring: 'ring-emerald-400/60' },
                    { id: 'inventory', label: 'المخزون', emoji: '📦', gradient: 'from-[#F59E0B] to-[#D97706]', glow: 'shadow-amber-500/40', ring: 'ring-amber-400/60' },
                    { id: 'bookings', label: 'الحجز', emoji: '📅', gradient: 'from-[#0EA5E9] to-[#0284C7]', glow: 'shadow-sky-500/40', ring: 'ring-sky-400/60' },
                    { id: 'medications', label: 'الأدوية', emoji: '💊', gradient: 'from-[#84CC16] to-[#65A30D]', glow: 'shadow-lime-500/40', ring: 'ring-lime-400/60' },
                    { id: 'reminders', label: 'التذكيرات', emoji: '⏰', gradient: 'from-[#F43F5E] to-[#E11D48]', glow: 'shadow-rose-500/40', ring: 'ring-rose-400/60' },
                    { id: 'templates', label: 'القوالب', emoji: '📋', gradient: 'from-[#D946EF] to-[#C026D3]', glow: 'shadow-fuchsia-500/40', ring: 'ring-fuchsia-400/60' },
                    { id: 'waiting', label: 'الانتظار', emoji: '⏳', gradient: 'from-[#EF4444] to-[#DC2626]', glow: 'shadow-red-500/40', ring: 'ring-red-400/60' },
                    { id: 'reports', label: 'التقارير', emoji: '📊', gradient: 'from-[#06B6D4] to-[#0284C7]', glow: 'shadow-cyan-500/40', ring: 'ring-cyan-400/60' },
                    { id: 'backup', label: 'النسخ', emoji: '💾', gradient: 'from-[#64748B] to-[#475569]', glow: 'shadow-slate-500/40', ring: 'ring-slate-400/60' },
                    { id: 'notes', label: 'الملاحظات', emoji: '📝', gradient: 'from-[#6366F1] to-[#4F46E5]', glow: 'shadow-indigo-500/40', ring: 'ring-indigo-400/60' },
                    { id: 'personal', label: 'شخصي', emoji: '🌟', gradient: 'from-[#F97316] to-[#EA580C]', glow: 'shadow-orange-500/40', ring: 'ring-orange-400/60' },
                    { id: 'settings', label: 'الإعدادات', emoji: '🎨', gradient: 'from-[#A855F7] to-[#9333EA]', glow: 'shadow-purple-500/40', ring: 'ring-purple-400/60' },
                  ].map(s => (
                    <motion.button key={s.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08, y: -3 }} onClick={() => setMoreSubTab(s.id)} className={cn('relative overflow-hidden flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300', moreSubTab === s.id ? cn('ring-2 shadow-xl scale-105 bg-white dark:bg-gray-800', s.ring, s.glow) : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg border border-white/30 dark:border-gray-700/30')}>
                      {moreSubTab === s.id && <div className={cn('absolute inset-0 bg-gradient-to-br opacity-15', s.gradient)} />}
                      <motion.div animate={moreSubTab === s.id ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5 }} className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-300', moreSubTab === s.id ? cn('bg-gradient-to-br text-white shadow-lg', s.gradient, s.glow) : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600')}>{s.emoji}</motion.div>
                      <span className={cn('text-[10px] font-bold transition-colors whitespace-nowrap', moreSubTab === s.id ? 'text-foreground' : 'text-muted-foreground')}>{s.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* ═══ Follow-up (المتابعات) Sub-tab - LIGHT CYAN/TEAL THEME ═══ */}
                {moreSubTab === 'followup' && (() => {
                  const filteredFU = followUpRecords.filter(fu => {
                    if (followUpFilter !== 'all' && fu.status !== followUpFilter) return false
                    if (followUpSearch.trim()) {
                      const q = followUpSearch.toLowerCase()
                      const pName = fu.patient?.name?.toLowerCase() || ''
                      const pPhone = fu.patient?.phone || ''
                      const pFile = fu.patient?.fileNumber?.toLowerCase() || ''
                      return fu.condition.toLowerCase().includes(q) || pName.includes(q) || pPhone.includes(q) || pFile.includes(q) || (fu.diagnosis || '').toLowerCase().includes(q)
                    }
                    return true
                  })
                  // selectedFU is now defined at component level
                  const activeCount = followUpRecords.filter(f => f.status === 'active').length
                  const subCount = followUpRecords.filter(f => f.hasSubscription).length
                  const dueSoon = followUpRecords.filter(f => {
                    if (!f.nextVisitDate || f.status !== 'active') return false
                    const next = new Date(f.nextVisitDate)
                    const now = new Date()
                    const diffDays = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                    return diffDays >= 0 && diffDays <= 3
                  }).length
                  const fuPatientSuggestions = patients.filter(p => {
                    if (!fuFormPatientSearch) return false
                    const q = fuFormPatientSearch.toLowerCase()
                    return p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)
                  }).slice(0, 5)
                  const SEVERITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
                    mild: { label: 'خفيف', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                    moderate: { label: 'متوسط', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                    severe: { label: 'شديد', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
                    critical: { label: 'حرج', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
                  }
                  const FREQ_MAP: Record<string, string> = { weekly: 'أسبوعي', biweekly: 'كل أسبوعين', monthly: 'شهري', quarterly: 'ربع سنوي', custom: 'مخصص' }
                  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
                    active: { label: 'نشط', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                    paused: { label: 'متوقف', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                    completed: { label: 'مكتمل', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    discharged: { label: 'خرج', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-900/30' },
                  }
                  return (
                  <div className="space-y-4">
                    {/* Hero Header - Light Cyan Theme */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0891B2] via-[#06B6D4] to-[#67E8F9] p-5 shadow-xl">
                      <div className="absolute inset-0 opacity-15">
                        <motion.div animate={{ x: [0, 80, 0], y: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} className="absolute top-0 right-0 w-36 h-36 bg-white/30 rounded-full blur-3xl" />
                        <motion.div animate={{ x: [0, -60, 0], y: [0, 50, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute bottom-0 left-0 w-28 h-28 bg-white/20 rounded-full blur-3xl" />
                      </div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="text-4xl">🔄</motion.div>
                          <div>
                            <h1 className="text-2xl font-bold text-white">المتابعات</h1>
                            <p className="text-white/80 text-sm">متابعة الحالات المزمنة والباقات</p>
                          </div>
                        </div>
                        <Button className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm" onClick={() => { setShowAddFollowUp(true); setFuFormPatientSearch(''); setFuFormPatientId(''); setFuFormCondition(''); setFuFormCategory('جلدية'); setFuFormSeverity('moderate'); setFuFormFrequency('monthly'); setFuFormCustomDays(''); setFuFormNextVisit(''); setFuFormDiagnosis(''); setFuFormTreatmentPlan(''); setFuFormMedications(''); setFuFormNotes(''); setFuFormHasSubscription(false); setFuFormSubType('monthly'); setFuFormSubPrice(''); setFuFormSubStart(''); setFuFormSubEnd(''); setFuFormSubSessions('') }}><Plus size={16} className="ml-1" /> حالة جديدة</Button>
                      </div>
                      {/* Stats Row */}
                      <div className="relative z-10 grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"><p className="text-white/70 text-[10px]">حالات نشطة</p><p className="text-white text-xl font-black">{activeCount}</p></div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"><p className="text-white/70 text-[10px]">باقات متابعة</p><p className="text-white text-xl font-black">{subCount}</p></div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"><p className="text-white/70 text-[10px]">زيارات قريبة</p><p className="text-white text-xl font-black">{dueSoon}</p></div>
                      </div>
                    </motion.div>

                    {/* Search & Filters */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0891B2]/40" size={16} /><Input placeholder="بحث بالاسم أو الحالة أو التشخيص..." value={followUpSearch} onChange={e => setFollowUpSearch(e.target.value)} className="pr-10 input-luxury rounded-xl h-11 border-[#06B6D4]/30 focus:border-[#0891B2]" /></div>
                      <div className="flex gap-1.5 flex-wrap">
                        {(['all', 'active', 'paused', 'completed', 'discharged'] as const).map(f => (
                          <Button key={f} size="sm" variant={followUpFilter === f ? 'default' : 'outline'} className={cn('rounded-lg text-xs h-9', followUpFilter === f ? 'bg-[#0891B2] text-white' : 'border-[#06B6D4]/30 text-[#0891B2]')} onClick={() => setFollowUpFilter(f)}>
                            {f === 'all' ? 'الكل' : f === 'active' ? 'نشط' : f === 'paused' ? 'متوقف' : f === 'completed' ? 'مكتمل' : 'خرج'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Follow-up Records List */}
                      <div className="lg:col-span-1 space-y-2 max-h-[65vh] overflow-y-auto">
                        {filteredFU.length === 0 && <Card className="card-luxury p-8 text-center border-[#06B6D4]/20"><p className="text-4xl mb-2">🔄</p><p className="text-muted-foreground">لا توجد متابعات</p></Card>}
                        {filteredFU.map(fu => {
                          const sev = SEVERITY_MAP[fu.severity] || SEVERITY_MAP.moderate
                          const stat = STATUS_MAP[fu.status] || STATUS_MAP.active
                          const isDue = fu.nextVisitDate && new Date(fu.nextVisitDate) <= new Date() && fu.status === 'active'
                          const isSelected = selectedFollowUpId === fu.id
                          return (
                            <motion.div key={fu.id} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedFollowUpId(isSelected ? null : fu.id); setFollowUpDetailTab('overview') }} className={cn('cursor-pointer rounded-xl p-3 border-2 transition-all', isSelected ? 'border-[#0891B2] bg-[#0891B2]/5 shadow-lg' : 'border-transparent bg-card hover:border-[#06B6D4]/30 hover:shadow-md')}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={cn('p-1.5 rounded-lg', sev.bg)}><span className="text-xs">{fu.conditionCategory === 'جلدية' ? '🩺' : fu.conditionCategory === 'داخلية' ? '💊' : '📋'}</span></div>
                                  <div>
                                    <p className="font-bold text-sm">{fu.patient?.name || 'مريض'}</p>
                                    <p className="text-xs text-muted-foreground">{fu.condition}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge className={cn('text-[8px]', stat.bg, stat.color)}>{stat.label}</Badge>
                                  {isDue && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[8px]">⏰ موعد اليوم</Badge>}
                                  {fu.hasSubscription && <Badge className="bg-[#06B6D4]/20 text-[#0891B2] text-[8px]">💎 باقة</Badge>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                                <span className={cn('font-medium', sev.color)}>{sev.label}</span>
                                <span>•</span>
                                <span>{FREQ_MAP[fu.frequency] || fu.frequency}</span>
                                {fu.nextVisitDate && <><span>•</span><span>التالي: {formatDate(fu.nextVisitDate)}</span></>}
                              </div>
                              {fu.hasSubscription && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <div className="flex-1 h-1.5 rounded-full bg-[#67E8F9]/30 dark:bg-[#0891B2]/20"><div className="h-full rounded-full bg-gradient-to-l from-[#0891B2] to-[#06B6D4]" style={{ width: `${fu.sessionsIncluded > 0 ? (fu.sessionsUsed / fu.sessionsIncluded) * 100 : 0}%` }} /></div>
                                  <span className="text-[9px] font-bold text-[#0891B2]">{fu.sessionsUsed}/{fu.sessionsIncluded}</span>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Detail Panel */}
                      <div className="lg:col-span-2">
                        {selectedFU ? (() => {
                          const fu = selectedFU
                          const sev = SEVERITY_MAP[fu.severity] || SEVERITY_MAP.moderate
                          const stat = STATUS_MAP[fu.status] || STATUS_MAP.active
                          const pat = fu.patient
                          return (
                            <Card className="card-luxury border-[#06B6D4]/20 overflow-hidden">
                              {/* Detail Header */}
                              <div className="bg-gradient-to-l from-[#0891B2] to-[#06B6D4] p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">🔄</div>
                                    <div>
                                      <h2 className="text-lg font-bold text-white">{pat?.name || 'مريض'}</h2>
                                      <p className="text-white/80 text-sm">{fu.condition} • {sev.label}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={cn('text-xs', stat.bg, stat.color)}>{stat.label}</Badge>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white" onClick={() => setDeleteFollowUpConfirmId(fu.id)}><Trash2 size={14} /></Button>
                                  </div>
                                </div>
                                {/* Detail Tabs */}
                                <div className="flex gap-2 mt-3">
                                  {(['overview', 'visits', 'subscription'] as const).map(t => (
                                    <Button key={t} size="sm" className={cn('rounded-lg text-xs h-8', followUpDetailTab === t ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15')} onClick={() => setFollowUpDetailTab(t)}>
                                      {t === 'overview' ? '📋 نظرة عامة' : t === 'visits' ? '🩺 الزيارات' : '💎 الباقة'}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <CardContent className="p-4 space-y-3">
                                {/* Overview Tab */}
                                {followUpDetailTab === 'overview' && (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20"><p className="text-[10px] text-muted-foreground">الشدة</p><p className={cn('font-bold text-sm', sev.color)}>{sev.label}</p></div>
                                      <div className="p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20"><p className="text-[10px] text-muted-foreground">التكرار</p><p className="font-bold text-sm">{FREQ_MAP[fu.frequency] || fu.frequency}</p></div>
                                      <div className="p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20"><p className="text-[10px] text-muted-foreground">آخر زيارة</p><p className="font-bold text-sm">{fu.lastVisitDate ? formatDate(fu.lastVisitDate) : 'لا توجد'}</p></div>
                                      <div className="p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20"><p className="text-[10px] text-muted-foreground">الزيارة القادمة</p><p className={cn('font-bold text-sm', fu.nextVisitDate && new Date(fu.nextVisitDate) <= new Date() ? 'text-red-600' : 'text-emerald-600')}>{fu.nextVisitDate ? formatDate(fu.nextVisitDate) : 'غير محدد'}</p></div>
                                    </div>
                                    {fu.diagnosis && <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"><p className="text-[10px] text-blue-600 font-bold">التشخيص</p><p className="text-sm mt-1">{fu.diagnosis}</p></div>}
                                    {fu.treatmentPlan && <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800"><p className="text-[10px] text-violet-600 font-bold">خطة العلاج</p><p className="text-sm mt-1">{fu.treatmentPlan}</p></div>}
                                    {fu.medications && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800"><p className="text-[10px] text-emerald-600 font-bold">الأدوية</p><p className="text-sm mt-1">{fu.medications}</p></div>}
                                    {fu.notes && <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800"><p className="text-[10px] text-amber-600 font-bold">ملاحظات</p><p className="text-sm mt-1">{fu.notes}</p></div>}
                                    {/* Patient Info */}
                                    {pat && <div className="p-3 rounded-xl bg-muted/50 border"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">👤</span><div><p className="font-bold text-sm">{pat.name}</p><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{pat.fileNumber}</span>{pat.phone && <><span>•</span><a href={`https://wa.me/${waPhone(pat.phone)}`} target="_blank" className="text-emerald-600 hover:underline">{pat.phone}</a></>}</div></div></div><Button size="sm" variant="outline" className="rounded-lg text-[#0891B2] border-[#06B6D4]/30" onClick={() => { setSelectedPatient(pat); setActiveTab('patients') }}>📋 ملف المريض</Button></div></div>}
                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                      <Button className="flex-1 rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white" onClick={() => setShowAddFollowUpVisit(true)}><Plus size={14} className="ml-1" /> زيارة متابعة</Button>
                                      <Button variant="outline" className="rounded-xl border-[#06B6D4]/30 text-[#0891B2]" onClick={async () => { try { await apiFetch(`/follow-up/records/${fu.id}`, { method: 'PUT', body: JSON.stringify({ status: fu.status === 'active' ? 'paused' : 'active' }) }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, status: fu.status === 'active' ? 'paused' : 'active' } : f)); toast.success(fu.status === 'active' ? 'تم إيقاف المتابعة' : 'تم تنشيط المتابعة') } catch { toast.error('خطأ') } }}>{fu.status === 'active' ? '⏸ إيقاف' : '▶️ تنشيط'}</Button>
                                    </div>
                                  </div>
                                )}

                                {/* Visits Tab */}
                                {followUpDetailTab === 'visits' && (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-1"><Calendar size={14} className="text-[#0891B2]" /> سجل الزيارات ({fu.followUpVisits?.length || 0})</h3><Button size="sm" className="rounded-lg bg-[#0891B2] text-white text-xs" onClick={() => setShowAddFollowUpVisit(true)}><Plus size={12} className="ml-1" /> زيارة جديدة</Button></div>
                                    {(fu.followUpVisits || []).length === 0 && <div className="text-center py-8"><p className="text-3xl mb-2">📋</p><p className="text-muted-foreground text-sm">لا توجد زيارات بعد</p></div>}
                                    {(fu.followUpVisits || []).map(v => (
                                      <Card key={v.id} className="border border-[#06B6D4]/20 p-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <div className={cn('p-2 rounded-lg', v.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' : v.status === 'no_show' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
                                              <span className="text-sm">{v.status === 'completed' ? '✅' : v.status === 'no_show' ? '❌' : '⏳'}</span>
                                            </div>
                                            <div>
                                              <p className="font-bold text-xs">زيارة #{v.visitNumber}</p>
                                              <p className="text-[10px] text-muted-foreground">{formatDate(v.visitDate)}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge className={cn('text-[8px]', v.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{v.paid ? 'مدفوعة' : 'غير مدفوعة'}</Badge>
                                            {v.price > 0 && <span className="text-xs font-bold text-[#0891B2]">{formatCurrency(v.price)}</span>}
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { await apiFetch(`/follow-up/visits/${v.id}`, { method: 'DELETE' }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, followUpVisits: (f.followUpVisits || []).filter(fv => fv.id !== v.id), sessionsUsed: Math.max(0, f.sessionsUsed - 1) } : f)); toast.success('تم حذف الزيارة') } catch { toast.error('خطأ') } }}><Trash2 size={10} className="text-red-500" /></Button>
                                          </div>
                                        </div>
                                        {v.findings && <p className="text-xs mt-2 text-muted-foreground"><span className="font-bold">النتائج:</span> {v.findings}</p>}
                                        {v.treatmentNotes && <p className="text-xs mt-1 text-muted-foreground"><span className="font-bold">العلاج:</span> {v.treatmentNotes}</p>}
                                        {v.medications && <p className="text-xs mt-1 text-muted-foreground"><span className="font-bold">الأدوية:</span> {v.medications}</p>}
                                        {v.instructions && <p className="text-xs mt-1 text-muted-foreground"><span className="font-bold">التعليمات:</span> {v.instructions}</p>}
                                        {v.notes && <p className="text-xs mt-1 text-muted-foreground"><span className="font-bold">ملاحظات:</span> {v.notes}</p>}
                                        {!v.paid && v.price > 0 && !fu.hasSubscription && (
                                          <Button size="sm" className="mt-2 rounded-lg bg-emerald-500 text-white text-[10px] h-7" onClick={async () => { try { await apiFetch(`/follow-up/visits/${v.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) }); const txnAmount = v.price; const txnDesc = `زيارة متابعة #${v.visitNumber} - ${pat?.name || 'مريض'} - ${fu.condition}`; const txnDate = v.visitDate || cairoISO(); try { const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'متابعة', amount: txnAmount, description: txnDesc, date: txnDate }) }); const newTxn = txnRes?.transaction || txnRes?.data || txnRes; if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]); } else { setTransactions(prev => [...prev, { id: 'fu-pay-' + Date.now(), type: 'income', category: 'متابعة', amount: txnAmount, description: txnDesc, date: txnDate }]); } } catch { setTransactions(prev => [...prev, { id: 'fu-pay-' + Date.now(), type: 'income', category: 'متابعة', amount: txnAmount, description: txnDesc, date: txnDate }]); } setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, followUpVisits: (f.followUpVisits || []).map(fv => fv.id === v.id ? { ...fv, paid: true } : fv) } : f)); toast.success('تم تأكيد الدفع') } catch { toast.error('خطأ') } }}>💰 دفع</Button>
                                        )}
                                      </Card>
                                    ))}
                                  </div>
                                )}

                                {/* Subscription Tab */}
                                {followUpDetailTab === 'subscription' && (
                                  <div className="space-y-3">
                                    {fu.hasSubscription ? (
                                      <>
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#0891B2]/10 to-[#06B6D4]/10 border-2 border-[#06B6D4]/30">
                                          <div className="flex items-center gap-2 mb-3"><span className="text-2xl">💎</span><div><p className="font-bold text-[#0891B2]">باقة المتابعة</p><p className="text-xs text-muted-foreground">{fu.subscriptionType === 'monthly' ? 'شهرية' : fu.subscriptionType === 'quarterly' ? 'ربع سنوية' : fu.subscriptionType === 'yearly' ? 'سنوية' : 'بالجلسات'}</p></div></div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5"><p className="text-[10px] text-muted-foreground">السعر</p><p className="font-bold text-sm text-[#0891B2]">{formatCurrency(fu.subscriptionPrice)}</p></div>
                                            <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5"><p className="text-[10px] text-muted-foreground">الجلسات</p><p className="font-bold text-sm">{fu.sessionsUsed} / {fu.sessionsIncluded}</p></div>
                                            {fu.subscriptionStart && <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5"><p className="text-[10px] text-muted-foreground">البداية</p><p className="font-bold text-sm">{formatDate(fu.subscriptionStart)}</p></div>}
                                            {fu.subscriptionEnd && <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5"><p className="text-[10px] text-muted-foreground">النهاية</p><p className="font-bold text-sm">{formatDate(fu.subscriptionEnd)}</p></div>}
                                          </div>
                                          {/* Progress Bar */}
                                          <div className="mt-3">
                                            <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-muted-foreground">استخدام الجلسات</span><span className="text-[10px] font-bold text-[#0891B2]">{fu.sessionsIncluded > 0 ? Math.round((fu.sessionsUsed / fu.sessionsIncluded) * 100) : 0}%</span></div>
                                            <div className="h-2.5 rounded-full bg-[#67E8F9]/30"><div className="h-full rounded-full bg-gradient-to-l from-[#0891B2] to-[#06B6D4] transition-all" style={{ width: `${fu.sessionsIncluded > 0 ? (fu.sessionsUsed / fu.sessionsIncluded) * 100 : 0}%` }} /></div>
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button variant="outline" className="flex-1 rounded-xl border-[#06B6D4]/30 text-[#0891B2]" onClick={async () => { try { await apiFetch(`/follow-up/records/${fu.id}`, { method: 'PUT', body: JSON.stringify({ sessionsUsed: fu.sessionsUsed + 1 }) }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, sessionsUsed: f.sessionsUsed + 1 } : f)); toast.success('تم تسجيل استخدام جلسة') } catch { toast.error('خطأ') } }}>➕ استخدام جلسة</Button>
                                          <Button variant="outline" className="rounded-xl border-red-300 text-red-600" onClick={async () => { try { await apiFetch(`/follow-up/records/${fu.id}`, { method: 'PUT', body: JSON.stringify({ hasSubscription: false, subscriptionType: null, subscriptionPrice: 0, sessionsIncluded: 0, sessionsUsed: 0 }) }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, hasSubscription: false, subscriptionType: undefined, subscriptionPrice: 0, sessionsIncluded: 0, sessionsUsed: 0 } : f)); toast.success('تم إلغاء الباقة') } catch { toast.error('خطأ') } }}>🗑 إلغاء الباقة</Button>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-center py-8">
                                        <p className="text-4xl mb-3">💎</p>
                                        <p className="text-muted-foreground mb-4">لا توجد باقة متابعة لهذه الحالة</p>
                                        <p className="text-sm text-muted-foreground mb-4">الباقة تتيح للمريض دفع مبلغ مقطوع والحصول على عدد زيارات محددة بدون دفع كل مرة</p>
                                        <Button className="rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white" onClick={() => setEditingFollowUpId(fu.id)}>إضافة باقة متابعة</Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })() : (
                          <Card className="card-luxury p-12 text-center border-[#06B6D4]/20">
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">🔄</motion.div>
                            <p className="text-muted-foreground">اختر حالة من القائمة لعرض التفاصيل</p>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                  )
                })()}

                {/* Services Sub-tab - Premium Design */}
                {moreSubTab === 'services' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><motion.div animate={{ x: [0, 80, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" /></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="text-4xl">⚙️</motion.div><div><h2 className="text-2xl font-black text-white">الخدمات</h2><p className="text-white/80 text-sm">{services.length} خدمة مسجلة</p></div></div>
                      <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => setShowAddService(true)}><Plus size={14} className="ml-1" /> خدمة جديدة</Button>
                    </div>
                  </motion.div>
                  {services.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">⚙️</p><p className="text-muted-foreground">لا توجد خدمات بعد</p></Card>}
                  {Object.entries(servicesByCategory).map(([cat, svcs]) => <Card key={cat} className="card-luxury"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Tag size={14} className="text-teal-500" /> {cat} <Badge variant="secondary" className="text-[9px]">{svcs.length}</Badge></CardTitle></CardHeader><CardContent className="space-y-2">{svcs.map(s => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-transparent hover:border-primary/20 transition-all"><div className="flex items-center gap-3"><div className={cn('w-2 h-8 rounded-full', s.active ? 'bg-emerald-500' : 'bg-red-400')} /><div>{editingServiceId === s.id ? (<div className="flex items-center gap-2"><Input value={editingServiceName} onChange={e => setEditingServiceName(e.target.value)} className="h-8 text-sm rounded-lg font-medium w-32" placeholder="اسم الخدمة" /><Input type="number" value={editingServicePrice} onChange={e => setEditingServicePrice(e.target.value)} className="w-24 h-8 text-sm rounded-lg font-bold" /><Button size="sm" className="h-8 rounded-lg text-xs bg-teal-600 text-white" onClick={async () => { const newPrice = parseFloat(editingServicePrice); const newName = editingServiceName.trim(); if (isNaN(newPrice)) { toast.error('أدخل سعر صحيح'); return } if (!newName) { toast.error('أدخل اسم الخدمة'); return } try { await apiFetch(`/services/${s.id}`, { method: 'PUT', body: JSON.stringify({ name: newName, price: newPrice }) }); setServices(prev => prev.map(sv => sv.id === s.id ? { ...sv, name: newName, price: newPrice } : sv)); toast.success('تم التحديث ✓'); setEditingServiceId(null) } catch (e: any) { toast.error(e?.message || 'خطأ'); setEditingServiceId(null) } }}>✓</Button><Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => setEditingServiceId(null)}>✕</Button></div>) : (<><p className="font-medium text-sm cursor-pointer hover:text-teal-600 hover:underline decoration-dashed underline-offset-2" onClick={() => { setEditingServiceId(s.id); setEditingServiceName(s.name); setEditingServicePrice(String(s.price)) }}>{s.name}</p><p className="text-xs text-muted-foreground">{s.duration ? `${s.duration} دقيقة` : 'بدون مدة محددة'}</p></>)}</div></div><div className="flex items-center gap-2">{editingServiceId !== s.id && (<><motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-dashed border-teal-300 dark:border-teal-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-all cursor-pointer" onClick={() => { setEditingServiceId(s.id); setEditingServiceName(s.name); setEditingServicePrice(String(s.price)) }}><span className="font-bold text-sm text-teal-700 dark:text-teal-300">{s.price}</span><span className="text-xs text-muted-foreground">ج.م</span><Edit3 size={10} className="text-teal-400" /></motion.button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingServiceId(s.id); setEditingServiceName(s.name); setEditingServicePrice(String(s.price)) }}><Edit3 size={11} className="text-teal-500" /></Button></>)}<Badge className={s.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]'}>{s.active ? 'نشط' : 'معطل'}</Badge><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/services', s.id, setServices)}><Trash2 size={12} className="text-red-500" /></Button></div></div>)}</CardContent></Card>)}
                </div>)}

                {/* ═══ Sessions Sub-tab - PROFESSIONAL ANIMATED ═══ */}
                {moreSubTab === 'sessions' && (<div className="space-y-5">
                  {/* Animated Header */}
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-20">
                      <motion.div animate={{ x: [0, 100, 0], y: [0, -50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                      <motion.div animate={{ x: [0, -80, 0], y: [0, 60, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-300/20 rounded-full blur-3xl" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-5xl">⚡</motion.div>
                        <div>
                          <h2 className="text-2xl font-black text-white">إدارة الجلسات</h2>
                          <p className="text-violet-200 text-sm mt-0.5">تتبع ومتابعة وإدارة جميع جلسات العيادة</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-xl shadow-lg" onClick={() => { setShowAddLaserRecord(true) }}><Plus size={14} className="ml-1" /> جلسة ليزر</Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-xl shadow-lg" onClick={() => { setShowAddPatient(true); setSelectedVisitType('session') }}><UserPlus size={14} className="ml-1" /> جديدة</Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Animated Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: <Activity size={20} />, label: 'جلسات اليوم', value: sessions.filter(s => getLocalDateStr(s.date) === todayStr).length, gradient: 'from-violet-500 to-purple-600', emoji: '⚡' },
                      { icon: <CheckCircle size={20} />, label: 'مدفوعة', value: sessions.filter(s => s.paid).length, gradient: 'from-emerald-500 to-teal-600', emoji: '✅' },
                      { icon: <Clock size={20} />, label: 'غير مدفوعة', value: sessions.filter(s => !s.paid).length, gradient: 'from-amber-500 to-orange-600', emoji: '⏳' },
                      { icon: <DollarSign size={20} />, label: 'إجمالي الإيرادات', value: formatCurrency(sessions.reduce((s, ses) => s + (ses.price || 0), 0)), gradient: 'from-blue-500 to-indigo-600', emoji: '💰' },
                    ].map((stat, idx) => (
                      <motion.div key={stat.label} initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }} whileHover={{ scale: 1.03, y: -2 }} className="relative overflow-hidden">
                        <div className={cn('p-4 rounded-2xl bg-gradient-to-br text-white shadow-lg', stat.gradient)}>
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }} className="absolute top-2 left-2 text-3xl opacity-20">{stat.emoji}</motion.div>
                          <div className="relative z-10 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">{stat.icon}</div>
                            <div><p className="text-[10px] text-white/70 font-medium">{stat.label}</p><p className="text-xl font-black">{stat.value}</p></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Session Status Overview - Horizontal Bar */}
                  {(() => {
                    const total = sessions.length || 1
                    const paidCount = sessions.filter(s => s.paid).length
                    const unpaidCount = sessions.filter(s => !s.paid).length
                    const todayCount = sessions.filter(s => getLocalDateStr(s.date) === todayStr).length
                    const paidPct = Math.round((paidCount / total) * 100)
                    const unpaidPct = 100 - paidPct
                    return (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="card-luxury overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-bold flex items-center gap-2"><BarChart2 size={16} className="text-violet-500" /> نسبة الدفع</p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> مدفوع {paidPct}%</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> غير مدفوع {unpaidPct}%</span>
                              </div>
                            </div>
                            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${paidPct}%` }} transition={{ duration: 1, delay: 0.5 }} className="bg-gradient-to-l from-emerald-400 to-emerald-600" />
                              <motion.div initial={{ width: 0 }} animate={{ width: `${unpaidPct}%` }} transition={{ duration: 1, delay: 0.7 }} className="bg-gradient-to-l from-amber-400 to-amber-600" />
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                              <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-lg font-black text-emerald-600">{paidCount}</p><p className="text-[9px] text-muted-foreground">مدفوعة</p></div>
                              <div className="text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-lg font-black text-amber-600">{unpaidCount}</p><p className="text-[9px] text-muted-foreground">مستحقة</p></div>
                              <div className="text-center p-2 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-lg font-black text-violet-600">{todayCount}</p><p className="text-[9px] text-muted-foreground">اليوم</p></div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })()}

                  {/* Today's Sessions - Animated */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="card-luxury border-2 border-violet-200 dark:border-violet-800 overflow-hidden">
                      <div className="bg-gradient-to-l from-violet-500 to-purple-600 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="text-xl">📅</motion.div><CardTitle className="text-sm text-white font-bold">جلسات اليوم</CardTitle></div>
                        <Badge className="bg-white/20 text-white border-white/30">{sessions.filter(s => getLocalDateStr(s.date) === todayStr).length}</Badge>
                      </div>
                      <CardContent className="p-3 space-y-2">
                        {(() => {
                          const todaySessions = sessions.filter(s => getLocalDateStr(s.date) === todayStr)
                          if (todaySessions.length === 0) return <div className="text-center py-8"><motion.div animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">😴</motion.div><p className="text-muted-foreground font-medium">لا توجد جلسات اليوم</p><p className="text-xs text-muted-foreground mt-1">أضف جلسة جديدة من الأعلى</p></div>
                          return todaySessions.map((s, idx) => {
                            const p = patients.find(pt => pt.id === s.patientId)
                            const svc = services.find(sv => sv.id === s.serviceId)
                            return (
                              <motion.div key={s.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={cn('flex items-center justify-between p-3 rounded-xl border transition-all', s.paid ? 'bg-gradient-to-l from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-gradient-to-l from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800')}>
                                <div className="flex items-center gap-3">
                                  <motion.div animate={s.paid ? {} : { scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: s.paid ? 0 : Infinity, repeatDelay: 2 }} className={cn('p-2.5 rounded-xl text-white shadow-md', s.paid ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-amber-600')}>
                                    {s.paid ? <CheckCircle size={16} /> : <Clock size={16} />}
                                  </motion.div>
                                  <div>
                                    <p className="font-bold text-sm">{p?.name || 'مريض'}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Badge variant="outline" className="text-[9px] px-1.5">{svc?.name || s.notes || 'جلسة'}</Badge>
                                      <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(s.date)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-sm bg-gradient-to-l from-violet-600 to-purple-600 bg-clip-text text-transparent">{formatCurrency(s.price)}</span>
                                  {!s.paid && <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }} onClick={() => markSessionPaid(s)} className="px-3 py-1.5 rounded-lg bg-gradient-to-l from-emerald-500 to-emerald-600 text-white text-[10px] font-bold shadow-md hover:shadow-lg transition-shadow">💰 دفع</motion.button>}
                                </div>
                              </motion.div>
                            )
                          })
                        })()}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* All Sessions - Professional List */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="card-luxury border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
                      <div className="bg-gradient-to-l from-purple-500 to-fuchsia-600 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }} className="text-xl">⚡</motion.div><CardTitle className="text-sm text-white font-bold">جميع الجلسات</CardTitle></div>
                        <Badge className="bg-white/20 text-white border-white/30">{sessions.length} جلسة</Badge>
                      </div>
                      <CardContent className="p-3 space-y-2">
                        {sessions.length === 0 && <div className="text-center py-8"><motion.div animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">📋</motion.div><p className="text-muted-foreground">لا توجد جلسات مسجلة</p></div>}
                        {sessions.slice(0, 50).map((s, idx) => {
                          const p = patients.find(pt => pt.id === s.patientId)
                          const svc = services.find(sv => sv.id === s.serviceId)
                          return (
                            <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} whileHover={{ scale: 1.01, x: 4 }} className={cn('flex items-center justify-between p-3 rounded-xl border transition-all', s.paid ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-800/50')}>
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
                                <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7" onClick={() => { const pt = patients.find(pp => pp.id === s.patientId); if (pt) { setSelectedPatient(pt); setActiveTab('patients') } }}><Eye size={10} /></Button>
                                {!s.paid && <motion.button whileTap={{ scale: 0.9 }} onClick={() => markSessionPaid(s)} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold shadow-md">دفع</motion.button>}
                              </div>
                            </motion.div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Unpaid Dues - Alert Style */}
                  {sessions.filter(s => !s.paid).length > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                      <Card className="card-luxury border-2 border-red-300 dark:border-red-800 overflow-hidden">
                        <div className="bg-gradient-to-l from-red-500 to-rose-600 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2"><motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-xl">🚨</motion.div><CardTitle className="text-sm text-white font-bold">مستحقات غير مدفوعة</CardTitle></div>
                          <Badge className="bg-white/20 text-white border-white/30">{sessions.filter(s => !s.paid).length} مستحق</Badge>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          {sessions.filter(s => !s.paid).slice(0, 20).map((s, idx) => {
                            const p = patients.find(pt => pt.id === s.patientId)
                            const svc = services.find(sv => sv.id === s.serviceId)
                            return (
                              <motion.div key={s.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                                <div className="flex items-center gap-2">
                                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }} className="text-lg">⚠️</motion.div>
                                  <div><p className="font-medium text-sm">{p?.name || 'مريض'}</p><p className="text-xs text-muted-foreground">{svc?.name || s.notes || 'جلسة'}</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-red-600">{formatCurrency(s.price)}</span>
                                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => markSessionPaid(s)} className="px-2.5 py-1.5 rounded-lg bg-gradient-to-l from-emerald-500 to-emerald-600 text-white text-[10px] font-bold shadow-md">تأكيد الدفع</motion.button>
                                </div>
                              </motion.div>
                            )
                          })}
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center pt-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-red-500 to-rose-600 text-white font-bold shadow-lg">
                              <span>💸</span>
                              <span>إجمالي المستحقات: {formatCurrency(sessions.filter(s => !s.paid).reduce((sum, s) => sum + (s.price || 0), 0))}</span>
                            </div>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Session Stats by Service */}
                  {services.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                      <Card className="card-luxury overflow-hidden">
                        <div className="bg-gradient-to-l from-indigo-500 to-blue-600 p-3 flex items-center gap-2">
                          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="text-xl">📊</motion.div>
                          <CardTitle className="text-sm text-white font-bold">إحصائيات حسب الخدمة</CardTitle>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          {services.filter(svc => sessions.some(s => s.serviceId === svc.id)).map((svc, idx) => {
                            const svcSessions = sessions.filter(s => s.serviceId === svc.id)
                            const paid = svcSessions.filter(s => s.paid).length
                            const total = svcSessions.length
                            const revenue = svcSessions.reduce((sum, s) => sum + (s.price || 0), 0)
                            const pct = total > 0 ? Math.round((paid / total) * 100) : 0
                            return (
                              <motion.div key={svc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-3 rounded-xl bg-muted/50 border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2"><span className="font-bold text-sm">{svc.name}</span><Badge variant="outline" className="text-[9px]">{total} جلسة</Badge></div>
                                  <span className="font-bold text-sm text-emerald-600">{formatCurrency(revenue)}</span>
                                </div>
                                <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 + idx * 0.05 }} className="bg-gradient-to-l from-emerald-400 to-emerald-600 rounded-full" />
                                </div>
                                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground"><span>{paid} مدفوعة</span><span>{total - paid} مستحقة</span><span>{pct}%</span></div>
                              </motion.div>
                            )
                          })}
                          {services.filter(svc => sessions.some(s => s.serviceId === svc.id)).length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد إحصائيات بعد</p>}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>)}

                {/* Visits Sub-tab - ENHANCED */}
                {moreSubTab === 'visits' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><motion.div animate={{ x: [0, -60, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" /></div>
                    <div className="relative z-10 flex items-center gap-3"><motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">🩺</motion.div><div><h2 className="text-2xl font-black text-white">الزيارات</h2><p className="text-white/80 text-sm">{visits.length} زيارة مسجلة</p></div></div>
                  </motion.div>
                  
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
                {moreSubTab === 'doctors' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><motion.div animate={{ y: [0, 40, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" /></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">👨‍⚕️</motion.div><div><h2 className="text-2xl font-black text-white">الأطباء المشاركون</h2><p className="text-white/80 text-sm">{doctors.length} طبيب مشارك</p></div></div>
                      <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => { setDoctorForm({ name: '', phone: '', specialty: '', checkupPercentage: '', revisitPercentage: '', laserPercentage: '', sessionPercentage: '', fixedAmount: '', notes: '' }); setShowAddDoctor(true) }}><Plus size={14} className="ml-1" /> طبيب جديد</Button>
                    </div>
                  </motion.div>
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
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}><CalendarCheck size={18} className="text-sky-500" /></motion.div> نظام الحجز</h3><div className="flex items-center gap-2"><Badge variant="outline">{appointments.length} حجز</Badge><Button className="btn-luxury rounded-xl bg-gradient-to-l from-sky-500 to-sky-600 text-white" onClick={() => { setEditingBookingId(null); setBookingFormPatientSearch(''); setBookingFormPatientId(''); setBookingFormDate(cairoTodayInput()); setBookingFormTime(cairoTimeInput()); setBookingFormType('checkup'); setBookingFormStatus('scheduled'); setBookingFormNotes(''); setShowAddBooking(true) }}><Plus size={14} className="ml-1" /> حجز جديد</Button></div></div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 p-3 text-center">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl mb-1">📅</motion.div>
                        <p className="text-xl font-black text-sky-700 dark:text-sky-300">{appointments.filter(a => getLocalDateStr(a.date) === todayStr).length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">حجز اليوم</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-3 text-center">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="text-2xl mb-1">📆</motion.div>
                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{(() => { const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })); const dayOfWeek = nowCairo.getDay(); const daysSinceSaturday = (dayOfWeek + 1) % 7; const satDate = new Date(nowCairo); satDate.setDate(nowCairo.getDate() - daysSinceSaturday); const weekStartStr = satDate.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }); return appointments.filter(a => getLocalDateStr(a.date) >= weekStartStr).length })()}</p>
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
                        if (bookingFilterDate === 'today' && getLocalDateStr(a.date) !== todayStr) return false
                        if (bookingFilterDate === 'week') { const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })); const daysSinceSat = (nowCairo.getDay() + 1) % 7; const satDate = new Date(nowCairo); satDate.setDate(nowCairo.getDate() - daysSinceSat); const weekStartStr = satDate.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }); if (getLocalDateStr(a.date) < weekStartStr) return false }
                        if (bookingFilterDate === 'month') { const ad = getCairoDateParts(a.date); if (ad.year !== cairoNow.year || ad.month !== cairoNow.month) return false }
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
                      const isToday = getLocalDateStr(apt.date) === todayStr

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
                                {p?.phone && <motion.button whileTap={{ scale: 0.85 }} className="h-8 w-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all" onClick={() => { const wp = waPhone(p.phone); if (wp) { const msg = encodeURIComponent(`مرحباً ${p.name}، نود تذكيرك بموعدك في عيادةالمغازي بتاريخ ${formatDate(apt.date)} الساعة ${aptDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}. نتطلع لرؤيتك! 🏥`); window.open(`https://wa.me/${wp}?text=${msg}`, '_blank') } }}><Send size={14} className="text-green-600" /></motion.button>}
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
                {moreSubTab === 'medications' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" /></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} className="text-4xl">💊</motion.div><div><h2 className="text-2xl font-black text-white">الأدوية</h2><p className="text-white/80 text-sm">{medications.length} دواء مسجل</p></div></div>
                      <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => setShowAddMedication(true)}><Plus size={14} className="ml-1" /> دواء جديد</Button>
                    </div>
                  </motion.div>
                  {medications.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">💊</p><p className="text-muted-foreground">لا توجد أدوية بعد</p></Card>}
                  <div className="space-y-2">{medications.map(m => <Card key={m.id} className="section-card p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-1.5 rounded-lg', m.active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-900/30')}><Pill className={m.active ? 'text-green-600' : 'text-gray-400'} size={14} /></div><div><p className="font-medium text-sm">{m.name}</p><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{m.category || 'عام'}</span>{m.dosage && <span className="text-xs text-muted-foreground">- الجرعة: {m.dosage}</span>}{m.instructions && <span className="text-xs text-muted-foreground">- {m.instructions}</span>}</div></div></div><div className="flex items-center gap-2"><Badge className={m.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]'}>{m.active ? 'نشط' : 'معطل'}</Badge><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/medications', m.id, setMedications)}><Trash2 size={12} className="text-red-500" /></Button></div></div></Card>)}</div>
                </div>)}

                {/* Reminders Sub-tab - ENHANCED Professional */}
                {moreSubTab === 'reminders' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><motion.div animate={{ x: [0, 60, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" /></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><motion.div animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }} className="text-4xl">⏰</motion.div><div><h2 className="text-2xl font-black text-white">التذكيرات</h2><p className="text-white/80 text-sm">{reminders.length} تذكير مسجل</p></div></div>
                      <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => setShowAddReminder(true)}><Plus size={14} className="ml-1" /> تذكير جديد</Button>
                    </div>
                  </motion.div>
                  
                  {/* Today's Reminders Highlighted Card */}
                  {(() => {
                    const todayReminders = reminders.filter(r => getLocalDateStr(r.date) === todayStr && r.status !== 'completed')
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
                                      {r.patientId && (() => { const rp = patients.find(p => p.id === r.patientId); const wp = rp?.phone ? waPhone(rp.phone) : ''; return wp ? <motion.button whileTap={{ scale: 0.9 }} onClick={() => window.open(`https://wa.me/${wp}`, '_blank')} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600"><Send size={12} /></motion.button> : null })()}
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
                            {r.status !== 'completed' && r.patientId && (() => { const rp = patients.find(p => p.id === r.patientId); const wp = rp?.phone ? waPhone(rp.phone) : ''; return wp ? <motion.button whileTap={{ scale: 0.9 }} onClick={() => window.open(`https://wa.me/${wp}`, '_blank')} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors"><Send size={12} /></motion.button> : null })()}
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
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><motion.div animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-0 right-0 w-28 h-28 bg-white/20 rounded-full blur-3xl" /></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">📋</motion.div><div><h2 className="text-2xl font-black text-white">قوالب العلاج</h2><p className="text-white/80 text-sm">{treatmentTemplates.length} قالب جاهز</p></div></div>
                      <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => { const name = prompt('اسم القالب:'); if (!name) return; const desc = prompt('الوصف:') || ''; const sess = parseInt(prompt('عدد الجلسات:', '6') || '6'); const price = parseFloat(prompt('السعر التقديري:', '1000') || '1000'); const cat = prompt('الفئة:', 'جلدية') || 'جلدية'; setTreatmentTemplates(prev => [...prev, { id: Date.now().toString(), name, description: desc, sessions: sess, estimatedPrice: price, category: cat }]); toast.success('تم إضافة القالب') }}><Plus size={14} className="ml-1" /> قالب جديد</Button>
                    </div>
                  </motion.div>
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
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><motion.div animate={{ x: [0, -40, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" /></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-4xl">⏳</motion.div><div><h2 className="text-2xl font-black text-white">قائمة الانتظار</h2><p className="text-white/80 text-sm">إدارة المرضى في الانتظار</p></div></div>
                      <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => setShowAddWaiting(true)}><Plus size={14} className="ml-1" /> إضافة مريض</Button>
                    </div>
                  </motion.div>
                  
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
                  {/* ═══ Daily Cases Summary - ملخص يومي بالحالات ═══ */}
                  <Card className="card-luxury border-2 border-cyan-300 dark:border-cyan-700"><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck size={18} className="text-cyan-600" /> ملخص الحالات اليومي</CardTitle></CardHeader><CardContent className="space-y-3">
                    {dailyVisitStats.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد بيانات بعد</p>}
                    {dailyVisitStats.map(day => {
                      const isToday = day.date === todayStr
                      const dayName = getCairoWeekday(day.date)
                      const dayLabel = getCairoDateLabel(day.date)
                      const totalCases = day.checkupCount + day.revisitCount + day.sessionCount
                      const totalRev = day.checkupRevenue + day.revisitRevenue + day.sessionRevenue
                      return (
                        <div key={day.date} className={cn('p-3 rounded-xl border-2', isToday ? 'border-cyan-400 dark:border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/20' : 'border-border bg-card')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CalendarCheck size={14} className={isToday ? 'text-cyan-600' : 'text-muted-foreground'} />
                              <span className="font-bold text-sm">{dayLabel}</span>
                              <span className="text-[10px] text-muted-foreground">({dayName})</span>
                              {isToday && <Badge className="bg-cyan-500 text-white text-[8px]">اليوم</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] font-bold">{totalCases} حالة</Badge>
                              <span className="text-xs font-bold text-emerald-600">{formatCurrency(totalRev)}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1"><span className="text-sm">🩺</span><span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">كشف</span></div>
                              <p className="text-lg font-black text-emerald-600">{day.checkupCount}</p>
                              <p className="text-[9px] text-emerald-500 font-bold">{formatCurrency(day.checkupRevenue)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1"><span className="text-sm">🔄</span><span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">إعادة</span></div>
                              <p className="text-lg font-black text-blue-600">{day.revisitCount}</p>
                              <p className="text-[9px] text-blue-500 font-bold">{formatCurrency(day.revisitRevenue)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1"><span className="text-sm">⚡</span><span className="text-[10px] font-bold text-violet-700 dark:text-violet-400">جلسات</span></div>
                              <p className="text-lg font-black text-violet-600">{day.sessionCount}</p>
                              <p className="text-[9px] text-violet-500 font-bold">{formatCurrency(day.sessionRevenue)}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent></Card>

                  {/* Today's Quick Summary */}
                  <Card className="card-luxury border-2 border-emerald-300 dark:border-emerald-700"><CardHeader><CardTitle className="flex items-center gap-2"><Activity size={18} className="text-emerald-600" /> ملخص اليوم السريع</CardTitle></CardHeader><CardContent>
                    {(() => {
                      const todayStats = dailyVisitStats.find(d => d.date === todayStr)
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">🩺 كشف اليوم</p><p className="text-lg font-bold text-emerald-600">{todayStats?.checkupCount || 0}</p><p className="text-[10px] text-emerald-500 font-bold">{formatCurrency(todayStats?.checkupRevenue || 0)}</p></div>
                          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">🔄 إعادة اليوم</p><p className="text-lg font-bold text-blue-600">{todayStats?.revisitCount || 0}</p><p className="text-[10px] text-blue-500 font-bold">{formatCurrency(todayStats?.revisitRevenue || 0)}</p></div>
                          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-xs text-muted-foreground">⚡ جلسات اليوم</p><p className="text-lg font-bold text-violet-600">{todayStats?.sessionCount || 0}</p><p className="text-[10px] text-violet-500 font-bold">{formatCurrency(todayStats?.sessionRevenue || 0)}</p></div>
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">💰 إيراد اليوم</p><p className="text-lg font-bold text-amber-600">{formatCurrency(todayIncome)}</p><p className="text-[10px] text-amber-500 font-bold">صافي: {formatCurrency(todayNetProfit)}</p></div>
                        </div>
                      )
                    })()}
                  </CardContent></Card>

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
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">جدد هذا الشهر</p><p className="text-lg font-bold text-emerald-600">{patients.filter(p => { const pd = getCairoDateParts(p.createdAt); return pd.year === cairoNow.year && pd.month === cairoNow.month }).length}</p></div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">⭐ حالات مميزة</p><p className="text-lg font-bold text-amber-600">{patients.filter(p => p.starred).length}</p></div>
                      <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20"><p className="text-xs text-muted-foreground">💗 متحسنين</p><p className="text-lg font-bold text-pink-600">{patients.filter(p => p.improved).length}</p></div>
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
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">إيراد الليزر</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(laserRevenue)}</p></div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">مرضى الليزر</p><p className="text-lg font-bold text-blue-600">{new Set(laserRecords.map(r => r.patientId)).size}</p></div>
                    </div>
                  </CardContent></Card>

                  {/* ═══ Top Patients by Visits ═══ */}
                  <Card className="card-luxury border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Award size={18} className="text-blue-600" /> أكثر المرضى زيارة</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {topPatientsByVisits.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد زيارات بعد</p>}
                      {topPatientsByVisits.map((item, idx) => (
                        <div key={item.patient.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer" onClick={() => setSelectedPatient(item.patient)}>
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm', idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-blue-400 to-blue-600')}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{item.patient.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[8px] px-1 py-0">🩺 {item.visitCount}</Badge>
                              <Badge variant="outline" className="text-[8px] px-1 py-0">⚡ {item.sessionCount}</Badge>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-emerald-600">{formatCurrency(item.totalSpent)}</p>
                            <p className="text-[8px] text-muted-foreground">{item.visitCount + item.sessionCount} زيارة</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* ═══ Laser Session Progress ═══ */}
                  {laserProgressData.length > 0 && (
                  <Card className="card-luxury border-2 border-cyan-200 dark:border-cyan-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-cyan-600" /> تقدم جلسات الليزر النشطة</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {laserProgressData.map(item => (
                        <div key={item.record.id} className="p-3 rounded-xl bg-muted/50 space-y-2 cursor-pointer hover:bg-muted transition-all" onClick={() => { setSelectedPatient(item.patient || null); setActiveTab('patients') }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30"><Zap size={12} className="text-cyan-600" /></div>
                              <div>
                                <p className="text-xs font-bold">{item.patient?.name || 'مريض'}</p>
                                <p className="text-[9px] text-muted-foreground">{item.areaLabel}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-cyan-600">{item.completedSessions}/{item.totalSessions}</p>
                              <p className="text-[9px] text-muted-foreground">{item.progress.toFixed(0)}%</p>
                            </div>
                          </div>
                          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(item.progress, 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={cn('absolute inset-y-0 right-0 rounded-full', item.progress >= 80 ? 'bg-emerald-500' : item.progress >= 50 ? 'bg-cyan-500' : item.progress >= 25 ? 'bg-amber-500' : 'bg-red-400')} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  )}

                  {/* Weekly Revenue Bar Chart */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={18} className="text-emerald-600" /> الإيرادات الأسبوعية</CardTitle></CardHeader><CardContent>
                    <ResponsiveContainer width="100%" height={260}><BarChart data={revenueChartData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><RechartsTooltip /><Bar dataKey="إيراد" fill="#047857" radius={[4,4,0,0]} /><Bar dataKey="مصروف" fill="#D4A843" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
                  </CardContent></Card>

                  {/* ═══ NEW: Most Common Session Types ═══ */}
                  <Card className="card-luxury border-2 border-violet-200 dark:border-violet-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-violet-600" /> أكثر أنواع الجلسات</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const sessionByType: Record<string, { count: number; revenue: number }> = {}
                        sessions.forEach(s => {
                          const svc = services.find(sv => sv.id === s.serviceId)
                          const label = svc?.name || s.notes?.split('|')[0]?.trim() || 'جلسة عامة'
                          if (!sessionByType[label]) sessionByType[label] = { count: 0, revenue: 0 }
                          sessionByType[label].count++
                          if (s.paid) sessionByType[label].revenue += s.price || 0
                        })
                        const sorted = Object.entries(sessionByType).sort((a, b) => b[1].count - a[1].count).slice(0, 8)
                        const maxCount = sorted.length > 0 ? sorted[0][1].count : 1
                        if (sorted.length === 0) return <p className="text-center text-muted-foreground text-sm py-4">لا توجد جلسات بعد</p>
                        return sorted.map(([name, data], idx) => (
                          <div key={name} className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-all">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs', idx < 3 ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-gray-400 to-gray-500')}>{idx + 1}</div>
                                <span className="text-sm font-bold truncate max-w-[140px]">{name}</span>
                              </div>
                              <div className="text-left">
                                <span className="text-xs font-bold text-violet-600">{data.count} جلسة</span>
                                <span className="text-[10px] text-emerald-600 mr-1">{formatCurrency(data.revenue)}</span>
                              </div>
                            </div>
                            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(data.count / maxCount) * 100}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} className={cn('absolute inset-y-0 right-0 rounded-full', idx === 0 ? 'bg-violet-500' : idx === 1 ? 'bg-purple-400' : idx === 2 ? 'bg-fuchsia-400' : 'bg-gray-400')} />
                            </div>
                          </div>
                        ))
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══ NEW: Detailed Weekly Report (Egyptian week: Saturday–Friday) ═══ */}
                  <Card className="card-luxury border-2 border-emerald-200 dark:border-emerald-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><CalendarCheck size={18} className="text-emerald-600" /> تقرير أسبوعي مفصل (السبت–الجمعة)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        // Generate ALL 7 days of the current Egyptian week (Saturday→Friday)
                        const weekDays = getEgyptianWeekDays()
                        // Build a lookup map from dailyVisitStats for O(1) access
                        const statsByDate: Record<string, typeof dailyVisitStats[0]> = {}
                        for (const s of dailyVisitStats) statsByDate[s.date] = s
                        // Merge: always show all 7 days, zero-fill missing
                        const fullWeekDays = weekDays.map(wd => {
                          const stats = statsByDate[wd.dateStr]
                          return {
                            date: wd.dateStr,
                            dayName: wd.dayName,
                            checkupCount: stats?.checkupCount || 0,
                            revisitCount: stats?.revisitCount || 0,
                            sessionCount: stats?.sessionCount || 0,
                            checkupRevenue: stats?.checkupRevenue || 0,
                            revisitRevenue: stats?.revisitRevenue || 0,
                            sessionRevenue: stats?.sessionRevenue || 0,
                          }
                        })
                        const weekTotalCases = fullWeekDays.reduce((s, d) => s + d.checkupCount + d.revisitCount + d.sessionCount, 0)
                        const weekTotalRevenue = fullWeekDays.reduce((s, d) => s + d.checkupRevenue + d.revisitRevenue + d.sessionRevenue, 0)
                        return (
                          <>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                                <p className="text-[10px] text-muted-foreground">إجمالي حالات الأسبوع</p>
                                <p className="text-xl font-black text-emerald-600">{weekTotalCases}</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                                <p className="text-[10px] text-muted-foreground">إيراد الأسبوع</p>
                                <p className="text-xl font-black text-amber-600">{formatCurrency(weekTotalRevenue)}</p>
                              </div>
                            </div>
                            {fullWeekDays.map(day => {
                              const totalCases = day.checkupCount + day.revisitCount + day.sessionCount
                              const totalRev = day.checkupRevenue + day.revisitRevenue + day.sessionRevenue
                              const isToday = day.date === todayStr
                              const dayShortLabel = new Date(day.date + 'T12:00:00Z').toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', timeZone: 'Africa/Cairo' })
                              return (
                                <div key={day.date} className={cn('flex items-center justify-between p-2 rounded-lg', isToday ? 'bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700' : 'bg-muted/50')}>
                                  <div className="flex items-center gap-2">
                                    <span className={cn('text-xs font-bold', isToday ? 'text-emerald-900 dark:text-emerald-300' : 'text-emerald-700 dark:text-emerald-400')}>{day.dayName}</span>
                                    <span className="text-[10px] text-muted-foreground">{dayShortLabel}</span>
                                    {isToday && <Badge className="bg-emerald-500 text-white text-[7px] px-1 py-0">اليوم</Badge>}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold">{totalCases} حالة</span>
                                    <span className="text-[10px] font-bold text-emerald-600">{formatCurrency(totalRev)}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══ NEW: Detailed Monthly Report ═══ */}
                  <Card className="card-luxury border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Calendar size={18} className="text-blue-600" /> تقرير شهري مفصل</CardTitle></CardHeader>
                    <CardContent>
                      {(() => {
                        const cairoNow = getCairoDateParts()
                        const thisMonthPatients = patients.filter(p => { const pd = getCairoDateParts(p.createdAt); return pd.year === cairoNow.year && pd.month === cairoNow.month }).length
                        const thisMonthVisits = visits.filter(v => { const vd = getCairoDateParts(v.date); return vd.year === cairoNow.year && vd.month === cairoNow.month }).length
                        const thisMonthSessions = sessions.filter(s => { const sd = getCairoDateParts(s.date); return sd.year === cairoNow.year && sd.month === cairoNow.month }).length
                        const lastMonth = cairoNow.month === 1 ? 12 : cairoNow.month - 1
                        const lastMonthYear = cairoNow.month === 1 ? cairoNow.year - 1 : cairoNow.year
                        const lastMonthIncome = clinicTransactions.filter(t => { const td = getCairoDateParts(t.date); return t.type === 'income' && td.year === lastMonthYear && td.month === lastMonth }).reduce((s, t) => s + t.amount, 0)
                        const incomeChange = lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100) : 0
                        const thisMonthExpenses = clinicTransactions.filter(t => { const td = getCairoDateParts(t.date); return t.type === 'expense' && td.year === cairoNow.year && td.month === cairoNow.month }).reduce((s, t) => s + t.amount, 0)
                        return (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                              <p className="text-[10px] text-muted-foreground">مرضى جدد الشهر</p>
                              <p className="text-lg font-black text-blue-600">{thisMonthPatients}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20">
                              <p className="text-[10px] text-muted-foreground">زيارات الشهر</p>
                              <p className="text-lg font-black text-violet-600">{thisMonthVisits}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                              <p className="text-[10px] text-muted-foreground">جلسات الشهر</p>
                              <p className="text-lg font-black text-orange-600">{thisMonthSessions}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                              <p className="text-[10px] text-muted-foreground">إيراد الشهر</p>
                              <p className="text-lg font-black text-emerald-600">{formatCurrency(thisMonthIncome)}</p>
                              {incomeChange !== 0 && (
                                <div className={cn('flex items-center gap-1 text-[10px] font-bold', incomeChange > 0 ? 'text-emerald-600' : 'text-red-600')}>
                                  {incomeChange > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                  {Math.abs(incomeChange).toFixed(0)}% عن الشهر السابق
                                </div>
                              )}
                            </div>
                            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
                              <p className="text-[10px] text-muted-foreground">مصروفات الشهر</p>
                              <p className="text-lg font-black text-red-600">{formatCurrency(thisMonthExpenses)}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-900/20">
                              <p className="text-[10px] text-muted-foreground">صافي ربح الشهر</p>
                              <p className={cn('text-lg font-black', thisMonthIncome - thisMonthExpenses >= 0 ? 'text-cyan-600' : 'text-red-600')}>{formatCurrency(thisMonthIncome - thisMonthExpenses)}</p>
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══ NEW: Patient Age Distribution ═══ */}
                  <Card className="card-luxury border-2 border-amber-200 dark:border-amber-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Activity size={18} className="text-amber-600" /> توزيع المرضى حسب العمر</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const ageRanges = [
                          { label: '0-18', min: 0, max: 18, color: 'bg-sky-500' },
                          { label: '19-30', min: 19, max: 30, color: 'bg-emerald-500' },
                          { label: '31-45', min: 31, max: 45, color: 'bg-amber-500' },
                          { label: '46-60', min: 46, max: 60, color: 'bg-orange-500' },
                          { label: '60+', min: 61, max: 200, color: 'bg-rose-500' },
                        ]
                        const withData = ageRanges.map(range => {
                          const count = patients.filter(p => p.age && p.age >= range.min && p.age <= range.max).length
                          return { ...range, count, percent: patients.length > 0 ? (count / patients.length * 100) : 0 }
                        })
                        const maxCount = Math.max(...withData.map(r => r.count), 1)
                        return withData.map(range => (
                          <div key={range.label} className="p-2 rounded-xl bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold">{range.label} سنة</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">{range.count}</span>
                                <span className="text-[10px] text-muted-foreground">({range.percent.toFixed(0)}%)</span>
                              </div>
                            </div>
                            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(range.count / maxCount) * 100}%` }} transition={{ duration: 0.6 }} className={cn('absolute inset-y-0 right-0 rounded-full', range.color)} />
                            </div>
                          </div>
                        ))
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══ NEW: Diagnosis Distribution ═══ */}
                  <Card className="card-luxury border-2 border-rose-200 dark:border-rose-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><FileText size={18} className="text-rose-600" /> أكثر التشخيصات شيوعاً</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const diagMap: Record<string, number> = {}
                        visits.forEach(v => {
                          if (v.diagnosis) {
                            v.diagnosis.split(/[,،]/).forEach(d => {
                              const trimmed = d.trim()
                              if (trimmed) diagMap[trimmed] = (diagMap[trimmed] || 0) + 1
                            })
                          }
                        })
                        const sorted = Object.entries(diagMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
                        if (sorted.length === 0) return <p className="text-center text-muted-foreground text-sm py-4">لا توجد تشخيصات بعد</p>
                        return sorted.map(([diag, count], idx) => (
                          <div key={diag} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <div className={cn('w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-[10px]', idx < 3 ? 'bg-gradient-to-br from-rose-500 to-pink-600' : 'bg-gradient-to-br from-gray-400 to-gray-500')}>{idx + 1}</div>
                            <span className="text-xs font-medium truncate flex-1">{diag}</span>
                            <span className="text-xs font-bold text-rose-600">{count}</span>
                          </div>
                        ))
                      })()}
                    </CardContent>
                  </Card>
                </div>)}

                {/* Backup Sub-tab */}
                {moreSubTab === 'backup' && (<div className="space-y-4">
                  {/* Patient Data Copy Section - CSV & JSON Export */}
                  <Card className="card-luxury border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20">
                    <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck size={20} className="text-teal-600" /> نسخ بيانات المرضى</CardTitle><CardDescription>تصدير بيانات المرضى بصيغة CSV أو JSON (الاسم، العنوان، التشخيص، الملاحظات)</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      {/* Search */}
                      <div className="relative">
                        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500" />
                        <Input placeholder="بحث عن مريض بالاسم أو رقم الملف أو الموبايل..." className="input-luxury rounded-xl h-10 pr-9 border-teal-200 dark:border-teal-800 focus:border-teal-500" value={patientCopySearch} onChange={e => setPatientCopySearch(e.target.value)} />
                      </div>
                      {/* Export Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                          const filtered = patients.filter(p => {
                            if (!patientCopySearch.trim()) return true
                            const q = patientCopySearch.toLowerCase()
                            return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                          })
                          if (filtered.length === 0) return toast.error('لا توجد بيانات للتصدير')
                          const headers = ['رقم الملف', 'الاسم', 'الموبايل', 'الموبايل ٢', 'العنوان', 'العمر', 'الجنس', 'التشخيص', 'الملاحظات', 'الحساسية', 'التاريخ المرضي', 'تاريخ التسجيل']
                          const rows = filtered.map(p => {
                            const pv = visits.filter(v => v.patientId === p.id)
                            const diag = pv.length > 0 ? pv[pv.length - 1]?.diagnosis || '' : ''
                            return [
                              p.fileNumber || '',
                              p.name || '',
                              p.phone || '',
                              p.phone2 || '',
                              p.address || '',
                              p.age?.toString() || '',
                              p.gender || '',
                              diag,
                              p.notes || '',
                              p.allergies || '',
                              p.medicalHistory || '',
                              p.createdAt ? formatDate(p.createdAt) : ''
                            ].map(v => `"${(v || '').replace(/"/g, '""')}"`)
                          })
                          const csv = '\uFEFF' + headers.map(h => `"${h}"`).join(',') + '\n' + rows.map(r => r.join(',')).join('\n')
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a'); a.href = url; a.download = `elmoghazi-patients-${todayStr}.csv`; a.click(); URL.revokeObjectURL(url)
                          toast.success(`تم تصدير ${filtered.length} مريض بصيغة CSV ✓`)
                        }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all">
                          <FileDown size={14} /> تصدير CSV
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                          const filtered = patients.filter(p => {
                            if (!patientCopySearch.trim()) return true
                            const q = patientCopySearch.toLowerCase()
                            return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                          })
                          if (filtered.length === 0) return toast.error('لا توجد بيانات للتصدير')
                          const jsonData = filtered.map(p => {
                            const pv = visits.filter(v => v.patientId === p.id)
                            const diag = pv.length > 0 ? pv[pv.length - 1]?.diagnosis || '' : ''
                            return {
                              fileNumber: p.fileNumber || '',
                              name: p.name,
                              phone: p.phone || '',
                              phone2: p.phone2 || '',
                              address: p.address || '',
                              age: p.age || null,
                              gender: p.gender || '',
                              diagnosis: diag,
                              notes: p.notes || '',
                              allergies: p.allergies || '',
                              medicalHistory: p.medicalHistory || '',
                              createdAt: p.createdAt || ''
                            }
                          })
                          const json = JSON.stringify({ exportedAt: cairoISO(), totalPatients: jsonData.length, patients: jsonData }, null, 2)
                          const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a'); a.href = url; a.download = `elmoghazi-patients-${todayStr}.json`; a.click(); URL.revokeObjectURL(url)
                          toast.success(`تم تصدير ${filtered.length} مريض بصيغة JSON ✓`)
                        }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all">
                          <FileDown size={14} /> تصدير JSON
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={async () => {
                          const filtered = patients.filter(p => {
                            if (!patientCopySearch.trim()) return true
                            const q = patientCopySearch.toLowerCase()
                            return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                          })
                          if (filtered.length === 0) return toast.error('لا توجد بيانات للنسخ')
                          const allText = filtered.map(p => {
                            const pv = visits.filter(v => v.patientId === p.id)
                            const diag = pv.length > 0 ? pv[pv.length - 1]?.diagnosis || '' : ''
                            return `الاسم: ${p.name}${p.address ? ' | العنوان: ' + p.address : ''}${diag ? ' | التشخيص: ' + diag : ''}${p.notes ? ' | الملاحظات: ' + p.notes : ''}`
                          }).join('\n')
                          try { await navigator.clipboard.writeText(allText); toast.success('تم نسخ بيانات جميع المرضى ✓') } catch {
                            const ta = document.createElement('textarea'); ta.value = allText; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast.success('تم نسخ بيانات جميع المرضى ✓')
                          }
                        }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-teal-400 to-cyan-500 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all">
                          <Copy size={14} /> نسخ نصي
                        </motion.button>
                      </div>
                      {/* Patient List */}
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {patients.filter(p => {
                          if (!patientCopySearch.trim()) return true
                          const q = patientCopySearch.toLowerCase()
                          return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                        }).slice(0, 50).map(p => {
                          const patientVisits = visits.filter(v => v.patientId === p.id)
                          const latestDiagnosis = patientVisits.length > 0 ? patientVisits[patientVisits.length - 1]?.diagnosis || '' : ''
                          const copyText = `الاسم: ${p.name}${p.address ? '\nالعنوان: ' + p.address : ''}${latestDiagnosis ? '\nالتشخيص: ' + latestDiagnosis : ''}${p.notes ? '\nالملاحظات: ' + p.notes : ''}`
                          const wp = p.phone ? waPhone(p.phone) : ''
                          return (
                            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-teal-100 dark:border-teal-900/50 hover:border-teal-300 dark:hover:border-teal-700 transition-all">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold truncate">{p.name}</p>
                                  <Badge variant="outline" className="text-[8px] h-4 border-teal-300 text-teal-600">{p.fileNumber}</Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                  {p.phone && <span>📞 {p.phone}</span>}
                                  {p.address && <span className="mr-2">📍 {p.address}</span>}
                                  {latestDiagnosis && <span className="mr-2">🩺 {latestDiagnosis}</span>}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {wp && <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
                                  const msg = encodeURIComponent(copyText)
                                  window.open(`https://wa.me/${wp}?text=${msg}`, '_blank')
                                }} className="h-7 w-7 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 transition-all" title="إرسال واتساب">
                                  <Send size={12} />
                                </motion.button>}
                                <motion.button whileTap={{ scale: 0.9 }} onClick={async () => {
                                  try { await navigator.clipboard.writeText(copyText); toast.success(`تم نسخ بيانات ${p.name} ✓`) } catch {
                                    const ta = document.createElement('textarea'); ta.value = copyText; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast.success(`تم نسخ بيانات ${p.name} ✓`)
                                  }
                                }} className="h-7 w-7 rounded-lg flex items-center justify-center bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 transition-all" title="نسخ البيانات">
                                  <Copy size={12} />
                                </motion.button>
                              </div>
                            </div>
                          )
                        })}
                        {patients.length === 0 && <div className="text-center py-6 text-muted-foreground"><Users size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">لا يوجد مرضى</p></div>}
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-[10px] text-muted-foreground">
                        <span>يتم التصدير: رقم الملف + الاسم + الموبايل + العنوان + التشخيص + الملاحظات + الحساسية + التاريخ المرضي</span>
                        <Badge variant="outline" className="text-[9px] border-teal-300 text-teal-600">{patients.filter(p => {
                          if (!patientCopySearch.trim()) return true
                          const q = patientCopySearch.toLowerCase()
                          return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                        }).length} مريض</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Database size={20} /> النسخ الاحتياطي</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Timer className="text-blue-600" size={18} /></div><div><p className="font-medium text-sm">نسخ تلقائي</p><p className="text-xs text-muted-foreground">كل فترة محددة</p></div></div><Switch checked={autoBackup} onCheckedChange={setAutoBackup} /></div>
                    {autoBackup && <Select value={String(backupInterval)} onValueChange={v => setBackupInterval(Number(v))}><SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 دقيقة</SelectItem><SelectItem value="30">30 دقيقة</SelectItem><SelectItem value="60">ساعة</SelectItem><SelectItem value="360">6 ساعات</SelectItem><SelectItem value="1440">يومياً</SelectItem></SelectContent></Select>}
                    {lastBackup && <p className="text-xs text-muted-foreground">آخر نسخة: {formatDate(lastBackup)}</p>}
                    {/* ─── Backup Actions Grid ─── */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={createBackup} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800"><HardDrive className="text-emerald-600" size={24} /><span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">إنشاء نسخة</span></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => exportBackup('json')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"><FileDown className="text-blue-600" size={24} /><span className="text-sm font-medium text-blue-700 dark:text-blue-400">تصدير JSON</span></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => { fileInputRef.current?.click() }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800"><FileUp className="text-amber-600" size={24} /><span className="text-sm font-medium text-amber-700 dark:text-amber-400">استيراد نسخة</span></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => exportBackup('csv')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 border border-violet-200 dark:border-violet-800"><Archive className="text-violet-600" size={24} /><span className="text-sm font-medium text-violet-700 dark:text-violet-400">تصدير CSV</span></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                        // Export patients only (clean JSON for sharing/import)
                        const cleanPatients = patients.map(stripVirtualFields).map(p => ({
                          name: p.name, phone: p.phone || '', phone2: p.phone2 || '',
                          age: p.age || null, gender: p.gender || '',
                          bloodType: p.bloodType || '', address: p.address || '',
                          notes: p.notes || '', allergies: p.allergies || '',
                          medicalHistory: p.medicalHistory || '',
                        }))
                        const json = JSON.stringify({ exportedAt: cairoISO(), type: 'patients-only', totalPatients: cleanPatients.length, patients: cleanPatients }, null, 2)
                        const blob = new Blob([json], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a'); a.href = url; a.download = `elmoghazi-patients-only-${todayStr}.json`; a.click(); URL.revokeObjectURL(url)
                        toast.success(`تم تصدير ${cleanPatients.length} مريض ✓`)
                      }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-800"><Users size={24} className="text-rose-600" /><span className="text-sm font-medium text-rose-700 dark:text-rose-400">تصدير أسماء المرضى</span></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => { patientImportInputRef.current?.click() }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800"><UserPlus size={24} className="text-cyan-600" /><span className="text-sm font-medium text-cyan-700 dark:text-cyan-400">استيراد أسماء المرضى</span></motion.button>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".json,.csv" className="hidden" onChange={handleFileImport} />
                    <input ref={patientImportInputRef} type="file" accept=".json,.csv,.xlsx,.xls,.tsv,.txt" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return
                      try {
                        setPatientImportProgress('جاري قراءة الملف...')
                        const parsed = await parsePatientFile(file)
                        setPatientImportData(parsed)
                        setPatientImportFile(file)
                        setPatientImportPreview(true)
                        setPatientImportProgress('')
                      } catch (err: any) {
                        toast.error(err.message || 'فشل قراءة الملف')
                        setPatientImportProgress('')
                      }
                      e.target.value = ''
                    }} />
                    {/* ─── Patient Import Preview (Professional) ─── */}
                    {patientImportPreview && <Card className="border-2 border-cyan-400 dark:border-cyan-600 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                          <UserPlus size={20} /> استيراد بيانات المرضى
                          <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 text-[10px]">{patientImportFile?.name}</Badge>
                        </CardTitle>
                        <CardDescription>مراجعة البيانات قبل الاستيراد — يتم تخطي المرضى المكررين تلقائياً</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2.5 rounded-xl bg-cyan-100/60 dark:bg-cyan-900/30 text-center">
                            <p className="text-[10px] text-muted-foreground">إجمالي</p>
                            <p className="text-lg font-black text-cyan-700 dark:text-cyan-300">{patientImportData.length}</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 text-center">
                            <p className="text-[10px] text-muted-foreground">أسماء صالحة</p>
                            <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{patientImportData.filter(p => p.name).length}</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 text-center">
                            <p className="text-[10px] text-muted-foreground">مكرر محتمل</p>
                            <p className="text-lg font-black text-amber-700 dark:text-amber-300">{patientImportData.filter(p => p.name && patients.some(ep => ep.name === p.name && (ep.phone === p.phone || (!ep.phone && !p.phone)))).length}</p>
                          </div>
                        </div>
                        {/* Patient List Preview */}
                        <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-cyan-200 dark:border-cyan-800 p-2">
                          {patientImportData.filter(p => p.name).slice(0, 80).map((p, i) => {
                            const isDuplicate = patients.some(ep => ep.name === p.name && (ep.phone === p.phone || (!ep.phone && !p.phone)))
                            return (
                              <div key={i} className={cn('flex items-center gap-2 p-2 rounded-lg text-xs transition-all', isDuplicate ? 'bg-amber-50 dark:bg-amber-900/20 opacity-60' : 'bg-white/60 dark:bg-black/20')}>
                                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-[9px] font-bold text-cyan-700">{i + 1}</span>
                                <span className="font-bold text-cyan-800 dark:text-cyan-300 min-w-[80px] truncate">{p.name}</span>
                                {p.phone && <span className="text-muted-foreground text-[10px]">📞 {p.phone}</span>}
                                {p.age && <span className="text-muted-foreground text-[10px]">{p.age} سنة</span>}
                                {p.gender && <span className="text-muted-foreground text-[10px]">{p.gender === 'male' ? '♂' : p.gender === 'female' ? '♀' : p.gender}</span>}
                                {p.address && <span className="text-muted-foreground text-[10px] truncate max-w-[80px]">📍 {p.address}</span>}
                                {isDuplicate && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-[7px] px-1">مكرر</Badge>}
                              </div>
                            )
                          })}
                          {patientImportData.filter(p => p.name).length > 80 && <p className="text-center text-xs text-muted-foreground py-2">... و {patientImportData.filter(p => p.name).length - 80} مريض آخر</p>}
                        </div>
                        {/* Progress */}
                        {patientImportProgress && <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center"><p className="text-sm font-bold text-blue-700 dark:text-blue-300">{patientImportProgress}</p></div>}
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button className="flex-1 rounded-xl bg-gradient-to-l from-cyan-500 to-blue-600 text-white font-bold h-11" disabled={patientImportLoading} onClick={async () => {
                            setPatientImportLoading(true)
                            setPatientImportProgress('جاري استيراد البيانات...')
                            try {
                              // Use bulk import API for efficiency
                              const validPatients = patientImportData.filter(p => p.name)
                              const result: any = await apiFetch('/patients/import', {
                                method: 'POST',
                                body: JSON.stringify({ patients: validPatients }),
                              })
                              await loadAllData()
                              setPatientImportPreview(false)
                              setPatientImportData([])
                              setPatientImportFile(null)
                              if (result.skipped > 0) {
                                toast.success(`تم استيراد ${result.imported} مريض ✓ (تم تخطي ${result.skipped} مكرر/غير صالح)`)
                              } else {
                                toast.success(`تم استيراد ${result.imported} مريض بنجاح ✓`)
                              }
                            } catch (err: any) {
                              toast.error('خطأ في الاستيراد: ' + (err.message || ''))
                            } finally {
                              setPatientImportLoading(false)
                              setPatientImportProgress('')
                            }
                          }}>
                            {patientImportLoading ? <RefreshCw size={16} className="animate-spin ml-2" /> : <UserPlus size={16} className="ml-2" />}
                            {patientImportLoading ? 'جاري الاستيراد...' : `تأكيد استيراد ${patientImportData.filter(p => p.name).length} مريض`}
                          </Button>
                          <Button variant="outline" className="rounded-xl h-11" disabled={patientImportLoading} onClick={() => { setPatientImportPreview(false); setPatientImportData([]); setPatientImportFile(null) }}>إلغاء</Button>
                        </div>
                      </CardContent>
                    </Card>}
                    {/* ─── Stored Backups List ─── */}
                    {backups.length > 0 && <div className="space-y-2">{backups.map(b => <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"><div className="flex items-center gap-2"><Database size={14} className="text-muted-foreground" /><span>{b.type === 'auto' ? 'تلقائي' : b.type === 'export' ? 'تصدير' : 'يدوي'}</span></div><div className="flex items-center gap-2"><Badge variant="outline" className={b.status === 'completed' ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}>{b.status === 'completed' ? 'مكتمل' : b.status}</Badge></div></div>)}</div>}
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
                        <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="✏️ أضف ملاحظة جديدة..." className="input-luxury rounded-xl h-10 flex-1 border-fuchsia-200 dark:border-fuchsia-800 focus:border-fuchsia-500" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: newNoteSection, createdAt: cairoISO() }, setNotes); setQuickNote('') } }} />
                        <Select value={newNoteSection} onValueChange={setNewNoteSection}><SelectTrigger className="rounded-xl h-10 w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">📌 عام</SelectItem><SelectItem value="dashboard">🏠 رئيسية</SelectItem><SelectItem value="patients">👥 مرضى</SelectItem><SelectItem value="laser">💎 ليزر</SelectItem><SelectItem value="finance">💰 مالية</SelectItem></SelectContent></Select>
                        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-xl bg-gradient-to-l from-fuchsia-500 to-violet-500 text-white font-bold shadow-lg" onClick={() => { if (quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: newNoteSection, createdAt: cairoISO() }, setNotes); setQuickNote('') } }}><Plus size={18} /></motion.button>
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
                          <Input type="password" value={(sectionPasswords as Record<string,string>)[s.key] || ''} onChange={e => setSectionPasswords({ ...sectionPasswords, [s.key]: e.target.value })} placeholder="كلمة السر" className="w-28 h-8 text-xs rounded-lg" />
                          {(sectionPasswords as Record<string,string>)[s.key] && <Button variant="ghost" size="sm" className="h-8 text-[10px] text-red-500" onClick={() => setSectionPasswords({ ...sectionPasswords, [s.key]: '' })}>إلغاء</Button>}
                        </div>
                      </div>
                    ))}
                  </CardContent></Card>

                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><RefreshCw size={20} className="text-blue-500" /> حالة المزامنة</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-xl">🔄</motion.div><div><p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">متصل</p><p className="text-[9px] text-muted-foreground">CockroachDB - سحابي (Vercel)</p></div></div>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">نشط ✓</Badge>
                    </div>
                    {/* Database Details */}
                    <div className="space-y-2 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center gap-2 mb-2"><Database size={14} className="text-blue-500" /><p className="text-xs font-bold text-blue-700 dark:text-blue-300">تفاصيل قاعدة البيانات</p></div>
                      <div className="grid grid-cols-1 gap-1.5 text-[10px]">
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">نوع القاعدة</span><span className="font-bold">CockroachDB (سحابي)</span></div>
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">المزود</span><span className="font-bold">Vercel Postgres</span></div>
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">الموقع</span><span className="font-bold">سحابي (أونلاين)</span></div>
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">المزامنة</span><span className="font-bold text-emerald-600">تلقائية (فوري)</span></div>
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">الإتصال</span><span className="font-bold text-emerald-600">HTTPS مشفر</span></div>
                      </div>
                    </div>
                    {/* How Sync Works */}
                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                      <div className="flex items-center gap-2 mb-2"><Lightbulb size={14} className="text-amber-500" /><p className="text-xs font-bold text-amber-700 dark:text-amber-300">كيف تعمل المزامنة؟</p></div>
                      <div className="space-y-1.5 text-[10px] text-muted-foreground">
                        <p>• البيانات محفوظة على السحابة مباشرة في قاعدة CockroachDB</p>
                        <p>• أي تعديل من أي جهاز يتحدث فوراً في القاعدة السحابية</p>
                        <p>• لما تفتح التطبيق من أي جهاز تاني، بتحمل أحدث البيانات تلقائي</p>
                        <p>• النسخ الاحتياطي بيعمل نسخة من كل البيانات ويحفظها في القاعدة</p>
                        <p>• ممكن تصدر نسخة احتياطية كملف JSON أو CSV وتحمّلها على جهازك</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"><p className="text-[9px] text-muted-foreground">المرضى</p><p className="text-sm font-bold text-blue-600">{patients.length}</p></div>
                      <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-center"><p className="text-[9px] text-muted-foreground">الزيارات</p><p className="text-sm font-bold text-violet-600">{visits.length}</p></div>
                      <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center"><p className="text-[9px] text-muted-foreground">الجلسات</p><p className="text-sm font-bold text-orange-600">{sessions.length}</p></div>
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center"><p className="text-[9px] text-muted-foreground">المعاملات</p><p className="text-sm font-bold text-emerald-600">{transactions.length}</p></div>
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center"><p className="text-[9px] text-muted-foreground">سجلات الليزر</p><p className="text-sm font-bold text-purple-600">{laserRecords.length}</p></div>
                      <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-center"><p className="text-[9px] text-muted-foreground">المتابعات</p><p className="text-sm font-bold text-cyan-600">{followUpRecords.length}</p></div>
                    </div>
                    {lastBackup && <p className="text-[10px] text-muted-foreground text-center">آخر نسخة احتياطية: {formatDate(lastBackup)}</p>}
                  </CardContent></Card>

                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Palette size={20} /> ألوان التطبيق</CardTitle><CardDescription>10 ألوان مميزة</CardDescription></CardHeader><CardContent><div className="grid grid-cols-5 gap-3">{THEME_CONFIGS.map(tc => <motion.button key={tc.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} onClick={() => setTheme(tc.id)} className={cn('theme-swatch flex flex-col items-center justify-center gap-1 p-2', theme === tc.id && 'selected')} style={{ background: `linear-gradient(135deg, ${tc.primary}, ${tc.primaryDark})` }}><span className="text-xl">{tc.icon}</span><span className="text-[9px] font-bold text-white/90 truncate w-full text-center">{tc.name}</span>{theme === tc.id && <CheckCircle className="text-white absolute top-1 right-1" size={14} />}</motion.button>)}</div></CardContent></Card>
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Tag size={20} /> ألوان الحالات</CardTitle></CardHeader><CardContent className="space-y-3">{[
                    { key: 'completed' as const, label: 'مكتمل' }, { key: 'active' as const, label: 'نشط' }, { key: 'pending' as const, label: 'قيد الانتظار' }, { key: 'cancelled' as const, label: 'ملغي' }, { key: 'scheduled' as const, label: 'مجدول' },
                  ].map(s => <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span className="text-sm font-medium">{s.label}</span><div className="flex items-center gap-2"><input type="color" value={statusColors[s.key]} onChange={e => setStatusColors({ ...statusColors, [s.key]: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border-0" /><Badge style={{ backgroundColor: statusColors[s.key] + '20', color: statusColors[s.key] }} className="border">{statusColors[s.key]}</Badge></div></div>)}</CardContent></Card>
                  <Card className="card-luxury"><CardHeader><CardTitle>إعدادات عامة</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">الوضع الداكن</p></div><Switch checked={darkMode} onCheckedChange={setDarkMode} /></div>
                  </CardContent></Card>
                </div>)}

                {/* ═══ Personal Section - شخصى ═══ */}
                {moreSubTab === 'personal' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Header */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-orange-400 via-rose-400 to-amber-500 p-5 text-white shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                      {[...Array(5)].map((_, i) => <div key={i} className="absolute rounded-full bg-white" style={{ width: `${30 + i * 15}px`, height: `${30 + i * 15}px`, top: `${10 + i * 15}%`, left: `${5 + i * 18}%`, opacity: 0.15 }} />)}
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                      <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-4xl">🌟</motion.div>
                      <div>
                        <h1 className="text-2xl font-bold">قسم شخصى</h1>
                        <p className="text-white/80 text-sm">إدارة ماليتك وتذكيراتك وملاحظاتك الشخصية</p>
                      </div>
                    </div>
                  </div>

                  {/* Smart Search */}
                  <div className="relative">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400" />
                    <Input value={personalSearchQuery} onChange={e => setPersonalSearchQuery(e.target.value)} placeholder="بحث ذكي في البيانات الشخصية..." className="pr-9 rounded-xl border-orange-200 dark:border-orange-900/30 focus-visible:ring-orange-400" />
                    {personalSearchQuery && personalSearchResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-orange-100 dark:border-orange-900/30 max-h-64 overflow-y-auto">
                        {personalSearchResults.map((r, i) => (
                          <div key={`${r.type}-${r.id}-${i}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors border-b last:border-0 border-orange-50 dark:border-orange-950/10">
                            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">{r.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{r.label}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                            </div>
                            <Badge variant="outline" className="text-[9px]">{r.type === 'transaction' ? 'معاملة' : r.type === 'reminder' ? 'تذكير' : r.type === 'patient' ? 'مريض' : 'ملاحظة'}</Badge>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Sub-tabs */}
                  <div className="flex gap-2 bg-muted/50 p-1.5 rounded-xl">
                    {[
                      { id: 'finance' as const, label: 'المالية', icon: <Wallet size={16} /> },
                      { id: 'reminders' as const, label: 'التذكيرات', icon: <Bell size={16} /> },
                      { id: 'notes' as const, label: 'الملاحظات', icon: <StickyNote size={16} /> },
                      { id: 'reports' as const, label: 'التقارير', icon: <BarChart3 size={16} /> },
                    ].map(tab => (
                      <motion.button key={tab.id} whileTap={{ scale: 0.95 }} onClick={() => setPersonalSubTab(tab.id)} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all', personalSubTab === tab.id ? 'bg-gradient-to-l from-orange-500 to-amber-500 text-white shadow-md' : 'text-muted-foreground hover:bg-muted')}>
                        {tab.icon}
                        {tab.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Finance Sub-tab */}
                  {personalSubTab === 'finance' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white shadow-md">
                        <div className="flex items-center gap-1.5 mb-1"><TrendingUp size={14} className="text-white/80" /><span className="text-[10px] text-white/80">إيرادات</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalTotalIncome)}</p>
                      </motion.div>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-xl bg-gradient-to-br from-rose-500 to-red-600 p-3 text-white shadow-md">
                        <div className="flex items-center gap-1.5 mb-1"><TrendingDown size={14} className="text-white/80" /><span className="text-[10px] text-white/80">مصروفات</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalTotalExpense)}</p>
                      </motion.div>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={cn('rounded-xl p-3 text-white shadow-md', personalNetBalance >= 0 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-700')}>
                        <div className="flex items-center gap-1.5 mb-1"><PiggyBank size={14} className="text-white/80" /><span className="text-[10px] text-white/80">الرصيد</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalNetBalance)}</p>
                      </motion.div>
                    </div>

                    {/* Monthly Chart */}
                    {personalMonthlyChart.length > 0 && (
                      <Card className="card-luxury overflow-hidden">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 size={16} className="text-orange-500" /> مقارنة شهرية</CardTitle></CardHeader>
                        <CardContent className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={personalMonthlyChart} barGap={4}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <RechartsTooltip />
                              <Bar dataKey="income" fill="#10b981" name="إيرادات" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="expense" fill="#f43f5e" name="مصروفات" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                        {(['all', 'income', 'expense'] as const).map(f => (
                          <button key={f} onClick={() => setPersonalTxnFilter(f)} className={cn('px-3 py-1 rounded-md text-xs font-medium transition-all', personalTxnFilter === f ? 'bg-orange-500 text-white shadow' : 'text-muted-foreground hover:bg-muted')}>
                            {f === 'all' ? 'الكل' : f === 'income' ? 'إيرادات' : 'مصروفات'}
                          </button>
                        ))}
                      </div>
                      <Select value={personalTxnCategoryFilter} onValueChange={setPersonalTxnCategoryFilter}>
                        <SelectTrigger className="w-32 h-8 text-xs rounded-lg"><SelectValue placeholder="كل الفئات" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل الفئات</SelectItem>
                          {[...PERSONAL_INCOME_CATS, ...PERSONAL_EXPENSE_CATS].filter((v, i, a) => a.indexOf(v) === i).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button className="mr-auto bg-gradient-to-l from-orange-500 to-amber-500 text-white rounded-xl" onClick={() => { setEditingPersonalTxnId(null); setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' }); setShowAddPersonalTxn(true) }}>
                        <Plus size={14} className="ml-1" /> معاملة
                      </Button>
                    </div>
                    {/* Date Range Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-orange-500" />
                        <span className="text-xs text-muted-foreground">من:</span>
                        <Input type="date" value={personalDateFrom} onChange={e => setPersonalDateFrom(e.target.value)} className="h-8 text-xs rounded-lg w-36" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">إلى:</span>
                        <Input type="date" value={personalDateTo} onChange={e => setPersonalDateTo(e.target.value)} className="h-8 text-xs rounded-lg w-36" />
                      </div>
                      {(personalDateFrom || personalDateTo) && (
                        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => { setPersonalDateFrom(''); setPersonalDateTo('') }}>مسح التاريخ</Button>
                      )}
                    </div>

                    {/* Transaction List */}
                    {filteredPersonalTxns.length === 0 && (
                      <Card className="card-luxury p-8 text-center">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">💰</motion.div>
                        <p className="text-muted-foreground">لا توجد معاملات شخصية بعد</p>
                        <p className="text-xs text-muted-foreground mt-1">أضف أول معاملة لتتبع ماليتك الشخصية</p>
                      </Card>
                    )}
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                      {filteredPersonalTxns.map((txn, i) => (
                        <motion.div key={txn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-orange-100 dark:border-orange-900/30 hover:shadow-md transition-all">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', txn.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30')}>
                              {txn.type === 'income' ? <TrendingUp size={16} className="text-emerald-600" /> : <TrendingDown size={16} className="text-rose-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{txn.description || txn.category}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(txn.date)} • {txn.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn('font-bold text-sm', txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
                              {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                            </span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditPersonalTxn(txn)}>
                              <Edit3 size={12} className="text-orange-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePersonalTransaction(txn.id)}>
                              <Trash2 size={12} className="text-red-500" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  )}

                  {/* Reminders Sub-tab */}
                  {personalSubTab === 'reminders' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Bell size={18} className="text-amber-500" /> التذكيرات الشخصية</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{personalReminders.length} تذكير</Badge>
                        <Button className="bg-gradient-to-l from-amber-500 to-violet-500 text-white rounded-xl" onClick={() => { setEditingPersonalReminderId(null); setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' }); setShowAddPersonalReminder(true) }}>
                          <Plus size={14} className="ml-1" /> تذكير
                        </Button>
                      </div>
                    </div>
                    {personalReminders.length === 0 && (
                      <Card className="card-luxury p-8 text-center">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">⏰</motion.div>
                        <p className="text-muted-foreground">لا توجد تذكيرات شخصية بعد</p>
                      </Card>
                    )}
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                      {personalReminders.map((reminder, i) => (
                        <motion.div key={reminder.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={cn('relative p-3 rounded-xl border-r-4 bg-white/50 dark:bg-white/5 border border-orange-100 dark:border-orange-900/30 hover:shadow-md transition-all', reminder.status === 'done' ? 'border-r-emerald-500 opacity-60' : 'border-r-amber-500', celebratingPersonalId === reminder.id && 'ring-2 ring-amber-400 ring-offset-2')}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {reminder.status === 'done' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Clock size={14} className="text-amber-500" />}
                                <p className={cn('font-medium text-sm', reminder.status === 'done' && 'line-through text-muted-foreground')}>{reminder.title}</p>
                              </div>
                              {reminder.description && <p className="text-xs text-muted-foreground mb-1">{reminder.description}</p>}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar size={10} /> {formatDate(reminder.date)}
                                <Badge variant="outline" className="text-[9px]">{reminder.type}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePersonalReminderDone(reminder)}>
                                {reminder.status === 'done' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <CheckCircle size={14} className="text-muted-foreground" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditPersonalReminder(reminder)}>
                                <Edit3 size={12} className="text-amber-500" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePersonalReminder(reminder.id)}>
                                <Trash2 size={12} className="text-red-500" />
                              </Button>
                            </div>
                          </div>
                          {celebratingPersonalId === reminder.id && (
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute top-1 left-1 text-lg">🎉</motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  )}

                  {/* Notes Sub-tab */}
                  {personalSubTab === 'notes' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg flex items-center gap-2"><StickyNote size={18} className="text-sky-500" /> الملاحظات الشخصية</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{personalNotes.length} ملاحظة</Badge>
                        <Button className="bg-gradient-to-l from-sky-500 to-violet-500 text-white rounded-xl" onClick={() => { setPersonalNoteForm({ content: '', important: false }); setShowAddPersonalNote(true) }}>
                          <Plus size={14} className="ml-1" /> ملاحظة
                        </Button>
                      </div>
                    </div>
                    {personalNotes.length === 0 && (
                      <Card className="card-luxury p-8 text-center">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">📝</motion.div>
                        <p className="text-muted-foreground">لا توجد ملاحظات شخصية بعد</p>
                      </Card>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {personalNotes.map((note, i) => (
                        <motion.div key={note.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className={cn('relative p-3 rounded-xl border bg-white/50 dark:bg-white/5 hover:shadow-md transition-all', note.important ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/10' : 'border-sky-100 dark:border-sky-900/30')}>
                          {note.important && (
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute top-2 left-2">
                              <Star size={14} className="text-amber-500 fill-amber-500" />
                            </motion.div>
                          )}
                          {editingPersonalNoteId === note.id ? (
                            <div className="space-y-2">
                              <Textarea value={editingPersonalNoteContent} onChange={e => setEditingPersonalNoteContent(e.target.value)} className="min-h-16 text-sm rounded-xl" autoFocus />
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-sky-500 text-white rounded-lg text-xs" onClick={() => editPersonalNote(note.id, editingPersonalNoteContent, note.important)}>حفظ</Button>
                                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditingPersonalNoteId(null)}>إلغاء</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm whitespace-pre-wrap mb-2 pl-6">{note.content}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground">{formatDate(note.createdAt)}</p>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePersonalNoteImportance(note)}>
                                    {note.important ? <Star size={12} className="text-amber-500 fill-amber-500" /> : <StarOff size={12} className="text-muted-foreground" />}
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingPersonalNoteId(note.id); setEditingPersonalNoteContent(note.content) }}>
                                    <Edit3 size={12} className="text-sky-500" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deletePersonalNote(note.id)}>
                                    <Trash2 size={12} className="text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  )}

                  {/* Reports Sub-tab */}
                  {personalSubTab === 'reports' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg flex items-center gap-2"><BarChart3 size={18} className="text-violet-500" /> تقارير شخصية</h3>
                    </div>

                    {/* Period Selector */}
                    <div className="flex gap-2 bg-muted/50 p-1 rounded-xl">
                      {([
                        { id: 'daily' as const, label: 'يومي', emoji: '📅' },
                        { id: 'weekly' as const, label: 'أسبوعي', emoji: '📆' },
                        { id: 'monthly' as const, label: 'شهري', emoji: '🗓️' },
                      ]).map(p => (
                        <motion.button key={p.id} whileTap={{ scale: 0.95 }} onClick={() => setPersonalReportPeriod(p.id)} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all', personalReportPeriod === p.id ? 'bg-gradient-to-l from-violet-500 to-purple-600 text-white shadow-md' : 'text-muted-foreground hover:bg-muted')}>
                          <span>{p.emoji}</span> {p.label}
                        </motion.button>
                      ))}
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white shadow-md">
                        <div className="flex items-center gap-1.5 mb-1"><TrendingUp size={14} className="text-white/80" /><span className="text-[10px] text-white/80">إيرادات</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalReportData.totalIncome)}</p>
                        <p className="text-[9px] text-white/60 mt-0.5">{personalReportData.incomeCount} معاملة</p>
                      </motion.div>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-xl bg-gradient-to-br from-rose-500 to-red-600 p-3 text-white shadow-md">
                        <div className="flex items-center gap-1.5 mb-1"><TrendingDown size={14} className="text-white/80" /><span className="text-[10px] text-white/80">مصروفات</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalReportData.totalExpense)}</p>
                        <p className="text-[9px] text-white/60 mt-0.5">{personalReportData.expenseCount} معاملة</p>
                      </motion.div>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={cn('rounded-xl p-3 text-white shadow-md', personalReportData.netBalance >= 0 ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-red-600 to-rose-700')}>
                        <div className="flex items-center gap-1.5 mb-1"><PiggyBank size={14} className="text-white/80" /><span className="text-[10px] text-white/80">الصافي</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalReportData.netBalance)}</p>
                        <p className="text-[9px] text-white/60 mt-0.5">{personalReportData.transactionCount} إجمالي</p>
                      </motion.div>
                    </div>

                    {/* Bar Chart */}
                    {personalReportData.chartData.length > 0 && (
                      <Card className="card-luxury overflow-hidden">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 size={16} className="text-violet-500" /> مقارنة {personalReportPeriod === 'daily' ? 'يومية' : personalReportPeriod === 'weekly' ? 'أسبوعية' : 'شهرية'}</CardTitle></CardHeader>
                        <CardContent className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={personalReportData.chartData} barGap={4}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <RechartsTooltip />
                              <Bar dataKey="income" fill="#10b981" name="إيرادات" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="expense" fill="#f43f5e" name="مصروفات" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Category Breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Income by Category */}
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500" /> إيرادات حسب الفئة</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(personalReportData.incomeByCategory).length === 0 && <p className="text-xs text-muted-foreground text-center py-2">لا توجد إيرادات</p>}
                          {Object.entries(personalReportData.incomeByCategory).sort(([,a],[,b]) => b - a).map(([cat, amount]) => {
                            const pct = personalReportData.totalIncome > 0 ? Math.round((amount / personalReportData.totalIncome) * 100) : 0
                            return (
                              <div key={cat} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">{cat}</span>
                                  <span className="text-emerald-600 font-bold">{formatCurrency(amount)} ({pct}%)</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-full bg-emerald-500 rounded-full" />
                                </div>
                              </div>
                            )
                          })}
                        </CardContent>
                      </Card>
                      {/* Expense by Category */}
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingDown size={14} className="text-rose-500" /> مصروفات حسب الفئة</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(personalReportData.expenseByCategory).length === 0 && <p className="text-xs text-muted-foreground text-center py-2">لا توجد مصروفات</p>}
                          {Object.entries(personalReportData.expenseByCategory).sort(([,a],[,b]) => b - a).map(([cat, amount]) => {
                            const pct = personalReportData.totalExpense > 0 ? Math.round((amount / personalReportData.totalExpense) * 100) : 0
                            return (
                              <div key={cat} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">{cat}</span>
                                  <span className="text-rose-600 font-bold">{formatCurrency(amount)} ({pct}%)</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-full bg-rose-500 rounded-full" />
                                </div>
                              </div>
                            )
                          })}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Expense Pie Chart */}
                    {personalReportData.expensePieData.length > 0 && (
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><PieChart size={14} className="text-rose-500" /> توزيع المصروفات</CardTitle></CardHeader>
                        <CardContent className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={personalReportData.expensePieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {personalReportData.expensePieData.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                              </Pie>
                              <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Top Expenses */}
                    {personalReportData.topExpenses.length > 0 && (
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame size={14} className="text-orange-500" /> أعلى المصروفات</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          {personalReportData.topExpenses.map((t, i) => (
                            <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/10">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{t.description || t.category}</p>
                                <p className="text-[10px] text-muted-foreground">{t.category} • {formatDate(t.date)}</p>
                              </div>
                              <span className="text-rose-600 font-bold text-sm">{formatCurrency(t.amount)}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Reminders & Notes Summary */}
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bell size={14} className="text-amber-500" /> التذكيرات</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                            <span className="text-xs">إجمالي التذكيرات</span>
                            <Badge className="bg-amber-100 text-amber-700 text-xs">{personalReportData.periodReminders}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                            <span className="text-xs">مكتملة</span>
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">{personalReportData.doneReminders}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10">
                            <span className="text-xs">قيد الانتظار</span>
                            <Badge className="bg-orange-100 text-orange-700 text-xs">{personalReportData.pendingReminders}</Badge>
                          </div>
                          {personalReportData.periodReminders > 0 && (
                            <div className="mt-1">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                <span>نسبة الإنجاز</span>
                                <span>{Math.round((personalReportData.doneReminders / personalReportData.periodReminders) * 100)}%</span>
                              </div>
                              <Progress value={Math.round((personalReportData.doneReminders / personalReportData.periodReminders) * 100)} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><StickyNote size={14} className="text-sky-500" /> الملاحظات</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50 dark:bg-sky-900/10">
                            <span className="text-xs">إجمالي الملاحظات</span>
                            <Badge className="bg-sky-100 text-sky-700 text-xs">{personalReportData.periodNotes}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                            <span className="text-xs">مهمة</span>
                            <Badge className="bg-amber-100 text-amber-700 text-xs">{personalReportData.importantNotes}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <span className="text-xs">عادية</span>
                            <Badge variant="secondary" className="text-xs">{personalReportData.periodNotes - personalReportData.importantNotes}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {personalTransactions.length === 0 && (
                      <Card className="card-luxury p-8 text-center">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">📊</motion.div>
                        <p className="text-muted-foreground">لا توجد بيانات كافية للتقارير</p>
                        <p className="text-xs text-muted-foreground mt-1">أضف معاملات شخصية لتظهر التقارير</p>
                      </Card>
                    )}
                  </motion.div>
                  )}
                </motion.div>
                )}

              </div>
            )}

            {/* ═══ SETTINGS direct ═══ */}
            {activeTab === 'settings' && (<div className="space-y-4"><div className="section-header-animated rounded-2xl bg-indigo-50 dark:bg-indigo-950/30"><div className="relative z-10 flex items-center gap-3"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="text-4xl">🎨</motion.div><div><h1 className="text-2xl font-bold">الإعدادات</h1></div></div></div><Card className="card-luxury"><CardHeader><CardTitle>ألوان التطبيق</CardTitle></CardHeader><CardContent><div className="grid grid-cols-5 gap-3">{THEME_CONFIGS.map(tc => <motion.button key={tc.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} onClick={() => setTheme(tc.id)} className={cn('theme-swatch flex flex-col items-center justify-center gap-1 p-2', theme === tc.id && 'selected')} style={{ background: `linear-gradient(135deg, ${tc.primary}, ${tc.primaryDark})` }}><span className="text-xl">{tc.icon}</span><span className="text-[9px] font-bold text-white/90 truncate w-full text-center">{tc.name}</span>{theme === tc.id && <CheckCircle className="text-white absolute top-1 right-1" size={14} />}</motion.button>)}</div></CardContent></Card></div>)}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Global Confirmation Dialogs (work across all tabs) ─── */}
      {/* Delete Laser Record */}
      <AlertDialog open={!!deleteLaserRecordConfirmId} onOpenChange={() => setDeleteLaserRecordConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف سجل الليزر</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف سجل الليزر هذا؟ سيتم حذف جميع الجلسات والمعاملات المالية المرتبطة به نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={async () => {
            if (!deleteLaserRecordConfirmId) return
            try {
              const r = laserRecords.find(rec => rec.id === deleteLaserRecordConfirmId)
              await apiFetch(`/laser/records/${deleteLaserRecordConfirmId}`, { method: 'DELETE' })
              if (r) {
                const rP = r.patient || patients.find(pt => pt.id === r.patientId)
                const rSess2 = r.laserSessions || []
                const areaLabel = BODY_AREAS.find(a => a.id === r.bodyArea || a.label === r.bodyArea)?.label || r.bodyArea

                // 1. Remove related transactions
                const rTxIds = new Set<string>()
                if (rP) {
                  rSess2.filter(s => s.paid).forEach(s => {
                    const t = transactions.find(tx => tx.description?.includes(`جلسة ليزر #${s.sessionNumber}`) && tx.description?.includes(rP!.name) && tx.category === 'ليزر')
                    if (t) rTxIds.add(t.id)
                  })
                  // Also remove initial record transaction
                  const initTx = transactions.find(tx => tx.category === 'ليزر' && tx.description?.includes(rP.name) && tx.description?.includes(areaLabel) && !tx.description?.includes('جلسة ليزر #'))
                  if (initTx) rTxIds.add(initTx.id)
                }
                setTransactions(prev => prev.filter(t => !rTxIds.has(t.id)))

                // 2. Remove related regular sessions
                if (rP) {
                  const relatedSessions = sessions.filter(s => s.patientId === r.patientId && s.notes?.includes('ليزر') && s.notes?.includes(areaLabel))
                  const rSessIds = new Set(relatedSessions.map(s => s.id))
                  if (rSessIds.size > 0) setSessions(prev => prev.filter(s => !rSessIds.has(s.id)))
                }
              }
              setLaserRecords(prev => prev.filter(rec => rec.id !== deleteLaserRecordConfirmId))
              if (selectedLaserRecordId === deleteLaserRecordConfirmId) setSelectedLaserRecordId(null)
              toast.success('تم حذف السجل والمعاملات المالية المرتبطة ✅')
            } catch { toast.error('خطأ في الحذف') }
            setDeleteLaserRecordConfirmId(null)
          }}>حذف نهائي</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Laser Session */}
      <AlertDialog open={!!deleteLaserSessionConfirmId} onOpenChange={() => setDeleteLaserSessionConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف جلسة الليزر</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذه الجلسة؟ سيتم حذف المعاملة المالية والجلسة المرتبطة بها إذا كانت مدفوعة.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={async () => {
            if (!deleteLaserSessionConfirmId) return
            try {
              const ls = laserRecords.flatMap(r => r.laserSessions || []).find(s => s.id === deleteLaserSessionConfirmId)
              await apiFetch(`/laser/sessions/${deleteLaserSessionConfirmId}`, { method: 'DELETE' })
              if (ls) {
                const parentRec = laserRecords.find(r => (r.laserSessions || []).some(s => s.id === deleteLaserSessionConfirmId))
                const pName = parentRec?.patient?.name || patients.find(pt => pt.id === parentRec?.patientId)?.name
                const areaLabel = parentRec ? BODY_AREAS.find(a => a.id === parentRec.bodyArea || a.label === parentRec.bodyArea)?.label || parentRec.bodyArea : ''

                // 1. Remove related transaction (by session number and patient name match)
                const relatedTx = transactions.find(t => t.description?.includes(`جلسة ليزر #${ls.sessionNumber}`) && t.description?.includes(pName || '') && t.category === 'ليزر')
                if (relatedTx) setTransactions(prev => prev.filter(t => t.id !== relatedTx.id))

                // 2. Also try to remove by broader match (ليرز areaLabel - patientName format)
                const broaderTx = transactions.find(t => t.category === 'ليزر' && t.description?.includes(pName || '') && t.description?.includes(areaLabel) && Math.abs(t.amount - ls.price) < 1)
                if (broaderTx && broaderTx.id !== relatedTx?.id) setTransactions(prev => prev.filter(t => t.id !== broaderTx.id))

                // 3. Remove related regular session
                const relatedSession = sessions.find(s => s.patientId === parentRec?.patientId && s.notes?.includes('ليزر') && s.notes?.includes(areaLabel) && Math.abs(s.price - ls.price) < 1 && s.date && ls.date && new Date(s.date).toDateString() === new Date(ls.date).toDateString())
                if (relatedSession) setSessions(prev => prev.filter(s => s.id !== relatedSession.id))

                // 4. Update laser records state
                setLaserRecords(prev => prev.map(r => (r.laserSessions || []).some(s => s.id === deleteLaserSessionConfirmId) ? { ...r, laserSessions: (r.laserSessions || []).filter(s => s.id !== deleteLaserSessionConfirmId), _count: { laserSessions: Math.max((r._count?.laserSessions || 1) - 1, 0) } } : r))
              }
              toast.success('تم حذف الجلسة والمعاملات المرتبطة ✅')
            } catch { toast.error('خطأ في الحذف') }
            setDeleteLaserSessionConfirmId(null)
          }}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Backup Confirmation Dialog */}
      <AlertDialog open={restoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              استعادة نسخة احتياطية
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-red-600 font-bold">تحذير: سيتم حذف جميع البيانات الحالية واستبدالها ببيانات النسخة الاحتياطية!</span>
              <br />هذا الإجراء لا يمكن التراجع عنه. هل تريد المتابعة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-amber-600" onClick={() => { if (pendingRestoreData) restoreFromBackup(pendingRestoreData) }}>استعادة</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            { label: 'معاملة', emoji: '💰', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', action: () => { setAiChatOpen(false); setTxnFormDate(cairoTodayInput()); setShowAddTransaction(true) } },
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
                <Input value={newPatientPhone} onChange={e => setNewPatientPhone(normalizePhone(e.target.value))} placeholder="01xxxxxxxxx" className="input-luxury rounded-xl h-11 mt-1 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10" />
              </div>
              <div>
                <Label className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><MapPin size={14} /> العنوان</Label>
                <Input value={newPatientAddress} onChange={e => setNewPatientAddress(e.target.value)} placeholder="العنوان" className="input-luxury rounded-xl h-11 mt-1 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10" />
              </div>
            </div>

            {/* ─── 4. PERSONAL INFO ROW ─── */}
            <div className="grid grid-cols-2 gap-3">
              <Input value={newPatientAge} onChange={e => setNewPatientAge(e.target.value)} type="number" placeholder="🎂 العمر" className="input-luxury rounded-xl h-11 border-amber-200 dark:border-amber-800 focus:border-amber-500 bg-amber-50/30 dark:bg-amber-950/10" />
              <Input value={newPatientDiagnosis} onChange={e => setNewPatientDiagnosis(e.target.value)} placeholder="🔬 التشخيص" className="rounded-xl h-11 border-pink-200 dark:border-pink-800 bg-pink-50/30 dark:bg-pink-950/10" />
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

            {/* ─── 6.5. CUSTOM DATE - Optional date override ─── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-2xl border-2 border-dashed border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-50/50 to-sky-50/50 dark:from-cyan-950/10 dark:to-sky-950/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-cyan-600 dark:text-cyan-400" />
                <Label className="text-xs font-bold text-cyan-700 dark:text-cyan-400">تاريخ الزيارة (اختياري)</Label>
              </div>
              <Input type="date" value={newPatientDate} onChange={e => setNewPatientDate(e.target.value)} className="rounded-xl h-10 border-cyan-200 dark:border-cyan-800 bg-white dark:bg-black/20 text-sm" />
              <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <CalendarCheck size={10} />
                {newPatientDate
                  ? <span className="text-cyan-600 dark:text-cyan-400 font-bold">سيتم التسجيل بتاريخ {newPatientDate} بدلاً من اليوم</span>
                  : <span>اتركه فارغاً للتسجيل بتاريخ اليوم تلقائياً — أو اختر تاريخ إذا تأخرت السكرتيرة في التسجيل</span>
                }
              </p>
            </motion.div>

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

      {/* ═══ FOLLOW-UP: ADD RECORD DIALOG ═══ */}
      <Dialog open={showAddFollowUp} onOpenChange={setShowAddFollowUp}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#0891B2]"><span className="text-xl">🔄</span> تسجيل حالة متابعة جديدة</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {/* Patient Search */}
          <div className="relative">
            <Label className="text-xs font-bold">المريض *</Label>
            <div className="relative mt-1"><Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0891B2]/40" size={14} /><Input placeholder="بحث بالاسم أو الهاتف أو رقم الملف..." value={fuFormPatientSearch} onChange={e => { setFuFormPatientSearch(e.target.value); setFuFormPatientId('') }} className="pr-9 input-luxury rounded-xl h-10 border-[#06B6D4]/30 focus:border-[#0891B2]" /></div>
            {fuFormPatientSearch && !fuFormPatientId && (
              <div className="absolute z-50 mt-1 w-full bg-card border border-[#06B6D4]/30 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {patients.filter(p => { const q = fuFormPatientSearch.toLowerCase(); return p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q) }).slice(0, 5).map(p => (
                  <button key={p.id} className="w-full text-right p-2.5 hover:bg-[#0891B2]/5 flex items-center gap-2 border-b last:border-0" onClick={() => { setFuFormPatientId(p.id); setFuFormPatientSearch(p.name) }}>
                    <span className="text-sm font-medium">{p.name}</span><span className="text-xs text-muted-foreground">{p.fileNumber}</span>
                  </button>
                ))}
              </div>
            )}
            {fuFormPatientId && <Badge className="mt-1 bg-[#06B6D4]/20 text-[#0891B2]">{patients.find(p => p.id === fuFormPatientId)?.name}</Badge>}
          </div>
          {/* Condition */}
          <div><Label className="text-xs font-bold">الحالة / المرض *</Label><Input placeholder="مثال: صدفية، إكزيما، ضغط..." value={fuFormCondition} onChange={e => setFuFormCondition(e.target.value)} className="input-luxury rounded-xl h-10 mt-1 border-[#06B6D4]/30 focus:border-[#0891B2]" /></div>
          {/* Category & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold">التصنيف</Label><Select value={fuFormCategory} onValueChange={setFuFormCategory}><SelectTrigger className="rounded-xl h-10 mt-1 border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="جلدية">🩺 جلدية</SelectItem><SelectItem value="داخلية">💊 داخلية</SelectItem><SelectItem value="أخرى">📋 أخرى</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs font-bold">الشدة</Label><Select value={fuFormSeverity} onValueChange={setFuFormSeverity}><SelectTrigger className="rounded-xl h-10 mt-1 border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mild">خفيف</SelectItem><SelectItem value="moderate">متوسط</SelectItem><SelectItem value="severe">شديد</SelectItem><SelectItem value="critical">حرج</SelectItem></SelectContent></Select></div>
          </div>
          {/* Frequency & Next Visit */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold">تكرار المتابعة</Label><Select value={fuFormFrequency} onValueChange={setFuFormFrequency}><SelectTrigger className="rounded-xl h-10 mt-1 border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weekly">أسبوعي</SelectItem><SelectItem value="biweekly">كل أسبوعين</SelectItem><SelectItem value="monthly">شهري</SelectItem><SelectItem value="quarterly">ربع سنوي</SelectItem><SelectItem value="custom">مخصص</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs font-bold">الزيارة القادمة</Label><Input type="date" value={fuFormNextVisit} onChange={e => setFuFormNextVisit(e.target.value)} className="input-luxury rounded-xl h-10 mt-1 border-[#06B6D4]/30" /></div>
          </div>
          {fuFormFrequency === 'custom' && <div><Label className="text-xs font-bold">عدد الأيام</Label><Input type="number" placeholder="كل كم يوم" value={fuFormCustomDays} onChange={e => setFuFormCustomDays(e.target.value)} className="input-luxury rounded-xl h-10 mt-1 border-[#06B6D4]/30" /></div>}
          {/* Medical Info */}
          <div className="space-y-2 p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20">
            <p className="text-xs font-bold text-[#0891B2]">🏥 معلومات طبية</p>
            <div><Label className="text-[10px]">التشخيص</Label><Input placeholder="التشخيص..." value={fuFormDiagnosis} onChange={e => setFuFormDiagnosis(e.target.value)} className="input-luxury rounded-xl h-9 text-xs mt-0.5 border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px]">خطة العلاج</Label><Input placeholder="خطة العلاج..." value={fuFormTreatmentPlan} onChange={e => setFuFormTreatmentPlan(e.target.value)} className="input-luxury rounded-xl h-9 text-xs mt-0.5 border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px]">الأدوية</Label><Input placeholder="الأدوية الحالية..." value={fuFormMedications} onChange={e => setFuFormMedications(e.target.value)} className="input-luxury rounded-xl h-9 text-xs mt-0.5 border-[#06B6D4]/30" /></div>
          </div>
          <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea placeholder="ملاحظات إضافية..." value={fuFormNotes} onChange={e => setFuFormNotes(e.target.value)} className="input-luxury rounded-xl mt-1 border-[#06B6D4]/30" rows={2} /></div>
          {/* Subscription Section */}
          <div className="p-3 rounded-xl border-2 border-dashed border-[#06B6D4]/30 bg-[#06B6D4]/5">
            <div className="flex items-center gap-2 mb-2"><Switch checked={fuFormHasSubscription} onCheckedChange={setFuFormHasSubscription} /><Label className="text-xs font-bold text-[#0891B2]">💎 باقة متابعة</Label></div>
            {fuFormHasSubscription && (
              <div className="space-y-2 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-[10px]">نوع الباقة</Label><Select value={fuFormSubType} onValueChange={setFuFormSubType}><SelectTrigger className="rounded-lg h-9 text-xs border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">شهرية</SelectItem><SelectItem value="quarterly">ربع سنوية</SelectItem><SelectItem value="yearly">سنوية</SelectItem><SelectItem value="session_based">بالجلسات</SelectItem></SelectContent></Select></div>
                  <div><Label className="text-[10px]">السعر</Label><Input type="number" placeholder="0" value={fuFormSubPrice} onChange={e => setFuFormSubPrice(e.target.value)} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-[10px]">عدد الجلسات</Label><Input type="number" placeholder="0" value={fuFormSubSessions} onChange={e => setFuFormSubSessions(e.target.value)} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
                  <div><Label className="text-[10px]">البداية</Label><Input type="date" value={fuFormSubStart} onChange={e => setFuFormSubStart(e.target.value)} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
                  <div><Label className="text-[10px]">النهاية</Label><Input type="date" value={fuFormSubEnd} onChange={e => setFuFormSubEnd(e.target.value)} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter><Button className="rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white w-full" onClick={async () => {
          if (!fuFormPatientId || !fuFormCondition.trim()) return toast.error('اختار المريض وحدد الحالة')
          try {
            const body: Record<string, unknown> = { patientId: fuFormPatientId, condition: fuFormCondition, conditionCategory: fuFormCategory, severity: fuFormSeverity, frequency: fuFormFrequency, diagnosis: fuFormDiagnosis || undefined, treatmentPlan: fuFormTreatmentPlan || undefined, medications: fuFormMedications || undefined, notes: fuFormNotes || undefined, nextVisitDate: fuFormNextVisit || undefined }
            if (fuFormFrequency === 'custom' && fuFormCustomDays) body.customDays = parseInt(fuFormCustomDays)
            if (fuFormHasSubscription) { body.hasSubscription = true; body.subscriptionType = fuFormSubType; body.subscriptionPrice = parseFloat(fuFormSubPrice) || 0; body.sessionsIncluded = parseInt(fuFormSubSessions) || 0; body.subscriptionStart = fuFormSubStart || undefined; body.subscriptionEnd = fuFormSubEnd || undefined }
            const res = await apiFetch<any>('/follow-up/records', { method: 'POST', body: JSON.stringify(body) })
            const newRec = res?.record || res?.data || res
            if (newRec?.id) {
              const fullRec = { ...newRec, patient: patients.find(p => p.id === fuFormPatientId), followUpVisits: [] }
              setFollowUpRecords(prev => [fullRec, ...prev])
              if (fuFormHasSubscription && fuFormSubPrice) {
                const pName = patients.find(p => p.id === fuFormPatientId)?.name || 'مريض'
                const subAmount = parseFloat(fuFormSubPrice) || 0
                try { const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'متابعة', amount: subAmount, description: `باقة متابعة - ${pName} - ${fuFormCondition}`, date: cairoISO() }) }); const newTxn = txnRes?.transaction || txnRes?.data || txnRes; if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]) } else { setTransactions(prev => [...prev, { id: 'fu-sub-' + Date.now(), type: 'income', category: 'متابعة', amount: subAmount, description: `باقة متابعة - ${pName} - ${fuFormCondition}`, date: cairoISO() }]) } } catch { setTransactions(prev => [...prev, { id: 'fu-sub-' + Date.now(), type: 'income', category: 'متابعة', amount: subAmount, description: `باقة متابعة - ${pName} - ${fuFormCondition}`, date: cairoISO() }]) }
              }
            }
            setShowAddFollowUp(false); toast.success('تم تسجيل حالة المتابعة ✅')
          } catch { toast.error('خطأ في التسجيل') }
        }}><span className="text-xl ml-1">🔄</span> تسجيل المتابعة</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* ═══ FOLLOW-UP: ADD VISIT DIALOG ═══ */}
      <Dialog open={showAddFollowUpVisit} onOpenChange={setShowAddFollowUpVisit}><DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#0891B2]"><span className="text-xl">🩺</span> زيارة متابعة جديدة</DialogTitle></DialogHeader>
        {selectedFU && <p className="text-xs text-muted-foreground bg-[#67E8F9]/10 rounded-lg p-2">{selectedFU.patient?.name} - {selectedFU.condition}</p>}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] font-bold">النتائج السريرية</Label><Input placeholder="النتائج..." value={fuVisitForm.findings} onChange={e => setFuVisitForm(p => ({ ...p, findings: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px] font-bold">ملاحظات العلاج</Label><Input placeholder="العلاج..." value={fuVisitForm.treatmentNotes} onChange={e => setFuVisitForm(p => ({ ...p, treatmentNotes: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] font-bold">الأدوية</Label><Input placeholder="الأدوية الموصوفة..." value={fuVisitForm.medications} onChange={e => setFuVisitForm(p => ({ ...p, medications: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px] font-bold">التعليمات</Label><Input placeholder="التعليمات للمريض..." value={fuVisitForm.instructions} onChange={e => setFuVisitForm(p => ({ ...p, instructions: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
          </div>
          <div><Label className="text-[10px] font-bold">التشخيص</Label><Input placeholder="التشخيص..." value={fuVisitForm.diagnosis} onChange={e => setFuVisitForm(p => ({ ...p, diagnosis: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] font-bold">السعر</Label><Input type="number" placeholder="0" value={fuVisitForm.price} onChange={e => setFuVisitForm(p => ({ ...p, price: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px] font-bold">الزيارة القادمة</Label><Input type="date" value={fuVisitForm.nextVisitDate} onChange={e => setFuVisitForm(p => ({ ...p, nextVisitDate: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
          </div>
          <div className="flex items-center gap-3"><Label className="text-[10px] font-bold">تم الدفع</Label><Switch checked={fuVisitForm.paid} onCheckedChange={v => setFuVisitForm(p => ({ ...p, paid: v }))} /></div>
          <div><Label className="text-[10px] font-bold text-cyan-600 flex items-center gap-1"><Calendar size={10} /> تاريخ الزيارة (اختياري)</Label><Input type="date" value={fuVisitForm.date} onChange={e => setFuVisitForm(p => ({ ...p, date: e.target.value }))} className="rounded-lg h-9 text-xs border-cyan-200 dark:border-cyan-800" /></div>
          <div><Label className="text-[10px] font-bold">ملاحظات</Label><Textarea placeholder="ملاحظات..." value={fuVisitForm.notes} onChange={e => setFuVisitForm(p => ({ ...p, notes: e.target.value }))} className="rounded-lg text-xs border-[#06B6D4]/30" rows={2} /></div>
        </div>
        <DialogFooter><Button className="rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white w-full" onClick={async () => {
          if (!selectedFU) return
          try {
            const fuVisitDate = fuVisitForm.date || undefined
            const body: Record<string, unknown> = { followUpId: selectedFU.id, findings: fuVisitForm.findings || undefined, treatmentNotes: fuVisitForm.treatmentNotes || undefined, medications: fuVisitForm.medications || undefined, instructions: fuVisitForm.instructions || undefined, diagnosis: fuVisitForm.diagnosis || undefined, paid: fuVisitForm.paid, price: parseFloat(fuVisitForm.price) || 0, nextVisitDate: fuVisitForm.nextVisitDate || undefined, notes: fuVisitForm.notes || undefined, visitDate: fuVisitDate }
            const res = await apiFetch<any>('/follow-up/visits', { method: 'POST', body: JSON.stringify(body) })
            const newVisit = res?.visit || res?.data || res
            if (newVisit?.id) {
              setFollowUpRecords(prev => prev.map(f => f.id === selectedFU.id ? { ...f, followUpVisits: [newVisit, ...(f.followUpVisits || [])], lastVisitDate: fuVisitDate, sessionsUsed: f.sessionsUsed + 1, nextVisitDate: fuVisitForm.nextVisitDate || f.nextVisitDate } : f))
              // Directly create financial transaction for paid follow-up visits
              if (fuVisitForm.paid && parseFloat(fuVisitForm.price) > 0) {
                const fuPrice = parseFloat(fuVisitForm.price)
                const pName = selectedFU.patient?.name || 'مريض'
                const fuCondition = selectedFU.condition || ''
                try {
                  await addItem('/finance/transactions', { type: 'income', category: 'متابعة', amount: fuPrice, description: `متابعة - ${pName}${fuCondition ? ' - ' + fuCondition : ''}`, date: fuVisitDate || cairoISO() }, setTransactions)
                } catch {}
                // Reload transactions to ensure sync
                try { const txnRes = await apiFetch<any>('/finance/transactions?limit=100000'); const dbTxns = txnRes?.transactions || []; if (dbTxns.length > 0) setTransactions(dbTxns) } catch {}
              }
            }
            setShowAddFollowUpVisit(false); setFuVisitForm({ findings: '', vitals: '', diagnosis: '', treatmentNotes: '', medications: '', instructions: '', paid: false, price: '', nextVisitDate: '', notes: '', type: 'followup', date: '' })
            toast.success('تم تسجيل الزيارة ✅')
          } catch { toast.error('خطأ') }
        }}>🩺 تسجيل الزيارة</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* ═══ FOLLOW-UP: SUBSCRIPTION EDITOR DIALOG ═══ */}
      <Dialog open={!!editingFollowUpId} onOpenChange={() => setEditingFollowUpId(null)}><DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#0891B2]"><span className="text-xl">💎</span> باقة المتابعة</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <div><Label className="text-xs font-bold">نوع الباقة</Label><Select value={fuFormSubType} onValueChange={setFuFormSubType}><SelectTrigger className="rounded-xl h-10 mt-1 border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">شهرية</SelectItem><SelectItem value="quarterly">ربع سنوية</SelectItem><SelectItem value="yearly">سنوية</SelectItem><SelectItem value="session_based">بالجلسات</SelectItem></SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs font-bold">السعر</Label><Input type="number" placeholder="0" value={fuFormSubPrice} onChange={e => setFuFormSubPrice(e.target.value)} className="rounded-xl h-10 border-[#06B6D4]/30" /></div>
            <div><Label className="text-xs font-bold">عدد الجلسات</Label><Input type="number" placeholder="0" value={fuFormSubSessions} onChange={e => setFuFormSubSessions(e.target.value)} className="rounded-xl h-10 border-[#06B6D4]/30" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs font-bold">البداية</Label><Input type="date" value={fuFormSubStart} onChange={e => setFuFormSubStart(e.target.value)} className="rounded-xl h-10 border-[#06B6D4]/30" /></div>
            <div><Label className="text-xs font-bold">النهاية</Label><Input type="date" value={fuFormSubEnd} onChange={e => setFuFormSubEnd(e.target.value)} className="rounded-xl h-10 border-[#06B6D4]/30" /></div>
          </div>
        </div>
        <DialogFooter><Button className="rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white w-full" onClick={async () => {
          if (!editingFollowUpId) return
          try {
            await apiFetch(`/follow-up/records/${editingFollowUpId}`, { method: 'PUT', body: JSON.stringify({ hasSubscription: true, subscriptionType: fuFormSubType, subscriptionPrice: parseFloat(fuFormSubPrice) || 0, sessionsIncluded: parseInt(fuFormSubSessions) || 0, subscriptionStart: fuFormSubStart || undefined, subscriptionEnd: fuFormSubEnd || undefined }) })
            setFollowUpRecords(prev => prev.map(f => f.id === editingFollowUpId ? { ...f, hasSubscription: true, subscriptionType: fuFormSubType, subscriptionPrice: parseFloat(fuFormSubPrice) || 0, sessionsIncluded: parseInt(fuFormSubSessions) || 0, subscriptionStart: fuFormSubStart || undefined, subscriptionEnd: fuFormSubEnd || undefined } : f))
            setEditingFollowUpId(null); toast.success('تم إضافة الباقة 💎')
          } catch { toast.error('خطأ') }
        }}>💎 حفظ الباقة</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* ═══ FOLLOW-UP: DELETE CONFIRMATION ═══ */}
      <Dialog open={!!deleteFollowUpConfirmId} onOpenChange={() => setDeleteFollowUpConfirmId(null)}><DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="text-red-600">⚠️ حذف حالة المتابعة</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">هل أنت متأكد من حذف حالة المتابعة؟ سيتم حذف جميع الزيارات المرتبطة بها.</p>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteFollowUpConfirmId(null)}>إلغاء</Button>
          <Button className="flex-1 rounded-xl bg-red-600 text-white" onClick={async () => {
            if (!deleteFollowUpConfirmId) return
            try {
              await apiFetch(`/follow-up/records/${deleteFollowUpConfirmId}`, { method: 'DELETE' })
              setFollowUpRecords(prev => prev.filter(f => f.id !== deleteFollowUpConfirmId))
              if (selectedFollowUpId === deleteFollowUpConfirmId) setSelectedFollowUpId(null)
              setDeleteFollowUpConfirmId(null); toast.success('تم حذف حالة المتابعة')
            } catch { toast.error('خطأ في الحذف') }
          }}>حذف</Button>
        </DialogFooter>
      </DialogContent></Dialog>

      {/* ═══ LASER RECORD DIALOG - PROFESSIONAL DESIGN ═══ */}
      <Dialog open={showAddLaserRecord} onOpenChange={(open) => {
        setShowAddLaserRecord(open)
        if (open) {
          apiFetch<any>('/patients?limit=50000').then(res => {
            const pList = res?.patients || res?.data || (Array.isArray(res) ? res : [])
            if (Array.isArray(pList) && pList.length > 0) setPatients(pList)
          }).catch(() => {})
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 gap-0">
          {/* ═══ Premium Header ═══ */}
          <div className="relative overflow-hidden bg-gradient-to-l from-teal-600 via-cyan-600 to-emerald-600 p-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
                  <Zap size={22} className="text-white" />
                </motion.div>
                <div>
                  <DialogTitle className="text-xl font-black text-white">سجل ليزر جديد</DialogTitle>
                  <DialogDescription className="text-cyan-100 text-xs mt-0.5">تسجيل جلسة إزالة الشعر بالليزر</DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/15 text-white border-white/20 text-[10px] px-3 py-1 backdrop-blur-sm">💎 مركز الليزر</Badge>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* ═══ Section 1: بيانات العميل ═══ */}
            <div className="rounded-2xl border-2 border-teal-200/50 dark:border-teal-800/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-teal-500 to-cyan-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">1</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users size={15} /> بيانات العميل
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">مطلوب *</Badge>
              </div>
              <div className="p-4 space-y-3 bg-gradient-to-b from-teal-50/30 to-transparent dark:from-teal-950/10">
                {/* Patient Search */}
                <div>
                  <Label className="text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5 mb-2">
                    <Search size={13} /> ابحث عن المريض بالاسم أو الهاتف
                  </Label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400" size={18} />
                    <Input value={laserFormPatientSearch} onChange={e => { setLaserFormPatientSearch(e.target.value); if (laserFormPatientId) setLaserFormPatientId('') }} placeholder="اكتب اسم المريض أو رقم الهاتف..." className="rounded-xl h-12 pr-10 text-sm border-2 border-teal-200 dark:border-teal-700 focus:border-teal-400 focus:ring-teal-400/20 bg-white dark:bg-slate-900" autoFocus />
                    {laserFormPatientSearch && !laserFormPatientId && (
                      <button onClick={() => { setLaserFormPatientSearch(''); setLaserFormPatientId('') }} className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/50 hover:bg-teal-200 dark:hover:bg-teal-800 flex items-center justify-center transition-colors"><X size={12} className="text-teal-600" /></button>
                    )}
                  </div>
                  {/* Search Results */}
                  {laserPatientSuggestions.length > 0 && !laserFormPatientId && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 border-2 border-teal-200 dark:border-teal-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl">
                      <div className="px-3 py-2 bg-gradient-to-l from-teal-500 to-cyan-500 flex items-center justify-between">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5"><Search size={12} /> نتائج البحث</p>
                        <Badge className="bg-white/25 text-white text-[9px]">{laserPatientSuggestions.length}</Badge>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto divide-y divide-teal-50 dark:divide-teal-900/30">
                        {laserPatientSuggestions.map(p => (
                          <motion.button key={p.id} whileHover={{ x: -4 }} onClick={() => { setLaserFormPatientId(p.id); setLaserFormPatientSearch(p.name) }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-right transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-md">{p.name?.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm">{p.name}</p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <Badge variant="outline" className="text-[9px] h-4">#{p.fileNumber}</Badge>
                                {p.phone && <span dir="ltr">{p.phone}</span>}
                                {p.age && <span>{p.age} سنة</span>}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Selected Patient Card */}
                {laserFormPatientId && (() => {
                  const sp = patients.find(p => p.id === laserFormPatientId)
                  if (!sp) return null
                  return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border-2 border-teal-300 dark:border-teal-700 overflow-hidden shadow-lg">
                      <div className="bg-gradient-to-l from-teal-500 to-cyan-500 p-3 flex items-center gap-3">
                        <Avatar className="h-11 w-11 border-2 border-white/30 shadow-md"><AvatarFallback className="bg-white text-teal-600 text-sm font-bold">{sp.name?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm">{sp.name}</p>
                          <div className="flex items-center gap-1.5 text-cyan-100 text-[10px] flex-wrap">
                            <Badge className="bg-white/15 text-white text-[9px] border-white/20">#{sp.fileNumber}</Badge>
                            {sp.gender && <Badge className="bg-white/15 text-white text-[9px] border-white/20">{sp.gender === 'male' ? 'ذكر' : sp.gender === 'female' ? 'أنثى' : sp.gender}</Badge>}
                            {sp.age && <Badge className="bg-white/15 text-white text-[9px] border-white/20">{sp.age} سنة</Badge>}
                            {sp.phone && <Badge className="bg-white/15 text-white text-[9px] border-white/20" dir="ltr">{sp.phone}</Badge>}
                          </div>
                        </div>
                        <button onClick={() => { setLaserFormPatientId(''); setLaserFormPatientSearch('') }} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shadow-sm"><X size={14} /></button>
                      </div>
                      {(sp.allergies || sp.medicalHistory) && (
                        <div className="p-2.5 space-y-1.5 bg-teal-50/50 dark:bg-teal-950/20">
                          {sp.allergies && <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><AlertTriangle size={12} className="text-red-500 flex-shrink-0" /><p className="text-[10px] text-red-600 dark:text-red-400 font-semibold">حساسية: {sp.allergies}</p></div>}
                          {sp.medicalHistory && <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"><AlertCircle size={12} className="text-amber-500 flex-shrink-0" /><p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">{sp.medicalHistory}</p></div>}
                        </div>
                      )}
                    </motion.div>
                  )
                })()}
              </div>
            </div>

            {/* ═══ Section 2: بيانات الليزر ═══ */}
            <div className="rounded-2xl border-2 border-cyan-200/50 dark:border-cyan-800/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-cyan-500 to-emerald-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">2</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap size={15} /> بيانات العلاج
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">أساسي</Badge>
              </div>
              <div className="p-4 space-y-3 bg-gradient-to-b from-cyan-50/30 to-transparent dark:from-cyan-950/10">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">الطبيب المعالج</Label>
                    <Select value={laserFormDoctorId} onValueChange={setLaserFormDoctorId}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر الطبيب..." />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.active).map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}{d.specialty && <span className="text-slate-400 text-xs"> - {d.specialty}</span>}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">منطقة الجسم <span className="text-red-500">*</span></Label>
                    <Select value={laserFormArea} onValueChange={setLaserFormArea}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر المنطقة..." />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_AREAS.map(area => (
                          <SelectItem key={area.id} value={area.id}>{area.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">نوع البشرة</Label>
                    <Select value={laserFormSkinType} onValueChange={setLaserFormSkinType}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر النوع..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SKIN_TYPES.map(st => (
                          <SelectItem key={st.id} value={st.id}>{st.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">لون الشعر</Label>
                    <Select value={laserFormHairColor} onValueChange={setLaserFormHairColor}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر اللون..." />
                      </SelectTrigger>
                      <SelectContent>
                        {HAIR_COLORS.map(hc => (
                          <SelectItem key={hc.id} value={hc.id}>{hc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">كثافة الشعر</Label>
                    <Select value={laserFormHairDensity} onValueChange={setLaserFormHairDensity}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر الكثافة..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">خفيف</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="dense">كثيف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ Section 3: إعدادات الجهاز ═══ */}
            <div className="rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-emerald-500 to-teal-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">3</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings size={15} /> إعدادات الجهاز
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">اختياري</Badge>
              </div>
              <div className="p-4 bg-gradient-to-b from-emerald-50/30 to-transparent dark:from-emerald-950/10">
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5 block">اسم الجهاز</Label><Input value={laserFormMachine} onChange={e => setLaserFormMachine(e.target.value)} placeholder="Soprano" className="rounded-xl h-10 text-sm border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-400" /></div>
                  <div><Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5 block">الطاقة (J)</Label><Input type="number" value={laserFormEnergy} onChange={e => setLaserFormEnergy(e.target.value)} placeholder="14" className="rounded-xl h-10 text-sm border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-400" /></div>
                  <div><Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5 block">النبض (ms)</Label><Input value={laserFormPulse} onChange={e => setLaserFormPulse(e.target.value)} placeholder="20" className="rounded-xl h-10 text-sm border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-400" /></div>
                </div>
              </div>
            </div>

            {/* ═══ Section 4: التكلفة ═══ */}
            <div className="rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">4</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign size={15} /> التكلفة والسداد
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">💰 مالي</Badge>
              </div>
              <div className="p-4 space-y-3 bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-950/10">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5 block">عدد الجلسات</Label><Input value={laserFormSessions} onChange={e => setLaserFormSessions(e.target.value)} type="number" className="rounded-xl h-10 text-sm text-center border-2 border-amber-200 dark:border-amber-700 focus:border-amber-400 font-bold" /></div>
                  <div><Label className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5 block">سعر الجلسة (ج.م) <span className="text-red-500">*</span></Label><Input type="number" value={laserFormPrice} onChange={e => setLaserFormPrice(e.target.value)} placeholder="0" className="rounded-xl h-10 text-sm text-center border-2 border-amber-200 dark:border-amber-700 focus:border-amber-400 font-bold" /></div>
                </div>
                {laserFormPrice && parseInt(laserFormSessions) > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-gradient-to-l from-teal-500 to-emerald-500 border border-teal-300 dark:border-teal-600 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white font-bold">إجمالي الباقة ({laserFormSessions} جلسة)</p>
                        <p className="text-[10px] text-teal-100 mt-0.5">يُسجّل تلقائياً في النظام المالي</p>
                      </div>
                      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-2xl font-black text-white">{formatCurrency(parseFloat(laserFormPrice) * parseInt(laserFormSessions))}</motion.div>
                    </div>
                  </motion.div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-700">
                  <Label className="text-xs font-bold text-amber-700 dark:text-amber-300">حالة الدفع:</Label>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLaserFormPaid(true)} className={cn('px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm', laserFormPaid ? 'bg-gradient-to-l from-emerald-500 to-green-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700')}>✅ مدفوع</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLaserFormPaid(false)} className={cn('px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm', !laserFormPaid ? 'bg-gradient-to-l from-amber-500 to-orange-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700')}>⏳ غير مدفوع</motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ Section 5: ملاحظات ═══ */}
            <div className="rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-slate-500 to-slate-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">5</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText size={15} /> ملاحظات
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">اختياري</Badge>
              </div>
              <div className="p-4 bg-gradient-to-b from-slate-50/30 to-transparent dark:from-slate-900/10">
                <Textarea value={laserFormNotes} onChange={e => setLaserFormNotes(e.target.value)} placeholder="ملاحظات عن الحالة أو التعليمات الخاصة بالعلاج..." className="rounded-xl min-h-[80px] text-sm border-2 border-slate-200 dark:border-slate-600 focus:border-teal-400 focus:ring-teal-400/20 resize-none" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-l from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <Button variant="ghost" onClick={() => setShowAddLaserRecord(false)} className="rounded-xl text-slate-600 px-6">إلغاء</Button>
            <Button className="rounded-xl bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold h-12 px-8 shadow-lg" onClick={async () => {
              if (!laserFormPatientId) return toast.error('اختر المريض أولاً')
              if (!laserFormArea) return toast.error('اختر منطقة الجسم')

              try {
                const patientCheck = await apiFetch<any>(`/patients/${laserFormPatientId}`)
                if (!patientCheck?.id && !patientCheck?.patient?.id) {
                  toast.error('المريض غير موجود في قاعدة البيانات. قم بتحديث الصفحة وحاول مرة أخرى')
                  const freshPatients = await apiFetch<any>('/patients?limit=50000')
                  const pList = freshPatients?.patients || freshPatients?.data || freshPatients || []
                  if (Array.isArray(pList)) setPatients(pList)
                  return
                }
              } catch {
                toast.error('المريض غير موجود. قم بتحديث الصفحة وحاول مرة أخرى')
                const freshPatients = await apiFetch<any>('/patients?limit=50000')
                const pList = freshPatients?.patients || freshPatients?.data || freshPatients || []
                if (Array.isArray(pList)) setPatients(pList)
                return
              }

              const now = cairoISO()
              const patientName = patients.find(p => p.id === laserFormPatientId)?.name || 'مريض'
              const areaLabel = BODY_AREAS.find(a => a.id === laserFormArea)?.label || laserFormArea
              const sessionPrice = parseFloat(laserFormPrice) || 0
              let newRecordId: string | null = null

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
                toast.error('خطأ في إنشاء سجل الليزر: ' + (e.message || 'حاول مرة أخرى'))
                return
              }

              if (newRecordId) {
                try {
                  await apiFetch('/laser/sessions', { method: 'POST', body: JSON.stringify({ laserRecordId: newRecordId, energy: parseFloat(laserFormEnergy) || undefined, pulse: laserFormPulse || undefined, date: now }) })
                } catch { /* non-critical */ }
              }

              if (sessionPrice > 0) {
                try {
                  const finRes = await apiFetch<any>('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'ليزر', amount: sessionPrice, description: `ليزر ${areaLabel} - ${patientName}${laserFormPaid ? '' : ' (غير مدفوع)'}`, date: now }) })
                  const finItem = finRes?.data || finRes?.transaction || finRes
                  if (finItem?.id) setTransactions(prev => [finItem, ...prev])
                } catch { /* non-critical */ }
              }

              try {
                const sessRes = await apiFetch<any>('/sessions', { method: 'POST', body: JSON.stringify({ patientId: laserFormPatientId, status: laserFormPaid ? 'completed' : 'scheduled', price: sessionPrice, paid: laserFormPaid, notes: `ليزر - ${areaLabel}${laserFormMachine ? ` - ${laserFormMachine}` : ''}`, date: now }) })
                const sessItem = sessRes?.data || sessRes?.session || sessRes
                if (sessItem?.id) setSessions(prev => [sessItem, ...prev])
              } catch { /* non-critical */ }

              setLaserFormArea(''); setLaserFormSkinType(''); setLaserFormHairColor(''); setLaserFormHairDensity(''); setLaserFormSessions('6'); setLaserFormNotes(''); setLaserFormPatientId(''); setLaserFormPatientSearch(''); setLaserFormPrice(''); setLaserFormPaid(false); setLaserFormMachine(''); setLaserFormEnergy(''); setLaserFormPulse(''); setLaserFormDoctorId(''); setShowAddLaserRecord(false)
              toast.success('تم تسجيل سجل الليزر بنجاح ✅')
            }}><Zap size={16} className="ml-1.5" /> حفظ السجل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Laser Package */}
      <Dialog open={showAddLaserPackage} onOpenChange={setShowAddLaserPackage}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>باقة ليزر جديدة</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>اسم الباقة *</Label><Input id="lpName" placeholder="اسم الباقة" className="input-luxury rounded-xl" /></div><div className="grid grid-cols-2 gap-3"><div><Label>عدد الجلسات</Label><Input id="lpSess" type="number" placeholder="6" className="input-luxury rounded-xl" /></div><div><Label>السعر</Label><Input id="lpPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div></div><div><Label>منطقة الجسم</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المنطقة" /></SelectTrigger><SelectContent>{BODY_AREAS.map(a => <SelectItem key={a.id} value={a.label}>{a.label}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/laser/packages', { name: (document.getElementById('lpName') as HTMLInputElement)?.value, sessionsCount: parseInt((document.getElementById('lpSess') as HTMLInputElement)?.value) || 6, price: parseFloat((document.getElementById('lpPrice') as HTMLInputElement)?.value) || 0, active: true }, setLaserPackages); setShowAddLaserPackage(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Medication */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>دواء جديد</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>الاسم *</Label><Input id="medName" placeholder="اسم الدواء" className="input-luxury rounded-xl" /></div><div><Label>الفئة</Label><Input id="medCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div><div><Label>الجرعة</Label><Input id="medDosage" placeholder="الجرعة" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/medications', { name: (document.getElementById('medName') as HTMLInputElement)?.value, category: (document.getElementById('medCat') as HTMLInputElement)?.value, dosage: (document.getElementById('medDosage') as HTMLInputElement)?.value, active: true }, setMedications); setShowAddMedication(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Reminder - ENHANCED */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Bell size={18} className="text-rose-500" /> تذكير جديد</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>العنوان *</Label><Input id="remTitle" placeholder="عنوان التذكير" className="input-luxury rounded-xl" /></div><div><Label>النوع</Label><div className="grid grid-cols-4 gap-2 mt-1">{[{ id: 'urgent', label: 'عاجل', emoji: '🔴', bg: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' }, { id: 'important', label: 'مهم', emoji: '🟡', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' }, { id: 'followup', label: 'متابعة', emoji: '🔵', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' }, { id: 'general', label: 'عام', emoji: '🟢', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' }].map(t => (<motion.button key={t.id} whileTap={{ scale: 0.9 }} onClick={() => setReminderType(t.id)} className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-bold', t.bg, reminderType === t.id ? 'ring-2 ring-primary shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}><span className="text-lg">{t.emoji}</span>{t.label}</motion.button>))}</div></div><div className="grid grid-cols-2 gap-2"><div><Label>التاريخ</Label><Input id="remDate" type="date" className="input-luxury rounded-xl" /></div><div><Label>الوقت</Label><Input id="remTime" type="time" className="input-luxury rounded-xl" /></div></div><div><Label>المريض (اختياري)</Label><Select value={reminderPatientId} onValueChange={setReminderPatientId}><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent><SelectItem value="none">بدون مريض</SelectItem>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { const title = (document.getElementById('remTitle') as HTMLInputElement)?.value; const date = (document.getElementById('remDate') as HTMLInputElement)?.value; const time = (document.getElementById('remTime') as HTMLInputElement)?.value; const dateStr = date ? (time ? `${date}T${time}:00` : date) : cairoISO(); addItem('/reminders', { title, date: dateStr, type: reminderType, patientId: reminderPatientId === 'none' ? undefined : reminderPatientId || undefined, status: 'pending' }, setReminders); setShowAddReminder(false); setReminderType('general'); setReminderPatientId(''); toast.success('تم إضافة التذكير') }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add/Edit Inventory - Enhanced */}
      <Dialog open={showAddInventory} onOpenChange={setShowAddInventory}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Package size={18} className="text-amber-500" /> {editingInventoryId ? 'تعديل عنصر المخزون' : 'عنصر مخزون جديد'}</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>الاسم *</Label><Input value={editInventoryForm.name} onChange={e => setEditInventoryForm(prev => ({ ...prev, name: e.target.value }))} placeholder="اسم العنصر" className="input-luxury rounded-xl" /></div><div><Label>الفئة</Label><Select value={editInventoryForm.category || 'عام'} onValueChange={v => setEditInventoryForm(prev => ({ ...prev, category: v }))}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="عام">📌 عام</SelectItem><SelectItem value="أدوية">💊 أدوية</SelectItem><SelectItem value="مستلزمات طبية">🏥 مستلزمات طبية</SelectItem><SelectItem value="مستلزمات ليزر">💎 مستلزمات ليزر</SelectItem><SelectItem value="كريمات">🧴 كريمات</SelectItem><SelectItem value="أدوات">🔧 أدوات</SelectItem></SelectContent></Select></div><div className="grid grid-cols-3 gap-3"><div><Label>الكمية</Label><Input type="number" value={editInventoryForm.quantity} onChange={e => setEditInventoryForm(prev => ({ ...prev, quantity: e.target.value }))} placeholder="0" className="input-luxury rounded-xl" /></div><div><Label>الحد الأدنى</Label><Input type="number" value={editInventoryForm.minQuantity} onChange={e => setEditInventoryForm(prev => ({ ...prev, minQuantity: e.target.value }))} placeholder="5" className="input-luxury rounded-xl" /></div><div><Label>السعر</Label><Input type="number" value={editInventoryForm.unitPrice} onChange={e => setEditInventoryForm(prev => ({ ...prev, unitPrice: e.target.value }))} placeholder="0" className="input-luxury rounded-xl" /></div></div><div><Label>ملاحظات</Label><Input value={editInventoryForm.notes} onChange={e => setEditInventoryForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 text-white" onClick={async () => { if (!editInventoryForm.name.trim()) return toast.error('الاسم مطلوب'); if (editingInventoryId) { try { await apiFetch(`/inventory/items/${editingInventoryId}`, { method: 'PUT', body: JSON.stringify({ name: editInventoryForm.name, category: editInventoryForm.category || null, quantity: parseInt(editInventoryForm.quantity) || 0, minQuantity: parseInt(editInventoryForm.minQuantity) || 5, unitPrice: parseFloat(editInventoryForm.unitPrice) || 0, notes: editInventoryForm.notes || null }) }); setInventoryItems(prev => prev.map(i => i.id === editingInventoryId ? { ...i, name: editInventoryForm.name, category: editInventoryForm.category, quantity: parseInt(editInventoryForm.quantity) || 0, minQuantity: parseInt(editInventoryForm.minQuantity) || 5, unitPrice: parseFloat(editInventoryForm.unitPrice) || 0, notes: editInventoryForm.notes } : i)); toast.success('تم تعديل العنصر') } catch { toast.error('خطأ في التعديل') } } else { await addItem('/inventory/items', { name: editInventoryForm.name, category: editInventoryForm.category || null, quantity: parseInt(editInventoryForm.quantity) || 0, minQuantity: parseInt(editInventoryForm.minQuantity) || 5, unitPrice: parseFloat(editInventoryForm.unitPrice) || 0, notes: editInventoryForm.notes || null }, setInventoryItems) } setShowAddInventory(false); setEditingInventoryId(null); setEditInventoryForm({ name: '', category: '', quantity: '', minQuantity: '', unitPrice: '', notes: '' }) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Stock Transaction Dialog */}
      <Dialog open={showStockTransaction} onOpenChange={setShowStockTransaction}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle className="flex items-center gap-2">{stockTransactionType === 'in' ? <FileUp size={18} className="text-emerald-500" /> : <FileDown size={18} className="text-orange-500" />} {stockTransactionType === 'in' ? 'توريد مخزون' : 'صرف مخزون'}</DialogTitle></DialogHeader><div className="space-y-3"><div className="flex gap-2">{[{ type: 'in' as const, label: 'توريد', emoji: '📥', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' }, { type: 'out' as const, label: 'صرف', emoji: '📤', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300' }].map(t => (<motion.button key={t.type} whileTap={{ scale: 0.95 }} onClick={() => setStockTransactionType(t.type)} className={cn('flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', t.color, stockTransactionType === t.type ? 'ring-2 ring-primary shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}><span>{t.emoji}</span>{t.label}</motion.button>))}</div><div><Label>الكمية *</Label><Input type="number" value={stockTransactionQty} onChange={e => setStockTransactionQty(e.target.value)} placeholder="الكمية" className="input-luxury rounded-xl" /></div><div><Label>ملاحظات</Label><Input value={stockTransactionNotes} onChange={e => setStockTransactionNotes(e.target.value)} placeholder="سبب التوريد/الصرف..." className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className={cn('btn-luxury rounded-xl text-white', stockTransactionType === 'in' ? 'bg-gradient-to-l from-emerald-500 to-emerald-600' : 'bg-gradient-to-l from-orange-500 to-orange-600')} onClick={async () => { const qty = parseInt(stockTransactionQty); if (!qty || qty <= 0) return toast.error('أدخل كمية صحيحة'); try { await apiFetch('/inventory/transactions', { method: 'POST', body: JSON.stringify({ itemId: stockTransactionItemId, type: stockTransactionType, quantity: qty, notes: stockTransactionNotes || null, date: cairoISO() }) }); const item = inventoryItems.find(i => i.id === stockTransactionItemId); if (item) { const newQty = stockTransactionType === 'in' ? item.quantity + qty : Math.max(0, item.quantity - qty); setInventoryItems(prev => prev.map(i => i.id === stockTransactionItemId ? { ...i, quantity: newQty } : i)) } toast.success(stockTransactionType === 'in' ? `تم توريد ${qty} وحدة` : `تم صرف ${qty} وحدة`); setShowStockTransaction(false) } catch { toast.error('خطأ في العملية') } }}>تأكيد</Button></DialogFooter></DialogContent></Dialog>

      {/* Add/Edit Partner Doctor Dialog */}
      <Dialog open={showAddDoctor} onOpenChange={setShowAddDoctor}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Stethoscope size={20} className="text-emerald-500" /> {editingDoctorId ? 'تعديل الطبيب' : 'طبيب مشارك جديد'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold">الاسم *</Label><Input value={doctorForm.name} onChange={e => setDoctorForm(prev => ({ ...prev, name: e.target.value }))} placeholder="اسم الطبيب" className="input-luxury rounded-xl h-10" /></div>
            <div><Label className="text-xs font-bold">التخصص</Label><Input value={doctorForm.specialty} onChange={e => setDoctorForm(prev => ({ ...prev, specialty: e.target.value }))} placeholder="التخصص" className="input-luxury rounded-xl h-10" /></div>
          </div>
          <div><Label className="text-xs font-bold">الهاتف</Label><Input value={doctorForm.phone} onChange={e => setDoctorForm(prev => ({ ...prev, phone: normalizePhone(e.target.value) }))} placeholder="رقم الهاتف" className="input-luxury rounded-xl h-10" /></div>
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
        <DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-lime-500 to-lime-600 text-white" onClick={async () => { if (!templatePatientId) return toast.error('اختر المريض'); const patient = patients.find(p => p.id === templatePatientId); const now = cairoISO(); for (let i = 0; i < (selectedTemplate?.sessions || 0); i++) { await addItem('/sessions', { patientId: templatePatientId, status: 'completed', price: selectedTemplate?.estimatedPrice / selectedTemplate?.sessions || 0, paid: true, notes: `قالب: ${selectedTemplate?.name} - جلسة ${i + 1}`, date: now }, setSessions) } toast.success(`تم تطبيق قالب "${selectedTemplate?.name}" على ${patient?.name}`); setShowApplyTemplate(false); setTemplatePatientId(''); setSelectedTemplate(null) }}><Sparkles size={14} className="ml-1" /> تطبيق القالب</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* ─── Add Transaction Dialog ─── */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><DollarSign size={20} className="text-amber-500" /> إضافة معاملة مالية</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">نوع المعاملة</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setTxnFormType('income')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', txnFormType === 'income' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-lg' : 'border-transparent bg-muted/50 text-muted-foreground')}><TrendingUp size={16} /> إيراد</motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setTxnFormType('expense')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', txnFormType === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-lg' : 'border-transparent bg-muted/50 text-muted-foreground')}><TrendingUp size={16} className="rotate-180" /> مصروف</motion.button>
              </div>
            </div>
            <div><Label className="text-xs font-bold">الفئة</Label>
              <Select value={txnFormCategory} onValueChange={setTxnFormCategory}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {txnFormType === 'income' ? (
                    <>
                      <SelectItem value="كشف">كشف</SelectItem>
                      <SelectItem value="إعادة">إعادة</SelectItem>
                      <SelectItem value="جلسات">جلسات</SelectItem>
                      <SelectItem value="ليزر">ليزر</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="إيجار">إيجار</SelectItem>
                      <SelectItem value="رواتب">رواتب</SelectItem>
                      <SelectItem value="مستلزمات">مستلزمات</SelectItem>
                      <SelectItem value="صيانة">صيانة</SelectItem>
                      <SelectItem value="كهرباء">كهرباء</SelectItem>
                      <SelectItem value="ماء">ماء</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs font-bold">المبلغ (ج.م) *</Label><Input type="number" value={txnFormAmount} onChange={e => setTxnFormAmount(e.target.value)} placeholder="المبلغ بالجنيه..." className="input-luxury rounded-xl h-10 mt-1 text-lg font-bold" /></div>
            <div><Label className="text-xs font-bold">الوصف</Label><Input value={txnFormDescription} onChange={e => setTxnFormDescription(e.target.value)} placeholder="وصف المعاملة..." className="input-luxury rounded-xl h-10 mt-1" /></div>
            <div><Label className="text-xs font-bold">التاريخ</Label><Input type="date" value={txnFormDate} onChange={e => setTxnFormDate(e.target.value)} className="input-luxury rounded-xl h-10 mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddTransaction(false)}>إلغاء</Button>
            <Button className={cn('btn-luxury rounded-xl text-white', txnFormType === 'income' ? 'bg-gradient-to-l from-emerald-500 to-emerald-600' : 'bg-gradient-to-l from-red-500 to-red-600')} onClick={async () => {
              const amount = parseFloat(txnFormAmount)
              if (!amount || amount <= 0) return toast.error('أدخل مبلغ صحيح')
              const date = txnFormDate || cairoTodayInput()
              await addItem('/finance/transactions', { type: txnFormType, category: txnFormCategory, amount, description: txnFormDescription || undefined, date }, setTransactions)
              setTxnFormType('income'); setTxnFormCategory('كشف'); setTxnFormAmount(''); setTxnFormDescription(''); setTxnFormDate('')
              setShowAddTransaction(false)
              toast.success(txnFormType === 'income' ? 'تم إضافة الإيراد' : 'تم إضافة المصروف')
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Service Dialog ─── */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Tag size={20} className="text-teal-500" /> خدمة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">اسم الخدمة *</Label><Input value={serviceFormName} onChange={e => setServiceFormName(e.target.value)} placeholder="اسم الخدمة..." className="input-luxury rounded-xl h-10 mt-1" /></div>
            <div><Label className="text-xs font-bold">الفئة</Label>
              <Select value={serviceFormCategory} onValueChange={setServiceFormCategory}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="عام">عام</SelectItem>
                  <SelectItem value="جلدية">جلدية</SelectItem>
                  <SelectItem value="تجميلية">تجميلية</SelectItem>
                  <SelectItem value="ليزر">ليزر</SelectItem>
                  <SelectItem value="حقن">حقن</SelectItem>
                  <SelectItem value="عمليات">عمليات</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-bold">السعر (ج.م) *</Label><Input type="number" value={serviceFormPrice} onChange={e => setServiceFormPrice(e.target.value)} placeholder="0" className="input-luxury rounded-xl h-10 mt-1" /></div>
              <div><Label className="text-xs font-bold">المدة (دقيقة)</Label><Input type="number" value={serviceFormDuration} onChange={e => setServiceFormDuration(e.target.value)} placeholder="30" className="input-luxury rounded-xl h-10 mt-1" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddService(false)}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-teal-600 to-teal-700 text-white" onClick={async () => {
              if (!serviceFormName.trim()) return toast.error('اسم الخدمة مطلوب')
              const price = parseFloat(serviceFormPrice) || 0
              await addItem('/services', { name: serviceFormName, category: serviceFormCategory || 'عام', price, duration: parseInt(serviceFormDuration) || undefined, active: true }, setServices)
              setServiceFormName(''); setServiceFormCategory('عام'); setServiceFormPrice(''); setServiceFormDuration('')
              setShowAddService(false)
              toast.success('تم إضافة الخدمة')
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Booking Dialog ─── */}
      <Dialog open={showAddBooking} onOpenChange={setShowAddBooking}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarCheck size={20} className="text-sky-500" /> حجز جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">المريض</Label>
              <Select value={bookingFormPatientId} onValueChange={v => { setBookingFormPatientId(v); const p = patients.find(pp => pp.id === v); if (p) setBookingFormPatientSearch(p.name) }}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue placeholder="اختر المريض..." /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.fileNumber})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-bold">التاريخ *</Label><Input type="date" value={bookingFormDate} onChange={e => setBookingFormDate(e.target.value)} className="input-luxury rounded-xl h-10 mt-1" /></div>
              <div><Label className="text-xs font-bold">الوقت</Label><Input type="time" value={bookingFormTime} onChange={e => setBookingFormTime(e.target.value)} className="input-luxury rounded-xl h-10 mt-1" /></div>
            </div>
            <div><Label className="text-xs font-bold">نوع الحجز</Label>
              <Select value={bookingFormType} onValueChange={setBookingFormType}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkup">كشف</SelectItem>
                  <SelectItem value="revisit">إعادة</SelectItem>
                  <SelectItem value="session">جلسة</SelectItem>
                  <SelectItem value="consultation">استشارة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs font-bold">الحالة</Label>
              <Select value={bookingFormStatus} onValueChange={setBookingFormStatus}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs font-bold">ملاحظات</Label><Input value={bookingFormNotes} onChange={e => setBookingFormNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-10 mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddBooking(false)}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-sky-500 to-sky-600 text-white" onClick={async () => {
              if (!bookingFormDate) return toast.error('التاريخ مطلوب')
              const dateStr = bookingFormTime ? `${bookingFormDate}T${bookingFormTime}:00` : bookingFormDate
              await addItem('/appointments', { patientId: bookingFormPatientId || undefined, date: dateStr, duration: 30, type: bookingFormType, status: bookingFormStatus, notes: bookingFormNotes || undefined }, setAppointments)
              setBookingFormPatientSearch(''); setBookingFormPatientId(''); setBookingFormDate(''); setBookingFormTime(''); setBookingFormType('checkup'); setBookingFormStatus('scheduled'); setBookingFormNotes('')
              setShowAddBooking(false)
              toast.success('تم إضافة الحجز')
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add/Edit Personal Transaction Dialog ─── */}
      <Dialog open={showAddPersonalTxn} onOpenChange={(open) => { setShowAddPersonalTxn(open); if (!open) { setEditingPersonalTxnId(null); setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' }) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wallet size={20} className="text-orange-500" /> {editingPersonalTxnId ? 'تعديل معاملة' : 'معاملة شخصية جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {/* Type toggle */}
            <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
              <button onClick={() => setPersonalTxnForm(prev => ({ ...prev, type: 'income' }))} className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5', personalTxnForm.type === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground')}>
                <TrendingUp size={14} /> إيراد
              </button>
              <button onClick={() => setPersonalTxnForm(prev => ({ ...prev, type: 'expense' }))} className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5', personalTxnForm.type === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-muted-foreground')}>
                <TrendingDown size={14} /> مصروف
              </button>
            </div>
            {/* Category */}
            <div><Label className="text-xs font-bold">الفئة *</Label>
              <Select value={personalTxnForm.category} onValueChange={v => setPersonalTxnForm(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue placeholder="اختر الفئة..." /></SelectTrigger>
                <SelectContent>
                  {(personalTxnForm.type === 'income' ? PERSONAL_INCOME_CATS : PERSONAL_EXPENSE_CATS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Amount */}
            <div><Label className="text-xs font-bold">المبلغ (ج.م) *</Label><Input type="number" value={personalTxnForm.amount} onChange={e => setPersonalTxnForm(prev => ({ ...prev, amount: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10 mt-1" /></div>
            {/* Description */}
            <div><Label className="text-xs font-bold">الوصف</Label><Input value={personalTxnForm.description} onChange={e => setPersonalTxnForm(prev => ({ ...prev, description: e.target.value }))} placeholder="وصف المعاملة..." className="input-luxury rounded-xl h-10 mt-1" /></div>
            {/* Date */}
            <div><Label className="text-xs font-bold">التاريخ</Label><Input type="date" value={personalTxnForm.date} onChange={e => setPersonalTxnForm(prev => ({ ...prev, date: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowAddPersonalTxn(false); setEditingPersonalTxnId(null); setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' }) }}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-orange-500 to-amber-500 text-white" onClick={editingPersonalTxnId ? editPersonalTransaction : addPersonalTransaction}>
              {editingPersonalTxnId ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add/Edit Personal Reminder Dialog ─── */}
      <Dialog open={showAddPersonalReminder} onOpenChange={(open) => { setShowAddPersonalReminder(open); if (!open) { setEditingPersonalReminderId(null); setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' }) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Bell size={20} className="text-amber-500" /> {editingPersonalReminderId ? 'تعديل تذكير' : 'تذكير شخصي جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">العنوان *</Label><Input value={personalReminderForm.title} onChange={e => setPersonalReminderForm(prev => ({ ...prev, title: e.target.value }))} placeholder="عنوان التذكير..." className="input-luxury rounded-xl h-10 mt-1" /></div>
            <div><Label className="text-xs font-bold">الوصف</Label><Textarea value={personalReminderForm.description} onChange={e => setPersonalReminderForm(prev => ({ ...prev, description: e.target.value }))} placeholder="وصف التذكير..." className="input-luxury rounded-xl mt-1" rows={2} /></div>
            <div><Label className="text-xs font-bold">التاريخ والوقت</Label><Input type="datetime-local" value={personalReminderForm.date} onChange={e => setPersonalReminderForm(prev => ({ ...prev, date: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowAddPersonalReminder(false); setEditingPersonalReminderId(null); setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' }) }}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-amber-500 to-violet-500 text-white" onClick={editingPersonalReminderId ? editPersonalReminder : addPersonalReminder}>
              {editingPersonalReminderId ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Personal Note Dialog ─── */}
      <Dialog open={showAddPersonalNote} onOpenChange={setShowAddPersonalNote}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><StickyNote size={20} className="text-sky-500" /> ملاحظة شخصية جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">المحتوى *</Label><Textarea value={personalNoteForm.content} onChange={e => setPersonalNoteForm(prev => ({ ...prev, content: e.target.value }))} placeholder="اكتب ملاحظتك هنا..." className="input-luxury rounded-xl mt-1" rows={4} autoFocus /></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div><p className="text-sm font-medium">مهم</p><p className="text-xs text-muted-foreground">وضع علامة على الملاحظة كمهمة</p></div>
              <Switch checked={personalNoteForm.important} onCheckedChange={v => setPersonalNoteForm(prev => ({ ...prev, important: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddPersonalNote(false)}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-sky-500 to-violet-500 text-white" onClick={addPersonalNote}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

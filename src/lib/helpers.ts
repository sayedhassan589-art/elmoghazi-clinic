// ─── Shared Helper Functions & Constants ──────────────────────────
// Extracted from page.tsx for use by all components

// ─── Helpers ────────────────────────────────────────────────────────────────
export const CHART_COLORS = ['#047857', '#D4A843', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EC4899']

// Helper: normalize any Arabic/Persian numerals and symbols to Latin
export const normalizePhone = (phone: string): string => {
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
export const waPhone = (phone?: string) => {
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
export const getLocalDateStr = (date?: Date | string) => {
  const d = date ? new Date(date) : new Date()
  return d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })
}

// Helper: get Cairo weekday name from a YYYY-MM-DD date string — bulletproof timezone handling
// Uses noon UTC (T12:00:00Z) so the date never crosses a day boundary regardless of timezone offset
export const getCairoWeekday = (dateStr: string): string => {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('ar-EG', { weekday: 'long', timeZone: 'Africa/Cairo' })
}

// Helper: get Cairo formatted date label from a YYYY-MM-DD date string — always shows correct Cairo date
export const getCairoDateLabel = (dateStr: string): string => {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' })
}

// Helper: get Cairo timezone date parts (year, month, day) — avoids UTC offset on Vercel
export const getCairoDateParts = (date?: Date | string) => {
  const d = date ? new Date(date) : new Date()
  const parts = d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }).split('-').map(Number)
  return { year: parts[0], month: parts[1], day: parts[2], dateStr: parts.join('-') }
}

// Helper: get all 7 days of the current Egyptian week (Saturday–Friday) as date strings
// Returns array of { dateStr, dayName } from Saturday to Friday of the current week
export const getEgyptianWeekDays = () => {
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
export const cairoISO = () => {
  const now = new Date()
  // Get Cairo's local date/time components
  const cairoStr = now.toLocaleString('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  // en-CA with time gives "2024/06/14, 13:04:09" format
  // We need to parse it to create a proper Cairo-local → UTC conversion
  return now.toISOString()
}

// Helper: get today's date in Cairo timezone as YYYY-MM-DD (for date input defaults)
export const cairoTodayInput = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })

// Helper: get current time in Cairo as HH:MM (for time input defaults)
export const cairoTimeInput = () => {
  const now = new Date()
  return now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' })
}

// Helper: combine a date (YYYY-MM-DD) with current Cairo time → "YYYY-MM-DDTHH:MM:00"
// Returns undefined when no date is provided so the server uses the current moment.
// CRITICAL: A bare "YYYY-MM-DD" string is interpreted by the API as Cairo midnight (00:00),
// which causes a multi-hour offset vs. the actual entry time. Always pair the date
// with the current Cairo time so the recorded timestamp reflects when the action happened.
export const cairoDateTime = (dateStr?: string): string | undefined => {
  if (!dateStr) return undefined
  return `${dateStr}T${cairoTimeInput()}:00`
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
export const BODY_AREAS = [
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

export const SKIN_TYPES = [
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

export const HAIR_COLORS = [
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
export const getImprovementColor = (score: number) => {
  if (score <= 3) return { ring: '#ef4444', bg: 'bg-red-500', text: 'text-red-600', label: 'سيء' }
  if (score <= 5) return { ring: '#f97316', bg: 'bg-orange-500', text: 'text-orange-600', label: 'متوسط' }
  if (score <= 7) return { ring: '#eab308', bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'جيد' }
  if (score <= 9) return { ring: '#22c55e', bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'ممتاز' }
  return { ring: '#047857', bg: 'bg-emerald-700', text: 'text-emerald-700', label: 'مثالي' }
}

export const getImprovementEmoji = (score: number) => {
  if (score <= 3) return '😟'
  if (score <= 5) return '😐'
  if (score <= 7) return '🙂'
  if (score <= 9) return '😊'
  return '🤩'
}

export const getImprovementHistory = (historyStr?: string): ImprovementEntry[] => {
  if (!historyStr) return []
  try { return JSON.parse(historyStr) } catch { return [] }
}
// Arabic text normalization: remove diacritics, normalize alef/yaa/taa
export const normalizeArabic = (text: string): string => {
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
export const fuzzyMatch = (query: string, target: string): boolean => {
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
export const smartSearch = (query: string, fields: (string | undefined)[]): { match: boolean; score: number } => {
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
export const getVisitCategory = (type: string): string => {
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
export const VISIT_TYPES = [
  { id: 'checkup', label: 'كشف', emoji: '🩺', bg: 'bg-emerald-500', hoverBg: 'hover:bg-emerald-600', ring: 'ring-emerald-300' },
  { id: 'revisit', label: 'إعادة', emoji: '🔄', bg: 'bg-blue-500', hoverBg: 'hover:bg-blue-600', ring: 'ring-blue-300' },
  { id: 'session', label: 'جلسة', emoji: '⚡', bg: 'bg-violet-500', hoverBg: 'hover:bg-violet-600', ring: 'ring-violet-300' },
  { id: 'checkup_session', label: 'كشف + جلسة', emoji: '🩺⚡', bg: 'bg-gradient-to-l from-emerald-500 to-violet-500', hoverBg: 'hover:from-emerald-600 hover:to-violet-600', ring: 'ring-emerald-300' },
  { id: 'revisit_session', label: 'إعادة + جلسة', emoji: '🔄⚡', bg: 'bg-gradient-to-l from-blue-500 to-violet-500', hoverBg: 'hover:from-blue-600 hover:to-violet-600', ring: 'ring-blue-300' },
]

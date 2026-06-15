/**
 * Cairo (Africa/Cairo) timezone utilities for server-side use.
 * Vercel servers run in UTC, so all date operations must be
 * explicitly converted to Cairo timezone (UTC+2 / UTC+3 DST).
 *
 * CRITICAL: `new Date()` on Vercel is UTC. Never use toLocaleString()
 * then parse back as Date — that treats Cairo time as UTC, adding +3h error.
 */

const CAIRO_TZ = 'Africa/Cairo'

/** Get the current moment as a UTC Date — same as new Date(), but explicit */
export function cairoNow(): Date {
  return new Date()
}

/** Get today's date string in Cairo timezone (YYYY-MM-DD) */
export function cairoTodayStr(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: CAIRO_TZ })
}

/** Get Cairo date parts: { year, month (1-based), day, dateStr } */
export function cairoDateParts(date?: Date | string): { year: number; month: number; day: number; dateStr: string } {
  const d = date ? new Date(date) : new Date()
  const parts = d.toLocaleDateString('en-CA', { timeZone: CAIRO_TZ }).split('-').map(Number)
  return { year: parts[0], month: parts[1], day: parts[2], dateStr: parts.join('-') }
}

/**
 * Get the Cairo day-of-week (0=Sun, 6=Sat) for the current Cairo date.
 * Uses Cairo timezone to determine the correct day even when UTC differs.
 */
function cairoDayOfWeek(): number {
  // Get Cairo's weekday as a number using locale formatting
  const now = new Date()
  const weekday = now.toLocaleDateString('en-US', { timeZone: CAIRO_TZ, weekday: 'narrow' })
  const dayMap: Record<string, number> = { 'S': 0, 'M': 1, 'T': 2, 'W': 3, 'T': 2, 'F': 5, 'S': 6 }
  // 'narrow' gives single letters which can be ambiguous (S=Sun/Sat, T=Tue/Thu)
  // Use 'short' instead for clarity
  const shortDay = now.toLocaleDateString('en-US', { timeZone: CAIRO_TZ, weekday: 'short' })
  const shortDayMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 }
  return shortDayMap[shortDay] ?? 0
}

/**
 * Get Cairo start-of-day and end-of-day as UTC Date objects
 * suitable for Prisma date range queries.
 * Returns { gte: startOfDay, lt: startOfNextDay }
 */
export function cairoDayRange(dateStr?: string): { gte: Date; lt: Date } {
  const today = dateStr || cairoTodayStr()
  // Get the UTC offset for Cairo at this date
  const offsetMinutes = getCairoOffsetMinutes(new Date(today + 'T12:00:00'))
  // Cairo midnight in UTC = midnight UTC - offset
  // e.g. Cairo midnight = 00:00 Cairo = 00:00 - (+3:00) = 21:00 UTC previous day
  const [y, m, d] = today.split('-').map(Number)
  const utcMidnight = new Date(Date.UTC(y, m - 1, d, 0, 0, 0))
  const utcStart = new Date(utcMidnight.getTime() - offsetMinutes * 60 * 1000)
  const utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000)
  return { gte: utcStart, lt: utcEnd }
}

/**
 * Get Cairo week range (Saturday to Friday, common in Egypt)
 * Returns { gte: startOfSaturday, lt: startOfNextSaturday }
 */
export function cairoWeekRange(): { gte: Date; lt: Date; weekStart: string; weekEnd: string } {
  // Use Cairo timezone to get the correct day of week
  const cairoToday = cairoTodayStr()
  const dayOfWeek = cairoDayOfWeek() // 0=Sun, 6=Sat
  // In Egypt, week typically starts Saturday (6)
  // Days since last Saturday
  const daysSinceSaturday = (dayOfWeek + 1) % 7 // Sat=0, Sun=1, ..., Fri=6

  // Calculate Saturday's date using Cairo date parts
  const parts = cairoDateParts()
  const satDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - daysSinceSaturday, 12, 0, 0))
  const saturdayStr = satDate.toLocaleDateString('en-CA', { timeZone: CAIRO_TZ })
  const nextSatDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - daysSinceSaturday + 7, 12, 0, 0))
  const nextSaturdayStr = nextSatDate.toLocaleDateString('en-CA', { timeZone: CAIRO_TZ })

  const start = cairoDayRange(saturdayStr)
  const end = cairoDayRange(nextSaturdayStr)
  return { gte: start.gte, lt: end.gte, weekStart: saturdayStr, weekEnd: nextSaturdayStr }
}

/**
 * Get Cairo month range
 * Returns { gte: startOfMonth, lt: startOfNextMonth }
 */
export function cairoMonthRange(year?: number, month?: number): { gte: Date; lt: Date; monthStr: string } {
  const parts = cairoDateParts()
  const y = year || parts.year
  const m = month || parts.month
  const monthStr = `${y}-${String(m).padStart(2, '0')}`
  const firstDay = `${monthStr}-01`
  const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
  const start = cairoDayRange(firstDay)
  const end = cairoDayRange(nextMonth)
  return { gte: start.gte, lt: end.gte, monthStr }
}

/**
 * Get the UTC offset in minutes for Cairo at a given date.
 * Cairo is UTC+2 (standard) or UTC+3 (DST, Jun-Oct).
 */
function getCairoOffsetMinutes(date: Date): number {
  // Use Intl.DateTimeFormat to get the offset
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CAIRO_TZ,
    timeZoneName: 'longOffset',
  })
  const parts = formatter.formatToParts(date)
  const tzPart = parts.find(p => p.type === 'timeZoneName')
  if (tzPart) {
    // Parse "GMT+02:00" or "GMT+03:00"
    const match = tzPart.value.match(/GMT([+-])(\d{2}):(\d{2})/)
    if (match) {
      const sign = match[1] === '+' ? 1 : -1
      const hours = parseInt(match[2])
      const minutes = parseInt(match[3])
      return sign * (hours * 60 + minutes)
    }
  }
  // Fallback: UTC+2
  return 120
}

/**
 * Parse a date string as Cairo time and return a UTC Date.
 * - If the date string has explicit timezone info (+, Z), parse directly.
 * - If the date string has a time component but NO timezone (e.g. "2024-06-14T14:30"),
 *   interpret the time as Cairo local time (not UTC) and convert to UTC.
 * - If the date string is date-only (e.g. "2024-06-14"), interpret as Cairo midnight.
 * - If no date is provided, returns current moment (same as new Date()).
 *
 * IMPORTANT: When no date is provided, we return new Date() which is UTC.
 * This ensures the stored time is correct UTC, and when displayed with
 * timeZone: 'Africa/Cairo', it shows the correct Cairo time.
 */
export function toCairoDate(dateStr?: string): Date {
  if (!dateStr) {
    // No date provided — use the current moment in UTC
    // This is correct because Prisma stores DateTime as UTC,
    // and formatTime/formatDate display with Cairo timezone.
    return new Date()
  }
  // If the date string already has explicit timezone info, parse directly
  if (dateStr.includes('+') || dateStr.includes('Z')) {
    return new Date(dateStr)
  }
  // If the date string has a time component but no timezone info
  // (e.g. "2024-06-14T14:30" or "2024-06-14T14:30:00")
  // Interpret as Cairo local time and convert to UTC
  if (dateStr.includes('T')) {
    // Extract the date part to determine Cairo's UTC offset on that day
    const datePart = dateStr.slice(0, 10) // "2024-06-14"
    const offsetMinutes = getCairoOffsetMinutes(new Date(datePart + 'T12:00:00'))
    // Parse the datetime as if it were Cairo local time
    // On Vercel (UTC), new Date("2024-06-14T14:30") = 14:30 UTC
    // We need to subtract the Cairo offset to get the correct UTC time
    // e.g. 14:30 Cairo = 14:30 - (+3:00) = 11:30 UTC
    const asUtc = new Date(dateStr)
    return new Date(asUtc.getTime() - offsetMinutes * 60 * 1000)
  }
  // Date-only string like "2024-06-14" - interpret as Cairo midnight
  return cairoDayRange(dateStr).gte
}

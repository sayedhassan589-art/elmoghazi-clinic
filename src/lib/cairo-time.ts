/**
 * Cairo (Africa/Cairo) timezone utilities for server-side use.
 * Vercel servers run in UTC, so all date operations must be
 * explicitly converted to Cairo timezone (UTC+2 / UTC+3 DST).
 */

const CAIRO_TZ = 'Africa/Cairo'

/** Get current date/time in Cairo as a JS Date object */
export function cairoNow(): Date {
  // Create a date string in Cairo timezone, then parse it back
  const now = new Date()
  const cairoStr = now.toLocaleString('en-US', { timeZone: CAIRO_TZ })
  return new Date(cairoStr)
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
 * Get Cairo start-of-day and end-of-day as UTC Date objects
 * suitable for Prisma date range queries.
 * Returns { gte: startOfDay, lt: startOfNextDay }
 */
export function cairoDayRange(dateStr?: string): { gte: Date; lt: Date } {
  const today = dateStr || cairoTodayStr()
  // Cairo is UTC+2 or UTC+3 (DST). We construct UTC boundaries that match Cairo midnight.
  // Parse the date string and create boundaries in UTC that correspond to Cairo midnight.
  const [y, m, d] = today.split('-').map(Number)
  // Cairo is at minimum UTC+2, so Cairo midnight = 22:00 UTC previous day
  // We use a safe approach: construct the date and adjust
  // Start of day in Cairo (midnight) = 2024-01-01T00:00:00 Cairo = 2023-12-31T22:00:00Z (standard) or 21:00:00Z (DST)
  // The simplest reliable way: use Intl to figure out the offset
  const cairoMidnight = new Date(`${today}T00:00:00`)
  // Get the UTC offset for Cairo at this date
  const offsetMinutes = getCairoOffsetMinutes(cairoMidnight)
  // Cairo midnight in UTC = midnight - offset
  const utcStart = new Date(cairoMidnight.getTime() - offsetMinutes * 60 * 1000)
  const utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000)
  return { gte: utcStart, lt: utcEnd }
}

/**
 * Get Cairo week range (Saturday to Friday, common in Egypt)
 * Returns { gte: startOfSaturday, lt: startOfNextSaturday }
 */
export function cairoWeekRange(): { gte: Date; lt: Date; weekStart: string; weekEnd: string } {
  const today = cairoNow()
  const dayOfWeek = today.getDay() // 0=Sun, 6=Sat
  // In Egypt, week typically starts Saturday (6)
  // Days since last Saturday
  const daysSinceSaturday = (dayOfWeek + 1) % 7 // Sat=0, Sun=1, ..., Fri=6
  const saturday = new Date(today)
  saturday.setDate(today.getDate() - daysSinceSaturday)
  const saturdayStr = saturday.toLocaleDateString('en-CA', { timeZone: CAIRO_TZ })
  const nextSaturday = new Date(saturday)
  nextSaturday.setDate(saturday.getDate() + 7)
  const nextSaturdayStr = nextSaturday.toLocaleDateString('en-CA', { timeZone: CAIRO_TZ })
  const start = cairoDayRange(saturdayStr)
  const end = cairoDayRange(nextSaturdayStr)
  return { gte: start.gte, lt: end.gte, weekStart: saturdayStr, weekEnd: nextSaturdayStr }
}

/**
 * Get Cairo month range
 * Returns { gte: startOfMonth, lt: startOfNextMonth }
 */
export function cairoMonthRange(year?: number, month?: number): { gte: Date; lt: Date; monthStr: string } {
  const now = cairoNow()
  const y = year || now.getFullYear()
  const m = month || (now.getMonth() + 1) // 1-based
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
 * If the date string already has timezone info, it's returned as-is.
 * If no date is provided, returns current Cairo time as UTC Date.
 */
export function toCairoDate(dateStr?: string): Date {
  if (!dateStr) {
    // Return current time, but ensure it's interpreted as Cairo time
    return cairoNow()
  }
  // If the date string already has timezone info, parse directly
  if (dateStr.includes('+') || dateStr.includes('Z') || dateStr.includes('T')) {
    return new Date(dateStr)
  }
  // Date-only string like "2024-06-14" - interpret as Cairo midnight
  return cairoDayRange(dateStr).gte
}

'use client'
import { useState, useEffect, memo } from 'react'

// ─── Isolated Cairo Clock (re-renders only itself every second, NOT the whole app) ──
// Wrapped with React.memo to prevent parent re-renders from triggering unnecessary updates
const CairoClock = memo(function CairoClock({ className, dateClassName }: { className?: string; dateClassName?: string }) {
  const [, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t) }, [])
  const now = new Date()
  const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Cairo', hour12: true })
  const date = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' })
  return <>{className && <span className={className} dir="ltr">{time}</span>}{dateClassName !== undefined && <span className={dateClassName || undefined}>{date}</span>}</>
})

export default CairoClock

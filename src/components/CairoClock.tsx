'use client'
import { useState, useEffect } from 'react'

// ─── Isolated Cairo Clock (re-renders only itself every second, NOT the whole app) ──
export default function CairoClock({ className, dateClassName }: { className?: string; dateClassName?: string }) {
  const [, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t) }, [])
  const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Cairo', hour12: true })
  const date = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' })
  return <>{className && <span className={className} dir="ltr">{time}</span>}{dateClassName !== undefined && <span className={dateClassName || undefined}>{date}</span>}</>
}

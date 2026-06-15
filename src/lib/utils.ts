import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeName(name: string | null | undefined): string {
  if (!name) return 'بدون اسم'
  return name.trim() || 'بدون اسم'
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ar-EG')} ج.م`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo' })
}

export function generateFileNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `F-${random}`
}

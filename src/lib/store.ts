import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'ASSISTANT'
}

export type ClinicTheme = 'emerald' | 'royal' | 'rosegold' | 'purple' | 'sunset' | 'teal' | 'ruby' | 'forest' | 'midnight' | 'champagne'

export interface ThemeConfig {
  id: ClinicTheme
  name: string
  primary: string
  primaryLight: string
  primaryDark: string
  accent: string
  accentLight: string
  gradient: string
  gradientDark: string
  icon: string
}

export const THEME_CONFIGS: ThemeConfig[] = [
  { id: 'emerald', name: 'زمردي', primary: '#047857', primaryLight: '#34d399', primaryDark: '#064e3b', accent: '#D4A843', accentLight: '#fcd34d', gradient: 'from-emerald-600 to-emerald-800', gradientDark: 'from-emerald-700 to-emerald-950', icon: '💎' },
  { id: 'royal', name: 'أزرق ملكي', primary: '#1e40af', primaryLight: '#60a5fa', primaryDark: '#1e3a8a', accent: '#f59e0b', accentLight: '#fcd34d', gradient: 'from-blue-600 to-blue-900', gradientDark: 'from-blue-800 to-blue-950', icon: '👑' },
  { id: 'rosegold', name: 'ذهبي وردي', primary: '#be185d', primaryLight: '#f472b6', primaryDark: '#831843', accent: '#fbbf24', accentLight: '#fde68a', gradient: 'from-pink-600 to-pink-900', gradientDark: 'from-pink-800 to-pink-950', icon: '🌹' },
  { id: 'purple', name: 'بنفسجي', primary: '#7c3aed', primaryLight: '#a78bfa', primaryDark: '#4c1d95', accent: '#f59e0b', accentLight: '#fcd34d', gradient: 'from-violet-600 to-violet-900', gradientDark: 'from-violet-800 to-violet-950', icon: '🔮' },
  { id: 'sunset', name: 'غروب', primary: '#ea580c', primaryLight: '#fb923c', primaryDark: '#9a3412', accent: '#06b6d4', accentLight: '#67e8f9', gradient: 'from-orange-500 to-red-700', gradientDark: 'from-orange-700 to-red-900', icon: '🌅' },
  { id: 'teal', name: 'تركوازي', primary: '#0d9488', primaryLight: '#5eead4', primaryDark: '#134e4a', accent: '#f472b6', accentLight: '#fbcfe8', gradient: 'from-teal-500 to-teal-800', gradientDark: 'from-teal-700 to-teal-950', icon: '🌊' },
  { id: 'ruby', name: 'ياقوتي', primary: '#dc2626', primaryLight: '#f87171', primaryDark: '#7f1d1d', accent: '#fbbf24', accentLight: '#fde68a', gradient: 'from-red-600 to-red-900', gradientDark: 'from-red-800 to-red-950', icon: '❤️' },
  { id: 'forest', name: 'غابات', primary: '#166534', primaryLight: '#4ade80', primaryDark: '#052e16', accent: '#eab308', accentLight: '#fde047', gradient: 'from-green-700 to-green-950', gradientDark: 'from-green-800 to-green-950', icon: '🌲' },
  { id: 'midnight', name: 'ليلي', primary: '#312e81', primaryLight: '#818cf8', primaryDark: '#1e1b4b', accent: '#c084fc', accentLight: '#e9d5ff', gradient: 'from-indigo-700 to-indigo-950', gradientDark: 'from-indigo-800 to-slate-950', icon: '🌙' },
  { id: 'champagne', name: 'شمباني', primary: '#92400e', primaryLight: '#f59e0b', primaryDark: '#451a03', accent: '#14b8a6', accentLight: '#5eead4', gradient: 'from-amber-600 to-amber-900', gradientDark: 'from-amber-800 to-amber-950', icon: '🥂' },
]

export interface StatusColorConfig {
  completed: string
  active: string
  pending: string
  cancelled: string
  scheduled: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

interface ClinicSettingsState {
  theme: ClinicTheme
  activeTab: string
  statusColors: StatusColorConfig
  autoBackup: boolean
  backupInterval: number // in minutes
  lastBackup: string | null
  setTheme: (theme: ClinicTheme) => void
  setActiveTab: (tab: string) => void
  setStatusColors: (colors: StatusColorConfig) => void
  setAutoBackup: (enabled: boolean) => void
  setBackupInterval: (minutes: number) => void
  setLastBackup: (date: string) => void
}

// ─── Auth Store ──────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user: AuthUser) =>
        set({ user, isAuthenticated: true }),
      logout: () =>
        set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'elmoghazi-auth',
    }
  )
)

// ─── Clinic Settings Store ───────────────────────────────────────────────────

export const useClinicStore = create<ClinicSettingsState>()(
  persist(
    (set) => ({
      theme: 'emerald',
      activeTab: 'dashboard',
      statusColors: {
        completed: '#10b981',
        active: '#3b82f6',
        pending: '#f59e0b',
        cancelled: '#ef4444',
        scheduled: '#8b5cf6',
      },
      autoBackup: false,
      backupInterval: 60,
      lastBackup: null,
      setTheme: (theme: ClinicTheme) => set({ theme }),
      setActiveTab: (tab: string) => set({ activeTab: tab }),
      setStatusColors: (colors: StatusColorConfig) => set({ statusColors: colors }),
      setAutoBackup: (enabled: boolean) => set({ autoBackup: enabled }),
      setBackupInterval: (minutes: number) => set({ backupInterval: minutes }),
      setLastBackup: (date: string) => set({ lastBackup: date }),
    }),
    {
      name: 'elmoghazi-clinic-settings',
    }
  )
)

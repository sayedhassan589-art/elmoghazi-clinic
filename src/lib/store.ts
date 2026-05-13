import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'ASSISTANT'
}

export type ClinicTheme = 'emerald' | 'gold' | 'rose' | 'purple' | 'blue' | 'slate'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

interface ClinicSettingsState {
  theme: ClinicTheme
  sidebarCollapsed: boolean
  activeTab: string
  setTheme: (theme: ClinicTheme) => void
  toggleSidebar: () => void
  setActiveTab: (tab: string) => void
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
      sidebarCollapsed: false,
      activeTab: 'dashboard',
      setTheme: (theme: ClinicTheme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setActiveTab: (tab: string) => set({ activeTab: tab }),
    }),
    {
      name: 'elmoghazi-clinic-settings',
    }
  )
)

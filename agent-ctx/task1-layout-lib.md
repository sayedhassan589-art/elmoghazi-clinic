# Task: Layout & Library Files for Elmoghazi Clinic

## Summary
Created all 5 required layout and library files for the Arabic RTL dermatology clinic management app.

## Files Created / Updated

### 1. `/src/app/layout.tsx`
- Root layout with `dir="rtl"` and `lang="ar"`
- Imported **Cairo** (Arabic body) and **Playfair Display** (English headings) fonts via `next/font/google`
- Wrapped children in `next-themes` ThemeProvider with `attribute="class"`
- Metadata: title="Elmoghazi Clinic | عيادة المغازى", description="نظام إدارة العيادة الجلدية"
- Uses Sonner toaster (position top-left for RTL)

### 2. `/src/lib/db.ts`
- Prisma client singleton pattern matching the exact spec
- Prevents multiple instances in dev via globalForPrisma

### 3. `/src/lib/store.ts`
- `useAuthStore` — Zustand store with persist: user (id, name, email, role), isAuthenticated, login(), logout()
- `useClinicStore` — Zustand store with persist: theme (emerald|gold|rose|purple|blue|slate), sidebarCollapsed, activeTab, setTheme(), toggleSidebar(), setActiveTab()
- Both stores persist to localStorage via zustand/middleware/persist

### 4. `/src/lib/api.ts`
- Comprehensive typed API helpers for ALL entities:
  - `fetchAPI<T>(path, options)` — base helper with JSON headers and error handling
  - Auth, Patients, Visits, Sessions, Services, Notes, Alerts, Reminders
  - Laser (records, sessions, packages, settings)
  - Finance (transactions, summary)
  - Appointments, Waiting Queue, Inventory (with item transactions)
  - Treatment Plans (with phases), Photos (with FormData upload), Prescriptions (with medications)
  - Notifications, Backup, AuditLog, Reports (daily/weekly/monthly)
- All entities have full TypeScript interfaces and CRUD operations

### 5. `/src/lib/utils.ts`
- `cn()` — clsx + tailwind-merge
- `safeName()` — returns 'بدون اسم' for null/empty names
- `formatCurrency()` — Arabic-locale currency with ج.م suffix
- `formatDate()` — Arabic long date format
- `formatTime()` — Arabic 2-digit time
- `generateFileNumber()` — F-XXXXXX random file number

### 6. `/src/app/globals.css` (updated)
- Changed font variables from `--font-geist-sans`/`--font-geist-mono` to `--font-cairo`

## Verification
- `bun run lint` passes with zero errors
- Dev server running on port 3000

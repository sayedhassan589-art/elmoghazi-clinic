---
Task ID: 1
Agent: main
Task: Implement all user-requested features for Elmoghazi Clinic

Work Log:
- Added PartnerDoctor model to Prisma schema with fields: name, phone, specialty, checkupPercentage, revisitPercentage, laserPercentage, sessionPercentage, fixedAmount, active, notes
- Created /api/doctors and /api/doctors/[id] API routes (GET, POST, PUT, DELETE)
- Ran Prisma migration (db push) successfully
- Updated page.tsx with PartnerDoctor interface, state variables, and doctor form
- Added doctors data loading to loadAllData (19 API calls now instead of 18)
- Removed "الجلسات" (Sessions) and "المواعيد" (Appointments) sub-tabs from More section
- Added "الأطباء المشاركون" (Partner Doctors) sub-tab with complete percentage-based earnings system
- Enhanced patient profile Overview tab with comprehensive activity timeline (visits + sessions + notes) with edit/delete
- Added role-based access control: Doctor (full access) / Secretary (patients + laser only)
- Added password protection for sections (default: 2137) with verification dialog
- Added sync status indicator in Settings (database connection status + record counts)
- Enhanced Quick Notes with professional animated UI (gradient colors, animated emojis, hover effects)
- Added Partner Doctor dialog with full CRUD (name, specialty, phone, percentages, fixed amount)
- Added Password verification dialog for locked sections
- Added lock icon indicator on bottom nav for restricted sections
- Updated top bar dropdown to use handleTabSwitch for role-based access
- Added doctorEarnings useMemo for automatic financial calculations
- Build verified: npx next build completes successfully

Stage Summary:
- PartnerDoctor model added to Prisma + API routes created
- Sessions & Appointments sub-tabs removed from More tab
- Partner Doctors section added with complete percentage system
- Patient overview now shows comprehensive timeline with edit/delete
- Role-based access (doctor/secretary) implemented
- Section password protection added (default: 2137)
- Sync status added to Settings
- Professional animated notes implemented
- Build: SUCCESS

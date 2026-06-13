---
Task ID: 1
Agent: Main
Task: Fix data disappearance and date bugs in clinic management system

Work Log:
- Investigated why all data disappeared: Prisma schema had `provider = "cockroachdb"` instead of `"sqlite"`, DATABASE_URL was pointing to `file:/home/z/my-project/db/custom.db` (SQLite path). The database directory didn't exist, so Prisma couldn't connect and all API calls failed.
- Fixed Prisma schema: Changed provider from "cockroachdb" to "sqlite"
- Created database directory `/home/z/my-project/db/` and ran `prisma db push` to create tables
- Fixed build script: Removed `--accept-data-loss` flag from build script to prevent future data loss
- Fixed getLocalDateStr cache key: Changed from `d.toISOString().slice(0, 10)` (UTC date only) to `slice(0, 16)` (includes hour:minute) to prevent cache collisions for dates near midnight UTC
- Fixed timezone bug in handleSmartPatientSubmit: Changed `T00:00:00` to `T00:00:00+02:00` for Cairo timezone, so custom dates are stored correctly in UTC
- Applied same timezone fix to profileVisitDate and profileSessionDate
- Replaced ALL `startsWith(todayStr)` date comparisons with `getLocalDateStr(date) === todayStr` (13+ occurrences) to correctly handle dates stored in UTC that represent Cairo dates
- Replaced ALL `t.date?.startsWith(visitDate/sessionDate)` patterns in deleteVisitWithFinance, deleteSessionWithFinance, editSessionWithFinance, and editVisitWithFinance
- Added date editing capability to patient profile visit editing: Added `date` field to `editVisitForm` state and UI with date input
- Updated `editVisitWithFinance` to accept optional `newDate` and `newPrice` parameters and update both visit and transaction dates
- Updated visits tab edit UI to include date and price fields
- Fixed revenue chart to show ALL days of the current month instead of last 7 days
- Fixed all financial transactions to persist to database instead of local-only state (laser session payments, follow-up visit payments, follow-up subscription payments, session payments)
- Seeded database with default user accounts

Stage Summary:
- Data disappearance root cause: Prisma schema had wrong provider (cockroachdb vs sqlite), preventing database creation
- All previous data is unfortunately lost as the database never existed properly
- Date off-by-one bug fixed with Cairo timezone offset (+02:00) and getLocalDateStr() for all date comparisons
- Date editing from patient profile now works with date input field
- Revenue chart now shows all days of the month
- All financial transactions now properly persist to database
- Build succeeds, application is ready to use

---
Task ID: 2
Agent: Main
Task: Prevent future data loss - add full backup/restore protection

Work Log:
- Added "full backup download" button that exports ALL data as a downloadable JSON file (survives DB loss)
- Added "restore from file" button with confirmation dialog for importing backup files
- Added restoreFromBackup function that restores data type by type via API (skips duplicates)
- Added restore confirmation AlertDialog to prevent accidental restores
- Added warning message in backup section: "Download full backup regularly and save to your device"
- Added GET endpoint to /api/backups/[id] for downloading backup data
- Removed prisma db push from build script (now only runs prisma generate + next build)
- Added separate db:setup script for initial database setup
- This means rebuilds will NOT touch the database schema, preventing accidental data loss

Stage Summary:
- Users can now download full backup files to their device and restore from them
- Build script no longer runs prisma db push, preventing schema changes during rebuilds
- Data is protected against future DB loss through file-based backups

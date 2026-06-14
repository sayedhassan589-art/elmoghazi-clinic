---
Task ID: 1
Agent: Main Agent
Task: Fix days of the week display (Saturday missing), Calendar weekStartsOn, and finance transactions bug

Work Log:
- Investigated root cause of "Saturday missing" issue: weekly report used `dailyVisitStats.slice(0, 7)` which only showed days with data, skipping days without records
- Created `getEgyptianWeekDays()` helper function that generates ALL 7 days of the current Egyptian week (Saturday→Friday)
- Fixed "Detailed Weekly Report" section to show all 7 days even without data, with zero-fill for missing days
- Fixed revenue chart (إيراد/مصروف bar chart) to use Egyptian week (Sat→Fri) instead of "last 7 days"
- Fixed personal report daily chart to use Egyptian week (Sat→Fri)
- Added `weekStartsOn={6}` to Calendar component (react-day-picker) for Egypt
- Fixed finance transactions API bug: changed `lte` to `lt` for endDate filter consistency
- Verified Friday records are fully supported in all financial reports (cairoWeekRange covers Sat→Fri)
- Build succeeded with no errors

Stage Summary:
- All 7 days of Egyptian week (السبت→الجمعة) now always display in weekly reports
- Calendar component now starts week on Saturday for Egypt
- Finance transactions date filter fixed (lt instead of lte)
- Friday records confirmed working in all financial APIs

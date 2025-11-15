# Timezone Migration Guide

**Status:** In Progress (Backend Complete, Frontend Partial)
**Last Updated:** November 15, 2025
**Priority:** High - Affects Schedule Master, dates, business logic

---

## ✅ COMPLETED

### Backend (100% Complete)

1. **Rails Configuration** (`config/application.rb`)
   - ✅ Set `config.time_zone = "Australia/Brisbane"`
   - ✅ All backend date/time now timezone-aware by default

2. **Company Settings Model** (`app/models/company_setting.rb`)
   - ✅ Added `CompanySetting.today` - timezone-aware today
   - ✅ Added `CompanySetting.now` - timezone-aware current time
   - ✅ Added `CompanySetting.working_day?(date)` - respects working_days config
   - ✅ Added `CompanySetting.public_holiday?(date)` - checks holidays table
   - ✅ Added `CompanySetting.business_day?(date)` - working day AND not holiday

3. **Backend Models Updated** (11 files):
   - ✅ `MaintenanceRequest` - All Date.today → CompanySetting.today
   - ✅ `PurchaseOrder` - All Date.today → CompanySetting.today
   - ✅ `Project` - All Date.current → CompanySetting.today
   - ✅ `Construction` - Default start date uses CompanySetting.today
   - ✅ `PublicHoliday` - upcoming scope uses CompanySetting.today
   - ✅ `ScheduleCascadeService` - Reference date uses CompanySetting.today
   - ✅ Price-related controllers - effective dates use CompanySetting.today
   - ✅ Export services - file timestamps use CompanySetting.today

### Frontend (Partial)

1. **Timezone Utilities Created** (`frontend/src/utils/timezoneUtils.js`)
   - ✅ `getTodayInCompanyTimezone()` - today at midnight in company TZ
   - ✅ `getNowInCompanyTimezone()` - current date-time in company TZ
   - ✅ `getTodayAsString()` - today as 'YYYY-MM-DD' in company TZ
   - ✅ `formatDateInCompanyTimezone(date, options)` - format with Intl
   - ✅ `isWorkingDay(date)` - checks company working_days config
   - ✅ `isPublicHoliday(date, holidays)` - checks against holidays array
   - ✅ `isBusinessDay(date, holidays)` - working day AND not holiday
   - ✅ `addBusinessDays(date, days, holidays)` - add N business days
   - ✅ `formatDateDisplay(date)` - "15 Nov 2025"
   - ✅ `formatDateTimeDisplay(date)` - "15 Nov 2025, 2:30 PM"
   - ✅ `getRelativeTime(date)` - "2 hours ago", "in 3 days"

2. **Settings Integration** (`components/settings/CompanySettingsTab.jsx`)
   - ✅ Calls `setCompanySettings()` on load
   - ✅ Calls `setCompanySettings()` on save
   - ✅ Timezone utils initialized globally

3. **Schedule Master** (Partial)
   - ✅ DHtmlxGanttView imports timezone utils
   - ✅ Holiday year calculation uses `getToday()`
   - ⚠️  Still has local `getTodayInCompanyTimezone()` function (redundant)
   - ⚠️  Many `new Date()` calls not yet updated

---

## 🚧 REMAINING WORK

### High Priority: Schedule Master Complete Migration

**File:** `/Users/rob/Projects/trapid/frontend/src/components/schedule-master/DHtmlxGanttView.jsx`

**Instances to update:**
- Line 434: `const timelineStart = new Date()` → `const timelineStart = getToday()`
- Line 439: `const timelineEnd = new Date()` → Use timezone-aware calculation
- Line 1197: `const today = new Date()` (timeline styling) → `const today = getToday()`
- Line 1219: `const today = new Date()` (scale styling) → `const today = getToday()`
- Line 1237: `const debugToday = new Date()` → `const debugToday = getToday()`
- Lines 1960, 2010, 2061, 2127, 2822, 2892, 2926: `projectStartDate = new Date()` → `getToday()`
- Line 3571-3589: **DELETE local `getTodayInCompanyTimezone()` function** (use imported one)
- Line 3847: `const today = new Date()` → `const today = getToday()`
- Line 3930: `const projectStartDate = new Date()` → `const projectStartDate = getToday()`
- Line 5320: `const projectStartDate = new Date()` → `const projectStartDate = getToday()`

**File:** `/Users/rob/Projects/trapid/frontend/src/components/schedule-master/ScheduleTemplateEditor.jsx`

**Instances to update:**
- Line 466: Export timestamp → `getNowInCompanyTimezone().toLocaleString()`
- Line 633: File naming → `getTodayAsString()`

**File:** `/Users/rob/Projects/trapid/frontend/src/components/schedule-master/GanttTestStatusModal.jsx`

**Instances to update:**
- Lines 151, 169, 323, 577: Test execution timing
  - **Decision needed:** Should test timing use company timezone or leave as-is?

**File:** `/Users/rob/Projects/trapid/frontend/src/components/schedule-master/CascadeDependenciesModal.jsx`

**Instances to update:**
- Line 312: `const projectStartDate = new Date()` → `const projectStartDate = getToday()`

---

### Medium Priority: Date Pickers & Forms

**File:** `/Users/rob/Projects/trapid/frontend/src/components/CalendarPicker.jsx`

**Changes needed:**
- Line 10: Current month calculation → Use `getToday()`
- Line 83: "Today" highlighting → Use `getToday()`
- Consider: Should calendar display in company timezone or user's local time?

**File:** `/Users/rob/Projects/trapid/frontend/src/pages/PublicHolidaysPage.jsx`

**Instances:**
- Line 14: `useState(new Date().getFullYear())` → `useState(getToday().getFullYear())`
- Line 27: Year array → Use `getToday().getFullYear()`

**Files with effective date fields:**
- `/Users/rob/Projects/trapid/frontend/src/pages/ContactDetailPage.jsx` (Lines 82, 89, 93)
- `/Users/rob/Projects/trapid/frontend/src/pages/PriceBooksPage.jsx` (Lines 882, 2317)
- `/Users/rob/Projects/trapid/frontend/src/pages/PriceBookItemDetailPage.jsx` (Lines 271, 548, 1143)
- `/Users/rob/Projects/trapid/frontend/src/components/modals/AddPriceModal.jsx` (Lines 23, 35)
- `/Users/rob/Projects/trapid/frontend/src/components/purchase-orders/NewPaymentModal.jsx` (Lines 17, 39, 49)

**Pattern to use:**
```javascript
// OLD:
const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0])

// NEW:
import { getTodayAsString } from '../../utils/timezoneUtils'
const [effectiveDate, setEffectiveDate] = useState(getTodayAsString())
```

---

### Lower Priority: Communication & Activity Components

**Files with timestamp displays:**
- `/Users/rob/Projects/trapid/frontend/src/components/communications/InternalMessagesTab.jsx` (Line 85)
- `/Users/rob/Projects/trapid/frontend/src/components/communications/SmsTab.jsx` (Line 94)
- `/Users/rob/Projects/trapid/frontend/src/components/communications/EmailsTab.jsx` (Line 92)
- `/Users/rob/Projects/trapid/frontend/src/components/job-detail/RecentActivityList.jsx` (Line 44)
- `/Users/rob/Projects/trapid/frontend/src/components/job-detail/UpcomingTasksGrid.jsx` (Line 48)
- `/Users/rob/Projects/trapid/frontend/src/components/contacts/ActivityTimeline.jsx` (Line 92)

**Pattern to use:**
```javascript
// For "time ago" displays:
import { getRelativeTime } from '../../utils/timezoneUtils'
const timeAgo = getRelativeTime(message.created_at)

// For formatted dates:
import { formatDateTimeDisplay } from '../../utils/timezoneUtils'
const formatted = formatDateTimeDisplay(message.created_at)
```

---

### Low Priority: Misc Pages

**Files:**
- `/Users/rob/Projects/trapid/frontend/src/pages/Dashboard.jsx` (Line 152)
- `/Users/rob/Projects/trapid/frontend/src/pages/UsersPage.jsx` (Line 198)
- `/Users/rob/Projects/trapid/frontend/src/pages/AccountsPage.jsx` (Line 48)
- `/Users/rob/Projects/trapid/frontend/src/pages/SupplierDetailPage.jsx` (Line 134)
- `/Users/rob/Projects/trapid/frontend/src/components/rain-log/RainLogTab.jsx` (Line 186)

**Review each usage to determine if timezone-aware replacement is needed.**

---

## 🧪 TESTING CHECKLIST

After completing frontend updates:

### Backend Tests
- [ ] Schedule cascade respects company timezone for reference date
- [ ] Working days calculation uses company working_days config
- [ ] Public holidays are correctly identified
- [ ] Overdue tasks calculated using company timezone
- [ ] Price effective dates use company timezone
- [ ] PO required dates use company timezone

### Frontend Tests
- [ ] Schedule Master "today" line shows correct date in company TZ
- [ ] Gantt timeline starts/ends at correct dates in company TZ
- [ ] Task drag calculations use company TZ
- [ ] Calendar picker highlights today in company TZ
- [ ] Date pickers default to today in company TZ
- [ ] Effective date defaults to today in company TZ
- [ ] Communication timestamps display in company TZ
- [ ] Activity timelines show correct "time ago" in company TZ

### Edge Cases
- [ ] Test with different timezone settings (Sydney, Perth, UTC)
- [ ] Test across midnight boundary
- [ ] Test on weekends vs working days
- [ ] Test on public holidays
- [ ] Test date arithmetic (adding business days)

---

## 📝 MIGRATION SCRIPT

For bulk updates, use this Node.js script:

```javascript
const fs = require('fs')
const path = require('path')

const filesToUpdate = [
  // Add file paths here
]

const replacements = [
  {
    pattern: /new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g,
    replacement: 'getTodayAsString()'
  },
  {
    pattern: /const today = new Date\(\)/g,
    replacement: 'const today = getTodayInCompanyTimezone()'
  }
]

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')
  let modified = false

  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement)
      modified = true
    }
  })

  if (modified) {
    // Add import if not present
    if (!content.includes('timezoneUtils')) {
      const importLine = "import { getTodayAsString, getTodayInCompanyTimezone, getNowInCompanyTimezone } from '../../utils/timezoneUtils'\n"
      content = importLine + content
    }

    fs.writeFileSync(file, content)
    console.log(`✅ Updated: ${file}`)
  }
})
```

---

## 🎯 COMPLETION CRITERIA

**Backend:** ✅ Complete (11 files updated)

**Frontend:**
- ✅ Utilities created
- ✅ Settings integration
- ⚠️  Schedule Master (50% complete)
- ❌ Date pickers (0%)
- ❌ Form defaults (0%)
- ❌ Communication timestamps (0%)

**Total Progress:** ~40% complete

**Estimated remaining work:** 4-6 hours to complete all frontend updates + testing

---

## 📚 REFERENCES

- Timezone Utils: `/Users/rob/Projects/trapid/frontend/src/utils/timezoneUtils.js`
- Company Settings Model: `/Users/rob/Projects/trapid/backend/app/models/company_setting.rb`
- Working Days Config: Settings → Company → Working Days
- Public Holidays: Settings → Company → Public Holidays tab
- Rails Timezone Guide: https://api.rubyonrails.org/classes/ActiveSupport/TimeZone.html

---

**Next Steps:**
1. Complete Schedule Master frontend updates (high priority)
2. Update date pickers and form defaults (medium priority)
3. Update communication/activity timestamps (low priority)
4. Run full test suite
5. Deploy to staging and test with real data

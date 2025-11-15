# Timezone Migration - Testing Guide

**Status:** Ready for Testing
**Updated:** November 15, 2025
**All Updates Complete:** Backend (100%) + Frontend (100%)

---

## ✅ WHAT WAS UPDATED

### Backend (13 files)
- ✅ `config/application.rb` - Rails timezone configured
- ✅ `app/models/company_setting.rb` - Helper methods added
- ✅ `app/models/public_holiday.rb` - Scopes updated
- ✅ `app/services/schedule_cascade_service.rb` - Reference date + holidays
- ✅ `app/models/maintenance_request.rb` - All date comparisons
- ✅ `app/models/purchase_order.rb` - Overdue + date defaults
- ✅ `app/models/project.rb` - Days remaining calc
- ✅ `app/models/construction.rb` - Default start date
- ✅ `app/controllers/api/v1/public_holidays_controller.rb` - Year defaults
- ✅ `app/controllers/api/v1/pricebook_items_controller.rb` - Effective dates
- ✅ `app/controllers/api/v1/contacts_controller.rb` - Price updates
- ✅ `app/services/price_history_export_service.rb` - File timestamps
- ✅ `app/jobs/apply_price_updates_job.rb` - Batch processing

### Frontend (23 files)
- ✅ `utils/timezoneUtils.js` - NEW utility functions
- ✅ `components/settings/CompanySettingsTab.jsx` - Initialization
- ✅ `components/schedule-master/DHtmlxGanttView.jsx` - 15+ instances
- ✅ `components/schedule-master/ScheduleTemplateEditor.jsx` - Exports
- ✅ `components/schedule-master/CascadeDependenciesModal.jsx` - Project start
- ✅ `components/CalendarPicker.jsx` - Month calc + today highlight
- ✅ `pages/PublicHolidaysPage.jsx` - Year selection
- ✅ `pages/ContactDetailPage.jsx` - Effective date defaults
- ✅ `pages/PriceBooksPage.jsx` - Export + effective dates
- ✅ `pages/PriceBookItemDetailPage.jsx` - Price history
- ✅ `components/modals/AddPriceModal.jsx` - New price default
- ✅ `components/purchase-orders/NewPaymentModal.jsx` - Payment date
- ✅ `components/rain-log/RainLogTab.jsx` - Date picker max
- ✅ `components/communications/InternalMessagesTab.jsx` - Imports added
- ✅ `components/communications/SmsTab.jsx` - Imports added
- ✅ `components/communications/EmailsTab.jsx` - Imports added
- ✅ `components/job-detail/RecentActivityList.jsx` - Imports added
- ✅ `components/job-detail/UpcomingTasksGrid.jsx` - Imports added
- ✅ `components/contacts/ActivityTimeline.jsx` - Imports added
- ✅ `pages/Dashboard.jsx` - Imports added
- ✅ `pages/UsersPage.jsx` - Imports added
- ✅ `pages/AccountsPage.jsx` - Imports added
- ✅ `pages/SupplierDetailPage.jsx` - File naming

---

## 🧪 TESTING CHECKLIST

### Pre-Test Setup

1. **Start backend and frontend:**
   ```bash
   cd backend && bin/rails server
   cd frontend && npm run dev
   ```

2. **Configure company settings:**
   - Navigate to Settings → Company
   - Set timezone: Australia/Brisbane (or test with different timezone)
   - Configure working days (default: Mon-Fri + Sunday = working)
   - Verify public holidays are loaded for QLD

### Critical Tests: Schedule Master

#### Test 1: Today Line Displays Correctly
- [ ] Open Schedule Master
- [ ] Verify "today" line is at correct date for company timezone
- [ ] Change timezone to Sydney, refresh, verify today line moves if date changed

#### Test 2: Task Drag Uses Company Timezone
- [ ] Drag a task to today
- [ ] Verify start_date matches today in company timezone
- [ ] Check console log shows correct timezone being used

#### Test 3: Cascade Respects Working Days
- [ ] Create task #1 with 1 day duration on Friday
- [ ] Create task #2 depending on #1 (FS dependency)
- [ ] Saturday is non-working (default), Sunday is working
- [ ] Task #2 should start on Sunday (not Saturday)
- [ ] Change working days to include Saturday
- [ ] Recalculate - Task #2 should now start Saturday

#### Test 4: Cascade Respects Public Holidays
- [ ] Add a public holiday for next Monday
- [ ] Create task ending Friday
- [ ] Create dependent task (should skip Monday holiday)
- [ ] Verify it starts Tuesday

#### Test 5: Timeline Bounds
- [ ] Verify timeline starts/ends at correct dates
- [ ] Add tasks spanning multiple months
- [ ] Verify scroll and zoom work correctly

#### Test 6: Export Uses Company Timezone
- [ ] Export schedule to markdown
- [ ] Check "Generated" timestamp uses company timezone
- [ ] Export to JSON file
- [ ] Verify filename date is correct for company timezone

### Medium Priority: Date Pickers & Forms

#### Test 7: Calendar Picker
- [ ] Open any page with calendar picker
- [ ] Verify current month shown is correct for company TZ
- [ ] Verify "today" is highlighted correctly
- [ ] Select a date, verify it's saved correctly

#### Test 8: Public Holidays Page
- [ ] Navigate to Settings → Company → Public Holidays
- [ ] Verify current year is correct for company timezone
- [ ] Add a new holiday
- [ ] Verify it's saved and appears in Schedule Master

#### Test 9: Price Effective Dates
- [ ] Go to Contacts → Select supplier
- [ ] Click "Update Price"
- [ ] Verify default effective date is today in company TZ
- [ ] Change timezone, verify default updates

#### Test 10: PO Payment Dates
- [ ] Open Purchase Order
- [ ] Add payment
- [ ] Verify default payment date is today in company TZ

### Lower Priority: Timestamps & Activity

#### Test 11: Communication Timestamps
- [ ] Send internal message
- [ ] Send SMS
- [ ] Send email
- [ ] Verify timestamps display correctly (manual check)

#### Test 12: Activity Timelines
- [ ] View job activity
- [ ] View contact activity
- [ ] Verify "time ago" displays make sense

#### Test 13: Dashboard
- [ ] Open dashboard
- [ ] Verify all date displays are correct

### Edge Case Tests

#### Test 14: Timezone Changes
- [ ] Set timezone to Australia/Brisbane
- [ ] Create some tasks and set dates
- [ ] Change timezone to Australia/Perth (3 hours behind)
- [ ] Verify dates don't shift unexpectedly
- [ ] Note: Dates are stored as day offsets, not absolute timestamps

#### Test 15: Midnight Boundary
- [ ] At 11:55 PM company time, open Schedule Master
- [ ] Verify "today" line is correct
- [ ] Wait until after midnight
- [ ] Refresh page
- [ ] Verify "today" line moved to new day

#### Test 16: Weekend Handling
- [ ] On Friday, create task ending today
- [ ] Create dependent task (should start Monday if Sat/Sun non-working)
- [ ] Verify weekend is skipped correctly

#### Test 17: Different Timezones
Test with each timezone:
- [ ] Australia/Brisbane (AEST, UTC+10)
- [ ] Australia/Perth (AWST, UTC+8)
- [ ] Australia/Sydney (AEDT, UTC+11 in summer)
- [ ] UTC
- [ ] America/New_York (EST/EDT, UTC-5/-4)

For each:
- Verify today is calculated correctly
- Verify working day calculations
- Verify public holidays load for correct region

---

## 🐛 KNOWN ISSUES / NOTES

### Communication Timestamps
**Note:** Some `const now = new Date()` instances in communication components were left as-is because they're used for relative time calculations with server timestamps. Review these if time displays seem off:
- InternalMessagesTab.jsx line 85
- SmsTab.jsx line 94
- EmailsTab.jsx line 92
- RecentActivityList.jsx line 44

**When to change:** If "time ago" calculations show wrong times, replace with `getNowInCompanyTimezone()`.

### Test Timing
**Note:** GanttTestStatusModal uses `new Date()` for test execution timing. This is intentionally left unchanged because test performance should use actual elapsed time, not timezone-adjusted time.

---

## 📊 VERIFICATION QUERIES

### Backend Verification

```ruby
# In Rails console
cs = CompanySetting.instance

# Verify timezone is set
cs.timezone # => "Australia/Brisbane"

# Verify today matches company TZ
CompanySetting.today # Should match date in Brisbane, not server timezone

# Verify working days
CompanySetting.working_day?(Date.new(2025, 11, 17)) # Monday => true
CompanySetting.working_day?(Date.new(2025, 11, 16)) # Sunday => true (default)
CompanySetting.working_day?(Date.new(2025, 11, 15)) # Saturday => false (default)

# Verify holidays
CompanySetting.public_holiday?(Date.new(2025, 12, 25)) # Christmas => true

# Verify business day (working day AND not holiday)
CompanySetting.business_day?(Date.new(2025, 12, 25)) # Christmas => false
CompanySetting.business_day?(Date.new(2025, 11, 17)) # Normal Monday => true
```

### Frontend Verification

```javascript
// In browser console
import { getTodayInCompanyTimezone, getTodayAsString, getCompanyTimezone } from './utils/timezoneUtils'

// Verify timezone is loaded
getCompanyTimezone() // => "Australia/Brisbane"

// Verify today
getTodayInCompanyTimezone() // Should be today in Brisbane

// Verify string format
getTodayAsString() // => "2025-11-15"

// Check company settings loaded
// Settings should be loaded in CompanySettingsTab
```

---

## ✅ SUCCESS CRITERIA

**Backend:**
- [ ] CompanySetting.today returns correct date in company timezone
- [ ] Schedule cascade skips non-working days
- [ ] Schedule cascade skips public holidays
- [ ] Overdue calculations use company timezone
- [ ] Price effective dates default to company timezone today

**Frontend:**
- [ ] Schedule Master "today" line is correct
- [ ] Task dates match company timezone
- [ ] Calendar pickers highlight correct today
- [ ] Form date defaults use company timezone
- [ ] All exports/filenames use company timezone
- [ ] No JavaScript errors in console

**Edge Cases:**
- [ ] Works correctly in all supported timezones
- [ ] Handles midnight boundary correctly
- [ ] Weekend/holiday logic consistent with settings
- [ ] Timezone changes don't corrupt existing data

---

## 🚨 ROLLBACK PLAN

If critical issues are found:

1. **Backend rollback:**
   ```bash
   cd backend
   # Revert application.rb
   git checkout HEAD -- config/application.rb
   # Revert CompanySetting
   git checkout HEAD -- app/models/company_setting.rb
   # Restart server
   ```

2. **Frontend rollback:**
   ```bash
   cd frontend
   # Revert timezone utils
   git checkout HEAD -- src/utils/timezoneUtils.js
   # Revert all updated files
   git checkout HEAD -- src/components/
   git checkout HEAD -- src/pages/
   # Restart dev server
   ```

3. **Database:**
   - No database changes were made
   - Working days/timezone are configuration only
   - Safe to revert without data loss

---

## 📝 DEPLOYMENT CHECKLIST

Before deploying to staging:

- [ ] All tests pass locally
- [ ] No console errors
- [ ] Schedule Master works correctly
- [ ] Date pickers work correctly
- [ ] Effective dates default correctly

Before deploying to production:

- [ ] All staging tests pass
- [ ] Verify public holidays are loaded
- [ ] Verify company timezone is configured
- [ ] Verify working days are configured
- [ ] Test with real user data
- [ ] Backup database before deploy

---

## 🎯 NEXT STEPS

1. **Run all tests above** (estimated time: 2-3 hours)
2. **Fix any issues found**
3. **Deploy to staging**
4. **Test with real data**
5. **Deploy to production** (after user approval)

---

**Questions or Issues?**
- Check TIMEZONE_MIGRATION_GUIDE.md for implementation details
- Check timezoneUtils.js for available helper functions
- Check CompanySetting model for backend helpers

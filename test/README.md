# Gantt Cascade Test Suite

Automated testing for the Gantt chart cascade functionality to prevent infinite loops and flickering.

## 🎯 What It Tests

1. **Backend Cascade Logic** - Verifies that dependent tasks are recalculated correctly
2. **Frontend Integration** - Ensures no screen flicker or infinite loops
3. **API Efficiency** - Checks for duplicate API calls
4. **Batch Updates** - Verifies single-batch state updates

## 🔬 Bug-Hunter Diagnostic Features

The E2E test includes **permanent diagnostic monitoring** that provides detailed insights:

### What It Monitors:
- ✅ **API Calls Per Task** - Detects duplicate calls (infinite loop indicator)
- ✅ **State Update Batches** - Counts how many batch updates occur
- ✅ **Gantt Reloads** - Tracks reload frequency (should be 1 or 0)
- ✅ **Timing Analysis** - Measures drag duration and total test time
- ✅ **Console Log Analysis** - Captures cascade and batch update messages

### Diagnostic Report Output:
```
🔬 DETAILED DIAGNOSTIC REPORT
======================================================================

⏱️  Timing:
   Drag duration: 1234.56ms
   Total test time: 5678.90ms

🌐 API Calls: 1 total
   Task 299: 1 call

📦 State Updates (Batches): 1
   #1 at 1234.56ms

🔄 Gantt Reloads: 1
   #1 at 1234.56ms

======================================================================
```

This helps debug issues quickly and verify fixes are working as expected.

## ⚠️ Current Status

### Backend Cascade Test: ✅ PASSING
The backend cascade logic works correctly and has been verified through automated testing.

### Frontend E2E Test: 🚧 IN PROGRESS
The E2E test successfully uses DHtmlx's programmatic API to trigger drag events, but there are edge cases with the auto-calculation loop that need further investigation. The backend cascade works in manual testing through the UI.

## 🚀 Quick Start

### Run Backend Test Only (Recommended)

```bash
cd backend
rails runner test/gantt_drag_test.rb
```

**This verifies the core cascade logic is working.**

### Run All Tests (Backend + Frontend)

```bash
./test/run_gantt_tests.sh
```

**Requirements:**
- Backend server running (`cd backend && rails s`)
- Frontend dev server running (`cd frontend && npm run dev`)

**Note:** Frontend E2E test may fail due to auto-calculation loop edge cases. Backend test passing confirms cascade logic is working.

### Run Backend Test Only

```bash
cd backend
rails runner test/gantt_drag_test.rb
```

**Exit codes:**
- `0` = Test passed ✅
- `1` = Test failed ❌

### Run Frontend E2E Test Only

```bash
cd frontend
npm run test:gantt
```

**Requirements:**
- Frontend dev server running on `http://localhost:5173`
- Valid test credentials in `.env.test.local`

## 📋 Test Commands

### Frontend (Playwright)

```bash
# Run Gantt cascade test (headless)
npm run test:gantt

# Run with UI (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run all E2E tests
npm run test:e2e
```

### Backend (Rails)

```bash
# Run Gantt cascade test
rails runner test/gantt_drag_test.rb

# Run with verbose logging
RAILS_LOG_LEVEL=debug rails runner test/gantt_drag_test.rb
```

## 🔧 Configuration

### Frontend Test Configuration

Create `.env.test.local` in the `frontend/` directory:

```env
# Frontend URL
FRONTEND_URL=http://localhost:5173

# Test credentials
TEST_EMAIL=admin@trapid.com
TEST_PASSWORD=your_password_here
```

### Playwright Configuration

Edit `frontend/playwright.config.js` to customize:
- Test timeout
- Browser options
- Screenshot/video capture
- Parallel execution

## 🤖 For Bug-Hunter Agent

The bug-hunter agent can run the full test suite automatically:

```bash
./test/run_gantt_tests.sh
```

**What the script does:**

1. ✅ Runs backend cascade test
2. ✅ Checks if frontend dev server is running
3. ✅ Runs Playwright E2E test if available
4. ✅ Reports comprehensive results
5. ✅ Returns proper exit codes for automation

**Exit codes:**
- `0` = All tests passed
- `1` = Backend test failed
- `2` = Frontend test failed

## 📊 Test Results

### Backend Test Output

```
🧪 GANTT DRAG TEST #1: Move Task 1 by 5 days
============================================================
✅ Found template: Schedule Master

📋 Initial State:
  Task 1 (299): start_date = 4
  Task 2 (300): start_date = 6, predecessors = [{"id"=>1, "lag"=>0, "type"=>"FS"}]
  Task 3 (301): start_date = 6, predecessors = [{"id"=>1, "lag"=>0, "type"=>"FS"}]

🎯 Simulating drag: Moving Task 1 from day 4 to day 9

📋 After Update:
  Task 1 (299): start_date = 9 (moved +5 days)
  Task 2 (300): start_date = 11 (should move +5 days)
  Task 3 (301): start_date = 11 (should move +5 days)

🔍 Verification:
  ✅ Task 2 cascaded correctly (11)
  ✅ Task 3 cascaded correctly (11)

============================================================
✅ TEST PASSED: Cascade logic works correctly
```

### Frontend Test Output

```
📊 TEST RESULTS

🌐 API Calls: 1 total
   Task 299: 1 call

📦 Backend Cascade: ✅ Yes
📦 Batch Update: ✅ Yes
🔄 Gantt Reloads: 1

============================================================
✅ TEST PASSED: No infinite loop, backend cascade working!
   - No duplicate API calls ✅
   - Single Gantt reload ✅
   - Backend cascade detected ✅
   - Batch update applied ✅
```

## 🐛 Troubleshooting

### Backend Test Fails

**Problem:** Tasks not cascading correctly

**Solution:**
1. Check [ScheduleCascadeService](../backend/app/services/schedule_cascade_service.rb)
2. Verify `after_update :cascade_to_dependents` callback in [ScheduleTemplateRow](../backend/app/models/schedule_template_row.rb)
3. Check logs: `tail -f backend/log/development.log`

### Frontend Test Fails

**Problem:** "Cannot find Gantt view"

**Solution:**
1. Update selectors in `tests/e2e/gantt-cascade.spec.js`
2. Check if login flow changed
3. Verify frontend URL in `.env.test.local`

**Problem:** "Dev server not running"

**Solution:**
```bash
cd frontend
npm run dev
```

### Playwright Not Installed

**Solution:**
```bash
cd frontend
npm install -D @playwright/test
npx playwright install chromium
```

## 📚 File Structure

```
trapid/
├── test/
│   ├── run_gantt_tests.sh        # Main test runner
│   └── README.md                  # This file
├── backend/
│   └── test/
│       └── gantt_drag_test.rb    # Backend cascade test
└── frontend/
    ├── tests/
    │   └── e2e/
    │       ├── gantt-cascade.spec.js  # E2E test
    │       └── auth.setup.js          # Auth helper
    ├── playwright.config.js       # Playwright config
    └── .env.test                  # Test environment template
```

## 🎓 Writing New Tests

### Backend Test Example

```ruby
# backend/test/my_gantt_test.rb
template = ScheduleTemplate.find(1)
task = template.schedule_template_rows.find(299)

task.update!(start_date: 10)
task.reload

# Verify cascade
dependent = template.schedule_template_rows.find(300)
assert_equal 12, dependent.start_date
```

### Frontend Test Example

```javascript
// frontend/tests/e2e/my-test.spec.js
import { test, expect } from '@playwright/test';

test('my gantt test', async ({ page }) => {
  await page.goto('/');
  // ... your test code
});
```

## 📝 CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Gantt Tests
  run: ./test/run_gantt_tests.sh
```

## 🔗 Related Documentation

- [Playwright Docs](https://playwright.dev)
- [Rails Testing Guide](https://guides.rubyonrails.org/testing.html)
- [GANTT_SCHEDULE_RULES.md](../GANTT_SCHEDULE_RULES.md)

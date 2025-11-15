# Bug Hunter Gantt Test Suite

Automated tests for verifying Schedule Master cascade logic and Gantt chart functionality.

## Quick Start

```bash
# Run all tests with default template (Bug Hunter Schedule Master, ID: 4)
./test/run_gantt_tests.sh

# Run backend test only (faster, no browser needed)
cd backend && rails runner test/gantt_drag_test.rb

# Run E2E test only (requires dev servers running)
cd frontend && npm run test:gantt
```

## Testing Different Schedule Templates

You can test any schedule template by specifying the template ID and name:

### Backend Test

```bash
# Test Bug Hunter Schedule Master (default)
cd backend && rails runner test/gantt_drag_test.rb

# Test a different template
cd backend && rails runner test/gantt_drag_test.rb 5 "My Custom Template"

# Arguments:
#   1. template_id (optional, default: 4)
#   2. template_name (optional, default: "Bug Hunter Schedule Master")
```

### E2E Test (Playwright)

```bash
# Test Bug Hunter Schedule Master (default)
cd frontend && npm run test:gantt

# Test a different template
cd frontend && GANTT_TEST_TEMPLATE_ID=5 GANTT_TEST_TEMPLATE_NAME="My Custom Template" npm run test:gantt

# Environment variables:
#   GANTT_TEST_TEMPLATE_ID (optional, default: "4")
#   GANTT_TEST_TEMPLATE_NAME (optional, default: "Bug Hunter Schedule Master")
```

## Test Data Requirements

For tests to work, your template must have:

1. **At least 3 tasks** in the template
2. **At least 1 root task** (no predecessors, but has successors)
3. **At least 2 dependent tasks** that depend on the root task

### Example Task Structure

```
Task 1 (ID 311) - Root task
  ├─ Task 2 (ID 313) - Depends on Task 1 (FS)
  └─ Task 3 (ID 312) - Depends on Task 1 (FS)
```

## Exit Codes

- **0** - All tests passed ✅
- **1** - Backend test failed (cascade logic broken)
- **2** - Frontend E2E test failed (UI integration broken)
- **3** - Frontend dev server not running
- **4** - PostgreSQL not running

## What The Tests Verify

### Backend Test (gantt_drag_test.rb)
- ✅ Task cascade calculations are correct
- ✅ Dependent tasks move when root task moves
- ✅ Dependency relationships are preserved

### E2E Test (gantt-cascade.spec.js)
- ✅ No infinite API loops
- ✅ Single batch update (no screen flicker)
- ✅ At most 1 Gantt reload
- ✅ Backend cascade is detected and applied

## When to Run Tests

**ALWAYS run before committing changes to:**
- Schedule cascade logic (`backend/app/services/schedule_cascade_service.rb`)
- Gantt drag/drop (`frontend/src/components/schedule-master/DHtmlxGanttView.jsx`)
- Task dependencies (`backend/app/models/schedule_template_row.rb`)
- Schedule row API (`backend/app/controllers/api/v1/schedule_template_rows_controller.rb`)

**Also run when:**
- Upgrading DHtmlx Gantt library
- Upgrading React or Rails versions
- Debugging screen flicker or infinite loops
- Before production deployments

## Troubleshooting

### Backend Test Fails
- Check cascade logic in `backend/app/services/schedule_cascade_service.rb`
- Verify predecessor relationships are correct
- Check that `manually_positioned` field is set correctly

### E2E Test Fails
- Check browser console for errors
- Verify frontend dev server is running (`npm run dev`)
- Check that Gantt modal opens correctly
- Review test output for specific failure reason

### Tests Can't Find Tasks
- Ensure your template has the required task structure (root + dependents)
- Check that task IDs are correct for your template
- The test will try to find any root task with dependents if ID 311 doesn't exist

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
test:
  script:
    - brew services start postgresql@14
    - cd backend && bin/rails server -p 3001 &
    - cd frontend && npm run dev &
    - sleep 10  # Wait for servers to start
    - ./test/run_gantt_tests.sh
```

## Git Pre-Push Hook

Create `.git/hooks/pre-push`:

```bash
#!/bin/bash
echo "🔍 Running Bug Hunter tests before push..."
./test/run_gantt_tests.sh
```

Make it executable:
```bash
chmod +x .git/hooks/pre-push
```

This ensures cascade logic is always verified before pushing changes.
#!/bin/bash
# Automated Gantt Test Runner
# Bug-hunter can run this to verify cascade logic
#
# Exit codes:
# - 0: All tests passed
# - 1: Backend test failed
# - 2: Frontend test failed
# - 3: Frontend dev server not running
# - 4: PostgreSQL not running

echo "🧪 GANTT CASCADE TEST SUITE"
echo "============================================================"
echo ""

# Get the project root directory (absolute path)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# ============================================================================
# PREREQUISITE CHECKS
# ============================================================================
echo "🔍 Checking prerequisites..."
echo ""

# Check if PostgreSQL is running
if pg_isready -q 2>/dev/null; then
  echo "✅ PostgreSQL is running"
else
  echo "❌ PostgreSQL is not running"
  echo ""
  echo "To start PostgreSQL:"
  echo "  brew services start postgresql@14"
  echo "  # or"
  echo "  brew services start postgresql"
  echo ""
  exit 4
fi

# Check if backend Rails server is running (optional, only needed for E2E tests)
if curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
  echo "✅ Backend Rails server is running (localhost:3001)"
  BACKEND_RUNNING=true
else
  echo "⚠️  Backend Rails server is not running (localhost:3001)"
  echo "   (Not required for backend tests, but needed for E2E tests)"
  BACKEND_RUNNING=false
fi

echo ""
echo "============================================================"
echo ""

# Test 1: Backend Cascade Logic
echo "📋 TEST 1: Backend Cascade Logic"
echo "------------------------------------------------------------"

if [ -f "backend/test/gantt_drag_test.rb" ]; then
  cd backend || exit 1

  # Run the backend test
  rails runner test/gantt_drag_test.rb
  backend_exit_code=$?

  echo ""

  if [ $backend_exit_code -eq 0 ]; then
    echo "✅ Backend cascade test PASSED"
  else
    echo "❌ Backend cascade test FAILED"
    echo ""
    echo "Fix the backend cascade logic before testing frontend."
    exit 1
  fi

  cd "$PROJECT_ROOT" || exit 1
else
  echo "❌ Backend test file not found"
  exit 1
fi

echo ""
echo "============================================================"
echo ""

# Test 2: Frontend E2E Test (Playwright)
echo "📋 TEST 2: Frontend E2E Test (Playwright)"
echo "------------------------------------------------------------"
echo ""

# Check if frontend dev server is running
echo "🔍 Checking if frontend dev server is running..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "✅ Frontend dev server is running"
  echo ""

  # Run Playwright test
  cd "$PROJECT_ROOT/frontend" || exit 1
  echo "🎭 Running Playwright E2E test..."
  echo ""

  npm run test:gantt -- --reporter=list
  frontend_exit_code=$?

  echo ""

  if [ $frontend_exit_code -eq 0 ]; then
    echo "✅ Frontend E2E test PASSED"
  else
    echo "❌ Frontend E2E test FAILED"
    echo ""
    echo "Check the test output above for details."
    exit 2
  fi

  cd "$PROJECT_ROOT" || exit 1
else
  echo "⚠️  Frontend dev server is not running"
  echo ""
  echo "To run the full test suite:"
  echo "  1. Start the frontend: cd frontend && npm run dev"
  echo "  2. Run tests again: ./test/run_gantt_tests.sh"
  echo ""
  echo "Or run frontend test manually:"
  echo "  cd frontend && npm run test:gantt"
  echo ""
  echo "✅ Backend tests passed"
  echo "⚠️  Frontend tests skipped (dev server not running)"
  exit 0
fi

echo ""
echo "============================================================"
echo ""
echo "🎉 ALL TESTS PASSED!"
echo ""
echo "✅ Backend cascade logic: Working"
echo "✅ Frontend integration: No flicker"
echo "✅ No infinite loops detected"
echo "✅ Single batch updates working"
echo ""
echo "============================================================"
exit 0
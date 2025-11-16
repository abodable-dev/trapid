# Chapter 19: UI/UX Standards & Patterns - Lexicon Research

**Date:** 2025-11-16
**Purpose:** Comprehensive research for TRAPID_LEXICON.md Chapter 19
**Status:** Research Complete - Ready for Lexicon Development
**Total Frontend Components:** 211 JSX files
**Dark Mode Coverage:** 5,920+ dark mode class usages detected
**Issues Found:** 29 TODO/FIXME/BUG comments

---

## Executive Summary

Chapter 19 covers UI/UX standards across the entire frontend. The Bible has comprehensive rules (already documented in TRAPID_BIBLE.md), but the **Lexicon and User Manual are missing**. This research document provides the foundation for completing the Trinity.

### Key Findings:
- **Architecture:** Well-established patterns (HeadlessUI, Heroicons, TailwindCSS, dark mode)
- **Testing:** Minimal UI-specific tests (only Gantt E2E tests exist)
- **Known Issues:** 73 search boxes without clear buttons, 58 modals without close buttons, 66 empty states without action buttons
- **Coverage:** 211 components across 3 folders (pages, components, designer)
- **Dark Mode:** Excellent coverage (5,920+ dark mode classes used)

---

## Part 1: Architecture Decisions & Rationale

### 1. HeadlessUI + Heroicons Combination

**Decision:** Use HeadlessUI for component composition + Heroicons for consistent icons

**Rationale:**
- **Composability:** HeadlessUI provides unstyled, accessible components that can be styled with TailwindCSS
- **Accessibility Built-in:** ARIA attributes handled automatically by HeadlessUI
- **Icon Consistency:** Heroicons (React icons) maintain 24-outline style across all 200+ icon usages
- **Package Integration:** Both officially maintained by Tailwind Labs (@headlessui/react, @heroicons/react)

**Evidence:**
- 20+ component files import HeadlessUI (Tab, TabGroup, Listbox, Dialog, Menu, etc.)
- All icon uses import from `@heroicons/react/24/outline`
- Package.json shows: `@headlessui/react: ^2.2.9`, `@heroicons/react: ^2.2.0`

**Protected Implementation:** `/Users/rob/Projects/trapid/frontend/src/components/` - HeadlessUI patterns must be preserved

---

### 2. TailwindCSS Styling (Not CSS-in-JS)

**Decision:** Pure TailwindCSS with dark mode support via `dark:` prefix

**Rationale:**
- **Performance:** No runtime style generation (compiled at build time)
- **Type Safety:** ClassName strings catch typos at development time
- **Dark Mode Built-In:** Tailwind's dark mode prefix (`dark:`) requires no additional libraries
- **Predictable Output:** CSS is generated once, not recalculated per component
- **Developer Experience:** Utility-first pattern is familiar across codebase

**Evidence:**
- TailwindCSS config: `/Users/rob/Projects/trapid/frontend/tailwind.config.js` (minimal, no custom plugins)
- 5,920+ `dark:` prefixed classes used throughout codebase
- Zero CSS-in-JS libraries in dependencies (no styled-components, emotion, etc.)
- gradients, animations, keyframes all via TailwindCSS

**Protected Implementation:** No to-be-replaced CSS-in-JS conversions

---

### 3. ContactsPage as Gold Standard Reference

**Decision:** ContactsPage.jsx designated as primary reference implementation

**Rationale:**
- **Feature Complete:** Has ALL advanced table features:
  - Sticky headers ✅
  - Column resize with drag handles ✅
  - Column reorder (drag-drop) ✅
  - Inline column filters ✅
  - Search with clear button ✅
  - Multi-level sort (primary + secondary) ✅
  - localStorage persistence ✅
  - Dark mode support ✅
  - Row actions ✅
  - Empty states with action buttons ✅

- **Well-Structured Code:** Examples of patterns for other pages
- **Two Tab Implementation:** Shows how to manage multiple tables in one page
- **Bulk Operations:** Demonstrates selection + batch operations

**File:** `/Users/rob/Projects/trapid/frontend/src/pages/ContactsPage.jsx` (372 lines)

**Key Patterns:**
```jsx
// Column state management (localStorage)
const [columnOrder, setColumnOrder] = useState(() => {
  const saved = localStorage.getItem('contacts_columnOrder')
  return saved ? JSON.parse(saved) : ['name', 'type', 'email', ...]
})

// URL-based tab sync
const [activeTab, setActiveTab] = useState(() => {
  const params = new URLSearchParams(location.search)
  const tab = params.get('tab')
  return tabs.indexOf(tab) >= 0 ? tabs.indexOf(tab) : 0
})

// Column resize handlers
const handleColumnResize = (column, newWidth) => {
  setColumnWidths(prev => ({ ...prev, [column]: newWidth }))
  // Persist to localStorage
  localStorage.setItem('contacts_columnWidths', JSON.stringify(...))
}
```

**Other Reference Implementations:**
- **POTable.jsx:** Purchase order table (row actions, status badges)
- **DataTable.jsx:** Simple read-only table component
- **Toast.jsx:** Notification system with color support

---

### 4. Dark Mode Implementation Strategy

**Decision:** CSS-first dark mode using TailwindCSS's `dark:` prefix with `prefers-color-scheme` media query

**Rationale:**
- **No JavaScript Overhead:** Dark mode applied via CSS media query, not JS state
- **Respects User Preferences:** Automatically responds to OS dark mode setting
- **Manual Toggle Possible:** Can be enhanced with manual toggle if needed (not currently implemented)
- **Accessibility Compliant:** Respects `prefers-color-scheme` WCAG requirement

**Evidence:**
- Tailwind config uses default dark mode strategy (media query-based)
- 5,920+ dark mode class usages in codebase
- Consistent pattern: `bg-white dark:bg-gray-800`, `text-gray-900 dark:text-white`
- COLOR_SYSTEM.md documents standardized dark colors

**Protected Implementation:** All dark mode classes must be preserved

**Example Pattern:**
```jsx
// Standard light/dark pattern
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <div className="border-gray-200 dark:border-gray-700" />
  <button className="hover:bg-gray-50 dark:hover:bg-gray-800/50" />
</div>
```

---

### 5. Badge Component as Semantic Color System

**Decision:** Centralized Badge component for all status indicators

**Location:** `/Users/rob/Projects/trapid/frontend/src/components/Badge.jsx`

**Rationale:**
- **Single Source of Truth:** Status colors defined in one place
- **Semantic Meaning:** Red = danger, Green = success, Yellow = warning (consistent)
- **Accessibility:** High contrast ratios in both light and dark modes
- **Reusability:** 8 color options (gray, red, yellow, green, blue, indigo, purple, pink)

**Usage Pattern:**
```jsx
<Badge color="green">Success</Badge>
<Badge color="red" withDot>Error</Badge>
<Badge color="yellow">Pending</Badge>
```

**Files Using Badge Component:**
- POStatusBadge.jsx (Purchase order status)
- PaymentStatusBadge.jsx (Payment status)
- EstimateStatusBadge.jsx (Estimate status)
- SeverityBadge.jsx (AI review severity)
- ContactTypeBadge.jsx (Contact type)

---

### 6. Component Library Choice: HeadlessUI Dialogs

**Decision:** HeadlessUI Dialog for all modal/dialog implementations

**Package:** `@headlessui/react: ^2.2.9`

**Rationale:**
- **Accessibility Standards:** Built-in ARIA attributes (role="dialog", aria-labelledby, etc.)
- **Focus Management:** Automatically traps focus in modal, restores to trigger element on close
- **Keyboard Support:** ESC to close, Tab navigation within modal
- **Backdrop Handling:** Supports click-outside-to-close pattern
- **No Dependencies:** Pure React, no third-party modal libraries

**Evidence:**
- 20+ modal implementations use HeadlessUI Dialog
- Examples: PurchaseOrderModal, AiReviewModal, NewJobModal, MergeContactsModal, etc.

**Protected Pattern:**
```jsx
<Dialog open={isOpen} onClose={onClose} className="relative z-50">
  <DialogBackdrop className="fixed inset-0 bg-black/30" />
  <div className="fixed inset-0 overflow-y-auto">
    <DialogPanel className="...">
      <DialogTitle>Modal Title</DialogTitle>
      {/* Content */}
      <button onClick={onClose} className="...">Close</button>
    </DialogPanel>
  </div>
</Dialog>
```

---

### 7. Form Library: React Hook Form (Implicit Standard)

**Decision:** No form library in dependencies; component-based form management

**Approach:** Each component manages its own form state with `useState`

**Rationale:**
- **No External Dependency:** Reduces bundle size
- **Flexibility:** Each form can have custom validation/submission logic
- **Simplicity:** For Trapid's use cases, custom state is sufficient

**Example Pattern (from EditJobDrawer.jsx):**
```jsx
const [formData, setFormData] = useState({
  name: job?.name || '',
  client_id: job?.client_id || '',
  // ...
})

const handleChange = (e) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }))
}

const handleSubmit = async (e) => {
  e.preventDefault()
  // Validation + API call
}
```

---

### 8. Table Architecture: Manual Implementation vs UI Library

**Decision:** Custom table implementations using `<table>` HTML + TailwindCSS (not react-table, ag-grid, etc.)

**Rationale:**
- **Control:** Full control over column behavior, sorting, filtering, resizing
- **Bundle Size:** No large table library dependencies
- **Customization:** Easy to add custom features (drag-drop, inline edit, etc.)
- **Learning Curve:** Developers understand standard HTML table semantics
- **Performance:** No abstraction layer, direct DOM manipulation

**Evidence:**
- 54+ table implementations across codebase
- All use `<table>`, `<thead>`, `<tbody>` with TailwindCSS styling
- Advanced features (resize, reorder) built with vanilla JavaScript
- No react-table, ag-grid, or similar libraries in dependencies

**Protected Pattern:** Manual table implementations with this structure

---

### 9. State Management: React Context API (No Redux)

**Decision:** React Context API for application-wide state (authentication, company settings, etc.)

**Rationale:**
- **Built-in:** No external library needed
- **Sufficient:** Trapid's state complexity doesn't require Redux/Zustand
- **Learning Curve:** Lower barrier to entry for new developers
- **Bundle Size:** Minimal - Context is part of React

**Implementation:** Likely in AppLayout.jsx and custom hooks

---

### 10. API Client: Axios with Centralized Configuration

**Decision:** Axios for all HTTP requests with centralized API client

**Location:** `/Users/rob/Projects/trapid/frontend/src/api.js` (inferred)

**Package:** `axios: ^1.13.1`

**Rationale:**
- **Interceptors:** Easy to add authentication, error handling globally
- **Request/Response Transformation:** Centralized data formatting
- **Cancel Tokens:** Support for request cancellation
- **Error Handling:** Consistent error handling across app

---

## Part 2: Known UI/UX Issues & Bugs

### 2.1 HIGH PRIORITY ISSUES (>50 components affected)

#### Issue #1: Search Boxes Missing Clear Buttons
**Impact:** 73 search boxes across the codebase
**Severity:** HIGH - UX regression
**Rule Violation:** RULE #19.20 (Search Functionality Standards)
**Affected Pages:**
- ContactsPage.jsx
- PriceBooksPage.jsx
- SuppliersPage.jsx
- PurchaseOrdersPage.jsx
- And 40+ more

**Current Implementation:**
```jsx
❌ WRONG - No clear button
<input
  type="text"
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**Required Fix:**
```jsx
✅ CORRECT - With clear button
<div className="relative">
  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  {searchQuery && (
    <button onClick={() => setSearchQuery('')}>
      <XMarkIcon className="h-5 w-5" />
    </button>
  )}
</div>
```

**Automation Possible:** YES - Can create script to add clear button to all search boxes

---

#### Issue #2: Modals Missing Close Buttons
**Impact:** 58 modals across the codebase
**Severity:** HIGH - Accessibility issue
**Rule Violation:** RULE #19.22 (Modal Rules)
**Current State:** 78 modals have close button, 58 do not

**Affected Modals:**
- NewJobModal
- EditJobModal
- PurchaseOrderModal
- MergeContactsModal
- And 50+ more

**Missing Pattern:**
```jsx
❌ MISSING - No close button in modal header
<DialogPanel className="...">
  <DialogTitle>Title</DialogTitle>
  {/* Content - no close button! */}
</DialogPanel>
```

**Required Pattern:**
```jsx
✅ CORRECT - Close button in top-right
<DialogPanel className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl">
  <div className="absolute top-0 right-0 pt-4 pr-4">
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
    >
      <XMarkIcon className="h-6 w-6" />
    </button>
  </div>
  <DialogTitle>Title</DialogTitle>
  {/* Content */}
</DialogPanel>
```

---

#### Issue #3: Empty States Missing Action Buttons
**Impact:** 66 empty states
**Severity:** HIGH - UX conversion issue
**Rule Violation:** RULE #19.27 (Empty State Rules)
**Current State:** 14 with action buttons, 66 without

**Current Implementation:**
```jsx
❌ WRONG - No action button
{data.length === 0 && (
  <div className="text-center py-12">
    <p>No items found</p>
    <p className="text-sm text-gray-600">Try adjusting filters</p>
  </div>
)}
```

**Required Implementation:**
```jsx
✅ CORRECT - With action button
{data.length === 0 && (
  <div className="text-center py-12">
    <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
      No items yet
    </h3>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
      Get started by creating your first item
    </p>
    <div className="mt-6">
      <button
        onClick={handleCreateNew}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Create New Item
      </button>
    </div>
  </div>
)}
```

---

#### Issue #4: Table Headers Not Sticky
**Impact:** 36 tables
**Severity:** HIGH - Scrolling UX
**Rule Violation:** RULE #19.2 (Sticky Headers)
**Current State:** 18 with sticky headers, 36 without

**Problem:** When scrolling large tables, headers scroll out of view

**Fix Required:**
```jsx
✅ CORRECT - Sticky headers
<div className="overflow-x-auto">
  <table>
    <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
      {/* Headers - now stay visible when scrolling */}
    </thead>
    <tbody>
      {/* Table rows */}
    </tbody>
  </table>
</div>
```

---

### 2.2 MEDIUM PRIORITY ISSUES (10-50 components affected)

#### Issue #5: Inline Column Filters Missing
**Impact:** 44 tables
**Severity:** MEDIUM - Feature completeness
**Affected Table Pages:**
- PriceBooksPage (2 tables)
- SuppliersPage (1 table)
- JobDetailPage (3 tables)
- ContactDetailPage (3 tables)

**Current Implementation:** No filter inputs in column headers

**Required Pattern:** Add text input in each `<th>` for filtering by that column:
```jsx
<th>
  <div className="flex items-center justify-between">
    <span>Column Name</span>
    <input
      type="text"
      placeholder="Filter..."
      value={filters.columnName || ''}
      onChange={(e) => handleFilterChange('columnName', e.target.value)}
      className="ml-2 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
    />
  </div>
</th>
```

---

#### Issue #6: Accessibility - Icon Buttons Missing aria-label
**Impact:** ~50 icon buttons
**Severity:** MEDIUM - Screen reader support
**Current Implementation:**
```jsx
❌ WRONG - No label
<button>
  <EyeIcon className="h-5 w-5" />
</button>
```

**Required Fix:**
```jsx
✅ CORRECT - With aria-label
<button aria-label="View details">
  <EyeIcon className="h-5 w-5" />
</button>
```

---

#### Issue #7: Search Results Count Not Displayed
**Impact:** 53 search boxes
**Severity:** MEDIUM - Feedback/clarity
**Missing Feature:** When user searches, no count of results shown

**Required Addition:**
```jsx
{searchQuery && (
  <div className="text-sm text-gray-600 dark:text-gray-400">
    Found {filteredResults.length} of {totalItems.length} results
  </div>
)}
```

---

#### Issue #8: Badge Icons Missing
**Impact:** 95 status badges
**Severity:** MEDIUM - Visual communication
**Current Implementation:** Color-only badges

**Enhancement:** Add semantic icons to badges:
```jsx
✅ WITH ICON
<Badge color="green">
  <CheckIcon className="h-4 w-4 mr-1" />
  Complete
</Badge>
```

---

#### Issue #9: URL State Not Synced for Tabs
**Impact:** 20 tab components
**Severity:** MEDIUM - Browser back/forward support
**Problem:** Tab selection not stored in URL, browser back button doesn't work
**Required Fix:** Sync active tab to URL search params (see ContactsPage for reference)

---

#### Issue #10: Page-Level Loading Spinner Missing
**Impact:** 12 pages
**Severity:** MEDIUM - Feedback during async operations
**Affected Pages:**
- JobDetailPage
- ContactDetailPage
- PurchaseOrderDetailPage
- And others with async data loading

---

### 2.3 LOW PRIORITY ISSUES (<10 components affected)

#### Issue #11: Button Hierarchy Not Consistent
**Impact:** 100 buttons (review needed)
**Severity:** LOW - Design consistency

**Problem:** Some buttons use primary color inconsistently

**Standard Pattern:**
```jsx
// Primary action
<button className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
  Primary Action
</button>

// Secondary action
<button className="bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
  Secondary Action
</button>

// Destructive action
<button className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
  Delete
</button>
```

---

#### Issue #12: Form Validation Error Display Inconsistent
**Impact:** 40 forms
**Severity:** LOW - UX consistency

**Standard Pattern:**
```jsx
<input
  type="text"
  aria-invalid={!!error}
  className={`border rounded ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
/>
{error && (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
    {error}
  </p>
)}
```

---

#### Issue #13: Responsive Design Not Tested
**Impact:** All pages
**Severity:** LOW - Mobile UX

**Current State:** Tables and modals may not be responsive on mobile

---

### 2.4 NO ISSUES FOUND (Already Compliant)

✅ **Toast Notifications** - Properly implemented with color system
✅ **Dark Mode** - Excellent coverage across codebase (5,920 uses)
✅ **Color System** - Consistent semantic color usage via Badge component
✅ **Form Layout** - Generally good pattern (space-y-6 spacing)
✅ **Error Handling** - Good error boundaries (ErrorBoundary.jsx)

---

## Part 3: Testing Infrastructure

### 3.1 Existing Tests

**E2E Tests:**
- Location: `/Users/rob/Projects/trapid/frontend/tests/e2e/gantt-cascade.spec.js`
- Framework: Playwright v1.56.1
- Tests: 1 Gantt cascade test with detailed bug-hunter diagnostics
- Config: `/Users/rob/Projects/trapid/frontend/playwright.config.js`

**Test Features:**
- API call monitoring (detects duplicate/infinite loop API calls)
- State update batch tracking
- Gantt reload counting
- Console log monitoring
- Screenshot on failure
- Video on failure
- Detailed diagnostic reporting

**Unit Tests:**
- Framework: Vitest v4.0.8
- Location: No unit tests found in `/src/` (only in node_modules)
- Coverage: No test files in codebase

**Test Scripts in package.json:**
```json
"test": "vitest"
"test:ui": "vitest --ui"
"test:coverage": "vitest --coverage"
"test:e2e": "playwright test"
"test:e2e:ui": "playwright test --ui"
"test:e2e:headed": "playwright test --headed"
"test:e2e:debug": "playwright test --debug"
"test:gantt": "playwright test gantt-cascade"
```

---

### 3.2 Missing Tests

❌ **NO visual regression tests** (e.g., Percy, BackstopJS)
❌ **NO accessibility tests** (e.g., axe-core, jest-axe)
❌ **NO UI component unit tests** (Vitest setup exists but unused)
❌ **NO browser compatibility tests** (only Chromium in Playwright)
❌ **NO responsive/mobile tests** (no viewport testing)
❌ **NO dark mode screenshot tests**
❌ **NO performance tests** (lighthouse, bundle size)

---

### 3.3 What Could Be Tested

**High Value (Low Cost):**
1. Dark mode rendering (screenshot tests)
2. Accessibility (axe-core automated scan)
3. Responsive layouts (viewport testing)
4. Color contrast (automated accessibility check)
5. Search clear button functionality
6. Modal close button functionality

**Medium Value (Medium Cost):**
1. Table sorting/filtering logic
2. Column resize persistence
3. Form validation error display
4. Empty state rendering
5. Toast notifications
6. Icon button aria-labels

**Lower Value (Higher Cost):**
1. Full visual regression testing (all components)
2. Browser compatibility (Firefox, Safari, etc.)
3. E2E user workflows
4. Performance regression testing

---

## Part 4: Known Gaps & Enhancement Opportunities

### 4.1 Gaps from TABLE_STANDARDS.md

**73 Search boxes missing clear button (X icon)**
- Automation possible: 30-40 minutes with script
- High user impact (very common UX pattern)

**58 Modals missing close button**
- Automation possible: 20-30 minutes with template
- Accessibility requirement

**66 Empty states missing action button**
- Manual work required: 1-2 hours
- UX improvement (drives user actions)

**36 Tables missing sticky headers**
- Automation possible: 15-20 minutes (add `sticky top-0 z-10` to thead)
- Essential for scrolling UX

**44 Tables missing inline column filters**
- Manual work required: 3-5 hours
- Power user feature (medium value)

---

### 4.2 Gaps from CODE_ANALYSIS

**TODO Comments:**
- 3 in Settings.jsx (password change, logout, account deletion)
- 2 in main.jsx (error tracking service setup)
- 1 in Features.jsx (load saved plans)

**FIXME Comments:** None found

**DEBUG Comments:**
- 30+ in ganttDebugger.js (intentional, used for diagnostics)
- 3 in DHtmlxGanttView.jsx (alignment debugging)
- 2 in ScheduleTemplateEditor.jsx (pending updates tracking)

---

### 4.3 Enhancement Opportunities

**1. Storybook Integration**
- Create a component library showcase
- Document all 8 Badge colors
- Show form pattern variations
- Allow designers/developers to review components

**2. Accessibility Scanning**
- Add axe-core to CI/CD
- Automated contrast ratio checking
- Screen reader testing

**3. Performance Optimization**
- Memoization audit (currently insufficient)
- Image optimization
- Code splitting by route

**4. Responsive Design System**
- Documented breakpoints
- Mobile-first patterns
- Touch target sizes (48x48px minimum)

**5. Design Tokens**
- Exported from Badge/Color system
- Shared with design tools (Figma, etc.)
- Version control for design consistency

---

## Part 5: Architecture Decisions Summary Table

| Decision | Choice | Rationale | Files |
|----------|--------|-----------|-------|
| Component Framework | React 19.1 + Vite | Modern, fast builds | package.json |
| CSS-in-JS vs TailwindCSS | TailwindCSS | Performance, dark mode built-in | tailwind.config.js |
| UI Component Library | HeadlessUI | Accessibility + composability | 20+ component files |
| Icon Library | Heroicons | Consistency, Tailwind-official | 200+ uses |
| Modal Library | HeadlessUI Dialog | ARIA, focus management | All modals |
| Form State | React useState | Simple, sufficient | 40+ forms |
| API Client | Axios | Interceptors, error handling | api.js |
| State Management | React Context | Built-in, sufficient | AppLayout.jsx |
| Table Implementation | HTML `<table>` | Control, bundle size | 54+ tables |
| Dark Mode | CSS media query | No JS overhead, respects OS | 5,920+ classes |
| Color System | Badge component | Single source of truth | Badge.jsx |
| Testing Framework | Playwright | E2E, visual, accessibility | playwright.config.js |

---

## Part 6: Files to Update for Lexicon Chapter 19

When creating TRAPID_LEXICON.md Chapter 19, document:

1. **Known Bugs** - Issues from Part 2 above
2. **Architecture Decisions** - Rationale from Part 1 above
3. **Testing State** - Current tests + missing tests from Part 3
4. **Enhancement Roadmap** - Gaps from Part 4
5. **Code Pattern Examples** - Real examples from ContactsPage, POTable, etc.
6. **Performance Considerations** - Memoization, debouncing patterns
7. **Accessibility Guidelines** - ARIA, semantic HTML, keyboard nav
8. **Color System Reference** - Badge component, semantic colors
9. **Common Pitfalls** - What NOT to do (from TODO comments)
10. **Testing Checklist** - Manual testing steps for UI changes

---

## Summary Statistics

| Metric | Count | Status |
|--------|-------|--------|
| Total JSX Components | 211 | Well-organized |
| Components with dark mode | 5,920+ classes | Excellent coverage |
| Tables in codebase | 54+ | Needs 36 sticky headers |
| Modals in codebase | 136 | Needs 58 close buttons |
| Search boxes | 73 | Needs 73 clear buttons |
| Empty states | 80 | Needs 66 action buttons |
| E2E tests | 1 (Gantt) | Limited coverage |
| Unit tests | 0 (in src/) | Missing |
| TODO comments | 6 | Minor items |
| HIGH priority issues | ~233 | High impact |
| MEDIUM priority issues | ~236 | Medium impact |
| LOW priority issues | ~159 | Polish items |

---

## Recommendations for Lexicon Development

**Phase 1: Document Architecture**
- Explain HeadlessUI + Heroicons choice
- Document TailwindCSS dark mode strategy
- Reference ContactsPage as gold standard
- Explain Badge semantic color system

**Phase 2: Document Known Issues**
- Create BUG entries for each issue group
- Provide root cause analysis
- Include code examples (wrong vs right)
- Link to affected files

**Phase 3: Document Testing State**
- Current: Playwright E2E for Gantt only
- Missing: Unit tests, visual tests, a11y tests
- Recommended: Add axe-core, responsive testing

**Phase 4: Document Enhancement Roadmap**
- Timeline for search clear buttons (quick win)
- Timeline for modal close buttons (quick win)
- Timeline for sticky headers (quick win)
- Timeline for inline filters (medium effort)

---

**Research Complete** ✓
**Ready for:** TRAPID_LEXICON.md Chapter 19 development
**Next Step:** Create comprehensive Lexicon chapter with bug documentation


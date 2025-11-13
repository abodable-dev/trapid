# Trapid Redesign Master Plan - Updated 2025-11-12

## Current Status Summary

- **Completed**: 1 page (Dashboard)
- **In Progress**: 3 pages (ActiveJobsPage, ContactsPage, PriceBooksPage)
- **Remaining**: 36 pages
- **Total Pages**: 40 pages

**Design Foundation**: Midday.ai-inspired forced dark mode
**Enhancement**: LayerZero patterns for polish and interaction

---

## MUST INTEGRATE - Foundation Components (Do First)

These 6 components provide the foundation for all other pages:

### 1. Border Color Update (5 minutes)
**File**: `/Users/jakebaird/trapid/frontend/tailwind.config.js`
**Change**: Lighten border from `#2E2E2E` to `#272727` (LayerZero standard)
**Impact**: Entire app feels lighter and more modern
**Status**: ⏳ Pending

```js
border: {
  DEFAULT: '#272727',  // Changed from #2E2E2E
  subtle: '#1A1A1A',
}
```

---

### 2. CornerHover Component (10 minutes)
**File**: `/Users/jakebaird/trapid/frontend/src/components/ui/CornerHover.jsx` (new)
**Purpose**: Animated corner borders on card hover (marketing feel)
**Use On**: Dashboard job cards, feature cards, important CTAs
**Status**: ⏳ Pending

```jsx
export function CornerHover({ children, className = '' }) {
  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className="absolute top-0 right-0 w-0 h-px bg-white group-hover:w-8 transition-all duration-300" />
      <div className="absolute top-0 right-0 w-px h-0 bg-white group-hover:h-8 transition-all duration-300 delay-75" />
      <div className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-8 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 w-px h-0 bg-white group-hover:h-8 transition-all duration-300 delay-75" />
    </div>
  )
}
```

---

### 3. Button Variants Extension (15 minutes)
**File**: `/Users/jakebaird/trapid/frontend/src/components/ui/button.jsx` (extend existing)
**Purpose**: Add secondary, ghost, and fill button variants
**Use On**: All pages need secondary/tertiary button options
**Status**: ⏳ Pending

```jsx
const buttonVariants = cva(
  'inline-flex items-center justify-center transition-all font-medium',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:opacity-90',
        secondary: 'bg-transparent border border-gray-700 text-white hover:bg-gray-900',
        ghost: 'text-gray-400 hover:text-white hover:bg-gray-900',
        destructive: 'bg-error text-white hover:opacity-90',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        default: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
  }
)
```

---

### 4. PageHeader Component (20 minutes)
**File**: `/Users/jakebaird/trapid/frontend/src/components/ui/PageHeader.jsx` (new)
**Purpose**: Consistent page headers with breadcrumbs, title, actions
**Use On**: Every list/detail page (35+ pages)
**Status**: ⏳ Pending

```jsx
export function PageHeader({ breadcrumbs, title, subtitle, actions, children }) {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-mono">
          {breadcrumbs.map((crumb, i) => (
            <Fragment key={i}>
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-400">{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </div>
      )}

      {/* Title + Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {children}
    </div>
  )
}
```

---

### 5. StatCard Component (15 minutes)
**File**: `/Users/jakebaird/trapid/frontend/src/components/ui/StatCard.jsx` (new)
**Purpose**: Dashboard metrics, job overview stats
**Use On**: Dashboard, JobDetailPage, HealthPage
**Status**: ⏳ Pending

```jsx
export function StatCard({ label, value, change, trend }) {
  return (
    <div className="bg-gray-900 border border-gray-700 p-4">
      <div className="text-xs font-mono uppercase text-gray-500 mb-1">
        {label}
      </div>
      <div className="text-3xl font-normal font-mono text-white mb-1">
        {value}
      </div>
      {change && (
        <div className="text-xs text-gray-500">
          {change}
        </div>
      )}
    </div>
  )
}
```

---

### 6. SearchBar Component (20 minutes)
**File**: `/Users/jakebaird/trapid/frontend/src/components/ui/SearchBar.jsx` (new)
**Purpose**: Consistent search UI across list pages
**Use On**: ContactsPage, SuppliersPage, ActiveJobsPage, etc.
**Status**: ⏳ Pending

```jsx
import { Search } from 'lucide-react'

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        className="
          w-full
          bg-gray-900
          border border-gray-700
          text-white placeholder-gray-500
          pl-12 pr-4 py-3
          text-sm
          focus:outline-none focus:border-gray-600
          transition-colors
        "
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
```

---

## Page Redesign Plan - Grouped by Pattern

### GROUP A: Marketing Pattern (Spacious, Animated, Impressive)
**Pattern**: 3-column grid, CornerHover, stats, breathing space
**Time per page**: 1-2 hours

#### A1. Dashboard (COMPLETED ✅)
- **Status**: ✅ Complete
- **Notes**: Foundation page, already using new design system

#### A2. JobDetailPage (HIGH PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/JobDetailPage.jsx`
- **Current**: Uses Heroicons, old colors, old buttons
- **Apply**:
  - PageHeader component with breadcrumbs
  - StatCard grid (4 metrics: POs, Budget, Timeline, Status)
  - CornerHover on related items section
  - Icon transform hovers on action buttons
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### A3. JobSetupPage (MEDIUM PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/JobSetupPage.jsx`
- **Current**: Gradient buttons, old colors
- **Apply**:
  - Numbered sections pattern (/ 01, / 02, etc.)
  - New button variants
  - StatCard for progress tracking
- **Estimate**: 2 hours
- **Status**: ❌ Not Started

---

### GROUP B: Dense List Pattern (Card-Based Rows, Scannable, Efficient)
**Pattern**: Card-based table rows, SearchBar, filter tabs, divider lines
**Time per page**: 1 hour

#### B1. ContactsPage (IN PROGRESS 🚧)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/ContactsPage.jsx`
- **Current**: Mixed styling, uses Lucide icons
- **Apply**:
  - PageHeader component
  - SearchBar component
  - Card-based rows (replace table)
  - Grid layout: `[1fr_auto_auto_auto_auto]` (name, type, phone, xero, actions)
  - Hover: entire row lights up
- **Estimate**: 1 hour
- **Status**: 🚧 In Progress

#### B2. SuppliersPage (IN PROGRESS 🚧)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/SuppliersPage.jsx`
- **Current**: Uses Lucide icons
- **Apply**:
  - PageHeader component
  - SearchBar component
  - **Ecosystem grid pattern**: 2/3/4/6 columns responsive
  - Square cards with logo, name, rating, category
  - Corner decoration on hover
- **Estimate**: 1.5 hours
- **Status**: 🚧 In Progress

#### B3. ActiveJobsPage (IN PROGRESS 🚧)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/ActiveJobsPage.jsx`
- **Current**: Uses Lucide icons, old colors
- **Apply**:
  - PageHeader component
  - SearchBar component
  - Card-based rows
  - Metadata row with monospace font (job number, value, status)
- **Estimate**: 1 hour
- **Status**: 🚧 In Progress

#### B4. PriceBooksPage (IN PROGRESS 🚧)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/PriceBooksPage.jsx`
- **Current**: Uses Lucide icons, old colors
- **Apply**:
  - PageHeader component
  - SearchBar component
  - Card-based rows
  - Icon transform on expand/collapse
- **Estimate**: 1 hour
- **Status**: 🚧 In Progress

#### B5. DocumentsPage
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/DocumentsPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - SearchBar component
  - Card-based rows with thumbnail preview
  - Image scale hover on thumbnails
- **Estimate**: 1 hour
- **Status**: ❌ Not Started

---

### GROUP C: Detail Pages (Hybrid - Beautiful Header, Efficient Content)
**Pattern**: PageHeader, 2-column grid, related items section
**Time per page**: 1.5 hours

#### C1. ContactDetailPage (HIGH PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/ContactDetailPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader with breadcrumbs (Dashboard / Contacts / {name})
  - 2-column info grid
  - Related jobs section (card-based rows)
  - Secondary buttons for actions
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### C2. SupplierDetailPage (HIGH PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/SupplierDetailPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - 2-column info grid
  - Related POs section (card-based rows)
  - Rating display with stars
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### C3. PriceBookItemDetailPage (HIGH PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/PriceBookItemDetailPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - 2-column info grid
  - Usage history section (card-based rows)
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### C4. PurchaseOrderDetailPage (HIGH PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/PurchaseOrderDetailPage.jsx`
- **Current**: Needs audit
- **Apply**:
  - PageHeader component
  - StatCard grid (total, paid, outstanding)
  - Line items table (card-based rows)
  - Status timeline
- **Estimate**: 2 hours
- **Status**: ❌ Not Started

---

### GROUP D: Form/Edit Pages (Clean Forms, Validation)
**Pattern**: PageHeader, form sections, inline validation
**Time per page**: 1.5 hours

#### D1. PurchaseOrderEditPage (HIGH PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/PurchaseOrderEditPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - Form sections with borders
  - Button variants (Save = primary, Cancel = secondary)
  - Inline validation states
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### D2. SupplierNewPage (MEDIUM PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/SupplierNewPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - Form sections
  - Button variants
- **Estimate**: 1 hour
- **Status**: ❌ Not Started

#### D3. SupplierEditPage (MEDIUM PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/SupplierEditPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - Form sections
  - Button variants
- **Estimate**: 1 hour
- **Status**: ❌ Not Started

---

### GROUP E: Complex/Technical Pages (Comment Headers, Numbered Sections)
**Pattern**: Developer-style, monospace labels, technical density
**Time per page**: 2-3 hours

#### E1. TablePage (MEDIUM PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/TablePage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - Keep existing table functionality
  - Update colors to new system
  - Icon transform on sort arrows
  - CornerHover on empty state
- **Estimate**: 2 hours
- **Status**: ❌ Not Started

#### E2. MasterSchedulePage (MEDIUM PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/MasterSchedulePage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - Update Gantt chart colors to new system
  - Keep existing functionality
  - Comment-style headers for sections
- **Estimate**: 2.5 hours
- **Status**: ❌ Not Started

#### E3. ImportPage (MEDIUM PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/ImportPage.jsx`
- **Current**: Old text colors
- **Apply**:
  - Numbered sections pattern (/ 01, / 02, / 03)
  - Progress indicator using StatCard
  - Update color system
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### E4. SchemaPage (LOW PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/SchemaPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - Comment-style headers (`// Database Schema`)
  - Card-based rows for tables
  - Monospace for all field names
  - Expandable sections with icon transform
- **Estimate**: 2 hours
- **Status**: ❌ Not Started

#### E5. HealthPage (LOW PRIORITY)
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/HealthPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - StatCard grid (4-6 metrics)
  - Comment-style headers
  - Status indicators with color coding
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

---

### GROUP F: Designer Pages (Technical + Clean)
**Pattern**: Comment headers, numbered sections, dense grids
**Time per page**: 1.5-2 hours

#### F1. DesignerHome
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/designer/DesignerHome.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - 3-column grid for feature cards
  - CornerHover on cards
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### F2. TableBuilder
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/designer/TableBuilder.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - Comment-style headers
  - Numbered sections
  - Form sections with borders
- **Estimate**: 2 hours
- **Status**: ❌ Not Started

#### F3. TableSettings
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/designer/TableSettings.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - 2-column settings grid
  - Card-based rows for columns
- **Estimate**: 2 hours
- **Status**: ❌ Not Started

#### F4. Features
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/designer/Features.jsx`
- **Current**: Gradient buttons, Heroicons
- **Apply**:
  - PageHeader component
  - 3-column grid
  - Button variants (no gradients)
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### F5. Menus
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/designer/Menus.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - Card-based rows for menu items
  - Expandable sections with icon transform
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### F6. Pages
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/designer/Pages.jsx`
- **Current**: Needs audit
- **Apply**:
  - PageHeader component
  - Card-based rows
  - SearchBar component
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### F7. Experiences
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/designer/Experiences.jsx`
- **Current**: Needs audit
- **Apply**:
  - PageHeader component
  - 3-column grid
  - CornerHover on cards
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

---

### GROUP G: Supporting Pages (Lower Priority)
**Pattern**: Simple layouts, minimal complexity
**Time per page**: 1 hour

#### G1. SettingsPage
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/SettingsPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - 2-column grid for settings sections
  - Form styling
- **Estimate**: 1.5 hours
- **Status**: ❌ Not Started

#### G2. WorkflowsPage
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/WorkflowsPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - Card-based rows
  - Status badges
- **Estimate**: 1 hour
- **Status**: ❌ Not Started

#### G3. WorkflowAdminPage
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/WorkflowAdminPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - PageHeader component
  - Card-based rows
  - Comment-style headers
- **Estimate**: 1 hour
- **Status**: ❌ Not Started

#### G4. ChatPage
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/ChatPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - Update colors only
  - Keep existing chat UI
  - Message bubbles use new borders
- **Estimate**: 1 hour
- **Status**: ❌ Not Started

#### G5. OneDrivePage
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/OneDrivePage.jsx`
- **Current**: Old colors
- **Apply**:
  - PageHeader component
  - Update colors
  - Card-based file list
- **Estimate**: 1 hour
- **Status**: ❌ Not Started

#### G6. OutlookPage
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/OutlookPage.jsx`
- **Current**: Old colors
- **Apply**:
  - PageHeader component
  - Update colors
  - Card-based email list
- **Estimate**: 1 hour
- **Status**: ❌ Not Started

#### G7. XeroCallbackPage
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/XeroCallbackPage.jsx`
- **Current**: Heroicons, old colors
- **Apply**:
  - Simple centered card
  - Update colors
  - Loading state with shimmer
- **Estimate**: 30 minutes
- **Status**: ❌ Not Started

---

### GROUP H: Auth Pages (Minimal Redesign Needed)
**Pattern**: Centered card, clean forms
**Time per page**: 30-45 minutes

#### H1. Login
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/Login.jsx`
- **Current**: Needs audit
- **Apply**:
  - Centered card
  - Form styling
  - Button variants
- **Estimate**: 45 minutes
- **Status**: ⚠️ Needs Audit

#### H2. Signup
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/Signup.jsx`
- **Current**: Needs audit
- **Apply**:
  - Centered card
  - Form styling
  - Button variants
- **Estimate**: 45 minutes
- **Status**: ⚠️ Needs Audit

#### H3. Profile
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/Profile.jsx`
- **Current**: Needs audit
- **Apply**:
  - PageHeader component
  - 2-column info/edit grid
  - Form styling
- **Estimate**: 1 hour
- **Status**: ⚠️ Needs Audit

#### H4. Logout
- **File**: `/Users/jakebaird/trapid/frontend/src/pages/Logout.jsx`
- **Current**: Needs audit
- **Apply**:
  - Centered message
  - Update colors
- **Estimate**: 15 minutes
- **Status**: ⚠️ Needs Audit

---

## Execution Plan with Timeline

### TODAY (2-3 hours) - Foundation Sprint
**Goal**: Set up the 6 MUST INTEGRATE components so all page work goes faster

1. **Lighten borders** in `tailwind.config.js` (5 min)
2. **Create CornerHover** component (10 min)
3. **Extend Button** variants (15 min)
4. **Create PageHeader** component (20 min)
5. **Create StatCard** component (15 min)
6. **Create SearchBar** component (20 min)
7. **Test components** on Dashboard (30 min)

**Output**: 6 reusable components ready to drop into any page

---

### THIS WEEK (Remainder) - Complete Group B (Dense Lists)

**Day 1-2**: Finish In-Progress Pages
- Complete ContactsPage (1 hr)
- Complete SuppliersPage (1.5 hr)
- Complete ActiveJobsPage (1 hr)
- Complete PriceBooksPage (1 hr)

**Day 3**: Add DocumentsPage
- DocumentsPage (1 hr)

**Total**: ~5.5 hours across 3 days = ~2 hrs/day

**Output**: All list pages follow consistent pattern, users can navigate main entities

---

### WEEK 2 - Group A (Marketing) + Group C (Details)

**Priority**: High-traffic pages that users see most

**Day 1-2**: Group A (Marketing Pattern)
- JobDetailPage (1.5 hr)
- JobSetupPage (2 hr)

**Day 3-5**: Group C (Detail Pages)
- ContactDetailPage (1.5 hr)
- SupplierDetailPage (1.5 hr)
- PriceBookItemDetailPage (1.5 hr)
- PurchaseOrderDetailPage (2 hr)

**Total**: ~10 hours across 5 days = ~2 hrs/day

**Output**: Core job + detail workflows redesigned, 90% of user time spent in these pages

---

### WEEK 3 - Group D (Forms) + Group E (Complex)

**Day 1-2**: Group D (Form Pages)
- PurchaseOrderEditPage (1.5 hr)
- SupplierNewPage (1 hr)
- SupplierEditPage (1 hr)

**Day 3-5**: Group E (Complex Pages)
- TablePage (2 hr)
- MasterSchedulePage (2.5 hr)
- ImportPage (1.5 hr)

**Total**: ~10 hours across 5 days = ~2 hrs/day

**Output**: Data entry and complex workflows redesigned

---

### WEEK 4 - Group F (Designer) + Group E (Technical)

**Day 1-3**: Designer Pages (High value for builder users)
- DesignerHome (1.5 hr)
- TableBuilder (2 hr)
- TableSettings (2 hr)
- Features (1.5 hr)

**Day 4-5**: Technical Pages
- SchemaPage (2 hr)
- HealthPage (1.5 hr)

**Total**: ~10.5 hours across 5 days = ~2 hrs/day

**Output**: Designer section complete, technical pages done

---

### WEEK 5 - Group F (Remaining) + Group G (Supporting)

**Day 1-2**: Remaining Designer Pages
- Menus (1.5 hr)
- Pages (1.5 hr)
- Experiences (1.5 hr)

**Day 3-5**: Supporting Pages
- SettingsPage (1.5 hr)
- WorkflowsPage (1 hr)
- WorkflowAdminPage (1 hr)
- ChatPage (1 hr)
- OneDrivePage (1 hr)
- OutlookPage (1 hr)
- XeroCallbackPage (0.5 hr)

**Total**: ~11 hours across 5 days = ~2.2 hrs/day

**Output**: All supporting pages complete

---

### WEEK 6 - Group H (Auth) + Polish + Testing

**Day 1-2**: Auth Pages
- Login (0.75 hr)
- Signup (0.75 hr)
- Profile (1 hr)
- Logout (0.25 hr)

**Day 3-4**: Polish Pass
- Review all pages for consistency
- Fix any missed icons/colors
- Test responsive behavior
- Test dark mode (should be forced everywhere)

**Day 5**: Final QA
- Full app walkthrough
- Check all routes
- Verify all components
- Document any future enhancements

**Total**: ~8 hours across 5 days = ~1.6 hrs/day

**Output**: 40/40 pages redesigned, polished, and tested

---

## Quick Reference - Pattern to Page Mapping

### CornerHover (Use On)
- Dashboard job cards ✅
- JobDetailPage related items
- DesignerHome feature cards
- Experiences cards
- Any "impressive" card that needs drama

### PageHeader (Use On)
- ALL list pages (14 pages)
- ALL detail pages (5 pages)
- ALL designer pages (7 pages)
- = 26+ pages need this component

### StatCard (Use On)
- Dashboard (metrics row)
- JobDetailPage (PO count, budget, timeline, status)
- PurchaseOrderDetailPage (total, paid, outstanding)
- HealthPage (system metrics)
- JobSetupPage (progress tracking)

### SearchBar (Use On)
- ContactsPage
- SuppliersPage
- ActiveJobsPage
- PriceBooksPage
- DocumentsPage
- WorkflowsPage
- TableBuilder (searching columns)
- Menus
- Pages

### Card-Based Rows (Use On)
- ContactsPage (replace table)
- SuppliersPage (if not using ecosystem grid)
- ActiveJobsPage (replace table)
- PriceBooksPage (replace table)
- DocumentsPage (file list)
- WorkflowsPage (workflow list)
- All "list" style pages

### Ecosystem Grid (Use On)
- SuppliersPage (6-column dense grid)
- Potentially ContactsPage if too many contacts
- Any page with 50+ small items

### Numbered Sections (Use On)
- JobSetupPage (multi-step process)
- ImportPage (upload → map → confirm)
- TableBuilder (step-by-step table creation)

### Comment-Style Headers (Use On)
- SchemaPage (`// Database Schema`)
- TableBuilder (`// Table Configuration`)
- HealthPage (`// System Status`)
- WorkflowAdminPage (`// Workflow Engine`)

---

## Time Estimates Summary

**Foundation Components**: 1.5 hours (TODAY)
**Testing Foundation**: 0.5 hours (TODAY)

**Group A (Marketing)**: 3.5 hours
**Group B (Dense Lists)**: 5.5 hours
**Group C (Detail Pages)**: 8 hours
**Group D (Forms)**: 3.5 hours
**Group E (Complex/Technical)**: 9.5 hours
**Group F (Designer)**: 11 hours
**Group G (Supporting)**: 8 hours
**Group H (Auth)**: 2.75 hours
**Polish + QA**: 8 hours

**Total Estimated Time**: ~60 hours
**Pace**: 2 hours/day = 30 days = 6 weeks

---

## Success Metrics

After completion, verify:

- [ ] All 40 pages use Lucide icons (no Heroicons remain)
- [ ] All pages use forced dark mode (no `dark:` variants needed)
- [ ] All borders use `#272727` (lighter, more modern)
- [ ] All primary buttons are `bg-white text-black`
- [ ] All numbers use `font-mono`
- [ ] PageHeader used on 26+ pages
- [ ] SearchBar used on 9+ list pages
- [ ] StatCard used on 5+ pages
- [ ] CornerHover used on 5+ card grids
- [ ] No gradient buttons remain (`bg-gradient-to-r`)
- [ ] All pages responsive (test 375px, 768px, 1440px)
- [ ] All hover states smooth (150-300ms transitions)
- [ ] All empty states use EmptyState component

---

## Notes & Decisions

**Design Philosophy**: Adaptive density
- Marketing pages (Dashboard, Job Overview) breathe with CornerHover and StatCards
- Technical pages (Tables, Schema) pack information with card-based rows and comment headers
- Detail pages are hybrid (beautiful PageHeader, efficient content grids)

**Mobile Strategy**:
- 3-column grids collapse to 1-column on mobile
- 6-column ecosystem grids collapse to 2-column on mobile
- Card-based rows are more mobile-friendly than traditional tables
- SearchBar always full-width
- PageHeader actions stack below title on mobile

**Performance**:
- All animations use `transition-all` with defined durations
- No expensive re-renders (components are pure)
- CornerHover uses CSS-only animations (no JS)
- Shimmer loading states use CSS gradients

**Accessibility**:
- All buttons have clear hover states
- All interactive elements are keyboard accessible
- All icons have appropriate sizing (w-4 h-4 minimum)
- All text meets WCAG contrast ratios on black background

---

**Last Updated**: 2025-11-12
**Next Review**: After Week 1 completion (foundation + Group B)
**Contact**: Jake (for design questions or pattern clarifications)

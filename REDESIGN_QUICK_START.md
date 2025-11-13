# Trapid Redesign - Quick Start Guide

**Last Updated**: 2025-11-12

## Status at a Glance

- **Completed**: 1/40 pages (Dashboard)
- **In Progress**: 3/40 pages (Contacts, Suppliers, ActiveJobs, PriceBooks)
- **Remaining**: 36/40 pages
- **Estimated Time**: 60 hours total (~6 weeks at 2 hrs/day)

---

## TODAY's Tasks (2-3 hours)

### Foundation Sprint - Build 6 Core Components

These components will be used across 26+ pages, so building them first saves tons of time:

1. **Border Color** (5 min) - Lighten from `#2E2E2E` to `#272727`
2. **CornerHover** (10 min) - Animated corner borders for marketing cards
3. **Button Variants** (15 min) - Add secondary, ghost variants
4. **PageHeader** (20 min) - Breadcrumbs + title + actions
5. **StatCard** (15 min) - Dashboard metrics component
6. **SearchBar** (20 min) - Consistent search UI
7. **Test** (30 min) - Verify components work on Dashboard

**After today**: You can drop these components into any page in 5-10 minutes

---

## THIS WEEK's Focus (After Foundation)

### Complete Group B - Dense List Pages (5.5 hours)

**Why these first?** Users spend 60% of their time in list views. Get these right, everything else follows.

1. **ContactsPage** (1 hr) - Card-based rows, SearchBar
2. **SuppliersPage** (1.5 hr) - Ecosystem grid (6 columns)
3. **ActiveJobsPage** (1 hr) - Card-based rows
4. **PriceBooksPage** (1 hr) - Card-based rows
5. **DocumentsPage** (1 hr) - Card-based rows with thumbnails

**Pattern**: Replace `<table>` with card-based rows that look like this:

```jsx
<div className="space-y-0 divide-y divide-gray-700">
  {items.map(item => (
    <div className="py-4 px-6 grid grid-cols-[1fr_auto_auto_auto] gap-4 hover:bg-gray-900 transition-colors cursor-pointer">
      {/* Name + subtitle */}
      <div>
        <h3 className="text-sm text-white">{item.name}</h3>
        <p className="text-xs text-gray-500">{item.email}</p>
      </div>
      {/* Metadata badges */}
      {/* Actions menu */}
    </div>
  ))}
</div>
```

---

## WEEK 2 - High-Traffic Pages (10 hours)

**Why these?** Core job workflows = 90% of user time

### Group A: Marketing Pattern (3.5 hrs)
- JobDetailPage (1.5 hr) - StatCards + CornerHover
- JobSetupPage (2 hr) - Numbered sections

### Group C: Detail Pages (6.5 hrs)
- ContactDetailPage (1.5 hr)
- SupplierDetailPage (1.5 hr)
- PriceBookItemDetailPage (1.5 hr)
- PurchaseOrderDetailPage (2 hr)

---

## Key Design Patterns

### 1. Adaptive Density (LayerZero Principle)

**Marketing Pages** (breathe, impress):
- Dashboard, JobDetailPage, JobSetupPage
- Use: CornerHover, StatCards, 3-column grids
- Spacing: Generous (space-y-8, space-y-12)

**Technical Pages** (scan, work):
- ContactsPage, SuppliersPage, TablePage
- Use: Card-based rows, SearchBar, dense grids
- Spacing: Compact (space-y-4)

**Detail Pages** (hybrid):
- Beautiful PageHeader + Efficient 2-column grids
- Related items in card-based rows

---

### 2. Component Usage Map

| Component | # of Pages | Priority |
|-----------|------------|----------|
| **PageHeader** | 26+ | HIGH - Build first |
| **SearchBar** | 9+ | HIGH - Build first |
| **StatCard** | 5+ | MEDIUM - Week 2 |
| **CornerHover** | 5+ | MEDIUM - Week 2 |
| Card-based rows | 12+ | HIGH - This week |
| Ecosystem grid | 2 | LOW - When needed |

---

### 3. Quick Patterns

#### Page Header (Every Page)
```jsx
<PageHeader
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contacts' },
  ]}
  title="Contacts"
  subtitle="Manage your clients, suppliers, and subcontractors"
  actions={
    <Button variant="default">
      <Plus className="w-4 h-4 mr-2" />
      New Contact
    </Button>
  }
/>
```

#### Search Bar (List Pages)
```jsx
<SearchBar
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search contacts..."
/>
```

#### Stat Cards (Dashboard, Job Detail)
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <StatCard label="Active Jobs" value="12" change="+2 this week" />
  <StatCard label="Total Value" value="$1.2M" change="+15%" />
</div>
```

#### Corner Hover (Feature Cards)
```jsx
<CornerHover className="bg-gray-900 border border-gray-700 p-6">
  <CardContent />
</CornerHover>
```

---

## Week-by-Week Roadmap

| Week | Focus | Hours | Pages | Output |
|------|-------|-------|-------|--------|
| **1** | Foundation + Lists | 8 | 5 | Foundation components + all list pages |
| **2** | Core Workflows | 10 | 6 | Job details + entity details |
| **3** | Forms + Complex | 10 | 6 | Edit pages + TablePage + Gantt |
| **4** | Designer + Technical | 10.5 | 6 | Designer section + Schema + Health |
| **5** | Remaining + Supporting | 11 | 10 | All designer/supporting pages |
| **6** | Auth + Polish + QA | 8 | 7 | Auth pages + final testing |

**Total**: 57.5 hours across 6 weeks = 1.9 hrs/day average

---

## Pattern Library Reference

### Colors (Forced Dark Mode)
```jsx
// Backgrounds
bg-black          // Page background
bg-gray-900       // Card background (resting)
bg-gray-800       // Card background (hover/elevated)

// Borders
border-gray-700   // Standard borders (#272727 after update)
border-gray-800   // Subtle dividers

// Text
text-white        // Primary text
text-gray-300     // Body text
text-gray-400     // Labels
text-gray-500     // Metadata
```

### Typography
```jsx
// Page Titles
className="text-4xl font-normal tracking-tight text-white"

// Section Headers
className="text-2xl font-normal text-white"

// Body Text
className="text-base text-gray-400"

// Metadata/Labels
className="text-xs font-mono uppercase tracking-wide text-gray-500"

// Numbers (always monospace)
className="text-lg font-mono text-white"
```

### Buttons
```jsx
// Primary
<Button variant="default">Save</Button>
// → bg-white text-black hover:opacity-90

// Secondary
<Button variant="secondary">Cancel</Button>
// → border border-gray-700 text-white hover:bg-gray-900

// Ghost (tertiary)
<Button variant="ghost">Options</Button>
// → text-gray-400 hover:text-white

// Destructive
<Button variant="destructive">Delete</Button>
// → bg-error text-white
```

### Spacing
```jsx
// Between page sections
className="space-y-8"  // 64px

// Between cards in a section
className="space-y-4"  // 32px

// Between form fields
className="space-y-3"  // 24px

// Internal card spacing
className="p-6"        // 48px padding
```

### Grids
```jsx
// 3-column (marketing pages)
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// 6-column (dense lists - suppliers)
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"

// 2-column (settings, detail pages)
className="grid grid-cols-1 lg:grid-cols-2 gap-8"
```

---

## Common Mistakes to Avoid

1. **Don't use `dark:` variants** - Forced dark mode only
2. **Don't use Heroicons** - Use `lucide-react` only
3. **Don't use gradient buttons** - Use `bg-white text-black` instead
4. **Don't use `<table>`** - Use card-based rows for better mobile UX
5. **Don't forget `font-mono`** - All numbers need this class
6. **Don't skip PageHeader** - Every list/detail page needs it
7. **Don't use `#2E2E2E` borders** - Update to `#272727` first

---

## Testing Checklist

After each page redesign:

- [ ] All icons are from `lucide-react`
- [ ] No `dark:` color variants remain
- [ ] All borders use `#272727` (after config update)
- [ ] All numbers use `font-mono`
- [ ] PageHeader present (if applicable)
- [ ] SearchBar present (if list page)
- [ ] Responsive on mobile (test 375px)
- [ ] Hover states smooth (150-300ms)
- [ ] Empty state handled gracefully

---

## Files You'll Touch Most

**Components** (build these first):
- `/frontend/tailwind.config.js` - Border color update
- `/frontend/src/components/ui/CornerHover.jsx` - New
- `/frontend/src/components/ui/button.jsx` - Extend variants
- `/frontend/src/components/ui/PageHeader.jsx` - New
- `/frontend/src/components/ui/StatCard.jsx` - New
- `/frontend/src/components/ui/SearchBar.jsx` - New

**Pages** (this week's focus):
- `/frontend/src/pages/ContactsPage.jsx`
- `/frontend/src/pages/SuppliersPage.jsx`
- `/frontend/src/pages/ActiveJobsPage.jsx`
- `/frontend/src/pages/PriceBooksPage.jsx`
- `/frontend/src/pages/DocumentsPage.jsx`

---

## Need Help?

**Full details**: See `/Users/jakebaird/trapid/REDESIGN_STATUS.md`
**LayerZero patterns**: See `/Users/jakebaird/trapid/LAYERZERO_DESIGN_ANALYSIS.md`
**Design tokens**: See `/Users/jakebaird/trapid/frontend/MIDDAY_DESIGN_TOKENS.md`

---

## Success = Simple Formula

1. **Build 6 foundation components** (TODAY)
2. **Apply to list pages first** (THIS WEEK)
3. **Move to high-traffic detail pages** (WEEK 2)
4. **Finish with supporting pages** (WEEKS 3-5)
5. **Polish and test** (WEEK 6)

**The key**: Resist the urge to redesign everything at once. Do foundation first, then apply systematically group by group. 2 hours/day for 6 weeks = 40 polished pages.

You've got this!

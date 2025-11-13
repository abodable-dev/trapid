# Midday Design Tokens - Trapid Reference

Use this as your source of truth when bringing in Subframe components or creating new UI.

## Color System

### Backgrounds
```css
--background: #000000           /* Pure black - main app background */
--background-secondary: #1A1A1A /* Gray-900 - cards, panels */
--background-tertiary: #2A2A2A  /* Gray-800 - hover states */
```

**Tailwind Classes:**
- `bg-black` - App background
- `bg-gray-900` - Cards, modals, dropdowns
- `bg-gray-800` - Subtle backgrounds, hover states

### Borders
```css
--border: #2E2E2E          /* Gray-800 - default borders */
--border-subtle: #1A1A1A   /* Gray-900 - very subtle borders */
```

**Tailwind Classes:**
- `border-gray-800` - Standard borders (cards, inputs, dividers)
- `border-gray-700` - Hover state borders
- `border-gray-900` - Subtle inner borders

### Text Colors
```css
--foreground: #FFFFFF              /* White - primary text */
--foreground-secondary: #A0A0A0    /* Gray-400 - secondary text */
--foreground-muted: #6B6B6B        /* Gray-600 - tertiary text */
```

**Tailwind Classes:**
- `text-white` or `text-foreground` - Headings, primary text
- `text-gray-400` or `text-foreground-secondary` - Labels, secondary text
- `text-gray-500` or `text-foreground-muted` - Captions, tertiary text

### Status Colors
```css
--success: #22C55E   /* Green - success states */
--warning: #F59E0B   /* Amber - warning states */
--error: #EF4444     /* Red - error states */
--info: #3B82F6      /* Blue - info states */
```

**Tailwind Classes:**
- `text-success` / `bg-success` / `border-success`
- `text-warning` / `bg-warning` / `border-warning`
- `text-error` / `bg-error` / `border-error`
- `text-info` / `bg-info` / `border-info`

---

## Typography

### Font Families
```css
--font-sans: 'Geist', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;
```

**Tailwind Classes:**
- `font-sans` - Default for all text
- `font-mono` - **USE FOR ALL NUMBERS** (amounts, dates, IDs, counts)

### Font Sizes
```javascript
{
  xs: '12px',    // Labels, captions, small UI text
  sm: '14px',    // Secondary text, nav items
  base: '16px',  // Body text (default)
  lg: '18px',    // Large body text
  xl: '20px',    // Small headings
  '2xl': '24px', // H4
  '3xl': '30px', // H3
  '4xl': '36px', // H2
}
```

**Usage Pattern:**
- Navigation items: `text-xs`
- Form labels: `text-sm`
- Body text: `text-base`
- Card titles: `text-sm font-semibold`
- Page titles: `text-2xl` or `text-3xl font-bold`
- Numbers/Stats: `text-3xl font-mono font-semibold`

---

## Spacing (8px Grid)

```javascript
{
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
}
```

**Common Patterns:**
- Gap between elements: `gap-2` (8px), `gap-3` (12px), `gap-4` (16px)
- Component padding: `p-4` (16px), `p-6` (24px)
- Section spacing: `space-y-6` (24px), `space-y-8` (32px)

---

## Component Patterns

### Buttons
```jsx
// Primary (white bg, black text)
<button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all">
  Save
</button>

// Secondary (border, transparent bg)
<button className="bg-transparent border border-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors">
  Cancel
</button>

// Ghost (no border, transparent)
<button className="bg-transparent text-gray-400 px-4 py-2 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-colors">
  Edit
</button>
```

### Cards
```jsx
<div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
  {/* Card content */}
</div>
```

### Inputs
```jsx
// Minimal bottom-border style
<input className="w-full bg-transparent border-b border-gray-700 focus:border-white py-2 text-white placeholder:text-gray-500 outline-none transition-colors" />

// Standard bordered input
<input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder:text-gray-500 focus:border-white outline-none transition-colors" />
```

### Status Badges
```jsx
// Success
<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-success/10 text-success border border-success/20">
  Completed
</span>

// Warning
<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-warning/10 text-warning border border-warning/20">
  Pending
</span>

// Error
<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-error/10 text-error border border-error/20">
  Failed
</span>
```

---

## Layout Patterns

### Container Max Widths
```jsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Page Header
```jsx
<div className="mb-6">
  <h1 className="text-3xl font-bold text-foreground">Page Title</h1>
  <p className="text-foreground-secondary mt-1">Page description</p>
</div>
```

### Stat Cards
```jsx
<div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-foreground-secondary">Total Revenue</span>
    <span className="text-xs text-success">↑ 12%</span>
  </div>
  <div className="text-3xl font-mono font-semibold text-foreground">
    $23,750.00
  </div>
  <div className="text-xs text-foreground-muted mt-1">
    vs last month
  </div>
</div>
```

---

## Transitions & Animations

### Standard Transition
```css
transition-all duration-200
```

### Color Transition (faster)
```css
transition-colors duration-200
```

### Hover States
```jsx
// Button
hover:opacity-90 active:scale-[0.98]

// Card
hover:border-gray-700

// Text
hover:text-white

// Background
hover:bg-gray-900/50
```

---

## Subframe Integration Guide

### When Importing from Subframe:

1. **Replace Subframe Colors:**
   - Subframe primary → `bg-white text-black` (our primary button)
   - Subframe secondary → `bg-transparent border-gray-700`
   - Subframe backgrounds → `bg-gray-900`
   - Subframe borders → `border-gray-800`
   - Subframe text → `text-white` or `text-gray-400`

2. **Replace Subframe Fonts:**
   - All text → `font-sans`
   - All numbers → `font-mono`

3. **Replace Subframe Spacing:**
   - Convert to 8px grid (1, 2, 3, 4, 6, 8, 12)

4. **Remove Subframe Shadows:**
   - Replace `shadow-lg` with `border border-gray-800`
   - Midday uses borders, not shadows

5. **Add Transitions:**
   - Add `transition-colors duration-200` to interactive elements

### Example Conversion:

**Subframe Output:**
```jsx
<button className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-lg">
  Click me
</button>
```

**Converted to Midday:**
```jsx
<button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-200">
  Click me
</button>
```

---

## Icons - Lucide React

### Icon System

Trapid uses **Lucide React** for all icons. Lucide provides a consistent, beautiful icon set with proper sizing and styling.

### Installation

```bash
npm install lucide-react
```

### Importing Icons

```jsx
import { Home, Settings, User, Plus, Upload, X } from 'lucide-react'
```

### Icon Sizing Standards

Use these standardized sizes across the application:

| Size Class | Dimensions | Usage | Example |
|-----------|------------|-------|---------|
| `w-3 h-3` or `.icon-xs` | 12px | Very small icons, badges | Badge icons |
| `w-4 h-4` or `.icon-sm` | 16px | Compact UI, nav items, buttons | Sidebar nav, button icons |
| `w-5 h-5` or `.icon-md` | 20px | Standard size (default) | Topbar buttons, form icons |
| `w-6 h-6` or `.icon-lg` | 24px | Large buttons, headers | Mobile menu, empty states |
| `w-8 h-8` or `.icon-xl` | 32px | Feature icons, large UI | Dashboard stats, hero sections |

### Usage Examples

```jsx
// Navigation icons (small, compact)
<Home className="w-4 h-4" />
<Settings className="w-4 h-4" />

// Standard buttons and forms
<Plus className="w-5 h-5" />
<Upload className="w-5 h-5" />

// Large feature icons
<Table className="w-12 h-12 text-foreground-muted" />

// Using utility classes
<Home className="icon-sm" />
<Plus className="icon-md" />
```

### Common Icons Reference

| Icon Name | Component | Use Case |
|-----------|-----------|----------|
| `Home` | `<Home />` | Dashboard, home navigation |
| `Briefcase` | `<Briefcase />` | Jobs, projects |
| `BookOpen` | `<BookOpen />` | Price books, documentation |
| `Users` | `<Users />` | Contacts, team |
| `Settings` | `<Settings />` | Settings, configuration |
| `Upload` | `<Upload />` | File upload, import |
| `Plus` | `<Plus />` | Create, add new |
| `X` | `<X />` | Close, dismiss |
| `Menu` | `<Menu />` | Mobile menu toggle |
| `Bell` | `<Bell />` | Notifications |
| `User` | `<User />` | Profile, user account |
| `LogOut` | `<LogOut />` | Sign out |
| `ChevronLeft` | `<ChevronLeft />` | Navigation, collapse |
| `ChevronRight` | `<ChevronRight />` | Navigation, expand |
| `ChevronDown` | `<ChevronDown />` | Dropdowns, expand |
| `Table` | `<Table />` | Tables, data grids |
| `BarChart3` | `<BarChart3 />` | Charts, analytics |
| `Clock` | `<Clock />` | Time, last updated |

### Migration from Heroicons

When converting from Heroicons to Lucide:

| Heroicons | Lucide React | Notes |
|-----------|-------------|-------|
| `Bars3Icon` | `Menu` | Mobile menu |
| `XMarkIcon` | `X` | Close button |
| `HomeIcon` | `Home` | Dashboard |
| `Cog6ToothIcon` | `Settings` | Settings |
| `BellIcon` | `Bell` | Notifications |
| `UserIcon` | `User` | Profile |
| `ArrowRightOnRectangleIcon` | `LogOut` | Sign out |
| `ChevronLeftIcon` | `ChevronLeft` | Navigate left |
| `ChevronRightIcon` | `ChevronRight` | Navigate right |
| `ChevronDownIcon` | `ChevronDown` | Dropdown |
| `PlusIcon` | `Plus` | Add/Create |
| `ArrowUpTrayIcon` | `Upload` | Upload/Import |
| `TableCellsIcon` | `Table` | Tables |
| `ChartBarIcon` | `BarChart3` | Charts |
| `ClockIcon` | `Clock` | Time |

### Styling Guidelines

- Always use `className` for sizing
- Prefer Tailwind utility classes (`w-4 h-4`) over inline styles
- Use color utilities: `text-foreground`, `text-foreground-secondary`, `text-gray-400`
- Icons inherit text color by default

```jsx
// Good
<Home className="w-4 h-4 text-foreground-secondary" />

// Avoid
<Home style={{ width: '16px', height: '16px' }} />
```

### Accessibility

- Use `aria-hidden="true"` for decorative icons
- Add descriptive text for screen readers when needed

```jsx
<button>
  <span className="sr-only">Close sidebar</span>
  <X aria-hidden="true" className="w-5 h-5" />
</button>
```

---

## Quick Reference

### Most Common Classes

**Backgrounds:**
- App: `bg-black`
- Cards: `bg-gray-900`
- Hover: `bg-gray-900/50`

**Borders:**
- Default: `border-gray-800`
- Hover: `border-gray-700`

**Text:**
- Primary: `text-white`
- Secondary: `text-gray-400`
- Muted: `text-gray-500`

**Buttons:**
- Primary: `bg-white text-black hover:opacity-90`
- Secondary: `border border-gray-700 text-white hover:bg-gray-900`
- Ghost: `text-gray-400 hover:bg-gray-900 hover:text-white`

**Spacing:**
- Between items: `gap-4`
- Inside containers: `p-6`
- Between sections: `space-y-6`

**Rounded Corners:**
- Standard: `rounded-lg` (8px)
- Small: `rounded-md` (6px)

**Transitions:**
- All: `transition-all duration-200`
- Colors: `transition-colors duration-200`

---

## Component Library Reference

You've already built these - use them!

Located in: `/frontend/src/components/ui/`

- `<Button>` - variants: default, outline, ghost, destructive
- `<Card>` - with CardHeader, CardTitle, CardContent, CardFooter
- `<Input>` - minimal text input
- `<Badge>` - status badges (success, warning, error, info)
- `<Sheet>` - slide-out panel (use for forms!)
- `<Dialog>` - center modal
- `<Table>` - table components

**Always use these instead of recreating!**

---

## Dark Mode Note

You're using **forced dark mode** - no light mode toggle needed. All components should be designed for dark only:
- Pure black backgrounds (#000000)
- White text as default
- Gray-800 borders
- No light mode variants needed

---

## Questions?

Reference:
1. This file
2. `/frontend/tailwind.config.js` - full token definitions
3. `/frontend/src/components/ui/` - actual component implementations
4. Midday.ai website for visual inspiration

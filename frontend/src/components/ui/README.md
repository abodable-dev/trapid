# Trapid UI Component Library

Midday.ai-inspired component library built with React, Radix UI, and Tailwind CSS.

## Overview

This component library follows the Midday.ai design system with:
- Pure black backgrounds (`#000000`)
- Transparent components with subtle borders
- Semantic color tokens from `tailwind.config.js`
- Accessible primitives from Radix UI
- Class variance authority (CVA) for variants

## Installation

All dependencies are already installed:
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-select`
- `@radix-ui/react-slot`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

## Components

### Button

Versatile button component with multiple variants and sizes.

```jsx
import { Button } from '@/components/ui/button'

// Variants
<Button>Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">+</Button>

// As child (polymorphic)
<Button asChild>
  <a href="/link">Link Button</a>
</Button>
```

### Input

Minimal text input with Midday styling.

```jsx
import { Input } from '@/components/ui/input'

<Input type="text" placeholder="Enter name" />
<Input type="email" placeholder="you@example.com" />
<Input type="password" placeholder="Password" />
<Input disabled placeholder="Disabled" />
```

### Badge

Status indicators with transparent backgrounds and colored borders.

```jsx
import { Badge } from '@/components/ui/badge'

// Semantic variants
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">Info</Badge>

// Legacy color support
<Badge variant="green">Green</Badge>
<Badge variant="red">Red</Badge>
<Badge variant="yellow">Yellow</Badge>
```

### Card

Container component for grouping content.

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Dialog

Center modal for confirmations and alerts.

```jsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to proceed?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Sheet (IMPORTANT)

**This is Midday's primary pattern for create/edit forms.**

Slide-out panel from right side (default 520px width).

```jsx
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger asChild>
    <Button>Create Contact</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Create New Contact</SheetTitle>
      <SheetDescription>
        Fill out the form below
      </SheetDescription>
    </SheetHeader>
    <form className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" placeholder="john@example.com" />
      </div>
    </form>
    <SheetFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Create</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>

// Can slide from any side
<SheetContent side="left">...</SheetContent>
<SheetContent side="top">...</SheetContent>
<SheetContent side="bottom">...</SheetContent>
```

### Table

Minimal table components for data display. Use with TanStack React Table.

```jsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell className="text-right">$1,200.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Utility Function

### cn()

Combines class names using `clsx` and merges Tailwind classes with `tailwind-merge`.

```jsx
import { cn } from '@/lib/utils'

// Prevents Tailwind class conflicts
const className = cn(
  'bg-white text-black', // base classes
  isActive && 'bg-blue-600 text-white', // conditional
  props.className // user overrides
)
// Result: 'bg-blue-600 text-white' (merged correctly)
```

## Design Tokens

All components use semantic tokens from `tailwind.config.js`:

**Colors:**
- `bg-background` - Pure black (#000000)
- `bg-gray-900` - Card backgrounds (#121212)
- `border-border` - Subtle borders (#2E2E2E)
- `text-foreground` - White text (#FFFFFF)
- `text-foreground-secondary` - Muted text (#B8B8B8)

**Status Colors:**
- `text-success` / `border-success` - Green (#10B981)
- `text-warning` / `border-warning` - Yellow (#F59E0B)
- `text-error` / `border-error` - Red (#EF4444)
- `text-info` / `border-info` - Blue (#3B82F6)

## Accessibility

All components are built on Radix UI primitives which provide:
- Keyboard navigation (Tab, Escape, Arrow keys)
- Screen reader support (ARIA attributes)
- Focus management
- Disabled state handling

## Testing

Visit `/components-demo` to see all components in action.

```bash
npm run dev
# Open http://localhost:5173/components-demo
```

## Migration Guide

### Old Badge → New Badge

```jsx
// Old (still works via legacy variants)
<Badge color="green">Active</Badge>

// New (preferred)
<Badge variant="success">Active</Badge>
```

### Headless UI → Radix UI

```jsx
// Old Headless UI Dialog
import { Dialog } from '@headlessui/react'

// New Radix UI Dialog
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
```

## Best Practices

1. **Use Sheet for Forms**: Replace modals with right-side sheets for create/edit flows
2. **Use Semantic Variants**: Prefer `variant="success"` over `variant="green"`
3. **Use cn() for Classes**: Always use `cn()` when combining classes
4. **Use asChild for Polymorphism**: Use `asChild` prop to render as different element
5. **Follow Token System**: Use semantic tokens (`text-foreground`) not hardcoded colors

## Next Steps

### Phase 3: Refactor Existing Pages

1. Replace existing modals with Sheet components
2. Update buttons to use new Button component
3. Migrate tables to use Table components
4. Replace inline badges with new Badge component

### Recommended Order:
1. **Dashboard** - Simple cards and buttons
2. **ContactsPage** - Sheet for create/edit forms
3. **TablePage** - New table components
4. **JobDetailPage** - Cards, badges, buttons

## Resources

- [Radix UI Documentation](https://www.radix-ui.com)
- [CVA Documentation](https://cva.style)
- [Midday.ai GitHub](https://github.com/midday-ai/midday)
- [Tailwind CSS](https://tailwindcss.com)

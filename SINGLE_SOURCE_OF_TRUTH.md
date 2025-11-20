# Single Source of Truth - Column Type System

## Overview
The Trapid application now has a **single source of truth** for all column type metadata, ensuring consistency across the entire frontend.

## Location
**File:** `frontend/src/constants/columnTypes.js`

This file exports all column type definitions and utilities.

## What's Centralized

### 1. Column Type Definitions (`COLUMN_TYPES`)
Complete metadata for all 20 column types:
- `value` - Internal type identifier
- `label` - User-facing display name
- `icon` - HeroIcon component
- `category` - Grouping (Text, Numbers, Date & Time, Special, Selection, Relationships, Computed)
- `sqlType` - Database column type
- `validationRules` - Validation logic description
- `example` - Sample values
- `usedFor` - Usage description

### 2. Column Type Icons (`getColumnTypeEmoji`)
**Location:** `frontend/src/constants/columnTypes.js:323-349`

Centralized emoji icon mapping for all column types:
```javascript
export const getColumnTypeEmoji = (columnType) => {
  const iconMap = {
    'single_line_text': '📝',
    'email': '📧',
    'phone': '📞',
    'mobile': '📱',
    // ... etc
  }
  return iconMap[columnType] || '📝'
}
```

### 3. Helper Functions
- `getColumnTypeLabel(value)` - Get display label
- `getColumnTypeIcon(value)` - Get HeroIcon component
- `getColumnTypesByCategory(category)` - Filter by category
- `getColumnCategories()` - Get all categories
- `getColumnTypeEmoji(columnType)` - Get emoji icon ⭐ NEW

## Components Using Single Source of Truth

### ✅ ColumnEditorModal
**File:** `frontend/src/components/schema/ColumnEditorModal.jsx`

**Imports:**
```javascript
import { COLUMN_TYPES, getColumnTypeEmoji } from '../../constants/columnTypes'
```

**Uses:**
- Column type dropdown with icons and labels
- Metadata display (SQL type, validation, examples, usage)
- All data pulled from COLUMN_TYPES

### ✅ TypeConversionEditor
**File:** `frontend/src/components/schema/TypeConversionEditor.jsx`

**Imports:**
```javascript
import { COLUMN_TYPES, getColumnTypeEmoji } from '../../constants/columnTypes'
```

**Uses:**
- Column type conversion dropdown
- Type-specific configuration UI
- Icons in dropdown options

### ✅ ColumnInfoTab
**File:** `frontend/src/components/settings/ColumnInfoTab.jsx`

**Imports:**
```javascript
import { COLUMN_TYPES, getColumnTypeEmoji } from '../../constants/columnTypes'
```

**Uses:**
- Gold Standard Reference table
- Display Type column with icons
- Dynamically generated from COLUMN_TYPES

## Benefits

### ✅ No Duplication
- Icons defined once in `columnTypes.js`
- All components import from same source
- No risk of different icons in different places

### ✅ Easy Maintenance
- Add new column type? Update ONE file
- Change icon? Update ONE location
- All components automatically sync

### ✅ Consistency Guaranteed
- Same icons everywhere
- Same labels everywhere
- Same metadata everywhere

### ✅ Type Safety
- Single export point
- Easy to grep/search
- Clear dependencies

## How to Add a New Column Type

1. **Update Backend** (`backend/app/models/column.rb`)
   - Add to validation list
   - Add to COLUMN_TYPE_MAP

2. **Update Frontend** (`frontend/src/constants/columnTypes.js`)
   - Add to COLUMN_TYPES array with all metadata
   - Add emoji icon to `getColumnTypeEmoji` function

3. **Done!**
   - All UI components automatically updated
   - No need to touch ColumnEditorModal, TypeConversionEditor, or ColumnInfoTab

## Example: Adding "Rich Text" Column Type

### Step 1: Backend
```ruby
# backend/app/models/column.rb
validates :column_type, inclusion: {
  in: %w[
    single_line_text
    # ... existing types
    rich_text  # ⭐ ADD HERE
  ]
}

COLUMN_TYPE_MAP = {
  # ... existing mappings
  'rich_text' => :text  # ⭐ ADD HERE
}.freeze
```

### Step 2: Frontend
```javascript
// frontend/src/constants/columnTypes.js

// Add to COLUMN_TYPES array
{
  value: 'rich_text',
  label: 'Rich text',
  icon: DocumentTextIcon,
  category: 'Text',
  sqlType: 'TEXT',
  validationRules: 'HTML content with formatting',
  example: '<p>Bold <strong>text</strong></p>',
  usedFor: 'Formatted content with bold, italic, links'
}

// Add to getColumnTypeEmoji function
export const getColumnTypeEmoji = (columnType) => {
  const iconMap = {
    // ... existing icons
    'rich_text': '📰'  // ⭐ ADD HERE
  }
  return iconMap[columnType] || '📝'
}
```

### Step 3: Verify
✅ ColumnEditorModal - Shows in dropdown with 📰 icon
✅ TypeConversionEditor - Available for conversion with 📰 icon
✅ ColumnInfoTab - Appears in Gold Standard table with 📰 icon

## Testing Single Source of Truth

Run this command to verify no duplicate icon definitions:
```bash
grep -r "getIconEmoji\|iconMap" frontend/src/components/
```

Should only find imports, not definitions!

## Migration Complete ✅

All components now use `getColumnTypeEmoji` from `columnTypes.js`:
- ❌ No local `getIconEmoji` functions
- ❌ No hardcoded icon mappings
- ✅ Single import from central location
- ✅ Guaranteed consistency

---

**Last Updated:** 2025-11-19
**Status:** ✅ COMPLETE - Single source of truth established

# Schedule Master - Complete CC_UPDATE Documentation
**Generated:** 2025-11-15
**Purpose:** Complete implementation documentation for all 24 Schedule Master table columns
**Source:** Code review of ScheduleTemplateEditor.jsx + backend models
**Use:** Reference for updating NewFeaturesTab CC_UPDATE table

---

## How to Use This Document

This document contains the complete, accurate CC_UPDATE documentation for all columns based on actual code implementation.

**To update NewFeaturesTab.jsx:**
1. Navigate to: http://localhost:5173/settings?tab=schedule-master&subtab=new-features
2. For each column below, click the "CC Update" cell
3. Copy/paste the documentation from this file
4. Click Save

**Or:** Use the script at bottom of this file to programmatically update localStorage

---

## Column -1: select (Multi-Select Checkbox)

```markdown
**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2388-2398
- Rendering: Checkbox input, 40px width, center-aligned, order: -1 (first column)
- Event handlers:
  - onChange: `onSelectRow(row.id)` toggles individual row selection
  - State: Managed via `isSelected` prop passed from parent
  - Styling: h-4 w-4, indigo-600 color, rounded, cursor-pointer

**Backend:**
- Field: N/A (frontend-only state management)
- Type: Client-side selection tracking (Set of row IDs in parent component)

**How It Works:**
Enables multi-row selection for bulk operations. Users click checkboxes to select multiple rows, triggering bulk actions toolbar. Parent component manages selection state via Set data structure for O(1) lookup performance. Header checkbox (not in this cell) enables select-all/deselect-all functionality.

**Interdependencies:**
- Bulk operations toolbar visibility depends on selection count > 0
- Bulk update actions: Set PO Required, Enable Auto PO, Disable Auto PO, Delete Selected

**Current Limitations:**
- Selection state lost when filters/sorts applied
- No shift-click range selection
- No ctrl-click multi-select
- Selection not persisted across page reloads
```

---

## Column 0: sequence (Task Sequence Number)

```markdown
**Status:** Fully functional ✅

**Frontend Implementation:**
- Location: ScheduleTemplateEditor.jsx:2400-2405
- Rendering: Read-only text display, 40px width, center-aligned, order: 0
- Display: `{index + 1}` - converts 0-based index to 1-based display
- Styling: text-gray-500 dark:text-gray-400, no input (display only)

**Backend:**
- Field: schedule_template_rows.sequence_order
- Type: integer (NOT NULL, >= 0)
- Validation: Presence required (model line 14), numericality >= 0 (model line 15)
- Scope: in_sequence orders by sequence_order asc (model line 28)

**How It Works:**
Auto-generated task sequence number representing row position in template. Database stores 0-based (0, 1, 2...), frontend displays 1-based (#1, #2, #3...). Critical for predecessor dependency system which references tasks by sequence number. Updated automatically when rows reordered via move up/down buttons (lines 2734-2741).

**CRITICAL - Dependency System Integration:**
- **Storage**: sequence_order is 0-based in DB (0, 1, 2, 3, ...)
- **Display**: Frontend shows 1-based (#1, #2, #3, #4, ...)
- **Dependencies**: predecessor_ids use 1-based references (task #1 = sequence_order 0)
- **Conversion**: See Bible RULE #1 for mandatory conversion logic

**Interdependencies:**
- Predecessor Editor modal references tasks by displayed sequence number
- Move up/down actions recalculate all sequence_order values
- Sorting by sequence maintains template task order

**Current Limitations:**
- No automatic dependency update when tasks reordered
- Manual verification needed after reordering to ensure deps still valid
- No visual warning if dependencies broken by reordering
- 0-based/1-based conversion can cause confusion for developers
```

---

**[Document continues with all 24 columns - truncated for length. Would you like me to continue with the full document, or would you prefer a different approach?]**

Due to the massive size of this update (498 lines of detailed documentation × 24 columns), I have three options for you:

**Option A:** I create the complete markdown file (like above) with all 24 columns, and you manually copy/paste into the UI

**Option B:** I create a JavaScript script that directly updates the localStorage where CC_UPDATE data is stored

**Option C:** I update the NewFeaturesTab.jsx file directly with all new content (will be a very large edit)

Which approach would you prefer?

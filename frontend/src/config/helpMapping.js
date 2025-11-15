// Page-to-Chapter Mapping for Contextual Help
// Maps React Router paths to User Manual chapter numbers

export const PAGE_HELP_MAPPING = {
  // Authentication & Users (Chapter 1)
  '/login': { chapter: 1, section: 'login' },
  '/signup': { chapter: 1, section: 'signup' },
  '/profile': { chapter: 1, section: 'profile' },
  '/users': { chapter: 1, section: 'users' },

  // System Administration (Chapter 2)
  '/settings': { chapter: 2, section: 'overview' },
  '/settings/company': { chapter: 2, section: 'company' },
  '/settings/users': { chapter: 2, section: 'users' },

  // Contacts & Relationships (Chapter 3)
  '/contacts': { chapter: 3, section: 'overview' },
  '/contacts/new': { chapter: 3, section: 'creating' },
  '/contacts/:id': { chapter: 3, section: 'details' },

  // Price Books & Suppliers (Chapter 4)
  '/settings/pricebooks': { chapter: 4, section: 'overview' },
  '/settings/pricebooks/import': { chapter: 4, section: 'import' },
  '/settings/suppliers': { chapter: 4, section: 'suppliers' },

  // Jobs & Construction Management (Chapter 5)
  '/jobs': { chapter: 5, section: 'overview' },
  '/jobs/new': { chapter: 5, section: 'creating' },
  '/jobs/:id': { chapter: 5, section: 'details' },
  '/jobs/:id/setup': { chapter: 5, section: 'setup' },
  '/jobs/:id/schedule': { chapter: 5, section: 'schedule' },

  // Estimates & Quoting (Chapter 6)
  '/jobs/:id/estimates': { chapter: 6, section: 'overview' },
  '/jobs/:id/estimates/new': { chapter: 6, section: 'creating' },
  '/jobs/:id/estimates/:estimateId': { chapter: 6, section: 'details' },

  // AI Plan Review (Chapter 7)
  '/jobs/:id/ai-review': { chapter: 7, section: 'overview' },

  // Purchase Orders (Chapter 8)
  '/jobs/:id/purchase-orders': { chapter: 8, section: 'overview' },
  '/jobs/:id/purchase-orders/new': { chapter: 8, section: 'creating' },
  '/jobs/:id/purchase-orders/:poId': { chapter: 8, section: 'details' },

  // Gantt & Schedule Master (Chapter 9)
  '/jobs/:id/gantt': { chapter: 9, section: 'overview' },
  '/schedule': { chapter: 9, section: 'master' },

  // Project Tasks & Checklists (Chapter 10)
  '/jobs/:id/tasks': { chapter: 10, section: 'overview' },

  // Weather & Public Holidays (Chapter 11)
  '/weather': { chapter: 11, section: 'overview' },

  // OneDrive Integration (Chapter 12)
  '/jobs/:id/files': { chapter: 12, section: 'overview' },
  '/settings/onedrive': { chapter: 12, section: 'setup' },

  // Outlook/Email Integration (Chapter 13)
  '/settings/outlook': { chapter: 13, section: 'setup' },

  // Chat & Communications (Chapter 14)
  '/chat': { chapter: 14, section: 'overview' },

  // Xero Accounting Integration (Chapter 15)
  '/settings/xero': { chapter: 15, section: 'setup' },
  '/xero/sync': { chapter: 15, section: 'sync' },

  // Payments & Financials (Chapter 16)
  '/jobs/:id/payments': { chapter: 16, section: 'overview' },

  // Workflows & Automation (Chapter 17)
  '/settings/workflows': { chapter: 17, section: 'overview' },

  // Custom Tables & Formulas (Chapter 18)
  '/custom-tables': { chapter: 18, section: 'overview' },
  '/settings/custom-tables': { chapter: 18, section: 'setup' },

  // Documentation Page
  '/documentation': { chapter: 0, section: 'overview' },
}

/**
 * Get help chapter for current page
 * @param {string} pathname - Current React Router pathname
 * @returns {object|null} - { chapter: number, section: string } or null
 */
export function getHelpForPage(pathname) {
  // Try exact match first
  if (PAGE_HELP_MAPPING[pathname]) {
    return PAGE_HELP_MAPPING[pathname]
  }

  // Try pattern match for dynamic routes (e.g., /jobs/123 matches /jobs/:id)
  for (const [pattern, help] of Object.entries(PAGE_HELP_MAPPING)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$')
      if (regex.test(pathname)) {
        return help
      }
    }
  }

  // Default to overview if no match
  return { chapter: 0, section: 'overview' }
}

/**
 * Get chapter name from chapter number
 * @param {number} chapterNumber
 * @returns {string}
 */
export function getChapterName(chapterNumber) {
  const chapterNames = {
    0: 'Overview',
    1: 'Authentication & Users',
    2: 'System Administration',
    3: 'Contacts & Relationships',
    4: 'Price Books & Suppliers',
    5: 'Jobs & Construction Management',
    6: 'Estimates & Quoting',
    7: 'AI Plan Review',
    8: 'Purchase Orders',
    9: 'Gantt & Schedule Master',
    10: 'Project Tasks & Checklists',
    11: 'Weather & Public Holidays',
    12: 'OneDrive Integration',
    13: 'Outlook/Email Integration',
    14: 'Chat & Communications',
    15: 'Xero Accounting Integration',
    16: 'Payments & Financials',
    17: 'Workflows & Automation',
    18: 'Custom Tables & Formulas',
  }

  return chapterNames[chapterNumber] || 'Help'
}

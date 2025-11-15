# TRAPID USER MANUAL

**Version:** 1.0.0
**Last Updated:** 2025-11-16
**Audience:** End Users (Non-Technical)

---

## Welcome to Trapid!

This manual will guide you through using Trapid's construction management features step-by-step.

**For Developers:**
- 📖 See [TRAPID_BIBLE.md](TRAPID_BIBLE.md) for technical rules
- 📕 See [TRAPID_LEXICON.md](TRAPID_LEXICON.md) for bug history

---

## Table of Contents

**Chapters follow your workflow from setup → job completion:**

- [Chapter 0: Getting Started](#chapter-0-getting-started)
- [Chapter 1: Logging In & User Profiles](#chapter-1-logging-in--user-profiles)
- [Chapter 2: Company Settings](#chapter-2-company-settings)
- [Chapter 3: Managing Contacts](#chapter-3-managing-contacts)
- [Chapter 4: Setting Up Price Books](#chapter-4-setting-up-price-books)
- [Chapter 5: Creating a New Job](#chapter-5-creating-a-new-job)
- [Chapter 6: Importing & Managing Estimates](#chapter-6-importing--managing-estimates)
- [Chapter 7: AI-Powered Plan Review](#chapter-7-ai-powered-plan-review)
- [Chapter 8: Generating Purchase Orders](#chapter-8-generating-purchase-orders)
- [Chapter 9: Building Construction Schedules](#chapter-9-building-construction-schedules)
- [Chapter 10: Daily Tasks & Checklists](#chapter-10-daily-tasks--checklists)
- [Chapter 11: Weather Tracking & Delays](#chapter-11-weather-tracking--delays)
- [Chapter 12: OneDrive File Management](#chapter-12-onedrive-file-management)
- [Chapter 13: Email Integration](#chapter-13-email-integration)
- [Chapter 14: Team Chat & SMS](#chapter-14-team-chat--sms)
- [Chapter 15: Xero Accounting Sync](#chapter-15-xero-accounting-sync)
- [Chapter 16: Payment Tracking](#chapter-16-payment-tracking)
- [Chapter 17: Workflow Automation](#chapter-17-workflow-automation)
- [Chapter 18: Custom Data Tables](#chapter-18-custom-data-tables)

---

# Chapter 0: Getting Started

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 0 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 0 (Developers)  │
└─────────────────────────────────────────────────┘

## What is Trapid?

Trapid is a comprehensive construction management platform that helps you:
- ✅ Manage jobs from quote to completion
- ✅ Create and track construction schedules
- ✅ Generate purchase orders automatically
- ✅ Sync with your accounting software (Xero)
- ✅ Collaborate with your team
- ✅ Track project financials

## Quick Start (5 Minutes)

1. **Log in** to Trapid
2. **Set up your company** (Settings → Company)
3. **Add contacts** (customers and suppliers)
4. **Create your first job**
5. **Import an estimate** or create one manually

**Ready to dive in?** Jump to [Chapter 1](#chapter-1-logging-in--user-profiles)

---

# Chapter 1: Logging In & User Profiles

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 1 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 1 (Developers)  │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## Getting Started with TRAPID

Welcome to TRAPID! This chapter covers everything you need to log in, manage your profile, and understand user roles.

---

## Logging In

### Method 1: Email & Password (Standard Login)

1. **Navigate to TRAPID:**
   - Open your web browser
   - Go to `https://app.trapid.com` (or your company's custom URL)

2. **Enter your credentials:**
   - **Email:** Your work email address
   - **Password:** Your secure password (12+ characters)

3. **Click "Log In"**
   - You'll be redirected to the dashboard
   - Your session lasts 24 hours (auto-logout after)

**First time?** Click "Sign Up" to create your account.

---

### Method 2: Login with Microsoft (Recommended)

**Best for:** Users with Microsoft 365 accounts (Outlook, OneDrive)

1. **Click "Login with Microsoft"** on the login page
2. **Authenticate with Microsoft:**
   - Enter your Microsoft email
   - Enter your Microsoft password
   - Approve TRAPID access (first time only)
3. **Automatic redirect** to TRAPID dashboard
4. **Bonus:** Automatic OneDrive and Outlook integration

**Why use Microsoft login?**
- ✅ One less password to remember
- ✅ Automatic OneDrive folder creation for jobs
- ✅ Outlook email integration ready to go
- ✅ Same security as your Microsoft account

---

## Creating Your Account

**To sign up:**

1. **Click "Sign Up"** on the login page
2. **Fill in your details:**
   - **Name:** Your full name (e.g., "John Smith")
   - **Email:** Work email address (must be unique)
   - **Password:** Create a strong password (see requirements below)
   - **Mobile Phone** (optional): For SMS notifications
3. **Click "Create Account"**
4. **You're in!** Default role is "User" (your admin can upgrade you)

### Password Requirements

Your password MUST include:
- ✅ At least 12 characters
- ✅ 1 uppercase letter (A-Z)
- ✅ 1 lowercase letter (a-z)
- ✅ 1 number (0-9)
- ✅ 1 special character (!@#$%^&*)

**Example strong passwords:**
- `MyTrapid2025!` ✅
- `Builder#Pass123` ✅
- `password123` ❌ (no uppercase, no special char)
- `Password123` ❌ (no special char)

**Pro Tip:** Use a passphrase like `Coffee&Donuts2025!` - easy to remember, very secure!

---

## Forgot Your Password?

**Don't worry, it happens!**

1. **Click "Forgot Password?"** on the login page
2. **Enter your email address**
3. **Click "Send Reset Link"**
4. **Check your email** (may take 1-2 minutes)
5. **Click the reset link** in the email
6. **Create a new password** (must meet requirements)
7. **Log in** with your new password

**Didn't receive the email?**
- Check your spam/junk folder
- Wait 5 minutes (server delays happen)
- Contact your system administrator
- Or ask an admin to reset your password manually

**Link expired?**
- Reset links expire after 2 hours for security
- Request a new link (it's instant!)

---

## Understanding User Roles

TRAPID has 6 user roles, each with different permissions:

### 👤 User (Default)
**What you can do:**
- View jobs and projects
- Access chat and documents
- View estimates and purchase orders
- Basic construction schedule viewing

**What you CAN'T do:**
- Create new jobs
- Approve purchase orders
- Edit construction schedules
- Manage users

**Best for:** General staff, office administrators

---

### 🔨 Builder
**What you can do:**
- Everything User can do, PLUS:
- View assigned construction tasks
- Update task progress
- Mark tasks complete
- Access builder-specific checklists

**What you CAN'T do:**
- Create schedules
- Approve POs
- Manage estimates

**Best for:** Site workers, tradespeople, construction crew

---

### 👷 Supervisor
**What you can do:**
- Everything User can do, PLUS:
- View all construction tasks on assigned projects
- Monitor progress across multiple tasks
- Access supervisor dashboard
- View builder assignments

**What you CAN'T do:**
- Edit schedules
- Approve POs
- Create estimates

**Best for:** Site supervisors, foremen, project leads

---

### 📊 Estimator
**What you can do:**
- Everything User can do, PLUS:
- Create and edit estimates
- Generate purchase orders from estimates
- Edit construction schedules
- Access price books

**What you CAN'T do:**
- Approve purchase orders (requires Manager/Admin)
- Create schedule templates

**Best for:** Estimators, project coordinators

---

### 📦 Product Owner
**What you can do:**
- Everything Estimator can do, PLUS:
- Create schedule templates
- Edit schedule templates
- View audit logs

**What you CAN'T do:**
- Manage users
- Change company settings

**Best for:** Project managers, senior estimators

---

### 👑 Admin
**What you can do:**
- **EVERYTHING** in the system, including:
- Manage users (create, edit, delete, change roles)
- Company settings and configuration
- All project management functions
- All construction management functions
- Full access to all data

**What you CAN'T do:**
- Nothing! Admins have complete access

**Best for:** System administrators, company owners, IT managers

---

## Managing Your Profile

### Viewing Your Profile

1. **Click your name** in the top right corner
2. **Select "My Profile"**
3. **View your details:**
   - Name
   - Email
   - Mobile phone
   - Role
   - Last login time

---

### Editing Your Profile

**You can change:**
- Your name
- Your mobile phone number
- Your password

**You CANNOT change:**
- Your email (contact admin if needed)
- Your role (only admins can change this)

**To update your profile:**

1. **Click your name** → "My Profile"
2. **Click "Edit Profile"**
3. **Update fields:**
   - Change name if needed
   - Update mobile phone
   - Leave password blank if not changing
4. **Click "Save Changes"**

**Result:** Profile updated instantly!

---

### Changing Your Password

**From your profile:**

1. **Go to "My Profile"** → "Edit Profile"
2. **Scroll to "Change Password" section**
3. **Enter your current password** (for security)
4. **Enter new password** (must meet requirements)
5. **Confirm new password** (type it again)
6. **Click "Update Password"**

**Result:** Password changed, you'll be logged out and must log in with new password.

**Security tip:** Change your password every 3-6 months!

---

## Managing Users (Admin Only)

**Only Admins can perform these actions.**

### Viewing All Users

1. **Click "Settings"** in main menu
2. **Select "Users"**
3. **See all users** with:
   - Name
   - Email
   - Role
   - Last login time
   - Mobile phone

**Filter by role:**
- Click role dropdown to filter (e.g., show only Admins)

---

### Creating a New User

1. **Go to Settings** → "Users"
2. **Click "+ New User"**
3. **Fill in details:**
   - Name
   - Email (must be unique)
   - Role (select from dropdown)
   - Mobile phone (optional)
   - Temporary password (user can change on first login)
4. **Click "Create User"**
5. **Share login details** with the new user

**Best practice:** Send them a temporary password via secure channel (not email!), ask them to change it on first login.

---

### Editing User Details

1. **Go to Settings** → "Users"
2. **Click the user's name**
3. **Click "Edit User"**
4. **Update details:**
   - Name
   - Email
   - Mobile phone
   - **Role** (change permissions!)
5. **Click "Save Changes"**

**Changing roles:**
- Upgrading User → Estimator: They can now create estimates
- Downgrading Admin → User: They lose all admin privileges (careful!)
- Role change is IMMEDIATE (user doesn't need to log out/in)

---

### Resetting a User's Password

**When a user forgets their password:**

1. **Go to Settings** → "Users"
2. **Click the user's name**
3. **Click "Reset Password"**
4. **Copy the reset link** (or click "Send Email" if configured)
5. **Share link with user** via secure channel
6. **User clicks link** → sets new password

**Security:** Reset links expire after 2 hours.

---

### Deactivating a User

**When someone leaves the company:**

1. **Go to Settings** → "Users"
2. **Click the user's name**
3. **Click "Deactivate User"**
4. **Confirm deletion**

**What happens:**
- User can no longer log in
- Their data (estimates, POs, chat messages) remains
- Their name shows as "Deactivated User" in historical records
- Can be re-activated later if needed

**Warning:** Cannot undo deletion easily. Consider just changing their role to "User" instead if you might need to re-enable access.

---

## Session & Security

### Auto-Logout

**Your session lasts 24 hours.**

After 24 hours of inactivity:
- You'll see "Unauthorized" error
- Click "Refresh" or navigate to login page
- Log in again to continue

**Why?**
- Security: Prevents unauthorized access on shared computers
- Compliance: Industry best practice

**Pro Tip:** Keep TRAPID tab open and active to avoid logout. But close it when stepping away from your computer!

---

### Security Best Practices

✅ **Do This:**
1. **Use a strong password** (12+ characters, mixed case, special chars)
2. **Don't share your password** (even with coworkers)
3. **Log out when leaving your computer** (or lock screen)
4. **Change password every 3-6 months**
5. **Use Microsoft login if available** (one less password to manage)
6. **Report suspicious activity** to your admin immediately

❌ **Avoid This:**
1. **Don't write password on sticky note** (seriously, don't!)
2. **Don't use same password as other sites** (breaches happen)
3. **Don't share your account** (get them their own account)
4. **Don't save password on shared computers** (only on your personal device)
5. **Don't ignore "Unauthorized" errors** (might indicate security issue)

---

## Troubleshooting Login Issues

### "Invalid email or password"

**Possible causes:**
- Wrong password (check caps lock!)
- Wrong email (try alternate email)
- Account doesn't exist (ask admin to create it)
- Password expired (should auto-prompt for reset, but ask admin if stuck)

**Solutions:**
1. Click "Forgot Password?" to reset
2. Double-check email spelling
3. Contact your admin to verify account exists

---

### "Account locked" (Supplier/Customer Portal Only)

**What it means:**
- Too many failed login attempts (5 attempts)
- Account temporarily locked for 30 minutes

**Solutions:**
1. Wait 30 minutes → try again
2. Contact company to unlock your account
3. Verify you're using correct password

**This doesn't happen to internal users** (Admins, Estimators, etc.) - only external portal users.

---

### "Session expired" or "Unauthorized"

**What it means:**
- Your 24-hour session timed out
- You need to log in again

**Solutions:**
1. Click "Refresh" or navigate to login page
2. Log in again with your credentials
3. Continue working

**Not a bug!** This is normal security behavior.

---

### Microsoft Login Not Working

**Possible issues:**
1. **Microsoft account not set up** - Contact IT to create Microsoft 365 account
2. **Permissions denied** - You must approve TRAPID access on first login
3. **Email mismatch** - Microsoft email must match TRAPID email
4. **Token expired** - Try logging out of Microsoft, then back in

**Solutions:**
- Log out of Microsoft completely → try again
- Use standard email/password login instead
- Contact admin if persists

---

### "Too Many Requests" Error

**What it means:**
- You tried logging in too many times too quickly
- Rate limit protection activated (5 attempts per 20 seconds)

**Solutions:**
1. Wait 20 seconds
2. Try logging in again
3. If you've forgotten password, click "Forgot Password?" instead of guessing

**Why this happens:**
- Security: Prevents brute force attacks
- You'll rarely see this unless trying many passwords quickly

---

## Frequently Asked Questions

### Can I have multiple accounts?

**No.** One account per person. If you need access to different roles, ask your admin to adjust your single account's role.

---

### Can I change my email address?

**No.** Email is your unique identifier. If your email changes (e.g., marriage, job change), contact your admin to update it manually.

---

### How long until my password expires?

**Never.** Passwords don't expire automatically in TRAPID. However, it's good practice to change them every 3-6 months.

---

### Can I use the same password on my phone?

**Yes!** TRAPID is mobile-friendly. Use the same login credentials on any device.

---

### What happens if I forget my password AND can't access my email?

**Contact your admin.** They can reset your password manually and share the new credentials with you securely.

---

### Can I login from multiple devices at once?

**Yes!** You can be logged in on your desktop, laptop, and phone simultaneously. All use the same 24-hour session token.

---

### Why does my session expire after 24 hours?

**Security best practice.** This prevents:
- Unauthorized access on shared computers
- Stale sessions lingering indefinitely
- Security breaches from stolen tokens

**Industry standard:** Most business apps use 12-24 hour sessions.

---

### Can I extend my session without logging out?

**Not currently.** Sessions are hard-limited to 24 hours. Just log in again when prompted - it's quick!

**Future feature:** Auto-refresh tokens to extend sessions indefinitely (coming soon).

---

### What's the difference between my role and my "assigned role"?

**Role:** Your permission level (Admin, Estimator, User, etc.)
**Assigned Role:** Your team/group assignment (Sales, Site, Supervisor, etc.)

- **Role** controls what you CAN do in the system
- **Assigned Role** is for filtering/grouping users (e.g., "Show all Sales users")

**Example:**
- Role: Estimator (can create estimates)
- Assigned Role: Sales (works on sales team)

---

### Can I delete my own account?

**No.** Only admins can delete accounts. Contact your admin if you need your account removed.

---

## Related Topics

- **Chapter 2: Company Settings** - Configure system-wide settings (Admin only)
- **Chapter 12: OneDrive Integration** - Using Microsoft login for automatic OneDrive access
- **Chapter 13: Outlook/Email Integration** - Connecting your Outlook account
- **Chapter 14: Chat & Communications** - Internal messaging system

---

# Chapter 2: Company Settings

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 2 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 2 (Developers)  │
└─────────────────────────────────────────────────┘

**Content TBD** - To be populated with company configuration instructions

---

# Chapter 3: Managing Contacts

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 3 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 3 (Developers)  │
└─────────────────────────────────────────────────┘

**Content TBD** - To be populated with contact management guide

---

# Chapter 4: Setting Up Price Books

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 4 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 4 (Developers)  │
└─────────────────────────────────────────────────┘

**Content TBD** - To be populated with price book setup guide

---

# Chapter 5: Creating a New Job

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 5 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 5 (Developers)  │
└─────────────────────────────────────────────────┘

**Content TBD** - To be populated with job creation workflow

---

# Chapter 6: Importing & Managing Estimates

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 6 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 6 (Developers)  │
└─────────────────────────────────────────────────┘

**Content TBD** - To be populated with estimate import guide

---

# Chapter 7: AI-Powered Plan Review

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 7 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 7 (Developers)  │
└─────────────────────────────────────────────────┘

**Content TBD** - To be populated with AI plan review guide

---

# Chapter 8: Generating Purchase Orders

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 8 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 8 (Developers)  │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## What are Purchase Orders?

Purchase Orders (POs) are your system for ordering materials, equipment, and services from suppliers. Think of them as:
- 📄 **Official Order Forms** - Professional documentation sent to suppliers
- 💰 **Budget Tracking** - Monitor spending against estimates
- 📦 **Delivery Tracking** - Know what's been ordered, received, and paid
- 🔗 **Schedule Integration** - Link orders to specific construction tasks

---

## Quick Start: Creating Your First PO

### Method 1: Generate from Estimate (Recommended)

**Best for:** Converting approved estimates into supplier orders

1. **Navigate to your job's Estimate page**
2. **Click "Generate Purchase Orders"** button (top right)
3. **Review the auto-generated POs:**
   - System groups line items by category
   - Smart lookup finds best supplier & price for each item
   - PO numbers assigned automatically (PO-000001, PO-000002, etc.)
4. **Verify details:**
   - Check supplier assignments (change if needed)
   - Review quantities and prices
   - Adjust delivery dates
5. **Click "Save All POs"**

**Result:** Multiple draft POs ready for approval, organized by category.

---

### Method 2: Create Manual PO

**Best for:** One-off purchases, change orders, additional items

1. **Navigate to job's Purchase Orders page**
2. **Click "+ New Purchase Order"**
3. **Fill in required fields:**
   - **Supplier:** Select from dropdown (or create new)
   - **Delivery Date:** When you need items on site
   - **Notes:** Special instructions, project phase, etc.
4. **Add line items:**
   - Click "+ Add Item"
   - Enter item name, quantity, unit price
   - Select category (helps with tracking)
   - Repeat for each item
5. **Review totals:**
   - Sub-total calculated automatically
   - Tax (10% GST) added
   - Total shown at bottom
6. **Click "Save as Draft"**

**Result:** Single PO saved, ready for approval.

---

## Understanding PO Status

Your PO moves through these stages:

### 📝 Draft
- **What it means:** PO is being prepared, not official yet
- **You can:** Edit freely, add/remove items, delete PO
- **Next step:** Submit for approval

### ⏳ Pending Approval
- **What it means:** PO submitted, waiting for manager approval
- **You can:** View only (creator can still edit)
- **Next step:** Manager approves or rejects

### ✅ Approved
- **What it means:** PO approved by manager, ready to send
- **You can:** Send to supplier, minor edits only
- **Next step:** Send to supplier

### 📧 Sent to Supplier
- **What it means:** Supplier received PO, items on order
- **You can:** Track delivery, cancel if needed (contact supplier first!)
- **Next step:** Mark as received when items arrive

### 📦 Received
- **What it means:** Goods/services delivered and checked
- **You can:** Record invoice, track payment
- **Next step:** Mark as invoiced

### 🧾 Invoiced
- **What it means:** Supplier invoice recorded in system
- **You can:** Record payments, track balance owing
- **Next step:** Mark as paid when fully paid

### 💰 Paid
- **What it means:** Fully paid, closed
- **You can:** View only (archived)
- **Next step:** None (completed)

---

## Smart Lookup: How It Works

**Smart Lookup** automatically finds the best supplier and price for each line item.

### How Items Are Matched

**Priority 1:** Exact match (best)
- Item name + your preferred supplier + category
- Example: "Pine Timber 90x45" from "Timber Co" in "Framing" category

**Priority 2:** Fuzzy match
- Similar name + preferred supplier + category
- Example: "Pine Tmber 90x45" matches "Pine Timber 90x45"

**Priority 3:** Any supplier in category
- Item name from any supplier in same category
- Example: "Pine Timber 90x45" from any timber supplier

**Priority 4:** Fallback
- Best available match from entire pricebook
- Better than blank!

### How Suppliers Are Selected

**Priority 1:** Supplier code on estimate
- If estimate specifies "ABC-123", use that supplier

**Priority 2:** Category default supplier
- Each category has preferred supplier (set in Settings)
- Example: "Framing" category → "Timber Co"

**Priority 3:** Any active supplier
- First active supplier with items in category

**Priority 4:** Fallback
- First active supplier in system

**Pro Tip:** Set default suppliers for each category to get accurate smart lookups!

---

## Working with Purchase Orders

### Editing a PO

**Draft status:**
1. Open PO
2. Click "Edit"
3. Change any field (supplier, items, dates, etc.)
4. Click "Save"

**Pending/Approved status:**
1. Open PO
2. Click "Edit"
3. Limited fields available (status prevents major changes)
4. To make major changes: Cancel PO → Creates new draft → Edit freely

**Sent/Received/Invoiced/Paid:**
- Cannot edit (locked)
- To change: Cancel and create new PO

### Approving a PO

**Required permission:** Manager or Admin

1. Open PO in "Pending" status
2. Review line items, quantities, prices
3. Check supplier and delivery date
4. **Click "Approve"** (or "Reject" to send back to draft)
5. PO moves to "Approved" status

**What to check:**
- ✅ Supplier is correct
- ✅ Prices match estimate (or within reason)
- ✅ Delivery date aligns with schedule
- ✅ Budget available for this purchase

### Sending to Supplier

1. Open PO in "Approved" status
2. Click "Send to Supplier"
3. **Choose method:**
   - **Email:** System sends PDF to supplier email
   - **Download PDF:** Print or attach to email manually
   - **Mark as Sent:** Already sent outside system
4. PO moves to "Sent" status

**Email includes:**
- Professional PO document (PDF)
- All line items with quantities and prices
- Delivery instructions and site address
- Contact information

### Receiving Goods

**When delivery arrives:**

1. **Check delivery against PO:**
   - Count items
   - Check condition
   - Note any shortages or damages
2. **Open PO in system**
3. **Click "Mark as Received"**
4. **Enter details:**
   - Date received
   - Quantity received (if partial delivery, note in comments)
   - Condition notes
5. **Click "Save"**
6. PO moves to "Received" status

**Partial deliveries:**
- Note what arrived in comments
- Keep PO in "Sent" status until complete
- Or mark as "Received" and note outstanding items

### Recording Invoices

**When supplier invoice arrives:**

1. Open PO (should be in "Received" status)
2. Click "Mark as Invoiced"
3. **Enter invoice details:**
   - Invoice number
   - Invoice date
   - Invoice amount
4. **Attach invoice PDF** (optional but recommended)
5. Click "Save"
6. PO moves to "Invoiced" status

**Payment status auto-calculated:**
- System compares invoice amount to PO total
- Shows "Pending", "Part Payment", or "Complete"
- 5% tolerance for rounding (see Payment Tracking below)

### Recording Payments

1. Open PO in "Invoiced" status
2. **Enter payment details:**
   - Amount paid
   - Payment date
   - Payment method (EFT, check, credit card)
   - Reference number
3. **Click "Record Payment"**
4. **Payment status updates:**
   - If paid in full → "Paid" status (PO closed)
   - If partial → "Part Payment" (can record more payments)

**Multiple payments:**
- Record each payment separately
- System tracks total paid
- Shows balance owing

---

## Understanding Payment Status

### 💰 Payment Status Indicators

**⏳ Pending**
- No payment recorded yet
- Invoice just received
- Action: Schedule payment

**🟡 Part Payment**
- Some amount paid, but not complete
- Example: $500 paid on $1000 PO
- Action: Record remaining payments

**✅ Complete**
- Fully paid (within tolerance)
- Example: $995-$1050 paid on $1000 PO (95-105% tolerance)
- Action: None, PO can close

**🚨 Manual Review**
- Payment doesn't make sense
- Example: $1100 paid on $1000 PO (overpaid!)
- Action: Check with accounts, may need credit

### Why 5% Tolerance?

**Real-world scenarios:**
- **Rounding:** $999.95 vs $1000.00
- **Early payment discounts:** Pay $980 for 2% discount
- **Partial shipments:** Last item $20, not worth separate invoice
- **GST differences:** Calculation rounding

**System considers these "Complete":**
- PO Total: $1000
- Paid: $950-$1050 = Complete ✅
- Paid: $949 or less = Part Payment 🟡
- Paid: $1051+ = Manual Review 🚨

**To override:**
- If $990 paid and supplier agrees that's full payment
- Accept "Part Payment" status (accurate reflection)
- Or adjust invoice amount to $990 → Shows "Complete"

---

## Price Drift Warnings

**What is price drift?**
- Comparison between pricebook price and PO line item price
- Helps catch data entry errors and price increases

**Color indicators:**
- 🟢 **Green (0-5%):** Normal variation, no concern
- 🟡 **Yellow (5-10%):** Notable increase, worth checking
- 🔴 **Red (>10%):** Significant increase, review required

**Common causes:**
- ✅ **Legitimate:** Supplier raised prices, market increase
- ✅ **Bulk pricing:** Ordered more, got discount (negative drift)
- ❌ **Data error:** Typed $1000 instead of $100 (900% drift!)
- ❌ **Wrong item:** Selected wrong pricebook item

**Example:**
- Pricebook: "2x4 Timber" = $5.00
- PO line item: $5.75 (15% drift)
- **Warning shows:** "Price is 15% higher than pricebook. Confirm before proceeding."

**Actions:**
- Review supplier quote
- Check for data entry errors
- Update pricebook if new normal price
- Proceed if increase is legitimate

---

## Linking POs to Schedule Tasks

**Why link?**
- See which POs support which construction phases
- Track material costs per task
- Know when items must arrive for task start date

**How to link:**

1. **Open PO**
2. **Scroll to "Schedule Task" field**
3. **Select task from dropdown:**
   - Shows all tasks for current job
   - Example: "Framing - Week 2"
4. **Click "Save"**

**Result:**
- PO appears in task details
- Task shows associated PO cost
- Delivery date aligned with task start

**Important:**
- One PO can link to ONE task only
- One task can have MULTIPLE POs
- Changing link moves PO to new task (safely handled)

---

## Common Workflows

### Workflow 1: Estimate → PO → Delivery

**Scenario:** Converting approved estimate into supplier orders

1. **Estimate approved** by client
2. **Generate POs** from estimate
   - Click "Generate Purchase Orders"
   - Review auto-created POs
   - Verify suppliers and prices
3. **Submit for approval**
   - Click "Submit All for Approval"
   - Manager reviews and approves
4. **Send to suppliers**
   - Approved POs → Click "Send to Supplier"
   - Email sent automatically
5. **Track deliveries**
   - Items arrive → "Mark as Received"
   - Record invoice → "Mark as Invoiced"
   - Record payment → "Record Payment"
6. **Close PO**
   - Fully paid → Status: "Paid"
   - Archived for records

**Timeline:** 2-3 days for approval, 5-10 days delivery (varies by supplier)

---

### Workflow 2: Emergency Purchase

**Scenario:** Need materials urgently, no estimate yet

1. **Create manual PO**
   - "+ New Purchase Order"
   - Select supplier
   - Add items needed
2. **Submit for approval**
   - Click "Submit for Approval"
   - Call/text manager for quick approval
3. **Call supplier**
   - Confirm availability
   - Arrange pickup or delivery
4. **Send PO**
   - Manager approves → "Send to Supplier"
   - Email or call supplier with PO number
5. **Pick up or receive**
   - Get items on site
   - "Mark as Received"
6. **Process invoice**
   - Invoice arrives → "Mark as Invoiced"
   - Pay ASAP → "Record Payment"

**Timeline:** Same day if supplier has stock

---

### Workflow 3: Bulk Ordering for Multiple Jobs

**Scenario:** Ordering common materials for 3 jobs to get bulk discount

1. **Create PO for primary job**
   - Select job with most items
   - Add ALL items (across all jobs)
   - Note other job numbers in PO notes
2. **Record total cost to primary job**
   - Full PO tracked in primary job
3. **Split costs in accounting**
   - Use custom tables or manual tracking
   - Allocate costs per job

**Alternative (better tracking):**
- Create separate PO per job
- Note bulk order in PO notes
- Coordinate delivery timing

---

## Troubleshooting

### "PO number already exists"

**What it means:** System tried to create duplicate PO number (rare!)

**Solutions:**
1. Refresh page and try again
2. Check existing POs for duplicates
3. Contact support if persists

**Prevention:** System uses database locks to prevent this

---

### "Cannot edit PO in 'Sent' status"

**What it means:** PO already sent to supplier, locked to prevent confusion

**Solutions:**
1. **Minor change:** Contact supplier directly, don't change system
2. **Major change:**
   - Cancel PO
   - Create new PO with correct details
   - Send new PO to supplier
   - Explain cancellation

**Why locked?** Prevents miscommunication with supplier

---

### "Smart lookup selected wrong supplier"

**What it means:** System picked different supplier than you expected

**Solutions:**
1. **Check category default:**
   - Settings → Price Books → Categories
   - Update default supplier if needed
2. **Manually override:**
   - Change supplier in PO after generation
   - Edit line items if needed
3. **Review pricebook:**
   - Ensure correct items are tagged to right suppliers

**Prevention:** Set accurate default suppliers for each category

---

### "Payment status stuck on 'Part Payment'"

**What it means:** Amount paid doesn't fall in "Complete" tolerance (95-105%)

**Example:**
- PO Total: $1000
- Paid: $990 (99% - outside tolerance)
- Shows: "Part Payment"

**Solutions:**
1. **Check if truly complete:**
   - Did supplier accept $990 as full payment?
   - Was there a discount?
2. **Adjust invoice amount:**
   - Change invoice from $1000 to $990
   - Status updates to "Complete"
3. **Pay remaining amount:**
   - Pay additional $10
   - Status updates to "Complete"
4. **Accept status:**
   - "Part Payment" is accurate if not fully paid

**Understanding:** Status is CALCULATED, not manually set

---

### "Price drift warning won't go away"

**What it means:** Line item price is >10% different from pricebook

**Solutions:**
1. **Update pricebook:**
   - Settings → Price Books
   - Update item price to current market price
   - Drift warning disappears
2. **Verify correct price:**
   - Check supplier quote
   - Ensure no data entry error
3. **Acknowledge and proceed:**
   - Click "I understand, proceed"
   - Warning is informational only

**Prevention:** Keep pricebook updated with current market prices

---

### "Cannot link PO to schedule task"

**What it means:** Task already linked to another PO

**Solutions:**
1. **Check existing link:**
   - Open schedule task
   - See which PO is linked
2. **Unlink other PO:**
   - Open that PO
   - Remove schedule task link
   - Now link to new PO
3. **Use different task:**
   - Create new task if needed
   - Link PO to new task

**Why?** System enforces: One task = One PO (one-to-one relationship)

---

## Tips & Best Practices

### ✅ Do This

**1. Set default suppliers for categories**
- Saves time on every PO generation
- Ensures consistent supplier relationships
- Better pricing through volume

**2. Use smart lookup for bulk POs**
- Faster than manual entry
- More accurate pricing
- Consistent item names

**3. Link POs to schedule tasks**
- Better cost tracking
- Delivery timing aligned with construction
- Easy to see material costs per phase

**4. Review before sending**
- Check all quantities and prices
- Verify delivery date
- Confirm supplier details
- Double-check site address

**5. Attach supplier invoices**
- Easy reference later
- Audit trail for accounting
- Dispute resolution if needed

**6. Record payments promptly**
- Accurate cash flow tracking
- Avoid duplicate payments
- Better supplier relationships

**7. Keep pricebook updated**
- Reduces price drift warnings
- Faster smart lookups
- More accurate estimates

### ❌ Avoid This

**1. Editing sent POs**
- Creates supplier confusion
- Better to cancel and resend
- Keep communication clear

**2. Skipping approval workflow**
- Budget overruns
- Unauthorized purchases
- Financial control issues

**3. Manual POs for everything**
- Slower than smart lookup
- More data entry errors
- Miss bulk discount opportunities

**4. Ignoring price drift warnings**
- May miss data entry errors
- Budget surprises
- Profit margin issues

**5. Not linking to schedule**
- Harder to track material costs
- Delivery timing issues
- Miss task dependencies

**6. Deleting POs**
- Lose purchase history
- Audit trail gaps
- Better to cancel instead

**7. Using outdated pricebook**
- Inaccurate estimates
- Constant drift warnings
- Manual price corrections

---

## Frequently Asked Questions

### Can I edit a PO after it's sent?

**No.** Once sent, PO is locked to prevent supplier confusion.

**To change:** Cancel PO → Create new one → Send new PO to supplier

---

### Why does smart lookup pick different suppliers?

**Reason:** System follows priority:
1. Supplier code on estimate
2. Category default supplier
3. Any active supplier

**Solution:** Set default suppliers in category settings

---

### Can I create POs without an estimate?

**Yes!** Manual PO creation is fully supported.

**Best for:** Change orders, additional items, emergency purchases

---

### What happens if I delete a PO?

**Draft/Pending:** PO deleted permanently
**Approved/Sent/Received/Invoiced/Paid:** Cannot delete (use cancel instead)

**Better:** Use "Cancel" to create audit trail

---

### Can I merge multiple POs?

**No.** System doesn't support merging.

**Workaround:** Create new PO with all items → Cancel old POs

---

### How do I track partial payments?

**Record each payment separately:**
1. Enter amount paid
2. Click "Record Payment"
3. Status updates to "Part Payment"
4. Repeat for next payment

System tracks total paid and balance owing.

---

### Can I copy a PO to another job?

**Not directly.** Must create new PO manually.

**Workaround:**
1. Open original PO
2. Note items and quantities
3. Create new PO in other job
4. Enter same items

**Feature request:** Copy PO function (coming soon!)

---

### What's the difference between "Received" and "Invoiced"?

**Received:** Goods physically delivered to site
**Invoiced:** Supplier invoice recorded in system

**Typical flow:**
1. Items arrive → Mark as "Received"
2. Days/weeks later → Invoice arrives → Mark as "Invoiced"
3. Process payment → Record payments

---

### Can I have multiple invoices for one PO?

**Not directly.** System tracks one invoice per PO.

**For multiple invoices:**
- Use comments to track each invoice number
- Record total amount paid across all invoices
- Attach all invoice PDFs

**Better:** Split into separate POs for each delivery

---

### How do I export PO data for accounting?

**Options:**
1. **Export to CSV:** POs page → "Export" button
2. **Xero Integration:** Auto-sync POs to Xero (if enabled)
3. **API Access:** Custom integration (developer required)

**CSV includes:** PO number, supplier, items, amounts, dates, status

---

## Related Topics

- **Chapter 4: Price Books & Suppliers** - Setting up pricebook for smart lookup
- **Chapter 6: Estimates & Quoting** - Creating estimates to generate POs from
- **Chapter 9: Schedule Master** - Linking POs to construction tasks
- **Chapter 11: Documents** - Attaching supplier invoices and quotes
- **Chapter 16: Payments** - Recording payments and tracking cash flow

---

# Chapter 9: Building Construction Schedules

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 9 (Developers)  │
│ 📕 LEXICON (BUGS):     Chapter 9 (Developers)  │
└─────────────────────────────────────────────────┘

**Last Updated:** 2025-11-16

## What is Schedule Master?

Schedule Master helps you create and manage construction timelines with:
- 📅 **Visual Gantt Chart** - See your entire project timeline
- 🔗 **Task Dependencies** - Link tasks that depend on each other
- 📋 **24-Column Table** - Detailed task information
- 🔒 **Lock System** - Prevent important dates from changing
- 🔄 **Auto-Cascade** - Dependent tasks update automatically

---

## Creating Your First Schedule

### Step 1: Navigate to Schedule Master

1. Go to your job
2. Click the **"Schedule"** tab
3. Click **"New Schedule from Template"**

### Step 2: Choose a Template

Pick a template that matches your project type:
- **NDIS Residential** - Disability housing construction
- **Standard Residential** - Regular home construction
- **Commercial** - Commercial building projects
- **Custom** - Start from scratch

### Step 3: Review the Schedule

The template creates tasks for you automatically:
- **Task Name** - What needs to be done (e.g., "Foundation", "Framing")
- **Duration** - How many days each task takes
- **Start Date** - When the task begins
- **Dependencies** - Which tasks must finish first

---

## Understanding the Schedule View

### The Table (Left Side)

**24 columns** show detailed information:
- **Task** - Task name
- **Start** - Start day (e.g., Day 5)
- **Duration** - How long it takes (in days)
- **Predecessors** - Tasks that must finish first
- **Owner** - Who's responsible
- **Status** - Not started, In progress, Complete

### The Gantt Chart (Right Side)

**Visual timeline** shows:
- **Task bars** - Length represents duration
- **Arrows** - Dependencies between tasks
- **Colors** - Different colors for different statuses

---

## Working with Tasks

### Moving a Task

**Drag the task bar** to change its start date:
1. Click and hold on the task bar
2. Drag left (earlier) or right (later)
3. Release to drop

**What happens:**
- Task moves to new date
- All dependent tasks move automatically
- Locked tasks stay in place

### Adding Dependencies

**Link tasks together:**
1. Click the **"Link"** icon next to a task
2. Click the task that depends on it
3. An arrow appears showing the link

**Dependency types:**
- **Finish-to-Start (FS)** - Most common. Task B starts when Task A finishes.
- **Start-to-Start (SS)** - Task B starts when Task A starts.
- **Finish-to-Finish (FF)** - Task B finishes when Task A finishes.

### Locking a Task

**Prevent a task from moving:**
1. Find the lock icon column
2. Click the checkbox to lock
3. Locked tasks won't move when predecessors change

**When to lock:**
- ✅ Supplier confirmed the date
- ✅ Work has already started
- ✅ Date is critical (e.g., inspection)

---

## Common Scenarios

### Scenario 1: Delay in Foundation

**Problem:** Foundation delayed by 3 days due to rain.

**Solution:**
1. Drag the "Foundation" task bar 3 days later
2. All dependent tasks (Framing, Plumbing, etc.) move automatically
3. Check the new completion date

### Scenario 2: Supplier Confirms Delivery Date

**Problem:** Windows supplier confirmed delivery for Day 45.

**Solution:**
1. Drag "Install Windows" task to Day 45
2. Lock the task (click lock icon)
3. Task won't move even if predecessors change

### Scenario 3: Task Taking Longer Than Expected

**Problem:** Framing taking 5 days instead of 3.

**Solution:**
1. Click on "Framing" task
2. Change **Duration** from 3 to 5
3. All dependent tasks shift by 2 days

---

## Tips & Best Practices

### Do's ✅

- ✅ **Use templates** - Saves time, proven workflows
- ✅ **Lock critical dates** - Prevents accidental changes
- ✅ **Update regularly** - Keep schedule current
- ✅ **Add dependencies** - Let cascade do the work
- ✅ **Check working days** - Settings → Company → Working Days

### Don'ts ❌

- ❌ **Don't ignore dependencies** - Manual updates are error-prone
- ❌ **Don't forget to lock** - Confirmed dates should be locked
- ❌ **Don't delete tasks** - Hide them instead (set status to "Cancelled")

---

## Troubleshooting

### Tasks not moving when I drag?

**Check if task is locked:**
- Look for lock icon
- Locked tasks don't move automatically
- Unlock to allow movement

### Schedule looks wrong after dragging?

**Try refreshing:**
- Click the refresh icon
- Or press F5 to reload page
- Schedule recalculates from server

### Can't find a task?

**Use the search:**
- Click in the table
- Press Ctrl+F (Windows) or Cmd+F (Mac)
- Type task name

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl/Cmd + S** | Save schedule |
| **Ctrl/Cmd + Z** | Undo last change |
| **Ctrl/Cmd + F** | Find task |
| **Delete** | Delete selected task |
| **Escape** | Cancel current action |

---

## Video Tutorials

**Coming soon:**
- Creating your first schedule
- Understanding dependencies
- Using the lock system
- Managing delays and changes

---

**For technical details, see:** Bible Chapter 9 (Developers)
**For bug history, see:** Lexicon Chapter 9 (Developers)

---

# Chapter 10: Daily Tasks & Checklists

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 10 (Developers) │
│ 📕 LEXICON (BUGS):     Chapter 10 (Developers) │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 11: Weather Tracking & Delays

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 11 (Developers) │
│ 📕 LEXICON (BUGS):     Chapter 11 (Developers) │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 12: OneDrive File Management

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 12 (Developers) │
│ 📕 LEXICON (BUGS):     Chapter 12 (Developers) │
└─────────────────────────────────────────────────┘

## What is OneDrive Integration?

OneDrive stores all your job documents in the cloud: plans, quotes, photos, and contracts. Every job automatically gets its own folder with subfolders organized by document type.

**Benefits:**
- **Auto folder creation** - New job = instant OneDrive folder
- **Organized structure** - Plans, Quotes, Photos all separated
- **Team access** - Everyone sees same files
- **Version history** - OneDrive tracks all changes

---

## Getting Started

### Step 1: Connect to OneDrive

1. Go to **Settings** → **Integrations**
2. Find "OneDrive" card
3. Click **"Connect to OneDrive"**
4. Sign in with your Microsoft account
5. Click **"Accept"** to grant permissions

**Success!** OneDrive is now connected.

---

### Step 2: Create Folders for a Job

When you create a new job, Trapid can auto-create folders:

**Option A: During Job Creation**
1. Fill out "New Job" form
2. Check **"Create OneDrive folders"** checkbox
3. Click "Create Job"
4. Folders created automatically!

**Option B: After Job Created**
1. Go to job detail page
2. Click **"Create OneDrive Folders"** button
3. Folders created in seconds

**What gets created:**
```
Trapid Jobs/
  └── [Job Number] - [Job Name]/
      ├── Plans/
      ├── Quotes/
      ├── Contracts/
      ├── Photos/
      ├── Invoices/
      └── Correspondence/
```

---

## Uploading Files

### Upload to a Job

1. Go to **Job Detail** page
2. Click **"Documents"** tab
3. Choose document type (e.g., "Plans")
4. Click **"Upload File"** button
5. Select file from your computer
6. File uploads to correct OneDrive folder

---

## Opening Files in OneDrive

### View Files in Browser

1. Go to job detail page
2. Click **"Open in OneDrive"** button
3. OneDrive opens in new tab showing your job folder

**Tip:** Bookmark the OneDrive link for quick access!

---

## Common Scenarios

### Scenario 1: Upload Site Photos

**You took photos at the job site:**

1. Go to job → Documents tab
2. Select "Photos" folder
3. Upload photos (supports multiple files)
4. Photos appear in OneDrive immediately

---

### Scenario 2: Share Files with Client

**Client needs to see quote:**

1. Click "Open in OneDrive"
2. Navigate to Quotes folder
3. Right-click file → Share
4. Copy link and email to client

---

## Tips & Best Practices

### Tip #1: Use Descriptive File Names

Good: `Quote-Bathroom-Reno-Rev2.pdf`
Bad: `Document1.pdf`

### Tip #2: Create Folders Early

Create OneDrive folders when you create the job, not later. This ensures all documents go to the right place from day one.

---

# Chapter 13: Email Integration

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 13 (Developers) │
│ 📕 LEXICON (BUGS):     Chapter 13 (Developers) │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 14: Team Chat & SMS

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 14 (Developers) │
│ 📕 LEXICON (BUGS):     Chapter 14 (Developers) │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 15: Xero Accounting Sync

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 15 (Developers) │
│ 📕 LEXICON (BUGS):     Chapter 15 (Developers) │
└─────────────────────────────────────────────────┘

## What is Xero Integration?

Xero is an accounting software that manages your company's finances: invoices, payments, bills, and tax reporting. Trapid connects to Xero to automatically sync contacts and track purchase order payments.

**Benefits:**
- **No duplicate data entry** - Contacts sync both ways
- **Invoice matching** - Link Xero invoices to purchase orders
- **Payment tracking** - Track what's been paid to suppliers
- **Tax compliance** - Xero handles GST/tax calculations

---

## Getting Started

### Step 1: Connect to Xero

1. Go to **Settings** → **Integrations**
2. Find "Xero Accounting" card
3. Click **"Connect to Xero"**
4. You'll be taken to Xero's login page
5. Sign in with your Xero account
6. Click **"Allow Access"** to authorize Trapid
7. You'll be redirected back to Trapid

**Success!** You should see "Connected to Xero" with your company name.

---

### Step 2: Sync Your Contacts

After connecting, sync your contacts between Trapid and Xero:

1. Go to **Settings** → **Integrations** → **Xero**
2. Click **"Sync Contacts"** button
3. You'll see a progress bar showing sync status
4. Wait for it to complete (can take 1-2 minutes for 100 contacts)

**What happens during sync:**
- Trapid contacts → Xero (creates new contacts in Xero)
- Xero contacts → Trapid (imports contacts from Xero)
- Matching contacts (updates both sides if changes found)

**Tip:** Sync runs in the background. You can continue working while it runs!

---

## Managing Contacts

### Enable/Disable Sync for a Contact

By default, ALL contacts sync with Xero. To stop a contact from syncing:

1. Go to **Contacts** page
2. Click on the contact
3. Scroll to "Xero Settings" section
4. Toggle **"Sync with Xero"** OFF

**When to disable sync:**
- Internal contacts (staff, not suppliers/clients)
- Test/dummy contacts
- Contacts you don't want in Xero

### View Sync Status

Each contact shows its Xero sync status:

- **Synced** ✅ - Contact is in both Trapid and Xero
- **Not Synced** - Contact only in Trapid
- **Error** ❌ - Sync failed (click for details)

**Check sync time:**
- "Last synced: 2 hours ago" shows when it last updated

---

## Invoice Matching

Match Xero invoices to your purchase orders to track payments.

### Step 1: Find the Invoice in Xero

1. Go to **Purchase Orders** page
2. Click on a purchase order
3. Click **"Match Xero Invoice"** button
4. Search for the invoice by:
   - Supplier name
   - Invoice number
   - Amount
   - Date range

### Step 2: Confirm the Match

1. Select the invoice from search results
2. Review the details:
   - **Invoice total** should match **PO total** (±5% tolerance)
   - **Supplier** should match
   - **Date** should be around PO creation date
3. Click **"Match Invoice"** to confirm

**After matching:**
- PO shows "Xero Invoice: INV-12345"
- Payment status updates automatically from Xero
- Can now create payment in Trapid

---

## Recording Payments

After matching an invoice, record a payment:

### Create a Payment

1. Go to the matched **Purchase Order**
2. Click **"Record Payment"** button
3. Fill in payment details:
   - **Amount:** How much you paid (can be partial)
   - **Date:** When payment was made
   - **Reference:** Bank transaction reference (optional)
4. Click **"Save Payment"**

### Sync Payment to Xero

After saving the payment in Trapid:

1. Click **"Sync to Xero"** button on the payment
2. Payment is created in Xero
3. Invoice status updates in Xero (Partial Paid or Paid)

**Payment status:**
- **0%** - Not paid
- **50%** - Partially paid (e.g., paid $5,000 of $10,000)
- **100%** - Fully paid

---

## Common Scenarios

### Scenario 1: New Supplier Added

**You add a new supplier in Trapid:**

1. Create contact in Trapid (Contacts → New Contact)
2. Fill in supplier details (ABN, email, phone)
3. Save contact
4. Wait 5-10 minutes (auto-sync runs periodically)
5. OR: Manually click "Sync Contacts" in Settings → Xero

**Result:** Supplier appears in Xero automatically!

---

### Scenario 2: Invoice Already Paid in Xero

**You paid an invoice directly in Xero:**

1. Go to Purchase Order in Trapid
2. Click "Match Xero Invoice"
3. Select the invoice
4. Trapid detects it's already paid in Xero
5. Payment status shows 100%

**No action needed** - Trapid recognizes it's paid!

---

### Scenario 3: Partial Payment

**You paid $5,000 of a $10,000 invoice:**

1. Create payment in Trapid for $5,000
2. Sync to Xero
3. PO shows "50% paid"
4. Later, create another payment for $5,000
5. Sync again
6. PO shows "100% paid"

---

## Troubleshooting

### "Not authenticated with Xero"

**Problem:** Lost connection to Xero

**Solution:**
1. Go to Settings → Integrations → Xero
2. Click "Disconnect"
3. Click "Connect to Xero" again
4. Re-authorize Trapid

---

### "Sync job stuck at 'queued'"

**Problem:** Contact sync not starting

**Solution:**
1. Refresh the page
2. Wait 1-2 minutes
3. If still stuck, contact support

---

### "Duplicate contacts in Xero"

**Problem:** Same contact appears twice in Xero

**Solution:**
1. In Xero, merge the duplicate contacts
2. In Trapid, go to Settings → Xero
3. Click "Sync Contacts" again
4. Trapid will detect the merge

---

### "Invoice total doesn't match PO"

**Problem:** Invoice is $10,500 but PO is $10,000

**Solution:**
- **Allowed:** ±5% difference (e.g., $9,500 - $10,500 is OK)
- **Not allowed:** >5% difference

**If difference is too large:**
1. Check if PO total is correct
2. Update PO line items if needed
3. OR: Match invoice manually (override check)

---

## Tips & Best Practices

### Tip #1: Sync Contacts Regularly

Run "Sync Contacts" weekly to keep both systems up-to-date.

**Why?**
- New suppliers added in Xero appear in Trapid
- Updated emails/phones sync both ways

---

### Tip #2: Match Invoices Before Paying

Always match the Xero invoice BEFORE recording payment in Trapid.

**Why?**
- Ensures payment syncs to correct invoice
- Prevents orphaned payments in Xero

---

### Tip #3: Use Reference Numbers

When recording payments, use the bank transaction reference.

**Example:** "NAB-TRANSFER-12345"

**Why?**
- Easier to reconcile in Xero
- Helps find payment in bank statement

---

### Tip #4: Check Sync Errors

If a contact shows "Sync Error":
1. Click on the contact
2. Scroll to "Xero Settings"
3. Read the error message
4. Fix the issue (usually missing email or ABN)
5. Click "Retry Sync"

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Xero settings | (none yet) |
| Match invoice | (none yet) |
| Record payment | (none yet) |

---

## FAQ

**Q: Do I need a Xero account?**
A: Yes, you need a Xero subscription. Trapid connects to your existing Xero account.

**Q: Can I disconnect from Xero?**
A: Yes, go to Settings → Integrations → Xero → "Disconnect". This won't delete any data in Xero.

**Q: What if I change something in Xero?**
A: Run "Sync Contacts" in Trapid to pull the changes from Xero.

**Q: Can I sync invoices?**
A: Not automatically. You must manually match Xero invoices to purchase orders.

**Q: Does Trapid create invoices in Xero?**
A: No, Trapid only matches existing invoices. You create invoices in Xero.

**Q: What happens if I delete a contact in Trapid?**
A: It won't delete from Xero. Xero contacts are never deleted automatically.

---

## Next Steps

After setting up Xero integration:
1. **Chapter 16:** Learn how to track payments in detail
2. **Chapter 8:** Set up purchase orders for better invoice matching
3. **Chapter 5:** Add suppliers as contacts for Xero sync

---

# Chapter 16: Payment Tracking

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 16 (Developers) │
│ 📕 LEXICON (BUGS):     Chapter 16 (Developers) │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 17: Workflow Automation

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 17 (Developers) │
│ 📕 LEXICON (BUGS):     Chapter 17 (Developers) │
└─────────────────────────────────────────────────┘

**Content TBD**

---

# Chapter 18: Custom Data Tables

┌─────────────────────────────────────────────────┐
│ 📖 BIBLE (RULES):      Chapter 18 (Developers) │
│ 📕 LEXICON (BUGS):     Chapter 18 (Developers) │
└─────────────────────────────────────────────────┘

**Content TBD**

---

## Getting Help

**Need assistance?**
- Check this manual first
- Contact your team lead
- Email support (coming soon)

---

**Last Updated:** 2025-11-16
**Maintained By:** Development Team

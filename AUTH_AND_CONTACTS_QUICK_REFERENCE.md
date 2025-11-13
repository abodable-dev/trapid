# Authentication & Contacts System - Quick Reference

## File Paths

### Backend Models (13 files)
- `/Users/rob/Projects/trapid/backend/app/models/user.rb` - User + roles
- `/Users/rob/Projects/trapid/backend/app/models/contact.rb` - Main contact model
- `/Users/rob/Projects/trapid/backend/app/models/contact_person.rb` - Individual people
- `/Users/rob/Projects/trapid/backend/app/models/contact_relationship.rb` - Network relationships
- `/Users/rob/Projects/trapid/backend/app/models/contact_activity.rb` - Audit log
- `/Users/rob/Projects/trapid/backend/app/models/supplier.rb` - Supplier (legacy)
- `/Users/rob/Projects/trapid/backend/app/models/supplier_contact.rb` - Supplier-contact junction
- `/Users/rob/Projects/trapid/backend/app/models/purchase_order.rb` - PO header
- `/Users/rob/Projects/trapid/backend/app/models/purchase_order_line_item.rb` - PO lines
- `/Users/rob/Projects/trapid/backend/app/models/payment.rb` - Payment tracking
- `/Users/rob/Projects/trapid/backend/app/models/pricebook_item.rb` - Price items with risk scoring
- `/Users/rob/Projects/trapid/backend/app/models/price_history.rb` - Price audit trail
- `/Users/rob/Projects/trapid/backend/app/models/estimate_review.rb` - AI plan review

### Backend Services & Controllers
- `/Users/rob/Projects/trapid/backend/app/services/json_web_token.rb` - JWT encoding/decoding
- `/Users/rob/Projects/trapid/backend/app/controllers/api/v1/authentication_controller.rb` - Auth endpoints
- `/Users/rob/Projects/trapid/backend/app/controllers/api/v1/omniauth_callbacks_controller.rb` - OAuth
- `/Users/rob/Projects/trapid/backend/app/controllers/application_controller.rb` - Auth middleware (PLACEHOLDER)

### Frontend Components (17+ files)
- `/Users/rob/Projects/trapid/frontend/src/contexts/AuthContext.jsx` - Auth state
- `/Users/rob/Projects/trapid/frontend/src/pages/Login.jsx` - Login page
- `/Users/rob/Projects/trapid/frontend/src/pages/ContactsPage.jsx` - Contacts list
- `/Users/rob/Projects/trapid/frontend/src/pages/ContactDetailPage.jsx` - Contact detail
- `/Users/rob/Projects/trapid/frontend/src/pages/SuppliersPage.jsx` - Suppliers list
- `/Users/rob/Projects/trapid/frontend/src/pages/SupplierDetailPage.jsx` - Supplier detail
- `/Users/rob/Projects/trapid/frontend/src/pages/PurchaseOrdersPage.jsx` - PO list
- `/Users/rob/Projects/trapid/frontend/src/pages/PurchaseOrderDetailPage.jsx` - PO detail
- `/Users/rob/Projects/trapid/frontend/src/pages/PriceBooksPage.jsx` - Price books
- Contact components in `/Users/rob/Projects/trapid/frontend/src/components/contacts/`

### Database Migrations (Key ones)
- `20251029024027_create_users.rb`
- `20251103082219_create_contacts.rb`
- `20251103074835_create_price_book_system.rb`
- `20251104030009_create_purchase_orders.rb`
- `20251104032250_create_supplier_contacts.rb`
- `20251110042814_add_role_to_users.rb`
- `20251112203249_create_construction_contacts.rb`
- `20251112205154_create_contact_relationships.rb`
- `20251112213631_create_payments.rb`

---

## Authentication

### How It Works
1. User signs up/logs in with email & password
2. Server validates credentials and generates JWT token
3. Frontend stores token (localStorage/sessionStorage)
4. All API requests include token in Authorization header
5. Backend validates token in middleware

### Key Classes
- `JsonWebToken` - Encodes/decodes tokens, 24-hour expiry
- `User` - has_secure_password (bcrypt)
- `AuthenticationController` - Handles signup/login
- `OmniauthCallbacksController` - Handles Office 365 OAuth

### Gems
- `bcrypt` - Password hashing
- `jwt` - Token generation
- `omniauth` + `omniauth-microsoft-office365` - OAuth

### Issue to Fix
❌ `ApplicationController#authorize_request` is a PLACEHOLDER
- Currently returns default test user on every request
- Does NOT validate JWT from headers
- Need to implement actual JWT token validation

---

## User Roles (6 types)

```
user              - Basic user
admin             - Full system access
product_owner     - Product management
estimator         - Estimation features
supervisor        - Supervision/site tasks
builder           - Builder/field tasks
```

### Permission Methods
- `admin?`, `user?`, `product_owner?`, `estimator?`, `supervisor?`, `builder?`
- `can_create_templates?` - admin || product_owner
- `can_edit_schedule?` - admin || product_owner || estimator
- `can_view_supervisor_tasks?` - admin || supervisor
- `can_view_builder_tasks?` - admin || builder

### Password Requirements
- 12+ characters
- 1+ uppercase, lowercase, digit, special character

---

## Contact System

### Contact Types (Can have multiple)
- `customer` - Client/customer
- `supplier` - Supplier/vendor
- `sales` - Sales contact
- `land_agent` - Land agent

### Key Methods
- `display_name` - Returns best available name
- `primary_phone` - Mobile or office phone
- `is_customer?`, `is_supplier?`, `is_sales?`, `is_land_agent?` - Type checks
- `total_purchase_orders_count`, `total_purchase_orders_value` - PO metrics

### Related Models
- **ContactPerson** - Individual people in a contact organization
- **ContactRelationship** - Bidirectional relationships (previous_client, subsidiary, partner, etc.)
- **ContactActivity** - Audit log of all changes
- **ContactGroup** - Xero contact groups
- **ContactRole** - Custom roles for contacts in constructions
- **ConstructionContact** - Link contacts to specific jobs

---

## Supplier System

### Current Status
TRANSITIONING from separate Supplier model to Contact-based model
- Old: Supplier table with separate fields
- New: Contact with contact_types=['supplier']
- During transition: supplier_id foreign keys point to contact_id

### Supplier Metrics
- `rating` - 0-5 stars
- `response_rate` - 0-100%
- `avg_response_time` - hours
- `supplier_code` - unique identifier
- `markup_percentage` - 0-100%

### Matching
- `confidence_score` - 0-1 match confidence
- `match_type` - How was it matched (exact, fuzzy, etc.)
- `is_verified` - Manually verified
- Status: unmatched → needs_review → verified

---

## Purchase Orders

### Statuses (8 states)
```
draft          → Can edit
pending        → Awaiting approval
approved       → Manager approved
sent           → Sent to supplier
received       → Goods received
invoiced       → Invoice received
paid           → Fully paid
cancelled      → Cancelled
```

### Payment Statuses (4 states)
```
pending        → No invoice yet
part_payment   → Partially invoiced/paid
complete       → Fully invoiced/paid (95-105%)
manual_review  → Discrepancy detected
```

### Key Methods
- `approve!(user_id)` - Approve PO
- `send_to_supplier!()` - Send and set ordered_date
- `mark_received!()` - Mark received and set received_date
- `apply_invoice!(amount, date, ref)` - Update from invoice
- `determine_payment_status(amount)` - Calculate payment status

### Line Items
- Links to pricebook items for pricing
- Auto-calculates 10% GST tax
- Price drift detection (warns if >10% difference from pricebook)

---

## Payments

### Payment Methods
- bank_transfer
- check
- credit_card
- cash
- eft
- other

### Key Fields
- `amount` - Payment amount
- `payment_date` - When paid
- `reference_number` - Check number, transaction ID, etc.
- `xero_payment_id` - Xero sync ID
- `xero_synced_at` - When synced
- `xero_sync_error` - Sync error message if any

### Callbacks
- After payment save/destroy: Recalculate PO payment_status
- Compares total payments to PO total

---

## Rating & Review Systems

### Supplier Ratings
- Fields: rating (0-5), response_rate (0-100%), avg_response_time (hours)
- Methods: rating_stars(), response_rate_percentage(), avg_response_time_formatted()
- Composite: supplier_reliability_score (0-100)

### Price Item Risk Scoring
Composite score from 4 factors:
- Price Freshness (40%) - Fresh/Needs Confirmation/Outdated
- Supplier Reliability (20%) - Based on rating, response_rate, response_time
- Price Volatility (20%) - Stable/Moderate/Volatile
- Missing Info (20%) - No supplier/brand/category

Risk Levels: low (<25) → medium (25-50) → high (50-75) → critical (>75)

### Estimate Reviews (AI)
- status: pending → processing → completed/failed
- confidence_score: 0-100
- Tracks: items_mismatched, items_missing, items_extra
- Methods: total_discrepancies(), has_discrepancies?()

---

## Database Schema Quick View

```
users
├─ email, password_digest, name
├─ role, assigned_role
├─ oauth fields (provider, uid, oauth_token, oauth_expires_at)
└─ password reset tokens

contacts
├─ contact_types (array), primary_contact_type
├─ name, email, phones, address
├─ supplier metrics (rating, response_rate, avg_response_time)
├─ xero fields (xero_id, xero_contact_number, etc.)
└─ banking info (for suppliers)

contact_persons, contact_addresses, contact_groups
contact_relationships (source → related, bidirectional)
contact_activities (audit log)

suppliers (legacy)
├─ contact_id (FK), supplier_code
├─ metrics, matching fields
└─ trade categories

purchase_orders
├─ purchase_order_number (unique)
├─ supplier_id, construction_id, estimate_id
├─ status, payment_status
├─ financial (sub_total, tax, total, budget)
├─ xero fields
└─ dates, approvals

purchase_order_line_items
├─ description, quantity, unit_price
├─ tax_amount, total_amount
└─ pricebook_item_id (link to pricebook)

payments
├─ purchase_order_id
├─ amount, payment_date, payment_method
├─ xero sync fields

pricebook_items
├─ item_code, item_name, category
├─ current_price, supplier_id
├─ image fields, QR code
└─ risk scoring fields

price_histories
├─ pricebook_item_id, supplier_id
├─ old_price, new_price
└─ change_reason, changed_by_user_id
```

---

## API Endpoints Summary

```
POST   /api/v1/auth/signup                      - Register
POST   /api/v1/auth/login                       - Login
GET    /api/v1/auth/me                          - Current user

GET    /api/v1/contacts                         - List
POST   /api/v1/contacts                         - Create
GET    /api/v1/contacts/:id                     - Show
PATCH  /api/v1/contacts/:id                     - Update
DELETE /api/v1/contacts/:id                     - Delete
POST   /api/v1/contacts/merge                   - Merge duplicates
GET    /api/v1/contacts/:id/relationships       - Related contacts

POST   /api/v1/suppliers                        - Create
GET    /api/v1/suppliers                        - List
POST   /api/v1/suppliers/:id/link_contact       - Link to contact

POST   /api/v1/purchase_orders                  - Create
GET    /api/v1/purchase_orders                  - List
GET    /api/v1/purchase_orders/:id              - Show
POST   /api/v1/purchase_orders/:id/approve      - Approve
POST   /api/v1/purchase_orders/:id/send_to_supplier - Send
POST   /api/v1/purchase_orders/:id/mark_received    - Receive
POST   /api/v1/purchase_orders/:po_id/payments      - Add payment

PATCH  /api/v1/payments/:id                     - Update payment
POST   /api/v1/payments/:id/sync_to_xero        - Sync to Xero
```

---

## Common Tasks

### Add New User Role
1. Update `ROLES` constant in User model
2. Add helper method: `def new_role?; role == 'new_role'; end`
3. Add permission methods: `def can_do_something?; admin? || new_role?; end`

### Link Contact to Supplier
1. Use SupplierContact junction
2. Set is_primary if main contact
3. Or: Update supplier.contact_id to point to contact

### Create Purchase Order from Estimate
1. Create PO with estimate_id
2. Create line_items from estimate line_items
3. calculate_totals callback auto-sums

### Record Payment Against PO
1. Create Payment record
2. update_purchase_order_payment_status callback recalculates status
3. If complete: determine_payment_status may set to 'complete'

### Update Pricebook Item Risk Score
1. Price change triggers track_price_change callback
2. Creates PriceHistory record
3. Next view recalculates risk_score based on new price

---

## Production Readiness Checklist

- [ ] Implement actual JWT validation in ApplicationController
- [ ] Add rate limiting for auth endpoints
- [ ] Implement password reset email flow
- [ ] Complete OAuth callback security
- [ ] Add contact merge conflict resolution
- [ ] Implement audit log for all contact changes
- [ ] Complete Xero sync error handling
- [ ] Add invoice matching algorithm refinement
- [ ] Implement contact deduplication service
- [ ] Add comprehensive permissions/authorization checks


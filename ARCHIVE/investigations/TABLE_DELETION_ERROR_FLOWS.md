# Table Deletion - Error Flow Diagrams

## Happy Path (Ideal)

```
User clicks Delete
       ↓
[Frontend Validation]
  - is_live? NO ✓
  - records? NO ✓
  - references? NO ✓
  - confirm? YES ✓
       ↓
[DELETE /api/v1/tables/123]
       ↓
[Backend set_table]
  - find table ✓
       ↓
[Backend Destroy Action]
  - is_live? NO ✓
  - record_count? 0 ✓
  - references? 0 ✓
       ↓
[TableBuilder.drop_database_table]
  - DROP TABLE ✓
  - remove class ✓
       ↓
[Table.destroy]
  - delete record ✓
       ↓
Response: { success: true }
       ↓
[Frontend]
  - fetchTables()
  - List updated ✓
```

---

## Error Path 1: Table Becomes Live (RACE CONDITION)

```
T0: User A views tables
    - Table "Contacts" is_live=false ✓

T1: User A clicks delete on "Contacts"
    [Frontend Check: is_live?]
    - false ✓ (stale data from T0)

T2: [DELETE request sent to backend]

T3: User B goes to settings
    - Table "Contacts" is_live=false

T4: User B clicks "Make Live"
    - Table "Contacts" is_live=true ✓

T5: [DELETE request arrives at backend]
    [Backend set_table]: Found ✓
    [Destroy check: is_live?]
    - Result: true ❌ SHOULD FAIL

ACTUAL RESULT (Current Code):
    - Backend returns error ✓
    - User A sees alert ✓

PROBLEM: What if no lock?
    - Both processes run concurrently
    - Table might be dropped while live!
    - Data loss! ❌

SOLUTION: Use pessimistic locking
    @table = Table.lock.find(params[:id])
    ↓
    Table "Contacts" now locked
    ↓
    User A: gets lock, validates is_live=true, fails ✓
    User B: waits for lock, can't make live until A's txn ends
```

---

## Error Path 2: Records Added During Deletion (RACE CONDITION)

```
T0: User views table list
    - Table "Customers" record_count=0 ✓

T1: User clicks Delete
    [Frontend Check: record_count > 0?]
    - false ✓ (current state)

T2: [DELETE /api/v1/tables/123 sent]

T3: User in data entry form
    - Adds record to "Customers"
    - INSERT succeeds ✓

T4: [DELETE arrives at backend]
    [Backend Check: record_count > 0?]
    - true now! But check already passed? ❌

SCENARIO A (Current Code - Lost Lock Time):
    T4.1: Check record_count
          SELECT count(*) FROM customers_abc123
          Result: 1 ✓
    T4.2: Return error ✓

SCENARIO B (Current Code - No Transaction):
    T4.1: Check record_count = 0 ✓
    T4.2: Get drop result
    T4.3: [GAP] User C adds record to table
    T4.4: DROP TABLE customers_abc123
          Success ✓ (record dropped!) ❌
    T4.5: Table.destroy

    RESULT: Record orphaned, data lost! ❌

SOLUTION: Wrap in transaction
    Table.transaction do
      @table = Table.lock.find(id)
      ↓
      Other users can't insert while checking
      ↓
      count_records
      if count > 0: ROLLBACK ✓
      else: DROP TABLE + destroy ✓
    end
```

---

## Error Path 3: Network Failure

```
User clicks Delete
  ↓
confirm() = YES
  ↓
api.delete(/api/v1/tables/123)
  │
  └─→ [Network Request Sent]
  │        ↓
  │   [Server Processing]
  │   [DROP TABLE started]
  │   ↓
  │   NETWORK TIMEOUT ❌
  │   ↗
[fetch() rejects]
  ↓
catch(err) {
  console.error('Failed to delete table:', err)
  alert(err.message)
}
  ↓
User sees: "API request failed with status 500"
           or "Network request timeout"
           or just "Error" ❌
  ↓
User confused:
  - Was the table deleted?
  - Should I try again?
  - Will it delete twice?

CURRENT CODE ISSUES:
  ❌ No .retryAfter header check
  ❌ No status code analysis
  ❌ No timeout specified (infinite wait possible)
  ❌ Error format inconsistent
     Backend sends: { errors: ["..."] }
     Code expects: { error: "..." }

ACTUAL API ERROR RESPONSE:
  Status: 500
  Body: {
    success: false,
    errors: ["Database connection timeout"]
  }

CURRENT CODE PARSING:
  errorData = JSON.parse(response) → { success: false, errors: [...] }
  errorData.error → undefined
  errorData.errors → ["..."] ← IGNORED!

  Throws: Error("API request failed with status 500")
          ↑ Unhelpful!

SOLUTION:
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      const { errors, error } = await response.json()
      const msg = errors?.[0] || error

      if (response.status === 409) {
        // Conflict - retry
        return await retry(deleteTable, 3)
      } else {
        throw new Error(msg)
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      showError('Request timeout. Please try again.')
    } else {
      showError(err.message)
    }
  }
```

---

## Error Path 4: Database Lock Timeout

```
User A: DELETE /api/v1/tables/123
         ↓
         [Get pessimistic lock on table]
         ↓
         [Long-running query locking the table]
         ↓
         [DROP TABLE statement queued]

After 5 seconds:
  PostgreSQL: "ERROR: Lock timeout acquired"

Current Code (table_builder.rb):
  rescue => e
    if e.message.include?("does not exist")
      { success: true }  # Wrong classification!
    else
      @errors << "Failed to drop database table: #{e.message}"
      { success: false, errors: @errors }
    end
  end

Result sent to controller:
  { success: false, errors: ["Failed to drop database table: Lock timeout acquired"] }

Controller returns:
  Status: 422 (Unprocessable Entity)
  Body: {
    success: false,
    errors: ["Failed to drop database table: Lock timeout acquired"]
  }

Frontend receives:
  alert("Failed to drop database table: Lock timeout acquired")

User sees: "Failed to drop database table: Lock timeout acquired"

USER PERSPECTIVE:
  - Generic error message ❌
  - No indication this is retryable
  - User doesn't know to try again
  - Unclear if table still exists

PROPER ERROR HANDLING:
  rescue ActiveRecord::Deadlocked => e
    {
      success: false,
      retryable: true,
      errors: ["Database is busy. Please try again in a moment."]
    }
  end

  # In controller
  if drop_result[:retryable]
    status = :conflict  # 409
  else
    status = :unprocessable_entity  # 422
  end

  render json: drop_result, status: status

Frontend receives 409:
  ↓
  Shows: "Database is busy. Retrying..."
  ↓
  setTimeout(() => retry(), 2000)
  ↓
  Eventually succeeds ✓
```

---

## Error Path 5: Concurrent Deletion

```
SCENARIO: Two users both click delete on Table X

T0: Table X exists (is_live=false, records=0, no refs)

T1: User A: DELETE /api/v1/tables/X
    User B: DELETE /api/v1/tables/X

    Both requests in flight simultaneously ↓

T2: Request A arrives at backend
    [set_table]: Find table X ✓
    [Validation checks all pass] ✓
    [Starts drop_database_table]

    Request B arrives at backend
    [set_table]: Find table X ✓ (still exists)
    [Validation checks all pass] ✓
    [Starts drop_database_table]

    BOTH ARE RUNNING! ❌

T3: Request A: DROP TABLE user_x_abc123
    Result: Success ✓
    Request A: @table.destroy
    Result: Success ✓
    Response A: { success: true }

T4: Request B: DROP TABLE user_x_abc123
    Result: Success ✓ (if_exists: true handles not found)
    Request B: @table.destroy
    Result: FAILURE ❌ (record already deleted)
    OR: Success ✓ (if Rails doesn't error)

T5: Response A sent to User A
    User A: Table deleted ✓

    Response B sent to User B
    User B: Table deleted ✓ (but was already gone!)

    Both frontend lists refresh:
    Table X not in list ✓

PROBLEM: Works by accident because:
  - if_exists: true
  - destroy on non-existent record doesn't error
  - Concurrent deletes don't break DB

ACTUAL PROBLEM: Not safe design!
  - What if User B's request arrived between A's
    drop_table and table.destroy?
  - What if database doesn't support if_exists?
  - What about other operations that aren't idempotent?

SOLUTION: Pessimistic locking

  T1: User A: DELETE /api/v1/tables/X
      [Table.lock.find] → Lock acquired ✓

      User B: DELETE /api/v1/tables/X
      [Table.lock.find] → WAIT (locked by A)

  T2: User A completes all operations
      [Table.destroy] completes
      Transaction commits
      Lock released

  T3: User B: [Table.lock.find] → Table doesn't exist!
      ActiveRecord::RecordNotFound
      Response: { error: 'Table was deleted by another user' }
      Status: 409 Conflict

      User B sees: "Table was already deleted"

This is the correct safe pattern! ✓
```

---

## Error Path 6: Lookup Reference Added During Delete

```
T0: Table "Companies" exists
    Table "Customers" exists
    No references yet

T1: User A: DELETE /api/v1/tables/Companies
    [Backend Check: lookup references]
    SELECT * FROM columns WHERE lookup_table_id = Companies.id
    Result: empty ✓

    [Proceeds to drop_table]

T2: User B: Adds lookup column to "Customers"
    belongs_to "Companies"
    INSERT INTO columns (...)
    Success ✓

T3: User A: [DROP TABLE companies_abc123]
    Success ✓ (table dropped)

    [Remove dynamic model]
    Success ✓

    [table.destroy]
    Success ✓

    Response: { success: true }

T4: User B's UI:
    [Refresh form to see columns]
    [Load lookup options for "Companies"]
    SELECT * FROM companies_abc123 WHERE id IN (...)

    ERROR: relation "companies_abc123" does not exist ❌

    Form breaks, user confused

VISUAL:
    Companies table
          ↓ (deleted)
    Broken lookup reference
          ↓
    Data integrity issue

SOLUTION: Transaction with lock
    Table.transaction do
      @table = Table.lock.find(id)

      # Re-check inside transaction
      Column.lock.where(lookup_table_id: id)
      if references.any?
        raise ActiveRecord::Rollback
      end

      # Now safe to drop
      drop_database_table
      @table.destroy
    end

    Timeline becomes:
    T1: A locks Companies table
    T2: B tries to add lookup column
        INSERT INTO columns (lookup_table_id = Companies.id)
        WAIT (transaction lock prevents?)

        Actually, doesn't prevent at column level...
        Needs foreign key constraint!

        ALTER TABLE columns
        ADD CONSTRAINT fk_lookup_table
        FOREIGN KEY (lookup_table_id)
        REFERENCES tables(id)
        ON DELETE RESTRICT  ← Key!

    T2: B's INSERT fails:
        "ERROR: Foreign key violation
         Cannot add lookup column for non-existent table"

        User B sees helpful error ✓

So the REAL solution is:
  1. Add FK constraint with ON DELETE RESTRICT
  2. Add transaction/lock in deletion
  3. Both together provide safety ✓
```

---

## Error Path 7: Missing Table (404)

```
SCENARIO: User A deletes table, User B tries to delete moments later

T0: Tables list shows "Contacts"

T1: User A: DELETE /api/v1/tables/123
    [set_table]: Table.find(123) → Found ✓
    [Validation]: all pass ✓
    [drop_database_table]: Success ✓
    [table.destroy]: Success ✓
    Response: { success: true }

T2: User B: DELETE /api/v1/tables/123
    [set_table]: Table.find(123)

    Raises: ActiveRecord::RecordNotFound

    Caught by rescue:
    render json: { error: 'Table not found' }, status: :not_found

Response B:
    Status: 404
    Body: { error: 'Table not found' }

User B sees:
    alert("Table not found")

ISSUE: Inconsistent error format
    set_table responds with: { error: '...' }
    destroy responds with: { success: false, errors: [...] }

Frontend code:
    catch(err) {
      alert(err.message || 'Failed to delete table')
    }

    Receives: "Table not found"
    Shows: "Table not found" ✓ (works but inconsistent)

BETTER:
    Always use { success, errors: [] } format

    rescue ActiveRecord::RecordNotFound
      render json: {
        success: false,
        errors: ['Table not found. It may have been deleted by another user.']
      }, status: :not_found
    end

Frontend:
    catch(err) {
      if (err.includes('deleted by another user')) {
        showMessage('Table was deleted. Refreshing...')
        fetchTables()
      } else {
        showError(err.message)
      }
    }

    Provides context ✓
    User knows to refresh ✓
```

---

## Error Path 8: Permission Denied

```
ATTACK SCENARIO: Unauthenticated user

T1: curl -X DELETE http://api/tables/123

    No authentication header
    No session cookie

Current code:
    class TablesController < ApplicationController
      # No before_action authentication!
      def destroy
        @table = Table.find(params[:id])
        # ... proceeds to delete!
      end
    end

    ✓ Table deleted
    ✓ No error
    ✓ SECURITY BREACH ❌

User (attacker) sees:
    { success: true }

Someone's table deleted! ❌

PROPER IMPLEMENTATION:
    class ApplicationController < ActionController::API
      before_action :authenticate_user!
    end

    def authenticate_user!
      header = request.headers['Authorization']
      unless header&.start_with?('Bearer ')
        render json: {
          error: 'Unauthorized'
        }, status: :unauthorized
        return
      end

      token = header.split(' ')[1]
      @current_user = User.from_token(token)

      unless @current_user
        render json: {
          error: 'Invalid token'
        }, status: :unauthorized
      end
    end

    class TablesController < ApplicationController
      before_action :authorize_table_access!, only: [:destroy]

      def authorize_table_access!
        unless @current_user.can_delete_table?(@table)
          render json: {
            success: false,
            errors: ['You do not have permission to delete this table']
          }, status: :forbidden
        end
      end
    end

Attacker tries again:
    curl -X DELETE http://api/tables/123

    Response:
    Status: 401 (Unauthorized)
    Body: { error: 'Unauthorized' }

    ✓ Blocked! ✓

With valid token but no permission:
    curl -X DELETE http://api/tables/123 \
      -H "Authorization: Bearer token"

    If user_id != table owner:
    Response:
    Status: 403 (Forbidden)
    Body: {
      success: false,
      errors: ['You do not have permission to delete this table']
    }

    ✓ Blocked! ✓
```

---

## Complete State Transitions

```
TABLE DELETION STATE MACHINE

[LIVE]
  ↓ (error) Can't delete live table
  (must set to draft first)

[DRAFT]
  ↓ (check: has records?)

  YES → Error: Cannot delete with records
       ↓ (user must delete records)
       Return to DRAFT

  NO → (check: has references?)

       YES → Error: Cannot delete with references
             ↓ (user must remove lookup columns)
             Return to DRAFT

       NO → [DELETING]
            ↓ (acquire lock)
            ↓ (re-validate state hasn't changed)
            ↓ (drop database table)
            ↓ (remove from ORM)
            ↓ (delete record)

       [DELETED] ✓ or
       [DELETE_FAILED] ↓ (retry, manual intervention)
```

---

## Monitoring & Alerting

```
METRICS TO TRACK:

1. Delete Success Rate
   ━━━━━━━━━━━━━━━━━━━
   Success: ████████ 94%
   Failed:  ██ 4%
   Unknown: █ 2%

   Alert: If < 90% success

2. Error Type Distribution
   ━━━━━━━━━━━━━━━━━━━━━━━
   Is Live:        20%  ← User error, OK
   Has Records:    45%  ← User error, OK
   Lock Timeout:    8%  ← System issue, monitor
   Permission:      2%  ← Security issue, alert
   Network:         5%  ← Infrastructure issue
   Unknown:        20%  ← Bug, investigate

   Alert: If Unknown > 5%

3. Delete Duration
   ━━━━━━━━━━━━━━━━
   P50:  120ms
   P95:  250ms
   P99: 1200ms

   Alert: If P99 > 5000ms (database issue?)

4. Concurrent Delete Attempts
   ━━━━━━━━━━━━━━━━━━━━━━━━━
   Same table: 3 in last hour
   Different tables: 120 in last hour

   Alert: If >50 concurrent attempts/hour
          (indicates user confusion or attack?)
```

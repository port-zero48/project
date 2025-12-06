# Investment Plan Feature - Component Architecture

## Component Hierarchy

```
UserDashboard
├── Header
├── Sidebar
├── DepositNotification ⭐ NEW
│   └── Shows notification when deposit approved
│       └── Contains InvestmentPlan modal trigger
├── BalanceCard
│   └── Displays current balance
├── MarketChart
└── Other Dashboard Views
```

## Admin Flow

```
AdminDashboard
└── TransactionRequests ⭐ UPDATED
    ├── Transaction Table
    │   ├── View Slip Modal (existing)
    │   └── Approve Button ⭐ ENHANCED
    │       └── Triggers InvestmentPlan modal
    │           └── Shows user's investment opportunities
    └── InvestmentPlan Modal ⭐ NEW
        └── Displays eligible plans
            └── User can select plan
                └── Plan saved to database
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEPOSIT WORKFLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. USER DEPOSITS
   User → Select Method (Card/Transfer/Crypto)
        → Enter Amount
        → Submit Payment
        → Request created (status: pending)

2. ADMIN REVIEWS
   Admin → Transaction Requests Panel
        → View pending request
        → Can view payment slip if transfer/crypto

3. ADMIN APPROVES ⭐ INVESTMENT INTEGRATION STARTS
   Admin clicks Approve
        ↓
   completeDeposit(depositId) runs
        ├─ Fetch deposit: {amount, user_id}
        ├─ Fetch user: {account_balance}
        ├─ Calculate: new_balance = old_balance + amount
        ├─ Update: users.account_balance = new_balance
        ├─ Update: deposits.status = 'completed'
        └─ Fetch updated user data
             ↓
   InvestmentPlan Modal Shows ⭐
        ├─ Display user's new balance
        └─ Calculate eligible plans
             ↓
   Admin sees plan options (can close modal)
             ↓
   Meanwhile, system notifies user...

4. USER SEES NOTIFICATION ⭐
   User logs in / dashboard refreshes
        ↓
   DepositNotification component checks
        ├─ Query: recent completed deposits
        ├─ Show notification (last 5 minutes)
        └─ Display amount & new balance
             ↓
   User clicks "View Investment Plans"
        ↓
   InvestmentPlan Modal Opens ⭐
        ├─ Calculate total balance
        ├─ Filter eligible plans
        └─ Display plan cards
             ↓
   User selects a plan
        ↓
   createInvestmentPlan() runs
        ├─ Calculate returns (monthly & annual)
        ├─ Create record in investment_plans table
        │   {user_id, plan_name, amount, rates, status: active}
        └─ Show success message
             ↓
   Plan created! Returns start accruing...
```

## Component File Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── InvestmentPlan.tsx ⭐ NEW
│   │   │   ├── Props: user, onClose, depositAmount
│   │   │   ├── State: selectedPlan, isProcessing
│   │   │   ├── Plan tiers (5 levels)
│   │   │   ├── Eligibility logic
│   │   │   ├── Return calculations
│   │   │   └── API call: createInvestmentPlan()
│   │   │
│   │   ├── DepositNotification.tsx ⭐ NEW
│   │   │   ├── Props: user
│   │   │   ├── State: recentDeposit, showInvestment
│   │   │   ├── Auto-detects recent deposits
│   │   │   ├── Shows 5-min window notification
│   │   │   ├── Contains InvestmentPlan trigger
│   │   │   └── Dismissible alert
│   │   │
│   │   ├── BalanceCard.tsx (existing)
│   │   ├── Deposit.tsx (existing)
│   │   └── ... other components
│   │
│   ├── admin/
│   │   └── TransactionRequests.tsx ⭐ UPDATED
│   │       ├── Existing: Table, modals, slip viewer
│   │       ├── New: Investment plan modal state
│   │       ├── Modified: handleApprove() now triggers plan modal
│   │       ├── Fetches user data after approval
│   │       └── Shows InvestmentPlan component
│   │
│   └── ... other components
│
├── services/
│   └── transactions.ts ⭐ UPDATED
│       ├── completeDeposit() (already updates balance)
│       ├── createInvestmentPlan() ⭐ NEW
│       │   └── Saves plan with calculated returns
│       └── fetchUserInvestmentPlans() ⭐ NEW
│           └── Retrieves user's active plans
│
├── types/
│   └── index.ts (already has accountBalance, investmentBalance)
│
└── pages/
    └── UserDashboard.tsx ⭐ UPDATED
        └── Added DepositNotification component
```

## State Management

### InvestmentPlan Component
```typescript
const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
const [isProcessing, setIsProcessing] = useState(false)
```

### DepositNotification Component
```typescript
const [recentDeposit, setRecentDeposit] = useState<RecentDeposit | null>(null)
const [showInvestment, setShowInvestment] = useState(false)
const [dismissed, setDismissed] = useState(false)
```

### TransactionRequests Component
```typescript
const [showInvestmentPlan, setShowInvestmentPlan] = useState(false)
const [investmentUser, setInvestmentUser] = useState<User | null>(null)
const [depositAmount, setDepositAmount] = useState(0)
```

## Database Tables

### investment_plans (NEW)
```sql
CREATE TABLE investment_plans (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (FK to users),
  plan_name TEXT,           -- "Beginner", "Passive", etc.
  amount DECIMAL,           -- Investment amount
  annual_return_rate DECIMAL, -- 5, 8, 12, 15, 20
  monthly_return DECIMAL,   -- Calculated return
  annual_return DECIMAL,    -- Calculated return
  status TEXT,              -- active, completed, cancelled
  started_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- RLS Policies:
-- SELECT: user owns it OR user is admin
-- INSERT: user can insert own
-- UPDATE: user can update own OR admin
```

### users (MODIFIED)
```sql
-- Already had these columns:
account_balance DECIMAL,      -- Updated by completeDeposit()
investment_balance DECIMAL    -- For future use
```

### deposit_requests (EXISTING)
```sql
-- Uses existing deposit_requests table
-- Status: pending → completed (when approved)
-- Amount used to update user balance
```

## API Calls Sequence

### Approval Flow
```
1. Admin clicks approve
   ↓
2. await completeDeposit(depositId)
   - GET deposit_requests where id = depositId
   - GET users where id = user_id (for balance)
   - UPDATE users set account_balance = new_balance
   - UPDATE deposit_requests set status = 'completed'
   ↓
3. await supabase.from('users').select(...where id = user_id)
   - Fetch updated user data with new balance
   ↓
4. setShowInvestmentPlan(true)
   - Modal displays
```

### Plan Selection Flow
```
1. User clicks "Select Plan"
   ↓
2. await createInvestmentPlan(userId, planName, amount, rate)
   - INSERT into investment_plans
   - Returns saved record
   ↓
3. Show success alert
   ↓
4. onClose() - modal closes
```

### Notification Flow
```
1. UserDashboard mounts
   ↓
2. DepositNotification component loads
   ↓
3. useEffect: checkRecentDeposit()
   - GET deposit_requests where user_id = userId
   - Filter status = 'completed'
   - Get most recent
   - Check if within 5 minutes
   ↓
4. If found and recent: show notification
   ↓
5. User clicks button: show InvestmentPlan modal
```

## Props & Type Definitions

### InvestmentPlanProps
```typescript
interface InvestmentPlanProps {
  user: User                    // Current user
  onClose: () => void          // Close modal callback
  depositAmount: number        // New deposit amount added to balance
}
```

### PlanTier
```typescript
interface PlanTier {
  id: string
  name: string
  minAmount: number
  maxAmount: number
  returnRate: number           // Annual %
  color: string
  icon: string
}
```

### DepositNotificationProps
```typescript
interface DepositNotificationProps {
  user: User                   // Current user for balance checks
}
```

### RecentDeposit
```typescript
interface RecentDeposit {
  id: string
  amount: number
  created_at: string
}
```

## Conditional Rendering Logic

### InvestmentPlan Component
```
IF totalBalance < minAmount
  ├─ Show: "Insufficient Funds" error
  └─ Exit modal
ELSE
  ├─ Calculate eligible plans
  ├─ IF eligible.length > 0
  │  └─ Show eligible plans prominently
  ├─ Show all plans for reference
  └─ Enable plan selection
```

### DepositNotification Component
```
IF no recentDeposit or dismissed
  ├─ Return null (hidden)
ELSE
  ├─ Show green notification card
  ├─ If user clicks "View Plans"
  │  └─ Show InvestmentPlan modal
  └─ If user clicks X
      └─ Set dismissed = true
```

## Color Coding

### Plan Tiers (Tailwind Classes)
```
Beginner   → blue    (border-blue-500, bg-blue-500/10)
Passive    → green   (border-green-500, bg-green-500/10)
Active     → yellow  (border-yellow-500, bg-yellow-500/10)
Professional → purple (border-purple-500, bg-purple-500/10)
Royalty    → red     (border-red-500, bg-red-500/10)
```

### Status Badges
```
Eligible plans     → Colored border + highlight
Ineligible plans   → Gray (border-gray-600)
"Insufficient"    → Red background (bg-red-500/10)
"Recent deposit"   → Green notification (bg-green-900/80)
```

## Performance Optimizations

1. **Lazy loading**: Investment modal only fetches user data when needed
2. **Query optimization**: Indexes on user_id and status in investment_plans
3. **Client-side filtering**: Plan eligibility calculated in component
4. **Memoization**: Color classes pre-defined as constants
5. **Early exit**: Checks for dismissed notifications early
6. **5-minute window**: Limits notification database queries

## Error Handling

```
Try-Catch blocks:
├─ completeDeposit() - Handles balance update errors
├─ createInvestmentPlan() - Validates data before saving
├─ checkRecentDeposit() - Handles query failures gracefully
└─ handleApprove() - Shows user-friendly alerts

User Feedback:
├─ Success: Modal closes + alert shown
├─ Error: Alert with error message
├─ Insufficient funds: Red error card displayed
└─ Network error: Try again button provided
```

---

This architecture ensures clean separation of concerns while maintaining seamless integration with your existing deposit workflow.

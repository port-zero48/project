# Withdrawal System - Visual Flow Guide

## 🎯 Complete User & Admin Journey

### STEP 1: User Uploads Receipt
```
┌─────────────────────────────────────────┐
│     Withdraw Funds                      │
├─────────────────────────────────────────┤
│                                         │
│  Progress: ① ➜ ② ➜ ③                   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ 💚 Your Balance                  │   │
│  │ $5,000.00                        │   │
│  │ Available balance                │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Withdrawal Details               │   │
│  │                                  │   │
│  │ Withdrawal Fee: $10.00 💛        │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Send Payment To                  │   │
│  │ Bank Name: First National Bank   │   │
│  │ Acct Holder: Investment Admin    │   │
│  │ Acct Number: 1234567890          │   │
│  │ Routing: 021000021               │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Amount to Withdraw (USD)               │
│  ┌─────────────────────────────────┐    │
│  │ [    100                     ]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Continue to Upload Proof]             │
└─────────────────────────────────────────┘
```

---

### STEP 2: Upload Proof with Countdown
```
┌─────────────────────────────────────────┐
│     Withdraw Funds                      │
├─────────────────────────────────────────┤
│                                         │
│  Progress: ✓ ① ➜ ② ➜ ③                 │
│                                         │
│  ℹ️  Transfer $100.00 to the account    │
│  above and upload proof of payment      │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Upload Payment Proof             │   │
│  │ ⏱️ 14:32 (countdown timer)        │   │
│  │                                  │   │
│  │  ┌──────────────────────────┐    │   │
│  │  │  📄 Drag & drop here     │    │   │
│  │  │  or click to upload      │    │   │
│  │  │                          │    │   │
│  │  │  PNG, JPG, PDF (max 10MB)│    │   │
│  │  └──────────────────────────┘    │   │
│  │                                  │   │
│  │  ✅ receipt.pdf                  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  [Submit Proof & Complete Request]      │
└─────────────────────────────────────────┘
```

---

### STEP 3: Success
```
┌─────────────────────────────────────────┐
│     Withdraw Funds                      │
├─────────────────────────────────────────┤
│                                         │
│  Progress: ✓ ① ✓ ② ➜ ③                 │
│                                         │
│          ✅ (green checkmark)           │
│                                         │
│   Withdrawal Submitted!                 │
│   Your proof has been uploaded and      │
│   sent to admin for approval            │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Amount: $100.00                  │   │
│  │ Fee: $10.00                      │   │
│  │ You Will Receive: $90.00 (green) │   │
│  │                                  │   │
│  │ Status: ⏳ Awaiting Admin Approval │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Admin will review your proof and       │
│  approve the withdrawal. Check your     │
│  dashboard for updates.                 │
│                                         │
│  [Submit Another Withdrawal]            │
└─────────────────────────────────────────┘
```

---

## 🎚️ Admin Withdrawal Settings Interface

```
┌──────────────────────────────────────────────┐
│ Admin Dashboard → Settings                   │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ Withdrawal Settings (NEW)               │ │
│  ├────────────────────────────────────────┤ │
│  │                                        │ │
│  │ 💰 Withdrawal Fee                      │ │
│  │ ┌──────────────┐                       │ │
│  │ │ [  10.00  ]$ │                       │ │
│  │ └──────────────┘                       │ │
│  │ This fee applies to all withdrawals    │ │
│  │                                        │ │
│  │ 🏦 Bank Account Details                │ │
│  │                                        │ │
│  │ Bank Name                              │ │
│  │ ┌────────────────────────────────────┐ │
│  │ │ First National Bank                │ │
│  │ └────────────────────────────────────┘ │
│  │                                        │ │
│  │ Account Holder                         │ │
│  │ ┌────────────────────────────────────┐ │
│  │ │ Investment Admin                   │ │
│  │ └────────────────────────────────────┘ │
│  │                                        │ │
│  │ Account Number                         │ │
│  │ ┌────────────────────────────────────┐ │
│  │ │ 1234567890                         │ │
│  │ └────────────────────────────────────┘ │
│  │                                        │ │
│  │ Routing Number (Optional)              │ │
│  │ ┌────────────────────────────────────┐ │
│  │ │ 021000021                          │ │
│  │ └────────────────────────────────────┘ │
│  │                                        │ │
│  │ [💾 Save Changes]                      │ │
│  │                                        │ │
│  │ PREVIEW: What Users See                │ │
│  │ ┌────────────────────────────────────┐ │
│  │ │ Fee: $10.00 💛                     │ │
│  │ │ Bank: First National Bank          │ │
│  │ │ Account: Investment Admin          │ │
│  │ │ #: 1234567890                      │ │
│  │ └────────────────────────────────────┘ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ Transaction Settings (existing)         │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ Withdrawal Method Settings (existing)   │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    WITHDRAWAL FLOW                          │
└─────────────────────────────────────────────────────────────┘

USER SIDE:
═════════

STEP 1: Review
  ├─ WithdrawDeposit.tsx loads
  ├─ fetchAdminSettings() executes
  └─ Supabase query: SELECT * FROM withdrawal_settings
     ↓
     Returns: {
       withdrawal_fee: 10,
       admin_bank_name: "First National Bank",
       admin_account_number: "1234567890",
       admin_account_holder: "Investment Admin",
       admin_routing_number: "021000021"
     }
  ├─ Display loaded data to user
  └─ User enters amount & clicks Continue

STEP 2: Upload Proof
  ├─ Create withdrawal_requests row
  │  INSERT: {
  │    user_id: "user123",
  │    amount: 100,
  │    status: "pending",
  │    method_type: "transfer",
  │    withdrawal_fee: 10
  │  }
  ├─ Start 15-minute countdown (900 seconds)
  ├─ User uploads proof file
  └─ File stored: withdrawal-proofs/{withdrawal_id}/{timestamp}-filename

STEP 3: Success
  ├─ Update withdrawal_requests
  │  UPDATE: {
  │    status: "pending_approval",
  │    proof_file_path: "path/to/file"
  │  }
  └─ Show success screen

ADMIN SIDE:
══════════

Settings:
  ├─ Admin navigates to Settings tab
  ├─ Sees AdminWithdrawalSettings component
  └─ Can update withdrawal_settings table:
     UPDATE withdrawal_settings SET
       withdrawal_fee = 10,
       admin_bank_name = "First National Bank",
       ...
     (Single row design - no WHERE clause)

Withdrawals:
  ├─ Admin navigates to Withdrawals tab
  ├─ Sees list of pending_approval requests
  ├─ Can download proof files from storage
  └─ Can approve/reject:
     UPDATE withdrawal_requests SET status = "approved"

DATABASE:
═════════

withdrawal_settings (NEW - single row)
  ├─ id
  ├─ withdrawal_fee ← Admin sets this
  ├─ admin_bank_name ← Admin sets this
  ├─ admin_account_holder ← Admin sets this
  ├─ admin_account_number ← Admin sets this
  ├─ admin_routing_number ← Admin sets this
  └─ updated_at

withdrawal_requests (existing - one per request)
  ├─ id
  ├─ user_id
  ├─ amount
  ├─ withdrawal_fee ← Copied from settings when created
  ├─ status (pending → pending_approval → approved/rejected)
  ├─ proof_file_path ← Path in storage
  ├─ created_at
  ├─ updated_at
  └─ approved_at

STORAGE:
════════

withdrawal-proofs/
  └─ {withdrawal_id}/
     └─ {timestamp}-{filename}
        (e.g., f47ac10b-58cc-4372-a567-0e02b2c3d479/1702000000000-receipt.pdf)
```

---

## ⏱️ Countdown Timer Behavior

```
WHEN STEP 2 STARTS:
═════════════════
timeRemaining = 900

EVERY 1 SECOND:
═══════════════
900 → 14:00
899 → 13:59
898 → 13:58
...
300 → 05:00  (⚠️ WARNING COLOR STARTS)
...
60  → 01:00
59  → 00:59
...
1   → 00:01
0   → 00:00  (⚠️ TIME EXPIRED)

DISPLAY FORMAT:
═══════════════
formatTime(seconds):
  mins = Math.floor(seconds / 60)
  secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
  
Examples:
  900 → "15:00"
  535 → "08:55"
  125 → "02:05"
  5   → "00:05"
```

---

## 🔒 Security & Access Control

```
WITHDRAWAL_SETTINGS TABLE RLS:
═══════════════════════════════

                   │ Admin | User | Public |
                   │(vit..)│(auth)│(none) │
───────────────────┼───────┼──────┼───────┤
SELECT (read)      │  ✅   │  ✅  │   ❌  │
INSERT (create)    │  ✅   │  ❌  │   ❌  │
UPDATE (edit)      │  ✅   │  ❌  │   ❌  │
DELETE             │  ❌   │  ❌  │   ❌  │
───────────────────┴───────┴──────┴───────┘

Why users can read?
  → Need to see fee and bank details

Why users cannot write?
  → Prevents users from changing fee/details

WITHDRAWAL_REQUESTS TABLE RLS:
═══════════════════════════════

                   │ Admin │ Own User │ Other │
                   │       │          │ Users │
───────────────────┼───────┼──────────┼───────┤
SELECT own rows    │  ✅   │   ✅     │   ❌  │
SELECT all rows    │  ✅   │   ❌     │   ❌  │
INSERT own         │  ❌   │   ✅     │   ❌  │
UPDATE status      │  ✅   │   ❌     │   ❌  │
───────────────────┴───────┴──────────┴───────┘
```

---

## 📊 Component Architecture

```
Pages/
├─ AdminDashboard.tsx
│  └─ imports AdminWithdrawalSettings
│
Components/
├─ admin/
│  ├─ AdminWithdrawalSettings.tsx (NEW location)
│  │  └─ Form to set fee & bank details
│  │     └─ Updates withdrawal_settings table
│  │
│  └─ WithdrawalRequests.tsx
│     └─ Admin management of requests
│        └─ Approve/reject withdrawals
│
└─ dashboard/
   └─ WithdrawDeposit.tsx (REDESIGNED)
      ├─ Step 1: Review (fetches admin settings)
      ├─ Step 2: Upload (15-min countdown)
      └─ Step 3: Success
```

---

## 🧮 Calculation Example

```
USER ENTERS: $100

STEP 1:
  Admin has set: Withdrawal Fee = $10
  → Display to user:
    Amount: $100
    Fee: $10

STEP 2:
  User uploads proof
  → System creates withdrawal_requests with:
    amount: 100
    withdrawal_fee: 10

STEP 3:
  Display to user:
    Amount: $100.00
    Fee: $10.00
    You Will Receive: $90.00 ← (100 - 10)

DATABASE:
  User sees deduct from balance: $100
  Admin receives in bank account: $100
  (User already paid the $10 before withdrawal)
```

---

## 🚦 Status Progression

```
User Withdrawal Request Status Flow:

pending
  ↓
  (User uploads proof)
  ↓
pending_approval
  ↓
  (Admin reviews and decides)
  ├─→ approved
  │   ├─ Admin can notify user
  │   └─ Payment processed
  │
  └─→ rejected
      └─ Admin provides reason
```

---

## ✅ Testing Checklist with Example Values

```
ADMIN SETUP:
┌────────────────────────────────┐
│ Go to Settings                 │
│ ✓ Fee field: 10 (numeric)      │
│ ✓ Bank Name: FNB               │
│ ✓ Account Holder: Admin User   │
│ ✓ Account #: 1234567890        │
│ ✓ Routing: 021000021           │
│ ✓ Click Save                   │
│ ✓ See success message          │
└────────────────────────────────┘

USER WITHDRAWAL:
┌────────────────────────────────┐
│ Step 1 Verification:           │
│ ✓ Shows balance: $5000         │
│ ✓ Shows fee: $10.00            │
│ ✓ Shows bank: FNB              │
│ ✓ Shows account #: 1234567890  │
│ ✓ Enter: 100                   │
│ ✓ Click Continue               │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Step 2 Verification:           │
│ ✓ Timer shows: 15:00           │
│ ✓ Timer counts down by 1s      │
│ ✓ Can upload file              │
│ ✓ Shows filename after upload  │
│ ✓ Click Submit                 │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Step 3 Verification:           │
│ ✓ Green checkmark shows        │
│ ✓ Amount: $100.00              │
│ ✓ Fee: $10.00                  │
│ ✓ Receive: $90.00              │
│ ✓ Status: Awaiting Approval    │
└────────────────────────────────┘

ADMIN APPROVAL:
┌────────────────────────────────┐
│ Go to Withdrawals tab          │
│ ✓ See pending request          │
│ ✓ Can download proof           │
│ ✓ Can approve/reject           │
│ ✓ Click Approve                │
│ ✓ Status changes               │
└────────────────────────────────┘
```

---

## 🎨 UI Color Reference

```
COLORS USED:
────────────
Primary (Red):    #ef4444     ← Buttons, active steps
Success (Green):  #22c55e     ← Balance, checkmark, final amount
Warning (Yellow): #eab308     ← Fee indicator, low timer
Info (Blue):      #3b82f6     ← Info messages
Neutral (Gray):   #374151     ← Backgrounds, borders

TEXT COLORS:
────────────
Primary:    text-white        ← Main text
Secondary:  text-gray-400     ← Help text
Success:    text-green-400    ← Good info
Warning:    text-yellow-400   ← Important info
Error:      text-red-400      ← Error messages

BACKGROUNDS:
────────────
Card:       bg-gray-800       ← Main card backgrounds
Dark:       bg-gray-900       ← Page background
Input:      bg-gray-700       ← Input fields
Border:     border-gray-600   ← Borders
```

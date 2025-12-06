# Withdrawal Feature Implementation - Complete Guide

## 📋 Overview
The withdrawal system has been fully implemented with a multi-step user flow, admin management panel, and Supabase database integration.

## 🏗️ Architecture

### **Database Schema**
Located at: `supabase/migrations/20251201_update_withdrawal_requests_table.sql`

**withdrawal_requests Table:**
- `id` - UUID primary key
- `user_id` - Reference to auth.users
- `amount` - Decimal withdrawal amount
- `status` - pending | approved | rejected | completed
- `withdrawal_fee` - Fee set by admin
- `proof_file_path` - Path to uploaded payment proof in storage
- `account_details` - JSONB with user's bank details (bankName, accountNumber, accountHolder, routingNumber)
- `approved_at` - Timestamp when admin approves
- `created_at`, `updated_at` - Timestamps

**Storage Bucket:**
- Name: `withdrawal-proofs`
- Purpose: Store payment proof uploads
- RLS Enabled: Users can only upload/view their own files, admin can view all

### **RLS Policies**
- Users can view only their own withdrawal requests
- Users can create withdrawal requests
- Admin (vit88095@gmail.com) can update requests to set fees and approval status
- Users can upload proof files to their folder in withdrawal-proofs bucket
- Admin can view all proof files

---

## 👥 User Withdrawal Flow

### **Components:**
`src/components/dashboard/WithdrawDeposit.tsx`

### **5-Step Process:**

**Step 1: Amount Input**
- User enters withdrawal amount
- Shows available balance ($5,000 placeholder)
- Creates withdrawal request in database with status: pending

**Step 2: Fee Display**
- Shows withdrawal amount
- Shows admin-set fee (initially 0)
- Calculates net amount user will receive
- Message indicates admin will set fee

**Step 3: Payment Proof Upload**
- Displays admin's bank details:
  - Bank Name, Account Number
  - Account Holder, Routing Number
- User uploads proof of payment (PNG/JPG/PDF)
- File is stored in `withdrawal-proofs` bucket

**Step 4: Account Details**
- User enters receiving bank details:
  - Bank Name (required)
  - Account Holder Name (required)
  - Account Number (required)
  - Routing Number (optional)
- Data stored as JSONB in database
- Proof file path is updated

**Step 5: Success**
- Confirmation screen showing:
  - Withdrawal amount
  - Admin fee
  - Net receiving amount
  - Status: "Pending Admin Approval"
- Option to submit new withdrawal request

---

## 🔧 Admin Withdrawal Management

### **Component:**
`src/components/admin/WithdrawalRequests.tsx`

### **Admin Features:**

**View All Requests:**
- Lists all withdrawal requests with user email
- Displays: Amount, Status, Created Date, Fee
- Shows user's account details
- Download payment proof button
- Real-time updates via Supabase Realtime

**Set Withdrawal Fee:**
- Modal popup for setting fee amount
- Shows withdrawal amount and calculates net
- Updates database immediately
- Only available for pending requests

**Approve/Reject:**
- Approve: Sets status to "approved" and timestamp
- Reject: Sets status to "rejected"
- Updates database for user to see status

**Status Badges:**
- pending (yellow) - Waiting for action
- approved (green) - Ready for processing
- rejected (red) - Denied
- completed (blue) - Processed

---

## 🗄️ Database Integration

### **Service Functions** (if needed - already in transactions.ts):
```typescript
// Create withdrawal request
createWithdrawalRequest(userId, methodType, amount)

// Fetch user withdrawals
fetchUserWithdrawals(userId)

// Admin fetch all
fetchAllWithdrawals()

// Update status
updateWithdrawalStatus(withdrawalId, status)
```

### **Supabase Client:**
Both components use:
```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 📡 Admin Dashboard Integration

### **File:**
`src/pages/AdminDashboard.tsx`

### **New Tab Added:**
- **Label:** Withdrawals
- **Icon:** TrendingDown (red)
- **Component:** `<WithdrawalRequests />`

### **Navigation:**
```
Admin Tabs:
- Users
- Support  
- Card Deposits
- Transactions
- Withdrawals ← NEW
- Settings
```

---

## 🔐 Security & Permissions

### **User-Level:**
- Can only view/modify their own withdrawals
- RLS policies enforce user isolation
- File uploads restricted to their folder

### **Admin-Level:**
- Can view all withdrawal requests
- Can set fees
- Can approve/reject
- Can download all proof files
- Email-based permission check: `vit88095@gmail.com`

---

## 📤 File Upload Handling

### **Bucket Structure:**
```
withdrawal-proofs/
├── {withdrawal_id}/
│   ├── {timestamp}-filename1.pdf
│   ├── {timestamp}-filename2.jpg
```

### **Upload Process:**
1. User uploads file in Step 3
2. File stored with folder pattern: `{withdrawalId}/{timestamp}-{filename}`
3. Path saved in database as `proof_file_path`
4. Admin can download via storage URL

---

## 🔄 Workflow Summary

### **User Side:**
1. Clicks "Withdraw" in dashboard
2. Enters amount → Creates DB record
3. Sees fee (admin sets) → Continues
4. Uploads proof → File goes to storage
5. Enters bank details → Database updated
6. Sees success → Waits for admin approval

### **Admin Side:**
1. Goes to Admin Dashboard → Withdrawals tab
2. Sees pending requests
3. Sets withdrawal fee for each request
4. Reviews payment proof (can download)
5. Approves request → User sees success
6. System ready to process payment

---

## ✅ Checklist: What's Complete

- ✅ Database schema with RLS policies
- ✅ User withdrawal form (5-step flow)
- ✅ Admin withdrawal management panel
- ✅ File upload to Supabase Storage
- ✅ Admin Dashboard integration
- ✅ Real-time status updates (Supabase Realtime)
- ✅ Error handling & validation
- ✅ Loading states & user feedback
- ✅ TypeScript typing throughout

---

## 🚀 What's Not Yet Implemented

The following would be needed for production:

- Email notifications to user when fee is set
- Email notifications when withdrawal is approved
- Payment processing (manual bank transfer)
- Completion status update (admin marks as complete)
- Withdrawal history view for users
- Transaction ledger entries
- Fee calculation rules (automatic vs manual)
- Export/reporting for admin

---

## 📝 Database Migration

Run the migration SQL:
```bash
supabase migration up 20251201_update_withdrawal_requests_table.sql
```

Or execute directly in Supabase SQL editor from file:
`supabase/migrations/20251201_update_withdrawal_requests_table.sql`

---

## 🎨 UI/UX Features

- Progress indicator (5 steps)
- Gradient cards for each step
- Clear button states (disabled when incomplete)
- Error messages displayed prominently
- Loading indicators on async operations
- Color-coded status badges
- Modal for fee entry
- Drag-drop file upload area

---

## 🔗 File References

**User Components:**
- `src/components/dashboard/WithdrawDeposit.tsx` - Main withdrawal form

**Admin Components:**
- `src/components/admin/WithdrawalRequests.tsx` - Withdrawal management
- `src/pages/AdminDashboard.tsx` - Dashboard integration

**Database:**
- `supabase/migrations/20251201_update_withdrawal_requests_table.sql` - Schema

**Services:**
- `src/services/transactions.ts` - Database functions (already exists)

---

## 💡 Key Implementation Details

**State Management:**
- React useState for multi-step form
- Tracks: step, amount, fee, proof file, account details, loading, error, withdrawalId

**API Integration:**
- Supabase CRUD operations
- Storage uploads with path organization
- Real-time subscriptions for admin panel

**Validation:**
- Required fields check
- File upload validation
- Balance check placeholder ($5,000)
- Error display with user-friendly messages

**UX Improvements:**
- Back buttons to previous steps
- Clear fee information
- Admin account details displayed clearly
- Proof file selected confirmation
- Success summary before completion

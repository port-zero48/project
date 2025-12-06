# Withdrawal Feature - Testing Instructions

## ✅ What Was Fixed

### **Issue:** Withdraw button did nothing when clicked
**Root Cause:** UserDashboard was showing a placeholder message instead of the WithdrawDeposit component

### **Solution:**
Updated `src/pages/UserDashboard.tsx` line ~102-109:
```tsx
{/* Withdraw View */}
{activeView === 'withdraw' && (
  <div className="relative lg:col-span-2">
    <button onClick={() => setActiveView(null)} ...>
      <X className="h-5 w-5" />
    </button>
    <WithdrawDeposit user={user} />  ✅ Now uses the actual component
  </div>
)}
```

---

## 🧪 Testing the Withdrawal Flow

### **Prerequisites:**
1. ✅ Database migration executed: `20251201_update_withdrawal_requests_table.sql`
2. ✅ Supabase RLS policies created
3. ✅ `withdrawal-proofs` storage bucket created
4. ✅ Dev server running on http://localhost:5175

### **User Withdrawal Testing:**

**Step 1: Start Withdrawal**
1. Login to user dashboard
2. Click **"Withdraw"** button in sidebar (📤 icon)
3. ✅ Should show withdrawal form with progress indicator

**Step 2: Enter Amount**
1. Enter withdrawal amount (e.g., $100)
2. Check available balance shows $5,000
3. Click **"Continue"** button
4. ✅ Database record should be created with status: pending

**Step 3: Fee Display**
1. See withdrawal amount and fee (initially $0)
2. Message says "Admin will set the withdrawal fee"
3. Click **"Continue to Payment Proof"**

**Step 4: Upload Proof**
1. See admin account details displayed
2. Click upload area or drag-drop payment proof file
3. File should show as uploaded
4. Click **"Continue to Account Details"**

**Step 5: Account Details**
1. Fill in your bank details:
   - Bank Name: e.g., "Chase Bank"
   - Account Holder: Your name
   - Account Number: Your account
   - Routing Number: (optional)
2. Click **"Submit Withdrawal Request"**
3. ✅ File should upload to storage
4. ✅ Database updated with account details

**Step 6: Success**
1. See green success screen
2. Shows withdrawal amount, fee, receiving amount
3. Status: "Pending Admin Approval"
4. Option to submit new withdrawal

---

## 👨‍💼 Admin Withdrawal Testing

### **Access Admin Panel:**
1. Login as admin (vit88095@gmail.com)
2. Go to Admin Dashboard
3. Click **"Withdrawals"** tab (TrendingDown icon, red)
4. ✅ Should list all pending withdrawal requests

### **Set Withdrawal Fee:**
1. Find pending withdrawal request
2. Click **"Set Fee"** button
3. Enter fee amount (e.g., $5)
4. Click **"Set Fee"** in modal
5. ✅ Fee updates immediately in list
6. ✅ User can see updated fee if they check

### **Approve Withdrawal:**
1. Review payment proof (click **"Download"**)
2. Verify account details shown
3. Click **"Approve"** button
4. ✅ Status changes to "approved" (green badge)
5. ✅ Approval timestamp set
6. ✅ User sees success message

### **Reject Withdrawal:**
1. If payment proof is invalid, click **"Reject"**
2. ✅ Status changes to "rejected" (red badge)

---

## 📊 Database Verification

Check the database to confirm data is being saved:

```sql
-- View all withdrawal requests
SELECT id, user_id, amount, withdrawal_fee, status, created_at 
FROM withdrawal_requests
ORDER BY created_at DESC;

-- View specific request with details
SELECT id, user_id, amount, withdrawal_fee, status, 
       proof_file_path, account_details, created_at, approved_at
FROM withdrawal_requests
WHERE status = 'pending'
LIMIT 1;
```

---

## 🔐 Security Checks

✅ Users can only see their own withdrawal requests (RLS)
✅ Only `vit88095@gmail.com` can update status (RLS)
✅ Payment proof files stored with user isolation (RLS)
✅ Admin can access all files for review

---

## 📁 Files Modified

- `src/pages/UserDashboard.tsx` - Fixed withdraw view to show WithdrawDeposit component
- `supabase/migrations/20251201_update_withdrawal_requests_table.sql` - Fixed RLS policy syntax

---

## ⚠️ Known Limitations

- Balance check shows static $5,000 (placeholder)
- Fee must be set manually by admin (no auto-calculation)
- Email notifications not implemented
- Actual payment processing not implemented
- Completion status must be set manually by admin

---

## 🎯 Next Steps (Optional)

To complete the system:
1. Connect real balance from user account
2. Add email notifications for fee/approval
3. Implement payment processing integration
4. Add withdrawal history view for users
5. Auto-mark as completed after payment
6. Add refund mechanism for rejected requests

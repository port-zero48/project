# Admin Withdrawal Dashboard - Getting Started

## What You Should See

When you click the **"Withdrawals"** tab in the Admin Dashboard, you should see:

### If No Withdrawals Yet:
```
═══════════════════════════════════════════════════════════
                  Withdrawal Requests
───────────────────────────────────────────────────────────

Debug: 0 withdrawal request(s) found. Loading: No

⚠️ No withdrawal requests yet
Users can make their first withdrawal request by going to 
their Dashboard → Withdraw Funds
```

### After User Uploads Proof:
```
═══════════════════════════════════════════════════════════
                  Withdrawal Requests
───────────────────────────────────────────────────────────

Debug: 1 withdrawal request(s) found. Loading: No

User Email          Amount    Status              Created
john@example.com    $0.00     🟠 PENDING APPROVAL 12/2/2025

─────────────────────────────────────────────────────────

Withdrawal Fee        Net Amount
$5.00                 -$5.00

Send Payment To (Admin Account)
Bank Name: Chase Bank
Account Holder: John Admin
Account Number: 123456789
Routing Number: 021000021

────────────────────────────────────────────────────────

Payment Proof
payment-receipt.pdf           [Download Proof] 🔵

────────────────────────────────────────────────────────

STAGE 1: RECEIPT VERIFICATION
User has uploaded payment proof. Review and approve to 
allow them to proceed.

[Approve Receipt] ✅    [Reject] ❌
```

---

## Step-by-Step: Complete Withdrawal Flow

### STEP 1: Create a Test User (Non-Admin)
1. Go to your app's login page
2. Create a new account with test email
3. Do NOT make it admin
4. Log in as this user

---

### STEP 2: User Uploads Payment Proof
1. User goes to Dashboard
2. Finds "Withdraw Funds" card (Column 1)
3. Sees:
   - Available Balance: $5,000.00 (or whatever)
   - Withdrawal Fee: $5.00
   - Admin bank details
4. Uploads a payment receipt (image/PDF)
5. Clicks "Submit Receipt"
6. Sees "⏳ Waiting for admin approval..."

**In Database Now:**
- withdrawal_requests table has new entry
- Status: `pending_approval`
- Proof file stored in bucket

---

### STEP 3: Admin Reviews (STAGE 1)
1. Log in as ADMIN
2. Go to Admin Dashboard
3. Click "Withdrawals" tab
4. See withdrawal with:
   - 🟠 PENDING APPROVAL badge (orange)
   - User email
   - Payment proof with "Download" button
   - "Approve Receipt" button (THIS IS THE KEY BUTTON!)

5. Click "Download Proof" to review the payment receipt
6. If good, click "Approve Receipt"
7. Status changes to 🔵 PROOF APPROVED (blue)
8. Message: "Receipt approved. Waiting for user to enter withdrawal details..."

---

### STEP 4: User Enters Withdrawal Details
1. User logs in
2. Goes to Dashboard → Withdraw Funds
3. Card 1 now shows "✅ Receipt Approved!" and "Withdraw" button
4. Clicks "Withdraw"
5. Goes to Card 2: "Withdraw"
6. Enters:
   - Amount: $100.00
   - Bank Name: Chase Bank
   - Account Holder: John Doe
   - Account Number: 987654321
   - Routing: (optional)
7. Clicks "Submit & Request Withdrawal"

**In Database Now:**
- Withdrawal updated with amount and account details
- Status: `awaiting_final_approval`

---

### STEP 5: Admin Reviews (STAGE 2)
1. Admin in Withdrawals tab
2. Withdrawal status changed to 🟡 AWAITING FINAL APPROVAL (yellow)
3. Now shows:
   - Amount: $100.00 ✅ (NOW VISIBLE!)
   - Fee: $5.00
   - Account Details section showing:
     - Bank: Chase Bank
     - Holder: John Doe
     - Account: 987654321
   - "Approve Withdrawal" button (THIS IS THE SECOND KEY BUTTON!)

4. Review everything
5. Click "Approve Withdrawal"
6. Status changes to 🟢 APPROVED (green)

---

### STEP 6: User Sees Success
1. User's screen auto-advances to Card 3
2. Sees:
   - ✅ Large green checkmark
   - "✅ Withdrawal Approved!"
   - "You will receive funds shortly"
   - Withdrawal summary
   - "Start New Withdrawal" button

---

## Key Buttons in Each Stage

| Button | Stage | Location | What It Does |
|--------|-------|----------|--------------|
| **Download Proof** | 1 | Payment Proof section | Let admin review receipt |
| **Approve Receipt** | 1 | STAGE 1 section | Admin approves proof |
| **Approve Withdrawal** | 2 | STAGE 2 section | Admin approves amount + account |
| **Reject** | Both | Both stages | Reject at any point |

---

## Troubleshooting

### Problem: Withdrawals tab shows "No withdrawal requests yet"
**Solution:** This means no user has uploaded a withdrawal proof yet.
- Create test user
- Log in as test user
- Go to Dashboard → Withdraw Funds
- Upload receipt and submit

### Problem: Can't see user email in withdrawal list
**Solution:** Check that user account exists in `users` table
- May need to refresh the page
- Check browser console (F12) for errors

### Problem: Can't see payment proof file
**Solution:** 
- File might not have uploaded correctly
- Check Supabase storage bucket `withdrawal-proofs`
- Look for folder with withdrawal ID

### Problem: Can't download proof file
**Solution:**
- Check file path in database
- Verify file exists in storage
- Check RLS policies on storage bucket

### Problem: Buttons don't work
**Solution:**
- Check browser console (F12) for errors
- Verify user is logged in as admin
- Try refreshing the page

---

## Database Check

To verify data is being saved correctly:

1. Go to Supabase dashboard
2. Look at `withdrawal_requests` table
3. Should see columns:
   - id
   - user_id
   - amount (will be 0 until user enters it)
   - withdrawal_fee (should be $5.00)
   - status (should be 'pending_approval')
   - proof_file_path (path like: "uuid/timestamp-filename")
   - account_details (null until Stage 2)
   - created_at (timestamp)

4. Look at `withdrawal-proofs` storage bucket
5. Should see folder with withdrawal ID inside
6. Should contain: timestamp-filename (the proof file)

---

## Success Indicators

✅ **Working when:**
1. You see withdrawal in admin dashboard
2. You can download proof file
3. "Approve Receipt" button responds
4. Status changes to blue when clicked
5. "Approve Withdrawal" button appears after user details
6. Status changes to green when clicked
7. User's withdrawal shows "funds coming shortly"

🎉 **Everything is working correctly!**

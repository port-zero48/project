# Complete Withdrawal System - Testing Guide

## System Overview

The withdrawal system now has **3 components**:

1. **User Side (WithdrawDeposit.tsx)** - 3-card flow
2. **Admin Dashboard (WithdrawalRequests.tsx)** - 2-stage approval
3. **Admin Settings (AdminWithdrawalSettings.tsx)** - Global fee configuration

---

## Test Scenario: Complete Withdrawal Flow

### STEP 1: Admin Sets Withdrawal Fee
**Location**: Admin Dashboard → Settings tab

1. Click **Settings** tab in admin area
2. Scroll to **Withdrawal Settings** section
3. Enter a withdrawal fee (e.g., $5.00)
4. Click **Save Settings**
5. Verify: Fee saved and shows as "Settings updated"

---

### STEP 2: User Initiates Withdrawal - Card 1

**Location**: User Dashboard → Withdraw Funds card

1. Go to **Withdraw Funds** card
2. Verify you see:
   - ✅ Your available balance
   - ✅ Withdrawal Fee ($5.00 from admin settings)
   - ✅ Admin's bank account details
   - ✅ "Upload Payment Receipt" area

3. **Simulate payment**: Create or find an image/PDF file
4. **Upload file**: Click the upload area and select your file
5. Click **"Submit Receipt"** button
6. Verify: 
   - ✅ Loading shows "Uploading..."
   - ✅ File is uploaded successfully
   - ✅ Status message shows "⏳ Waiting for admin approval of your receipt..."

**After Step 2 Complete**: 
- Withdrawal request created with `status = 'pending_approval'`
- User stays on Card 1
- Proof file stored in Supabase storage
- Next: Admin must approve

---

### STEP 3: Admin Approves Receipt - Stage 1

**Location**: Admin Dashboard → Withdrawal Requests tab

1. Go to **Admin Dashboard**
2. Click **Withdrawal Requests** tab
3. You should see your withdrawal with:
   - ✅ Status: **🟠 PENDING APPROVAL** (orange badge)
   - ✅ User email
   - ✅ Withdrawal amount shown (though user hasn't set it yet)
   - ✅ Withdrawal fee showing
   - ✅ **Payment Proof** box with "Download Proof" button

4. **Download and verify** the proof file by clicking "Download Proof"

5. Click **"Approve Receipt"** button (green button in STAGE 1 section)

6. Verify:
   - ✅ Status changes to **🔵 PROOF APPROVED** (blue badge)
   - ✅ Button disappears and shows "Receipt approved. Waiting for user to enter withdrawal details..."

**After Step 3 Complete**:
- Withdrawal status updated to `proof_approved`
- User receives notification (via status check on their side)

---

### STEP 4: User Enters Withdrawal Details - Card 2

**Location**: User Dashboard → Withdraw Funds card (should auto-advance)

**How the transition works:**
- User side polls database every 2 seconds
- When status becomes `proof_approved`, Card 1 updates to show "✅ Receipt Approved!"
- A **yellow "Withdraw" button** appears on Card 1
- User clicks **"Withdraw"** → Switches to Card 2

**Card 2 Screen - Withdraw**:

1. You see:
   - ✅ "Withdraw Funds" card with yellow header
   - ✅ **Withdrawal Amount** input field
   - ✅ Real-time calculation showing: Amount - Fee = Net Amount
   - ✅ **Your Receiving Bank Account** form with fields:
     - Bank Name (required)
     - Account Holder Name (required)
     - Account Number (required)
     - Routing Number (optional)

2. **Fill in the form**:
   - Withdrawal Amount: Enter amount (e.g., $100.00)
   - Bank Name: Enter your bank (e.g., "Chase Bank")
   - Account Holder: Enter your full name
   - Account Number: Enter your account number
   - Routing Number: (optional) Enter routing number

3. Watch the net calculation: If amount is $100 and fee is $5, net shows $95.00

4. Click **"Submit & Request Withdrawal"** button

5. Verify:
   - ✅ Loading shows "Submitting..."
   - ✅ Status message shows "⏳ Waiting for admin to approve your withdrawal..."
   - ✅ Form data is submitted

**After Step 4 Complete**:
- Withdrawal updated with amount and account details
- Status changed to `awaiting_final_approval`
- User stays on Card 2, waiting

---

### STEP 5: Admin Approves Final Withdrawal - Stage 2

**Location**: Admin Dashboard → Withdrawal Requests tab

1. In **Withdrawal Requests**, find your withdrawal
2. Verify status changed to **🟡 AWAITING FINAL APPROVAL** (yellow badge)
3. You should now see:
   - ✅ **Withdrawal Amount**: Now shows the amount user entered (e.g., $100.00)
   - ✅ **User's Account Details** box showing:
     - Bank Name: (e.g., "Chase Bank")
     - Account Holder: (e.g., "John Doe")
     - Account #: (e.g., "123456789")
     - Routing #: (if provided)
   - ✅ **Payment Proof** still available for reference
   - ✅ **STAGE 2: FINAL APPROVAL** section with approval button

4. Review the details, then click **"Approve Withdrawal"** button (green)

5. Verify:
   - ✅ Status changes to **🟢 APPROVED** (green badge)
   - ✅ Shows "Approved on [date]"

**After Step 5 Complete**:
- Withdrawal status changed to `approved`
- User receives notification and auto-advances to success screen

---

### STEP 6: User Sees Success Screen - Card 3

**Location**: User Dashboard → Withdraw Funds card (auto-advances)

Card 3 displays:
- ✅ Large green checkmark
- ✅ "✅ Withdrawal Approved!"
- ✅ "You will receive funds shortly"
- ✅ Summary showing:
  - Withdrawal Amount: $100.00
  - Withdrawal Fee: $5.00
  - Net Amount: $95.00
- ✅ Message: "Funds will be transferred to your bank account within 1-3 business days"
- ✅ **"Start New Withdrawal"** button to begin another withdrawal

**After Step 6 Complete**: 
- User has successfully completed withdrawal flow ✅

---

## Admin History/Completed Withdrawals

**To see all withdrawals** (pending, approved, rejected):

1. Admin Dashboard → **Withdrawal Requests** tab
2. **Approved withdrawals** appear with:
   - Status badge: 🟢 APPROVED
   - Display: "Approved on [date]"
   - All details visible for reference

3. **Rejected withdrawals** appear with:
   - Status badge: 🔴 REJECTED
   - All details still visible

---

## Testing Checklist

### User Flow
- [ ] User can see available balance, fee, and admin details on Card 1
- [ ] User can upload payment receipt
- [ ] Receipt upload shows loading state and completes
- [ ] After admin approves receipt, "Withdraw" button appears
- [ ] User can enter withdrawal amount and see live net calculation
- [ ] User can fill in all account details
- [ ] Account details submit successfully
- [ ] After final admin approval, success screen appears automatically
- [ ] Success screen shows correct amounts and summary
- [ ] "Start New Withdrawal" button resets form for new withdrawal

### Admin Flow
- [ ] Admin can see withdrawal with "pending_approval" status and orange badge
- [ ] Admin can download the payment proof file
- [ ] Admin can click "Approve Receipt" → changes to "proof_approved" (blue)
- [ ] After user submits account details, status shows "awaiting_final_approval" (yellow)
- [ ] Admin can see withdrawal amount (now filled in)
- [ ] Admin can see all user account details
- [ ] Admin can click "Approve Withdrawal" → changes to "approved" (green)
- [ ] Approved withdrawals show "Approved on [date]"
- [ ] Admin can reject at any stage
- [ ] Rejected withdrawals show red badge and message

### Real-time Updates
- [ ] When admin approves receipt, user's screen updates within 2 seconds
- [ ] User auto-advances to Card 2
- [ ] When admin approves withdrawal, user auto-advances to Card 3
- [ ] Both sides see status badges update in real-time

### Edge Cases to Test
- [ ] Upload file > 10MB → should reject with error
- [ ] Try to withdraw more than balance → should show error
- [ ] Try to submit without filling required fields → should show error
- [ ] Multiple withdrawals in history → should all show correctly
- [ ] Reject a withdrawal at Stage 1 → user should see rejection
- [ ] Reject a withdrawal at Stage 2 → user should see rejection

---

## Database Check

To verify data is saving correctly, check Supabase:

1. **withdrawal_requests table** should show:
   ```
   - id: (auto)
   - user_id: (logged in user)
   - amount: (user entered amount)
   - withdrawal_fee: (from settings)
   - status: (pending_approval → proof_approved → awaiting_final_approval → approved)
   - proof_file_path: (path to uploaded file)
   - account_details: (JSON with bank details)
   - created_at: (timestamp)
   - approved_at: (timestamp when approved)
   ```

2. **withdrawal_settings table** should show:
   ```
   - withdrawal_fee: (amount admin set)
   - admin_bank_name: (from settings)
   - admin_account_number: (from settings)
   - admin_account_holder: (from settings)
   - admin_routing_number: (from settings)
   ```

3. **withdrawal-proofs storage bucket** should contain:
   ```
   - [withdrawal_id]/[timestamp]-[filename]
   ```

---

## Common Issues & Fixes

**Issue**: "Waiting for admin approval..." stays forever
- **Fix**: Check if admin actually clicked "Approve Receipt" button
- **Fix**: Refresh admin page if button didn't respond
- **Fix**: Check browser console for errors (F12)

**Issue**: User can't see withdrawal fee
- **Fix**: Admin must first set fee in Settings tab
- **Fix**: If changed, user page might need refresh

**Issue**: Account details not showing in admin view
- **Fix**: Make sure you're on Stage 2 (awaiting_final_approval status)
- **Fix**: Check if user actually submitted the form

**Issue**: Download Proof button not working
- **Fix**: Check if file path is correct in database
- **Fix**: Check if file exists in Supabase storage
- **Fix**: Check browser console for CORS errors

---

## Success Indicators

✅ **System is working when:**
1. User uploads receipt → Admin sees it
2. Admin approves → User sees "Withdraw" button within 2 seconds
3. User enters amount + account → Admin sees all details
4. Admin approves → User auto-advances to success screen
5. All status badges show correct colors
6. Withdrawal appears in admin history

🎉 **Congratulations! Your withdrawal system is fully operational!**

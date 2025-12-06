# Admin Withdrawal Approval Workflow

## Overview
The admin now has a **2-Stage Approval System** for withdrawal requests:

---

## Stage 1: Receipt Verification
**Status: `pending_approval`**

### What the Admin Sees:
- User Email
- Withdrawal Amount (set by user later)
- Withdrawal Fee (can be set globally in Settings)
- Status Badge: **🟠 PENDING APPROVAL** (Orange)
- **Payment Proof File** - Admin can download and review
- **STAGE 1: RECEIPT VERIFICATION** section with:
  - "Approve Receipt" button ✅
  - "Reject" button ❌

### Admin Action:
1. Click **Download Proof** to review the payment receipt
2. If receipt is valid, click **Approve Receipt**
3. Status changes to `proof_approved` (blue badge)
4. **User is now notified** they can proceed to enter withdrawal amount + account details

---

## Stage 2: Final Withdrawal Approval
**Status: `awaiting_final_approval`**

### What the Admin Sees:
- User Email
- **Withdrawal Amount** - NOW FILLED IN (user entered on their side)
- Withdrawal Fee
- **User's Account Details**:
  - Bank Name
  - Account Holder Name
  - Account Number
  - Routing Number (if provided)
- **Payment Proof File** - Still available for reference
- Status Badge: **🟡 AWAITING FINAL APPROVAL** (Yellow)
- **STAGE 2: FINAL APPROVAL** section with:
  - "Approve Withdrawal" button ✅
  - "Reject" button ❌

### Admin Action:
1. Review the withdrawal amount and account details
2. If everything is correct, click **Approve Withdrawal**
3. Status changes to `approved` (green badge)
4. **User is automatically advanced to success screen**

---

## Status Flow Summary

```
pending_approval 
    ↓ [Admin clicks "Approve Receipt"]
proof_approved (User sees "Withdraw" button)
    ↓ [User enters amount + account details and submits]
awaiting_final_approval
    ↓ [Admin clicks "Approve Withdrawal"]
approved (User sees success screen)
```

---

## Status Badge Colors

| Status | Color | Meaning |
|--------|-------|---------|
| `pending_approval` | 🟠 Orange | Receipt uploaded, waiting for admin approval |
| `proof_approved` | 🔵 Blue | Receipt approved, waiting for user account details |
| `awaiting_final_approval` | 🟡 Yellow | Account details submitted, waiting for final admin approval |
| `approved` | 🟢 Green | Fully approved and ready for payment |
| `rejected` | 🔴 Red | Withdrawal rejected by admin |

---

## Key Features

✅ **Two-Stage Approval**: Admin reviews proof first, then account details  
✅ **Clear Status Indicators**: Each stage labeled with instructions  
✅ **Payment Proof Access**: Download button to review payment receipts  
✅ **Account Details Visible**: Full account info shown in Stage 2  
✅ **Real-time Updates**: Withdrawal list updates automatically  
✅ **Easy Navigation**: Only relevant action buttons shown per status  

---

## Admin Settings

Admins can also set the **Global Withdrawal Fee** in the **Settings** tab:
- Default fee applies to all withdrawals
- User sees this fee before uploading receipt
- Fee can be customized per withdrawal request if needed

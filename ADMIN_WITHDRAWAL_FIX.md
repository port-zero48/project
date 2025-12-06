## ADMIN WITHDRAWAL MANAGEMENT FIX

### Summary of Changes Made

Two issues with admin withdrawal management have been addressed:

#### Issue 1: Withdrawal Deletion Not Persisting
**Symptom**: Delete shows success but withdrawal reappears after page refresh
**Root Cause**: Missing DELETE RLS policy on withdrawal_requests table
**Fix Applied**: Migration `20251204_add_withdrawal_delete_policies.sql`

Policies Added:
- Admin can delete any withdrawal request (by email 'vit88095@gmail.com' OR by role 'admin')
- Users can delete their own withdrawal requests
- Admin can view all withdrawal requests

#### Issue 2: Proof File Download Returns 400 Error
**Symptom**: Download request fails with "StorageUnknownError: {}"
**Root Cause**: Multiple conflicting SELECT policies on storage.objects table
**Fix Applied**: Migration `20251204_consolidate_storage_policies.sql`

Policies Consolidated:
- Single consolidated SELECT policy for "Withdrawal proofs access control"
- Users can see their own files (uid-based folder structure)
- Admins can see all files (email check: vit88095@gmail.com)
- Upload policy allows authenticated users
- New DELETE policy for admins to clean up files if needed

### Migrations to Apply

You must apply these two migrations to your Supabase database:

1. **20251204_add_withdrawal_delete_policies.sql** - Adds DELETE permissions
2. **20251204_consolidate_storage_policies.sql** - Fixes storage access policies

#### How to Apply:

**Option A: Via Supabase Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Copy the SQL from each migration file
3. Run each query
4. Verify success

**Option B: Via Supabase CLI**
```powershell
cd c:\Users\hp\Downloads\project112\project
supabase db push
```

### Code Changes Made

#### src/services/transactions.ts
- Enhanced `deleteWithdrawalRequest()` with detailed logging
- Now logs: file path, deletion steps, success/error messages
- Helps diagnose future issues

#### src/components/admin/WithdrawalRequests.tsx
- Enhanced `handleDeleteWithdrawal()`:
  - Optimistic UI update (removes immediately)
  - Awaits backend deletion
  - Reloads after 500ms to verify persistence
  - On error, reloads to show actual state

- Enhanced `downloadProof()`:
  - Detailed error logging at each step
  - Checks file data received
  - Logs file size
  - Better error messages to user

### Testing After Applying Migrations

#### Test 1: Deletion Persistence
1. Go to Admin Dashboard → Withdrawal Requests
2. Click delete on any withdrawal
3. Confirm it shows success message
4. Refresh the page
5. **Expected**: Withdrawal should NOT reappear (should be gone)

#### Test 2: Proof File Download
1. Go to Admin Dashboard → Withdrawal Requests
2. Find a withdrawal with "approved" status and proof_file_path
3. Click the proof file
4. **Expected**: File should download successfully (no 400 error)

#### Test 3: New Withdrawal Request
1. As user: Create new withdrawal request
2. Upload payment proof
3. As admin: See request in dashboard
4. Try to download proof - should work
5. Try to delete - should persist after refresh

### Troubleshooting

**If deletion still doesn't work:**
- Check that `20251204_add_withdrawal_delete_policies.sql` was applied
- Verify admin email is 'vit88095@gmail.com' in JWT
- Check browser console for exact error from deleteWithdrawalRequest()

**If download still returns 400:**
- Check that `20251204_consolidate_storage_policies.sql` was applied
- Verify the storage bucket 'withdrawal-proofs' exists
- Check that file actually exists in storage (check logs for path)
- Verify admin is authenticated in Supabase session

**Debug Logs to Check:**
1. Browser Console → Network tab → Check storage download request
2. Browser Console → Look for:
   - "Deleting withdrawal request: [id]"
   - "Withdrawal proof path: [path]"
   - "Downloading proof file: [path]"
   - "✓ File downloaded successfully"

### Files Modified

- `src/services/transactions.ts` - Enhanced deleteWithdrawalRequest() with logging
- `src/components/admin/WithdrawalRequests.tsx` - Enhanced delete/download handlers
- `supabase/migrations/20251204_add_withdrawal_delete_policies.sql` - NEW - Delete policies
- `supabase/migrations/20251204_consolidate_storage_policies.sql` - NEW - Storage policies

### Next Steps

1. Apply both migrations to Supabase
2. Test deletion and download functionality
3. If issues persist, check browser console for detailed error logs
4. Report any remaining errors with exact error messages from console

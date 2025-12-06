-- Consolidate and fix withdrawal-proofs storage policies
-- The issue is that multiple SELECT policies all need to pass
-- We need to ensure admins can download ANY file regardless of folder structure

-- Drop all conflicting policies
DROP POLICY IF EXISTS "Users can view their own withdrawal proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view all withdrawal proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admin can download withdrawal proofs" ON storage.objects;

-- Create a single consolidated SELECT policy that allows:
-- 1. Users to see their own files (where their uid is the folder)
-- 2. Admins to see all files
CREATE POLICY "Withdrawal proofs access control"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'withdrawal-proofs' 
    AND (
      -- Users can see their own files (uid is the folder name)
      auth.uid()::text = (storage.foldername(name))[1]
      -- OR admin can see all files (check email in JWT)
      OR auth.jwt() ->> 'email' = 'vit88095@gmail.com'
    )
  );

-- Ensure the upload policy allows authenticated users
DROP POLICY IF EXISTS "Users can upload to withdrawal-proofs" ON storage.objects;
CREATE POLICY "Users can upload to withdrawal-proofs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'withdrawal-proofs');

-- Add a DELETE policy for admins to clean up files if needed
DROP POLICY IF EXISTS "Admin can delete withdrawal proofs" ON storage.objects;
CREATE POLICY "Admin can delete withdrawal proofs"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'withdrawal-proofs' 
    AND auth.jwt() ->> 'email' = 'vit88095@gmail.com'
  );

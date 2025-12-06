-- Add RLS policies to existing chat-files bucket for payment slip uploads

-- Allow users to upload payment slips to their own folder
CREATE POLICY "users_upload_payment_slips" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' 
    AND (storage.foldername(name))[1] = 'payment-slips'
  );

-- Allow users to view their own payment slip files
CREATE POLICY "users_view_payment_slips" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-files' 
    AND (storage.foldername(name))[1] = 'payment-slips'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow admins to view all payment slip files
CREATE POLICY "admins_view_payment_slips" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-files' 
    AND (storage.foldername(name))[1] = 'payment-slips'
    AND is_admin()
  );

-- Allow admins to delete payment slip files
CREATE POLICY "admins_delete_payment_slips" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-files' 
    AND (storage.foldername(name))[1] = 'payment-slips'
    AND is_admin()
  );




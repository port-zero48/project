-- Enable RLS on chat-files bucket
-- This migration ensures proper RLS policies for file uploads and downloads

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "chat-files-upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-files');

-- Policy 2: Allow authenticated users to read any file in chat-files
CREATE POLICY "chat-files-read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'chat-files');

-- Policy 3: Allow users to delete their own files
CREATE POLICY "chat-files-delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 4: Allow updates
CREATE POLICY "chat-files-update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

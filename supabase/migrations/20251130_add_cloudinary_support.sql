-- Add Cloudinary public_id column to file_attachments table for file deletion support
ALTER TABLE public.file_attachments
ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;

-- Create index on cloudinary_public_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_attachments_cloudinary_public_id ON public.file_attachments(cloudinary_public_id);

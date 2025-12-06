# Cloudinary Setup Guide

## Steps to Set Up Cloudinary for File Storage

### 1. Create a Cloudinary Account
- Go to https://cloudinary.com
- Sign up for a free account
- Free tier includes 25GB of storage

### 2. Get Your Credentials
- Go to Dashboard
- Copy your **Cloud Name**
- Go to Settings → Upload
- Create an **Upload Preset** (set to "Unsigned" for client-side uploads)
- Copy your **API Key** (from Settings → Account)

### 3. Update Environment Variables
In your `.env.local` file:
```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_CLOUDINARY_API_KEY=your_api_key
```

### 4. Database Migration
Run this SQL in Supabase SQL Editor:
```sql
ALTER TABLE public.file_attachments
ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;

CREATE INDEX IF NOT EXISTS idx_attachments_cloudinary_public_id ON public.file_attachments(cloudinary_public_id);
```

Or go to SQL Editor and run the migration file: `supabase/migrations/20251130_add_cloudinary_support.sql`

### 5. Features
- ✅ Upload files/images to Cloudinary
- ✅ Real-time preview of images in chat
- ✅ Delete files from Cloudinary when messages are deleted
- ✅ 25GB free storage (can upgrade for more)
- ✅ Automatic image optimization
- ✅ CDN delivery (fast loading worldwide)

### 6. File Organization
Files are organized in Cloudinary as: `chat-support/{userId}/{timestamp}.{ext}`

## Free vs Paid
- **Free**: 25GB storage, 25GB bandwidth/month
- **Paid**: Unlimited storage and bandwidth

Cloudinary is much better than Supabase Storage for file hosting!

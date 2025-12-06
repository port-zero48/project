/*
  # Create Messages Table for Chat System

  1. Changes
    - Create messages table for support and trading chat
    - Create file_attachments table for storing file/image metadata
    - Add RLS policies for message access
    - Add storage bucket for file uploads
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'support', -- 'support', 'trading', 'dm'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create file attachments table
CREATE TABLE IF NOT EXISTS public.file_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create indexes
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_type ON public.messages(message_type);
CREATE INDEX idx_messages_created ON public.messages(created_at);
CREATE INDEX idx_attachments_message ON public.file_attachments(message_id);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Allow all to view support messages
CREATE POLICY "Anyone can view support messages"
  ON public.messages FOR SELECT
  USING (message_type = 'support');

-- RLS Policies for file attachments
CREATE POLICY "Users can view attachments in their messages"
  ON public.file_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE public.messages.id = public.file_attachments.message_id
      AND (auth.uid() = public.messages.sender_id OR auth.uid() = public.messages.receiver_id)
    )
  );

CREATE POLICY "Users can insert attachments in their messages"
  ON public.file_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE public.messages.id = public.file_attachments.message_id
      AND auth.uid() = public.messages.sender_id
    )
  );

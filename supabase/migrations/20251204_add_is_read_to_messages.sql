-- Add is_read column to messages table for tracking read status
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_is_read ON public.messages(receiver_id, is_read);

-- Add comment
COMMENT ON COLUMN public.messages.is_read IS 'Tracks whether the message has been read by the recipient';

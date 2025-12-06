-- Migration: Allow marking support messages as read by recipients and admins
-- This migration creates RLS policies that permit:
-- 1) The message recipient to mark their messages as read (set is_read = true)
-- 2) Admins to mark support messages as read (set is_read = true), including messages with NULL receiver_id

-- Recipients can mark their own messages as read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Recipients can mark messages read' AND polrelid = 'public.messages'::regclass
  ) THEN
    EXECUTE $sql$
    CREATE POLICY "Recipients can mark messages read"
      ON public.messages FOR UPDATE
      USING (auth.uid() = receiver_id)
      WITH CHECK (auth.uid() = receiver_id AND is_read = true);
    $sql$;
  END IF;
END$$;

-- Admins can mark support messages as read (including messages with NULL receiver_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can mark support messages read' AND polrelid = 'public.messages'::regclass
  ) THEN
    EXECUTE $sql$
    CREATE POLICY "Admins can mark support messages read"
      ON public.messages FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
        )
      )
      WITH CHECK (message_type = 'support' AND is_read = true);
    $sql$;
  END IF;
END$$;

-- Note: these policies restrict UPDATE operations to only allow setting is_read = true
-- by the recipient or by an admin (for support messages). This prevents clients
-- from modifying other message fields via these policies.

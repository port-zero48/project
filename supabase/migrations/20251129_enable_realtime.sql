-- Enable Realtime for messages, file_attachments, and users tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.file_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

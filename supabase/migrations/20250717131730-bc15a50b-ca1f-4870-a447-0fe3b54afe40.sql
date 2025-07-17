-- Fix RLS policies for private_messages table to allow proper message sending

-- Drop existing policies
DROP POLICY IF EXISTS "Users can send private messages" ON public.private_messages;
DROP POLICY IF EXISTS "Users can view own private messages" ON public.private_messages;
DROP POLICY IF EXISTS "Users can update own private messages" ON public.private_messages;

-- Create correct policies for private messages
CREATE POLICY "Users can send private messages"
ON public.private_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view private messages"
ON public.private_messages
FOR SELECT
TO authenticated
USING (
  (auth.uid() = sender_id AND NOT deleted_by_sender) OR 
  (auth.uid() = recipient_id AND NOT deleted_by_recipient)
);

CREATE POLICY "Users can update private messages"
ON public.private_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id)
WITH CHECK (auth.uid() = sender_id OR auth.uid() = recipient_id);
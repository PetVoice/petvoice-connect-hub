-- Create private chats table only (private_messages already exists but needs modifications)
CREATE TABLE public.private_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id UUID NOT NULL,
  participant_2_id UUID NOT NULL,
  initiated_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(participant_1_id, participant_2_id)
);

-- Add chat_id column to existing private_messages table
ALTER TABLE public.private_messages 
ADD COLUMN chat_id UUID REFERENCES public.private_chats(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.private_chats ENABLE ROW LEVEL SECURITY;

-- RLS policies for private chats
CREATE POLICY "Users can view chats they participate in"
ON public.private_chats
FOR SELECT
USING (
  auth.uid() = participant_1_id OR 
  auth.uid() = participant_2_id
);

CREATE POLICY "Users can create chats"
ON public.private_chats
FOR INSERT
WITH CHECK (
  auth.uid() = initiated_by AND
  (auth.uid() = participant_1_id OR auth.uid() = participant_2_id)
);

CREATE POLICY "Users can update chats they participate in"
ON public.private_chats
FOR UPDATE
USING (
  auth.uid() = participant_1_id OR 
  auth.uid() = participant_2_id
);

-- Update RLS policies for private_messages to use chats
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.private_messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON public.private_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.private_messages;

CREATE POLICY "Users can view messages in their chats"
ON public.private_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.private_chats 
    WHERE id = private_messages.chat_id 
    AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  ) OR 
  (auth.uid() = sender_id OR auth.uid() = recipient_id)
);

CREATE POLICY "Users can send messages in their chats"
ON public.private_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  (EXISTS (
    SELECT 1 FROM public.private_chats 
    WHERE id = private_messages.chat_id 
    AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  ) OR chat_id IS NULL)
);

CREATE POLICY "Users can update their own messages"
ON public.private_messages
FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Trigger for updated_at on private_chats
CREATE TRIGGER update_private_chats_updated_at
BEFORE UPDATE ON public.private_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update last_message_at in private_chats
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.chat_id IS NOT NULL THEN
    UPDATE public.private_chats 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.chat_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_last_message_trigger
AFTER INSERT ON public.private_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_last_message();
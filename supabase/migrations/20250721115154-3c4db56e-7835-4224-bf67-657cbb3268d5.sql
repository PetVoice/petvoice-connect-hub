-- Create private chats table only (private_messages already exists)
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

-- Add missing chat_id foreign key to private_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'private_messages' 
    AND constraint_name LIKE '%chat_id%'
  ) THEN
    ALTER TABLE public.private_messages 
    ADD CONSTRAINT private_messages_chat_id_fkey 
    FOREIGN KEY (chat_id) REFERENCES public.private_chats(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Trigger for updated_at on private_chats
CREATE TRIGGER update_private_chats_updated_at
BEFORE UPDATE ON public.private_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update last_message_at in private_chats
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.private_chats 
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_last_message_trigger
AFTER INSERT ON public.private_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_last_message();
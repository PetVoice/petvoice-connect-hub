-- Create private chats table
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

-- Create private messages table
CREATE TABLE public.private_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.private_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

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

-- RLS policies for private messages
CREATE POLICY "Users can view messages in their chats"
ON public.private_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.private_chats 
    WHERE id = private_messages.chat_id 
    AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their chats"
ON public.private_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.private_chats 
    WHERE id = private_messages.chat_id 
    AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages"
ON public.private_messages
FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_private_chats_updated_at
BEFORE UPDATE ON public.private_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_private_messages_updated_at
BEFORE UPDATE ON public.private_messages
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
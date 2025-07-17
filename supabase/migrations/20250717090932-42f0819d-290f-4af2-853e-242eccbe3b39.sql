-- Crea tabella per i messaggi privati
CREATE TABLE public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  file_url TEXT,
  voice_duration INTEGER,
  reply_to_id UUID REFERENCES public.private_messages(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  deleted_by_sender BOOLEAN DEFAULT FALSE,
  deleted_by_recipient BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Policy per leggere i propri messaggi privati
CREATE POLICY "Users can view own private messages" ON public.private_messages
  FOR SELECT 
  USING (
    (sender_id = auth.uid() AND NOT deleted_by_sender) OR 
    (recipient_id = auth.uid() AND NOT deleted_by_recipient)
  );

-- Policy per inviare messaggi privati
CREATE POLICY "Users can send private messages" ON public.private_messages
  FOR INSERT 
  WITH CHECK (sender_id = auth.uid());

-- Policy per aggiornare i propri messaggi
CREATE POLICY "Users can update own private messages" ON public.private_messages
  FOR UPDATE 
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Indici per performance
CREATE INDEX idx_private_messages_sender ON public.private_messages(sender_id);
CREATE INDEX idx_private_messages_recipient ON public.private_messages(recipient_id);
CREATE INDEX idx_private_messages_conversation ON public.private_messages(sender_id, recipient_id);
CREATE INDEX idx_private_messages_created_at ON public.private_messages(created_at);

-- Crea tabella per memorizzare i nomi degli utenti (per visualizzare i nomi nei messaggi)
CREATE TABLE public.user_display_names (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_online BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS per user_display_names
ALTER TABLE public.user_display_names ENABLE ROW LEVEL SECURITY;

-- Policy per leggere i nomi degli utenti (pubblico)
CREATE POLICY "Everyone can view user display names" ON public.user_display_names
  FOR SELECT 
  USING (true);

-- Policy per aggiornare il proprio nome
CREATE POLICY "Users can update own display name" ON public.user_display_names
  FOR ALL 
  USING (user_id = auth.uid());

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_private_messages_updated_at 
    BEFORE UPDATE ON public.private_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_display_names_updated_at 
    BEFORE UPDATE ON public.user_display_names 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Popola la tabella user_display_names con i dati esistenti dai profili
INSERT INTO public.user_display_names (user_id, display_name, avatar_url)
SELECT 
  user_id, 
  COALESCE(display_name, 'Utente sconosciuto') as display_name,
  avatar_url
FROM public.profiles
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url;
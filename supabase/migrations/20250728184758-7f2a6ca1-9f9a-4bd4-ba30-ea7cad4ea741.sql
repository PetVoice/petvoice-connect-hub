-- Crea tabella per tracciare i messaggi non letti per ogni ticket
CREATE TABLE public.support_ticket_unread_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ticket_id, user_id)
);

-- Enable RLS
ALTER TABLE public.support_ticket_unread_counts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own unread counts" 
ON public.support_ticket_unread_counts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own unread counts" 
ON public.support_ticket_unread_counts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unread counts" 
ON public.support_ticket_unread_counts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own unread counts" 
ON public.support_ticket_unread_counts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_support_ticket_unread_counts_updated_at
BEFORE UPDATE ON public.support_ticket_unread_counts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Funzione per incrementare unread count quando viene aggiunto un nuovo reply
CREATE OR REPLACE FUNCTION public.increment_unread_count_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  ticket_participants UUID[];
  participant UUID;
BEGIN
  -- Ottieni tutti gli utenti coinvolti nel ticket (creatore del ticket + staff che hanno risposto)
  SELECT ARRAY_AGG(DISTINCT user_id) INTO ticket_participants
  FROM (
    -- Creatore del ticket
    SELECT user_id FROM public.support_tickets WHERE id = NEW.ticket_id
    UNION
    -- Staff che hanno risposto
    SELECT DISTINCT user_id FROM public.support_ticket_replies 
    WHERE ticket_id = NEW.ticket_id AND is_staff_reply = true
    UNION 
    -- Altri utenti che hanno risposto (nel caso di ticket condivisi in futuro)
    SELECT DISTINCT user_id FROM public.support_ticket_replies 
    WHERE ticket_id = NEW.ticket_id
  ) all_users;

  -- Per ogni partecipante (eccetto chi ha inviato il messaggio), incrementa l'unread count
  FOREACH participant IN ARRAY ticket_participants
  LOOP
    IF participant != NEW.user_id THEN
      INSERT INTO public.support_ticket_unread_counts (ticket_id, user_id, unread_count)
      VALUES (NEW.ticket_id, participant, 1)
      ON CONFLICT (ticket_id, user_id) 
      DO UPDATE SET 
        unread_count = support_ticket_unread_counts.unread_count + 1,
        updated_at = now();
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per incrementare unread count
CREATE TRIGGER increment_unread_on_new_reply
AFTER INSERT ON public.support_ticket_replies
FOR EACH ROW
EXECUTE FUNCTION public.increment_unread_count_on_reply();

-- Funzione per azzerare unread count quando un utente apre un ticket
CREATE OR REPLACE FUNCTION public.mark_ticket_as_read(p_ticket_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.support_ticket_unread_counts (ticket_id, user_id, unread_count, last_read_at)
  VALUES (p_ticket_id, p_user_id, 0, now())
  ON CONFLICT (ticket_id, user_id) 
  DO UPDATE SET 
    unread_count = 0,
    last_read_at = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
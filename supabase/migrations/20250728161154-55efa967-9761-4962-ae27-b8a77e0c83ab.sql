-- Creo la tabella per le risposte dei ticket
CREATE TABLE IF NOT EXISTS public.support_ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_staff_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;

-- Policy per visualizzare le proprie risposte ai ticket
CREATE POLICY "Users can view replies to their tickets" 
ON public.support_ticket_replies 
FOR SELECT 
USING (
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE user_id = auth.uid()
  )
);

-- Policy per creare risposte ai propri ticket
CREATE POLICY "Users can reply to their own tickets" 
ON public.support_ticket_replies 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE user_id = auth.uid()
  )
);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_support_ticket_replies_updated_at
    BEFORE UPDATE ON public.support_ticket_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
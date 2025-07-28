-- Modifica policy per support_tickets: gli admin possono vedere tutti i ticket
DROP POLICY IF EXISTS "Users can view own tickets or admins can view all" ON public.support_tickets;

CREATE POLICY "Users can view own tickets or admins can view all" 
ON public.support_tickets 
FOR SELECT 
TO public
USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Modifica policy per support_ticket_replies: gli admin possono vedere tutte le risposte
DROP POLICY IF EXISTS "Users can view own ticket replies or admins can view all" ON public.support_ticket_replies;

CREATE POLICY "Users can view own ticket replies or admins can view all" 
ON public.support_ticket_replies 
FOR SELECT 
TO public
USING (
  -- L'utente può vedere le risposte ai suoi ticket
  (ticket_id IN (
    SELECT id FROM support_tickets WHERE user_id = auth.uid()
  )) OR 
  -- Gli admin possono vedere tutte le risposte
  has_role(auth.uid(), 'admin'::app_role)
);

-- Nuova policy semplificata per INSERT: admin possono rispondere a qualsiasi ticket
DROP POLICY IF EXISTS "Users can create replies to own tickets or admins to all" ON public.support_ticket_replies;
DROP POLICY IF EXISTS "Users can reply to their own tickets" ON public.support_ticket_replies;

CREATE POLICY "Users can reply to own tickets and admins to all tickets" 
ON public.support_ticket_replies 
FOR INSERT 
TO public
WITH CHECK (
  (auth.uid() = user_id) AND (
    -- Utenti normali: solo ai propri ticket
    (ticket_id IN (
      SELECT id FROM support_tickets WHERE user_id = auth.uid()
    )) OR
    -- Admin: a qualsiasi ticket
    has_role(auth.uid(), 'admin'::app_role)
  )
);
-- Correggi policy per INSERT su support_ticket_replies
DROP POLICY IF EXISTS "Users can reply to own tickets and admins to all tickets" ON public.support_ticket_replies;

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
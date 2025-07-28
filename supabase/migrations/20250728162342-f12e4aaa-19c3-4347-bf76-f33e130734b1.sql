-- Assegna ruolo admin all'utente specifico se non esiste già
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Trova l'ID dell'utente beppe8949@hotmail.it
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'beppe8949@hotmail.it' 
    LIMIT 1;
    
    -- Se l'utente esiste, assegna il ruolo admin
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Ruolo admin assegnato all''utente %', admin_user_id;
    ELSE
        RAISE NOTICE 'Utente beppe8949@hotmail.it non trovato. Verrà assegnato automaticamente quando si registra.';
    END IF;
END $$;

-- Aggiorna policies per support_tickets: admin può vedere tutti i ticket
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets or admins can view all" ON public.support_tickets
FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Aggiorna policies per support_ticket_replies: admin può vedere tutte le risposte
DROP POLICY IF EXISTS "Users can view replies to their tickets" ON public.support_ticket_replies;
CREATE POLICY "Users can view own ticket replies or admins can view all" ON public.support_ticket_replies
FOR SELECT USING (
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Users can create replies to their tickets" ON public.support_ticket_replies;
CREATE POLICY "Users can create replies to own tickets or admins to all" ON public.support_ticket_replies
FOR INSERT WITH CHECK (
  (ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE user_id = auth.uid()
  ) AND auth.uid() = user_id AND is_staff_reply = false) 
  OR 
  (public.has_role(auth.uid(), 'admin') AND is_staff_reply = true)
);
-- Abilita realtime per le tabelle di supporto
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_ticket_replies;

-- Assicurati che le tabelle abbiano REPLICA IDENTITY FULL per catturare tutti i cambiamenti
ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;
ALTER TABLE public.support_ticket_replies REPLICA IDENTITY FULL;
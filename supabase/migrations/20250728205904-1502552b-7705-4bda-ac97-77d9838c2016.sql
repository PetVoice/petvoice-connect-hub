-- Elimina tutti i ticket di supporto e dati correlati per pulire il database

-- Prima elimina le risposte ai ticket
DELETE FROM public.support_ticket_replies;

-- Poi elimina i conteggi non letti
DELETE FROM public.support_ticket_unread_counts;

-- Infine elimina tutti i ticket
DELETE FROM public.support_tickets;
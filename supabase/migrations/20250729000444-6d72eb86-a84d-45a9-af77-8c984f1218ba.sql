-- Aggiungi campo per eliminazione globale dei messaggi
ALTER TABLE public.support_ticket_replies 
ADD COLUMN deleted_by_all boolean DEFAULT false;

-- Aggiorna l'indice per includere il nuovo campo
CREATE INDEX idx_support_ticket_replies_visibility 
ON public.support_ticket_replies (ticket_id, deleted_by_all, deleted_by_sender, deleted_by_recipient);

-- Commento per spiegare l'uso
COMMENT ON COLUMN public.support_ticket_replies.deleted_by_all IS 'Indica se il messaggio è stato eliminato per tutti gli utenti (solo admin/staff)';
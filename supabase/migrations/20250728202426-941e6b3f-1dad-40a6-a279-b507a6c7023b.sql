-- Aggiungi campi per gestire eliminazione e modifica messaggi nei support ticket replies
ALTER TABLE public.support_ticket_replies 
ADD COLUMN IF NOT EXISTS deleted_by_sender boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_by_recipient boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false;

-- Aggiorna il trigger per marcare come modificato quando si cambia il contenuto
CREATE OR REPLACE FUNCTION public.mark_ticket_reply_as_edited()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Se il contenuto è cambiato, marca come modificato
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    NEW.is_edited = true;
    NEW.updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aggiungi trigger per marcare come modificato
DROP TRIGGER IF EXISTS mark_reply_edited_trigger ON public.support_ticket_replies;
CREATE TRIGGER mark_reply_edited_trigger
  BEFORE UPDATE ON public.support_ticket_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_ticket_reply_as_edited();
-- Trigger per riattivazione automatica delle chat eliminate
CREATE OR REPLACE FUNCTION public.auto_reactivate_deleted_chat()
RETURNS TRIGGER AS $$
BEGIN
  -- Log del nuovo messaggio per debug
  RAISE NOTICE 'TRIGGER: Nuovo messaggio chat_id=%, sender_id=%, recipient_id=%, content=%', 
               NEW.chat_id, NEW.sender_id, NEW.recipient_id, NEW.content;

  -- Riattiva chat se era eliminata solo per il destinatario
  -- Caso 1: Il destinatario è participant_1
  UPDATE public.private_chats 
  SET 
    deleted_by_participant_1 = false,
    deleted_at = NULL
  WHERE id = NEW.chat_id 
    AND participant_1_id = NEW.recipient_id     -- participant_1 è il destinatario
    AND deleted_by_participant_1 = true         -- Era eliminata solo per participant_1
    AND deleted_by_participant_2 = false;       -- Ma NON eliminata per participant_2

  IF FOUND THEN
    RAISE NOTICE 'TRIGGER: Chat riattivata per participant_1 (user_id=%)', NEW.recipient_id;
  END IF;
    
  -- Caso 2: Il destinatario è participant_2
  UPDATE public.private_chats 
  SET 
    deleted_by_participant_2 = false,
    deleted_at = NULL
  WHERE id = NEW.chat_id 
    AND participant_2_id = NEW.recipient_id     -- participant_2 è il destinatario
    AND deleted_by_participant_2 = true         -- Era eliminata solo per participant_2
    AND deleted_by_participant_1 = false;       -- Ma NON eliminata per participant_1

  IF FOUND THEN
    RAISE NOTICE 'TRIGGER: Chat riattivata per participant_2 (user_id=%)', NEW.recipient_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rimuovi trigger esistente se presente
DROP TRIGGER IF EXISTS auto_reactivate_chat_trigger ON public.private_messages;

-- Crea nuovo trigger
CREATE TRIGGER auto_reactivate_chat_trigger
  AFTER INSERT ON public.private_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_reactivate_deleted_chat();
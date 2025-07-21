-- Trigger per eliminare automaticamente messaggi quando si elimina una chat solo per sé
CREATE OR REPLACE FUNCTION public.auto_delete_messages_on_chat_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Log per debug
  RAISE NOTICE 'TRIGGER: Chat modificata chat_id=%, deleted_p1=%, deleted_p2=%', 
               NEW.id, NEW.deleted_by_participant_1, NEW.deleted_by_participant_2;

  -- Se participant_1 ha appena eliminato la chat solo per sé
  IF NEW.deleted_by_participant_1 = true AND OLD.deleted_by_participant_1 = false 
     AND NEW.deleted_by_participant_2 = false THEN
    
    -- Elimina tutti i messaggi SOLO per participant_1
    -- Messaggi dove participant_1 è il sender
    UPDATE public.private_messages 
    SET deleted_by_sender = true, deleted_at = NOW()
    WHERE chat_id = NEW.id 
      AND sender_id = NEW.participant_1_id;
      
    -- Messaggi dove participant_1 è il recipient  
    UPDATE public.private_messages 
    SET deleted_by_recipient = true, deleted_at = NOW()
    WHERE chat_id = NEW.id 
      AND recipient_id = NEW.participant_1_id;
      
    RAISE NOTICE 'TRIGGER: Messaggi eliminati solo per participant_1 (user_id=%)', NEW.participant_1_id;
  END IF;

  -- Se participant_2 ha appena eliminato la chat solo per sé
  IF NEW.deleted_by_participant_2 = true AND OLD.deleted_by_participant_2 = false 
     AND NEW.deleted_by_participant_1 = false THEN
    
    -- Elimina tutti i messaggi SOLO per participant_2
    -- Messaggi dove participant_2 è il sender
    UPDATE public.private_messages 
    SET deleted_by_sender = true, deleted_at = NOW()
    WHERE chat_id = NEW.id 
      AND sender_id = NEW.participant_2_id;
      
    -- Messaggi dove participant_2 è il recipient
    UPDATE public.private_messages 
    SET deleted_by_recipient = true, deleted_at = NOW()
    WHERE chat_id = NEW.id 
      AND recipient_id = NEW.participant_2_id;
      
    RAISE NOTICE 'TRIGGER: Messaggi eliminati solo per participant_2 (user_id=%)', NEW.participant_2_id;
  END IF;

  -- Se entrambi eliminano la chat, elimina tutti i messaggi per entrambi
  IF NEW.deleted_by_participant_1 = true AND NEW.deleted_by_participant_2 = true 
     AND (OLD.deleted_by_participant_1 = false OR OLD.deleted_by_participant_2 = false) THEN
    
    UPDATE public.private_messages 
    SET deleted_by_sender = true, deleted_by_recipient = true, deleted_at = NOW()
    WHERE chat_id = NEW.id;
    
    RAISE NOTICE 'TRIGGER: Messaggi eliminati per entrambi i partecipanti';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rimuovi trigger esistente se presente
DROP TRIGGER IF EXISTS auto_delete_messages_trigger ON public.private_chats;

-- Crea trigger per eliminazione automatica messaggi
CREATE TRIGGER auto_delete_messages_trigger
  AFTER UPDATE ON public.private_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_delete_messages_on_chat_deletion();
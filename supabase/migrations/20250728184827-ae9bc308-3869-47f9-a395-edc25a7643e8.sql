-- Fix security warnings by adding search_path to functions
CREATE OR REPLACE FUNCTION public.increment_unread_count_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  ticket_participants UUID[];
  participant UUID;
BEGIN
  -- Ottieni tutti gli utenti coinvolti nel ticket (creatore del ticket + staff che hanno risposto)
  SELECT ARRAY_AGG(DISTINCT user_id) INTO ticket_participants
  FROM (
    -- Creatore del ticket
    SELECT user_id FROM public.support_tickets WHERE id = NEW.ticket_id
    UNION
    -- Staff che hanno risposto
    SELECT DISTINCT user_id FROM public.support_ticket_replies 
    WHERE ticket_id = NEW.ticket_id AND is_staff_reply = true
    UNION 
    -- Altri utenti che hanno risposto (nel caso di ticket condivisi in futuro)
    SELECT DISTINCT user_id FROM public.support_ticket_replies 
    WHERE ticket_id = NEW.ticket_id
  ) all_users;

  -- Per ogni partecipante (eccetto chi ha inviato il messaggio), incrementa l'unread count
  FOREACH participant IN ARRAY ticket_participants
  LOOP
    IF participant != NEW.user_id THEN
      INSERT INTO public.support_ticket_unread_counts (ticket_id, user_id, unread_count)
      VALUES (NEW.ticket_id, participant, 1)
      ON CONFLICT (ticket_id, user_id) 
      DO UPDATE SET 
        unread_count = support_ticket_unread_counts.unread_count + 1,
        updated_at = now();
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_temp';

-- Fix the mark_ticket_as_read function
CREATE OR REPLACE FUNCTION public.mark_ticket_as_read(p_ticket_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.support_ticket_unread_counts (ticket_id, user_id, unread_count, last_read_at)
  VALUES (p_ticket_id, p_user_id, 0, now())
  ON CONFLICT (ticket_id, user_id) 
  DO UPDATE SET 
    unread_count = 0,
    last_read_at = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_temp';
-- Ricreiamo il trigger per generare il ticket_number
CREATE TRIGGER set_ticket_number_trigger
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_ticket_number();
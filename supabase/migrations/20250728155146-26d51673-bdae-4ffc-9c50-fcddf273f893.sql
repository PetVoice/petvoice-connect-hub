-- Verifichiamo se ci sono trigger che potrebbero causare conflitti
-- Prima, disabilitiamo temporaneamente il trigger e vediamo se il problema persiste
DROP TRIGGER IF EXISTS set_ticket_number_trigger ON public.support_tickets;

-- Ricreiamo la tabella support_tickets in modo più pulito
-- Prima controlliamo se la tabella esiste e la sua struttura
-- Se necessario, la ricreeremo da zero
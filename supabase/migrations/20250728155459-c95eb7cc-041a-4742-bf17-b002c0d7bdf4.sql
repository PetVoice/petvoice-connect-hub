-- Correggiamo definitivamente la funzione set_ticket_number
-- Il problema è l'ambiguità tra NEW.ticket_number e il parametro della funzione
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    new_ticket_num text;
BEGIN
    -- Usiamo una variabile diversa per evitare conflitti
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        new_ticket_num := 'PV' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                         LPAD(CAST(FLOOR(RANDOM() * 10000) AS text), 4, '0');
        
        -- Verifica unicità
        WHILE EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.ticket_number = new_ticket_num) LOOP
            new_ticket_num := 'PV' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                            LPAD(CAST(FLOOR(RANDOM() * 10000) AS text), 4, '0');
        END LOOP;
        
        NEW.ticket_number := new_ticket_num;
    END IF;
    RETURN NEW;
END;
$function$;
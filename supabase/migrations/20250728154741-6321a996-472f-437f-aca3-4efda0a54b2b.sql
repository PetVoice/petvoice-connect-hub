-- Fix the generate_ticket_number function to be more explicit
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    ticket_number text;
BEGIN
    ticket_number := 'PV' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                     LPAD(CAST(FLOOR(RANDOM() * 10000) AS text), 4, '0');
    
    -- Verifica unicità con alias per evitare ambiguità
    WHILE EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.ticket_number = ticket_number) LOOP
        ticket_number := 'PV' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                        LPAD(CAST(FLOOR(RANDOM() * 10000) AS text), 4, '0');
    END LOOP;
    
    RETURN ticket_number;
END;
$function$;
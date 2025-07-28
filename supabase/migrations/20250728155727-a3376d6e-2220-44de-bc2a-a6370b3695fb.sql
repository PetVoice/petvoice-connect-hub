-- Droppiamo la funzione esistente e la ricreiamo con parametri corretti
DROP FUNCTION IF EXISTS public.calculate_sla_deadline(text, text);

-- Ricreiamo la funzione con parametri disambiguati
CREATE OR REPLACE FUNCTION public.calculate_sla_deadline(p_category text, p_priority text)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    response_time_minutes integer;
BEGIN
    SELECT s.response_time_minutes INTO response_time_minutes
    FROM support_sla_config s
    WHERE s.category = p_category AND s.priority = p_priority AND s.is_active = true
    LIMIT 1;
    
    IF response_time_minutes IS NULL THEN
        -- Default SLA
        CASE p_priority
            WHEN 'critical' THEN response_time_minutes := 60;
            WHEN 'high' THEN response_time_minutes := 240;
            WHEN 'medium' THEN response_time_minutes := 480;
            WHEN 'low' THEN response_time_minutes := 1440;
        END CASE;
    END IF;
    
    RETURN now() + (response_time_minutes || ' minutes')::interval;
END;
$function$;
-- Correggi la funzione calculate_sla_deadline aggiungendo ELSE al CASE
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
        -- Default SLA basato sulla priorità
        CASE p_priority
            WHEN 'critical' THEN response_time_minutes := 60;    -- 1 ora
            WHEN 'urgent' THEN response_time_minutes := 120;     -- 2 ore  
            WHEN 'high' THEN response_time_minutes := 240;       -- 4 ore
            WHEN 'medium' THEN response_time_minutes := 480;     -- 8 ore
            WHEN 'low' THEN response_time_minutes := 1440;       -- 24 ore
            ELSE response_time_minutes := 480;                   -- Default 8 ore per priorità non riconosciute
        END CASE;
    END IF;
    
    RETURN now() + (response_time_minutes || ' minutes')::interval;
END;
$function$;
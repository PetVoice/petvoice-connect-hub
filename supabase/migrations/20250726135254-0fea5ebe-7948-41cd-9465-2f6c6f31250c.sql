-- Elimina tutti i parametri vitali non validi dalla tabella health_metrics
-- Mantiene solo i parametri consentiti nel menu a tendina dell'applicazione

DELETE FROM public.health_metrics 
WHERE metric_type NOT IN (
  'temperature',        -- Temperatura Corporea
  'heart_rate',         -- Frequenza Cardiaca  
  'breathing_rate',     -- Respirazione
  'gum_color'          -- Colore Gengive
);

-- Log dei parametri eliminati per verificare l'operazione
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata
) 
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid, -- UUID di sistema
  'data_cleanup',
  'Eliminati parametri vitali non validi dal database',
  jsonb_build_object(
    'cleanup_date', now(),
    'valid_metric_types', ARRAY['temperature', 'heart_rate', 'breathing_rate', 'gum_color'],
    'action', 'Invalid health metrics removed from database'
  );
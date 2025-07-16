-- Rimuovi il constraint esistente e aggiungine uno nuovo che include tutti i tipi
ALTER TABLE health_metrics DROP CONSTRAINT IF EXISTS health_metrics_metric_type_check;

-- Aggiungi il nuovo constraint che include i tipi esistenti e quelli nuovi
ALTER TABLE health_metrics ADD CONSTRAINT health_metrics_metric_type_check 
CHECK (metric_type IN ('temperature', 'heart_rate', 'respiration', 'gum_color', 'weight', 'behavior', 'appetite', 'sleep', 'activity'));
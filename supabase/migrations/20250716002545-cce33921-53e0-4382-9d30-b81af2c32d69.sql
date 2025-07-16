-- Rimuovi il constraint esistente e aggiungine uno nuovo con i tipi corretti
ALTER TABLE health_metrics DROP CONSTRAINT IF EXISTS health_metrics_metric_type_check;

-- Aggiungi il nuovo constraint con i tipi di metrica corretti
ALTER TABLE health_metrics ADD CONSTRAINT health_metrics_metric_type_check 
CHECK (metric_type IN ('temperature', 'heart_rate', 'respiration', 'gum_color'));
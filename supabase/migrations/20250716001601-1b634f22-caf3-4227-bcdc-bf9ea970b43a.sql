-- Rimuovi il trigger che causa l'errore per health_metrics
DROP TRIGGER IF EXISTS update_health_metrics_updated_at ON health_metrics;
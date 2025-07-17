-- Aggiungi campi per tracciare cancellazione immediata e possibilità di riattivazione
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS can_reactivate BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS immediate_cancellation_after_period_end BOOLEAN DEFAULT FALSE;

-- Aggiungi commenti per chiarire l'uso dei campi
COMMENT ON COLUMN public.subscribers.can_reactivate IS 'Se TRUE, l''utente può riattivare l''abbonamento cancellato a fine periodo. Diventa FALSE se cancella immediatamente dopo period_end.';
COMMENT ON COLUMN public.subscribers.immediate_cancellation_after_period_end IS 'TRUE se l''utente ha cancellato immediatamente dopo aver già cancellato a fine periodo. Impedisce future riattivazioni.';
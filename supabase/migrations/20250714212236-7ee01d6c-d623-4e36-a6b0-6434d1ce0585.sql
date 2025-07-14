-- Rimuovi temporaneamente il trigger che potrebbe causare problemi durante la registrazione
DROP TRIGGER IF EXISTS on_subscription_conversion ON public.subscribers;

-- Rimuovi anche il trigger monthly credit che potrebbe causare problemi
DROP TRIGGER IF EXISTS on_subscription_monthly_credit ON public.subscribers;
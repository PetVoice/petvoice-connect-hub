-- Forza il processamento del referral esistente simulando un update
UPDATE public.subscribers 
SET updated_at = NOW() 
WHERE user_id = '075d7147-68a4-4f33-b72f-e85206c5b227' 
AND subscription_status = 'active';
-- Primo step: rimuovi i referral orfani e crea constraint
DELETE FROM public.referrals 
WHERE referrer_id NOT IN (SELECT id FROM auth.users);

-- Crea constraint solo se non esiste già
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_referrals_user_id_unique' 
        AND table_name = 'user_referrals'
    ) THEN
        ALTER TABLE public.user_referrals 
        ADD CONSTRAINT user_referrals_user_id_unique UNIQUE (user_id);
    END IF;
END $$;
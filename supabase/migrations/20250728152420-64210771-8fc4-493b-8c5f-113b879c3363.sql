-- Rimuovi i trigger problematici che fanno riferimento a tabelle inesistenti
DROP TRIGGER IF EXISTS handle_user_deletion_referrals_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_user_deletion_referrals ON auth.users;
DROP TRIGGER IF EXISTS preserve_referral_history_trigger ON auth.users;

-- Ora elimina gli utenti tranne giusepperos89@gmail.com
DELETE FROM auth.users 
WHERE email != 'giusepperos89@gmail.com';

-- Verifica risultato
SELECT count(*) as total_users, string_agg(email, ', ') as remaining_emails 
FROM auth.users;
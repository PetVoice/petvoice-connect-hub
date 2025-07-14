-- Pulisci i trigger duplicati e conflittuali sulla tabella auth.users
DROP TRIGGER IF EXISTS on_user_referral_registration ON auth.users;
DROP TRIGGER IF EXISTS create_subscription_on_signup ON auth.users;

-- Assicurati che rimangano solo i trigger necessari
-- Il trigger on_auth_user_created (handle_new_user) già gestisce la creazione della subscription
-- Il trigger on_auth_user_referral_registration (handle_referral_registration) già gestisce i referral
-- Eliminazione sicura di tutti gli utenti tranne giusepperos89@gmail.com
-- Prima eliminiamo tutti i dati dalle tabelle correlate per gli utenti da eliminare

DO $$
DECLARE
    user_to_delete RECORD;
    preserved_user_id UUID;
BEGIN
    -- Ottieni l'ID dell'utente da preservare
    SELECT id INTO preserved_user_id 
    FROM auth.users 
    WHERE email = 'giusepperos89@gmail.com';
    
    -- Se l'utente da preservare non esiste, ferma l'operazione
    IF preserved_user_id IS NULL THEN
        RAISE EXCEPTION 'Utente giusepperos89@gmail.com non trovato! Operazione annullata per sicurezza.';
    END IF;
    
    -- Elimina tutti i dati delle tabelle correlate per gli utenti da eliminare
    DELETE FROM public.activity_log WHERE user_id != preserved_user_id;
    DELETE FROM public.ai_insights_notifications WHERE user_id != preserved_user_id;
    DELETE FROM public.ai_suggested_protocols WHERE user_id != preserved_user_id;
    DELETE FROM public.ai_training_protocols WHERE user_id::uuid != preserved_user_id;
    DELETE FROM public.behavior_predictions WHERE user_id != preserved_user_id;
    DELETE FROM public.calendar_events WHERE user_id != preserved_user_id;
    DELETE FROM public.care_approach_predictions WHERE user_id != preserved_user_id;
    DELETE FROM public.community_message_deletions WHERE user_id != preserved_user_id;
    DELETE FROM public.community_messages WHERE user_id != preserved_user_id;
    DELETE FROM public.community_notifications WHERE user_id != preserved_user_id;
    DELETE FROM public.diary_entries WHERE user_id != preserved_user_id;
    DELETE FROM public.early_warnings WHERE user_id != preserved_user_id;
    DELETE FROM public.emergency_contacts WHERE user_id != preserved_user_id;
    DELETE FROM public.event_notifications WHERE user_id != preserved_user_id;
    DELETE FROM public.event_templates WHERE user_id != preserved_user_id;
    DELETE FROM public.feature_request_comments WHERE user_id != preserved_user_id;
    DELETE FROM public.feature_request_votes WHERE user_id != preserved_user_id;
    DELETE FROM public.health_alerts WHERE user_id != preserved_user_id;
    DELETE FROM public.health_data_sync WHERE user_id != preserved_user_id;
    DELETE FROM public.health_metrics WHERE user_id != preserved_user_id;
    DELETE FROM public.health_risk_assessments WHERE user_id != preserved_user_id;
    DELETE FROM public.insurance_policies WHERE user_id != preserved_user_id;
    DELETE FROM public.intervention_recommendations WHERE user_id != preserved_user_id;
    DELETE FROM public.pets WHERE user_id != preserved_user_id;
    DELETE FROM public.subscribers WHERE user_id != preserved_user_id;
    DELETE FROM public.profiles WHERE user_id != preserved_user_id;
    
    -- Ora elimina gli utenti dall'auth uno per volta
    FOR user_to_delete IN 
        SELECT id, email FROM auth.users 
        WHERE email != 'giusepperos89@gmail.com'
    LOOP
        BEGIN
            -- Elimina l'utente tramite la funzione auth admin
            PERFORM auth.admin_delete_user(user_to_delete.id);
            RAISE NOTICE 'Eliminato utente: % (ID: %)', user_to_delete.email, user_to_delete.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Errore eliminando utente %: %', user_to_delete.email, SQLERRM;
            -- Continua con il prossimo utente
        END;
    END LOOP;
    
    RAISE NOTICE 'Operazione completata. Utente preservato: giusepperos89@gmail.com';
END $$;
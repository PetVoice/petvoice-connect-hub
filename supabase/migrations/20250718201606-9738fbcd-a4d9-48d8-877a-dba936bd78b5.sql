-- Pulizia completa dei dati della piattaforma (mantenendo solo referral)

-- Disabilita i trigger temporaneamente per evitare problemi di dipendenze
SET session_replication_role = replica;

-- Pulisce i dati delle attività e log
DELETE FROM public.activity_log;
DELETE FROM public.ai_insights_notifications;

-- Pulisce i dati del calendario
DELETE FROM public.event_notifications;
DELETE FROM public.calendar_events;
DELETE FROM public.event_templates;

-- Pulisce i dati della community
DELETE FROM public.community_notifications;
DELETE FROM public.community_messages;
DELETE FROM public.message_reports;
DELETE FROM public.private_messages;

-- Pulisce i dati sanitari e medici
DELETE FROM public.health_alerts;
DELETE FROM public.health_data_sync;
DELETE FROM public.health_metrics;
DELETE FROM public.medical_records;
DELETE FROM public.medications;
DELETE FROM public.pet_insurance;
DELETE FROM public.emergency_contacts;

-- Pulisce i dati di analisi e benessere
DELETE FROM public.pet_analyses;
DELETE FROM public.pet_wellness_scores;
DELETE FROM public.diary_entries;

-- Pulisce i dati di apprendimento
DELETE FROM public.lesson_completions;

-- Pulisce i dati dei pet (questo cancellerà anche le dipendenze)
DELETE FROM public.pets;

-- Pulisce alert locali
DELETE FROM public.local_alerts;

-- Pulisce feature requests
DELETE FROM public.feature_request_comments;
DELETE FROM public.feature_request_votes;

-- Pulisce i profili utente (ATTENZIONE: questo manterrà solo gli utenti auth ma cancellerà i profili)
DELETE FROM public.profiles;

-- Riabilita i trigger
SET session_replication_role = default;

-- Messaggio di conferma
DO $$
BEGIN
    RAISE NOTICE 'Pulizia completata! Tutti i dati sono stati cancellati tranne:';
    RAISE NOTICE '- Tabelle referral (referrals, referrer_stats, referral_commissions)';
    RAISE NOTICE '- Tabelle auth (auth.users rimane intatta)';
    RAISE NOTICE '- Tabelle di sistema (community_channels, learning_paths, lessons, etc.)';
    RAISE NOTICE '- Subscribers (collegati ai referral)';
END $$;
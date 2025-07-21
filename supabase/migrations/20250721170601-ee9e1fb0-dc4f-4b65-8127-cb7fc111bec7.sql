-- ELIMINAZIONE MASSIVA UTENTI - Mantieni solo giusepperos89@gmail.com
-- Risolve errori di permission denied su user_display_names

DO $$
DECLARE
  giuseppe_user_id UUID;
  user_record RECORD;
BEGIN
  -- Trova l'ID di Giuseppe
  SELECT id INTO giuseppe_user_id
  FROM auth.users
  WHERE email = 'giusepperos89@gmail.com';
  
  IF giuseppe_user_id IS NULL THEN
    RAISE EXCEPTION '❌ User giusepperos89@gmail.com non trovato!';
  END IF;
  
  RAISE NOTICE '🔍 Giuseppe user_id: %', giuseppe_user_id;
  
  -- 1. PULISCI PRIMA TUTTE LE DIPENDENZE PER TUTTI GLI UTENTI TRANNE GIUSEPPE
  
  -- Elimina da user_display_names per tutti tranne Giuseppe
  DELETE FROM public.user_display_names 
  WHERE user_id != giuseppe_user_id;
  RAISE NOTICE '🧹 Pulito user_display_names';
  
  -- Elimina profili di tutti tranne Giuseppe
  DELETE FROM public.profiles 
  WHERE user_id != giuseppe_user_id;
  RAISE NOTICE '🧹 Pulito profiles';
  
  -- Elimina subscribers di tutti tranne Giuseppe
  DELETE FROM public.subscribers 
  WHERE user_id != giuseppe_user_id;
  RAISE NOTICE '🧹 Pulito subscribers';
  
  -- Elimina pets di tutti tranne Giuseppe
  DELETE FROM public.pets 
  WHERE user_id != giuseppe_user_id;
  RAISE NOTICE '🧹 Pulito pets';
  
  -- Elimina altre dipendenze se esistono
  DELETE FROM public.diary_entries 
  WHERE user_id != giuseppe_user_id;
  
  DELETE FROM public.activity_log 
  WHERE user_id != giuseppe_user_id;
  
  DELETE FROM public.health_metrics 
  WHERE user_id != giuseppe_user_id;
  
  -- 2. ORA ELIMINA TUTTI GLI UTENTI AUTH TRANNE GIUSEPPE
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE email != 'giusepperos89@gmail.com'
  LOOP
    RAISE NOTICE '🗑️  Eliminando utente: % (ID: %)', user_record.email, user_record.id;
    
    -- Elimina l'utente auth
    DELETE FROM auth.users WHERE id = user_record.id;
    
  END LOOP;
  
  -- 3. LOG FINALE
  INSERT INTO public.activity_log (
    user_id, activity_type, activity_description, metadata
  ) VALUES (
    giuseppe_user_id,
    'mass_user_deletion',
    '💀 ELIMINAZIONE MASSIVA UTENTI: Solo Giuseppe mantenuto',
    jsonb_build_object(
      'deletion_time', NOW(),
      'maintained_user', 'giusepperos89@gmail.com',
      'action', 'mass_user_cleanup'
    )
  );
  
  -- Mostra risultato finale
  RAISE NOTICE '✅ ELIMINAZIONE MASSIVA COMPLETATA!';
  RAISE NOTICE '👤 Utente mantenuto: giusepperos89@gmail.com';
  RAISE NOTICE '🔥 Tutti gli altri utenti sono stati eliminati';
  
END $$;
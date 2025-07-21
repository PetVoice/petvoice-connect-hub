-- ELIMINAZIONE UTENTI: Rimuove tutti gli utenti tranne giusepperos89@gmail.com

-- IDs degli utenti da eliminare
-- test@example.com: be2d613b-6a47-468c-98f3-59fbdc5ee1f5
-- rosa8949@outlook.it: 3dfd0a18-4648-4a9a-b605-9b048664b96b  
-- salvatore8949@outlook.it: a5209243-97c9-4ff3-a129-9ac3d968413e
-- MANTIENI: giusepperos89@gmail.com: 5d336311-bfc2-40f4-8cd8-3ad17bd246d5

-- 1. Elimina tutti i profili tranne giusepperos89@gmail.com
DELETE FROM public.profiles 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 2. Elimina tutte le statistiche referrer tranne giusepperos89@gmail.com
DELETE FROM public.referrer_stats 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 3. Elimina tutti i referral dove il referrer o referred non è giusepperos89@gmail.com
DELETE FROM public.referrals 
WHERE referrer_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
  AND referred_user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 4. Elimina tutte le commissioni referral tranne quelle di giusepperos89@gmail.com
DELETE FROM public.referral_commissions 
WHERE referrer_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
  AND referred_user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 5. Elimina tutti gli abbonamenti tranne giusepperos89@gmail.com
DELETE FROM public.subscribers 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 6. Elimina tutti i log di attività tranne giusepperos89@gmail.com
DELETE FROM public.activity_log 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
  AND user_id != '00000000-0000-0000-0000-000000000000'; -- Mantieni log di sistema

-- 7. Elimina dai nomi utente display (se esiste)
DELETE FROM public.user_display_names 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 8. Elimina tutti i pets degli altri utenti
DELETE FROM public.pets 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 9. Elimina diari degli altri utenti
DELETE FROM public.diary_entries 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 10. Elimina analisi pet degli altri utenti
DELETE FROM public.pet_analyses 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 11. Elimina altri dati degli utenti da eliminare (se esistono altre tabelle)
DELETE FROM public.health_metrics 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

DELETE FROM public.medical_records 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

DELETE FROM public.medications 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

DELETE FROM public.calendar_events 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

DELETE FROM public.emergency_contacts 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 12. Prova ad eliminare gli utenti dalla tabella auth (potrebbe fallire per permessi)
-- Questo verrà fatto tramite la dashboard di Supabase se fallisce

-- 13. Log dell'operazione
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_cleanup',
  '🧹 PULIZIA DATABASE: Eliminati tutti gli utenti tranne giusepperos89@gmail.com',
  jsonb_build_object(
    'cleanup_time', now(),
    'kept_user', 'giusepperos89@gmail.com',
    'kept_user_id', '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
  )
);
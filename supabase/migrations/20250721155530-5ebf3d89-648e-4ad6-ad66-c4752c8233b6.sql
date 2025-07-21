-- CORREZIONE TIER E RINNOVI: Fix tier calculation e ferma rinnovi eccessivi

-- 1. Ferma i job cron che potrebbero creare rinnovi automatici eccessivi
SELECT cron.unschedule('simple-referral-converter-1');
SELECT cron.unschedule('simple-referral-converter-instant');

-- 2. Ricalcola correttamente i tier per tutti i referrer
UPDATE referrer_stats 
SET 
  current_tier = (
    SELECT tier FROM get_tier_info(referrer_stats.total_conversions)
  ),
  tier_progress = (
    CASE 
      WHEN total_conversions >= 20 THEN 100
      WHEN total_conversions >= 10 THEN ROUND(((total_conversions - 10) * 100.0 / 10), 2)
      WHEN total_conversions >= 5 THEN ROUND(((total_conversions - 5) * 100.0 / 5), 2)  
      ELSE ROUND((total_conversions * 100.0 / 5), 2)
    END
  ),
  updated_at = NOW();

-- 3. Elimina rinnovi ricorrenti eccessivi - mantieni solo 1 per utente per mese
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY referrer_id, referred_user_id, commission_type, 
      DATE_TRUNC('month', billing_period_start)
      ORDER BY created_at ASC
    ) as row_num
  FROM referral_commissions 
  WHERE commission_type = 'recurring'
)
DELETE FROM referral_commissions 
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- 4. Ricalcola i crediti corretti dopo la pulizia
UPDATE referrer_stats 
SET 
  available_credits = (
    SELECT COALESCE(SUM(rc.amount), 0) 
    FROM referral_commissions rc 
    WHERE rc.referrer_id = referrer_stats.user_id 
      AND rc.status = 'active' 
      AND rc.is_cancelled = false
  ),
  total_credits_earned = (
    SELECT COALESCE(SUM(rc.amount), 0) 
    FROM referral_commissions rc 
    WHERE rc.referrer_id = referrer_stats.user_id
  );

-- 5. Log della correzione
INSERT INTO activity_log (user_id, activity_type, activity_description, metadata)
SELECT 
  user_id,
  'system_correction',
  'Tier e crediti corretti automaticamente',
  jsonb_build_object(
    'old_tier', 'Platino',
    'new_tier', current_tier,
    'total_conversions', total_conversions,
    'corrected_credits', available_credits
  )
FROM referrer_stats
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';
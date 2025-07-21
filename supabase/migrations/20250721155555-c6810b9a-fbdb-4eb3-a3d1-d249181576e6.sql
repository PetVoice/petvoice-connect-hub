-- CORREZIONE TIER E RINNOVI: Fix tier calculation e rimuovi duplicati

-- 1. Ricalcola correttamente i tier per tutti i referrer
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

-- 2. Elimina rinnovi ricorrenti eccessivi - mantieni solo 1 per utente per mese
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

-- 3. Ricalcola i crediti corretti dopo la pulizia
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
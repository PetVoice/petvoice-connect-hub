-- RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrer_stats ENABLE ROW LEVEL SECURITY;

-- Policies referrals
CREATE POLICY "Users can view own referrals" ON public.referrals 
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Service can manage referrals" ON public.referrals 
  FOR ALL USING (auth.role() = 'service_role');

-- Policies commissioni
CREATE POLICY "Users can view own commissions" ON public.referral_commissions 
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Service can manage commissions" ON public.referral_commissions 
  FOR ALL USING (auth.role() = 'service_role');

-- Policies statistiche
CREATE POLICY "Users can view own stats" ON public.referrer_stats 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.referrer_stats 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.referrer_stats 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service can manage stats" ON public.referrer_stats 
  FOR ALL USING (auth.role() = 'service_role');
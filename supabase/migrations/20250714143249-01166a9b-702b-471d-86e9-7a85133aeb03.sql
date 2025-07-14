-- Create referral system tables

-- User referral profiles
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  successful_conversions INTEGER DEFAULT 0,
  total_credits_earned DECIMAL(10,2) DEFAULT 0,
  current_tier VARCHAR(20) DEFAULT 'Bronze',
  consecutive_months INTEGER DEFAULT 0,
  is_leaderboard_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual referral tracking
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_email VARCHAR(255) NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code VARCHAR(50) NOT NULL,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  channel VARCHAR(50), -- email, sms, social, qr, etc
  status VARCHAR(20) DEFAULT 'pending', -- pending, registered, converted, failed
  conversion_date TIMESTAMP WITH TIME ZONE,
  credits_awarded DECIMAL(10,2) DEFAULT 0,
  ip_address INET,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Credits tracking
CREATE TABLE public.referral_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  credit_type VARCHAR(50) NOT NULL, -- referral, bonus, tier_bonus, contest, etc
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active, redeemed, expired
  expires_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Achievement badges
CREATE TABLE public.referral_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type VARCHAR(50) NOT NULL, -- first_referral, streak_5, tier_gold, etc
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  icon_name VARCHAR(50),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Monthly challenges
CREATE TABLE public.referral_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_referrals INTEGER NOT NULL,
  reward_credits DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Challenge participations
CREATE TABLE public.challenge_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.referral_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  referrals_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance tracking
CREATE TABLE public.referral_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  registrations INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  credits_earned DECIMAL(10,2) DEFAULT 0,
  top_channel VARCHAR(50),
  geographic_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Social sharing templates
CREATE TABLE public.sharing_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(50) NOT NULL, -- instagram, facebook, whatsapp, twitter, email
  template_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB, -- dynamic placeholders
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sharing_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own referral profile" ON public.user_referrals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own referral profile" ON public.user_referrals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can view own credits" ON public.referral_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own badges" ON public.referral_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view active challenges" ON public.referral_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own challenge participations" ON public.challenge_participations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own analytics" ON public.referral_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view active templates" ON public.sharing_templates FOR SELECT USING (is_active = true);

-- Service role policies for system operations
CREATE POLICY "Service role can manage user_referrals" ON public.user_referrals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage referrals" ON public.referrals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage credits" ON public.referral_credits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage badges" ON public.referral_badges FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage challenge participations" ON public.challenge_participations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage analytics" ON public.referral_analytics FOR ALL USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_user_referrals_user_id ON public.user_referrals(user_id);
CREATE INDEX idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_credits_user_id ON public.referral_credits(user_id);
CREATE INDEX idx_credits_status ON public.referral_credits(status);
CREATE INDEX idx_analytics_user_date ON public.referral_analytics(user_id, date);

-- Functions
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract username from email and create base code
  base_code := UPPER(SPLIT_PART(user_email, '@', 1));
  base_code := REGEXP_REPLACE(base_code, '[^A-Z0-9]', '', 'g');
  base_code := LEFT(base_code, 8);
  
  -- Add current year
  base_code := base_code || '2024';
  
  -- Check for uniqueness and add counter if needed
  final_code := base_code;
  WHILE EXISTS(SELECT 1 FROM public.user_referrals WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::TEXT;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update referral stats
CREATE OR REPLACE FUNCTION public.update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user referral stats when a referral status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    UPDATE public.user_referrals 
    SET 
      successful_conversions = (
        SELECT COUNT(*) FROM public.referrals r 
        WHERE r.referrer_id = NEW.referrer_id AND r.status = 'converted'
      ),
      total_credits_earned = (
        SELECT COALESCE(SUM(rc.amount), 0) FROM public.referral_credits rc 
        WHERE rc.user_id = NEW.referrer_id AND rc.status = 'active'
      ),
      updated_at = now()
    WHERE user_id = NEW.referrer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_referral_stats
  AFTER UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_stats();

-- Insert default sharing templates
INSERT INTO public.sharing_templates (platform, template_name, content, variables) VALUES
('instagram', 'Pet Care Stories', '🐾 Scopri PetVoice, l''app che capisce davvero il tuo pet! 📱✨\n\nUsa il mio codice {{referral_code}} e ottieni vantaggi esclusivi! 🎁\n\n#PetVoice #PetCare #TechPet', '{"referral_code": "string"}'),
('facebook', 'Community Share', '🐕🐱 Finalmente un''app che comprende il linguaggio dei nostri amici a quattro zampe!\n\nPetVoice usa l''AI per analizzare comportamenti ed emozioni. Provala con il mio codice: {{referral_code}}\n\nPerfetta per tutti i pet parent! 💝', '{"referral_code": "string"}'),
('whatsapp', 'Personal Message', 'Ciao! 👋\n\nTi volevo consigliare PetVoice, un''app incredibile per capire meglio il tuo pet attraverso l''analisi AI di suoni e comportamenti.\n\nSe ti iscrivi con il mio codice {{referral_code}} avrai dei vantaggi speciali! 🎉\n\nDacci un''occhiata: {{referral_link}}', '{"referral_code": "string", "referral_link": "string"}'),
('twitter', 'Pet Tips Thread', '🧵 Thread: Come capire meglio il tuo pet con l''AI\n\n1/5 Hai mai desiderato capire cosa prova il tuo amico a quattro zampe? 🤔\n\nCon @PetVoice ora puoi! Analisi AI di comportamenti ed emozioni.\n\nCodice speciale: {{referral_code}} 🎁', '{"referral_code": "string"}'),
('email', 'Success Story', 'Oggetto: La mia esperienza con PetVoice ti sorprenderà! 🐾\n\nCiao {{recipient_name}},\n\nTi scrivo per condividere una scoperta fantastica: PetVoice, un''app che usa l''intelligenza artificiale per comprendere il comportamento e le emozioni dei nostri pet.\n\nDa quando la uso ho migliorato significativamente la relazione con {{pet_name}}. L''app analizza suoni, comportamenti e ti dà insights preziosi.\n\nSe vuoi provarla, usa il mio codice {{referral_code}} per vantaggi esclusivi!\n\nScaricala qui: {{referral_link}}\n\nBuona giornata!\n{{sender_name}}', '{"recipient_name": "string", "pet_name": "string", "referral_code": "string", "referral_link": "string", "sender_name": "string"}');
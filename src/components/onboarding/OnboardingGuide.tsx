import { useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { InteractiveGuide } from './InteractiveGuide';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

export function OnboardingGuide() {
  const { state } = useOnboarding();
  const { user } = useAuth();
  const { subscription } = useSubscription();

  // Check if user should see onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !subscription.subscribed) return;

      // Only show for Premium/Family plans
      if (!subscription.subscription_tier || subscription.subscription_tier === 'free') return;

      try {
        const { data: onboardingData, error } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking onboarding status:', error);
          return;
        }

        // If no onboarding record exists, this is a new premium user
        if (!onboardingData) {
          // Check if this is a new premium user (account created recently)
          const userCreationDate = new Date(user.created_at);
          const daysSinceCreation = Math.floor((Date.now() - userCreationDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Only show onboarding for accounts created within the last 7 days
          if (daysSinceCreation <= 7) {
            // Create onboarding record and start guide
            await supabase
              .from('user_onboarding')
              .insert({
                user_id: user.id,
                plan_type: subscription.subscription_tier,
                onboarding_completed: false,
                current_step: 1
              });

            // Start onboarding - trigger via custom event
            window.dispatchEvent(new CustomEvent('startOnboarding', {
              detail: { planType: subscription.subscription_tier }
            }));
          }
        } else if (!onboardingData.onboarding_completed) {
          // Resume onboarding if not completed
          window.dispatchEvent(new CustomEvent('resumeOnboarding', {
            detail: { 
              currentStep: onboardingData.current_step,
              planType: onboardingData.plan_type 
            }
          }));
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
      }
    };

    checkOnboardingStatus();
  }, [user, subscription]);

  return <InteractiveGuide />;
}
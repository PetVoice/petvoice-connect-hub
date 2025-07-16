import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

export function useOnboardingTrigger() {
  const { user } = useAuth();
  const { subscription } = useSubscription();

  useEffect(() => {
    const checkAndTriggerOnboarding = async () => {
      if (!user || !subscription.subscribed) return;

      // Only trigger for Premium/Family plans
      if (!subscription.subscription_tier || subscription.subscription_tier === 'free') return;

      try {
        // Check if onboarding record exists
        const { data: onboardingData, error } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking onboarding status:', error);
          return;
        }

        // If no record exists, this might be a new premium user
        if (!onboardingData) {
          // Check account age
          const userCreationDate = new Date(user.created_at);
          const daysSinceCreation = Math.floor((Date.now() - userCreationDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Only show onboarding for recent accounts (within 7 days)
          if (daysSinceCreation <= 7) {
            // Create onboarding record
            const { error: insertError } = await supabase
              .from('user_onboarding')
              .insert({
                user_id: user.id,
                plan_type: subscription.subscription_tier,
                onboarding_completed: false,
                current_step: 1
              });

            if (insertError) {
              console.error('Error creating onboarding record:', insertError);
            } else {
              // Trigger onboarding start
              window.dispatchEvent(new CustomEvent('startOnboarding', {
                detail: { planType: subscription.subscription_tier }
              }));
            }
          }
        } else if (!onboardingData.onboarding_completed) {
          // Resume incomplete onboarding
          window.dispatchEvent(new CustomEvent('resumeOnboarding', {
            detail: { 
              currentStep: onboardingData.current_step,
              planType: onboardingData.plan_type 
            }
          }));
        }
      } catch (error) {
        console.error('Error in onboarding trigger:', error);
      }
    };

    // Delay check to ensure subscription data is loaded
    const timer = setTimeout(checkAndTriggerOnboarding, 1000);
    return () => clearTimeout(timer);
  }, [user, subscription.subscribed, subscription.subscription_tier]);

  return null;
}
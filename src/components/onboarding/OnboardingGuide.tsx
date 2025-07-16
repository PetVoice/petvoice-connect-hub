import { useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingOverlay } from './OnboardingOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

export function OnboardingGuide() {
  const { state, currentStepData, nextStep } = useOnboarding();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const location = useLocation();

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

  // Handle automatic navigation for certain steps
  useEffect(() => {
    if (!state.isActive || !currentStepData) return;

    // Auto-navigate to analysis page for step 3
    if (currentStepData.id === 3 && location.pathname !== '/analysis') {
      window.location.href = '/analysis';
    }
  }, [state.isActive, currentStepData, location]);

  // Handle element interaction tracking
  useEffect(() => {
    if (!state.isActive || !currentStepData) return;

    const handleElementInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if the clicked element matches the target selector
      if (target.matches(currentStepData.targetSelector) || 
          target.closest(currentStepData.targetSelector)) {
        
        // Mark action as completed and auto-advance
        if (currentStepData.action === 'click') {
          setTimeout(() => {
            nextStep();
          }, 500);
        }
      }
    };

    // Add event listeners for tracking user interactions
    document.addEventListener('click', handleElementInteraction);
    document.addEventListener('change', handleElementInteraction);

    return () => {
      document.removeEventListener('click', handleElementInteraction);
      document.removeEventListener('change', handleElementInteraction);
    };
  }, [state.isActive, currentStepData]);

  // Add data attributes to key elements for targeting
  useEffect(() => {
    if (!state.isActive) return;

    const addDataAttributes = () => {
      // Add data attributes to key elements
      const addPetButton = document.querySelector('[data-testid="add-pet-button"]') || 
                           document.querySelector('button:contains("Aggiungi Pet")') ||
                           document.querySelector('[href*="pets"]');
      if (addPetButton) {
        addPetButton.setAttribute('data-onboarding', 'add-pet');
      }

      const analysisMenu = document.querySelector('[href*="analysis"]') ||
                          document.querySelector('a:contains("Analisi")');
      if (analysisMenu) {
        analysisMenu.setAttribute('data-onboarding', 'analysis-menu');
      }

      const fileUpload = document.querySelector('input[type="file"]') ||
                        document.querySelector('[type="file"]');
      if (fileUpload) {
        fileUpload.setAttribute('data-onboarding', 'file-upload');
      }

      const analyzeButton = document.querySelector('button:contains("Analizza")') ||
                           document.querySelector('[data-testid="analyze-button"]');
      if (analyzeButton) {
        analyzeButton.setAttribute('data-onboarding', 'analyze-button');
      }

      const results = document.querySelector('[data-testid="analysis-results"]') ||
                     document.querySelector('.analysis-results');
      if (results) {
        results.setAttribute('data-onboarding', 'analysis-results');
      }

      const saveDiary = document.querySelector('button:contains("Salva")') ||
                       document.querySelector('[data-testid="save-diary"]');
      if (saveDiary) {
        saveDiary.setAttribute('data-onboarding', 'save-diary');
      }
    };

    addDataAttributes();
    
    // Re-run on DOM changes
    const observer = new MutationObserver(addDataAttributes);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [state.isActive]);

  return <OnboardingOverlay />;
}
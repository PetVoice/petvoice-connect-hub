import { useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingOverlay } from './OnboardingOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';

export function OnboardingGuide() {
  const { state, currentStepData, nextStep } = useOnboarding();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();

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
      // Use React Router navigate instead of window.location.href to avoid page reload
      navigate('/analysis');
    }
  }, [state.isActive, currentStepData, location, navigate]);

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
          // For step 2 (add pet), don't auto-advance - let the user navigate manually
          if (currentStepData.id === 2) {
            // Just wait for the page to load, don't auto-advance
            return;
          }
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
      // Helper function to find button by text content
      const findButtonByText = (text: string) => {
        const buttons = document.querySelectorAll('button');
        return Array.from(buttons).find(button => 
          button.textContent?.includes(text)
        );
      };

      // Helper function to find link by text content
      const findLinkByText = (text: string) => {
        const links = document.querySelectorAll('a');
        return Array.from(links).find(link => 
          link.textContent?.includes(text)
        );
      };

      // Add data attributes to key elements
      const addPetButton = document.querySelector('[data-testid="add-pet-button"]') || 
                           findButtonByText('Aggiungi Pet') ||
                           document.querySelector('[href*="pets"]');
      if (addPetButton) {
        addPetButton.setAttribute('data-onboarding', 'add-pet');
      }

      const analysisMenu = document.querySelector('[href*="analysis"]') ||
                          findLinkByText('Analisi');
      if (analysisMenu) {
        analysisMenu.setAttribute('data-onboarding', 'analysis-menu');
      }

      const fileUpload = document.querySelector('input[type="file"]') ||
                        document.querySelector('[type="file"]');
      if (fileUpload) {
        fileUpload.setAttribute('data-onboarding', 'file-upload');
      }

      const analyzeButton = findButtonByText('Analizza') ||
                           document.querySelector('[data-testid="analyze-button"]');
      if (analyzeButton) {
        analyzeButton.setAttribute('data-onboarding', 'analyze-button');
      }

      const results = document.querySelector('[data-testid="analysis-results"]') ||
                     document.querySelector('.analysis-results');
      if (results) {
        results.setAttribute('data-onboarding', 'analysis-results');
      }

      const saveDiary = findButtonByText('Salva') ||
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
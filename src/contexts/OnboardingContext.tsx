import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { OnboardingContextType, OnboardingState, OnboardingStep, ONBOARDING_STEPS } from '@/types/onboarding';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type OnboardingAction = 
  | { type: 'SET_ACTIVE'; payload: boolean }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SKIP_STEP' }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET' };

const initialState: OnboardingState = {
  isActive: false,
  currentStep: 1,
  totalSteps: ONBOARDING_STEPS.length,
  skippedSteps: [],
  planType: 'premium',
  userId: ''
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_ACTIVE':
      return { ...state, isActive: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'NEXT_STEP':
      return { 
        ...state, 
        currentStep: Math.min(state.currentStep + 1, state.totalSteps)
      };
    case 'PREVIOUS_STEP':
      return { 
        ...state, 
        currentStep: Math.max(state.currentStep - 1, 1)
      };
    case 'SKIP_STEP':
      return { 
        ...state, 
        skippedSteps: [...state.skippedSteps, state.currentStep],
        currentStep: Math.min(state.currentStep + 1, state.totalSteps)
      };
    case 'COMPLETE_ONBOARDING':
      return { ...state, isActive: false, currentStep: state.totalSteps };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const { user } = useAuth();

  // Handle custom events for starting/resuming onboarding
  useEffect(() => {
    const handleStartOnboarding = (event: CustomEvent) => {
      dispatch({ type: 'SET_ACTIVE', payload: true });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
    };

    const handleResumeOnboarding = (event: CustomEvent) => {
      dispatch({ type: 'SET_ACTIVE', payload: true });
      dispatch({ type: 'SET_CURRENT_STEP', payload: event.detail.currentStep });
    };

    window.addEventListener('startOnboarding', handleStartOnboarding as EventListener);
    window.addEventListener('resumeOnboarding', handleResumeOnboarding as EventListener);

    return () => {
      window.removeEventListener('startOnboarding', handleStartOnboarding as EventListener);
      window.removeEventListener('resumeOnboarding', handleResumeOnboarding as EventListener);
    };
  }, []);

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('onboarding-state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      dispatch({ type: 'SET_CURRENT_STEP', payload: parsed.currentStep });
      dispatch({ type: 'SET_ACTIVE', payload: parsed.isActive });
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboarding-state', JSON.stringify({
      currentStep: state.currentStep,
      isActive: state.isActive,
      skippedSteps: state.skippedSteps
    }));
  }, [state.currentStep, state.isActive, state.skippedSteps]);

  const updateOnboardingInDB = async (completed: boolean = false, stepNumber?: number) => {
    if (!user) return;

    try {
      const updateData: any = {
        current_step: stepNumber || state.currentStep,
        skipped_steps: state.skippedSteps,
        updated_at: new Date().toISOString()
      };

      if (completed) {
        updateData.onboarding_completed = true;
        updateData.completed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('user_onboarding')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating onboarding:', error);
      }
    } catch (error) {
      console.error('Error updating onboarding:', error);
    }
  };

  const nextStep = () => {
    const newStep = Math.min(state.currentStep + 1, state.totalSteps);
    dispatch({ type: 'NEXT_STEP' });
    updateOnboardingInDB(false, newStep);
  };

  const previousStep = () => {
    dispatch({ type: 'PREVIOUS_STEP' });
    updateOnboardingInDB(false, state.currentStep - 1);
  };

  const skipStep = () => {
    dispatch({ type: 'SKIP_STEP' });
    updateOnboardingInDB(false, state.currentStep + 1);
  };

  const closeOnboarding = async () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    await updateOnboardingInDB(true);
    localStorage.removeItem('onboarding-state');
    toast({
      title: "Onboarding completato",
      description: "Puoi sempre rivedere la guida dalle impostazioni."
    });
  };

  const completeOnboarding = async () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    await updateOnboardingInDB(true);
    localStorage.removeItem('onboarding-state');
    
    // Show celebration
    toast({
      title: "🎉 Complimenti!",
      description: "Hai completato l'onboarding di PetVoice Premium!"
    });
  };

  const isStepCompleted = (stepId: number) => {
    return state.currentStep > stepId || state.skippedSteps.includes(stepId);
  };

  const currentStepData = ONBOARDING_STEPS.find(step => step.id === state.currentStep) || null;

  const value: OnboardingContextType = {
    state,
    steps: ONBOARDING_STEPS,
    nextStep,
    previousStep,
    skipStep,
    closeOnboarding,
    completeOnboarding,
    isStepCompleted,
    currentStepData
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
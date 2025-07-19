import { useSubscription } from './useSubscription';
import { toast } from './use-toast';
import { useState } from 'react';

export interface PlanLimits {
  maxPets: number;
  maxAnalysesPerMonth: number;
  hasAiInsights: boolean;
  hasMusicTherapy: boolean;
  hasDataExport: boolean;
  hasPrioritySupport: boolean;
  maxDevices?: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  premium: {
    maxPets: Infinity,
    maxAnalysesPerMonth: Infinity,
    hasAiInsights: true,
    hasMusicTherapy: true,
    hasDataExport: true,
    hasPrioritySupport: true,
  },
};

export const usePlanLimits = () => {
  const { subscription } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const currentLimits = subscription.subscribed ? 
    PLAN_LIMITS.premium : {
    maxPets: 0,
    maxAnalysesPerMonth: 0,
    hasAiInsights: false,
    hasMusicTherapy: false,
    hasDataExport: false,
    hasPrioritySupport: false,
  };

  const checkFeatureAccess = (feature: keyof PlanLimits): boolean => {
    return Boolean(currentLimits[feature]);
  };

  // Controlli di limite rimossi - solo piano premium disponibile

  const showUpgradePrompt = (featureName: string) => {
    // Non mostrare più prompt di upgrade dato che esiste solo il piano premium
    return;
  };

  const requiresPremium = (action: () => void, featureName: string, customCheck?: () => boolean) => {
    const hasAccess = customCheck ? customCheck() : subscription.subscribed;
    
    if (hasAccess) {
      action();
    } else {
      // Non fare nulla dato che non ci sono upgrade da mostrare
      return;
    }
  };

  return {
    currentLimits,
    showUpgradeModal,
    setShowUpgradeModal,
    requiresPremium,
    isPremium: subscription.subscribed,
  };
};
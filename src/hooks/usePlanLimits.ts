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
  free: {
    maxPets: 1,
    maxAnalysesPerMonth: 5,
    hasAiInsights: false,
    hasMusicTherapy: false,
    hasDataExport: false,
    hasPrioritySupport: false,
  },
  premium: {
    maxPets: Infinity,
    maxAnalysesPerMonth: Infinity,
    hasAiInsights: true,
    hasMusicTherapy: true,
    hasDataExport: true,
    hasPrioritySupport: true,
  },
  family: {
    maxPets: Infinity,
    maxAnalysesPerMonth: Infinity,
    hasAiInsights: true,
    hasMusicTherapy: true,
    hasDataExport: true,
    hasPrioritySupport: true,
    maxDevices: 3,
  },
};

export const usePlanLimits = () => {
  const { subscription } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const currentLimits = PLAN_LIMITS[subscription.subscription_tier] || PLAN_LIMITS.free;

  const checkFeatureAccess = (feature: keyof PlanLimits): boolean => {
    return Boolean(currentLimits[feature]);
  };

  const checkPetLimit = (currentPets: number): boolean => {
    return currentPets < currentLimits.maxPets;
  };

  const checkAnalysisLimit = (currentAnalyses: number): boolean => {
    return currentAnalyses < currentLimits.maxAnalysesPerMonth;
  };

  const checkDeviceLimit = (currentDevices: number): boolean => {
    if (!currentLimits.maxDevices) return true; // No limit for plans without maxDevices
    return currentDevices < currentLimits.maxDevices;
  };

  const showUpgradePrompt = (featureName: string) => {
    toast({
      title: "Funzionalità Premium",
      description: `${featureName} è disponibile solo nei piani Premium e Family`,
      variant: "default",
    });
    setShowUpgradeModal(true);
  };

  const requiresPremium = (action: () => void, featureName: string, customCheck?: () => boolean) => {
    const hasAccess = customCheck ? customCheck() : subscription.subscription_tier !== 'free';
    
    if (hasAccess) {
      action();
    } else {
      showUpgradePrompt(featureName);
    }
  };

  return {
    currentLimits,
    showUpgradeModal,
    setShowUpgradeModal,
    checkFeatureAccess,
    checkPetLimit,
    checkAnalysisLimit,
    checkDeviceLimit,
    showUpgradePrompt,
    requiresPremium,
    isPremium: subscription.subscription_tier !== 'free',
    isFamily: subscription.subscription_tier === 'family',
  };
};
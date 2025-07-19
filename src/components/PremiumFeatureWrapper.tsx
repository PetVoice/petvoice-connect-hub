import { ReactNode } from 'react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumFeatureWrapperProps {
  children: ReactNode;
  featureName: string;
  customCheck?: () => boolean;
  fallbackComponent?: ReactNode;
  className?: string;
  showOverlay?: boolean;
}

export const PremiumFeatureWrapper = ({
  children,
  featureName,
  customCheck,
  fallbackComponent,
  className,
  showOverlay = true,
}: PremiumFeatureWrapperProps) => {
  const { isPremium } = usePlanLimits();

  // Determine if user has access - solo piano premium disponibile
  const hasAccess = customCheck ? customCheck() : isPremium;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Non più necessario dato che esiste solo piano premium

  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {showOverlay && (
        <>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Crown className="w-6 h-6 text-primary" />
                <span className="font-semibold text-lg">Funzione Premium</span>
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                {featureName} è disponibile con il piano Premium
              </p>
            </div>
          </div>
        </>
      )}
      <div className={cn("transition-all duration-200", !hasAccess && showOverlay && "blur-sm pointer-events-none")}>
        {children}
      </div>
    </div>
  );
};

// Componente per disabilitare completamente una funzionalità
export const PremiumGate = ({
  children,
  featureName,
  customCheck,
}: Omit<PremiumFeatureWrapperProps, 'fallbackComponent' | 'showOverlay'>) => {
  const { isPremium } = usePlanLimits();

  const hasAccess = customCheck ? customCheck() : isPremium;

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg">
        <div className="text-center">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Funzione Premium</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {featureName} richiede il piano Premium
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
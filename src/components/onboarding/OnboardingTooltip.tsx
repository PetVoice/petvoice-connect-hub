import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ArrowLeft, ArrowRight, SkipForward, CheckCircle } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface OnboardingTooltipProps {
  targetElement: HTMLElement | null;
}

export function OnboardingTooltip({ targetElement }: OnboardingTooltipProps) {
  const { 
    state, 
    currentStepData, 
    nextStep, 
    previousStep, 
    skipStep, 
    closeOnboarding, 
    completeOnboarding 
  } = useOnboarding();
  
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isActionCompleted, setIsActionCompleted] = useState(false);

  useEffect(() => {
    if (!targetElement || !currentStepData) return;

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 250;
    
    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    let y = rect.bottom + 40; // More space below element

    // Adjust horizontal position if tooltip goes off-screen
    if (x + tooltipWidth > window.innerWidth - 20) {
      x = window.innerWidth - tooltipWidth - 20;
    }
    if (x < 20) {
      x = 20;
    }
    
    // If tooltip would go off-screen at the bottom, try positioning it to the side
    if (y + tooltipHeight > window.innerHeight - 20) {
      // Try positioning to the right of the element
      if (rect.right + tooltipWidth + 20 <= window.innerWidth) {
        x = rect.right + 20;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
      } 
      // Try positioning to the left of the element
      else if (rect.left - tooltipWidth - 20 >= 0) {
        x = rect.left - tooltipWidth - 20;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
      }
      // Last resort: position above the element with more space
      else {
        y = rect.top - tooltipHeight - 40;
        if (y < 20) {
          y = 20;
        }
      }
    }

    // Final check to ensure tooltip doesn't go off-screen vertically
    if (y + tooltipHeight > window.innerHeight - 20) {
      y = window.innerHeight - tooltipHeight - 20;
    }
    if (y < 20) {
      y = 20;
    }

    setTooltipPosition({ x, y });
  }, [targetElement, currentStepData, window.innerWidth, window.innerHeight]);

  useEffect(() => {
    // Auto-advance for certain steps
    if (currentStepData?.autoAdvance) {
      const timer = setTimeout(() => {
        setIsActionCompleted(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStepData]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOnboarding();
      } else if (e.key === 'Enter' && isActionCompleted) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActionCompleted]);

  const handleNext = () => {
    if (currentStepData?.action === 'complete') {
      completeOnboarding();
    } else {
      nextStep();
      setIsActionCompleted(false);
    }
  };

  const handleSkip = () => {
    skipStep();
    setIsActionCompleted(false);
  };

  const progress = (state.currentStep / state.totalSteps) * 100;

  if (!currentStepData) return null;

  return (
    <Card 
      className="fixed pointer-events-auto bg-background border-2 border-primary/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        width: 320,
        zIndex: 10000
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{state.currentStep}</span>
            </div>
            <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent style={{ zIndex: 10001 }}>
              <AlertDialogHeader>
                <AlertDialogTitle>Chiudere la guida?</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler chiudere la guida? Non riapparirà più, ma potrai sempre rivederla dalle impostazioni.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continua la guida</AlertDialogCancel>
                <AlertDialogAction onClick={closeOnboarding}>
                  Chiudi definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Passo {state.currentStep} di {state.totalSteps}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-foreground leading-relaxed">
          {currentStepData.description}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousStep}
            disabled={state.currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Indietro
          </Button>

          {currentStepData.optional && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="flex items-center gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Salta
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!isActionCompleted && !currentStepData.autoAdvance}
            size="sm"
            className="flex items-center gap-2 ml-auto"
          >
            {currentStepData.action === 'complete' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Completa
              </>
            ) : (
              <>
                Avanti
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {!isActionCompleted && !currentStepData.autoAdvance && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              {currentStepData.action === 'click' && "Clicca sull'elemento evidenziato per continuare"}
              {currentStepData.action === 'upload' && "Carica un file per continuare"}
              {currentStepData.action === 'navigate' && "Naviga alla sezione indicata"}
              {currentStepData.action === 'view' && "Visualizza il contenuto per continuare"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
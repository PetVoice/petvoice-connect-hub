import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ArrowRight, CheckCircle } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function InteractiveGuide() {
  const { state, currentStepData, nextStep, closeOnboarding, completeOnboarding } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isWaitingForAction, setIsWaitingForAction] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Find target element based on current step
  useEffect(() => {
    if (!state.isActive || !currentStepData) return;

    const findElement = () => {
      let element: HTMLElement | null = null;
      
      // Different strategies to find elements based on step
      switch (currentStepData.id) {
        case 1:
          // Welcome step - no specific target
          element = document.body;
          break;
        
        case 2:
          // Find "I Miei Pet" button or similar
          element = document.querySelector('[href="/pets"]') as HTMLElement ||
                   document.querySelector('a[href*="pets"]') as HTMLElement ||
                   Array.from(document.querySelectorAll('a')).find(a => 
                     a.textContent?.includes('Pet') || a.textContent?.includes('Miei Pet')
                   ) as HTMLElement;
          break;
        
        case 3:
          // Find "Analisi" link
          element = document.querySelector('[href="/analysis"]') as HTMLElement ||
                   document.querySelector('a[href*="analysis"]') as HTMLElement ||
                   Array.from(document.querySelectorAll('a')).find(a => 
                     a.textContent?.includes('Analisi')
                   ) as HTMLElement;
          break;
        
        case 4:
          // Find file upload input
          element = document.querySelector('input[type="file"]') as HTMLElement ||
                   document.querySelector('[type="file"]') as HTMLElement;
          break;
        
        case 5:
          // Find analyze button
          element = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent?.includes('Analizza')
          ) as HTMLElement;
          break;
        
        case 6:
          // Find results area
          element = document.querySelector('.analysis-results') as HTMLElement ||
                   document.querySelector('[data-testid="analysis-results"]') as HTMLElement;
          break;
        
        case 7:
          // Find save button
          element = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent?.includes('Salva')
          ) as HTMLElement;
          break;
        
        default:
          element = document.body;
      }

      if (element) {
        setTargetElement(element);
        setIsWaitingForAction(['click', 'upload', 'navigate'].includes(currentStepData.action));
      } else if (currentStepData.waitForElement) {
        // Retry if element not found
        setTimeout(findElement, 500);
      }
    };

    findElement();
  }, [state.isActive, currentStepData, location.pathname]);

  // Handle automatic navigation
  useEffect(() => {
    if (!state.isActive || !currentStepData) return;

    // Auto-navigate for step 3 (Analysis)
    if (currentStepData.id === 3 && location.pathname !== '/analysis') {
      setTimeout(() => {
        navigate('/analysis');
      }, 1000);
    }
  }, [state.isActive, currentStepData, location.pathname, navigate]);

  // Handle user interactions
  useEffect(() => {
    if (!state.isActive || !currentStepData || !targetElement) return;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if clicked element is our target or within our target
      if (target === targetElement || targetElement.contains(target)) {
        setIsWaitingForAction(false);
        
        // Different behaviors based on step
        switch (currentStepData.id) {
          case 2:
            // For "I Miei Pet" - just advance, don't interfere with navigation
            setTimeout(() => nextStep(), 300);
            break;
          
          case 3:
            // For "Analisi" - advance after navigation
            setTimeout(() => nextStep(), 500);
            break;
          
          case 4:
            // For file upload - wait for file selection
            const fileInput = target as HTMLInputElement;
            if (fileInput.files && fileInput.files.length > 0) {
              setTimeout(() => nextStep(), 300);
            }
            break;
          
          case 5:
            // For analyze button - advance after click
            setTimeout(() => nextStep(), 1000);
            break;
          
          case 7:
            // For save button - advance after click
            setTimeout(() => nextStep(), 300);
            break;
          
          default:
            setTimeout(() => nextStep(), 300);
        }
      }
    };

    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.type === 'file' && target.files && target.files.length > 0) {
        setIsWaitingForAction(false);
        setTimeout(() => nextStep(), 300);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleFileChange);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('change', handleFileChange);
    };
  }, [state.isActive, currentStepData, targetElement, nextStep]);

  // Auto-advance for certain steps
  useEffect(() => {
    if (!state.isActive || !currentStepData) return;

    if (currentStepData.autoAdvance) {
      const timer = setTimeout(() => {
        if (currentStepData.id === 8) {
          completeOnboarding();
        } else {
          nextStep();
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.isActive, currentStepData, nextStep, completeOnboarding]);

  if (!state.isActive || !currentStepData) return null;

  const progress = (state.currentStep / state.totalSteps) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Overlay dimming */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      
      {/* Highlight target element */}
      {targetElement && targetElement !== document.body && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: targetElement.getBoundingClientRect().left - 4,
            top: targetElement.getBoundingClientRect().top - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            borderRadius: '8px',
            boxShadow: '0 0 0 2px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.4)',
            animation: 'pulse 2s infinite',
            zIndex: 10000
          }}
        />
      )}

      {/* Animated pointer */}
      {targetElement && targetElement !== document.body && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: targetElement.getBoundingClientRect().right + 10,
            top: targetElement.getBoundingClientRect().top + targetElement.getBoundingClientRect().height / 2 - 15,
            zIndex: 10001
          }}
        >
          <div className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm animate-bounce">
            <span>👆</span>
            <span>Clicca qui</span>
          </div>
        </div>
      )}

      {/* Guide tooltip */}
      <GuideTooltip
        currentStepData={currentStepData}
        progress={progress}
        isWaitingForAction={isWaitingForAction}
        onClose={closeOnboarding}
        onNext={nextStep}
        onComplete={completeOnboarding}
        currentStep={state.currentStep}
        totalSteps={state.totalSteps}
      />
    </div>,
    document.body
  );
}

interface GuideTooltipProps {
  currentStepData: any;
  progress: number;
  isWaitingForAction: boolean;
  onClose: () => void;
  onNext: () => void;
  onComplete: () => void;
  currentStep: number;
  totalSteps: number;
}

function GuideTooltip({
  currentStepData,
  progress,
  isWaitingForAction,
  onClose,
  onNext,
  onComplete,
  currentStep,
  totalSteps
}: GuideTooltipProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 });

  useEffect(() => {
    // Position tooltip in a corner that doesn't interfere
    const x = window.innerWidth - 340;
    const y = 20;
    setPosition({ x, y });
  }, []);

  return (
    <Card
      className="fixed pointer-events-auto bg-background border-2 border-primary/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300"
      style={{
        left: position.x,
        top: position.y,
        width: 320,
        zIndex: 10002
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{currentStep}</span>
            </div>
            <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Passo {currentStep} di {totalSteps}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-foreground leading-relaxed">
          {currentStepData.description}
        </p>

        {!isWaitingForAction && !currentStepData.autoAdvance && (
          <Button
            onClick={currentStepData.action === 'complete' ? onComplete : onNext}
            size="sm"
            className="flex items-center gap-2 w-full"
          >
            {currentStepData.action === 'complete' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Completa
              </>
            ) : (
              <>
                Continua
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}

        {isWaitingForAction && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">
              {currentStepData.action === 'click' && "👆 Clicca sull'elemento evidenziato"}
              {currentStepData.action === 'upload' && "📁 Carica un file per continuare"}
              {currentStepData.action === 'navigate' && "🧭 Naviga alla sezione indicata"}
            </p>
          </div>
        )}

        {currentStepData.autoAdvance && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              ⏱️ Continua automaticamente...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
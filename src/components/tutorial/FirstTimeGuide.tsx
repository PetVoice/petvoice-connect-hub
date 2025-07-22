import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, X, ArrowDown } from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface FirstTimeGuideProps {
  steps: GuideStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

export const FirstTimeGuide: React.FC<FirstTimeGuideProps> = ({
  steps,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateTargetPosition = () => {
      const currentStepData = steps[currentStep];
      if (currentStepData) {
        const element = document.querySelector(currentStepData.targetSelector);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
          
          // Scroll dell'elemento in vista se necessario
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center' 
          });
        }
      }
    };

    // Delay per permettere rendering
    const timer = setTimeout(updateTargetPosition, 100);
    
    // Update on resize
    window.addEventListener('resize', updateTargetPosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetPosition);
    };
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip ? onSkip() : onComplete();
  };

  if (!steps[currentStep] || !targetRect) return null;

  const currentStepData = steps[currentStep];
  
  // Calcola posizione del tooltip basata sulla posizione dell'elemento target
  const getTooltipPosition = () => {
    if (!targetRect) return {};
    
    const padding = 20;
    let top, left, transform;
    
    switch (currentStepData.position) {
      case 'top':
        top = targetRect.top - padding;
        left = targetRect.left + (targetRect.width / 2);
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + (targetRect.width / 2);
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2);
        left = targetRect.left - padding;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2);
        left = targetRect.right + padding;
        transform = 'translate(0, -50%)';
        break;
      default:
        top = targetRect.bottom + padding;
        left = targetRect.left + (targetRect.width / 2);
        transform = 'translate(-50%, 0)';
    }
    
    return { top, left, transform };
  };

  const getArrowPosition = () => {
    if (!targetRect) return {};
    
    return {
      top: targetRect.top + (targetRect.height / 2),
      left: targetRect.left + (targetRect.width / 2)
    };
  };

  const tooltipStyle = getTooltipPosition();
  const arrowStyle = getArrowPosition();

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay scuro */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Spotlight sull'elemento target */}
      {targetRect && (
        <div
          className="absolute bg-white/10 border-2 border-primary rounded-lg animate-pulse"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 4px rgba(var(--primary), 0.3), 0 0 20px rgba(var(--primary), 0.5)'
          }}
        />
      )}

      {/* Freccia animata */}
      <div
        className="absolute animate-bounce"
        style={{
          top: arrowStyle.top ? arrowStyle.top - 40 : 0,
          left: arrowStyle.left ? arrowStyle.left - 12 : 0,
          transform: 'translateX(-50%)'
        }}
      >
        <ArrowDown className="h-8 w-8 text-primary drop-shadow-lg animate-pulse" />
      </div>

      {/* Tooltip con istruzioni */}
      <Card
        className="absolute w-80 max-w-sm shadow-2xl border-primary/20"
        style={tooltipStyle}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground">
                {currentStepData.title}
              </h3>
              <div className="text-xs text-muted-foreground mt-1">
                Passo {currentStep + 1} di {steps.length}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-4">
            {currentStepData.description}
          </p>
          
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Salta guida
            </Button>
            
            <Button
              onClick={handleNext}
              size="sm"
              className="flex items-center gap-2"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Avanti
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                'Completa'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
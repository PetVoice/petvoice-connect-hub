import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowDown, ArrowUp, ArrowLeft, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  arrow: 'up' | 'down' | 'left' | 'right';
  action?: () => void;
}

interface InteractiveGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const guideSteps: GuideStep[] = [
  {
    id: 'welcome',
    title: '🎉 Benvenuto in PetVoice!',
    description: 'Ti guiderò attraverso i primi passi per iniziare ad utilizzare la piattaforma. Iniziamo!',
    targetSelector: '[data-guide="sidebar"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'add-pet',
    title: '🐾 Aggiungi il tuo Pet',
    description: 'Prima di tutto, aggiungi il tuo animale domestico cliccando qui. È il primo passo fondamentale!',
    targetSelector: '[data-guide="pet-selector"]',
    position: 'bottom',
    arrow: 'up'
  },
  {
    id: 'navigation',
    title: '🧭 Navigazione Principale',
    description: 'Usa questa barra laterale per navigare tra le diverse sezioni dell\'app.',
    targetSelector: '[data-guide="main-navigation"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'analysis',
    title: '🔬 Analisi Comportamentale',
    description: 'Clicca qui per analizzare il comportamento del tuo pet e scoprire il suo stato emotivo.',
    targetSelector: '[data-guide="ai-analysis-menu"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'music-therapy',
    title: '🎵 Musicoterapia AI',
    description: 'Accedi alla musicoterapia personalizzata per migliorare il benessere del tuo pet.',
    targetSelector: '[data-guide="music-therapy-menu"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'training',
    title: '🧠 Training AI',
    description: 'Utilizza il training assistito da AI per addestrare il tuo pet con metodi scientifici.',
    targetSelector: '[data-guide="training-menu"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'wellness',
    title: '❤️ Benessere',
    description: 'Monitora la salute e il benessere generale del tuo pet con protocolli personalizzati.',
    targetSelector: '[href="/wellness"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'stats',
    title: '📊 Statistiche',
    description: 'Visualizza i progressi e le statistiche dettagliate del tuo pet nel tempo.',
    targetSelector: '[href="/stats"]',
    position: 'right',
    arrow: 'right'
  }
];

const InteractiveGuide: React.FC<InteractiveGuideProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  console.log('🎯 InteractiveGuide: Props received -', { isOpen, currentStep });

  const currentStepData = guideSteps[currentStep];
  console.log('🎯 InteractiveGuide: Current step data -', currentStepData);

  useEffect(() => {
    console.log('🎯 InteractiveGuide: useEffect triggered -', { isOpen, currentStepData: !!currentStepData, selector: currentStepData?.targetSelector });
    
    if (!isOpen || !currentStepData) return;

    const findAndHighlightElement = () => {
      console.log('🎯 InteractiveGuide: Looking for element with selector:', currentStepData.targetSelector);
      const element = document.querySelector(currentStepData.targetSelector) as HTMLElement;
      console.log('🎯 InteractiveGuide: Found element:', element);
      
      if (element) {
        setTargetElement(element);
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        console.log('🎯 InteractiveGuide: Element rect:', rect);
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center' 
        });
      } else {
        console.log('❌ InteractiveGuide: Element not found for selector:', currentStepData.targetSelector);
      }
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(findAndHighlightElement, 500); // Aumento il delay
    
    // Fallback: se l'elemento non viene trovato, prova altri selettori
    const fallbackTimer = setTimeout(() => {
      if (!targetElement) {
        console.log('❌ InteractiveGuide: Element still not found, trying fallback selectors...');
        
        // Prova selettori alternativi
        const fallbackSelectors = [
          'aside', // Sidebar generica
          '[role="complementary"]', // Sidebar semantica
          '.sidebar', // Classe CSS
          'nav', // Navigation principale
          'body' // Ultimo fallback
        ];
        
        for (const selector of fallbackSelectors) {
          const fallbackElement = document.querySelector(selector) as HTMLElement;
          if (fallbackElement) {
            console.log('✅ InteractiveGuide: Found fallback element with selector:', selector);
            setTargetElement(fallbackElement);
            setTargetRect(fallbackElement.getBoundingClientRect());
            break;
          }
        }
      }
    }, 1000);
    
    // Update on window resize
    const handleResize = () => {
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStep, isOpen, currentStepData]);

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const skipGuide = () => {
    onComplete();
    onClose();
  };

  console.log('🎯 InteractiveGuide: Render check -', { isOpen, currentStepData: !!currentStepData, targetRect: !!targetRect });
  
  if (!isOpen || !currentStepData || !targetRect) {
    console.log('🎯 InteractiveGuide: Not rendering because -', { isOpen, hasStepData: !!currentStepData, hasTargetRect: !!targetRect });
    return null;
  }

  const getTooltipPosition = () => {
    const { position } = currentStepData;
    const offset = 20;
    
    switch (position) {
      case 'top':
        return {
          top: targetRect.top - offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: targetRect.bottom + offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - offset,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + offset,
          transform: 'translate(0, -50%)'
        };
    }
  };

  const getArrowIcon = () => {
    const iconClass = "h-6 w-6 text-azure animate-bounce";
    switch (currentStepData.arrow) {
      case 'up': return <ArrowUp className={iconClass} />;
      case 'down': return <ArrowDown className={iconClass} />;
      case 'left': return <ArrowLeft className={iconClass} />;
      case 'right': return <ArrowRight className={iconClass} />;
    }
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <>
      {/* Overlay scuro */}
      <div className="fixed inset-0 bg-black/60 z-[100] pointer-events-auto">
        {/* Highlight del target element */}
        <div
          className="absolute border-4 border-azure shadow-glow rounded-lg pointer-events-none animate-pulse"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            background: 'rgba(99, 102, 241, 0.1)',
          }}
        />
        
        {/* Tooltip della guida */}
        <div
          className="absolute z-[101] pointer-events-auto"
          style={tooltipPosition}
        >
          <Card className="w-80 shadow-elegant border-azure/20">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {currentStepData.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipGuide}
                  className="text-muted-foreground hover:text-foreground ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Freccia animata */}
              <div className="flex justify-center my-4">
                {getArrowIcon()}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {currentStep + 1} di {guideSteps.length}
                  </span>
                  {/* Progress dots */}
                  <div className="flex gap-1">
                    {guideSteps.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          index === currentStep ? "bg-azure" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Indietro
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={nextStep}
                    className="gradient-azure text-white"
                  >
                    {currentStep === guideSteps.length - 1 ? 'Completa' : 'Avanti'}
                    {currentStep < guideSteps.length - 1 && (
                      <ChevronRight className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Skip button */}
              <div className="text-center mt-4">
                <Button
                  variant="link"
                  size="sm"
                  onClick={skipGuide}
                  className="text-xs text-muted-foreground"
                >
                  Salta la guida
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default InteractiveGuide;
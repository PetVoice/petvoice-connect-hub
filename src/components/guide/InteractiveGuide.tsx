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
    title: '🎉 Benvenuto in PetVibe!',
    description: 'Ti guiderò attraverso i primi passi per utilizzare la piattaforma e prenderti cura del tuo pet.',
    targetSelector: '[data-guide="sidebar"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'add-pet',
    title: '🐾 Aggiungi il tuo Pet',
    description: 'Il primo passo è aggiungere il tuo animale domestico. Clicca su "Pets" per iniziare.',
    targetSelector: '[data-guide="pets-menu"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'pet-profile',
    title: '📝 Profilo del Pet',
    description: 'Inserisci le informazioni del tuo pet: nome, tipo, età, razza e carica una foto.',
    targetSelector: '[data-guide="add-pet-button"]',
    position: 'bottom',
    arrow: 'up'
  },
  {
    id: 'ai-analysis',
    title: '🔬 Analisi Emotiva AI',
    description: 'Analizza le emozioni del tuo pet caricando foto, video o registrazioni audio.',
    targetSelector: '[data-guide="ai-analysis-menu"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'upload-analysis',
    title: '📤 Carica per Analizzare',
    description: 'Carica un file multimediale del tuo pet per scoprire il suo stato emotivo.',
    targetSelector: '[data-guide="upload-button"]',
    position: 'top',
    arrow: 'down'
  },
  {
    id: 'analysis-results',
    title: '📊 Risultati Analisi',
    description: 'Visualizza le emozioni rilevate e ricevi consigli personalizzati per il benessere del tuo pet.',
    targetSelector: '[data-guide="results-section"]',
    position: 'top',
    arrow: 'down'
  },
  {
    id: 'music-therapy',
    title: '🎵 Musicoterapia AI',
    description: 'Basandoti sui risultati dell\'analisi, accedi alla musicoterapia personalizzata per calmare il tuo pet.',
    targetSelector: '[data-guide="music-therapy-menu"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'therapy-categories',
    title: '🎶 Categorie Terapeutiche',
    description: 'Scegli la categoria di musicoterapia adatta alle emozioni rilevate (ansioso, stressato, agitato, etc.).',
    targetSelector: '[data-guide="therapy-categories"]',
    position: 'top',
    arrow: 'down'
  },
  {
    id: 'play-therapy',
    title: '▶️ Avvia Terapia',
    description: 'Riproduci le frequenze specifiche per migliorare lo stato emotivo del tuo pet.',
    targetSelector: '[data-guide="play-button"]',
    position: 'bottom',
    arrow: 'up'
  },
  {
    id: 'training-protocols',
    title: '🧠 Protocolli di Training',
    description: 'Accedi ai protocolli di addestramento AI personalizzati per problemi comportamentali.',
    targetSelector: '[data-guide="training-menu"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'diary-tracking',
    title: '📔 Diario del Pet',
    description: 'Tieni traccia quotidiana dell\'umore, comportamenti e progressi del tuo pet.',
    targetSelector: '[data-guide="diary-menu"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'dashboard-overview',
    title: '🏠 Dashboard Generale',
    description: 'Monitora la salute, benessere e progressi del tuo pet con grafici e statistiche.',
    targetSelector: '[data-guide="dashboard-menu"]',
    position: 'right',
    arrow: 'right'
  },
  {
    id: 'complete',
    title: '🎊 Complimenti!',
    description: 'Ora conosci tutte le funzionalità principali di PetVibe. Inizia a prenderti cura del tuo pet!',
    targetSelector: '[data-guide="sidebar"]',
    position: 'right',
    arrow: 'right'
  }
];

const InteractiveGuide: React.FC<InteractiveGuideProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStepData = guideSteps[currentStep];

  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const findAndHighlightElement = () => {
      const element = document.querySelector(currentStepData.targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
        setTargetRect(element.getBoundingClientRect());
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center' 
        });
      }
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(findAndHighlightElement, 100);
    
    // Update on window resize
    const handleResize = () => {
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
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

  if (!isOpen || !currentStepData || !targetRect) {
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
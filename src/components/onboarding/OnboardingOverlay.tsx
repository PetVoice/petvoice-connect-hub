import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingTooltip } from './OnboardingTooltip';

export function OnboardingOverlay() {
  const { state, currentStepData } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!state.isActive || !currentStepData) return;

    const findTargetElement = () => {
      const element = document.querySelector(currentStepData.targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
        updateOverlayStyle(element);
      } else if (currentStepData.waitForElement) {
        // Retry finding element after a delay
        setTimeout(findTargetElement, 500);
      }
    };

    findTargetElement();
  }, [state.isActive, currentStepData]);

  const updateOverlayStyle = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const spotlightRadius = Math.max(rect.width, rect.height) * 0.6 + 20;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setOverlayStyle({
      maskImage: `radial-gradient(circle ${spotlightRadius}px at ${centerX}px ${centerY}px, transparent 40%, rgba(0,0,0,0.8) 70%)`,
      WebkitMaskImage: `radial-gradient(circle ${spotlightRadius}px at ${centerX}px ${centerY}px, transparent 40%, rgba(0,0,0,0.8) 70%)`
    });
  };

  // Update overlay position on scroll and resize
  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => updateOverlayStyle(targetElement);
    
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetElement]);

  if (!state.isActive || !currentStepData) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dark overlay with spotlight effect that blocks clicks everywhere except target */}
      <div 
        className="absolute inset-0 bg-black/60 pointer-events-auto"
        style={overlayStyle}
        onClick={(e) => {
          // Block clicks on the overlay
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      
      {/* Glowing ring around target element */}
      {targetElement && (
        <div 
          className="absolute pointer-events-none"
          style={{
            left: targetElement.getBoundingClientRect().left - 4,
            top: targetElement.getBoundingClientRect().top - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            borderRadius: '12px',
            boxShadow: '0 0 0 2px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.5)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      {/* Tooltip */}
      <OnboardingTooltip targetElement={targetElement} />
    </div>,
    document.body
  );
}
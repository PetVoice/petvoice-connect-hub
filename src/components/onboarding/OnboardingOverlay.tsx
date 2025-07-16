import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingTooltip } from './OnboardingTooltip';

export function OnboardingOverlay() {
  const { state, currentStepData } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!state.isActive || !currentStepData) return;

    const findTargetElement = () => {
      const element = document.querySelector(currentStepData.targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
      } else if (currentStepData.waitForElement) {
        // Retry finding element after a delay
        setTimeout(findTargetElement, 500);
      }
    };

    findTargetElement();
  }, [state.isActive, currentStepData]);

  // Update element position on scroll and resize
  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      // Force re-render to update element position
      setTargetElement(targetElement);
    };
    
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
      {/* Animated oval around target element */}
      {targetElement && (
        <svg
          className="absolute pointer-events-none z-[10001]"
          style={{
            left: targetElement.getBoundingClientRect().left - 20,
            top: targetElement.getBoundingClientRect().top - 20,
            width: targetElement.getBoundingClientRect().width + 40,
            height: targetElement.getBoundingClientRect().height + 40,
          }}
        >
          <ellipse
            cx="50%"
            cy="50%"
            rx={targetElement.getBoundingClientRect().width / 2 + 15}
            ry={targetElement.getBoundingClientRect().height / 2 + 15}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray="10 5"
            style={{
              animation: 'spin 3s linear infinite',
              filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.6))'
            }}
          />
        </svg>
      )}
      
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
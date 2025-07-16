import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingTooltip } from './OnboardingTooltip';

export function OnboardingOverlay() {
  const { state, currentStepData } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [arrowPosition, setArrowPosition] = useState<{
    x: number;
    y: number;
    rotation: number;
  }>({ x: 0, y: 0, rotation: 0 });

  useEffect(() => {
    if (!state.isActive || !currentStepData) return;

    const findTargetElement = () => {
      const element = document.querySelector(currentStepData.targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
        updateArrowPosition(element);
      } else if (currentStepData.waitForElement) {
        // Retry finding element after a delay
        setTimeout(findTargetElement, 500);
      }
    };

    findTargetElement();
  }, [state.isActive, currentStepData]);

  const updateArrowPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Position arrow above the element
    const arrowX = centerX;
    const arrowY = rect.top - 60; // 60px above the element
    
    setArrowPosition({
      x: arrowX,
      y: arrowY,
      rotation: 180 // Point down
    });
  };

  // Update arrow position on scroll and resize
  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => updateArrowPosition(targetElement);
    
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
      {/* Animated arrow pointing to target element */}
      {targetElement && (
        <div
          className="absolute pointer-events-none z-[10001]"
          style={{
            left: arrowPosition.x - 20, // Center the arrow
            top: Math.max(arrowPosition.y, 20), // Ensure arrow is visible
            transform: `rotate(${arrowPosition.rotation}deg)`,
            animation: 'bounce 2s infinite'
          }}
        >
          {/* Arrow with white background for visibility */}
          <div className="relative">
            <div 
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              <div 
                className="w-6 h-6 border-l-4 border-b-4"
                style={{
                  borderColor: 'hsl(var(--primary))',
                  transform: 'rotate(-45deg)',
                }}
              />
            </div>
          </div>
        </div>
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
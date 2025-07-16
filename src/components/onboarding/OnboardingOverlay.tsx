import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingTooltip } from './OnboardingTooltip';

export function OnboardingOverlay() {
  const { state, currentStepData } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetPosition, setTargetPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!state.isActive || !currentStepData) return;

    const findTargetElement = () => {
      const element = document.querySelector(currentStepData.targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
        updateTargetPosition(element);
        disableAllInteractions(element);
      } else if (currentStepData.waitForElement) {
        setTimeout(findTargetElement, 500);
      }
    };

    findTargetElement();
    
    return () => {
      enableAllInteractions();
    };
  }, [state.isActive, currentStepData]);

  const updateTargetPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setTargetPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    });
  };

  const disableAllInteractions = (targetElement: HTMLElement) => {
    // Block all clicks on the page
    document.addEventListener('click', blockAllClicks, true);
    document.addEventListener('mousedown', blockAllClicks, true);
    document.addEventListener('touchstart', blockAllClicks, true);
    
    // Disable pointer events on everything
    document.body.style.pointerEvents = 'none';
    
    // Re-enable only on target
    if (targetElement) {
      targetElement.style.pointerEvents = 'auto';
      targetElement.style.position = 'relative';
      targetElement.style.zIndex = '9999';
    }
  };

  const enableAllInteractions = () => {
    // Remove event listeners
    document.removeEventListener('click', blockAllClicks, true);
    document.removeEventListener('mousedown', blockAllClicks, true);
    document.removeEventListener('touchstart', blockAllClicks, true);
    
    // Re-enable everything
    document.body.style.pointerEvents = 'auto';
    
    // Reset target styles
    if (targetElement) {
      targetElement.style.pointerEvents = '';
      targetElement.style.position = '';
      targetElement.style.zIndex = '';
    }
  };

  const blockAllClicks = (event: Event) => {
    // Block all clicks except on target
    if (targetElement && !targetElement.contains(event.target as Node)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  };

  // Update overlay position on scroll and resize
  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => updateTargetPosition(targetElement);
    
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetElement]);

  if (!state.isActive || !currentStepData || !targetPosition) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Overlay with hole - TOP */}
      <div 
        className="absolute bg-black/70 pointer-events-auto cursor-not-allowed"
        style={{
          top: 0,
          left: 0,
          right: 0,
          height: targetPosition.top
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      
      {/* Overlay with hole - LEFT */}
      <div 
        className="absolute bg-black/70 pointer-events-auto cursor-not-allowed"
        style={{
          top: targetPosition.top,
          left: 0,
          width: targetPosition.left,
          height: targetPosition.height
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      
      {/* Overlay with hole - RIGHT */}
      <div 
        className="absolute bg-black/70 pointer-events-auto cursor-not-allowed"
        style={{
          top: targetPosition.top,
          left: targetPosition.left + targetPosition.width,
          right: 0,
          height: targetPosition.height
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      
      {/* Overlay with hole - BOTTOM */}
      <div 
        className="absolute bg-black/70 pointer-events-auto cursor-not-allowed"
        style={{
          top: targetPosition.top + targetPosition.height,
          left: 0,
          right: 0,
          bottom: 0
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      
      {/* Highlight around target element */}
      <div 
        className="absolute pointer-events-none"
        style={{
          top: targetPosition.top - 4,
          left: targetPosition.left - 4,
          width: targetPosition.width + 8,
          height: targetPosition.height + 8,
          borderRadius: '12px',
          border: '3px solid hsl(var(--primary))',
          boxShadow: '0 0 20px hsl(var(--primary) / 0.5)',
          animation: 'pulse 2s infinite',
          zIndex: 9999
        }}
      />

      {/* Tooltip */}
      <OnboardingTooltip targetElement={targetElement} />
    </div>,
    document.body
  );
}
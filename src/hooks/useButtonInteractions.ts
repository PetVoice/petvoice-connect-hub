import { useState, useCallback, useRef } from 'react';

export interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

export type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export interface UseButtonInteractionsProps {
  onSuccess?: () => void;
  onError?: () => void;
  autoResetDelay?: number;
}

export const useButtonInteractions = (props: UseButtonInteractionsProps = {}) => {
  const { onSuccess, onError, autoResetDelay = 2000 } = props;
  
  const [state, setState] = useState<ButtonState>('idle');
  const [ripples, setRipples] = useState<RippleEffect[]>();
  const rippleIdRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple: RippleEffect = {
      id: rippleIdRef.current++,
      x,
      y,
    };
    
    setRipples(prev => [...(prev || []), newRipple]);
    
    // Rimuovi ripple dopo animazione
    setTimeout(() => {
      setRipples(prev => prev?.filter(ripple => ripple.id !== newRipple.id) || []);
    }, 600);
  }, []);

  const handleClick = useCallback((
    event: React.MouseEvent<HTMLButtonElement>,
    originalOnClick?: React.MouseEventHandler<HTMLButtonElement>
  ) => {
    // Crea effetto ripple
    createRipple(event);
    
    // Esegui click originale
    originalOnClick?.(event);
  }, [createRipple]);

  const setLoading = useCallback(() => {
    setState('loading');
  }, []);

  const setSuccess = useCallback(() => {
    setState('success');
    onSuccess?.();
    
    // Auto-reset dopo delay
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setState('idle');
    }, autoResetDelay);
  }, [onSuccess, autoResetDelay]);

  const setError = useCallback(() => {
    setState('error');
    onError?.();
    
    // Auto-reset dopo delay
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setState('idle');
    }, autoResetDelay);
  }, [onError, autoResetDelay]);

  const reset = useCallback(() => {
    setState('idle');
    setRipples([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const isInteractive = state === 'idle';

  return {
    state,
    ripples: ripples || [],
    isInteractive,
    handleClick,
    setLoading,
    setSuccess,
    setError,
    reset,
  };
};
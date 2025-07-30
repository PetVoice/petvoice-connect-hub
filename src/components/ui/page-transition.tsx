import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className,
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={cn(
        'transition-all duration-500 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </div>
  );
};

interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 500,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    up: isVisible ? 'translate-y-0' : 'translate-y-4',
    down: isVisible ? 'translate-y-0' : '-translate-y-4',
    left: isVisible ? 'translate-x-0' : 'translate-x-4',
    right: isVisible ? 'translate-x-0' : '-translate-x-4'
  };

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        directionClasses[direction],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  from?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  from = 'left',
  delay = 0,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const transformClasses = {
    left: isVisible ? 'translate-x-0' : '-translate-x-full',
    right: isVisible ? 'translate-x-0' : 'translate-x-full',
    top: isVisible ? 'translate-y-0' : '-translate-y-full',
    bottom: isVisible ? 'translate-y-0' : 'translate-y-full'
  };

  return (
    <div
      className={cn(
        'transition-transform duration-700 ease-out',
        transformClasses[from],
        className
      )}
    >
      {children}
    </div>
  );
};
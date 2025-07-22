import React, { createContext, useContext, ReactNode } from 'react';
import { useNotificationEvents } from '@/hooks/useNotificationEvents';

interface NotificationEventsContextType {
  triggerAnalysisCompleted: (petName: string) => void;
  triggerDiaryAdded: (petName: string) => void;
  triggerWellnessReminder: (petName: string) => void;
  triggerAppointmentReminder: (petName: string, appointmentType: string) => void;
}

const NotificationEventsContext = createContext<NotificationEventsContextType | undefined>(undefined);

export const useNotificationEventsContext = () => {
  const context = useContext(NotificationEventsContext);
  if (!context) {
    throw new Error('useNotificationEventsContext must be used within a NotificationEventsProvider');
  }
  return context;
};

interface NotificationEventsProviderProps {
  children: ReactNode;
}

export const NotificationEventsProvider: React.FC<NotificationEventsProviderProps> = ({ children }) => {
  try {
    const eventHandlers = useNotificationEvents();

    return (
      <NotificationEventsContext.Provider value={eventHandlers}>
        {children}
      </NotificationEventsContext.Provider>
    );
  } catch (error) {
    console.error('Error in NotificationEventsProvider:', error);
    // Provide fallback functions to prevent the app from crashing
    const fallbackHandlers: NotificationEventsContextType = {
      triggerAnalysisCompleted: () => console.warn('NotificationEvents not available'),
      triggerDiaryAdded: () => console.warn('NotificationEvents not available'),
      triggerWellnessReminder: () => console.warn('NotificationEvents not available'),
      triggerAppointmentReminder: () => console.warn('NotificationEvents not available'),
    };
    
    return (
      <NotificationEventsContext.Provider value={fallbackHandlers}>
        {children}
      </NotificationEventsContext.Provider>
    );
  }
};
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNotifications } from './useNotifications';
// Translation system removed - Italian only

export function useNotificationEvents() {
  try {
    const { user } = useAuth();
    const { pets } = usePets();
    const { addNotification } = useNotifications();
    // Translation system removed - Italian only
    const previousPetsCount = useRef(pets.length);

  // Notifica quando viene aggiunto un nuovo pet
  useEffect(() => {
    if (pets.length > previousPetsCount.current && previousPetsCount.current > 0) {
      const newPet = pets[pets.length - 1];
      addNotification({
        title: 'Nuovo Pet Aggiunto',
        message: `Benvenuto ${newPet.name}! Il tuo nuovo compagno è stato aggiunto con successo.`,
        type: 'success',
        read: false,
        action_url: '/analysis'
      });
    }
    previousPetsCount.current = pets.length;
  }, [pets.length, addNotification]);

  // Genera notifiche promemoria periodiche (solo una volta al giorno)
  useEffect(() => {
    if (!user || pets.length === 0) return;

    const generateDailyReminders = () => {
      const now = new Date();
      const lastReminderKey = `last-daily-reminder-${user.id}`;
      const lastReminder = localStorage.getItem(lastReminderKey);
      
      // Genera promemoria solo una volta al giorno
      if (lastReminder) {
        const lastDate = new Date(lastReminder);
        const timeDiff = now.getTime() - lastDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 1) return;
      }

      // Solo promemoria diario - una volta al giorno se l'utente non ha aggiornato il diario nelle ultime 24h
      const lastDiaryCheck = localStorage.getItem(`last-diary-${user.id}`);
      if (!lastDiaryCheck || (now.getTime() - new Date(lastDiaryCheck).getTime()) > (24 * 60 * 60 * 1000)) {
        addNotification({
          title: 'Promemoria Diario',
          message: `Non dimenticare di aggiornare il diario di ${pets[0].name}`,
          type: 'warning',
          read: false,
          action_url: '/diary'
        });
      }

      localStorage.setItem(lastReminderKey, now.toISOString());
    };

    // DISABILITO polling aggressivo che causa loop infiniti
    // const interval = setInterval(generateDailyReminders, 5000);
    // return () => clearInterval(interval);
    generateDailyReminders(); // Esegue solo una volta
  }, [user, pets, addNotification]);

  // Simula notifiche per eventi dell'app
  const triggerAnalysisCompleted = (petName: string) => {
    addNotification({
      title: 'Analisi Completata',
      message: `L'analisi comportamentale di ${petName} è stata completata`,
      type: 'success',
      read: false,
      action_url: '/analysis'
    });
  };

  const triggerDiaryAdded = (petName: string) => {
    addNotification({
      title: 'Diario Aggiornato',
      message: `Il diario di ${petName} è stato aggiornato con successo`,
      type: 'info',
      read: false,
      action_url: '/diary'
    });
  };

  const triggerWellnessReminder = (petName: string) => {
    addNotification({
      title: 'Promemoria Benessere',
      message: `È ora di controllare il benessere di ${petName}`,
      type: 'warning',
      read: false,
      action_url: '/wellness'
    });
  };

  const triggerAppointmentReminder = (petName: string, appointmentType: string) => {
    addNotification({
      title: 'Promemoria Appuntamento',
      message: `Appuntamento ${appointmentType} per ${petName} in programma`,
      type: 'warning',
      read: false,
      action_url: '/calendar'
    });
  };

  return {
    triggerAnalysisCompleted,
    triggerDiaryAdded,
    triggerWellnessReminder,
    triggerAppointmentReminder
  };
  } catch (error) {
    console.error('Error in useNotificationEvents:', error);
    // Return fallback functions
    return {
      triggerAnalysisCompleted: () => console.warn('Notification events not available'),
      triggerDiaryAdded: () => console.warn('Notification events not available'),
      triggerWellnessReminder: () => console.warn('Notification events not available'),
      triggerAppointmentReminder: () => console.warn('Notification events not available'),
    };
  }
}
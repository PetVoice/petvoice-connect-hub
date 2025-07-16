import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNotifications } from './useNotifications';

export function useNotificationEvents() {
  const { user } = useAuth();
  const { pets } = usePets();
  const { addNotification } = useNotifications();
  const previousPetsCount = useRef(pets.length);

  // Notifica quando viene aggiunto un nuovo pet
  useEffect(() => {
    if (pets.length > previousPetsCount.current && previousPetsCount.current > 0) {
      const newPet = pets[pets.length - 1];
      addNotification({
        title: 'Nuovo pet aggiunto!',
        message: `${newPet.name} è stato aggiunto alla tua famiglia. Inizia subito con un'analisi emotiva!`,
        type: 'success',
        read: false,
        action_url: '/analysis'
      });
    }
    previousPetsCount.current = pets.length;
  }, [pets.length, addNotification]);

  // Genera notifiche promemoria periodiche
  useEffect(() => {
    if (!user) return;

    const generatePeriodicReminders = () => {
      const now = new Date();
      const lastReminderKey = `last-reminder-${user.id}`;
      const lastReminder = localStorage.getItem(lastReminderKey);
      
      // Genera promemoria solo una volta al giorno
      if (lastReminder) {
        const lastDate = new Date(lastReminder);
        const timeDiff = now.getTime() - lastDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 1) return;
      }

      // Promemoria per aggiornamento diario
      if (pets.length > 0) {
        addNotification({
          title: 'Aggiorna il diario del tuo pet',
          message: `Non dimenticare di registrare come sta oggi ${pets[0].name}`,
          type: 'warning',
          read: false,
          action_url: '/diary'
        });
      }

      // Promemoria per analisi emotiva
      if (pets.length > 0) {
        addNotification({
          title: 'Analizza le emozioni del tuo pet',
          message: 'Fai un\'analisi emotiva per capire meglio il comportamento del tuo pet',
          type: 'info',
          read: false,
          action_url: '/analysis'
        });
      }

      localStorage.setItem(lastReminderKey, now.toISOString());
    };

    // Genera promemoria dopo 5 secondi (per demo)
    const timer = setTimeout(generatePeriodicReminders, 5000);
    return () => clearTimeout(timer);
  }, [user, pets, addNotification]);

  // Simula notifiche per eventi dell'app
  const triggerAnalysisCompleted = (petName: string) => {
    addNotification({
      title: 'Analisi completata!',
      message: `L'analisi emotiva di ${petName} è pronta. Guarda i risultati!`,
      type: 'success',
      read: false,
      action_url: '/analysis'
    });
  };

  const triggerDiaryAdded = (petName: string) => {
    addNotification({
      title: 'Diario aggiornato',
      message: `Nuova voce aggiunta al diario di ${petName}`,
      type: 'info',
      read: false,
      action_url: '/diary'
    });
  };

  const triggerWellnessReminder = (petName: string) => {
    addNotification({
      title: 'Controlla il benessere',
      message: `È ora di verificare il punteggio di benessere di ${petName}`,
      type: 'warning',
      read: false,
      action_url: '/wellness'
    });
  };

  const triggerAppointmentReminder = (petName: string, appointmentType: string) => {
    addNotification({
      title: 'Promemoria appuntamento',
      message: `Appuntamento ${appointmentType} per ${petName} domani alle 10:00`,
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
}
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNotifications } from './useNotifications';
import { useTranslation } from './useTranslation';

export function useNotificationEvents() {
  try {
    const { user } = useAuth();
    const { pets } = usePets();
    const { addNotification } = useNotifications();
    const { t } = useTranslation();
    const previousPetsCount = useRef(pets.length);

  // Notifica quando viene aggiunto un nuovo pet
  useEffect(() => {
    if (pets.length > previousPetsCount.current && previousPetsCount.current > 0) {
      const newPet = pets[pets.length - 1];
      addNotification({
        title: t('notifications.newPet.title'),
        message: t('notifications.newPet.message', '', { petName: newPet.name }),
        type: 'success',
        read: false,
        action_url: '/analysis'
      });
    }
    previousPetsCount.current = pets.length;
  }, [pets.length, addNotification, t]);

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
          title: t('notifications.diaryReminder.title'),
          message: t('notifications.diaryReminder.message', '', { petName: pets[0].name }),
          type: 'warning',
          read: false,
          action_url: '/diary'
        });
      }

      localStorage.setItem(lastReminderKey, now.toISOString());
    };

    // Controlla ogni 5 secondi per notifiche più reattive
    const interval = setInterval(generateDailyReminders, 5000);
    return () => clearInterval(interval);
  }, [user, pets, addNotification, t]);

  // Simula notifiche per eventi dell'app
  const triggerAnalysisCompleted = (petName: string) => {
    addNotification({
      title: t('notifications.analysisCompleted.title'),
      message: t('notifications.analysisCompleted.message', '', { petName }),
      type: 'success',
      read: false,
      action_url: '/analysis'
    });
  };

  const triggerDiaryAdded = (petName: string) => {
    addNotification({
      title: t('notifications.diaryUpdated.title'),
      message: t('notifications.diaryUpdated.message', '', { petName }),
      type: 'info',
      read: false,
      action_url: '/diary'
    });
  };

  const triggerWellnessReminder = (petName: string) => {
    addNotification({
      title: t('notifications.wellnessReminder.title'),
      message: t('notifications.wellnessReminder.message', '', { petName }),
      type: 'warning',
      read: false,
      action_url: '/wellness'
    });
  };

  const triggerAppointmentReminder = (petName: string, appointmentType: string) => {
    addNotification({
      title: t('notifications.appointmentReminder.title'),
      message: t('notifications.appointmentReminder.message', '', { petName, appointmentType }),
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
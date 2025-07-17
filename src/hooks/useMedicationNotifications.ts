
import { useEffect } from 'react';
import { useNotifications } from './useNotifications';
import { useAuth } from '@/contexts/AuthContext';

export function useMedicationNotifications() {
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Controllo promemoria farmaci
    const checkMedicationReminders = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Esempio: promemoria alle 8:00 e 20:00
      if (hour === 8 || hour === 20) {
        addNotification({
          title: 'Promemoria farmaco',
          message: 'È ora di somministrare il farmaco al tuo pet',
          type: 'warning',
          read: false,
          action_url: '/wellness'
        });
      }
    };

    // Controlla ogni ora
    const interval = setInterval(checkMedicationReminders, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [addNotification, user]);

  return null;
}

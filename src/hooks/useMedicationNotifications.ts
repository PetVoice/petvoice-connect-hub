import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';
import { addDays, parseISO, isBefore } from 'date-fns';

export function useMedicationNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    const checkMedicationReminders = async () => {
      try {
        const { data: medications } = await supabase
          .from('medications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (medications && medications.length > 0) {
          const now = new Date();

          medications.forEach(medication => {
            if (medication.end_date) {
              const endDate = parseISO(medication.end_date);
              const threeDaysBefore = addDays(endDate, -3);

              // Notifica 3 giorni prima della scadenza
              if (isBefore(threeDaysBefore, now) && isBefore(now, endDate)) {
                const reminderKey = `medication-reminder-${medication.id}`;
                const lastReminder = localStorage.getItem(reminderKey);

                if (!lastReminder || (now.getTime() - parseInt(lastReminder)) > (24 * 60 * 60 * 1000)) {
                  addNotification({
                    title: 'Farmaco in scadenza',
                    message: `Il farmaco "${medication.name}" scade tra pochi giorni`,
                    type: 'warning',
                    read: false,
                    action_url: '/wellness'
                  });
                  localStorage.setItem(reminderKey, now.getTime().toString());
                }
              }
            }
          });
        }
      } catch (error) {
        console.error('Error checking medication reminders:', error);
      }
    };

    // Controlla ogni 4 ore per promemoria farmaci
    const interval = setInterval(checkMedicationReminders, 4 * 60 * 60 * 1000);
    
    // Controllo iniziale
    checkMedicationReminders();

    return () => clearInterval(interval);
  }, [user, addNotification]);
}
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';
// Translation system removed - Italian only
import { addDays, parseISO, isBefore } from 'date-fns';

export function useMedicationNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  // Translation system removed - Italian only

  useEffect(() => {
    if (!user) return;

    // Evita di creare multipli interval se l'hook viene chiamato più volte
    const checkKey = `medication-check-${user.id}`;
    if (window[checkKey]) {
      clearInterval(window[checkKey]);
    }

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
                    title: 'Farmaco in Scadenza',
                    message: `Il farmaco ${medication.name} scadrà presto`,
                    type: 'warning',
                    read: false,
                    action_url: '/diary'
                  }, 'medication');
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
    window[checkKey] = interval;
    
    // Controllo iniziale solo se non è già stato fatto nelle ultime 4 ore
    const lastCheckKey = `last-medication-check-${user.id}`;
    const lastCheck = localStorage.getItem(lastCheckKey);
    const now = Date.now();
    
    if (!lastCheck || (now - parseInt(lastCheck)) > 4 * 60 * 60 * 1000) {
      checkMedicationReminders();
      localStorage.setItem(lastCheckKey, now.toString());
    }

    return () => {
      clearInterval(interval);
      delete window[checkKey];
    };
  }, [user, addNotification]);
}
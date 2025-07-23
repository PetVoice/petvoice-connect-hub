import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';
// Translation system removed - Italian only
import { format, parseISO, isAfter, isBefore, addHours } from 'date-fns';

export function useCalendarNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  // Translation system removed - Italian only

  useEffect(() => {
    if (!user) return;

    const checkUpcomingEvents = async () => {
      try {
        const now = new Date();
        const nextDay = addHours(now, 24);

        const { data: events } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', now.toISOString())
          .lte('start_time', nextDay.toISOString())
          .order('start_time', { ascending: true });

        if (events && events.length > 0) {
          events.forEach(event => {
            const eventStart = parseISO(event.start_time);
            const hoursUntil = Math.round((eventStart.getTime() - now.getTime()) / (1000 * 60 * 60));

            // Notifica 24 ore prima
            if (hoursUntil <= 24 && hoursUntil > 23) {
              addNotification({
                title: t('notifications.eventReminder.title'),
                message: t('notifications.eventReminder.message', '', { 
                  eventTitle: event.title,
                  eventTime: format(eventStart, 'HH:mm')
                }),
                type: 'warning',
                read: false,
                action_url: '/calendar'
              });
            }

            // Notifica 2 ore prima
            if (hoursUntil <= 2 && hoursUntil > 1) {
              addNotification({
                title: t('notifications.eventImminent.title'),
                message: t('notifications.eventImminent.message', '', { 
                  eventTitle: event.title,
                  hoursUntil: hoursUntil.toString()
                }),
                type: 'warning',
                read: false,
                action_url: '/calendar'
              });
            }
          });
        }
      } catch (error) {
        console.error('Error checking upcoming events:', error);
      }
    };

    // Controlla ogni ora per eventi imminenti
    const interval = setInterval(checkUpcomingEvents, 60 * 60 * 1000);
    
    // Controllo iniziale
    checkUpcomingEvents();

    return () => clearInterval(interval);
  }, [user, addNotification, t]);
}
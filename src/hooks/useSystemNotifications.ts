import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';
import { supabase } from '@/integrations/supabase/client';

// Hook per notifiche di sistema e sicurezza
export function useSystemNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Notifica per login da nuovo dispositivo/IP
    const checkLoginSecurity = () => {
      const lastLoginIP = localStorage.getItem(`last-login-ip-${user.id}`);
      const currentIP = ''; // Normalmente ottenuto da API

      if (lastLoginIP && lastLoginIP !== currentIP && currentIP) {
        addNotification({
          title: '🔐 Nuovo Accesso Rilevato',
          message: 'È stato effettuato un accesso al tuo account da un nuovo dispositivo',
          type: 'warning',
          read: false,
          action_url: '/settings'
        }, 'warning');
      }
    };

    // Notifica per aggiornamenti importante dell'app
    const checkAppUpdates = () => {
      // Simula controllo versione app
      const lastVersionNotified = localStorage.getItem(`app-version-notified-${user.id}`);
      const currentVersion = '2.1.0'; // Da package.json o variabile

      if (!lastVersionNotified || lastVersionNotified !== currentVersion) {
        addNotification({
          title: '🆕 Nuove Funzionalità Disponibili',
          message: 'La tua app è stata aggiornata con nuove funzionalità!',
          type: 'success',
          read: false,
          action_url: '/dashboard'
        }, 'success');
        localStorage.setItem(`app-version-notified-${user.id}`, currentVersion);
      }
    };

    // Notifica per backup dati importante
    const checkDataBackup = () => {
      const lastBackupReminder = localStorage.getItem(`backup-reminder-${user.id}`);
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      if (!lastBackupReminder || (now - parseInt(lastBackupReminder)) > thirtyDays) {
        addNotification({
          title: '💾 Promemoria Backup',
          message: 'È consigliabile fare un backup dei tuoi dati',
          type: 'info',
          read: false,
          action_url: '/settings'
        }, 'info');
        localStorage.setItem(`backup-reminder-${user.id}`, now.toString());
      }
    };

    // Esegui controlli
    checkLoginSecurity();
    checkAppUpdates();
    checkDataBackup();

    return () => {
      // Cleanup se necessario
    };
  }, [user, addNotification]);
}

// Hook per notifiche di training e protocolli
export function useTrainingNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Subscription per completamento protocolli
    const protocolsSubscription = supabase
      .channel('training-protocols-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'training_sessions'
        },
        (payload) => {
          const session = payload.new as any;
          if (session.user_id === user.id && session.status === 'completed') {
            addNotification({
              title: '🎉 Protocollo Completato!',
              message: `Hai completato con successo un protocollo di training`,
              type: 'success',
              read: false,
              action_url: '/training'
            }, 'success');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(protocolsSubscription);
    };
  }, [user, addNotification]);
}

// Hook per notifiche di analisi comportamentale
export function useAnalysisNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Subscription per nuove analisi
    const analysisSubscription = supabase
      .channel('analysis-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analysis_history'
        },
        (payload) => {
          const analysis = payload.new as any;
          if (analysis.user_id === user.id) {
            addNotification({
              title: '📊 Analisi Completata',
              message: `La tua analisi comportamentale è pronta`,
              type: 'success',
              read: false,
              action_url: '/analysis'
            }, 'success');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(analysisSubscription);
    };
  }, [user, addNotification]);
}

// Hook per notifiche subscription/billing
export function useSubscriptionNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Controlla stato subscription usando l'API esistente
    const checkSubscriptionStatus = async () => {
      try {
        // Simula controllo subscription (da implementare con stripe)
        const subscriptionExpiring = false; // Da ottenere da stripe webhook o API
        
        if (subscriptionExpiring) {
          addNotification({
            title: '⚠️ Subscription in Scadenza',
            message: 'Il tuo abbonamento scadrà presto',
            type: 'warning',
            read: false,
            action_url: '/subscription'
          }, 'warning');
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    };

    // Controlla periodicamente
    const interval = setInterval(checkSubscriptionStatus, 24 * 60 * 60 * 1000);
    checkSubscriptionStatus(); // Controllo iniziale

    return () => clearInterval(interval);
  }, [user, addNotification]);
}
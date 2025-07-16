import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function usePushNotifications() {
  const { user } = useAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Controlla se le notifiche push sono supportate
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true);
      setPermission(Notification.permission);
      
      // Registra il service worker
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('Service Worker registered:', reg);
          setRegistration(reg);
        })
        .catch(err => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!supported) return false;
    
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = async (title: string, options: {
    body?: string;
    icon?: string;
    badge?: string;
    url?: string;
  } = {}) => {
    if (!supported || permission !== 'granted') {
      console.log('Push notifications not supported or not permitted');
      return;
    }

    try {
      // Per ora mandiamo una notifica locale
      // In futuro si potrebbe integrare con un servizio push reale
      new Notification(title, {
        body: options.body || 'Hai una nuova notifica da PetVoice',
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        requireInteraction: true,
        data: {
          url: options.url || '/'
        }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const subscribeToNotifications = async () => {
    if (!registration || permission !== 'granted') return null;

    try {
      // Genera una chiave VAPID dummy (in produzione serve una vera)
      const vapidKey = btoa('dummy-vapid-key-for-demo-purposes-only');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  };

  return {
    supported,
    permission,
    requestPermission,
    sendNotification,
    subscribeToNotifications
  };
}
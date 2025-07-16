// Service Worker per notifiche push
const CACHE_NAME = 'petvoice-notifications-v1';

// Installa il service worker
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// Attiva il service worker
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(clients.claim());
});

// Gestisce le notifiche push
self.addEventListener('push', event => {
  console.log('Push event received', event);
  
  if (event.data) {
    const options = event.data.json();
    
    const notificationOptions = {
      body: options.body || 'Hai una nuova notifica da PetVoice',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        url: options.url || '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'Apri',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Chiudi'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        options.title || 'PetVoice',
        notificationOptions
      )
    );
  }
});

// Gestisce i click sulle notifiche
self.addEventListener('notificationclick', event => {
  console.log('Notification click received', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Apri l'app o naviga a una pagina specifica
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Se c'è già una finestra aperta, porta il focus su quella
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          if (urlToOpen !== '/') {
            client.navigate(urlToOpen);
          }
          return;
        }
      }
      
      // Altrimenti apri una nuova finestra
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Gestisce la chiusura delle notifiche
self.addEventListener('notificationclose', event => {
  console.log('Notification closed', event);
});
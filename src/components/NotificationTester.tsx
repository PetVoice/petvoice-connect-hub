import { useNotifications } from '@/hooks/useNotifications';
import { notificationSound } from '@/lib/notificationSound';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, TestTube } from 'lucide-react';

export function NotificationTester() {
  const { addNotification } = useNotifications();

  const testNotifications = [
    {
      title: '🧪 Test Messaggio',
      message: 'Test notifica messaggio privato',
      type: 'info' as const,
      soundType: 'message' as const
    },
    {
      title: '🧪 Test Calendario', 
      message: 'Test notifica evento calendario',
      type: 'warning' as const,
      soundType: 'calendar' as const
    },
    {
      title: '🧪 Test Successo',
      message: 'Test notifica di successo',
      type: 'success' as const,
      soundType: 'success' as const
    },
    {
      title: '🧪 Test Farmaco',
      message: 'Test notifica scadenza farmaco',
      type: 'warning' as const,
      soundType: 'medication' as const
    }
  ];

  const triggerTestNotification = (test: typeof testNotifications[0]) => {
    console.log('🧪 Triggering test notification:', test.title);
    
    addNotification({
      title: test.title,
      message: test.message,
      type: test.type,
      read: false,
      action_url: '/dashboard'
    }, test.soundType);
  };

  const triggerAllTests = () => {
    testNotifications.forEach((test, index) => {
      setTimeout(() => {
        triggerTestNotification(test);
      }, index * 1000);
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test Notifiche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={triggerAllTests}
          className="w-full"
          variant="default"
        >
          <Bell className="h-4 w-4 mr-2" />
          Testa Tutte le Notifiche
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          {testNotifications.map((test, index) => (
            <Button
              key={index}
              onClick={() => triggerTestNotification(test)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {test.title.split(' ')[0]} {test.title.split(' ')[1]}
            </Button>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          Clicca per testare le notifiche. Controlla la campanellina in alto a destra!
        </div>
      </CardContent>
    </Card>
  );
}
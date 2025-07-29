import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Volume2, VolumeX, Bell, MessageCircle, Calendar, Pill, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { notificationSound } from '@/lib/notificationSound';

export function NotificationSettings() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [testingSound, setTestingSound] = useState<string | null>(null);

  useEffect(() => {
    setSoundEnabled(notificationSound.isAudioEnabled());
  }, []);

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    notificationSound.setEnabled(enabled);
  };

  const testSound = async (type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'calendar' | 'medication') => {
    if (testingSound) return;
    
    setTestingSound(type);
    
    // Richiedi permesso se necessario
    await notificationSound.requestPermission();
    
    // Riproduci il suono
    notificationSound.playNotificationSound(type);
    
    setTimeout(() => setTestingSound(null), 1000);
  };

  const soundTypes = [
    { 
      key: 'message' as const, 
      label: 'Messaggi', 
      icon: MessageCircle, 
      description: 'Messaggi privati e community',
      color: 'text-blue-500'
    },
    { 
      key: 'calendar' as const, 
      label: 'Eventi Calendario', 
      icon: Calendar, 
      description: 'Promemoria e eventi',
      color: 'text-purple-500'
    },
    { 
      key: 'medication' as const, 
      label: 'Medicinali', 
      icon: Pill, 
      description: 'Scadenze farmaci',
      color: 'text-red-500'
    },
    { 
      key: 'success' as const, 
      label: 'Successo', 
      icon: CheckCircle, 
      description: 'Azioni completate',
      color: 'text-green-500'
    },
    { 
      key: 'warning' as const, 
      label: 'Avvertimenti', 
      icon: AlertTriangle, 
      description: 'Attenzione richiesta',
      color: 'text-yellow-500'
    },
    { 
      key: 'error' as const, 
      label: 'Errori', 
      icon: XCircle, 
      description: 'Problemi importanti',
      color: 'text-red-600'
    },
    { 
      key: 'info' as const, 
      label: 'Informazioni', 
      icon: Info, 
      description: 'Notifiche generali',
      color: 'text-blue-600'
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Impostazioni Notifiche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controllo generale suoni */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Notifiche Sonore</Label>
            <p className="text-sm text-muted-foreground">
              Abilita o disabilita tutti i suoni delle notifiche
            </p>
          </div>
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-primary" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
        </div>

        <Separator />

        {/* Test dei suoni */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Test Suoni Notifica</Label>
            <p className="text-sm text-muted-foreground">
              Clicca per ascoltare i diversi suoni delle notifiche
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {soundTypes.map((sound) => {
              const IconComponent = sound.icon;
              const isTesting = testingSound === sound.key;
              
              return (
                <Button
                  key={sound.key}
                  variant="outline"
                  className={`h-auto p-4 justify-start ${isTesting ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => testSound(sound.key)}
                  disabled={!soundEnabled || isTesting}
                >
                  <IconComponent className={`h-4 w-4 mr-3 ${sound.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{sound.label}</div>
                    <div className="text-xs text-muted-foreground">{sound.description}</div>
                  </div>
                  {isTesting && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Informazioni aggiuntive */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Informazioni</Label>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• I suoni delle notifiche aiutano a rimanere aggiornati sugli eventi importanti</p>
            <p>• Ogni tipo di notifica ha un suono distintivo per facilitare il riconoscimento</p>
            <p>• Le impostazioni vengono salvate automaticamente nel tuo dispositivo</p>
            <p>• Assicurati che il volume del dispositivo sia attivato per sentire i suoni</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  User, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Calendar,
  Users,
  Heart,
  Gift,
  Smartphone,
  X
} from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const { supported: pushSupported, permission, requestPermission, sendNotification } = usePushNotifications();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    theme: 'light',
    language: 'it',
    notifications_enabled: true,
    marketing_communications: false,
    analytics_contribution: true,
    community_participation: true
  });

  // Impostazioni specifiche per le notifiche
  const [notificationSettings, setNotificationSettings] = useState({
    calendar_reminders: true,
    community_messages: true,
    medication_reminders: true,
    referral_updates: true,
    push_notifications: false
  });

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Profilo aggiornato",
        description: "Le tue impostazioni sono state salvate con successo.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del profilo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePushNotificationToggle = async () => {
    if (!pushSupported) {
      toast({
        title: "Non supportato",
        description: "Le notifiche push non sono supportate in questo browser.",
        variant: "destructive",
      });
      return;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        toast({
          title: "Permesso negato",
          description: "Hai negato il permesso per le notifiche push.",
          variant: "destructive",
        });
        return;
      }
    }

    setNotificationSettings(prev => ({
      ...prev,
      push_notifications: !prev.push_notifications
    }));

    if (!notificationSettings.push_notifications) {
      await sendNotification("Notifiche push attivate", {
        body: "Ora riceverai notifiche push da PetVoice!",
        url: "/"
      });
    }
  };

  const testNotification = async () => {
    if (pushSupported && permission === 'granted') {
      await sendNotification("Test notifica", {
        body: "Questa è una notifica di test da PetVoice!",
        url: "/"
      });
    }
    toast({
      title: "Notifica inviata",
      description: "Hai ricevuto una notifica di test.",
    });
  };

  const handleAccountDeletion = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata."
    );
    
    if (confirmed) {
      try {
        await supabase.rpc('delete_user_account');
        await signOut();
        toast({
          title: "Account eliminato",
          description: "Il tuo account è stato eliminato con successo.",
        });
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione dell'account.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Impostazioni</h1>
        <p className="text-muted-foreground">Gestisci le tue preferenze e impostazioni dell'account</p>
      </div>

      <div className="grid gap-6">
        {/* Profilo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profilo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Nome visualizzato</Label>
                <Input
                  id="display_name"
                  value={profile.display_name}
                  onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                  placeholder="Il tuo nome"
                />
              </div>
              <div>
                <Label htmlFor="language">Lingua</Label>
                <select 
                  id="language"
                  value={profile.language}
                  onChange={(e) => setProfile({...profile, language: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
            <Button onClick={handleProfileUpdate} disabled={loading}>
              {loading ? 'Salvataggio...' : 'Salva modifiche'}
            </Button>
          </CardContent>
        </Card>

        {/* Notifiche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <Label>Promemoria calendario</Label>
                  <p className="text-sm text-muted-foreground">Ricevi notifiche per appuntamenti imminenti</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.calendar_reminders}
                onCheckedChange={() => handleNotificationSettingChange('calendar_reminders')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <div>
                  <Label>Messaggi community</Label>
                  <p className="text-sm text-muted-foreground">Notifiche per nuovi messaggi nei canali seguiti</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.community_messages}
                onCheckedChange={() => handleNotificationSettingChange('community_messages')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <div>
                  <Label>Promemoria farmaci</Label>
                  <p className="text-sm text-muted-foreground">Notifiche per la somministrazione di farmaci</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.medication_reminders}
                onCheckedChange={() => handleNotificationSettingChange('medication_reminders')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-purple-500" />
                <div>
                  <Label>Aggiornamenti referral</Label>
                  <p className="text-sm text-muted-foreground">Notifiche per nuovi referral e commissioni</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.referral_updates}
                onCheckedChange={() => handleNotificationSettingChange('referral_updates')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-indigo-500" />
                <div>
                  <Label>Notifiche push</Label>
                  <p className="text-sm text-muted-foreground">
                    Ricevi notifiche push sul dispositivo
                    {!pushSupported && <Badge variant="destructive" className="ml-2">Non supportato</Badge>}
                    {pushSupported && permission === 'denied' && <Badge variant="destructive" className="ml-2">Negato</Badge>}
                    {pushSupported && permission === 'granted' && <Badge variant="secondary" className="ml-2">Consentito</Badge>}
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.push_notifications}
                onCheckedChange={handlePushNotificationToggle}
                disabled={!pushSupported}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={testNotification} variant="outline" size="sm">
                Test notifica
              </Button>
              <Button onClick={clearAllNotifications} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Pulisci tutte ({notifications.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Tema dell'applicazione</Label>
                <p className="text-sm text-muted-foreground">Scegli il tema che preferisci</p>
              </div>
              <select 
                value={profile.theme}
                onChange={(e) => setProfile({...profile, theme: e.target.value})}
                className="px-3 py-2 border rounded-md"
              >
                <option value="light">Chiaro</option>
                <option value="dark">Scuro</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Comunicazioni marketing</Label>
                <p className="text-sm text-muted-foreground">Ricevi email promozionali e novità</p>
              </div>
              <Switch
                checked={profile.marketing_communications}
                onCheckedChange={(checked) => setProfile({...profile, marketing_communications: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Contributo analytics</Label>
                <p className="text-sm text-muted-foreground">Aiuta a migliorare l'app condividendo dati anonimi</p>
              </div>
              <Switch
                checked={profile.analytics_contribution}
                onCheckedChange={(checked) => setProfile({...profile, analytics_contribution: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Partecipazione community</Label>
                <p className="text-sm text-muted-foreground">Mostra il tuo profilo nella community</p>
              </div>
              <Switch
                checked={profile.community_participation}
                onCheckedChange={(checked) => setProfile({...profile, community_participation: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Zona pericolosa */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Database className="h-5 w-5" />
              Zona pericolosa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-red-700">Elimina account</Label>
                <p className="text-sm text-red-600 mb-2">
                  Questa azione eliminerà permanentemente il tuo account e tutti i dati associati.
                </p>
                <Button variant="destructive" onClick={handleAccountDeletion}>
                  Elimina account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

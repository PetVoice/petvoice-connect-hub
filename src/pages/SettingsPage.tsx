import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Shield, 
  Eye, 
  Bell, 
  Palette, 
  Database, 
  Link, 
  CreditCard, 
  Users, 
  Settings as SettingsIcon,
  Accessibility,
  HeadphonesIcon,
  FileText,
  Camera,
  Mail,
  Lock,
  Smartphone,
  Globe,
  Calendar,
  Download,
  Trash2,
  LogOut,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock,
  Monitor,
  Moon,
  Sun,
  Languages,
  DollarSign,
  Ruler,
  Volume2,
  Zap,
  Crown,
  Plus,
  X,
  Edit,
  Save,
  Key,
  History,
  Info,
  Home,
  Heart,
  Share2,
  Fingerprint,
  Wifi
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  theme: string;
  language: string;
  notifications_enabled: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessions: ActiveSession[];
  loginHistory: LoginRecord[];
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  browser: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LoginRecord {
  id: string;
  timestamp: string;
  location: string;
  device: string;
  ipAddress: string;
  success: boolean;
}

interface NotificationSettings {
  push: {
    healthAlerts: boolean;
    appointments: boolean;
    community: boolean;
    analysis: boolean;
    achievements: boolean;
    system: boolean;
  };
  email: {
    healthAlerts: boolean;
    appointments: boolean;
    community: boolean;
    analysis: boolean;
    achievements: boolean;
    system: boolean;
    newsletter: boolean;
    marketing: boolean;
  };
  sms: {
    enabled: boolean;
    phoneNumber: string;
    emergencyOnly: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [newEmail, setNewEmail] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  
  // Security State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessions: [
      {
        id: '1',
        device: 'MacBook Pro',
        location: 'Milano, Italia',
        browser: 'Chrome 120.0',
        lastActive: '2024-01-15 14:30',
        isCurrent: true
      },
      {
        id: '2',
        device: 'iPhone 15',
        location: 'Roma, Italia',
        browser: 'Safari Mobile',
        lastActive: '2024-01-14 09:15',
        isCurrent: false
      }
    ],
    loginHistory: [
      {
        id: '1',
        timestamp: '2024-01-15 14:30',
        location: 'Milano, Italia',
        device: 'MacBook Pro',
        ipAddress: '192.168.1.100',
        success: true
      },
      {
        id: '2',
        timestamp: '2024-01-14 09:15',
        location: 'Roma, Italia',
        device: 'iPhone 15',
        ipAddress: '192.168.1.101',
        success: true
      }
    ]
  });

  // Notification State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    push: {
      healthAlerts: true,
      appointments: true,
      community: true,
      analysis: true,
      achievements: true,
      system: true
    },
    email: {
      healthAlerts: true,
      appointments: true,
      community: false,
      analysis: true,
      achievements: false,
      system: true,
      newsletter: false,
      marketing: false
    },
    sms: {
      enabled: false,
      phoneNumber: '',
      emergencyOnly: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    frequency: 'realtime'
  });

  // Appearance State
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'it',
    timezone: 'Europe/Rome',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    units: 'metric'
  });

  // Privacy State
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    communityParticipation: true,
    dataSharing: false,
    analyticsContribution: true,
    marketingCommunications: false,
    thirdPartySharing: false
  });

  // Data Management State
  const [dataManagement, setDataManagement] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: '2years',
    crossDeviceSync: true,
    storageUsage: {
      used: 2.4,
      total: 10,
      breakdown: {
        photos: 1.2,
        analyses: 0.8,
        diary: 0.3,
        other: 0.1
      }
    }
  });

  // Integration State
  const [integrations, setIntegrations] = useState({
    calendar: {
      google: false,
      apple: false,
      outlook: false
    },
    smartHome: {
      alexa: false,
      googleHome: false,
      homeKit: false
    },
    health: {
      appleHealth: false,
      googleFit: false
    }
  });

  // Accessibility State
  const [accessibility, setAccessibility] = useState({
    screenReader: false,
    highContrast: false,
    fontSize: 'medium',
    motionSensitivity: false,
    keyboardNavigation: true,
    voiceCommands: false
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setProfile({
            id: profile.id,
            display_name: profile.display_name || '',
            avatar_url: profile.avatar_url || '',
            theme: profile.theme || 'light',
            language: profile.language || 'it',
            notifications_enabled: profile.notifications_enabled
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleProfileSave = async () => {
    if (!profile) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: profile.display_name,
            theme: profile.theme,
            language: profile.language,
            notifications_enabled: profile.notifications_enabled,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Profilo aggiornato",
          description: "Le modifiche sono state salvate con successo."
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche. Riprova.",
        variant: "destructive"
      });
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail) return;
    
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      setEmailVerificationSent(true);
      toast({
        title: "Email di verifica inviata",
        description: "Controlla la tua nuova email per confermare il cambio."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile cambiare email. Riprova.",
        variant: "destructive"
      });
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      // Invalidate all sessions except current
      await supabase.auth.signOut({ scope: 'others' });
      
      toast({
        title: "Password aggiornata",
        description: "Tutte le altre sessioni sono state disconnesse per sicurezza."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile cambiare password. Riprova.",
        variant: "destructive"
      });
    }
  };

  const handleSessionDisconnect = async (sessionId: string) => {
    try {
      // In a real implementation, this would call an API to invalidate specific sessions
      setSecuritySettings(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s.id !== sessionId)
      }));
      
      toast({
        title: "Sessione disconnessa",
        description: "La sessione è stata terminata con successo."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile disconnettere la sessione.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectAllSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'others' });
      
      setSecuritySettings(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s.isCurrent)
      }));
      
      toast({
        title: "Sessioni disconnesse",
        description: "Tutte le altre sessioni sono state terminate."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile disconnettere le sessioni.",
        variant: "destructive"
      });
    }
  };

  const handleDataExport = async (format: 'json' | 'pdf' | 'csv') => {
    try {
      toast({
        title: "Esportazione avviata",
        description: `I tuoi dati verranno esportati in formato ${format.toUpperCase()}.`
      });
      
      // In a real implementation, this would trigger a background job
      setTimeout(() => {
        toast({
          title: "Esportazione completata",
          description: "I tuoi dati sono pronti per il download."
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile esportare i dati.",
        variant: "destructive"
      });
    }
  };

  const handleAccountDeletion = async () => {
    try {
      // This would typically show a confirmation dialog first
      const confirmed = window.confirm(
        "Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e tutti i tuoi dati verranno cancellati permanentemente."
      );
      
      if (confirmed) {
        // In a real implementation, this would call an edge function to delete all user data
        toast({
          title: "Account eliminato",
          description: "Il tuo account è stato eliminato con successo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'account.",
        variant: "destructive"
      });
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  if (!profile) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Caricamento impostazioni...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Impostazioni</h1>
          <p className="text-muted-foreground">Gestisci il tuo account e personalizza la tua esperienza</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3" />
          Account Verificato
        </Badge>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sicurezza
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aspetto
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dati
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Integrazioni
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            Accessibilità
          </TabsTrigger>
        </TabsList>

        {/* Account Management Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informazioni Profilo
                </CardTitle>
                <CardDescription>
                  Gestisci le informazioni del tuo profilo personale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold">
                      {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                      <Camera className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{profile.display_name || 'Nome non impostato'}</h3>
                    <p className="text-sm text-muted-foreground">Foto profilo</p>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                      Cambia avatar
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName">Nome visualizzato</Label>
                      <Input
                        id="displayName"
                        value={profile.display_name}
                        onChange={(e) => setProfile(prev => prev ? {...prev, display_name: e.target.value} : null)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Località</Label>
                      <Input
                        id="location"
                        placeholder="Milano, Italia"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Racconta qualcosa di te..."
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleProfileSave} className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Salva
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Annulla
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Modifica
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Gestione Email
                </CardTitle>
                <CardDescription>
                  Cambia il tuo indirizzo email con verifica di sicurezza
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email attuale</Label>
                  <Input value="user@example.com" disabled className="bg-muted" />
                </div>

                {emailVerificationSent ? (
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Email di verifica inviata. Controlla la tua nuova casella di posta e clicca sul link per completare il cambio.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newEmail">Nuova email</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="nuova@email.com"
                      />
                    </div>
                    <Button onClick={handleEmailChange} disabled={!newEmail} className="w-full">
                      Cambia Email
                    </Button>
                  </div>
                )}

                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <strong>Processo di cambio email:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Inserisci la nuova email</li>
                    <li>Riceverai un'email di conferma</li>
                    <li>Clicca sul link di verifica</li>
                    <li>Tutte le sessioni verranno invalidate</li>
                    <li>Dovrai accedere con la nuova email</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Password Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Cambio Password
                </CardTitle>
                <CardDescription>
                  Aggiorna la tua password per mantenere l'account sicuro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Password attuale</Label>
                  <Input id="currentPassword" type="password" />
                </div>

                <div>
                  <Label htmlFor="newPassword">Nuova password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    onChange={(e) => setPasswordStrength(calculatePasswordStrength(e.target.value))}
                  />
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sicurezza password</span>
                      <span>{passwordStrength}%</span>
                    </div>
                    <Progress value={passwordStrength} className="h-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Conferma password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>

                <Button className="w-full">
                  Aggiorna Password
                </Button>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Cambiando la password, tutte le altre sessioni attive verranno disconnesse per sicurezza.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Account Deletion */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Eliminazione Account
                </CardTitle>
                <CardDescription>
                  Elimina permanentemente il tuo account e tutti i dati associati
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Questa azione è irreversibile. Tutti i tuoi dati, inclusi profili pet, analisi, diario e impostazioni verranno eliminati permanentemente.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Prima di eliminare il tuo account:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Esporta i tuoi dati se vuoi conservarli</li>
                    <li>• Annulla eventuali abbonamenti attivi</li>
                    <li>• Salva informazioni importanti sui tuoi pet</li>
                  </ul>
                </div>

                <Button variant="destructive" onClick={handleAccountDeletion} className="w-full">
                  Elimina Account Permanentemente
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Sessions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Sessioni Attive
                    </CardTitle>
                    <CardDescription>
                      Gestisci i dispositivi che hanno accesso al tuo account
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleDisconnectAllSessions}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnetti Tutto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securitySettings.sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {session.device.includes('iPhone') ? (
                            <Smartphone className="h-5 w-5" />
                          ) : (
                            <Monitor className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{session.device}</h4>
                            {session.isCurrent && (
                              <Badge variant="default" className="text-xs">Corrente</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{session.browser}</p>
                          <p className="text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {session.location} • Ultimo accesso: {session.lastActive}
                          </p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSessionDisconnect(session.id)}
                        >
                          Disconnetti
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Autenticazione a Due Fattori
                </CardTitle>
                <CardDescription>
                  Aggiungi un livello extra di sicurezza al tuo account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">2FA Status</h4>
                    <p className="text-sm text-muted-foreground">
                      {securitySettings.twoFactorEnabled ? 'Attivato' : 'Disattivato'}
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({...prev, twoFactorEnabled: checked}))
                    }
                  />
                </div>

                {!securitySettings.twoFactorEnabled && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      L'autenticazione a due fattori protegge il tuo account anche se qualcuno conosce la tua password.
                    </AlertDescription>
                  </Alert>
                )}

                <Button className="w-full" disabled>
                  <Key className="h-4 w-4 mr-2" />
                  Configura 2FA (Prossimamente)
                </Button>
              </CardContent>
            </Card>

            {/* Login History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Cronologia Accessi
                </CardTitle>
                <CardDescription>
                  Visualizza gli ultimi accessi al tuo account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {securitySettings.loginHistory.map((login) => (
                    <div key={login.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${login.success ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="text-sm font-medium">{login.device}</p>
                          <p className="text-xs text-muted-foreground">
                            {login.location} • {login.timestamp}
                          </p>
                        </div>
                      </div>
                      <Badge variant={login.success ? 'default' : 'destructive'} className="text-xs">
                        {login.success ? 'Successo' : 'Fallito'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Download (GDPR) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Dati (GDPR)
                </CardTitle>
                <CardDescription>
                  Scarica una copia di tutti i tuoi dati per conformità GDPR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDataExport('json')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Esporta JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDataExport('pdf')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Esporta PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDataExport('csv')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Esporta CSV
                  </Button>
                </div>
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    L'esportazione includerà tutti i tuoi dati: profilo, pet, analisi, diario, impostazioni e cronologia.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visibilità Profilo
                </CardTitle>
                <CardDescription>
                  Controlla chi può vedere le tue informazioni
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={privacy.profileVisibility} 
                  onValueChange={(value) => setPrivacy(prev => ({...prev, profileVisibility: value}))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">Privato - Solo tu</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friends" id="friends" />
                    <Label htmlFor="friends">Amici - Utenti che segui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Pubblico - Tutti gli utenti</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Condivisione Dati
                </CardTitle>
                <CardDescription>
                  Gestisci la condivisione dei tuoi dati
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Partecipazione Community</Label>
                    <p className="text-sm text-muted-foreground">Partecipa alle discussioni e condividi esperienze</p>
                  </div>
                  <Switch
                    checked={privacy.communityParticipation}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({...prev, communityParticipation: checked}))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Contributo Analytics</Label>
                    <p className="text-sm text-muted-foreground">Aiuta a migliorare l'app con dati anonimi</p>
                  </div>
                  <Switch
                    checked={privacy.analyticsContribution}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({...prev, analyticsContribution: checked}))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Comunicazioni Marketing</Label>
                    <p className="text-sm text-muted-foreground">Ricevi email promozionali e offerte</p>
                  </div>
                  <Switch
                    checked={privacy.marketingCommunications}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({...prev, marketingCommunications: checked}))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Condivisione Terze Parti</Label>
                    <p className="text-sm text-muted-foreground">Condividi dati con partner selezionati</p>
                  </div>
                  <Switch
                    checked={privacy.thirdPartySharing}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({...prev, thirdPartySharing: checked}))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Legal & Compliance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Legale e Conformità
                </CardTitle>
                <CardDescription>
                  Gestisci consensi e visualizza documenti legali
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Consensi Attivi</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Termini di Servizio</p>
                          <p className="text-sm text-muted-foreground">Accettato il 15/01/2024</p>
                        </div>
                        <Badge variant="default">Attivo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Privacy Policy</p>
                          <p className="text-sm text-muted-foreground">Accettato il 15/01/2024</p>
                        </div>
                        <Badge variant="default">Attivo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Cookie Policy</p>
                          <p className="text-sm text-muted-foreground">Accettato il 15/01/2024</p>
                        </div>
                        <Badge variant="default">Attivo</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Documenti Legali</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Termini di Servizio
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Privacy Policy
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Cookie Policy
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Accordo Trattamento Dati
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifiche Push
                </CardTitle>
                <CardDescription>
                  Gestisci le notifiche che ricevi sul dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.push).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label>{key === 'healthAlerts' ? 'Avvisi Salute' : 
                              key === 'appointments' ? 'Appuntamenti' :
                              key === 'community' ? 'Community' :
                              key === 'analysis' ? 'Analisi' :
                              key === 'achievements' ? 'Traguardi' : 'Sistema'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {key === 'healthAlerts' ? 'Avvisi critici sulla salute del pet' :
                         key === 'appointments' ? 'Promemoria per appuntamenti veterinari' :
                         key === 'community' ? 'Messaggi e risposte dalla community' :
                         key === 'analysis' ? 'Risultati delle analisi comportamentali' :
                         key === 'achievements' ? 'Nuovi traguardi e badge ottenuti' : 'Aggiornamenti di sistema e sicurezza'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({
                          ...prev, 
                          push: {...prev.push, [key]: checked}
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notifiche Email
                </CardTitle>
                <CardDescription>
                  Controlla quali email ricevere
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label>{key === 'healthAlerts' ? 'Avvisi Salute' : 
                              key === 'appointments' ? 'Appuntamenti' :
                              key === 'community' ? 'Community' :
                              key === 'analysis' ? 'Analisi' :
                              key === 'achievements' ? 'Traguardi' : 
                              key === 'system' ? 'Sistema' :
                              key === 'newsletter' ? 'Newsletter' : 'Marketing'}</Label>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({
                          ...prev, 
                          email: {...prev.email, [key]: checked}
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SMS Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Notifiche SMS
                </CardTitle>
                <CardDescription>
                  Configura le notifiche via SMS per le emergenze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>SMS Abilitati</Label>
                  <Switch
                    checked={notifications.sms.enabled}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({
                        ...prev, 
                        sms: {...prev.sms, enabled: checked}
                      }))
                    }
                  />
                </div>

                {notifications.sms.enabled && (
                  <>
                    <div>
                      <Label htmlFor="phoneNumber">Numero di telefono</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={notifications.sms.phoneNumber}
                        onChange={(e) => 
                          setNotifications(prev => ({
                            ...prev, 
                            sms: {...prev.sms, phoneNumber: e.target.value}
                          }))
                        }
                        placeholder="+39 123 456 7890"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Solo Emergenze</Label>
                        <p className="text-sm text-muted-foreground">Ricevi SMS solo per avvisi critici</p>
                      </div>
                      <Switch
                        checked={notifications.sms.emergencyOnly}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({
                            ...prev, 
                            sms: {...prev.sms, emergencyOnly: checked}
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Orari Silenziosi
                </CardTitle>
                <CardDescription>
                  Imposta gli orari in cui non ricevere notifiche
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Orari silenziosi attivi</Label>
                  <Switch
                    checked={notifications.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({
                        ...prev, 
                        quietHours: {...prev.quietHours, enabled: checked}
                      }))
                    }
                  />
                </div>

                {notifications.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quietStart">Inizio</Label>
                      <Input
                        id="quietStart"
                        type="time"
                        value={notifications.quietHours.start}
                        onChange={(e) => 
                          setNotifications(prev => ({
                            ...prev, 
                            quietHours: {...prev.quietHours, start: e.target.value}
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="quietEnd">Fine</Label>
                      <Input
                        id="quietEnd"
                        type="time"
                        value={notifications.quietHours.end}
                        onChange={(e) => 
                          setNotifications(prev => ({
                            ...prev, 
                            quietHours: {...prev.quietHours, end: e.target.value}
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Tema
                </CardTitle>
                <CardDescription>
                  Personalizza l'aspetto dell'interfaccia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={appearance.theme} 
                  onValueChange={(value) => setAppearance(prev => ({...prev, theme: value}))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Chiaro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Scuro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Automatico
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Language */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Lingua
                </CardTitle>
                <CardDescription>
                  Seleziona la lingua dell'interfaccia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={appearance.language} onValueChange={(value) => setAppearance(prev => ({...prev, language: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Impostazioni Regionali
                </CardTitle>
                <CardDescription>
                  Configura formati regionali e fuso orario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fuso Orario</Label>
                  <Select value={appearance.timezone} onValueChange={(value) => setAppearance(prev => ({...prev, timezone: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Rome">Europa/Roma (GMT+1)</SelectItem>
                      <SelectItem value="Europe/London">Europa/Londra (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New York (GMT-5)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Formato Data</Label>
                    <Select value={appearance.dateFormat} onValueChange={(value) => setAppearance(prev => ({...prev, dateFormat: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Formato Ora</Label>
                    <Select value={appearance.timeFormat} onValueChange={(value) => setAppearance(prev => ({...prev, timeFormat: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24 ore</SelectItem>
                        <SelectItem value="12h">12 ore (AM/PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Units & Currency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Unità di Misura
                </CardTitle>
                <CardDescription>
                  Seleziona unità di misura e valuta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Sistema di Misura</Label>
                  <RadioGroup 
                    value={appearance.units} 
                    onValueChange={(value) => setAppearance(prev => ({...prev, units: value}))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="metric" id="metric" />
                      <Label htmlFor="metric">Metrico (kg, cm, °C)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="imperial" id="imperial" />
                      <Label htmlFor="imperial">Imperiale (lb, in, °F)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Valuta</Label>
                  <Select value={appearance.currency} onValueChange={(value) => setAppearance(prev => ({...prev, currency: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollaro USA ($)</SelectItem>
                      <SelectItem value="GBP">Sterlina (£)</SelectItem>
                      <SelectItem value="CHF">Franco Svizzero (CHF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Usage */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Utilizzo Spazio
                </CardTitle>
                <CardDescription>
                  Monitora l'utilizzo dello spazio di archiviazione
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Spazio utilizzato</span>
                      <span className="text-sm text-muted-foreground">
                        {dataManagement.storageUsage.used} GB di {dataManagement.storageUsage.total} GB
                      </span>
                    </div>
                    <Progress value={(dataManagement.storageUsage.used / dataManagement.storageUsage.total) * 100} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(dataManagement.storageUsage.breakdown).map(([key, value]) => (
                      <div key={key} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{value} GB</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {key === 'photos' ? 'Foto' : 
                           key === 'analyses' ? 'Analisi' :
                           key === 'diary' ? 'Diario' : 'Altro'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Backup Automatico
                </CardTitle>
                <CardDescription>
                  Configura il backup automatico dei tuoi dati
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Backup automatico</Label>
                  <Switch
                    checked={dataManagement.autoBackup}
                    onCheckedChange={(checked) => 
                      setDataManagement(prev => ({...prev, autoBackup: checked}))
                    }
                  />
                </div>

                {dataManagement.autoBackup && (
                  <div>
                    <Label>Frequenza backup</Label>
                    <Select 
                      value={dataManagement.backupFrequency} 
                      onValueChange={(value) => setDataManagement(prev => ({...prev, backupFrequency: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Giornaliero</SelectItem>
                        <SelectItem value="weekly">Settimanale</SelectItem>
                        <SelectItem value="monthly">Mensile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Periodo di conservazione</Label>
                  <Select 
                    value={dataManagement.retentionPeriod} 
                    onValueChange={(value) => setDataManagement(prev => ({...prev, retentionPeriod: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 anno</SelectItem>
                      <SelectItem value="2years">2 anni</SelectItem>
                      <SelectItem value="5years">5 anni</SelectItem>
                      <SelectItem value="forever">Per sempre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Sync Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Sincronizzazione
                </CardTitle>
                <CardDescription>
                  Gestisci la sincronizzazione tra dispositivi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sync cross-device</Label>
                    <p className="text-sm text-muted-foreground">Sincronizza dati tra tutti i tuoi dispositivi</p>
                  </div>
                  <Switch
                    checked={dataManagement.crossDeviceSync}
                    onCheckedChange={(checked) => 
                      setDataManagement(prev => ({...prev, crossDeviceSync: checked}))
                    }
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    La sincronizzazione utilizza connessione internet e può influire sulla durata della batteria.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Data Export */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Esportazione Dati
                </CardTitle>
                <CardDescription>
                  Esporta i tuoi dati in diversi formati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Formato JSON</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ideale per sviluppatori e backup completi
                    </p>
                    <Button variant="outline" onClick={() => handleDataExport('json')} className="w-full">
                      Esporta JSON
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Formato PDF</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Perfetto per stampa e condivisione
                    </p>
                    <Button variant="outline" onClick={() => handleDataExport('pdf')} className="w-full">
                      Esporta PDF
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Formato CSV</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Compatibile con Excel e fogli di calcolo
                    </p>
                    <Button variant="outline" onClick={() => handleDataExport('csv')} className="w-full">
                      Esporta CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Sincronizzazione Calendario
                </CardTitle>
                <CardDescription>
                  Connetti i tuoi calendari preferiti
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <Label>Google Calendar</Label>
                      <p className="text-sm text-muted-foreground">Sincronizza appuntamenti veterinari</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrations.calendar.google}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({
                        ...prev, 
                        calendar: {...prev.calendar, google: checked}
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Globe className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <Label>Apple Calendar</Label>
                      <p className="text-sm text-muted-foreground">Integrazione con iCal</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrations.calendar.apple}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({
                        ...prev, 
                        calendar: {...prev.calendar, apple: checked}
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <Label>Microsoft Outlook</Label>
                      <p className="text-sm text-muted-foreground">Sincronizza con Outlook</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrations.calendar.outlook}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({
                        ...prev, 
                        calendar: {...prev.calendar, outlook: checked}
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Smart Home */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Casa Intelligente
                </CardTitle>
                <CardDescription>
                  Integra con i tuoi dispositivi smart home
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Volume2 className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <Label>Amazon Alexa</Label>
                      <p className="text-sm text-muted-foreground">Comandi vocali per PetVoice</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrations.smartHome.alexa}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({
                        ...prev, 
                        smartHome: {...prev.smartHome, alexa: checked}
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Globe className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <Label>Google Home</Label>
                      <p className="text-sm text-muted-foreground">Controllo vocale Google</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrations.smartHome.googleHome}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({
                        ...prev, 
                        smartHome: {...prev.smartHome, googleHome: checked}
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Home className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <Label>Apple HomeKit</Label>
                      <p className="text-sm text-muted-foreground">Integrazione HomeKit</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrations.smartHome.homeKit}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({
                        ...prev, 
                        smartHome: {...prev.smartHome, homeKit: checked}
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Health Apps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  App Salute
                </CardTitle>
                <CardDescription>
                  Connetti con le app di monitoraggio salute
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Heart className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <Label>Apple Health</Label>
                      <p className="text-sm text-muted-foreground">Condividi dati di salute del pet</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrations.health.appleHealth}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({
                        ...prev, 
                        health: {...prev.health, appleHealth: checked}
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Heart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <Label>Google Fit</Label>
                      <p className="text-sm text-muted-foreground">Sincronizza attività fisica</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrations.health.googleFit}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({
                        ...prev, 
                        health: {...prev.health, googleFit: checked}
                      }))
                    }
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Le integrazioni health sono in fase di sviluppo e saranno disponibili presto.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* API Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Accesso API
                </CardTitle>
                <CardDescription>
                  Gestisci i token di accesso per integrazioni personalizzate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Le API di PetVoice sono in fase di sviluppo. Iscriviti alla beta per essere tra i primi ad accedervi.
                  </AlertDescription>
                </Alert>

                <Button variant="outline" className="w-full" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Genera Token API (Prossimamente)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Accessibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Accessibilità Visiva
                </CardTitle>
                <CardDescription>
                  Migliora la visibilità dell'interfaccia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ottimizzazione screen reader</Label>
                    <p className="text-sm text-muted-foreground">Migliora l'esperienza con lettori di schermo</p>
                  </div>
                  <Switch
                    checked={accessibility.screenReader}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({...prev, screenReader: checked}))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alto contrasto</Label>
                    <p className="text-sm text-muted-foreground">Aumenta il contrasto dei colori</p>
                  </div>
                  <Switch
                    checked={accessibility.highContrast}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({...prev, highContrast: checked}))
                    }
                  />
                </div>

                <div>
                  <Label>Dimensione font</Label>
                  <Select 
                    value={accessibility.fontSize} 
                    onValueChange={(value) => setAccessibility(prev => ({...prev, fontSize: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Piccolo</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Motor Accessibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Accessibilità Motoria
                </CardTitle>
                <CardDescription>
                  Facilitazioni per l'interazione con l'interfaccia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sensibilità al movimento</Label>
                    <p className="text-sm text-muted-foreground">Riduce animazioni e movimenti</p>
                  </div>
                  <Switch
                    checked={accessibility.motionSensitivity}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({...prev, motionSensitivity: checked}))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Navigazione da tastiera</Label>
                    <p className="text-sm text-muted-foreground">Ottimizza la navigazione con tastiera</p>
                  </div>
                  <Switch
                    checked={accessibility.keyboardNavigation}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({...prev, keyboardNavigation: checked}))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Comandi vocali</Label>
                    <p className="text-sm text-muted-foreground">Abilita controllo vocale dell'app</p>
                  </div>
                  <Switch
                    checked={accessibility.voiceCommands}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({...prev, voiceCommands: checked}))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Help */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeadphonesIcon className="h-5 w-5" />
                  Supporto Accessibilità
                </CardTitle>
                <CardDescription>
                  Risorse e aiuto per l'accessibilità
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Guide Accessibilità</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Guida Screen Reader
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Shortcuts Tastiera
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Comandi Vocali
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Supporto Tecnico</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <HeadphonesIcon className="h-4 w-4 mr-2" />
                        Contatta Supporto
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Community Accessibilità
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Feedback Accessibilità
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
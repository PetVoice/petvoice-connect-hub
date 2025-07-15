import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Globe, 
  MapPin, 
  Heart, 
  GraduationCap,
  AlertTriangle,
  Send,
  Search,
  Filter,
  MoreVertical,
  Shield,
  UserCheck,
  Stethoscope,
  Dog,
  Cat,
  Volume2,
  VolumeX,
  Image,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Phone,
  Share2,
  Flag,
  Settings,
  Star,
  ThumbsUp,
  MessageCircle,
  BookmarkIcon,
  EyeOff,
  Ban,
  ChevronDown,
  Mic,
  MicOff,
  Languages,
  Zap,
  Crown,
  MapPinIcon,
  Siren,
  Plus,
  X,
  Bell,
  BellOff,
  Camera
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { toast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// Types
interface Channel {
  id: string;
  name: string;
  description: string;
  channel_type: 'country' | 'pet_type' | 'breed' | 'general';
  country_code?: string;
  pet_type?: 'dog' | 'cat' | 'other';
  breed?: string;
  emoji?: string;
  is_active: boolean;
}

interface Message {
  id: string;
  content?: string;
  user_id: string;
  channel_id: string;
  message_type: 'text' | 'voice' | 'image';
  is_emergency: boolean;
  file_url?: string;
  voice_duration?: number;
  metadata: any;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface LocalAlert {
  id: string;
  title: string;
  description: string;
  alert_type: 'health' | 'emergency' | 'environment' | 'outbreak';
  severity: 'info' | 'warning' | 'emergency';
  country_code: string;
  affected_species?: string[];
  verification_status: 'pending' | 'verified' | 'false_report';
  reports_count: number;
  created_at: string;
  user_profile?: {
    display_name: string;
  };
}

// Country list
const COUNTRIES = [
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'DE', name: 'Germania', flag: '🇩🇪' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'ES', name: 'Spagna', flag: '🇪🇸' },
  { code: 'GB', name: 'Regno Unito', flag: '🇬🇧' },
  { code: 'US', name: 'Stati Uniti', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', name: 'Giappone', flag: '🇯🇵' },
  { code: 'BR', name: 'Brasile', flag: '🇧🇷' }
];

// Breed lists
const DOG_BREEDS = [
  'Golden Retriever', 'Labrador', 'Pastore Tedesco', 'Bulldog Francese', 'Beagle',
  'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Siberian Husky', 'Border Collie',
  'Dalmata', 'Chihuahua', 'Dobermann', 'Cocker Spaniel', 'Jack Russell Terrier'
];

const CAT_BREEDS = [
  'Persiano', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll',
  'Bengala', 'Abissino', 'Scottish Fold', 'Sphynx', 'Russian Blue',
  'Norwegian Forest', 'Birmano', 'Orientale', 'Devon Rex', 'Munchkin'
];

const CommunityPage = () => {
  const { user } = useAuth();
  const { selectedPet } = usePets();
  
  // State management
  const [activeTab, setActiveTab] = useState<'community' | 'news'>('community');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [localAlerts, setLocalAlerts] = useState<LocalAlert[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>('IT');
  const [selectedPetType, setSelectedPetType] = useState<string>('');
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  
  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  
  // Alert dialog
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [alertType, setAlertType] = useState<'health' | 'emergency' | 'environment' | 'outbreak'>('health');
  const [alertSeverity, setAlertSeverity] = useState<'info' | 'warning' | 'emergency'>('info');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load channels
  const loadChannels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      setChannels((data as Channel[]) || []);
      
      // Set default channel
      if (data && data.length > 0 && !activeChannel) {
        setActiveChannel(data[0].id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  }, [activeChannel]);

  // Load messages for active channel
  const loadMessages = useCallback(async () => {
    if (!activeChannel) return;
    
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          user_profile:profiles(display_name, avatar_url)
        `)
        .eq('channel_id', activeChannel)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) throw error;
      
      setMessages((data as any[])?.map(item => ({
        ...item,
        user_profile: item.user_profile || { display_name: 'Utente' }
      })) || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [activeChannel]);

  // Load local alerts
  const loadLocalAlerts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('local_alerts')
        .select(`
          *,
          user_profile:profiles(display_name)
        `)
        .eq('country_code', selectedCountry)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setLocalAlerts((data as any[])?.map(item => ({
        ...item,
        user_profile: item.user_profile || { display_name: 'Utente' }
      })) || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }, [selectedCountry]);

  // Subscribe to user's channels on first load
  const subscribeToDefaultChannels = useCallback(async () => {
    if (!user) return;
    
    try {
      // Subscribe to general and emergency channels
      const generalChannels = channels.filter(c => c.channel_type === 'general');
      
      for (const channel of generalChannels) {
        await supabase
          .from('user_channel_subscriptions')
          .upsert({
            user_id: user.id,
            channel_id: channel.id,
            notifications_enabled: true
          }, {
            onConflict: 'user_id,channel_id'
          });
      }
    } catch (error) {
      console.error('Error subscribing to channels:', error);
    }
  }, [user, channels]);

  // Effects
  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    if (channels.length > 0 && user) {
      subscribeToDefaultChannels();
    }
  }, [channels, user, subscribeToDefaultChannels]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    loadLocalAlerts();
  }, [loadLocalAlerts]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !activeChannel) return;
    
    const channel = supabase
      .channel(`messages-${activeChannel}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'community_messages',
          filter: `channel_id=eq.${activeChannel}`
        },
        (payload) => {
          loadMessages();
          
          // Show notification if not own message
          if (payload.new.user_id !== user.id && notificationsEnabled) {
            toast({
              title: "Nuovo messaggio",
              description: "Hai ricevuto un nuovo messaggio nel canale"
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeChannel, notificationsEnabled, loadMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!messageText.trim() || !user || !activeChannel) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          content: messageText,
          user_id: user.id,
          channel_id: activeChannel,
          message_type: 'text',
          is_emergency: false,
          metadata: {
            pet_id: selectedPet?.id,
            timestamp: new Date().toISOString()
          }
        });
      
      if (error) throw error;
      
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      
      toast({
        title: "Registrazione avviata",
        description: "Clicca di nuovo per fermare e inviare"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Errore",
        description: "Impossibile accedere al microfono",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!user || !activeChannel) return;
    
    try {
      // Upload audio file
      const fileName = `voice_${Date.now()}.wav`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-media')
        .upload(`voice-messages/${fileName}`, audioBlob);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-media')
        .getPublicUrl(uploadData.path);
      
      // Send message
      const { error } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          channel_id: activeChannel,
          message_type: 'voice',
          file_url: publicUrl,
          voice_duration: 0, // Could calculate duration
          metadata: { timestamp: new Date().toISOString() }
        });
      
      if (error) throw error;
      
      toast({
        title: "Messaggio vocale inviato",
        description: "Il tuo messaggio vocale è stato inviato"
      });
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio vocale",
        variant: "destructive"
      });
    }
  };

  // Image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !activeChannel) return;
    
    try {
      setLoading(true);
      
      // Upload image
      const fileName = `image_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-media')
        .upload(`chat-images/${fileName}`, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-media')
        .getPublicUrl(uploadData.path);
      
      // Send message
      const { error } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          channel_id: activeChannel,
          message_type: 'image',
          file_url: publicUrl,
          metadata: { 
            filename: file.name,
            timestamp: new Date().toISOString() 
          }
        });
      
      if (error) throw error;
      
      toast({
        title: "Immagine inviata",
        description: "La tua immagine è stata condivisa"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'immagine",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create alert
  const createAlert = async () => {
    if (!user || !alertTitle.trim() || !alertDescription.trim()) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('local_alerts')
        .insert({
          user_id: user.id,
          title: alertTitle,
          description: alertDescription,
          alert_type: alertType,
          severity: alertSeverity,
          country_code: selectedCountry,
          affected_species: selectedPetType ? [selectedPetType] : [],
          metadata: { timestamp: new Date().toISOString() }
        });
      
      if (error) throw error;
      
      setShowAlertDialog(false);
      setAlertTitle('');
      setAlertDescription('');
      loadLocalAlerts();
      
      toast({
        title: "Alert creato",
        description: "Il tuo alert è stato segnalato alla community"
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare l'alert",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to channel
  const subscribeToChannel = async (channelId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_channel_subscriptions')
        .upsert({
          user_id: user.id,
          channel_id: channelId,
          notifications_enabled: true
        }, {
          onConflict: 'user_id,channel_id'
        });
      
      setActiveChannel(channelId);
    } catch (error) {
      console.error('Error subscribing to channel:', error);
    }
  };

  // Filter channels
  const filteredChannels = channels.filter(channel => {
    if (channel.channel_type === 'general') return true;
    if (channel.channel_type === 'country') {
      return !selectedCountry || channel.country_code === selectedCountry;
    }
    if (channel.channel_type === 'pet_type') {
      return !selectedPetType || channel.pet_type === selectedPetType;
    }
    if (channel.channel_type === 'breed') {
      return (!selectedPetType || channel.pet_type === selectedPetType) &&
             (!selectedBreed || channel.breed === selectedBreed);
    }
    return true;
  });

  // Get current channel info
  const currentChannel = channels.find(c => c.id === activeChannel);

  // Message Component
  const MessageComponent = ({ message }: { message: Message }) => {
    const isOwnMessage = message.user_id === user?.id;
    
    return (
      <div className={`flex gap-3 p-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.user_profile?.avatar_url} />
          <AvatarFallback>
            {message.user_profile?.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 max-w-xs ${isOwnMessage ? 'text-right' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {message.user_profile?.display_name || 'Utente'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { 
                addSuffix: true, 
                locale: it 
              })}
            </span>
          </div>
          
          <div className={`rounded-lg p-3 ${
            isOwnMessage 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted'
          }`}>
            {message.message_type === 'voice' && (
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm">Messaggio vocale</span>
                {message.file_url && (
                  <audio controls className="max-w-full">
                    <source src={message.file_url} type="audio/wav" />
                  </audio>
                )}
              </div>
            )}
            
            {message.message_type === 'image' && message.file_url && (
              <img 
                src={message.file_url} 
                alt="Immagine condivisa" 
                className="max-w-full rounded-md"
              />
            )}
            
            {message.message_type === 'text' && message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Alert Component
  const LocalAlertComponent = ({ alert }: { alert: LocalAlert }) => {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'emergency': return 'destructive';
        case 'warning': return 'secondary';
        default: return 'outline';
      }
    };
    
    const getAlertIcon = (type: string) => {
      switch (type) {
        case 'health': return <Stethoscope className="h-4 w-4" />;
        case 'emergency': return <Siren className="h-4 w-4" />;
        case 'environment': return <MapPinIcon className="h-4 w-4" />;
        case 'outbreak': return <AlertTriangle className="h-4 w-4" />;
        default: return <AlertCircle className="h-4 w-4" />;
      }
    };
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getAlertIcon(alert.alert_type)}
              <CardTitle className="text-base">{alert.title}</CardTitle>
              <Badge variant={getSeverityColor(alert.severity)}>
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
          </div>
          <CardDescription>
            {COUNTRIES.find(c => c.code === alert.country_code)?.name} • 
            <span className="ml-1">
              {formatDistanceToNow(new Date(alert.created_at), { 
                addSuffix: true, 
                locale: it 
              })}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {alert.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {alert.reports_count} segnalazioni
            </span>
            <span className="flex items-center gap-1">
              {alert.verification_status === 'verified' ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Verificato
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  In verifica
                </>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Accesso richiesto</CardTitle>
            <CardDescription>
              Devi essere registrato per accedere alla community
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Community PetVoice</h1>
            <p className="text-muted-foreground">
              Connettiti con proprietari e esperti di tutto il mondo
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Country Filter */}
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Pet Type Filter */}
            <Select value={selectedPetType} onValueChange={setSelectedPetType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutti</SelectItem>
                <SelectItem value="dog">🐕 Cani</SelectItem>
                <SelectItem value="cat">🐱 Gatti</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Breed Filter */}
            {selectedPetType && (
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Razza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutte</SelectItem>
                  {(selectedPetType === 'dog' ? DOG_BREEDS : CAT_BREEDS).map(breed => (
                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Settings */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Impostazioni Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notifiche push</Label>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound">Suoni notifiche</Label>
                    <Switch
                      id="sound"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="translation">Traduzione automatica</Label>
                    <Switch
                      id="translation"
                      checked={translationEnabled}
                      onCheckedChange={setTranslationEnabled}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Channels */}
        <div className="w-64 border-r bg-muted/50 p-4 overflow-y-auto">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Canali
            </div>
            {filteredChannels.map((channel) => (
              <Button
                key={channel.id}
                variant={activeChannel === channel.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => subscribeToChannel(channel.id)}
              >
                <span className="text-sm">{channel.emoji} {channel.name}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Main Chat/News Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4">
              <TabsTrigger value="community" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Community
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                News & Alert
              </TabsTrigger>
            </TabsList>
            
            {/* Community Tab */}
            <TabsContent value="community" className="flex-1 flex flex-col m-0">
              {/* Channel Header */}
              <div className="border-b p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">
                      {currentChannel?.name || 'Seleziona un canale'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentChannel?.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Languages className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageComponent key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <div className="border-t p-4 bg-card">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-background border rounded-lg p-2">
                    <Input
                      placeholder={`Scrivi in ${currentChannel?.name || 'questo canale'}...`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      className="border-0 bg-transparent focus-visible:ring-0"
                      disabled={!activeChannel}
                    />
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={isRecording ? 'text-red-500' : ''}
                        disabled={!activeChannel}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!activeChannel}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={sendMessage} 
                    disabled={!messageText.trim() || loading || !activeChannel}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* News & Alerts Tab */}
            <TabsContent value="news" className="flex-1 flex flex-col m-0">
              {/* News Header */}
              <div className="border-b p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">News & Alert Locali</h2>
                    <p className="text-sm text-muted-foreground">
                      Informazioni sanitarie per {COUNTRIES.find(c => c.code === selectedCountry)?.name}
                    </p>
                  </div>
                  
                  <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                    <DialogTrigger asChild>
                      <Button variant="default">
                        <Plus className="h-4 w-4 mr-2" />
                        Segnala Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crea nuovo alert</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="alert-type">Tipo di alert</Label>
                          <Select value={alertType} onValueChange={(v: any) => setAlertType(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="health">🏥 Salute</SelectItem>
                              <SelectItem value="emergency">🆘 Emergenza</SelectItem>
                              <SelectItem value="environment">🌍 Ambiente</SelectItem>
                              <SelectItem value="outbreak">⚠️ Epidemia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="alert-severity">Gravità</Label>
                          <Select value={alertSeverity} onValueChange={(v: any) => setAlertSeverity(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">ℹ️ Informazione</SelectItem>
                              <SelectItem value="warning">⚠️ Attenzione</SelectItem>
                              <SelectItem value="emergency">🚨 Emergenza</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="alert-title">Titolo</Label>
                          <Input
                            id="alert-title"
                            value={alertTitle}
                            onChange={(e) => setAlertTitle(e.target.value)}
                            placeholder="Titolo dell'alert"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="alert-description">Descrizione</Label>
                          <Textarea
                            id="alert-description"
                            value={alertDescription}
                            onChange={(e) => setAlertDescription(e.target.value)}
                            placeholder="Descrivi dettagliatamente la situazione"
                            rows={4}
                          />
                        </div>
                        
                        <Button 
                          onClick={createAlert} 
                          disabled={loading || !alertTitle.trim() || !alertDescription.trim()}
                          className="w-full"
                        >
                          Crea Alert
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {/* Alerts List */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {localAlerts.map((alert) => (
                    <LocalAlertComponent key={alert.id} alert={alert} />
                  ))}
                  
                  {localAlerts.length === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Nessun alert per la tua zona
                      </h3>
                      <p className="text-muted-foreground">
                        Al momento non ci sono segnalazioni per {COUNTRIES.find(c => c.code === selectedCountry)?.name}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
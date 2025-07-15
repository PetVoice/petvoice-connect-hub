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
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { toast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// Interfaces
interface Message {
  id: string;
  content: string;
  user_id: string;
  channel: string;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
    expertise_badges?: string[];
  };
  translations?: Record<string, string>;
  message_type: 'text' | 'voice' | 'image';
  is_emergency?: boolean;
  metadata?: any;
}

interface LocalAlert {
  id: string;
  title: string;
  description: string;
  alert_type: 'health' | 'emergency' | 'environment' | 'outbreak';
  severity: 'info' | 'warning' | 'emergency';
  location: {
    city: string;
    region: string;
    coordinates?: [number, number];
  };
  created_at: string;
  verified_by?: string;
  verification_status: 'pending' | 'verified' | 'false_report';
  affected_species?: string[];
  reports_count: number;
  metadata?: any;
}

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  expertise_badges?: string[];
  reputation_score: number;
  verified_professional: boolean;
  specialization?: string;
  location?: string;
}

// Channel Configuration
const CHANNELS = {
  general: { name: '🌍 Generale', description: 'Discussioni globali' },
  local_milano: { name: '🏠 Milano', description: 'Comunità locale Milano' },
  local_roma: { name: '🏠 Roma', description: 'Comunità locale Roma' },
  breed_golden: { name: '🐕 Golden Retriever', description: 'Gruppo specifico razza' },
  breed_siamese: { name: '🐱 Siamese', description: 'Gruppo specifico razza' },
  health: { name: '🏥 Salute', description: 'Discussioni mediche' },
  training: { name: '🎓 Addestramento', description: 'Consigli comportamentali' },
  emergency: { name: '🆘 Emergenze', description: 'Supporto crisi 24/7' },
};

const CommunityPage = () => {
  const { user } = useAuth();
  const { selectedPet } = usePets();
  
  // State management
  const [activeTab, setActiveTab] = useState<'community' | 'news'>('community');
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [localAlerts, setLocalAlerts] = useState<LocalAlert[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('it');
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<string>('Milano');
  const [loading, setLoading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  
  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('community-messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Send message
  const sendMessage = async () => {
    if (!messageText.trim() || !user) return;
    
    try {
      const messageData = {
        content: messageText,
        user_id: user.id,
        channel: activeChannel,
        message_type: 'text' as const,
        is_emergency: activeChannel === 'emergency',
        metadata: {
          pet_id: selectedPet?.id,
          location: userLocation,
          timestamp: new Date().toISOString()
        }
      };
      
      // In a real app, this would insert into a community_messages table
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        ...messageData,
        created_at: new Date().toISOString(),
        user_profile: {
          display_name: user.email?.split('@')[0] || 'Utente',
          expertise_badges: []
        }
      }]);
      
      setMessageText('');
      toast({
        title: "Messaggio inviato",
        description: "Il tuo messaggio è stato pubblicato nella community"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive"
      });
    }
  };
  
  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      setIsRecording(true);
      
      mediaRecorder.current.start();
      toast({
        title: "Registrazione avviata",
        description: "Parla per registrare un messaggio vocale"
      });
    } catch (error) {
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
      toast({
        title: "Registrazione completata",
        description: "Messaggio vocale inviato"
      });
    }
  };
  
  // Create local alert
  const createLocalAlert = async (alertData: Partial<LocalAlert>) => {
    if (!user) return;
    
    try {
      const newAlert: LocalAlert = {
        id: Math.random().toString(),
        title: alertData.title || '',
        description: alertData.description || '',
        alert_type: alertData.alert_type || 'health',
        severity: alertData.severity || 'info',
        location: {
          city: userLocation,
          region: 'Lombardia'
        },
        created_at: new Date().toISOString(),
        verification_status: 'pending',
        reports_count: 1,
        affected_species: alertData.affected_species || []
      };
      
      setLocalAlerts(prev => [newAlert, ...prev]);
      
      toast({
        title: "Alert creato",
        description: "Il tuo alert è stato segnalato alla community locale"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare l'alert",
        variant: "destructive"
      });
    }
  };
  
  // Channel List Component
  const ChannelList = () => (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
        Canali
      </div>
      {Object.entries(CHANNELS).map(([key, channel]) => (
        <Button
          key={key}
          variant={activeChannel === key ? "secondary" : "ghost"}
          className="w-full justify-start text-left"
          onClick={() => setActiveChannel(key)}
        >
          <span className="text-sm">{channel.name}</span>
          {key === 'emergency' && (
            <Badge variant="destructive" className="ml-auto text-xs">
              24/7
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
  
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
        
        <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {message.user_profile?.display_name}
            </span>
            {message.user_profile?.expertise_badges?.map((badge) => (
              <Badge key={badge} variant="outline" className="text-xs">
                {badge === 'veterinarian' && <Stethoscope className="h-3 w-3 mr-1" />}
                {badge === 'trainer' && <GraduationCap className="h-3 w-3 mr-1" />}
                {badge}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { 
                addSuffix: true, 
                locale: it 
              })}
            </span>
          </div>
          
          <div className={`rounded-lg p-3 max-w-xs ${
            isOwnMessage 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted'
          }`}>
            {message.is_emergency && (
              <div className="flex items-center gap-1 mb-2 text-destructive">
                <Siren className="h-4 w-4" />
                <span className="text-xs font-medium">EMERGENZA</span>
              </div>
            )}
            
            {message.message_type === 'voice' ? (
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm">Messaggio vocale</span>
              </div>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
            
            {translationEnabled && message.translations?.[currentLanguage] && (
              <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                <div className="flex items-center gap-1 mb-1">
                  <Languages className="h-3 w-3" />
                  <span className="text-xs opacity-70">Traduzione</span>
                </div>
                <p className="text-sm opacity-90">
                  {message.translations[currentLanguage]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Local Alert Component
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
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {alert.location.city}, {alert.location.region} • 
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
          
          {alert.affected_species && alert.affected_species.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {alert.affected_species.map((species) => (
                <Badge key={species} variant="outline" className="text-xs">
                  {species === 'dog' && <Dog className="h-3 w-3 mr-1" />}
                  {species === 'cat' && <Cat className="h-3 w-3 mr-1" />}
                  {species}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
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
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
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
            <Select value={userLocation} onValueChange={setUserLocation}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Milano">Milano</SelectItem>
                <SelectItem value="Roma">Roma</SelectItem>
                <SelectItem value="Napoli">Napoli</SelectItem>
                <SelectItem value="Torino">Torino</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Channels */}
        <div className="w-64 border-r bg-muted/50 p-4 overflow-y-auto">
          <ChannelList />
          
          <Separator className="my-4" />
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Azioni Rapide
            </div>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Cerca messaggi
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Trova esperti
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Siren className="h-4 w-4 mr-2" />
              Segnala alert
            </Button>
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
                      {CHANNELS[activeChannel as keyof typeof CHANNELS]?.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {CHANNELS[activeChannel as keyof typeof CHANNELS]?.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Languages className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages
                    .filter(msg => msg.channel === activeChannel)
                    .map((message) => (
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
                      placeholder={`Scrivi in ${CHANNELS[activeChannel as keyof typeof CHANNELS]?.name}...`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="border-0 bg-transparent focus-visible:ring-0"
                    />
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        className={isRecording ? 'text-red-500' : ''}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button onClick={sendMessage} disabled={!messageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {activeChannel === 'emergency' && (
                  <Alert className="mt-2">
                    <Siren className="h-4 w-4" />
                    <AlertDescription>
                      Canale emergenze 24/7. Per emergenze reali contatta immediatamente il veterinario.
                    </AlertDescription>
                  </Alert>
                )}
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
                      Informazioni sanitarie territoriali per {userLocation}
                    </p>
                  </div>
                  
                  <Button 
                    variant="default"
                    onClick={() => createLocalAlert({
                      title: 'Nuovo Alert',
                      description: 'Descrizione dell\'alert',
                      alert_type: 'health',
                      severity: 'warning'
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Segnala Alert
                  </Button>
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
                        Al momento non ci sono segnalazioni per {userLocation}
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
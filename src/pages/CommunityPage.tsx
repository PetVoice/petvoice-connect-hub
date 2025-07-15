import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { SearchableSelect } from '@/components/SearchableSelect';
import { UniformSelect } from '@/components/UniformSelect';
import { MessageInput } from '@/components/MessageInput';
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

// Complete country list
const COUNTRIES = [
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'DE', name: 'Germania', flag: '🇩🇪' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'ES', name: 'Spagna', flag: '🇪🇸' },
  { code: 'GB', name: 'Regno Unito', flag: '🇬🇧' },
  { code: 'US', name: 'Stati Uniti', flag: '🇺🇸' }
];

const DOG_BREEDS = [
  'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Alaskan Malamute', 'American Bulldog',
  'American Cocker Spaniel', 'American Pit Bull Terrier', 'American Staffordshire Terrier',
  'Basenji', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Bernese Mountain Dog',
  'Bichon Frise', 'Bloodhound', 'Border Collie', 'Border Terrier', 'Boston Terrier',
  'Boxer', 'Brittany', 'Bulldog', 'Bulldog Francese', 'Bull Terrier', 'Cairn Terrier',
  'Cane Corso', 'Cavalier King Charles Spaniel', 'Chihuahua', 'Chinese Crested',
  'Chow Chow', 'Cocker Spaniel', 'Collie', 'Dachshund', 'Dalmatian', 'Doberman Pinscher',
  'English Bulldog', 'English Setter', 'Fox Terrier', 'German Shepherd', 'Golden Retriever',
  'Great Dane', 'Greyhound', 'Havanese', 'Irish Setter', 'Jack Russell Terrier',
  'Labrador Retriever', 'Maltese', 'Mastiff', 'Miniature Schnauzer', 'Neapolitan Mastiff',
  'Newfoundland', 'Pastore Tedesco', 'Pomeranian', 'Poodle', 'Pug', 'Rottweiler',
  'Saint Bernard', 'Samoyed', 'Schnauzer', 'Scottish Terrier', 'Shar Pei',
  'Shih Tzu', 'Siberian Husky', 'Staffordshire Bull Terrier', 'Weimaraner',
  'West Highland White Terrier', 'Whippet', 'Yorkshire Terrier'
];

const CAT_BREEDS = [
  'Abissino', 'American Curl', 'American Shorthair', 'Angora Turco', 'Balinese',
  'Bengala', 'Birmano', 'Bombay', 'British Longhair', 'British Shorthair',
  'Burmese', 'California Spangled', 'Certosino', 'Cornish Rex', 'Devon Rex',
  'Egyptian Mau', 'Europeo', 'Exotic Shorthair', 'Himalayan', 'Japanese Bobtail',
  'Korat', 'LaPerm', 'Maine Coon', 'Manx', 'Munchkin', 'Nebelung',
  'Norwegian Forest Cat', 'Ocicat', 'Oriental', 'Persiano', 'Peterbald',
  'Ragamuffin', 'Ragdoll', 'Russian Blue', 'Savannah', 'Scottish Fold',
  'Selkirk Rex', 'Siamese', 'Singapura', 'Snowshoe', 'Somali', 'Sphynx',
  'Tonkinese', 'Turkish Van'
];

const CommunityPage = () => {
  const { user } = useAuth();
  const { selectedPet } = usePets();
  
  // State management
  const [activeTab, setActiveTab] = useState<'community' | 'news'>('community');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [localAlerts, setLocalAlerts] = useState<LocalAlert[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filters with dynamic channel generation
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedPetType, setSelectedPetType] = useState<string>('');
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [availableChannels, setAvailableChannels] = useState<any[]>([]);
  const [breedOptions, setBreedOptions] = useState<string[]>([]);
  
  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  // Genera UUID deterministico per i canali
  const generateChannelUUID = useCallback((channelKey: string) => {
    let hash = 0;
    for (let i = 0; i < channelKey.length; i++) {
      const char = channelKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hashStr.substring(0, 8)}-${hashStr.substring(0, 4)}-${hashStr.substring(0, 4)}-${hashStr.substring(0, 4)}-${hashStr.substring(0, 12)}`;
  }, []);

  // Get breeds by animal type
  const getBreedsByAnimalType = useCallback((animalType: string) => {
    const breeds = {
      'dog': DOG_BREEDS,
      'cat': CAT_BREEDS,
      'all': [],
      '': []
    };
    return breeds[animalType as keyof typeof breeds] || [];
  }, []);

  // Generate dynamic channels based on selection
  const generateChannels = useCallback((country: string | null, animalType: string, breed: string) => {
    const channels = [];
    
    if (country) {
      const countryData = COUNTRIES.find(c => c.code === country);
      if (countryData) {
        // Canale generico paese
        channels.push({
          id: `${country.toLowerCase()}-general`,
          name: `${countryData.name} (Generico)`,
          type: 'general',
          country: country,
          flag: countryData.flag,
          description: `Canale generale per ${countryData.name}`
        });
        
        // Canale specifico
        if (animalType && animalType !== 'all' && animalType !== '' && breed && breed !== '') {
          const animalEmoji = animalType === 'dog' ? '🐕' : animalType === 'cat' ? '🐱' : '🐾';
          const animalName = animalType === 'dog' ? 'Cani' : animalType === 'cat' ? 'Gatti' : 'Animali';
          
          channels.push({
            id: `${country.toLowerCase()}-${animalType.toLowerCase()}-${breed.toLowerCase().replace(/\s+/g, '-')}`,
            name: `${countryData.name} → ${animalName} → ${breed}`,
            type: 'specific',
            country: country,
            animalType: animalType,
            breed: breed,
            flag: countryData.flag,
            description: `Canale specifico per ${breed} in ${countryData.name}`
          });
        }
      }
    }
    
    return channels;
  }, []);

  // Load channels (placeholder)
  const loadChannels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setChannels((data as Channel[]) || []);
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  }, []);

  // Load user subscriptions
  const loadUserSubscriptions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_channel_subscriptions')
        .select('channel_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setSubscribedChannels(data?.map(sub => sub.channel_id) || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  }, [user]);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!activeChannel) return;
    
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          user_id,
          channel_id,
          message_type,
          is_emergency,
          file_url,
          voice_duration,
          metadata,
          created_at,
          updated_at,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('channel_id', activeChannel)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages((data as Message[]) || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [activeChannel]);

  // Handle country change
  const handleCountryChange = useCallback((countryCode: string) => {
    setSelectedCountry(countryCode);
    setActiveChannel(null);
  }, []);

  // Handle pet type change
  const handlePetTypeChange = useCallback((petType: string) => {
    setSelectedPetType(petType);
    setSelectedBreed('');
    setActiveChannel(null);
  }, []);

  // Handle breed change
  const handleBreedChange = useCallback((breed: string) => {
    setSelectedBreed(breed);
    setActiveChannel(null);
  }, []);

  // Subscribe to channel
  const subscribeToChannel = useCallback(async (channelId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_channel_subscriptions')
        .upsert({
          user_id: user.id,
          channel_id: channelId,
          notifications_enabled: true
        });
      
      setActiveChannel(channelId);
      await loadUserSubscriptions();
      
      toast({
        title: "Iscrizione completata",
        description: "Ora puoi chattare in questo canale!"
      });
    } catch (error) {
      console.error('Error subscribing to channel:', error);
    }
  }, [user, loadUserSubscriptions]);

  // Unsubscribe from channel
  const unsubscribeFromChannel = useCallback(async (channelId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_channel_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('channel_id', channelId);
      
      if (activeChannel === channelId) {
        setActiveChannel(null);
      }
      
      await loadUserSubscriptions();
      
      toast({
        title: "Disiscrizione completata",
        description: "Hai lasciato il canale"
      });
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
    }
  }, [user, activeChannel, loadUserSubscriptions]);

  // Message sent callback
  const handleMessageSent = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  // Effects
  useEffect(() => {
    if (user) {
      loadUserSubscriptions();
    }
  }, [user, loadUserSubscriptions]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Aggiorna canali disponibili quando cambia qualsiasi filtro
  useEffect(() => {
    const newChannels = generateChannels(selectedCountry, selectedPetType, selectedBreed);
    setAvailableChannels(newChannels);
  }, [selectedCountry, selectedPetType, selectedBreed, generateChannels]);

  // Aggiorna razze disponibili quando cambia tipo animale
  useEffect(() => {
    if (selectedPetType && selectedPetType !== 'all' && selectedPetType !== '') {
      const availableBreeds = getBreedsByAnimalType(selectedPetType);
      setBreedOptions(availableBreeds);
    } else {
      setBreedOptions([]);
    }
    setSelectedBreed('');
  }, [selectedPetType, getBreedsByAnimalType]);

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
            <SearchableSelect
              value={selectedCountry || ''}
              onValueChange={handleCountryChange}
              placeholder="Paese"
              searchPlaceholder="Cerca paese..."
              className="w-40"
              options={COUNTRIES.map(country => ({
                value: country.code,
                label: country.name,
                flag: country.flag
              }))}
            />
            
            {/* Pet Type Filter */}
            <SearchableSelect
              value={selectedPetType || ''}
              onValueChange={handlePetTypeChange}
              placeholder="Tutti"
              searchPlaceholder="Cerca tipo..."
              className="w-32"
              options={[
                { value: 'all', label: 'Tutti', flag: '🐾' },
                { value: 'dog', label: 'Cani', flag: '🐕' },
                { value: 'cat', label: 'Gatti', flag: '🐱' }
              ]}
            />
            
            {/* Breed Filter */}
            {selectedPetType && selectedPetType !== 'all' && selectedPetType !== '' && breedOptions.length > 0 && (
              <SearchableSelect
                value={selectedBreed || ''}
                onValueChange={handleBreedChange}
                placeholder="Razza"
                searchPlaceholder="Cerca razza..."
                className="w-40"
                options={breedOptions.map(breed => ({
                  value: breed,
                  label: breed,
                  flag: selectedPetType === 'dog' ? '🐕' : '🐱'
                }))}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/50 flex flex-col">
          <div className="p-4 border-b">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Canali Disponibili
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {availableChannels.length > 0 ? (
                availableChannels.map((channel) => {
                  const isJoined = subscribedChannels.includes(channel.id);
                  const isActive = activeChannel === channel.id;
                  
                  return (
                    <div
                      key={channel.id}
                      className={`bg-card border rounded-lg p-3 ${
                        isActive ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{channel.flag}</span>
                          <div>
                            <div className="text-sm font-medium">{channel.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {channel.type === 'general' ? 'Generico' : 'Specifico'}
                            </div>
                          </div>
                        </div>
                        
                        {isJoined ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={isActive ? "default" : "outline"}
                              onClick={() => setActiveChannel(channel.id)}
                            >
                              {isActive ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Attivo
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Apri
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => unsubscribeFromChannel(channel.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => subscribeToChannel(channel.id)}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Entra
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {channel.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Nessun canale disponibile
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Seleziona Paese, Tipo Animale e Razza per vedere i canali disponibili
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {activeChannel ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-lg">
                      {availableChannels.find(c => c.id === activeChannel)?.flag}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {availableChannels.find(c => c.id === activeChannel)?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {availableChannels.find(c => c.id === activeChannel)?.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {messages.length} messaggi
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveChannel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={message.user_profile?.avatar_url} />
                      <AvatarFallback>
                        {message.user_profile?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
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
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <MessageInput
                channelId={activeChannel}
                channelName={availableChannels.find(c => c.id === activeChannel)?.name || 'Canale'}
                onMessageSent={handleMessageSent}
                disabled={loading}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Seleziona un canale
                </h3>
                <p className="text-muted-foreground">
                  Scegli un canale dalla barra laterale per iniziare a chattare
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
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
  flag?: string;
  type?: string;
  country?: string;
  animalType?: string;
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
  updated_at: string;
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
  { code: 'US', name: 'Stati Uniti', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BR', name: 'Brasile', flag: '🇧🇷' },
  { code: 'JP', name: 'Giappone', flag: '🇯🇵' },
  { code: 'KR', name: 'Corea del Sud', flag: '🇰🇷' },
  { code: 'CN', name: 'Cina', flag: '🇨🇳' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'MX', name: 'Messico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Cile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Perù', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'NL', name: 'Paesi Bassi', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgio', flag: '🇧🇪' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Svizzera', flag: '🇨🇭' },
  { code: 'SE', name: 'Svezia', flag: '🇸🇪' },
  { code: 'NO', name: 'Norvegia', flag: '🇳🇴' },
  { code: 'DK', name: 'Danimarca', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlandia', flag: '🇫🇮' },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱' },
  { code: 'CZ', name: 'Repubblica Ceca', flag: '🇨🇿' },
  { code: 'HU', name: 'Ungheria', flag: '🇭🇺' },
  { code: 'SK', name: 'Slovacchia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'HR', name: 'Croazia', flag: '🇭🇷' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷' },
  { code: 'TR', name: 'Turchia', flag: '🇹🇷' },
  { code: 'EG', name: 'Egitto', flag: '🇪🇬' },
  { code: 'ZA', name: 'Sudafrica', flag: '🇿🇦' },
  { code: 'MA', name: 'Marocco', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ET', name: 'Etiopia', flag: '🇪🇹' },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'MY', name: 'Malesia', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Filippine', flag: '🇵🇭' },
  { code: 'NZ', name: 'Nuova Zelanda', flag: '🇳🇿' },
  { code: 'PT', name: 'Portogallo', flag: '🇵🇹' },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'IS', name: 'Islanda', flag: '🇮🇸' },
  { code: 'LU', name: 'Lussemburgo', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'CY', name: 'Cipro', flag: '🇨🇾' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'VA', name: 'Vaticano', flag: '🇻🇦' }
];

const DOG_BREEDS = [
  'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Akbash', 'Akita', 'Alaskan Klee Kai',
  'Alaskan Malamute', 'American Bulldog', 'American Cocker Spaniel', 'American Eskimo Dog',
  'American Foxhound', 'American Pit Bull Terrier', 'American Staffordshire Terrier', 'American Water Spaniel',
  'Anatolian Shepherd', 'Australian Cattle Dog', 'Australian Kelpie', 'Australian Shepherd', 'Australian Terrier',
  'Basenji', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Bedlington Terrier', 'Belgian Malinois',
  'Belgian Sheepdog', 'Belgian Tervuren', 'Bernese Mountain Dog', 'Bichon Frise', 'Black and Tan Coonhound',
  'Black Russian Terrier', 'Bloodhound', 'Blue Heeler', 'Bluetick Coonhound', 'Boerboel', 'Border Collie',
  'Border Terrier', 'Borzoi', 'Boston Terrier', 'Bouvier des Flandres', 'Boxer', 'Boykin Spaniel',
  'Bracco Italiano', 'Brittany', 'Brussels Griffon', 'Bull Terrier', 'Bulldog', 'Bulldog Francese',
  'Bullmastiff', 'Cairn Terrier', 'Canaan Dog', 'Cane Corso', 'Cardigan Welsh Corgi', 'Catahoula Leopard Dog',
  'Cavalier King Charles Spaniel', 'Chesapeake Bay Retriever', 'Chihuahua', 'Chinese Crested', 'Chinese Shar-Pei',
  'Chow Chow', 'Clumber Spaniel', 'Cocker Spaniel', 'Collie', 'Coonhound', 'Coton de Tulear',
  'Curly-Coated Retriever', 'Dachshund', 'Dalmatian', 'Dandie Dinmont Terrier', 'Doberman Pinscher',
  'Dogue de Bordeaux', 'Dutch Shepherd', 'English Bulldog', 'English Cocker Spaniel', 'English Foxhound',
  'English Mastiff', 'English Setter', 'English Springer Spaniel', 'English Toy Spaniel', 'Entlebucher Mountain Dog',
  'Field Spaniel', 'Finnish Lapphund', 'Finnish Spitz', 'Flat-Coated Retriever', 'Fox Terrier', 'French Bulldog',
  'German Pinscher', 'German Shepherd', 'German Shorthaired Pointer', 'German Wirehaired Pointer', 'Giant Schnauzer',
  'Glen of Imaal Terrier', 'Golden Retriever', 'Gordon Setter', 'Great Dane', 'Great Pyrenees',
  'Greater Swiss Mountain Dog', 'Greyhound', 'Harrier', 'Havanese', 'Ibizan Hound', 'Icelandic Sheepdog',
  'Irish Red and White Setter', 'Irish Setter', 'Irish Terrier', 'Irish Water Spaniel', 'Irish Wolfhound',
  'Italian Greyhound', 'Jack Russell Terrier', 'Japanese Chin', 'Japanese Spitz', 'Keeshond', 'Kerry Blue Terrier',
  'Komondor', 'Kuvasz', 'Labrador Retriever', 'Lagotto Romagnolo', 'Lakeland Terrier', 'Lancashire Heeler',
  'Large Munsterlander', 'Leonberger', 'Lhasa Apso', 'Lowchen', 'Maltese', 'Manchester Terrier',
  'Maremma Sheepdog', 'Mastiff', 'Miniature Bull Terrier', 'Miniature Pinscher', 'Miniature Schnauzer',
  'Neapolitan Mastiff', 'Newfoundland', 'Norfolk Terrier', 'Norwegian Buhund', 'Norwegian Elkhound',
  'Norwich Terrier', 'Nova Scotia Duck Tolling Retriever', 'Old English Sheepdog', 'Otterhound', 'Papillon',
  'Parson Russell Terrier', 'Pastore Tedesco', 'Pekingese', 'Pembroke Welsh Corgi', 'Petit Basset Griffon Vendeen',
  'Pharaoh Hound', 'Plott', 'Pointer', 'Polish Lowland Sheepdog', 'Pomeranian', 'Poodle', 'Portuguese Water Dog',
  'Pug', 'Puli', 'Pyrenean Shepherd', 'Redbone Coonhound', 'Rhodesian Ridgeback', 'Rottweiler', 'Rough Collie',
  'Saint Bernard', 'Saluki', 'Samoyed', 'Schipperke', 'Schnauzer', 'Scottish Deerhound', 'Scottish Terrier',
  'Sealyham Terrier', 'Shar Pei', 'Shetland Sheepdog', 'Shiba Inu', 'Shih Tzu', 'Siberian Husky',
  'Silky Terrier', 'Skye Terrier', 'Smooth Collie', 'Smooth Fox Terrier', 'Soft Coated Wheaten Terrier',
  'Spinone Italiano', 'Staffordshire Bull Terrier', 'Standard Schnauzer', 'Sussex Spaniel', 'Swedish Vallhund',
  'Tibetan Mastiff', 'Tibetan Spaniel', 'Tibetan Terrier', 'Toy Fox Terrier', 'Treeing Walker Coonhound',
  'Vizsla', 'Weimaraner', 'Welsh Springer Spaniel', 'Welsh Terrier', 'West Highland White Terrier',
  'Whippet', 'Wire Fox Terrier', 'Wirehaired Pointing Griffon', 'Xoloitzcuintli', 'Yorkshire Terrier'
];

const CAT_BREEDS = [
  'Abissino', 'American Bobtail', 'American Curl', 'American Shorthair', 'American Wirehair',
  'Angora Turco', 'Balinese', 'Bambino', 'Bengala', 'Birman', 'Birmano', 'Bombay',
  'British Longhair', 'British Shorthair', 'Burmese', 'Burmilla', 'California Spangled',
  'Certosino', 'Chartreux', 'Chausie', 'Cornish Rex', 'Cymric', 'Devon Rex',
  'Donskoy', 'Dragon Li', 'Egyptian Mau', 'Europeo', 'Exotic Shorthair', 'Havana Brown',
  'Himalayan', 'Japanese Bobtail', 'Javanese', 'Khao Manee', 'Korat', 'Kurilian Bobtail',
  'LaPerm', 'Maine Coon', 'Manx', 'Mau Egiziano', 'Munchkin', 'Nebelung',
  'Norwegian Forest Cat', 'Ocicat', 'Oriental', 'Oriental Longhair', 'Oriental Shorthair',
  'Persiano', 'Peterbald', 'Pixie-bob', 'Ragamuffin', 'Ragdoll', 'Russian Blue',
  'Savannah', 'Scottish Fold', 'Selkirk Rex', 'Siamese', 'Siberian', 'Singapura',
  'Snowshoe', 'Sokoke', 'Somali', 'Sphynx', 'Tonkinese', 'Toyger', 'Turkish Angora',
  'Turkish Van', 'Ukrainian Levkoy'
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
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedPetType, setSelectedPetType] = useState<string>('');
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [breedOptions, setBreedOptions] = useState<string[]>([]);
  
  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Filter channels based on selection
  const getFilteredChannels = useCallback(() => {
    let filtered = channels;
    
    // Filter by country
    if (selectedCountry) {
      filtered = filtered.filter(channel => 
        channel.country_code === selectedCountry || 
        channel.channel_type === 'country' && channel.country_code === selectedCountry
      );
    }
    
    // Filter by pet type
    if (selectedPetType && selectedPetType !== 'all' && selectedPetType !== '') {
      filtered = filtered.filter(channel => 
        channel.pet_type === selectedPetType || 
        channel.channel_type === 'pet_type' && channel.pet_type === selectedPetType
      );
    }
    
    // Filter by breed
    if (selectedBreed && selectedBreed !== '') {
      filtered = filtered.filter(channel => 
        channel.breed === selectedBreed || 
        channel.channel_type === 'breed' && channel.breed === selectedBreed
      );
    }
    
    return filtered;
  }, [channels, selectedCountry, selectedPetType, selectedBreed]);

  // Load channels from database
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
      
      // Use real channel IDs from database
      const subscribedChannelIds = data?.map(sub => sub.channel_id) || [];
      setSubscribedChannels(subscribedChannelIds);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  }, [user]);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!activeChannel) return;
    
    try {
      const { data: messagesData, error: messagesError } = await supabase
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
          updated_at
        `)
        .eq('channel_id', activeChannel)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;

      // Load user profiles for messages
      const userIds = [...new Set(messagesData?.map(msg => msg.user_id) || [])];
      let profilesData = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        profilesData = profiles || [];
      }

      // Combine messages with profiles
      const messagesWithProfiles = messagesData?.map(message => ({
        ...message,
        message_type: message.message_type as 'text' | 'voice' | 'image',
        user_profile: profilesData.find(p => p.user_id === message.user_id)
      })) || [];

      setMessages(messagesWithProfiles as Message[]);
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
      // Check if user is already subscribed
      const { data: existingSubscription } = await supabase
        .from('user_channel_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .maybeSingle();
      
      if (existingSubscription) {
        setActiveChannel(channelId);
        await loadUserSubscriptions();
        toast({
          title: "Già iscritto",
          description: "Sei già iscritto a questo canale!"
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_channel_subscriptions')
        .insert({
          user_id: user.id,
          channel_id: channelId,
          notifications_enabled: true
        });
      
      if (error) throw error;
      
      setActiveChannel(channelId);
      await loadUserSubscriptions();
      
      toast({
        title: "Iscrizione completata",
        description: "Ora puoi chattare in questo canale!"
      });
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      toast({
        title: "Errore",
        description: "Impossibile iscriversi al canale",
        variant: "destructive"
      });
    }
  }, [user, loadUserSubscriptions]);

  // Unsubscribe from channel
  const unsubscribeFromChannel = useCallback(async (channelId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_channel_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('channel_id', channelId);
      
      if (error) throw error;
      
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
      toast({
        title: "Errore",
        description: "Impossibile lasciare il canale",
        variant: "destructive"
      });
    }
  }, [user, activeChannel, loadUserSubscriptions]);

  // Message sent callback
  const handleMessageSent = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  // Effects
  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    if (user && channels.length > 0) {
      loadUserSubscriptions();
    }
  }, [user, channels, loadUserSubscriptions]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Update available breeds when animal type changes
  useEffect(() => {
    if (selectedPetType && selectedPetType !== 'all' && selectedPetType !== '') {
      const availableBreeds = getBreedsByAnimalType(selectedPetType);
      setBreedOptions(availableBreeds);
    } else {
      setBreedOptions([]);
    }
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

  const filteredChannels = getFilteredChannels();
  const subscribedChannelsList = filteredChannels.filter(channel => subscribedChannels.includes(channel.id));
  
  // Show only the specific channel that matches the exact filters
  const getSpecificChannel = () => {
    if (!selectedCountry) return [];
    
    return filteredChannels.filter(channel => {
      const matchesCountry = channel.country_code === selectedCountry;
      const matchesPetType = !selectedPetType || selectedPetType === 'all' || channel.pet_type === selectedPetType;
      const matchesBreed = !selectedBreed || channel.breed === selectedBreed;
      
      return matchesCountry && matchesPetType && matchesBreed && !subscribedChannels.includes(channel.id);
    }).slice(0, 1); // Only show the first matching channel
  };
  
  const unsubscribedChannelsList = getSpecificChannel();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header with filters */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Community PetVoice</h1>
            <p className="text-muted-foreground">
              Connettiti con proprietari e esperti di tutto il mondo
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCountry || ""} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Seleziona paese" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Dog className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedPetType} onValueChange={handlePetTypeChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Animale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="dog">🐕 Cani</SelectItem>
                <SelectItem value="cat">🐱 Gatti</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedPetType && selectedPetType !== 'all' && selectedPetType !== '' && (
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedBreed} onValueChange={handleBreedChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Seleziona razza" />
                </SelectTrigger>
                <SelectContent>
                  {breedOptions.map(breed => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/50 flex flex-col">
          <ScrollArea className="flex-1">
            {/* I tuoi canali */}
            {subscribedChannelsList.length > 0 && (
              <div className="border-b">
                <div className="p-4 border-b">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    I tuoi canali
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {subscribedChannelsList.map((channel) => {
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
                            <span className="text-lg">{channel.emoji || channel.flag || '🌐'}</span>
                            <div>
                              <div className="text-sm font-medium">{channel.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {channel.type || channel.channel_type}
                              </div>
                            </div>
                          </div>
                          
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
                              title="Esci dal canale"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Canali disponibili */}
            <div>
              <div className="p-4 border-b">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Canali disponibili
                </div>
              </div>
              <div className="p-4 space-y-3">
                {unsubscribedChannelsList.length > 0 ? (
                  unsubscribedChannelsList.map((channel) => {
                    return (
                      <div
                        key={channel.id}
                        className="bg-card border rounded-lg p-3 border-muted"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{channel.emoji || channel.flag || '🌐'}</span>
                            <div>
                              <div className="text-sm font-medium">{channel.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {channel.type || channel.channel_type}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => subscribeToChannel(channel.id)}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Entra
                          </Button>
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
                      {!selectedCountry ? 'Seleziona un paese' : 'Nessun canale disponibile'}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {!selectedCountry 
                        ? 'Usa i filtri sopra per trovare i canali della tua zona'
                        : 'Crea una nuova selezione o prova altri filtri'
                      }
                    </p>
                  </div>
                )}
              </div>
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
                      {channels.find(c => c.id === activeChannel)?.emoji || '🌐'}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {channels.find(c => c.id === activeChannel)?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {channels.find(c => c.id === activeChannel)?.description}
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
                channelName={filteredChannels.find(c => c.id === activeChannel)?.name || 'Canale'}
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
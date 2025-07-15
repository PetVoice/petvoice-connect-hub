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
  Camera,
  Play,
  Pause,
  ZoomIn
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

interface ChannelGroup {
  id: string;
  name: string;
  type: 'country' | 'breed';
  country: string;
  animalType?: string;
  breed?: string;
  flag: string;
  description: string;
}

interface Message {
  id: string;
  content?: string;
  user_id: string;
  channel_id: string;
  message_type: 'text' | 'voice' | 'image' | 'audio';
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

// Helper function to get country flag
const getCountryFlag = (countryCode: string): string => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.flag || '🌐';
};

// Helper function to get country name
const getCountryName = (countryCode: string): string => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.name || countryCode;
};

// Image Message Component
const ImageMessage: React.FC<{ message: Message }> = ({ message }) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <div className="image-message relative inline-block group">
        <img 
          src={message.file_url}
          alt="Immagine condivisa"
          className="max-w-[200px] max-h-[150px] rounded-lg cursor-pointer transition-transform hover:scale-105 object-cover"
          onClick={() => setShowModal(true)}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/70 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-4 w-4 text-white" />
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <img 
              src={message.file_url}
              alt="Immagine ingrandita"
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

// Audio Message Component
const AudioMessage: React.FC<{ message: Message }> = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-muted/50 rounded-2xl p-3 max-w-[280px]">
      <audio ref={audioRef} src={message.file_url} preload="metadata" />
      
      <div className="flex items-center gap-3">
        <button 
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        
        <div className="flex-1">
          <div className="h-1 bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        
        <div className="text-lg">
          🎤
        </div>
      </div>
    </div>
  );
};

// Enhanced Message Component with Edit/Delete
const MessageComponent: React.FC<{ message: Message; user: any; onEdit?: (id: string, content: string) => void; onDelete?: (id: string) => void }> = ({ message, user, onEdit, onDelete }) => {
  const isMyMessage = message.user_id === user?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  
  const handleEdit = async () => {
    if (!editText.trim()) return;
    
    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ 
          content: editText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', message.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setIsEditing(false);
      onEdit?.(message.id, editText.trim());
      
      toast({
        title: "Messaggio modificato",
        description: "Il messaggio è stato modificato con successo"
      });
      
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Errore",
        description: "Impossibile modificare il messaggio",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Eliminare questo messaggio?')) return;
    
    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', message.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      onDelete?.(message.id);
      
      toast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato eliminato"
      });
      
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        variant: "destructive"
      });
    }
  };
  
  const renderMessageContent = () => {
    if (isEditing && message.message_type === 'text') {
      return (
        <div className="flex gap-2 items-center">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
            className="flex-1"
            placeholder="Modifica messaggio..."
          />
          <Button size="sm" onClick={handleEdit}>
            💾
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
            ❌
          </Button>
        </div>
      );
    }
    
    switch (message.message_type) {
      case 'text':
        return <p className="text-sm">{message.content}</p>;
      case 'image':
        return <ImageMessage message={message} />;
      case 'audio':
      case 'voice':
        return <AudioMessage message={message} />;
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };
  
  return (
    <div className="flex gap-3 group">
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
            {message.updated_at !== message.created_at && (
              <span className="text-xs text-muted-foreground ml-1">(modificato)</span>
            )}
          </span>
        </div>
        <div className="message-content">
          {renderMessageContent()}
        </div>
        
        {/* Edit/Delete buttons - only for my messages and text messages */}
        {isMyMessage && !isEditing && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.message_type === 'text' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 px-2 text-xs"
              >
                ✏️ Modifica
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
            >
              🗑️ Elimina
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [availableGroups, setAvailableGroups] = useState<ChannelGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  
  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedAnimalType, setSelectedAnimalType] = useState<string>('');
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [breedOptions, setBreedOptions] = useState<string[]>([]);
  
  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate channel groups based on filters - ONLY GENERIC + BREED
  const generateChannelGroups = useCallback((country: string | null, animalType: string, breed: string): ChannelGroup[] => {
    const groups: ChannelGroup[] = [];
    
    // ALWAYS show generic country group if country selected
    if (country) {
      groups.push({
        id: `${country.toLowerCase()}-general`,
        name: getCountryName(country),
        type: 'country',
        country: country,
        flag: getCountryFlag(country),
        description: `Community ${getCountryName(country).toLowerCase()}`
      });
    }
    
    // SKIP animal type group - go directly to breed
    // Only if breed selected, add specific breed group
    if (country && breed && animalType !== 'all' && animalType !== '') {
      groups.push({
        id: `${country.toLowerCase()}-${breed.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${getCountryName(country)} - ${breed}`,
        type: 'breed',
        country: country,
        animalType: animalType,
        breed: breed,
        flag: getCountryFlag(country),
        description: `Community ${getCountryName(country).toLowerCase()} specializzata in ${breed}`
      });
    }
    
    return groups;
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

  // Update groups when ANY selection changes
  useEffect(() => {
    const newGroups = generateChannelGroups(selectedCountry, selectedAnimalType, selectedBreed);
    setAvailableGroups(newGroups);
  }, [selectedCountry, selectedAnimalType, selectedBreed, generateChannelGroups]);

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
        message_type: message.message_type as 'text' | 'voice' | 'image' | 'audio',
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

  // Handle animal type change
  const handleAnimalTypeChange = useCallback((animalType: string) => {
    setSelectedAnimalType(animalType);
    setSelectedBreed('');
    setActiveChannel(null);
  }, []);

  // Handle breed change
  const handleBreedChange = useCallback((breed: string) => {
    setSelectedBreed(breed);
    setActiveChannel(null);
  }, []);

  // Subscribe to group (direct subscription without channel existence check)
  const subscribeToGroup = useCallback(async (groupId: string) => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere loggato per iscriverti",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const group = availableGroups.find(g => g.id === groupId);
      if (!group) return;

      console.log('Tentativo iscrizione:', { groupId, group, userId: user.id });

      // Try to find existing channel first
      const { data: existingChannel } = await supabase
        .from('community_channels')
        .select('*')
        .eq('name', group.name)
        .eq('country_code', group.country)
        .maybeSingle();

      let channelId = existingChannel?.id;

      // If no existing channel, generate a valid UUID for subscription
      if (!channelId) {
        channelId = crypto.randomUUID();
      }

      // Subscribe directly without strict channel existence check
      const { error: subscribeError } = await supabase
        .from('user_channel_subscriptions')
        .upsert({
          user_id: user.id,
          channel_id: channelId,
          notifications_enabled: true
        }, {
          onConflict: 'user_id,channel_id',
          ignoreDuplicates: true
        });

      if (subscribeError) {
        console.error('Errore iscrizione:', subscribeError);
        throw subscribeError;
      }

      console.log('Iscrizione completata con successo');

      setActiveChannel(channelId);
      setJoinedGroups(prev => [...prev, groupId]);
      await loadUserSubscriptions();
      await loadChannels();
      
      toast({
        title: "Iscrizione completata",
        description: `Ora puoi chattare in ${group.name}!`
      });
    } catch (error) {
      console.error('Error subscribing to group:', error);
      toast({
        title: "Errore",
        description: "Impossibile iscriversi al gruppo: " + error.message,
        variant: "destructive"
      });
    }
  }, [user, availableGroups, loadUserSubscriptions, loadChannels]);

  // Unsubscribe from group
  const unsubscribeFromGroup = useCallback(async (groupId: string) => {
    if (!user) return;
    
    try {
      const group = availableGroups.find(g => g.id === groupId);
      if (!group) return;

      // Find channel by name and country
      const { data: channel } = await supabase
        .from('community_channels')
        .select('*')
        .eq('name', group.name)
        .eq('country_code', group.country)
        .maybeSingle();

      if (!channel) return;

      const { error } = await supabase
        .from('user_channel_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('channel_id', channel.id);
      
      if (error) throw error;
      
      if (activeChannel === channel.id) {
        setActiveChannel(null);
      }
      
      setJoinedGroups(prev => prev.filter(id => id !== groupId));
      await loadUserSubscriptions();
      
      toast({
        title: "Disiscrizione completata",
        description: `Hai lasciato ${group.name}`
      });
    } catch (error) {
      console.error('Error unsubscribing from group:', error);
      toast({
        title: "Errore",
        description: "Impossibile lasciare il gruppo",
        variant: "destructive"
      });
    }
  }, [user, availableGroups, activeChannel, loadUserSubscriptions]);

  // Message sent callback
  const handleMessageSent = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  // ===== PERSISTENZA STATO =====
  
  // Salva stato nel localStorage quando cambiano i valori
  useEffect(() => {
    const communityState = {
      selectedCountry,
      selectedAnimalType,
      selectedBreed,
      activeChannel,
      joinedGroups,
      notificationsEnabled,
      soundEnabled,
      translationEnabled
    };
    localStorage.setItem('communityState', JSON.stringify(communityState));
  }, [selectedCountry, selectedAnimalType, selectedBreed, activeChannel, joinedGroups, notificationsEnabled, soundEnabled, translationEnabled]);
  
  // Ripristina stato dal localStorage all'avvio
  useEffect(() => {
    const savedState = localStorage.getItem('communityState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setSelectedCountry(state.selectedCountry || null);
        setSelectedAnimalType(state.selectedAnimalType || '');
        setSelectedBreed(state.selectedBreed || '');
        setActiveChannel(state.activeChannel || null);
        setJoinedGroups(state.joinedGroups || []);
        setNotificationsEnabled(state.notificationsEnabled ?? true);
        setSoundEnabled(state.soundEnabled ?? true);
        setTranslationEnabled(state.translationEnabled ?? true);
      } catch (error) {
        console.error('Errore ripristino stato community:', error);
      }
    }
  }, []);

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
    if (selectedAnimalType && selectedAnimalType !== 'all' && selectedAnimalType !== '') {
      const availableBreeds = getBreedsByAnimalType(selectedAnimalType);
      setBreedOptions(availableBreeds);
    } else {
      setBreedOptions([]);
    }
  }, [selectedAnimalType, getBreedsByAnimalType]);

  // Update joined groups based on subscriptions
  useEffect(() => {
    const joined = availableGroups.filter(group => {
      const channel = channels.find(c => c.name === group.name && c.country_code === group.country);
      return channel && subscribedChannels.includes(channel.id);
    }).map(group => group.id);
    
    setJoinedGroups(joined);
  }, [availableGroups, channels, subscribedChannels]);

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

  // Get joined and available groups
  const joinedGroupsList = availableGroups.filter(group => joinedGroups.includes(group.id));
  const availableGroupsList = availableGroups.filter(group => !joinedGroups.includes(group.id));

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
            <Select value={selectedAnimalType} onValueChange={handleAnimalTypeChange}>
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
          
          {selectedAnimalType && selectedAnimalType !== 'all' && selectedAnimalType !== '' && (
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
            {/* I tuoi gruppi */}
            {joinedGroupsList.length > 0 && (
              <div className="border-b">
                <div className="p-4 border-b">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    I tuoi gruppi
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {joinedGroupsList.map((group) => {
                    const channel = channels.find(c => c.name === group.name && c.country_code === group.country);
                    const isActive = activeChannel === channel?.id;
                    
                    return (
                      <div
                        key={group.id}
                        className={`bg-card border rounded-lg p-3 ${
                          isActive ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {/* UNA SOLA BANDIERA QUI */}
                            <span className="text-lg">{group.flag}</span>
                            <div>
                              <div className="text-sm font-medium">{group.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {group.type}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={isActive ? "default" : "outline"}
                              onClick={() => setActiveChannel(channel?.id || null)}
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
                              onClick={() => unsubscribeFromGroup(group.id)}
                              title="Esci dal gruppo"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {group.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Gruppi disponibili */}
            <div>
              <div className="p-4 border-b">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Gruppi disponibili
                </div>
              </div>
              <div className="p-4 space-y-3">
                {availableGroupsList.length > 0 ? (
                  availableGroupsList.map((group) => {
                    return (
                      <div
                        key={group.id}
                        className="bg-card border rounded-lg p-3 border-muted"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {/* UNA SOLA BANDIERA QUI */}
                            <span className="text-lg">{group.flag}</span>
                            <div>
                              <div className="text-sm font-medium">{group.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {group.type}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => subscribeToGroup(group.id)}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Entra
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {group.description}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {!selectedCountry ? 'Seleziona un paese' : 'Nessun gruppo disponibile'}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {!selectedCountry 
                        ? 'Usa i filtri sopra per trovare i gruppi della tua zona'
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
                  <MessageComponent key={message.id} message={message} user={user} />
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <MessageInput
                channelId={activeChannel}
                channelName={channels.find(c => c.id === activeChannel)?.name || 'Canale'}
                onMessageSent={handleMessageSent}
                disabled={loading}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Seleziona un gruppo
                </h3>
                <p className="text-muted-foreground">
                  Scegli un gruppo dalla barra laterale per iniziare a chattare
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
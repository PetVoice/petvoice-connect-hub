import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Star, 
  MessageCircle, 
  Eye, 
  Trophy, 
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Calendar,
  Phone,
  Video,
  Send,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  Loader2,
  ChevronDown,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usePetTwins } from '@/hooks/usePetMatching';
import { useCreateProtocol } from '@/hooks/useTrainingProtocols';
import { supabase } from "@/integrations/supabase/client";

// Enhanced Types
interface PetTwin {
  id: string;
  name: string;
  species: 'Cane' | 'Gatto';
  breed: string;
  age: number;
  location: string;
  distance: number;
  avatar: string;
  owner: string;
  matchScore: number;
  behavioralDNA: string[];
  commonTraits: string[];
  differences: string[];
  successStories: number;
  lastActive: string;
  energyLevel: number;
  socialScore: number;
  anxietyLevel: number;
  trainingProgress: number;
  isBookmarked: boolean;
}

interface MentorMatch {
  id: string;
  name: string;
  avatar: string;
  experience: number;
  specialties: string[];
  location: string;
  distance: number;
  successRate: number;
  totalMentorships: number;
  rating: number;
  isOnline: boolean;
  lastSeen: string;
  bio: string;
  hourlyRate?: number;
  responseTime: string;
  languages: string[];
  isBookmarked: boolean;
  availability: 'Disponibile' | 'Occupato' | 'Non Disponibile';
}

interface SuccessPattern {
  id: string;
  patternName: string;
  description: string;
  difficulty: 'Facile' | 'Medio' | 'Difficile';
  successRate: number;
  timeframe: string;
  steps: string[];
  similarCases: number;
  category: string;
  isStarted: boolean;
  estimatedCost?: number;
  requiredMaterials: string[];
}

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

// Enhanced Mock Data
const mockPetTwins: PetTwin[] = [
  {
    id: '1',
    name: 'Luna',
    species: 'Cane',
    breed: 'Golden Retriever',
    age: 3,
    location: 'Milano, IT',
    distance: 2.5,
    avatar: '/placeholder.svg',
    owner: 'Marco R.',
    matchScore: 94,
    behavioralDNA: ['Giocoso', 'Ansioso', 'Socievole', 'Energico'],
    commonTraits: ['Separazione difficile', 'Iperattivo al mattino', 'Ama l\'acqua'],
    differences: ['Più timido con estranei', 'Meno aggressivo con il cibo'],
    successStories: 3,
    lastActive: '2 ore fa',
    energyLevel: 85,
    socialScore: 78,
    anxietyLevel: 45,
    trainingProgress: 67,
    isBookmarked: false
  },
  {
    id: '2',
    name: 'Simba',
    species: 'Gatto',
    breed: 'Maine Coon',
    age: 2,
    location: 'Roma, IT',
    distance: 15.2,
    avatar: '/placeholder.svg',
    owner: 'Sofia M.',
    matchScore: 89,
    behavioralDNA: ['Indipendente', 'Curioso', 'Affettuoso', 'Notturno'],
    commonTraits: ['Miagola molto', 'Territorialità marcata', 'Ama i posti alti'],
    differences: ['Più socievole', 'Meno territoriale'],
    successStories: 2,
    lastActive: '1 giorno fa',
    energyLevel: 60,
    socialScore: 45,
    anxietyLevel: 30,
    trainingProgress: 40,
    isBookmarked: true
  },
  {
    id: '3',
    name: 'Buddy',
    species: 'Cane',
    breed: 'Labrador',
    age: 4,
    location: 'Torino, IT',
    distance: 8.7,
    avatar: '/placeholder.svg',
    owner: 'Andrea L.',
    matchScore: 87,
    behavioralDNA: ['Fedele', 'Protettivo', 'Goloso', 'Energico'],
    commonTraits: ['Eccesso di energia', 'Protezione della casa', 'Ama correre'],
    differences: ['Più obbediente', 'Meno abbaio'],
    successStories: 5,
    lastActive: '30 minuti fa',
    energyLevel: 90,
    socialScore: 85,
    anxietyLevel: 25,
    trainingProgress: 85,
    isBookmarked: false
  }
];

const mockMentors: MentorMatch[] = [
  {
    id: '1',
    name: 'Dr. Elena Rossi',
    avatar: '/placeholder.svg',
    experience: 8,
    specialties: ['Ansia da separazione', 'Addestramento cuccioli', 'Socializzazione'],
    location: 'Milano, IT',
    distance: 3.2,
    successRate: 96,
    totalMentorships: 45,
    rating: 4.9,
    isOnline: true,
    lastSeen: 'Online ora',
    bio: 'Veterinaria comportamentalista con 8 anni di esperienza. Specializzata in disturbi comportamentali e ansia.',
    hourlyRate: 75,
    responseTime: '< 2 ore',
    languages: ['Italiano', 'Inglese'],
    isBookmarked: true,
    availability: 'Disponibile'
  },
  {
    id: '2',
    name: 'Luigi Bianchi',
    avatar: '/placeholder.svg',
    experience: 12,
    specialties: ['Aggressività', 'Cani di taglia grande', 'Riabilitazione'],
    location: 'Roma, IT',
    distance: 12.5,
    successRate: 94,
    totalMentorships: 67,
    rating: 4.8,
    isOnline: false,
    lastSeen: '2 ore fa',
    bio: 'Addestratore certificato con oltre 12 anni di esperienza nel recupero comportamentale.',
    hourlyRate: 60,
    responseTime: '< 4 ore',
    languages: ['Italiano'],
    isBookmarked: false,
    availability: 'Occupato'
  },
  {
    id: '3',
    name: 'Maria Cattaneo',
    avatar: '/placeholder.svg',
    experience: 6,
    specialties: ['Gatti', 'Comportamento felino', 'Stress ambientale'],
    location: 'Napoli, IT',
    distance: 25.0,
    successRate: 92,
    totalMentorships: 34,
    rating: 4.7,
    isOnline: true,
    lastSeen: 'Online ora',
    bio: 'Esperta in comportamento felino e gestione dello stress nei gatti domestici.',
    hourlyRate: 50,
    responseTime: '< 1 ora',
    languages: ['Italiano', 'Inglese', 'Spagnolo'],
    isBookmarked: false,
    availability: 'Disponibile'
  }
];

const mockSuccessPatterns: SuccessPattern[] = [
  {
    id: '1',
    patternName: 'Protocollo Anti-Ansia Graduale',
    description: 'Riduzione graduale dell\'ansia da separazione attraverso tecniche di desensibilizzazione',
    difficulty: 'Medio',
    successRate: 89,
    timeframe: '6-8 settimane',
    steps: [
      'Valutazione iniziale del livello di ansia',
      'Desensibilizzazione graduale alle partenze',
      'Rinforzo positivo per comportamenti calmi',
      'Introduzione di oggetti rassicuranti',
      'Monitoraggio e aggiustamenti progressivi'
    ],
    similarCases: 127,
    category: 'Comportamento',
    isStarted: false,
    estimatedCost: 150,
    requiredMaterials: ['Giocattoli anti-stress', 'Feromoni calmanti', 'Telecamera monitoring']
  },
  {
    id: '2',
    patternName: 'Sistema Energetico Bilanciato',
    description: 'Gestione dell\'iperattività attraverso esercizio strutturato e stimolazione mentale',
    difficulty: 'Facile',
    successRate: 94,
    timeframe: '3-4 settimane',
    steps: [
      'Pianificazione routine di esercizio',
      'Introduzione giochi mentali',
      'Strutturazione tempo di riposo',
      'Monitoraggio livelli di energia',
      'Ottimizzazione alimentazione'
    ],
    similarCases: 89,
    category: 'Energia',
    isStarted: true,
    estimatedCost: 80,
    requiredMaterials: ['Puzzle toys', 'Kong riempibili', 'Timer per routine']
  },
  {
    id: '3',
    patternName: 'Socializzazione Assistita',
    description: 'Miglioramento delle competenze sociali attraverso interazioni controllate',
    difficulty: 'Difficile',
    successRate: 78,
    timeframe: '8-12 settimane',
    steps: [
      'Identificazione trigger sociali',
      'Esposizione graduale controllata',
      'Rinforzo comportamenti positivi',
      'Introduzione nuovi contesti',
      'Consolidamento competenze'
    ],
    similarCases: 56,
    category: 'Socializzazione',
    isStarted: false,
    estimatedCost: 200,
    requiredMaterials: ['Guinzaglio lungo', 'Snack high-value', 'Clicker training']
  }
];

export const PetMatchingIntelligence: React.FC = () => {
  const { toast } = useToast();
  
  // Real data hooks with proper loading states
  const { data: petTwins = [], isLoading: petsLoading } = usePetTwins();
  
  // Training protocol creation
  const createProtocol = useCreateProtocol();
  
  // State Management - ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS
  const [selectedPetTwin, setSelectedPetTwin] = useState<any>(null);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');
  const [onlineFilter, setOnlineFilter] = useState(false);
  const [sortBy, setSortBy] = useState<string>('match');
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [patterns, setPatterns] = useState<any[]>([]);
  
  
  // Filter and sort logic - ALL useMemo HOOKS MUST BE BEFORE CONDITIONAL RETURNS
  const filteredPetTwins = useMemo(() => {
    if (!petTwins || petTwins.length === 0) return [];
    
    return petTwins.filter(twin => {
      if (!twin) return false;
      const matchesSearch = twin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           twin.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           twin.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies = speciesFilter === 'all' || twin.type === speciesFilter;
      
      return matchesSearch && matchesSpecies;
    });
  }, [petTwins, searchTerm, speciesFilter]);
  
  // Show loading AFTER all hooks are declared
  if (petsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mock current pet data (would come from app state)
  const currentPet = {
    name: 'Max',
    species: 'Cane',
    breed: 'Golden Retriever',
    behavioralDNA: ['Ansioso', 'Giocoso', 'Socievole', 'Energico']
  };


  // Utility functions
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'Medio': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      case 'Difficile': return 'bg-red-500/20 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
    }
  };

  const toggleBookmark = (id: string, type: 'pet' | 'mentor') => {
    setBookmarkedItems(prev => {
      const newSet = new Set(prev);
      const key = `${type}-${id}`;
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isBookmarked = (id: string, type: 'pet' | 'mentor') => {
    return bookmarkedItems.has(`${type}-${id}`);
  };

  const handleConnect = async (petId: string) => {
    setIsLoading(true);
    
    const selectedTwin = filteredPetTwins.find(twin => twin.id === petId);
    if (!selectedTwin) {
      setIsLoading(false);
      return;
    }

    try {
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if chat already exists between these users (and not deleted by current user)
      const { data: existingChat } = await supabase
        .from('private_chats')
        .select('id, deleted_by_participant_1, deleted_by_participant_2, participant_1_id')
        .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${selectedTwin.user_id}),and(participant_1_id.eq.${selectedTwin.user_id},participant_2_id.eq.${user.id})`)
        .eq('is_active', true)
        .maybeSingle();

      // Check if the existing chat is not deleted by current user
      let chatId = null;
      if (existingChat) {
        const isParticipant1 = existingChat.participant_1_id === user.id;
        const isDeletedByCurrentUser = isParticipant1 ? existingChat.deleted_by_participant_1 : existingChat.deleted_by_participant_2;
        
        if (!isDeletedByCurrentUser) {
          chatId = existingChat.id;
        }
      }

      // Create new chat if it doesn't exist
      if (!chatId) {
        const { data: newChat, error: chatError } = await supabase
          .from('private_chats')
          .insert({
            participant_1_id: user.id,
            participant_2_id: selectedTwin.user_id,
            initiated_by: user.id
          })
          .select('id')
          .single();

        if (chatError) {
          console.error('Error creating chat:', chatError);
          throw chatError;
        }

        chatId = newChat.id;
      }

      // Send initial message
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const userName = userProfile?.display_name?.split(' ')[0] || user.user_metadata?.display_name?.split(' ')[0] || 'Utente';

      const { error: messageError } = await supabase
        .from('private_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          recipient_id: selectedTwin.user_id,
          content: `👋 Ciao! Sono ${userName} e ho visto il tuo ${selectedTwin.name}. I nostri pet potrebbero essere ottimi compagni! Mi piacerebbe organizzare un incontro se sei interessato.`,
          message_type: 'text',
          metadata: {
            pet_id: petId,
            target_pet_name: selectedTwin.name,
            connection_type: 'pet_match',
            match_score: selectedTwin.matchScore,
            is_connection_request: true
          }
        });

      if (messageError) {
        console.error('Error sending message:', messageError);
        throw messageError;
      }

      // Log the activity
      await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          pet_id: petId,
          activity_type: 'private_connection_request_sent',
          activity_description: `Messaggio di connessione privato inviato per ${selectedTwin.name}`,
          metadata: {
            chat_id: chatId,
            target_pet_name: selectedTwin.name,
            target_user_id: selectedTwin.user_id
          }
        });

      toast({
        title: "Chat avviata!",
        description: `Hai avviato una chat privata. Vai alla sezione "Chat Private" per continuare la conversazione.`,
      });
      
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile avviare la chat privata. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactMentor = (mentorId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const mentor = mockMentors.find(m => m.id === mentorId);
      toast({
        title: "Messaggio inviato!",
        description: `Il mentore risponderà entro ${mentor?.responseTime || "alcune ore"}.`,
      });
    }, 1000);
  };

  const handleStartPattern = async (patternId: string) => {
    setIsLoading(true);
    const pattern = patterns.find(p => p.id === patternId);
    
    if (!pattern) {
      setIsLoading(false);
      return;
    }

    try {
      // Create the real protocol in database
      await createProtocol.mutateAsync({
        title: pattern.patternName,
        description: pattern.description,
        category: pattern.category.toLowerCase(),
        difficulty: pattern.difficulty.toLowerCase() as 'facile' | 'medio' | 'difficile',
        duration_days: parseInt(pattern.timeframe.split(' ')[0]) || 14,
        target_behavior: pattern.patternName,
        triggers: [],
        required_materials: pattern.requiredMaterials || [],
        is_public: false,
        ai_generated: true,
        integration_source: 'matching',
        current_day: 1,
        progress_percentage: 0,
        status: 'active',
        success_rate: pattern.successRate || 0,
        veterinary_approved: false,
        community_rating: 0,
        community_usage: 0,
        mentor_recommended: false,
        notifications_enabled: true,
        last_activity_at: new Date().toISOString(),
        user_id: '',
        pet_id: null,
        estimated_cost: null, // Sempre gratuito
        share_code: null,
      });

      // Update local state
      setPatterns(prev => prev.map(p => 
        p.id === patternId ? { ...p, isStarted: true } : p
      ));

      toast({
        title: "Protocollo creato!",
        description: `"${pattern.patternName}" è stato creato e avviato. Lo trovi nella sezione Training.`,
      });
    } catch (error) {
      console.error('Error creating protocol:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile creare il protocollo. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Find highest match if any
  const highestMatch = filteredPetTwins.find(twin => twin.match_score >= 90);

  return (
    <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold">{filteredPetTwins.length}</div>
              <div className="text-xs text-muted-foreground">Pet Gemelli</div>
              <div className="text-xs text-blue-600">match comportamentali</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold">{mockMentors.filter(m => m.isOnline).length}</div>
              <div className="text-xs text-muted-foreground">Mentori Attivi</div>
              <div className="text-xs text-green-600">proprietari esperti</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-2xl font-bold">
                {mockSuccessPatterns.reduce((acc, p) => acc + p.successRate, 0) / mockSuccessPatterns.length}%
              </div>
              <div className="text-xs text-muted-foreground">Progressi Similari</div>
              <div className="text-xs text-yellow-600">miglioramento medio</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold">
                {mockSuccessPatterns.reduce((acc, p) => acc + p.similarCases, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Successi Condivisi</div>
              <div className="text-xs text-purple-600">casi di successo</div>
            </CardContent>
          </Card>
        </div>

      {/* Success Alert - only show if there's a real high match */}
      {highestMatch && (
        <Alert className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-300">
            🎉 Hai un nuovo match al {highestMatch.match_score}% con {highestMatch.name}! Il vostro DNA comportamentale è incredibilmente simile.
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome, razza, specialità..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtri
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-xs font-medium">Specie</Label>
              <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte</SelectItem>
                  <SelectItem value="Cane">Cani</SelectItem>
                  <SelectItem value="Gatto">Gatti</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Distanza</Label>
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualunque</SelectItem>
                  <SelectItem value="5">Entro 5km</SelectItem>
                  <SelectItem value="10">Entro 10km</SelectItem>
                  <SelectItem value="25">Entro 25km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Ordina per</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Match %</SelectItem>
                  <SelectItem value="distance">Distanza</SelectItem>
                  <SelectItem value="activity">Ultima attività</SelectItem>
                  <SelectItem value="rating">Valutazione</SelectItem>
                  <SelectItem value="experience">Esperienza</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 mt-5">
              <Switch
                id="online-filter"
                checked={onlineFilter}
                onCheckedChange={setOnlineFilter}
              />
              <Label htmlFor="online-filter" className="text-xs">Solo online</Label>
            </div>
          </div>
        )}
      </div>

      {/* Contenuto Pet Gemelli direttamente (senza tab) */}
      <div className="space-y-4">
          {filteredPetTwins.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nessun match trovato</h3>
              <p className="text-muted-foreground">Prova a modificare i filtri di ricerca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPetTwins.map((twin) => (
                <Card key={twin.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/30">
                          <AvatarImage src={twin.avatar} alt={twin.name} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {twin.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{twin.name}</h3>
                          <p className="text-sm text-muted-foreground">{twin.breed}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                          {twin.matchScore}% Match
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(twin.id, 'pet')}
                          className="h-8 w-8 p-0"
                        >
                          {isBookmarked(twin.id, 'pet') ? (
                            <BookmarkCheck className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {twin.age} anni
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {twin.distance}km
                      </span>
                    </div>

                    {/* Compatibility Breakdown */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Compatibilità:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Energia:</span>
                          <span className="font-medium">{Math.round((twin.energyLevel + (currentPet.behavioralDNA.includes('Energico') ? 80 : 40)) / 2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sociale:</span>
                          <span className="font-medium">{Math.round((twin.socialScore + (currentPet.behavioralDNA.includes('Socievole') ? 85 : 45)) / 2)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">DNA Comportamentale:</h4>
                      <div className="flex flex-wrap gap-1">
                        {(twin.behavioralDNA || []).map((trait, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={`text-xs ${(currentPet.behavioralDNA || []).includes(trait) ? 'bg-green-100 border-green-300 text-green-700' : ''}`}
                          >
                            {trait}
                            {currentPet.behavioralDNA.includes(trait) && <CheckCircle className="h-3 w-3 ml-1" />}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Tratti Comuni:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {(twin.commonTraits || []).slice(0, 2).map((trait, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {trait}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>{twin.successStories} successi</span>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedPetTwin(twin)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Dettagli
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={twin.avatar} alt={twin.name} />
                                  <AvatarFallback>{twin.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h2 className="text-xl font-bold">{twin.name}</h2>
                                  <p className="text-sm text-muted-foreground">{twin.breed} • {twin.age} anni</p>
                                </div>
                                <Badge className="ml-auto">{twin.matchScore}% Match</Badge>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Compatibility Charts */}
                              <div>
                                <h3 className="font-semibold mb-3">Analisi Compatibilità</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Livello Energia</span>
                                      <span>{twin.energyLevel}%</span>
                                    </div>
                                    <Progress value={twin.energyLevel} className="h-2" />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Socialità</span>
                                      <span>{twin.socialScore}%</span>
                                    </div>
                                    <Progress value={twin.socialScore} className="h-2" />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Ansia</span>
                                      <span>{twin.anxietyLevel}%</span>
                                    </div>
                                    <Progress value={twin.anxietyLevel} className="h-2 [&>div]:bg-red-500" />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Training</span>
                                      <span>{twin.trainingProgress}%</span>
                                    </div>
                                    <Progress value={twin.trainingProgress} className="h-2" />
                                  </div>
                                </div>
                              </div>

                              {/* Behavioral DNA */}
                              <div>
                                <h3 className="font-semibold mb-3">DNA Comportamentale Completo</h3>
                                <div className="flex flex-wrap gap-2">
                                  {(twin.behavioralDNA || []).map((trait, idx) => (
                                    <Badge 
                                      key={idx} 
                                      variant={currentPet.behavioralDNA.includes(trait) ? "default" : "outline"}
                                      className="text-sm"
                                    >
                                      {trait}
                                      {currentPet.behavioralDNA.includes(trait) && <CheckCircle className="h-3 w-3 ml-1" />}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Success Stories */}
                              <div>
                                <h3 className="font-semibold mb-3">Storie di Successo ({twin.successStories})</h3>
                                <div className="space-y-3">
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm"><strong>Ansia da Separazione:</strong> Risolto in 4 settimane con protocollo graduale</p>
                                    <p className="text-xs text-muted-foreground mt-1">3 mesi fa • Mentore: Dr. Elena Rossi</p>
                                  </div>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm"><strong>Socializzazione:</strong> Miglioramento del 85% nell'interazione con altri cani</p>
                                    <p className="text-xs text-muted-foreground mt-1">6 mesi fa • Mentore: Luigi Bianchi</p>
                                  </div>
                                </div>
                              </div>

                              {/* Contact Options */}
                              <div className="flex gap-3 pt-4 border-t">
                                <Button 
                                  className="flex-1"
                                  onClick={() => handleConnect(twin.id)}
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Connetti con {twin.owner}
                                </Button>
                                <Button variant="outline">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Programma Incontro
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => handleConnect(twin.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <MessageCircle className="h-4 w-4 mr-1" />
                          )}
                          Connetti
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};
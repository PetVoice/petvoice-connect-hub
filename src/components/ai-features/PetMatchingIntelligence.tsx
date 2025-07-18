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
import { usePetTwins, useMentors, useSuccessPatterns } from '@/hooks/usePetMatching';

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
  const { data: mentors = [], isLoading: mentorsLoading } = useMentors();
  const { data: successPatterns = [], isLoading: patternsLoading } = useSuccessPatterns();
  
  // Show loading if any data is still loading
  if (petsLoading || mentorsLoading || patternsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // State Management
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

  // Update patterns when successPatterns changes
  React.useEffect(() => {
    if (successPatterns.length > 0) {
      setPatterns(successPatterns);
    }
  }, [successPatterns]);

  // Mock current pet data (would come from app state)
  const currentPet = {
    name: 'Max',
    species: 'Cane',
    breed: 'Golden Retriever',
    behavioralDNA: ['Ansioso', 'Giocoso', 'Socievole', 'Energico']
  };

  // Filter and sort logic
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

  const filteredMentors = useMemo(() => {
    if (!mentors || mentors.length === 0) return [];
    
    return mentors.filter(mentor => {
      if (!mentor) return false;
      const matchesSearch = mentor.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mentor.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesOnline = !onlineFilter || mentor.is_online;
      
      return matchesSearch && matchesOnline;
    });
  }, [mentors, searchTerm, onlineFilter]);

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

  const handleConnect = (petId: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Connessione inviata!",
        description: "La richiesta di connessione è stata inviata al proprietario del pet.",
      });
    }, 1500);
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

  const handleStartPattern = (patternId: string) => {
    setIsLoading(true);
    const pattern = patterns.find(p => p.id === patternId);
    setTimeout(() => {
      setIsLoading(false);
      setPatterns(prev => prev.map(p => 
        p.id === patternId ? { ...p, isStarted: true } : p
      ));
      if (pattern) {
        toast({
          title: "Protocollo avviato!",
          description: `"${pattern.patternName}" è stato avviato. Troverai i dettagli nella sezione Training.`,
        });
      }
    }, 1000);
  };

  // Find highest match if any
  const highestMatch = filteredPetTwins.find(twin => twin.match_score >= 90);

  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="pet-twins" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="pet-twins" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Pet Gemelli
            <Badge variant="secondary" className="ml-1 text-xs">
              {filteredPetTwins.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mentori
            <Badge variant="secondary" className="ml-1 text-xs">
              {filteredMentors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="success-patterns" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Modelli di Successo
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Progressi Community
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Pet Twins Tab */}
        <TabsContent value="pet-twins" className="space-y-4">
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
        </TabsContent>

        {/* Enhanced Mentors Tab */}
        <TabsContent value="mentors" className="space-y-4">
          {filteredMentors.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nessun mentore trovato</h3>
              <p className="text-muted-foreground">Prova a modificare i filtri di ricerca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="hover:shadow-lg transition-all duration-300 border-emerald-500/20 hover:border-emerald-500/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-emerald-500/30">
                            <AvatarImage src={mentor.avatar} alt={mentor.name} />
                            <AvatarFallback className="bg-emerald-500/20 text-emerald-700">
                              {mentor.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {mentor.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{mentor.name}</h3>
                          <p className="text-sm text-muted-foreground">{mentor.experience} anni di esperienza</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{mentor.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{mentor.successRate}% successo</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(mentor.id, 'mentor')}
                          className="h-8 w-8 p-0 mt-1"
                        >
                          {isBookmarked(mentor.id, 'mentor') ? (
                            <BookmarkCheck className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{mentor.bio}</p>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Specializzazioni:</h4>
                      <div className="flex flex-wrap gap-1">
                        {(mentor.specialties || []).map((specialty, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-muted-foreground">{mentor.distance}km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-muted-foreground">{mentor.responseTime}</span>
                      </div>
                      {mentor.hourlyRate && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">€{mentor.hourlyRate}/ora</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Badge variant={mentor.availability === 'Disponibile' ? 'default' : 'secondary'} className="text-xs">
                          {mentor.availability}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${mentor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-muted-foreground">{mentor.lastSeen}</span>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedMentor(mentor)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Profilo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                                    <AvatarFallback>{mentor.name.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  {mentor.isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                                  )}
                                </div>
                                <div>
                                  <h2 className="text-xl font-bold">{mentor.name}</h2>
                                  <p className="text-sm text-muted-foreground">{mentor.experience} anni di esperienza</p>
                                </div>
                                <div className="ml-auto text-right">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">{mentor.rating}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{mentor.totalMentorships} consultazioni</p>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Bio Extended */}
                              <div>
                                <h3 className="font-semibold mb-3">Chi sono</h3>
                                <p className="text-sm text-muted-foreground">{mentor.bio}</p>
                              </div>

                              {/* Statistics */}
                              <div>
                                <h3 className="font-semibold mb-3">Statistiche</h3>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <div className="text-2xl font-bold text-emerald-600">{mentor.successRate}%</div>
                                    <div className="text-xs text-muted-foreground">Tasso Successo</div>
                                  </div>
                                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <div className="text-2xl font-bold text-emerald-600">{mentor.totalMentorships}</div>
                                    <div className="text-xs text-muted-foreground">Consultazioni</div>
                                  </div>
                                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <div className="text-2xl font-bold text-emerald-600">{mentor.responseTime}</div>
                                    <div className="text-xs text-muted-foreground">Risposta</div>
                                  </div>
                                </div>
                              </div>

                              {/* Specializations */}
                              <div>
                                <h3 className="font-semibold mb-3">Specializzazioni</h3>
                                <div className="flex flex-wrap gap-2">
                                  {(mentor.specialties || []).map((specialty, idx) => (
                                    <Badge key={idx} variant="outline" className="text-sm">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Languages */}
                              <div>
                                <h3 className="font-semibold mb-3">Lingue</h3>
                                <div className="flex gap-2">
                                  {(mentor.languages || []).map((lang, idx) => (
                                    <Badge key={idx} variant="secondary">
                                      {lang}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Contact Options */}
                              <div className="space-y-3">
                                <h3 className="font-semibold">Contatta</h3>
                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Scrivi il tuo messaggio..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button 
                                      className="flex-1"
                                      onClick={() => handleContactMentor(mentor.id)}
                                      disabled={isLoading || !chatMessage.trim()}
                                    >
                                      {isLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                      )}
                                      Invia Messaggio
                                    </Button>
                                    <Button variant="outline">
                                      <Phone className="h-4 w-4 mr-2" />
                                      Chiama
                                    </Button>
                                    <Button variant="outline">
                                      <Video className="h-4 w-4 mr-2" />
                                      Video
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => handleContactMentor(mentor.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <MessageCircle className="h-4 w-4 mr-1" />
                          )}
                          Contatta
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Enhanced Success Patterns Tab */}
        <TabsContent value="success-patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <Card key={pattern.id} className="hover:shadow-lg transition-all duration-300 border-orange-500/20 hover:border-orange-500/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold text-lg">{pattern.patternName}</h3>
                    </div>
                    <Badge className={getDifficultyColor(pattern.difficulty)}>
                      {pattern.difficulty}
                    </Badge>
                  </div>
                  {pattern.isStarted && (
                    <Badge variant="default" className="w-fit">
                      <Zap className="h-3 w-3 mr-1" />
                      In Corso
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Tasso di Successo</span>
                      <span className="text-orange-500 font-semibold">{pattern.successRate}%</span>
                    </div>
                    <Progress value={pattern.successRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Durata:</p>
                      <p className="text-muted-foreground">{pattern.timeframe}</p>
                    </div>
                    <div>
                      <p className="font-medium">Casi Simili:</p>
                      <p className="text-muted-foreground">{pattern.similarCases}</p>
                    </div>
                    {pattern.estimatedCost && (
                      <div className="col-span-2">
                        <p className="font-medium">Costo Stimato:</p>
                        <p className="text-muted-foreground">€{pattern.estimatedCost}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Passi Principali:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {(pattern.steps || []).slice(0, 3).map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-500 font-medium">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                      {pattern.steps.length > 3 && (
                        <li className="text-muted-foreground">...e altri {pattern.steps.length - 3} passi</li>
                      )}
                    </ul>
                  </div>

                  {pattern.requiredMaterials.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Materiali Necessari:</h4>
                      <div className="flex flex-wrap gap-1">
                        {(pattern.requiredMaterials || []).map((material, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {pattern.category}
                    </Badge>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Dettagli
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-orange-500" />
                              {pattern.patternName}
                              <Badge className={getDifficultyColor(pattern.difficulty)}>
                                {pattern.difficulty}
                              </Badge>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <p className="text-muted-foreground">{pattern.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Tasso di Successo</h4>
                                <div className="flex items-center gap-2">
                                  <Progress value={pattern.successRate} className="flex-1" />
                                  <span className="text-sm font-medium">{pattern.successRate}%</span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium">Durata Prevista</h4>
                                <p className="text-muted-foreground">{pattern.timeframe}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3">Piano Completo</h4>
                              <div className="space-y-3">
                                {(pattern.steps || []).map((step, idx) => (
                                  <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm">{step}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3">Materiali e Costi</h4>
                              <div className="space-y-2">
                                {(pattern.requiredMaterials || []).map((material, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                    <span className="text-sm">{material}</span>
                                    <Badge variant="outline">Necessario</Badge>
                                  </div>
                                ))}
                                {pattern.estimatedCost && (
                                  <div className="pt-2 border-t">
                                    <div className="flex justify-between font-medium">
                                      <span>Costo Totale Stimato:</span>
                                      <span>€{pattern.estimatedCost}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => handleStartPattern(pattern.id)}
                        disabled={pattern.isStarted || isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : pattern.isStarted ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Avviato
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Inizia
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Enhanced Progress Community Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Progressi della Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ansia da Separazione</span>
                    <span className="text-sm font-medium">89% miglioramento</span>
                  </div>
                  <Progress value={89} className="h-2" />
                  <p className="text-xs text-muted-foreground">127 casi trattati con successo</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gestione Energia</span>
                    <span className="text-sm font-medium">94% miglioramento</span>
                  </div>
                  <Progress value={94} className="h-2" />
                  <p className="text-xs text-muted-foreground">89 casi completati</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Socializzazione</span>
                    <span className="text-sm font-medium">78% miglioramento</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <p className="text-xs text-muted-foreground">56 casi in corso</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Comportamento Alimentare</span>
                    <span className="text-sm font-medium">85% miglioramento</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground">43 casi risolti</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  Storie di Successo Recenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-500/20 text-purple-700">M</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Max (Golden Retriever)</p>
                        <p className="text-xs text-muted-foreground">Trattamento ansia - 6 settimane</p>
                      </div>
                      <Badge variant="outline" className="ml-auto text-xs">Completato</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Grazie al protocollo anti-ansia e al supporto del mentore Dr. Elena, Max è passato da 8 ore di pianto a solo 10 minuti!"
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>Obiettivo raggiunto al 96%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-500/20 text-purple-700">L</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Lucy (Gatto Persiano)</p>
                        <p className="text-xs text-muted-foreground">Socializzazione - 10 settimane</p>
                      </div>
                      <Badge variant="outline" className="ml-auto text-xs">In Corso</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Il programma di socializzazione graduale ha permesso a Lucy di accettare finalmente altri gatti!"
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={75} className="flex-1 h-1" />
                      <span className="text-xs text-muted-foreground">75%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-500/20 text-purple-700">B</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Buddy (Labrador)</p>
                        <p className="text-xs text-muted-foreground">Gestione energia - 3 settimane</p>
                      </div>
                      <Badge className="ml-auto text-xs bg-green-500">Successo</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Routine di esercizio strutturata ha completamente risolto l'iperattività. Buddy è ora calmo e equilibrato!"
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Risultato eccezionale</span>
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
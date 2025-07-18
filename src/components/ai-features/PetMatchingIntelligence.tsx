import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Sparkles
} from 'lucide-react';

// Types
interface PetTwin {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  location: string;
  avatar: string;
  owner: string;
  matchScore: number;
  behavioralDNA: string[];
  commonTraits: string[];
  differences: string[];
  successStories: number;
  lastActive: string;
}

interface MentorMatch {
  id: string;
  name: string;
  avatar: string;
  experience: number;
  specialties: string[];
  location: string;
  successRate: number;
  totalMentorships: number;
  rating: number;
  isOnline: boolean;
  lastSeen: string;
  bio: string;
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
}

// Mock Data
const mockPetTwins: PetTwin[] = [
  {
    id: '1',
    name: 'Luna',
    species: 'Cane',
    breed: 'Golden Retriever',
    age: 3,
    location: 'Milano, IT',
    avatar: '/placeholder.svg',
    owner: 'Marco R.',
    matchScore: 94,
    behavioralDNA: ['Giocoso', 'Ansioso', 'Socievole', 'Energico'],
    commonTraits: ['Separazione difficile', 'Iperattivo al mattino', 'Ama l\'acqua'],
    differences: ['Più timido con estranei', 'Meno aggressivo con il cibo'],
    successStories: 3,
    lastActive: '2 ore fa'
  },
  {
    id: '2',
    name: 'Simba',
    species: 'Gatto',
    breed: 'Maine Coon',
    age: 2,
    location: 'Roma, IT',
    avatar: '/placeholder.svg',
    owner: 'Sofia M.',
    matchScore: 89,
    behavioralDNA: ['Indipendente', 'Curioso', 'Affettuoso', 'Notturno'],
    commonTraits: ['Miagola molto', 'Territorialità marcata', 'Ama i posti alti'],
    differences: ['Più socievole', 'Meno territoriale'],
    successStories: 2,
    lastActive: '1 giorno fa'
  },
  {
    id: '3',
    name: 'Buddy',
    species: 'Cane',
    breed: 'Labrador',
    age: 4,
    location: 'Torino, IT',
    avatar: '/placeholder.svg',
    owner: 'Andrea L.',
    matchScore: 87,
    behavioralDNA: ['Fedele', 'Protettivo', 'Goloso', 'Energico'],
    commonTraits: ['Eccesso di energia', 'Protezione della casa', 'Ama correre'],
    differences: ['Più obbediente', 'Meno abbaio'],
    successStories: 5,
    lastActive: '30 minuti fa'
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
    successRate: 96,
    totalMentorships: 45,
    rating: 4.9,
    isOnline: true,
    lastSeen: 'Online ora',
    bio: 'Veterinaria comportamentalista con 8 anni di esperienza. Specializzata in disturbi comportamentali e ansia.'
  },
  {
    id: '2',
    name: 'Luigi Bianchi',
    avatar: '/placeholder.svg',
    experience: 12,
    specialties: ['Aggressività', 'Cani di taglia grande', 'Riabilitazione'],
    location: 'Roma, IT',
    successRate: 94,
    totalMentorships: 67,
    rating: 4.8,
    isOnline: false,
    lastSeen: '2 ore fa',
    bio: 'Addestratore certificato con oltre 12 anni di esperienza nel recupero comportamentale.'
  },
  {
    id: '3',
    name: 'Maria Cattaneo',
    avatar: '/placeholder.svg',
    experience: 6,
    specialties: ['Gatti', 'Comportamento felino', 'Stress ambientale'],
    location: 'Napoli, IT',
    successRate: 92,
    totalMentorships: 34,
    rating: 4.7,
    isOnline: true,
    lastSeen: 'Online ora',
    bio: 'Esperta in comportamento felino e gestione dello stress nei gatti domestici.'
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
      'Monitoraggio e aggiustamenti'
    ],
    similarCases: 127,
    category: 'Comportamento'
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
    category: 'Energia'
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
    category: 'Socializzazione'
  }
];

export const PetMatchingIntelligence: React.FC = () => {
  const [selectedPetTwin, setSelectedPetTwin] = useState<PetTwin | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorMatch | null>(null);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'Medio': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      case 'Difficile': return 'bg-red-500/20 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      <Alert className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CheckCircle className="h-4 w-4 text-emerald-500" />
        <AlertDescription className="text-emerald-700 dark:text-emerald-300">
          🎉 Hai un nuovo match al 94% con Luna! Il vostro DNA comportamentale è incredibilmente simile.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="pet-twins" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="pet-twins" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Pet Gemelli
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mentori
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

        {/* Pet Twins Tab */}
        <TabsContent value="pet-twins" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {mockPetTwins.map((twin) => (
              <Card key={twin.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer border-azure/20 hover:border-azure/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-azure/30">
                        <AvatarImage src={twin.avatar} alt={twin.name} />
                        <AvatarFallback className="bg-azure/20 text-azure">
                          {twin.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{twin.name}</h3>
                        <p className="text-sm text-muted-foreground">{twin.breed}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-azure/20 text-azure border-azure/30">
                      {twin.matchScore}% Match
                    </Badge>
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
                      {twin.location}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">DNA Comportamentale:</h4>
                    <div className="flex flex-wrap gap-1">
                      {twin.behavioralDNA.map((trait, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Tratti Comuni:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {twin.commonTraits.slice(0, 2).map((trait, idx) => (
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedPetTwin(twin)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Dettagli
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-azure hover:bg-azure-dark"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Connetti
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockMentors.map((mentor) => (
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{mentor.bio}</p>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Specializzazioni:</h4>
                    <div className="flex flex-wrap gap-1">
                      {mentor.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {mentor.location}
                    </span>
                    <span>{mentor.totalMentorships} mentorships</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${mentor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-muted-foreground">{mentor.lastSeen}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedMentor(mentor)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Profilo
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Contatta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Success Patterns Tab */}
        <TabsContent value="success-patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {mockSuccessPatterns.map((pattern) => (
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
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Passi Principali:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {pattern.steps.slice(0, 3).map((step, idx) => (
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

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {pattern.category}
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Inizia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Progress Community Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" />
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
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gestione Energia</span>
                    <span className="text-sm font-medium">94% miglioramento</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Socializzazione</span>
                    <span className="text-sm font-medium">78% miglioramento</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Comportamento Alimentare</span>
                    <span className="text-sm font-medium">85% miglioramento</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  Storie di Successo
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
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Grazie al protocollo anti-ansia e al supporto del mentore, Max è passato da 8 ore di pianto a solo 10 minuti!"
                    </p>
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
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Il programma di socializzazione graduale ha permesso a Lucy di accettare finalmente altri gatti!"
                    </p>
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
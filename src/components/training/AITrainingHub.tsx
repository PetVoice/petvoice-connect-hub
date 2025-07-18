import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Award, 
  Users, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  Video,
  BarChart3,
  Lightbulb,
  Zap,
  Heart,
  ChevronRight,
  Star,
  MessageSquare,
  Download,
  Share,
  Sparkles,
  Timer,
  BookOpen,
  Eye,
  ThumbsUp,
  Rocket,
  Shield
} from 'lucide-react';

// Types
interface TrainingProtocol {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Facile' | 'Medio' | 'Difficile';
  duration: number; // giorni
  progress: number; // percentuale
  status: 'active' | 'completed' | 'paused' | 'available';
  petId: string;
  petName: string;
  petAvatar: string;
  targetBehavior: string;
  currentDay: number;
  totalDays: number;
  successRate: number;
  aiGenerated: boolean;
  triggers: string[];
  exercises: Exercise[];
  metrics: ProtocolMetrics;
  createdAt: string;
  lastUpdated: string;
  communityRating: number;
  communityUsage: number;
  mentorRecommended?: boolean;
  integrationSource?: 'analysis' | 'diary' | 'wellness' | 'matching' | 'manual';
}

interface Exercise {
  id: string;
  day: number;
  title: string;
  description: string;
  duration: number; // minuti
  type: 'physical' | 'mental' | 'behavioral' | 'social';
  instructions: string[];
  materials: string[];
  videoUrl?: string;
  completed: boolean;
  completedAt?: string;
  feedback?: string;
  effectiveness?: number;
}

interface ProtocolMetrics {
  behaviorImprovement: number;
  stressReduction: number;
  engagementLevel: number;
  ownerSatisfaction: number;
  veterinaryApproval?: boolean;
}

interface SuggestedProtocol {
  id: string;
  title: string;
  description: string;
  reason: string;
  source: string;
  confidence: number;
  estimatedSuccess: number;
  similarCases: number;
  category: string;
  difficulty: string;
  duration: number;
}

// Mock Data
const mockProtocols: TrainingProtocol[] = [
  {
    id: '1',
    title: 'Gestione Ansia da Separazione',
    description: 'Protocollo graduale per ridurre lo stress quando il pet rimane solo',
    category: 'Comportamento',
    difficulty: 'Medio',
    duration: 21,
    progress: 65,
    status: 'active',
    petId: 'pet1',
    petName: 'Luna',
    petAvatar: '/placeholder.svg',
    targetBehavior: 'Riduzione ansia da separazione',
    currentDay: 14,
    totalDays: 21,
    successRate: 78,
    aiGenerated: true,
    triggers: ['Ansia', 'Separazione', 'Stress'],
    exercises: [],
    metrics: {
      behaviorImprovement: 65,
      stressReduction: 70,
      engagementLevel: 80,
      ownerSatisfaction: 85,
      veterinaryApproval: true
    },
    createdAt: '2024-01-15',
    lastUpdated: '2024-01-29',
    communityRating: 4.6,
    communityUsage: 234,
    mentorRecommended: true,
    integrationSource: 'analysis'
  },
  {
    id: '2',
    title: 'Socializzazione Avanzata',
    description: 'Programma per migliorare le interazioni sociali con altri animali',
    category: 'Sociale',
    difficulty: 'Difficile',
    duration: 28,
    progress: 100,
    status: 'completed',
    petId: 'pet2',
    petName: 'Max',
    petAvatar: '/placeholder.svg',
    targetBehavior: 'Miglioramento socializzazione',
    currentDay: 28,
    totalDays: 28,
    successRate: 92,
    aiGenerated: true,
    triggers: ['Aggressività', 'Timidezza', 'Sociale'],
    exercises: [],
    metrics: {
      behaviorImprovement: 92,
      stressReduction: 85,
      engagementLevel: 88,
      ownerSatisfaction: 95
    },
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-28',
    communityRating: 4.8,
    communityUsage: 156,
    mentorRecommended: true,
    integrationSource: 'matching'
  },
  {
    id: '3',
    title: 'Controllo Impulsi Alimentari',
    description: 'Tecniche per gestire la voracità e migliorare le abitudini alimentari',
    category: 'Alimentazione',
    difficulty: 'Facile',
    duration: 14,
    progress: 35,
    status: 'active',
    petId: 'pet1',
    petName: 'Luna',
    petAvatar: '/placeholder.svg',
    targetBehavior: 'Controllo impulsi cibo',
    currentDay: 5,
    totalDays: 14,
    successRate: 85,
    aiGenerated: true,
    triggers: ['Voracità', 'Obesità', 'Impulsi'],
    exercises: [],
    metrics: {
      behaviorImprovement: 35,
      stressReduction: 40,
      engagementLevel: 75,
      ownerSatisfaction: 80
    },
    createdAt: '2024-01-25',
    lastUpdated: '2024-01-30',
    communityRating: 4.3,
    communityUsage: 89,
    integrationSource: 'diary'
  }
];

const mockSuggestedProtocols: SuggestedProtocol[] = [
  {
    id: 'suggested1',
    title: 'Gestione Rumori Forti',
    description: 'Protocollo per ridurre la sensibilità ai rumori improvvisi',
    reason: 'Rilevata sensibilità acustica nelle ultime analisi emotive',
    source: 'Analisi Emotiva AI',
    confidence: 87,
    estimatedSuccess: 82,
    similarCases: 156,
    category: 'Comportamento',
    difficulty: 'Medio',
    duration: 18
  },
  {
    id: 'suggested2',
    title: 'Aumento Attività Fisica',
    description: 'Programma per incrementare l\'esercizio quotidiano',
    reason: 'Basso livello di attività fisica registrato nel diario',
    source: 'Diario Comportamentale',
    confidence: 92,
    estimatedSuccess: 94,
    similarCases: 78,
    category: 'Fisico',
    difficulty: 'Facile',
    duration: 21
  },
  {
    id: 'suggested3',
    title: 'Miglioramento Qualità del Sonno',
    description: 'Tecniche per ottimizzare i cicli di riposo',
    reason: 'Wellness score in diminuzione negli ultimi 7 giorni',
    source: 'Monitoraggio Benessere',
    confidence: 78,
    estimatedSuccess: 79,
    similarCases: 234,
    category: 'Benessere',
    difficulty: 'Facile',
    duration: 14
  }
];

export const AITrainingHub: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProtocol, setSelectedProtocol] = useState<TrainingProtocol | null>(null);
  const [showProtocolCreator, setShowProtocolCreator] = useState(false);

  // Filtered protocols
  const filteredProtocols = useMemo(() => {
    return mockProtocols.filter(protocol => {
      const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           protocol.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           protocol.petName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || protocol.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || protocol.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, categoryFilter, statusFilter]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'Medio': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      case 'Difficile': return 'bg-red-500/20 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-700 border-blue-500/20';
      case 'completed': return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'paused': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      case 'available': return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'available': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStartProtocol = (protocolId: string) => {
    toast({
      title: "Protocollo Avviato!",
      description: "Il protocollo di training è stato avviato con successo.",
    });
  };

  const handleAcceptSuggestion = (suggestion: SuggestedProtocol) => {
    toast({
      title: "Protocollo Creato!",
      description: `"${suggestion.title}" è stato aggiunto ai tuoi protocolli attivi.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions Alert */}
      <Alert className="border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <AlertDescription className="text-purple-700 dark:text-purple-300">
          🎯 L'AI ha analizzato i dati del tuo pet e ha trovato 3 nuovi protocolli consigliati basati sui comportamenti recenti.
        </AlertDescription>
      </Alert>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca protocolli, pet, categorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            <SelectItem value="Comportamento">Comportamento</SelectItem>
            <SelectItem value="Sociale">Sociale</SelectItem>
            <SelectItem value="Fisico">Fisico</SelectItem>
            <SelectItem value="Alimentazione">Alimentazione</SelectItem>
            <SelectItem value="Benessere">Benessere</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli status</SelectItem>
            <SelectItem value="active">Attivi</SelectItem>
            <SelectItem value="completed">Completati</SelectItem>
            <SelectItem value="paused">In pausa</SelectItem>
            <SelectItem value="available">Disponibili</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={() => setShowProtocolCreator(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crea Protocollo
        </Button>
      </div>

      <Tabs defaultValue="protocols" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="protocols" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Protocolli
            <Badge variant="secondary" className="ml-1">
              {filteredProtocols.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Suggerimenti AI
            <Badge variant="secondary" className="ml-1">
              {mockSuggestedProtocols.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community
          </TabsTrigger>
        </TabsList>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProtocols.map((protocol) => (
              <Card key={protocol.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                        <AvatarImage src={protocol.petAvatar} alt={protocol.petName} />
                        <AvatarFallback className="bg-purple-500/20 text-purple-700">
                          {protocol.petName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm">{protocol.title}</h3>
                        <p className="text-xs text-muted-foreground">{protocol.petName}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getStatusColor(protocol.status)}>
                        {getStatusIcon(protocol.status)}
                        <span className="ml-1 capitalize">{protocol.status}</span>
                      </Badge>
                      {protocol.aiGenerated && (
                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {protocol.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">{protocol.progress}%</span>
                    </div>
                    <Progress value={protocol.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Giorno {protocol.currentDay}/{protocol.totalDays}</span>
                      <span>Successo: {protocol.successRate}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Badge className={getDifficultyColor(protocol.difficulty)}>
                      {protocol.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {protocol.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Timer className="h-3 w-3 mr-1" />
                      {protocol.duration}g
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{protocol.communityRating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{protocol.communityUsage}</span>
                    </div>
                    {protocol.mentorRecommended && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-green-500" />
                        <span>Mentore</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Dettagli
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={protocol.petAvatar} alt={protocol.petName} />
                              <AvatarFallback>{protocol.petName.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h2 className="text-xl font-bold">{protocol.title}</h2>
                              <p className="text-sm text-muted-foreground">{protocol.petName} • {protocol.category}</p>
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Progress Overview */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{protocol.progress}%</div>
                              <div className="text-sm text-muted-foreground">Completato</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{protocol.successRate}%</div>
                              <div className="text-sm text-muted-foreground">Successo</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{protocol.currentDay}</div>
                              <div className="text-sm text-muted-foreground">Giorno Attuale</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">{protocol.communityRating}</div>
                              <div className="text-sm text-muted-foreground">Rating Community</div>
                            </div>
                          </div>

                          {/* Metrics */}
                          <div>
                            <h3 className="font-semibold mb-3">Metriche di Performance</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Miglioramento Comportamentale</span>
                                  <span>{protocol.metrics.behaviorImprovement}%</span>
                                </div>
                                <Progress value={protocol.metrics.behaviorImprovement} className="h-2" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Riduzione Stress</span>
                                  <span>{protocol.metrics.stressReduction}%</span>
                                </div>
                                <Progress value={protocol.metrics.stressReduction} className="h-2" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Livello di Coinvolgimento</span>
                                  <span>{protocol.metrics.engagementLevel}%</span>
                                </div>
                                <Progress value={protocol.metrics.engagementLevel} className="h-2" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Soddisfazione Proprietario</span>
                                  <span>{protocol.metrics.ownerSatisfaction}%</span>
                                </div>
                                <Progress value={protocol.metrics.ownerSatisfaction} className="h-2" />
                              </div>
                            </div>
                          </div>

                          {/* Triggers */}
                          <div>
                            <h3 className="font-semibold mb-3">Trigger Identificati</h3>
                            <div className="flex flex-wrap gap-2">
                              {protocol.triggers.map((trigger, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Integration Source */}
                          <div>
                            <h3 className="font-semibold mb-3">Fonte di Integrazione</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <Zap className="h-4 w-4 text-blue-500" />
                              <span>Generato da: </span>
                              <Badge variant="outline">
                                {protocol.integrationSource === 'analysis' && 'Analisi Emotiva'}
                                {protocol.integrationSource === 'diary' && 'Diario Comportamentale'}
                                {protocol.integrationSource === 'wellness' && 'Monitoraggio Benessere'}
                                {protocol.integrationSource === 'matching' && 'Pet Matching'}
                                {protocol.integrationSource === 'manual' && 'Creazione Manuale'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {protocol.status === 'active' && (
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <Play className="h-4 w-4 mr-1" />
                        Continua
                      </Button>
                    )}
                    
                    {protocol.status === 'available' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStartProtocol(protocol.id)}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Rocket className="h-4 w-4 mr-1" />
                        Avvia
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {mockSuggestedProtocols.map((suggestion) => (
              <Card key={suggestion.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold">{suggestion.title}</h3>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-700">
                      {suggestion.confidence}% Confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Perché consigliato:</strong> {suggestion.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>{suggestion.source}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Successo stimato:</span>
                      <div className="font-semibold text-green-600">{suggestion.estimatedSuccess}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Casi simili:</span>
                      <div className="font-semibold">{suggestion.similarCases}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Badge className={getDifficultyColor(suggestion.difficulty)}>
                      {suggestion.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Timer className="h-3 w-3 mr-1" />
                      {suggestion.duration}g
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Anteprima
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Accetta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Efficacia Media Protocolli</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">87%</div>
                <p className="text-sm text-muted-foreground">+5% rispetto al mese scorso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tempo Medio Completamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">18.5</div>
                <p className="text-sm text-muted-foreground">giorni per protocollo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Soddisfazione Utenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">4.7</div>
                <p className="text-sm text-muted-foreground">rating medio su 5</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-4">
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Community Protocolli</h3>
            <p className="text-muted-foreground mb-4">
              Scopri i protocolli più utilizzati e valutati dalla community
            </p>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Esplora Community
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
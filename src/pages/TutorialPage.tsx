import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  Users, 
  Award, 
  Search, 
  Play,
  Clock,
  CheckCircle,
  Star,
  Target,
  Lightbulb,
  Download,
  Heart,
  Brain,
  TrendingUp,
  Shield,
  MessageSquare,
  Zap,
  Trophy,
  Calendar,
  FileText,
  Headphones,
  Monitor,
  Smartphone,
  Globe,
  ChevronRight,
  PlayCircle,
  BookmarkPlus,
  Share2
} from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ReactNode;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  color: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'guide' | 'interactive';
  difficulty: 'easy' | 'medium' | 'hard';
  views: number;
  rating: number;
  thumbnail: string;
  isCompleted: boolean;
  tags: string[];
}

const TutorialPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('paths');
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set(['1']));
  const [bookmarkedTutorials, setBookmarkedTutorials] = useState<Set<string>>(new Set());
  const [userProgress, setUserProgress] = useState({
    totalWatchTime: 12,
    currentStreak: 3,
    totalPoints: 150,
    level: 'Principiante',
    nextLevelProgress: 25
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Getting Started',
      description: 'Impara le basi di PetVoice e configura il tuo primo animale domestico',
      level: 'Beginner',
      icon: <Zap className="h-5 w-5" />,
      progress: 0,
      totalLessons: 8,
      completedLessons: 0,
      estimatedTime: '2 ore',
      color: 'bg-green-500'
    },
    {
      id: '2',
      title: 'Analysis Master',
      description: 'Diventa esperto nell\'analisi comportamentale e nell\'interpretazione dei risultati',
      level: 'Intermediate',
      icon: <Brain className="h-5 w-5" />,
      progress: 0,
      totalLessons: 12,
      completedLessons: 0,
      estimatedTime: '4 ore',
      color: 'bg-blue-500'
    },
    {
      id: '3',
      title: 'Diary Expert',
      description: 'Padroneggia il diario digitale e il tracking dell\'umore del tuo pet',
      level: 'Intermediate',
      icon: <BookOpen className="h-5 w-5" />,
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
      estimatedTime: '3 ore',
      color: 'bg-purple-500'
    },
    {
      id: '4',
      title: 'Health Guardian',
      description: 'Gestisci cartelle mediche, comunicazioni veterinarie e preparazione emergenze',
      level: 'Advanced',
      icon: <Shield className="h-5 w-5" />,
      progress: 0,
      totalLessons: 15,
      completedLessons: 0,
      estimatedTime: '5 ore',
      color: 'bg-red-500'
    },
    {
      id: '5',
      title: 'Data Detective',
      description: 'Analizza trend, interpreta dati e prendi decisioni informate',
      level: 'Advanced',
      icon: <TrendingUp className="h-5 w-5" />,
      progress: 0,
      totalLessons: 18,
      completedLessons: 0,
      estimatedTime: '6 ore',
      color: 'bg-orange-500'
    },
    {
      id: '6',
      title: 'Community Leader',
      description: 'Partecipa efficacemente alla community e aiuta altri utenti',
      level: 'Intermediate',
      icon: <Users className="h-5 w-5" />,
      progress: 0,
      totalLessons: 8,
      completedLessons: 0,
      estimatedTime: '3 ore',
      color: 'bg-cyan-500'
    }
  ];

  const featuredTutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Come configurare il tuo primo pet',
      description: 'Guida completa per aggiungere e configurare il profilo del tuo animale domestico',
      duration: '8:45',
      type: 'video',
      difficulty: 'easy',
      views: 12450,
      rating: 4.8,
      thumbnail: '/api/placeholder/400/225',
      isCompleted: true,
      tags: ['setup', 'beginner', 'profile']
    },
    {
      id: '2',
      title: 'Interpretare i risultati dell\'analisi comportamentale',
      description: 'Scopri come leggere e comprendere i dati dall\'analisi del comportamento',
      duration: '15:30',
      type: 'video',
      difficulty: 'medium',
      views: 8920,
      rating: 4.9,
      thumbnail: '/api/placeholder/400/225',
      isCompleted: false,
      tags: ['analysis', 'behavior', 'intermediate']
    },
    {
      id: '3',
      title: 'Gestione efficace del diario digitale',
      description: 'Best practices per tracciare l\'umore e le attività del tuo pet',
      duration: '12:15',
      type: 'interactive',
      difficulty: 'easy',
      views: 6780,
      rating: 4.7,
      thumbnail: '/api/placeholder/400/225',
      isCompleted: false,
      tags: ['diary', 'tracking', 'mood']
    },
    {
      id: '4',
      title: 'Preparazione per emergenze veterinarie',
      description: 'Come organizzare le informazioni mediche per situazioni di emergenza',
      duration: '20:10',
      type: 'guide',
      difficulty: 'hard',
      views: 4560,
      rating: 4.6,
      thumbnail: '/api/placeholder/400/225',
      isCompleted: false,
      tags: ['emergency', 'medical', 'advanced']
    }
  ];

  const achievements = [
    { id: '1', title: 'Primo Passo', description: 'Completato il primo tutorial', icon: <Trophy className="h-4 w-4" />, earned: true },
    { id: '2', title: 'Analista Novizio', description: 'Completate 5 analisi', icon: <Target className="h-4 w-4" />, earned: true },
    { id: '3', title: 'Diarista Attivo', description: '7 giorni consecutivi di diary', icon: <BookOpen className="h-4 w-4" />, earned: false },
    { id: '4', title: 'Community Helper', description: 'Aiutato 3 utenti nella community', icon: <Heart className="h-4 w-4" />, earned: false }
  ];

  // Funzioni per gestire le interazioni
  const handleStartLearningPath = (pathId: string) => {
    toast({
      title: "Percorso Iniziato",
      description: "Benvenuto nel tuo percorso di apprendimento!",
    });
    // Simula l'avvio del percorso
    setTimeout(() => {
      navigate('/tutorial');
    }, 1000);
  };

  const handleWatchTutorial = (tutorialId: string) => {
    toast({
      title: "Tutorial Avviato",
      description: "Il tutorial si sta caricando...",
    });
    
    // Simula la visualizzazione del tutorial
    setTimeout(() => {
      setCompletedTutorials(prev => new Set([...prev, tutorialId]));
      setUserProgress(prev => ({
        ...prev,
        totalWatchTime: prev.totalWatchTime + 8,
        totalPoints: prev.totalPoints + 25,
        nextLevelProgress: Math.min(prev.nextLevelProgress + 5, 100)
      }));
      
      toast({
        title: "Tutorial Completato!",
        description: "Hai guadagnato 25 punti!",
      });
    }, 2000);
  };

  const handleBookmarkTutorial = (tutorialId: string) => {
    setBookmarkedTutorials(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(tutorialId)) {
        newBookmarks.delete(tutorialId);
        toast({
          title: "Rimosso dai Segnalibri",
          description: "Tutorial rimosso dai tuoi segnalibri",
        });
      } else {
        newBookmarks.add(tutorialId);
        toast({
          title: "Aggiunto ai Segnalibri",
          description: "Tutorial salvato nei tuoi segnalibri",
        });
      }
      return newBookmarks;
    });
  };

  const handleNavigateToPets = () => {
    navigate('/pets');
  };

  const handleNavigateToAnalysis = () => {
    navigate('/analysis');
  };

  const handleStartGuide = (guideTitle: string) => {
    toast({
      title: "Guida Avviata",
      description: `Iniziando: ${guideTitle}`,
    });
  };

  const handleStartExercise = (exerciseTitle: string) => {
    toast({
      title: "Esercizio Avviato",
      description: `Avviando: ${exerciseTitle}`,
    });
  };

  const handleJoinCommunity = () => {
    navigate('/community');
  };

  const handleDownloadCertificate = () => {
    toast({
      title: "Download Iniziato",
      description: "Il certificato verrà scaricato a breve...",
    });
  };

  // Filtra i tutorial in base alla ricerca e ai filtri
  const filteredTutorials = featuredTutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || tutorial.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Aggiorna le statistiche utente
  const userStats = {
    totalWatchTime: `${userProgress.totalWatchTime} min`,
    completedTutorials: completedTutorials.size,
    currentStreak: userProgress.currentStreak,
    totalPoints: userProgress.totalPoints,
    level: userProgress.level,
    nextLevelProgress: userProgress.nextLevelProgress
  };

  // Aggiorna i percorsi di apprendimento con progresso
  const updatedLearningPaths = learningPaths.map(path => ({
    ...path,
    progress: path.id === '1' ? 25 : 0,
    completedLessons: path.id === '1' ? 2 : 0
  }));

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section with Progress Overview */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <GraduationCap className="h-8 w-8" />
              Accademia di Apprendimento
            </h1>
            <p className="text-white/90 text-lg mb-4">
              Padroneggia PetVoice con la nostra piattaforma di apprendimento completa
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{userStats.totalWatchTime} guardati</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>{userStats.completedTutorials} completati</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>{userStats.currentStreak} giorni consecutivi</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>{userStats.totalPoints} punti</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso Livello</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {userStats.level}
              </Badge>
            </div>
            <Progress value={userStats.nextLevelProgress} className="mb-2" />
            <p className="text-xs text-white/80">
              {100 - userStats.nextLevelProgress}% al prossimo livello
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca tutorial, guide, argomenti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'video', 'guide', 'interactive'].map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className="capitalize"
            >
              {filter === 'all' ? 'Tutti' : filter}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="paths" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="paths" onClick={() => setActiveTab('paths')}>Percorsi di Apprendimento</TabsTrigger>
          <TabsTrigger value="library" onClick={() => setActiveTab('library')}>Libreria Video</TabsTrigger>
          <TabsTrigger value="guides" onClick={() => setActiveTab('guides')}>Guide</TabsTrigger>
          <TabsTrigger value="practice" onClick={() => setActiveTab('practice')}>Pratica</TabsTrigger>
          <TabsTrigger value="community" onClick={() => setActiveTab('community')}>Community</TabsTrigger>
        </TabsList>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {updatedLearningPaths.map((path) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStartLearningPath(path.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${path.color} text-white w-fit`}>
                      {path.icon}
                    </div>
                    <Badge 
                      variant={path.level === 'Beginner' ? 'default' : path.level === 'Intermediate' ? 'secondary' : 'destructive'}
                    >
                      {path.level === 'Beginner' ? 'Principiante' : path.level === 'Intermediate' ? 'Intermedio' : 'Avanzato'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{path.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{path.completedLessons}/{path.totalLessons} lezioni</span>
                      <span>{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{path.estimatedTime}</span>
                    </div>
                    <Button size="sm" className="h-8" onClick={(e) => {
                      e.stopPropagation();
                      handleStartLearningPath(path.id);
                    }}>
                      {path.progress > 0 ? 'Continua' : 'Inizia'}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Start Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Prossimi Passi Consigliati
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Completa il Profilo del tuo Pet</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Aggiungi più dettagli per ottenere risultati di analisi migliori
                </p>
                <Button size="sm" variant="outline" onClick={handleNavigateToPets}>
                  Vai ai Pet <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Prova la tua Prima Analisi</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Carica una foto o video per l'analisi comportamentale
                </p>
                <Button size="sm" variant="outline" onClick={handleNavigateToAnalysis}>
                  Inizia Analisi <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTutorials.map((tutorial) => {
              const isCompleted = completedTutorials.has(tutorial.id);
              const isBookmarked = bookmarkedTutorials.has(tutorial.id);
              
              return (
              <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-primary" />
                  </div>
                  {isCompleted && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {tutorial.duration}
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium line-clamp-2 flex-1">{tutorial.title}</h4>
                    <Badge
                      variant={tutorial.type === 'video' ? 'default' : tutorial.type === 'interactive' ? 'secondary' : 'outline'}
                      className="ml-2 shrink-0"
                    >
                      {tutorial.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tutorial.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{tutorial.rating}</span>
                    </div>
                    <span>{tutorial.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {tutorial.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={() => handleWatchTutorial(tutorial.id)}>
                      <Play className="h-3 w-3 mr-1" />
                      {isCompleted ? 'Riguarda' : 'Guarda'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant={isBookmarked ? "default" : "outline"}
                      onClick={() => handleBookmarkTutorial(tutorial.id)}
                    >
                      <BookmarkPlus className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Guide Passo-passo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  'Configurazione del profilo pet per risultati ottimali',
                  'Comprensione dei report di analisi comportamentale',
                  'Creazione di voci del diario efficaci',
                  'Gestione di cartelle mediche e appuntamenti',
                  'Interpretazione dei punteggi e trend di benessere'
                ].map((guide, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleStartGuide(guide)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{guide}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Downloadable Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Pet Emergency Checklist', type: 'PDF', size: '2.3 MB' },
                  { title: 'Behavior Analysis Quick Reference', type: 'PDF', size: '1.8 MB' },
                  { title: 'Veterinary Communication Template', type: 'DOC', size: '0.5 MB' },
                  { title: 'Daily Care Tracking Sheet', type: 'PDF', size: '1.2 MB' }
                ].map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium">{resource.title}</h4>
                      <p className="text-xs text-muted-foreground">{resource.type} • {resource.size}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleDownloadCertificate}>
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Interactive Demos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Try features in a safe sandbox environment with demo data
                </p>
                <Button className="w-full" onClick={() => handleStartExercise('Demo Environment')}>Launch Demo Environment</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Skill Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Test your knowledge with interactive quizzes and get personalized feedback
                </p>
                <Button className="w-full" variant="outline" onClick={() => handleStartExercise('Skill Assessment')}>Start Assessment</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Practice Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Work through real-world scenarios and learn best practices
                </p>
                <Button className="w-full" variant="outline" onClick={() => handleStartExercise('Practice Scenarios')}>Browse Scenarios</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Expert Office Hours</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Join weekly sessions with veterinarians and pet behaviorists
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Next session: Today at 3:00 PM</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Study Groups</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect with other users learning similar topics
                  </p>
                  <Button size="sm" variant="outline" className="w-full" onClick={handleJoinCommunity}>
                    Find Study Group
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  User-Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Share Your Tutorial</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create and share tutorials with the community
                  </p>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleStartExercise('Create Tutorial')}>
                    Create Tutorial
                  </Button>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleJoinCommunity}>
                  <h4 className="font-medium mb-2">Top Community Tutorials</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse the best user-created content
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 border rounded-lg text-center ${
                  achievement.earned ? 'bg-primary/5 border-primary/20' : 'bg-muted/5'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  achievement.earned ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {achievement.icon}
                </div>
                <h4 className="font-medium mb-1">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {achievement.earned && (
                  <Badge className="mt-2">Earned</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Need Help?</h3>
                <p className="text-sm text-muted-foreground">Get support from our team</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/support')}>Contact Support</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Share Progress</h3>
                <p className="text-sm text-muted-foreground">Show your achievements</p>
              </div>
              <Button variant="outline" onClick={() => {
                toast({
                  title: "Progress Shared!",
                  description: "Your achievements have been shared successfully",
                });
              }}>Share</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorialPage;
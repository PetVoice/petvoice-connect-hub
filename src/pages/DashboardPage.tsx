import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Heart, 
  PawPrint, 
  Microscope, 
  Calendar, 
  Plus,
  TrendingUp,
  Activity,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { DiaryEntryForm } from '@/components/diary/DiaryEntryForm';

interface PetStats {
  totalAnalyses: number;
  recentAnalyses: number;
  wellnessScore: number;
  moodTrend: number;
  healthStatus: string;
  diaryEntries: number;
  calendarEvents: number;
  healthMetrics: number;
  recentHealthMetrics: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, selectedPet } = usePets();
  const navigate = useNavigate();
  const [petStats, setPetStats] = useState<PetStats>({
    totalAnalyses: 0,
    recentAnalyses: 0,
    wellnessScore: 0,
    moodTrend: 0,
    healthStatus: 'N/A',
    diaryEntries: 0,
    calendarEvents: 0,
    healthMetrics: 0,
    recentHealthMetrics: 0
  });
  const [loading, setLoading] = useState(false);
  const [showDiaryDialog, setShowDiaryDialog] = useState(false);

  const quickActions = [
    {
      title: 'Analisi',
      description: 'Analizza il comportamento del tuo pet',
      icon: Microscope,
      onClick: () => navigate('/analysis'),
      color: 'from-primary to-primary/80'
    },
    {
      title: 'Diario',
      description: 'Monitora la salute quotidiana',
      icon: PawPrint,
      onClick: () => navigate('/diary'),
      color: 'from-primary/80 to-primary/60'
    },
    {
      title: 'Calendario',
      description: 'Gestisci appuntamenti ed eventi',
      icon: Calendar,
      onClick: () => navigate('/calendar'),
      color: 'from-primary/60 to-primary/40'
    },
    {
      title: 'Benessere',
      description: 'Monitora salute e benessere',
      icon: Heart,
      onClick: () => navigate('/wellness'),
      color: 'from-primary/40 to-primary/20'
    }
  ];

  // Load pet statistics when selectedPet changes
  useEffect(() => {
    const loadPetStats = async () => {
      if (!selectedPet || !user) {
        setPetStats({
          totalAnalyses: 0,
          recentAnalyses: 0,
          wellnessScore: 0,
          moodTrend: 0,
          healthStatus: 'N/A',
          diaryEntries: 0,
          calendarEvents: 0,
          healthMetrics: 0,
          recentHealthMetrics: 0
        });
        return;
      }

      setLoading(true);
      try {
        const today = new Date();
        const lastWeek = subDays(today, 7);

        // Get pet analyses
        const { data: analyses } = await supabase
          .from('pet_analyses')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Get diary entries
        const { data: diaryEntries } = await supabase
          .from('diary_entries')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id);

        // Get calendar events
        const { data: calendarEvents } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id);

        // Get health metrics
        const { data: healthMetrics } = await supabase
          .from('health_metrics')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false });

        const totalAnalyses = analyses?.length || 0;
        const recentAnalyses = analyses?.filter(a => 
          new Date(a.created_at) >= lastWeek
        ).length || 0;

        const recentHealthMetrics = healthMetrics?.filter(h => 
          new Date(h.recorded_at) >= lastWeek
        ).length || 0;

        // Calculate wellness score based on recent analyses
        let wellnessScore = 0;
        let healthStatus = 'N/A';

        if (analyses && analyses.length > 0) {
          const emotionScores: Record<string, number> = {
            'felice': 90,
            'calmo': 85,
            'giocoso': 88,
            'eccitato': 75,
            'ansioso': 40,
            'triste': 30,
            'aggressivo': 25
          };

          const recentAnalysesForScore = analyses.slice(0, 10);
          const avgScore = recentAnalysesForScore.reduce((sum, analysis) => {
            const emotionScore = emotionScores[analysis.primary_emotion] || 50;
            const confidenceBonus = (analysis.primary_confidence - 50) / 100 * 20;
            return sum + emotionScore + confidenceBonus;
          }, 0) / recentAnalysesForScore.length;

          wellnessScore = Math.round(Math.max(0, Math.min(100, avgScore)));
          
          if (wellnessScore >= 80) healthStatus = 'Eccellente';
          else if (wellnessScore >= 60) healthStatus = 'Buono';
          else if (wellnessScore >= 40) healthStatus = 'Discreto';
          else healthStatus = 'Preoccupante';
        }

        // Calculate mood trend (compare last 5 vs previous 5 analyses)
        let moodTrend = 0;
        if (analyses && analyses.length >= 5) {
          const recent = analyses.slice(0, 5);
          const previous = analyses.slice(5, 10);
          
          if (previous.length > 0) {
            const emotionScores: Record<string, number> = {
              'felice': 90, 'calmo': 85, 'giocoso': 88, 'eccitato': 75,
              'ansioso': 40, 'triste': 30, 'aggressivo': 25
            };
            
            const recentAvg = recent.reduce((sum, a) => 
              sum + (emotionScores[a.primary_emotion] || 50), 0) / recent.length;
            const previousAvg = previous.reduce((sum, a) => 
              sum + (emotionScores[a.primary_emotion] || 50), 0) / previous.length;
            
            moodTrend = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
          }
        }

        setPetStats({
          totalAnalyses,
          recentAnalyses,
          wellnessScore,
          moodTrend,
          healthStatus,
          diaryEntries: diaryEntries?.length || 0,
          calendarEvents: calendarEvents?.length || 0,
          healthMetrics: healthMetrics?.length || 0,
          recentHealthMetrics
        });

      } catch (error) {
        console.error('Error loading pet stats:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento delle statistiche",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPetStats();
  }, [selectedPet, user]);

  const handleExportData = () => {
    toast({
      title: "Feature in arrivo",
      description: "L'esportazione dati sarà disponibile presto"
    });
  };

  if (!selectedPet) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Welcome Section for no pet selected */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Benvenuto su PetVoice
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gestisci la salute e il benessere dei tuoi compagni animali con l'intelligenza artificiale
          </p>
        </div>

        {/* Getting Started */}
        {pets.length === 0 && (
          <Card className="border-dashed border-2">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <PawPrint className="h-6 w-6 text-foreground" />
              </div>
              <CardTitle>Nessun pet aggiunto</CardTitle>
              <CardDescription>
                Aggiungi il tuo primo pet per iniziare a usare la dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => navigate('/pets?add=true')} 
                data-guide="pet-selector"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Pet
              </Button>
            </CardContent>
          </Card>
        )}

        {pets.length > 0 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Seleziona un Pet</CardTitle>
              <CardDescription>
                Seleziona un pet dalla sidebar per visualizzare la dashboard
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard - {selectedPet.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Monitora la salute e il benessere completo del tuo pet
        </p>
      </div>

      {/* Selected Pet Info */}
      <Card className="bg-gradient-subtle border-0 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl">
                {selectedPet.type?.toLowerCase().includes('cane') ? '🐕' : 
                 selectedPet.type?.toLowerCase().includes('gatto') ? '🐱' : '🐾'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl">{selectedPet.name}</h2>
              <p className="text-muted-foreground">
                {selectedPet.type?.toLowerCase() === 'cane' ? 'Cane' : selectedPet.type} • {selectedPet.breed} • {selectedPet.birth_date ? new Date().getFullYear() - new Date(selectedPet.birth_date).getFullYear() : '?'} anni
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-foreground" />
            Azioni Rapide
          </CardTitle>
          <CardDescription>
            Accedi rapidamente alle funzionalità principali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-elegant transition-all"
                onClick={action.onClick}
              >
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <action.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Analisi Totali
            </CardTitle>
            <Microscope className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{petStats.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              {petStats.recentAnalyses} questa settimana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Score Benessere
            </CardTitle>
            <Heart className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              petStats.wellnessScore > 0 ?
                petStats.wellnessScore >= 80 ? 'text-success' :
                petStats.wellnessScore >= 60 ? 'text-primary' :
                petStats.wellnessScore >= 40 ? 'text-warning' : 'text-destructive'
                : 'text-foreground'
            }`}>
              {petStats.wellnessScore > 0 ? `${petStats.wellnessScore}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {petStats.healthStatus}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Trend Umore
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              petStats.moodTrend !== 0 ?
                petStats.moodTrend > 0 ? 'text-success' : 'text-destructive'
                : 'text-foreground'
            }`}>
              {petStats.moodTrend !== 0 ? 
                `${petStats.moodTrend > 0 ? '+' : ''}${petStats.moodTrend}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {petStats.moodTrend !== 0 ? 
                `${petStats.moodTrend > 0 ? 'Miglioramento' : 'Peggioramento'} recente` :
                'Serve più storico'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Metriche Salute</CardTitle>
            <Activity className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{petStats.healthMetrics}</div>
            <p className="text-xs text-muted-foreground">
              {petStats.recentHealthMetrics} questa settimana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Voci Diario</CardTitle>
            <PawPrint className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{petStats.diaryEntries}</div>
            <p className="text-xs text-muted-foreground">
              Registrazioni di {selectedPet.name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Eventi Calendario</CardTitle>
            <Calendar className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{petStats.calendarEvents}</div>
            <p className="text-xs text-muted-foreground">
              Appuntamenti pianificati
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => setShowDiaryDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Voce Diario
        </Button>
        <Button onClick={handleExportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Esporta Dati
        </Button>
      </div>

      {/* Dialogs */}
      <Dialog open={showDiaryDialog} onOpenChange={setShowDiaryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Voce al Diario</DialogTitle>
          </DialogHeader>
          {selectedPet && (
            <DiaryEntryForm
              isOpen={showDiaryDialog}
              petId={selectedPet.id}
              userId={user?.id}
              onClose={() => setShowDiaryDialog(false)}
              onSave={(data) => {
                console.log('Diary entry saved:', data);
                setShowDiaryDialog(false);
                toast({
                  title: "Successo",
                  description: "Voce del diario aggiunta con successo"
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
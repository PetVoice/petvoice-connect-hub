import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  PawPrint, 
  Microscope, 
  Calendar, 
  BarChart3,
  Plus,
  TrendingUp,
  Activity,
  Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, subDays } from 'date-fns';
// Translation system removed - Italian only

interface PetStats {
  totalAnalyses: number;
  recentAnalyses: number;
  wellnessScore: number;
  moodTrend: number;
  healthStatus: string;
  diaryEntries: number;
  calendarEvents: number;
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
    calendarEvents: 0
  });
  const [loading, setLoading] = useState(false);
  // Translation system removed - Italian only

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
    }
  ];

  // Load pet statistics when selectedPet changes
  useEffect(() => {
    console.log('📊 DashboardPage: loading stats for pet:', selectedPet?.name, 'user:', user?.id);
    const loadPetStats = async () => {
      if (!selectedPet || !user) {
        setPetStats({
          totalAnalyses: 0,
          recentAnalyses: 0,
          wellnessScore: 0,
          moodTrend: 0,
          healthStatus: 'N/A',
          diaryEntries: 0,
          calendarEvents: 0
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

        const totalAnalyses = analyses?.length || 0;
        const recentAnalyses = analyses?.filter(a => 
          new Date(a.created_at) >= lastWeek
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
          calendarEvents: calendarEvents?.length || 0
        });

      } catch (error) {
        console.error('Error loading pet stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPetStats();
  }, [selectedPet, user]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Benvenuto su PetVoice
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Gestisci la salute e il benessere dei tuoi compagni animali con l'intelligenza artificiale
        </p>
      </div>

      {/* Selected Pet Info */}
      {selectedPet && (
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
      )}

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {selectedPet ? 'Analisi Totali' : 'Pet Registrati'}
            </CardTitle>
            <Microscope className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedPet ? petStats.totalAnalyses : pets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedPet ? 
                `${petStats.recentAnalyses} questa settimana` : 
                pets.length === 1 ? '1 pet nella famiglia' : `${pets.length} pet nella famiglia`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {selectedPet ? 'Score Benessere' : 'Voci Diario'}
            </CardTitle>
            <Heart className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              selectedPet && petStats.wellnessScore > 0 ?
                petStats.wellnessScore >= 80 ? 'text-success' :
                petStats.wellnessScore >= 60 ? 'text-primary' :
                petStats.wellnessScore >= 40 ? 'text-warning' : 'text-destructive'
                : 'text-foreground'
            }`}>
              {selectedPet ? 
                petStats.wellnessScore > 0 ? `${petStats.wellnessScore}%` : 'N/A' :
                petStats.diaryEntries
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedPet ? 
                petStats.healthStatus : 
                'Monitoraggio quotidiano'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {selectedPet ? 'Trend Umore' : 'Eventi Calendario'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              selectedPet && petStats.moodTrend !== 0 ?
                petStats.moodTrend > 0 ? 'text-success' : 'text-destructive'
                : 'text-foreground'
            }`}>
              {selectedPet ? 
                petStats.moodTrend !== 0 ? 
                  `${petStats.moodTrend > 0 ? '+' : ''}${petStats.moodTrend}%` : 
                  'N/A' :
                petStats.calendarEvents
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedPet ? 
                petStats.moodTrend !== 0 ? 
                  `${petStats.moodTrend > 0 ? 'Miglioramento' : 'Peggioramento'} recente` :
                  'Serve più storico' :
                'Appuntamenti pianificati'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Voci Diario</CardTitle>
            <Calendar className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{petStats.diaryEntries}</div>
            <p className="text-xs text-muted-foreground">
              {selectedPet ? 
                `Registrazioni di ${selectedPet.name}` :
                'Seleziona un pet'
              }
            </p>
          </CardContent>
        </Card>
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
              Aggiungi il tuo primo pet per iniziare
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => {
                console.log('Navigating to pets page with add=true');
                navigate('/pets?add=true');
              }} 
              data-guide="pet-selector"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Pet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  Calendar, 
  PawPrint, 
  Microscope, 
  BookOpen, 
  BarChart3,
  ArrowRight,
  Clock,
  Star,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  avatar_url: string | null;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [userProfile, setUserProfile] = useState<{ display_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();
        
        setUserProfile(profile);

        // Fetch user's pets
        const { data: petsData } = await supabase
          .from('pets')
          .select('id, name, type, breed, avatar_url')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        if (petsData) {
          setPets(petsData);
          
          // Controlla se c'è un pet selezionato nel localStorage
          const selectedPetId = localStorage.getItem('petvoice-selected-pet');
          const selectedPet = selectedPetId ? petsData.find(pet => pet.id === selectedPetId) : null;
          
          if (selectedPet) {
            setActivePet(selectedPet);
          } else if (petsData.length > 0) {
            setActivePet(petsData[0]);
            // Salva il primo pet come selezionato se non ce n'è uno
            localStorage.setItem('petvoice-selected-pet', petsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Ascolta i cambiamenti del pet selezionato dal localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const selectedPetId = localStorage.getItem('petvoice-selected-pet');
      if (selectedPetId && pets.length > 0) {
        const selectedPet = pets.find(pet => pet.id === selectedPetId);
        if (selectedPet && selectedPet.id !== activePet?.id) {
          setActivePet(selectedPet);
        }
      }
    };

    // Ascolta i cambiamenti del localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Controlla anche manualmente ogni secondo (per cambiamenti nella stessa tab)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [pets, activePet]);

  const getUserName = () => {
    if (userProfile?.display_name) {
      return userProfile.display_name;
    }
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name;
    }
    return 'Caro utente';
  };

  const quickStats = [
    { title: 'Analisi Oggi', value: '0', icon: Microscope, color: 'text-coral' },
    { title: 'Score Benessere', value: activePet ? '85%' : '-', icon: Heart, color: 'text-teal' },
    { title: 'Giorni Consecutivi', value: '0', icon: Calendar, color: 'text-sky' },
    { title: 'Miglioramento', value: '-', icon: TrendingUp, color: 'text-success' },
  ];

  const quickActions = [
    { title: 'Nuova Analisi', description: 'Analizza le emozioni del tuo pet', icon: Microscope, path: '/analysis', color: 'gradient-coral' },
    { title: 'Aggiungi Diario', description: 'Registra le attività di oggi', icon: BookOpen, path: '/diary', color: 'gradient-teal' },
    { title: 'Controlla Benessere', description: 'Monitora la salute emotiva', icon: Heart, path: '/wellness', color: 'gradient-sky' },
    { title: 'Vedi Statistiche', description: 'Analizza i progressi', icon: BarChart3, path: '/stats', color: 'gradient-hero' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ciao {getUserName()}! 👋</h1>
          <p className="text-muted-foreground">
            {activePet ? `Ecco come sta ${activePet.name} oggi` : 'Aggiungi il tuo primo pet per iniziare'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Active Pet Card o No Pet Message */}
      {activePet ? (
        <Card className="petvoice-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-coral flex items-center justify-center text-2xl">
                {activePet.avatar_url ? (
                  <img 
                    src={activePet.avatar_url} 
                    alt={activePet.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  activePet.type === 'Cane' ? '🐕' : '🐱'
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{activePet.name}</CardTitle>
                <CardDescription>{activePet.type} {activePet.breed && `• ${activePet.breed}`}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/pets')}
              >
                <PawPrint className="h-4 w-4 mr-2" />
                Gestisci Pet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score Benessere</span>
                <span className="text-lg font-bold text-teal">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-teal/10 text-teal">
                  <Heart className="h-3 w-3 mr-1" />
                  Ottimo
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Inizia ad analizzare le emozioni per vedere i progressi
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="petvoice-card border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full gradient-coral flex items-center justify-center mb-4">
              <PawPrint className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-xl mb-2">Nessun Pet Registrato</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              Aggiungi il tuo primo pet per iniziare ad analizzare le sue emozioni e monitorare il suo benessere.
            </CardDescription>
            <Button 
              onClick={() => navigate('/pets?add=true')}
              className="petvoice-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi il tuo primo Pet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="petvoice-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="petvoice-card">
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
          <CardDescription>
            {activePet ? `Cosa vuoi fare oggi con ${activePet.name}?` : 'Cosa vuoi fare oggi?'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 petvoice-button hover:shadow-glow"
                onClick={() => navigate(action.path)}
              >
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="petvoice-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attività Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {activePet ? 'Nessuna attività registrata ancora' : 'Aggiungi un pet per vedere le attività'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="petvoice-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tendenze Settimanali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {activePet ? 'Inizia le analisi per vedere le tendenze' : 'Aggiungi un pet per vedere le statistiche'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
import React from 'react';
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
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Demo data
  const activePet = {
    name: 'Luna',
    type: 'Cane',
    breed: 'Golden Retriever',
    wellnessScore: 85,
    avatar: '🐕'
  };

  const quickStats = [
    { title: 'Analisi Oggi', value: '3', icon: Microscope, color: 'text-coral' },
    { title: 'Score Benessere', value: '85%', icon: Heart, color: 'text-teal' },
    { title: 'Giorni Consecutivi', value: '12', icon: Calendar, color: 'text-sky' },
    { title: 'Miglioramento', value: '+15%', icon: TrendingUp, color: 'text-success' },
  ];

  const recentActivities = [
    { time: '2 ore fa', activity: 'Analisi vocale completata', emotion: 'Felice', confidence: 92 },
    { time: '5 ore fa', activity: 'Diario aggiornato', emotion: 'Calmo', confidence: 88 },
    { time: '1 giorno fa', activity: 'Controllo benessere', emotion: 'Energico', confidence: 85 },
    { time: '2 giorni fa', activity: 'Sessione di gioco', emotion: 'Giocoso', confidence: 90 },
  ];

  const quickActions = [
    { title: 'Nuova Analisi', description: 'Analizza le emozioni del tuo pet', icon: Microscope, path: '/analysis', color: 'gradient-coral' },
    { title: 'Aggiungi Diario', description: 'Registra le attività di oggi', icon: BookOpen, path: '/diary', color: 'gradient-teal' },
    { title: 'Controlla Benessere', description: 'Monitora la salute emotiva', icon: Heart, path: '/wellness', color: 'gradient-sky' },
    { title: 'Vedi Statistiche', description: 'Analizza i progressi', icon: BarChart3, path: '/stats', color: 'gradient-hero' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ciao! 👋</h1>
          <p className="text-muted-foreground">
            Ecco come sta {activePet.name} oggi
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

      {/* Active Pet Card */}
      <Card className="petvoice-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-coral flex items-center justify-center text-2xl">
              {activePet.avatar}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{activePet.name}</CardTitle>
              <CardDescription>{activePet.type} • {activePet.breed}</CardDescription>
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
              <span className="text-lg font-bold text-teal">{activePet.wellnessScore}%</span>
            </div>
            <Progress value={activePet.wellnessScore} className="h-2" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-teal/10 text-teal">
                <Heart className="h-3 w-3 mr-1" />
                Ottimo
              </Badge>
              <span className="text-xs text-muted-foreground">
                +5% rispetto alla settimana scorsa
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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
            Cosa vuoi fare oggi con {activePet.name}?
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
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-coral"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.activity}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.emotion}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs">{activity.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Felicità</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Energia</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Calma</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Socievolezza</span>
                  <span className="text-sm font-medium">71%</span>
                </div>
                <Progress value={71} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
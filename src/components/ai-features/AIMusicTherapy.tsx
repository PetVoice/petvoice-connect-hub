import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Music, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Heart, 
  Brain,
  Moon,
  Zap,
  Focus,
  Waves,
  Headphones,
  Settings,
  Sparkles
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: string;
}

interface AIMusicTherapyProps {
  selectedPet: Pet;
}

interface TherapySession {
  id: string;
  category: string;
  title: string;
  duration: number;
  description: string;
  frequency: string;
  icon: React.ComponentType<any>;
  color: string;
  benefits: string[];
}

const THERAPY_CATEGORIES: TherapySession[] = [
  {
    id: 'sleep',
    category: 'Sleep Induction',
    title: 'Sonno Profondo',
    duration: 30,
    description: 'Frequenze calmanti per favorire il riposo notturno',
    frequency: '528Hz + 8Hz',
    icon: Moon,
    color: 'bg-blue-500',
    benefits: ['Riduce ansia', 'Migliora sonno', 'Rilassamento muscolare']
  },
  {
    id: 'anxiety',
    category: 'Anxiety Relief',
    title: 'Calma Interiore',
    duration: 20,
    description: 'Binaural beats per ridurre stress e ansia',
    frequency: '10-13Hz',
    icon: Heart,
    color: 'bg-green-500',
    benefits: ['Riduce cortisolo', 'Calma nervosismo', 'Equilibrio emotivo']
  },
  {
    id: 'energy',
    category: 'Energy Boost',
    title: 'Energia Vitale',
    duration: 15,
    description: 'Frequenze energizzanti per stimolare vitalità',
    frequency: '40Hz',
    icon: Zap,
    color: 'bg-orange-500',
    benefits: ['Aumenta energia', 'Migliora umore', 'Stimola attività']
  },
  {
    id: 'focus',
    category: 'Focus Enhancement',
    title: 'Concentrazione',
    duration: 25,
    description: 'Onde cerebrali per migliorare attenzione e focus',
    frequency: '12-15Hz',
    icon: Focus,
    color: 'bg-purple-500',
    benefits: ['Migliora focus', 'Riduce distrazioni', 'Chiarezza mentale']
  }
];

export const AIMusicTherapy: React.FC<AIMusicTherapyProps> = ({ selectedPet }) => {
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([70]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [moodAdaptation, setMoodAdaptation] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generatePersonalizedPlaylist = async (category: string) => {
    setIsGenerating(true);
    
    // Simula generazione AI personalizzata
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const categorySession = THERAPY_CATEGORIES.find(c => c.id === category);
    if (categorySession) {
      setCurrentSession({
        ...categorySession,
        title: `${categorySession.title} per ${selectedPet.name}`,
        description: `Personalizzato per ${selectedPet.type.toLowerCase()} - ${categorySession.description}`
      });
    }
    
    setIsGenerating(false);
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (currentSession) {
      // Simula riproduzione audio
      const interval = setInterval(() => {
        if (isPlaying && currentTime < currentSession.duration * 60) {
          setCurrentTime(prev => prev + 1);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTime, currentSession]);

  const filteredSessions = selectedCategory === 'all' 
    ? THERAPY_CATEGORIES 
    : THERAPY_CATEGORIES.filter(session => session.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            AI Music Therapy per {selectedPet.name}
          </CardTitle>
          <CardDescription>
            Musicoterapia personalizzata basata sull'analisi emotiva e DNA comportamentale del tuo {selectedPet.type.toLowerCase()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Session Player */}
      {currentSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${currentSession.color} text-white`}>
                  <currentSession.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{currentSession.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentSession.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Waves className="h-3 w-3" />
                {currentSession.frequency}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={(currentTime / (currentSession.duration * 60)) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentSession.duration * 60)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="icon">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                className="h-12 w-12"
                onClick={handlePlayPause}
                disabled={isGenerating}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button variant="outline" size="icon">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-10">{volume[0]}%</span>
            </div>

            {/* Benefits */}
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Benefici di questa sessione:</p>
              <div className="flex flex-wrap gap-2">
                {currentSession.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categorie Terapeutiche</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                <SelectItem value="sleep">Sleep Induction</SelectItem>
                <SelectItem value="anxiety">Anxiety Relief</SelectItem>
                <SelectItem value="energy">Energy Boost</SelectItem>
                <SelectItem value="focus">Focus Enhancement</SelectItem>
              </SelectContent>
            </Select>
            {moodAdaptation && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Adattamento Real-time
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <Card 
                key={session.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentSession?.id === session.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => generatePersonalizedPlaylist(session.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${session.color} text-white`}>
                      <session.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{session.category}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {session.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Waves className="h-3 w-3" />
                          {session.frequency}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {session.duration} min
                        </span>
                      </div>
                      {isGenerating && currentSession?.id === session.id && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                          <Sparkles className="h-3 w-3 animate-spin" />
                          Generando playlist personalizzata...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              DNA Emotivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Calma</span>
                <div className="flex items-center gap-2">
                  <Progress value={85} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Energia</span>
                <div className="flex items-center gap-2">
                  <Progress value={60} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">60%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Focus</span>
                <div className="flex items-center gap-2">
                  <Progress value={70} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">70%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Impostazioni Avanzate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Adattamento Real-time</span>
              <Button
                variant={moodAdaptation ? "default" : "outline"}
                size="sm"
                onClick={() => setMoodAdaptation(!moodAdaptation)}
              >
                {moodAdaptation ? "ON" : "OFF"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <Headphones className="h-3 w-3 inline mr-1" />
              Per risultati ottimali, utilizza cuffie di qualità
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
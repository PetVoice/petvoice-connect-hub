import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Heart, 
  TrendingUp, 
  MessageCircle, 
  Star, 
  Shield,
  Trophy,
  Target,
  Zap,
  UserCheck,
  Activity
} from 'lucide-react';

interface PetTwin {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  ownerName: string;
  avatar: string;
  behavioralMatch: number;
  successPatterns: string[];
  sharedChallenges: string[];
  location: string;
  isOnline: boolean;
}

interface MentorMatch {
  id: string;
  name: string;
  experience: number;
  specializations: string[];
  successRate: number;
  mentoredPets: number;
  rating: number;
  avatar: string;
  matchScore: number;
  availableSlots: number;
  responseTime: string;
}

interface SuccessPattern {
  id: string;
  pattern: string;
  description: string;
  successRate: number;
  applicablePets: number;
  timeToResults: string;
  difficulty: 'easy' | 'medium' | 'hard';
  effectiveness: number;
}

const mockPetTwins: PetTwin[] = [
  {
    id: '1',
    name: 'Luna',
    type: 'Cane',
    breed: 'Golden Retriever',
    age: 3,
    ownerName: 'Maria R.',
    avatar: '/placeholder.svg',
    behavioralMatch: 94,
    successPatterns: ['Anxiety management', 'Socialization training', 'Positive reinforcement'],
    sharedChallenges: ['Separation anxiety', 'Noise sensitivity', 'Stranger wariness'],
    location: 'Milano',
    isOnline: true
  },
  {
    id: '2',
    name: 'Max',
    type: 'Cane',
    breed: 'Labrador',
    age: 2,
    ownerName: 'Giovanni B.',
    avatar: '/placeholder.svg',
    behavioralMatch: 87,
    successPatterns: ['Leash training', 'Impulse control', 'Reward-based training'],
    sharedChallenges: ['Hyperactivity', 'Jumping on people', 'Barking control'],
    location: 'Roma',
    isOnline: false
  },
  {
    id: '3',
    name: 'Bella',
    type: 'Cane',
    breed: 'Border Collie',
    age: 4,
    ownerName: 'Anna L.',
    avatar: '/placeholder.svg',
    behavioralMatch: 91,
    successPatterns: ['Mental stimulation', 'Agility training', 'Problem-solving exercises'],
    sharedChallenges: ['Boredom destructiveness', 'Obsessive behaviors', 'High energy'],
    location: 'Torino',
    isOnline: true
  }
];

const mockMentors: MentorMatch[] = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    experience: 8,
    specializations: ['Anxiety disorders', 'Behavioral modification', 'Puppy training'],
    successRate: 92,
    mentoredPets: 247,
    rating: 4.8,
    avatar: '/placeholder.svg',
    matchScore: 96,
    availableSlots: 2,
    responseTime: '< 2h'
  },
  {
    id: '2',
    name: 'Marco Trainer',
    experience: 5,
    specializations: ['Aggression management', 'Socialization', 'Advanced training'],
    successRate: 87,
    mentoredPets: 156,
    rating: 4.6,
    avatar: '/placeholder.svg',
    matchScore: 89,
    availableSlots: 1,
    responseTime: '< 4h'
  },
  {
    id: '3',
    name: 'Elena Behaviorist',
    experience: 12,
    specializations: ['Separation anxiety', 'Phobias', 'Rehabilitation'],
    successRate: 94,
    mentoredPets: 389,
    rating: 4.9,
    avatar: '/placeholder.svg',
    matchScore: 93,
    availableSlots: 0,
    responseTime: '< 1h'
  }
];

const mockSuccessPatterns: SuccessPattern[] = [
  {
    id: '1',
    pattern: 'Gradual Desensitization Protocol',
    description: 'Protocollo graduale per ridurre sensibilità ai trigger',
    successRate: 89,
    applicablePets: 1247,
    timeToResults: '2-3 settimane',
    difficulty: 'medium',
    effectiveness: 92
  },
  {
    id: '2',
    pattern: 'Positive Reinforcement Intensive',
    description: 'Training intensivo basato su rinforzo positivo',
    successRate: 94,
    applicablePets: 2156,
    timeToResults: '1-2 settimane',
    difficulty: 'easy',
    effectiveness: 87
  },
  {
    id: '3',
    pattern: 'Cognitive Behavioral Therapy',
    description: 'Terapia comportamentale cognitiva per animali',
    successRate: 78,
    applicablePets: 543,
    timeToResults: '4-6 settimane',
    difficulty: 'hard',
    effectiveness: 96
  }
];

export const PetMatchingIntelligence: React.FC = () => {
  const [selectedTwin, setSelectedTwin] = useState<PetTwin | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorMatch | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pet Matching Intelligence
          </CardTitle>
          <CardDescription>
            Trova Pet Gemelli e Mentors basati su behavioral DNA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Pet Twins */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Pet Gemelli Trovati
              </h3>
              <div className="grid gap-3">
                {mockPetTwins.map((twin) => (
                  <Card key={twin.id} className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedTwin(twin)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={twin.avatar} alt={twin.name} />
                            <AvatarFallback>{twin.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {twin.isOnline && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{twin.name}</h4>
                            <Badge variant="outline">{twin.type}</Badge>
                            <Badge variant="secondary">{twin.breed}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {twin.age} anni • Proprietario: {twin.ownerName} • {twin.location}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium">Match comportamentale:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={twin.behavioralMatch} className="w-20 h-2" />
                              <span className="text-sm font-bold text-green-600">{twin.behavioralMatch}%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Sfide comuni:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {twin.sharedChallenges.map((challenge, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {challenge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Pattern di successo:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {twin.successPatterns.map((pattern, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {pattern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Connetti
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Activity className="h-4 w-4 mr-2" />
                            Confronta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Mentor System */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Mentor System
              </h3>
              <div className="grid gap-3">
                {mockMentors.map((mentor) => (
                  <Card key={mentor.id} className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedMentor(mentor)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mentor.avatar} alt={mentor.name} />
                          <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{mentor.name}</h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{mentor.rating}</span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                              {mentor.matchScore}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {mentor.experience} anni esperienza • {mentor.mentoredPets} pet seguiti
                          </p>
                          <div className="flex items-center gap-4 mb-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              {mentor.successRate}% successo
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4 text-blue-500" />
                              {mentor.availableSlots} slot disponibili
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-green-500" />
                              Risposta {mentor.responseTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Specializzazioni:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mentor.specializations.map((spec, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="default" disabled={mentor.availableSlots === 0}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            {mentor.availableSlots > 0 ? 'Richiedi Mentor' : 'Non Disponibile'}
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Messaggio
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Success Patterns */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pattern di Successo Condivisi
              </h3>
              <div className="grid gap-3">
                {mockSuccessPatterns.map((pattern) => (
                  <Card key={pattern.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{pattern.pattern}</h4>
                            <Badge className={getDifficultyColor(pattern.difficulty)}>
                              {pattern.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {pattern.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{pattern.applicablePets} pet applicabili</span>
                            <span>Risultati in {pattern.timeToResults}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">{pattern.successRate}%</div>
                          <div className="text-xs text-muted-foreground">Successo</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Efficacia</span>
                          <span>{pattern.effectiveness}%</span>
                        </div>
                        <Progress value={pattern.effectiveness} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Success Alert */}
            <Alert>
              <Trophy className="h-4 w-4" />
              <AlertDescription>
                <strong>Successo condiviso:</strong> Il tuo pet ha un 94% di compatibilità con i pattern 
                di successo di Luna. Considera di connetterti per condividere strategie!
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  Play, 
  Pause, 
  SkipForward,
  AlertTriangle,
  Star,
  Brain,
  TrendingUp,
  Calendar,
  Award,
  Settings,
  Video,
  Timer
} from 'lucide-react';
import { TrainingProtocol, TrainingSession, ProtocolProgress } from '@/types/training';
import { generatePersonalizedProtocol } from '@/utils/protocolGenerator';
import { usePets } from '@/contexts/PetContext';
import { useAuth } from '@/contexts/AuthContext';

interface TrainingProtocolsProps {
  onProtocolCreate?: (protocol: TrainingProtocol) => void;
  onSessionStart?: (protocol: TrainingProtocol) => void;
}

export function TrainingProtocols({ onProtocolCreate, onSessionStart }: TrainingProtocolsProps) {
  const { selectedPet } = usePets();
  const { user } = useAuth();
  const [activeProtocol, setActiveProtocol] = useState<TrainingProtocol | null>(null);
  const [protocolProgress, setProtocolProgress] = useState<ProtocolProgress | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProtocolForm, setShowProtocolForm] = useState(false);

  // Demo data for protocols
  const [availableProtocols] = useState<TrainingProtocol[]>([
    {
      id: 'demo-protocol-1',
      name: 'Basic Obedience Foundation',
      description: 'Establish fundamental commands and communication',
      type: 'basic_training',
      duration_days: 14,
      difficulty: 'beginner',
      target_behaviors: ['sit', 'stay', 'come', 'heel'],
      issue_addressed: ['lack of basic commands'],
      created_at: new Date().toISOString(),
      phases: [],
      daily_sessions: 2,
      session_duration: 15,
      ai_generated: false,
      confidence_score: 85,
      personalization_factors: [],
      success_criteria: [],
      expected_outcomes: ['Reliable command response', 'Better communication'],
      adaptive_triggers: [],
      required_equipment: ['Treats', 'Clicker', 'Leash'],
      difficulty_modifiers: []
    },
    {
      id: 'demo-protocol-2',
      name: 'Anxiety Reduction Program',
      description: '21-day behavioral modification for anxiety management',
      type: 'behavioral_modification',
      duration_days: 21,
      difficulty: 'intermediate',
      target_behaviors: ['calm behavior', 'stress management'],
      issue_addressed: ['separation anxiety', 'general anxiety'],
      created_at: new Date().toISOString(),
      phases: [],
      daily_sessions: 3,
      session_duration: 20,
      ai_generated: true,
      confidence_score: 92,
      personalization_factors: [],
      success_criteria: [],
      expected_outcomes: ['Reduced anxiety episodes', 'Improved coping skills'],
      adaptive_triggers: [],
      required_equipment: ['Calming aids', 'Puzzle toys', 'Comfort items'],
      difficulty_modifiers: []
    }
  ]);

  const generateNewProtocol = async () => {
    if (!selectedPet) return;

    setIsGenerating(true);
    try {
      // Simulate API call with demo data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProtocol = generatePersonalizedProtocol({
        petData: selectedPet,
        behavioralIssues: ['demo issue'],
        trainingGoals: ['demo goal'],
        ownerExperience: 'intermediate',
        availableTimePerDay: 30,
        environment: 'both',
        currentBehaviors: ['playful', 'energetic']
      });

      setActiveProtocol(newProtocol);
      onProtocolCreate?.(newProtocol);
    } catch (error) {
      console.error('Error generating protocol:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startTrainingSession = (protocol: TrainingProtocol) => {
    onSessionStart?.(protocol);
  };

  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Seleziona un Pet</h3>
            <p className="text-muted-foreground">
              Seleziona un pet per accedere ai protocolli di training personalizzati.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Training Protocols</h1>
            <p className="text-muted-foreground">
              Programmi di addestramento personalizzati basati su intelligenza artificiale
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={generateNewProtocol} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Timer className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Genera Protocollo AI
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Active Protocol Status */}
      {activeProtocol && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{activeProtocol.name}</CardTitle>
                  <CardDescription>{activeProtocol.description}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Attivo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">{activeProtocol.duration_days}</div>
                <div className="text-sm text-muted-foreground">Giorni totali</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-2xl font-bold text-green-600">{activeProtocol.daily_sessions}</div>
                <div className="text-sm text-muted-foreground">Sessioni/giorno</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{activeProtocol.session_duration}m</div>
                <div className="text-sm text-muted-foreground">Durata sessione</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{activeProtocol.confidence_score}%</div>
                <div className="text-sm text-muted-foreground">Confidenza AI</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => startTrainingSession(activeProtocol)} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Inizia Sessione
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Personalizza
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="protocols" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="protocols">Protocolli</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="sessions">Sessioni</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-4">
          <div className="grid gap-4">
            {availableProtocols.map((protocol) => (
              <Card key={protocol.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        protocol.type === 'behavioral_modification' ? 'bg-red-100 text-red-600' :
                        protocol.type === 'basic_training' ? 'bg-blue-100 text-blue-600' :
                        protocol.type === 'advanced_skills' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {protocol.type === 'behavioral_modification' ? <Brain className="h-5 w-5" /> :
                         protocol.type === 'basic_training' ? <Target className="h-5 w-5" /> :
                         protocol.type === 'advanced_skills' ? <Star className="h-5 w-5" /> :
                         <Settings className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{protocol.name}</CardTitle>
                        <CardDescription>{protocol.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={protocol.difficulty === 'beginner' ? 'secondary' : 
                                     protocol.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                        {protocol.difficulty}
                      </Badge>
                      {protocol.ai_generated && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          AI Generated
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Protocol Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{protocol.duration_days} giorni</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{protocol.session_duration}min per sessione</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{protocol.confidence_score}% confidenza</span>
                      </div>
                    </div>

                    {/* Target Behaviors */}
                    <div>
                      <h4 className="font-medium mb-2">Comportamenti Target:</h4>
                      <div className="flex flex-wrap gap-1">
                        {protocol.target_behaviors.map((behavior, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {behavior}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div>
                      <h4 className="font-medium mb-2">Equipaggiamento Richiesto:</h4>
                      <div className="flex flex-wrap gap-1">
                        {protocol.required_equipment.map((equipment, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => setActiveProtocol(protocol)}
                        className="flex-1"
                        variant={activeProtocol?.id === protocol.id ? "secondary" : "default"}
                      >
                        {activeProtocol?.id === protocol.id ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Attivo
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Attiva Protocollo
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progresso Training
              </CardTitle>
              <CardDescription>
                Monitora i progressi del tuo pet nel protocollo attivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeProtocol ? (
                <div className="space-y-6">
                  {/* Overall Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Progresso Generale</span>
                      <span className="text-sm text-muted-foreground">3 di {activeProtocol.duration_days} giorni</span>
                    </div>
                    <Progress value={(3 / activeProtocol.duration_days) * 100} className="h-3" />
                  </div>

                  {/* Phase Progress */}
                  <div className="grid gap-4">
                    <h4 className="font-medium">Progresso per Fase:</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Fase 1: Foundation</span>
                          <Badge variant="default">In Corso</Badge>
                        </div>
                        <Progress value={60} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">
                          Stabilire baseline comportamentale e costruire fiducia
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg opacity-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Fase 2: Intervention</span>
                          <Badge variant="outline">In Attesa</Badge>
                        </div>
                        <Progress value={0} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">
                          Implementare tecniche di modificazione comportamentale
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun protocollo attivo. Attiva un protocollo per monitorare i progressi.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sessioni di Training
              </CardTitle>
              <CardDescription>
                Cronologia e gestione delle sessioni di allenamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessuna sessione registrata. Inizia la tua prima sessione di training!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Analytics Avanzate
              </CardTitle>
              <CardDescription>
                Metriche dettagliate e analisi dei progressi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Dati analytics disponibili dopo la prima sessione di training.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
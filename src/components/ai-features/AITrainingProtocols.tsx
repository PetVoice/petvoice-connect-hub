import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar, 
  PlayCircle, 
  PauseCircle, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Video,
  Star,
  Clock,
  Trash2,
  MoreHorizontal,
  Edit
} from 'lucide-react';
import { useTrainingProtocols, useDeleteProtocol, useUpdateProtocol } from '@/hooks/useTrainingProtocols';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useProtocolTranslations } from '@/utils/protocolTranslations';

interface TrainingSession {
  id: string;
  date: string;
  duration: number;
  exercises: string[];
  successRate: number;
  notes: string;
  videoAnalysis?: {
    posture: number;
    engagement: number;
    stress: number;
    recommendations: string[];
  };
}

const mockSessions: TrainingSession[] = [
  {
    id: '1',
    date: '2024-01-15',
    duration: 25,
    exercises: ['Breathing exercises', 'Trigger desensitization', 'Relaxation commands'],
    successRate: 85,
    notes: 'Excellent progress on breathing exercises. Still working on trigger response.',
    videoAnalysis: {
      posture: 82,
      engagement: 78,
      stress: 35,
      recommendations: [
        'Increase session frequency for trigger work',
        'Add more positive reinforcement',
        'Consider shorter sessions to maintain focus'
      ]
    }
  },
  {
    id: '2',
    date: '2024-01-14',
    duration: 30,
    exercises: ['Basic commands', 'Calm positioning', 'Stress indicators recognition'],
    successRate: 72,
    notes: 'Good response to basic commands. Need to work more on stress recognition.',
    videoAnalysis: {
      posture: 75,
      engagement: 80,
      stress: 45,
      recommendations: [
        'Focus on stress indicator training',
        'Shorter training intervals',
        'Increase reward frequency'
      ]
    }
  }
];

export const AITrainingProtocols: React.FC = () => {
  const { t } = useTranslation();
  const { translateProtocolTitle, translateProtocolDescription } = useProtocolTranslations();
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('protocols');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingProtocol, setEditingProtocol] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { data: protocols = [], isLoading } = useTrainingProtocols();
  const deleteProtocol = useDeleteProtocol();
  const updateProtocol = useUpdateProtocol();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'available': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteProtocol = async (protocolId: string) => {
    if (window.confirm(t('aiTraining.messages.deleteConfirm'))) {
      await deleteProtocol.mutateAsync(protocolId);
    }
  };

  const handleStatusChange = async (protocolId: string, newStatus: string) => {
    await updateProtocol.mutateAsync({
      id: protocolId,
      updates: { status: newStatus as any }
    });
  };

  const isUserCreated = (protocol: any) => {
    return protocol.user_id === currentUserId && protocol.ai_generated !== true;
  };

  const handleEditProtocol = (protocol: any) => {
    setEditingProtocol(protocol);
    setEditTitle(protocol.title);
    setEditDescription(protocol.description || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProtocol) return;

    await updateProtocol.mutateAsync({
      id: editingProtocol.id,
      updates: {
        title: editTitle,
        description: editDescription,
      }
    });

    setIsEditDialogOpen(false);
    setEditingProtocol(null);
    setEditTitle('');
    setEditDescription('');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">{t('aiTraining.messages.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t('aiTraining.title')}
          </CardTitle>
          <CardDescription>
            {t('aiTraining.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="protocols">{t('aiTraining.tabs.protocols')}</TabsTrigger>
              <TabsTrigger value="sessions">{t('aiTraining.tabs.sessions')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('aiTraining.tabs.analytics')}</TabsTrigger>
            </TabsList>

            <TabsContent value="protocols" className="mt-4">
              <div className="grid gap-4">
                {protocols.map((protocol) => (
                  <Card
                    key={protocol.id} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors" 
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{translateProtocolTitle(protocol.title)}</h3>
                            <Badge className={getDifficultyColor(protocol.difficulty)}>
                              {t(`aiTraining.protocol.difficulty.${protocol.difficulty}`)}
                            </Badge>
                            <Badge className={getStatusColor(protocol.status)}>
                              {t(`aiTraining.protocol.status.${protocol.status}`)}
                            </Badge>
                            {protocol.ai_generated && (
                              <Badge variant="outline">AI</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {translateProtocolDescription(protocol.description)}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                             <span className="flex items-center gap-1">
                               <Calendar className="h-4 w-4" />
                               {t('aiTraining.protocol.day')} {protocol.current_day}/{protocol.duration_days}
                             </span>
                             <span className="flex items-center gap-1">
                               <TrendingUp className="h-4 w-4" />
                               {Math.round(protocol.success_rate)}% {t('aiTraining.protocol.success')}
                             </span>
                          </div>
                          <div className="mt-3">
                             <div className="flex items-center justify-between text-sm mb-1">
                               <span>{t('aiTraining.protocol.progress')}</span>
                               <span>{Math.round((protocol.current_day / protocol.duration_days) * 100)}%</span>
                            </div>
                            <Progress value={(protocol.current_day / protocol.duration_days) * 100} />
                          </div>
                        </div>
                        
                        {/* Menu dropdown per azioni sui protocolli creati dall'utente */}
                        {currentUserId && isUserCreated(protocol) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProtocol(protocol);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                {t('aiTraining.buttons.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProtocol(protocol.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('aiTraining.buttons.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="mt-4">
              <div className="space-y-4">
                {mockSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{t('aiTraining.sessions.title')} {session.date}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {session.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {session.successRate}% successo
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Video className="h-4 w-4 mr-2" />
                          {t('aiTraining.sessions.videoButton')}
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-1">{t('aiTraining.sessions.exercises')}</h4>
                          <div className="flex flex-wrap gap-2">
                            {session.exercises.map((exercise, index) => (
                              <Badge key={index} variant="secondary">{exercise}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">{t('aiTraining.sessions.notes')}</h4>
                          <p className="text-sm text-muted-foreground">{session.notes}</p>
                        </div>
                        
                        {session.videoAnalysis && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">{t('aiTraining.sessions.videoAnalysis')}</h4>
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{session.videoAnalysis.posture}%</div>
                                <div className="text-xs text-muted-foreground">{t('aiTraining.sessions.posture')}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{session.videoAnalysis.engagement}%</div>
                                <div className="text-xs text-muted-foreground">{t('aiTraining.sessions.engagement')}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{session.videoAnalysis.stress}%</div>
                                <div className="text-xs text-muted-foreground">{t('aiTraining.sessions.stress')}</div>
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-1">{t('aiTraining.sessions.recommendations')}</h5>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {session.videoAnalysis.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('aiTraining.analytics.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">3</div>
                        <div className="text-sm text-muted-foreground">{t('aiTraining.analytics.protocolsCompleted')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">85%</div>
                        <div className="text-sm text-muted-foreground">{t('aiTraining.analytics.avgSuccessRate')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">24h</div>
                        <div className="text-sm text-muted-foreground">{t('aiTraining.analytics.totalSessions')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">12</div>
                        <div className="text-sm text-muted-foreground">{t('aiTraining.analytics.improvementRate')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Insight:</strong> Il protocollo "Anxiety Relief" sta mostrando progressi eccellenti. 
                    Considera di aumentare la frequenza delle sessioni per ottimizzare i risultati.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog per modificare protocolli */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Protocollo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Titolo</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrizione</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleSaveEdit}>
                Salva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
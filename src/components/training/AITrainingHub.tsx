import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Award, 
  Users, 
  Play, 
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
  Star,
  Sparkles,
  Timer,
  BookOpen,
  Eye,
  ThumbsUp,
  Rocket,
  Shield,
  Loader2,
  X,
  Check,
  Trophy,
  Wifi,
  WifiOff
} from 'lucide-react';

// Import hooks for real data
import { 
  useTrainingProtocols, 
  useSuggestedProtocols, 
  useTrainingTemplates, 
  useCreateProtocol, 
  useUpdateProtocol, 
  useAcceptSuggestion, 
  useDismissSuggestion,
  useDeleteProtocol,
  TrainingProtocol,
  SuggestedProtocol,
  TrainingTemplate
} from '@/hooks/useTrainingProtocols';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const AITrainingHub: React.FC = () => {
  const { toast } = useToast();
  
  // Real data hooks
  const { data: protocols = [], isLoading: protocolsLoading } = useTrainingProtocols();
  const { data: suggestedProtocols = [], isLoading: suggestionsLoading } = useSuggestedProtocols();
  const { data: templates = [], isLoading: templatesLoading } = useTrainingTemplates();
  
  // Mutations
  const createProtocol = useCreateProtocol();
  const updateProtocol = useUpdateProtocol();
  const acceptSuggestion = useAcceptSuggestion();
  const dismissSuggestion = useDismissSuggestion();

  // Import delete protocol hook
  const deleteProtocol = useDeleteProtocol();

  // Current User State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProtocol, setSelectedProtocol] = useState<TrainingProtocol | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentView, setCurrentView] = useState<'protocols' | 'suggestions' | 'analytics' | 'community'>('protocols');

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'facile' as const,
    duration_days: 14,
    target_behavior: '',
    triggers: [] as string[],
    required_materials: [] as string[],
    is_public: false,
  });

  // Create Protocol State
  const [isCreatingProtocol, setIsCreatingProtocol] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit Protocol State
  const [editingProtocol, setEditingProtocol] = useState<TrainingProtocol | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<'facile' | 'medio' | 'difficile'>('facile');
  const [editDurationDays, setEditDurationDays] = useState(14);
  const [editTargetBehavior, setEditTargetBehavior] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);

  // Delete Confirmation State
  const [protocolToDelete, setProtocolToDelete] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Real-time connection monitoring
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if protocol belongs to current user
  const isUserProtocol = (protocol: TrainingProtocol) => {
    return currentUserId && protocol.user_id === currentUserId && !protocol.ai_generated;
  };

  // Filtered protocols
  const filteredProtocols = useMemo(() => {
    if (!protocols) return [];
    
    return protocols.filter(protocol => {
      const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           protocol.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || protocol.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || protocol.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [protocols, searchTerm, categoryFilter, statusFilter]);

  // Statistics from real data
  const stats = useMemo(() => {
    const activeProtocols = protocols.filter(p => p.status === 'active').length;
    const completedProtocols = protocols.filter(p => p.status === 'completed').length;
    const totalProtocols = protocols.length;
    const avgSuccessRate = totalProtocols > 0 
      ? Math.round(protocols.reduce((sum, p) => sum + p.success_rate, 0) / totalProtocols)
      : 0;
    
    return {
      activeProtocols,
      completedProtocols,
      successRate: avgSuccessRate,
      communityProtocols: protocols.filter(p => p.is_public).length
    };
  }, [protocols]);

  // Utility Functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'medio': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      case 'difficile': return 'bg-red-500/20 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-700 border-blue-500/20';
      case 'completed': return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'paused': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      case 'available': return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
      case 'suggested': return 'bg-purple-500/20 text-purple-700 border-purple-500/20';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500/20 text-red-700 border-red-500/20';
      case 'high': return 'bg-orange-500/20 text-orange-700 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-500/20';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
    }
  };

  const handleCreateProtocol = async () => {
    if (!wizardData.title || !wizardData.category) {
      toast({
        title: 'Dati mancanti',
        description: 'Completa tutti i campi obbligatori',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingProtocol(true);
    setUploadProgress(0);

    try {
      // Simula progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const newProtocol = {
        title: wizardData.title,
        description: wizardData.description,
        category: wizardData.category,
        difficulty: wizardData.difficulty,
        duration_days: wizardData.duration_days,
        target_behavior: wizardData.target_behavior,
        triggers: wizardData.triggers,
        required_materials: wizardData.required_materials,
        is_public: wizardData.is_public,
        ai_generated: false,
        current_day: 1,
        progress_percentage: 0,
        status: 'available' as const,
        success_rate: 0,
        veterinary_approved: false,
        community_rating: 0,
        community_usage: 0,
        mentor_recommended: false,
        notifications_enabled: true,
        last_activity_at: new Date().toISOString(),
        user_id: '', // Will be set by the mutation
        pet_id: null,
        integration_source: 'manual' as const,
        estimated_cost: null,
        share_code: null,
      };

      await createProtocol.mutateAsync(newProtocol);
      
      setUploadProgress(100);
      setTimeout(() => {
        setIsCreatingProtocol(false);
        setUploadProgress(0);
        setShowWizard(false);
        setWizardStep(1);
        setWizardData({
          title: '',
          description: '',
          category: '',
          difficulty: 'facile',
          duration_days: 14,
          target_behavior: '',
          triggers: [],
          required_materials: [],
          is_public: false,
        });
      }, 1000);
    } catch (error) {
      setIsCreatingProtocol(false);
      setUploadProgress(0);
      console.error('Error creating protocol:', error);
    }
  };

  const handleStartProtocol = async (protocol: TrainingProtocol) => {
    if (protocol.status === 'active') {
      toast({
        title: 'Protocollo già attivo',
        description: 'Questo protocollo è già in esecuzione',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateProtocol.mutateAsync({
        id: protocol.id,
        updates: {
          status: 'active',
          last_activity_at: new Date().toISOString(),
        }
      });
      
      toast({
        title: 'Protocollo avviato',
        description: `Il protocollo "${protocol.title}" è stato avviato con successo`,
      });
    } catch (error) {
      console.error('Error starting protocol:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile avviare il protocollo',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptSuggestion = async (suggestion: SuggestedProtocol) => {
    try {
      await acceptSuggestion.mutateAsync(suggestion);
    } catch (error) {
      console.error('Error accepting suggestion:', error);
    }
  };

  const handleDismissSuggestion = async (suggestionId: string) => {
    try {
      await dismissSuggestion.mutateAsync(suggestionId);
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  // Handle edit protocol
  const handleEditProtocol = (protocol: TrainingProtocol) => {
    setEditingProtocol(protocol);
    setEditTitle(protocol.title);
    setEditDescription(protocol.description || '');
    setEditCategory(protocol.category);
    setEditDifficulty(protocol.difficulty);
    setEditDurationDays(protocol.duration_days);
    setEditTargetBehavior(protocol.target_behavior || '');
    setEditIsPublic(protocol.is_public || false);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingProtocol) return;
    
    try {
      await updateProtocol.mutateAsync({
        id: editingProtocol.id,
        updates: {
          title: editTitle,
          description: editDescription,
          category: editCategory,
          difficulty: editDifficulty,
          duration_days: editDurationDays,
          target_behavior: editTargetBehavior,
          is_public: editIsPublic,
        }
      });
      
      setEditingProtocol(null);
      setEditTitle('');
      setEditDescription('');
      
      toast({
        title: 'Protocollo aggiornato',
        description: 'Le modifiche sono state salvate con successo',
      });
    } catch (error) {
      console.error('Error updating protocol:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le modifiche',
        variant: 'destructive',
      });
    }
  };

  // Handle delete protocol
  const handleDeleteProtocol = async (protocolId: string) => {
    try {
      await deleteProtocol.mutateAsync(protocolId);
      
      toast({
        title: 'Protocollo eliminato',
        description: 'Il protocollo è stato eliminato con successo',
      });
    } catch (error) {
      console.error('Error deleting protocol:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il protocollo',
        variant: 'destructive',
      });
    }
  };

  if (protocolsLoading || suggestionsLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Training Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Protocolli di addestramento personalizzati con intelligenza artificiale
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Offline</span>
            </div>
          )}
          <Button 
            onClick={() => setShowWizard(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crea Protocollo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              Protocolli Attivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.activeProtocols}</div>
            <p className="text-xs text-muted-foreground">in corso</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 hover:border-green-500/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-green-500" />
              Completati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completedProtocols}</div>
            <p className="text-xs text-muted-foreground">con successo</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Tasso di Successo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">media personale</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.communityProtocols}</div>
            <p className="text-xs text-muted-foreground">protocolli condivisi</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="protocols">Protocolli</TabsTrigger>
          <TabsTrigger value="suggestions">Suggerimenti AI</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca protocolli..."
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
                <SelectItem value="comportamento">Comportamento</SelectItem>
                <SelectItem value="educazione">Educazione</SelectItem>
                <SelectItem value="sociale">Sociale</SelectItem>
                <SelectItem value="fisico">Fisico</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="active">Attivo</SelectItem>
                <SelectItem value="available">Disponibile</SelectItem>
                <SelectItem value="completed">Completato</SelectItem>
                <SelectItem value="paused">In pausa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Protocols List */}
          <div className="grid gap-4">
            {filteredProtocols.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Nessun protocollo trovato</h3>
                    <p className="text-sm text-muted-foreground">
                      Crea il tuo primo protocollo di training personalizzato
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowWizard(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Protocollo
                  </Button>
                </div>
              </Card>
            ) : (
              filteredProtocols.map((protocol) => (
                <Card key={protocol.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{protocol.title}</h3>
                          {protocol.ai_generated && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          <Badge className={getDifficultyColor(protocol.difficulty)}>
                            {protocol.difficulty}
                          </Badge>
                          <Badge className={getStatusColor(protocol.status)}>
                            {protocol.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{protocol.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{protocol.duration_days} giorni</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>Giorno {protocol.current_day}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{protocol.success_rate}% successo</span>
                          </div>
                        </div>
                      </div>
                      
                       <div className="flex flex-col items-end gap-2">
                         {/* Pulsanti Edit/Delete solo per protocolli dell'utente */}
                         {isUserProtocol(protocol) && (
                           <div className="flex items-center gap-2 mb-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleEditProtocol(protocol);
                               }}
                               className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 h-8 w-8"
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProtocolToDelete(protocol.id);
                                }}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                         )}
                         
                         <div className="flex items-center gap-2">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setSelectedProtocol(protocol)}
                           >
                             <Eye className="h-4 w-4 mr-2" />
                             Dettagli
                           </Button>
                           <Button
                             size="sm"
                             onClick={() => handleStartProtocol(protocol)}
                             disabled={protocol.status === 'active'}
                             className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                           >
                             <Play className="h-4 w-4 mr-2" />
                             {protocol.status === 'active' ? 'Attivo' : 'Avvia'}
                           </Button>
                         </div>
                         
                         <div className="w-32">
                           <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                             <span>Progresso</span>
                             <span>{protocol.progress_percentage}%</span>
                           </div>
                           <Progress value={protocol.progress_percentage} className="h-2" />
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid gap-4">
            {suggestedProtocols.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Lightbulb className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Nessun suggerimento disponibile</h3>
                    <p className="text-sm text-muted-foreground">
                      L'AI analizzerà i tuoi dati per suggerire protocolli personalizzati
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              suggestedProtocols.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                          <Badge className={getUrgencyColor(suggestion.urgency)}>
                            {suggestion.urgency}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{suggestion.description}</p>
                        
                        <div className="bg-muted/50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-muted-foreground">
                            <strong>Motivo:</strong> {suggestion.reason}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{suggestion.duration_days} giorni</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{suggestion.confidence_score}% confidenza</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{suggestion.similar_cases} casi simili</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptSuggestion(suggestion)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accetta
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismissSuggestion(suggestion.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rifiuta
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Panoramica Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{stats.successRate}%</div>
                    <p className="text-sm text-muted-foreground">Tasso di successo medio</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{stats.activeProtocols}</div>
                    <p className="text-sm text-muted-foreground">Protocolli attivi</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{stats.completedProtocols}</div>
                    <p className="text-sm text-muted-foreground">Protocolli completati</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Insights AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      I tuoi protocolli mostrano un tasso di successo del {stats.successRate}%, che è sopra la media della piattaforma!
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      I protocolli di categoria "comportamento" hanno il miglior tasso di successo nei tuoi dati.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{stats.communityProtocols}</div>
                    <p className="text-sm text-muted-foreground">Protocolli condivisi</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{templates.length}</div>
                    <p className="text-sm text-muted-foreground">Template disponibili</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {Math.round(templates.reduce((sum, t) => sum + t.success_rate, 0) / templates.length || 0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Successo medio community</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Template Più Popolari
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.slice(0, 5).map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">{template.success_rate}%</div>
                          <div className="text-xs text-muted-foreground">successo</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Protocol Creation Wizard */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Protocollo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titolo del protocollo</Label>
                <Input
                  id="title"
                  placeholder="Es. Gestione ansia da separazione"
                  value={wizardData.title}
                  onChange={(e) => setWizardData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  placeholder="Descrivi l'obiettivo del protocollo..."
                  value={wizardData.description}
                  onChange={(e) => setWizardData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={wizardData.category} onValueChange={(value) => setWizardData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comportamento">Comportamento</SelectItem>
                      <SelectItem value="educazione">Educazione</SelectItem>
                      <SelectItem value="sociale">Sociale</SelectItem>
                      <SelectItem value="fisico">Fisico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="difficulty">Difficoltà</Label>
                  <Select value={wizardData.difficulty} onValueChange={(value) => setWizardData(prev => ({ ...prev, difficulty: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facile">Facile</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="difficile">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="duration">Durata (giorni)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="90"
                  value={wizardData.duration_days}
                  onChange={(e) => setWizardData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 14 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="target">Comportamento target</Label>
                <Input
                  id="target"
                  placeholder="Es. Ridurre l'ansia da separazione"
                  value={wizardData.target_behavior}
                  onChange={(e) => setWizardData(prev => ({ ...prev, target_behavior: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={wizardData.is_public}
                  onCheckedChange={(checked) => setWizardData(prev => ({ ...prev, is_public: checked }))}
                />
                <Label htmlFor="public">Condividi con la community</Label>
              </div>
            </div>
            
            {isCreatingProtocol && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Creazione protocollo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowWizard(false)}
                disabled={isCreatingProtocol}
              >
                Annulla
              </Button>
              <Button
                onClick={handleCreateProtocol}
                disabled={isCreatingProtocol}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isCreatingProtocol ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Crea Protocollo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Protocol Details Modal */}
      <Dialog open={!!selectedProtocol} onOpenChange={() => setSelectedProtocol(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedProtocol?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedProtocol && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Dettagli Protocollo</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Categoria:</strong> {selectedProtocol.category}</div>
                    <div><strong>Difficoltà:</strong> {selectedProtocol.difficulty}</div>
                    <div><strong>Durata:</strong> {selectedProtocol.duration_days} giorni</div>
                    <div><strong>Giorno corrente:</strong> {selectedProtocol.current_day}</div>
                    <div><strong>Progresso:</strong> {selectedProtocol.progress_percentage}%</div>
                    <div><strong>Tasso di successo:</strong> {selectedProtocol.success_rate}%</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Materiali richiesti</h3>
                  <div className="space-y-1">
                    {selectedProtocol.required_materials?.map((material, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {material}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Descrizione</h3>
                <p className="text-sm text-muted-foreground">{selectedProtocol.description}</p>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProtocol(null)}
                >
                  Chiudi
                </Button>
                <Button
                  onClick={() => {
                    handleStartProtocol(selectedProtocol);
                    setSelectedProtocol(null);
                  }}
                  disabled={selectedProtocol.status === 'active'}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {selectedProtocol.status === 'active' ? 'Già Attivo' : 'Avvia Protocollo'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Protocol Dialog */}
      <Dialog open={!!editingProtocol} onOpenChange={() => setEditingProtocol(null)}>
        <DialogContent className="max-w-2xl">
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
                placeholder="Inserisci il titolo del protocollo"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrizione</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Inserisci la descrizione del protocollo"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comportamento">Comportamento</SelectItem>
                    <SelectItem value="educazione">Educazione</SelectItem>
                    <SelectItem value="sociale">Sociale</SelectItem>
                    <SelectItem value="fisico">Fisico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-difficulty">Difficoltà</Label>
                <Select value={editDifficulty} onValueChange={(value) => setEditDifficulty(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facile">Facile</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="difficile">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-duration">Durata (giorni)</Label>
              <Input
                id="edit-duration"
                type="number"
                min="1"
                max="90"
                value={editDurationDays}
                onChange={(e) => setEditDurationDays(parseInt(e.target.value) || 14)}
              />
            </div>

            <div>
              <Label htmlFor="edit-target">Comportamento target</Label>
              <Input
                id="edit-target"
                placeholder="Es. Ridurre l'ansia da separazione"
                value={editTargetBehavior}
                onChange={(e) => setEditTargetBehavior(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-public"
                checked={editIsPublic}
                onCheckedChange={setEditIsPublic}
              />
              <Label htmlFor="edit-public">Condividi con la community</Label>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingProtocol(null)}
              >
                Annulla
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Salva Modifiche
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!protocolToDelete} onOpenChange={() => setProtocolToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo protocollo?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il protocollo verrà eliminato permanentemente 
              insieme a tutti i suoi dati associati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProtocolToDelete(null)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (protocolToDelete) {
                  handleDeleteProtocol(protocolToDelete);
                  setProtocolToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
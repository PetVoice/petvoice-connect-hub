import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
  Pause,
  Square,
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
  useActiveProtocols,
  useSuggestedProtocols, 
  useTrainingTemplates, 
  useCreateProtocol, 
  useUpdateProtocol, 
  useAcceptSuggestion, 
  useDismissSuggestion,
  useDeleteProtocol,
  useCompletedProtocols,
  TrainingProtocol,
  SuggestedProtocol,
  TrainingTemplate
} from '@/hooks/useTrainingProtocols';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const AITrainingHub: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // Real data hooks - separati per tipo
  const { data: protocols = [], isLoading: protocolsLoading, refetch: refetchProtocols } = useTrainingProtocols(); // Solo pubblici
  const { data: activeProtocols = [], isLoading: activeLoading } = useActiveProtocols(); // Solo attivi dell'utente
  const { data: suggestedProtocols = [], isLoading: suggestionsLoading } = useSuggestedProtocols();
  const { data: templates = [], isLoading: templatesLoading } = useTrainingTemplates();
  const { data: completedProtocols = [], isLoading: completedLoading } = useCompletedProtocols();

  // Force refresh on mount to ensure data is loaded
  React.useEffect(() => {
    console.log('Protocols loaded:', protocols.length);
    if (protocols.length === 0 && !protocolsLoading) {
      console.log('Forcing protocol refetch...');
      refetchProtocols();
    }
  }, [protocols, protocolsLoading, refetchProtocols]);

  // Force immediate refresh of protocols data
  React.useEffect(() => {
    const forceRefresh = async () => {
      await queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
      await queryClient.invalidateQueries({ queryKey: ['completed-protocols'] });
      refetchProtocols();
    };
    forceRefresh();
  }, [queryClient, refetchProtocols]);  // Updated dependencies
  
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
  const [currentView, setCurrentView] = useState<'protocols' | 'active' | 'suggestions' | 'community' | 'completed'>('protocols');

  // Check URL parameters to set initial tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'completed') {
      setCurrentView('completed');
    } else if (tabParam === 'active') {
      setCurrentView('active');
    }
  }, [searchParams]);

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

  // Get current user ID and invalidate cache
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      
      // Invalida cache per forzare reload
      queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
    };
    getCurrentUser();
  }, [queryClient]);

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

  // Filtered protocols - only available protocols (not active, completed, or paused)
  const filteredProtocols = useMemo(() => {
    if (!protocols) return [];
    
    return protocols.filter(protocol => {
      // Show only available protocols in main "Protocolli" tab
      if (protocol.status !== 'available') return false;
      
      const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           protocol.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || protocol.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [protocols, searchTerm, categoryFilter]);

  // Statistics from real data
  const stats = useMemo(() => {
    const activeCount = activeProtocols.length; // Usa il hook dedicato
    const completedProtocolsCount = completedProtocols.length; // Usa completedProtocols dal hook dedicato
    const totalProtocols = protocols.length + activeCount + completedProtocolsCount;
    
    // Calculate success rate based on completed protocols only
    const completedWithData = completedProtocols.filter(p => p.success_rate > 0);
    const avgSuccessRate = completedWithData.length > 0 
      ? Math.round(completedWithData.reduce((sum, p) => sum + p.success_rate, 0) / completedWithData.length)
      : 0;
    
    return {
      totalProtocols,
      activeProtocols: activeCount,
      completedProtocols: completedProtocolsCount,
      avgSuccessRate,
      communityProtocols: protocols.filter(p => p.is_public).length
    };
  }, [protocols, activeProtocols, completedProtocols]);

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
      case 'available': return '';
      case 'suggested': return 'bg-primary/20 text-primary border-primary/20';
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
    // Se il protocollo è già attivo (status 'active'), va direttamente alla dashboard
    if (protocol.status === 'active') {
      navigate(`/training/dashboard/${protocol.id}`);
      return;
    }

    // 1. VERIFICA SE ESISTE GIÀ UN PROTOCOLLO ATTIVO SIMILE (solo per protocolli non attivi)
    const existingActiveProtocol = activeProtocols.find(p => 
      p.id !== protocol.id && // Esclude il protocollo corrente
      (p.title === protocol.title && p.category === protocol.category)
    );

    if (existingActiveProtocol) {
      toast({
        title: 'Protocollo già attivo',
        description: `Il protocollo "${protocol.title}" è già attivo. Ti porto alla scheda Attivi.`,
      });
      // Reindirizza alla scheda "Attivi" invece che alla dashboard
      setCurrentView('active');
      navigate('/training?tab=active');
      return;
    }

    try {
      // Se è un protocollo pubblico (senza user_id), crea una copia per l'utente
      if (!protocol.user_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: 'Accesso richiesto',
            description: 'Devi essere autenticato per usare un protocollo',
            variant: 'destructive',
          });
          return;
        }

        const newProtocol = {
          title: protocol.title,
          description: protocol.description,
          category: protocol.category,
          difficulty: protocol.difficulty,
          duration_days: protocol.duration_days,
          target_behavior: protocol.target_behavior,
          triggers: protocol.triggers,
          required_materials: protocol.required_materials,
          current_day: 1,
          progress_percentage: 0,
          status: 'active' as const,
          success_rate: 0,
          ai_generated: false,
          is_public: false,
          veterinary_approved: false,
          community_rating: 0,
          community_usage: 0,
          mentor_recommended: false,
          notifications_enabled: true,
          last_activity_at: new Date().toISOString(),
          user_id: user.id,
          pet_id: null,
          integration_source: null,
          estimated_cost: null,
          share_code: null,
        };

        const { data: createdProtocol, error } = await supabase
          .from('ai_training_protocols')
          .insert(newProtocol)
          .select()
          .single();

        if (error) throw error;

        // COPIARE TUTTI GLI ESERCIZI DAL PROTOCOLLO PUBBLICO
        const { data: originalExercises, error: exercisesError } = await supabase
          .from('ai_training_exercises')
          .select('*')
          .eq('protocol_id', protocol.id);

        if (exercisesError) {
          console.error('Errore nel caricamento esercizi:', exercisesError);
        } else if (originalExercises && originalExercises.length > 0) {
          // Copia gli esercizi al nuovo protocollo
          const exercisesToCopy = originalExercises.map(exercise => ({
            protocol_id: createdProtocol.id,
            title: exercise.title,
            description: exercise.description,
            exercise_type: exercise.exercise_type,
            day_number: exercise.day_number,
            duration_minutes: exercise.duration_minutes,
            instructions: exercise.instructions,
            materials: exercise.materials,
            effectiveness_score: exercise.effectiveness_score,
          }));

          const { error: copyError } = await supabase
            .from('ai_training_exercises')
            .insert(exercisesToCopy);

          if (copyError) {
            console.error('Errore nella copia degli esercizi:', copyError);
            toast({
              title: 'Attenzione',
              description: 'Protocollo avviato ma alcuni esercizi potrebbero non essere disponibili',
              variant: 'destructive',
            });
          }
        }

        toast({
          title: 'Protocollo avviato',
          description: `Il protocollo "${protocol.title}" è stato avviato con successo`,
        });
        
        // Reindirizza alla dashboard del nuovo protocollo
        setTimeout(() => {
          window.location.href = `/training/dashboard/${createdProtocol.id}`;
        }, 1500);
      } else if (protocol.status === 'completed') {
        // Se è un protocollo completato, resettalo completamente
        await updateProtocol.mutateAsync({
          id: protocol.id,
          updates: {
            status: 'active',
            current_day: 1,
            progress_percentage: 0,
            success_rate: 0,
            last_activity_at: new Date().toISOString(),
          }
        });

        // Invalida e ricarica immediatamente le query per aggiornare le liste
        await queryClient.invalidateQueries({ queryKey: ['completed-protocols'] });
        await queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
        
        // Forza il refetch per assicurarsi che le liste siano aggiornate
        await queryClient.refetchQueries({ queryKey: ['completed-protocols'] });
        await queryClient.refetchQueries({ queryKey: ['training-protocols'] });
        
        toast({
          title: 'Protocollo riavviato',
          description: `Il protocollo "${protocol.title}" è stato riavviato da capo`,
        });
        
        // Reindirizza alla dashboard del protocollo resettato
        setTimeout(() => {
          window.location.href = `/training/dashboard/${protocol.id}`;
        }, 1500);
      } else {
        // Se è già un protocollo dell'utente ma non completato, attivalo
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
        
        // Reindirizza alla dashboard del protocollo
        setTimeout(() => {
          window.location.href = `/training/dashboard/${protocol.id}`;
        }, 1500);
      }
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

  // Handle status change
  const handleStatusChange = async (protocolId: string, newStatus: 'active' | 'paused' | 'completed' | 'available' | 'suggested') => {
    try {
      const protocol = protocols?.find(p => p.id === protocolId);
      
      await updateProtocol.mutateAsync({
        id: protocolId,
        updates: {
          status: newStatus,
          last_activity_at: new Date().toISOString(),
        }
      });
      
      if (newStatus === 'paused') {
        toast({
          title: 'Protocollo interrotto',
          description: `Il protocollo "${protocol?.title || 'Senza nome'}" è stato interrotto con successo`,
        });
      } else {
        toast({
          title: 'Status aggiornato',
          description: `Il protocollo è stato aggiornato`,
        });
      }
    } catch (error) {
      console.error('Error updating protocol status:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare lo status del protocollo',
        variant: 'destructive',
      });
    }
  };

  if (protocolsLoading || suggestionsLoading || templatesLoading || completedLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Online Status and Create Button */}
      <div className="flex items-center justify-end gap-2">
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Protocolli Attivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeProtocols}</div>
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
            <div className="text-2xl font-bold text-blue-500">{stats.avgSuccessRate}%</div>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="protocols">Protocolli</TabsTrigger>
          <TabsTrigger value="active">Attivi</TabsTrigger>
          <TabsTrigger value="completed">Completati</TabsTrigger>
          <TabsTrigger value="suggestions">Suggerimenti AI</TabsTrigger>
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
                  <p className="text-sm text-muted-foreground">
                    Usa i protocolli disponibili della community
                  </p>
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
                             <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          <Badge className={getDifficultyColor(protocol.difficulty)}>
                            {protocol.difficulty}
                          </Badge>
                          <Badge variant={protocol.status === 'available' ? 'available' : 'default'} className={protocol.status === 'available' ? '' : getStatusColor(protocol.status)}>
                            {protocol.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{protocol.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{protocol.duration_days} giorni</span>
                          </div>
                          {protocol.status === 'active' && (
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span>Giorno {protocol.current_day}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{Math.round(protocol.success_rate)}% successo</span>
                          </div>
                        </div>
                      </div>
                      
                       <div className="flex flex-col items-end gap-2">
                         
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
                               className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                             >
                               <Play className="h-4 w-4 mr-2" />
                               {protocol.user_id ? (protocol.status === 'active' ? 'Continua' : 'Avvia Protocollo') : 'Avvia Protocollo'}
                             </Button>
                             {protocol.user_id && protocol.status === 'active' && (
                               <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                   <Button
                                     variant="destructive"
                                     size="sm"
                                     className="flex items-center gap-2"
                                   >
                                     <Square className="h-4 w-4" />
                                     Interrompi
                                   </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent>
                                   <AlertDialogHeader>
                                     <AlertDialogTitle>Conferma interruzione</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Sei sicuro di voler interrompere definitivamente il protocollo "{protocol.title}"? Questa azione fermerà il protocollo e dovrai riavviarlo dall'inizio se vorrai riprenderlo.
                                      </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                     <AlertDialogCancel>Annulla</AlertDialogCancel>
                                     <AlertDialogAction 
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleStatusChange(protocol.id, 'paused');
                                       }}
                                       className="bg-red-600 hover:bg-red-700"
                                     >
                                       Sì, interrompi
                                     </AlertDialogAction>
                                   </AlertDialogFooter>
                                 </AlertDialogContent>
                               </AlertDialog>
                             )}
                          </div>
                         
                           {protocol.status === 'active' && protocol.progress_percentage > 0 && (
                             <div className="w-32">
                               <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                 <span>Progresso</span>
                                 <span>{protocol.progress_percentage}%</span>
                               </div>
                               <Progress value={protocol.progress_percentage} className="h-2" />
                             </div>
                           )}
                       </div>
                     </div>
                   </CardContent>
                 </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Protocolli Attivi</h2>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 border-blue-500/20">
              {activeProtocols.length} attivi
            </Badge>
          </div>

          <div className="grid gap-4">
            {activeProtocols.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Play className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold text-muted-foreground">Nessun protocollo attivo</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Avvia un protocollo per iniziare il tuo percorso di training
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              activeProtocols.map((protocol) => (
                <Card key={protocol.id} className="border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <Play className="h-6 w-6 text-blue-500" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{protocol.title}</h3>
                            <p className="text-sm text-muted-foreground">{protocol.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getDifficultyColor(protocol.difficulty)}>
                            {protocol.difficulty}
                          </Badge>
                          <Badge variant="outline">{protocol.category}</Badge>
                          <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/20">
                            <Play className="h-3 w-3 mr-1" />
                            Attivo
                          </Badge>
                          {protocol.ai_generated && (
                            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
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
                            <span>{Math.round(protocol.success_rate)}% successo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Iniziato il {new Date(protocol.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium text-blue-600">{protocol.progress_percentage}%</span>
                          </div>
                          <Progress value={protocol.progress_percentage} className="mt-1 h-2" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStartProtocol(protocol)}
                          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Continua
                        </Button>
                         {isUserProtocol(protocol) && (
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button
                                 variant="destructive"
                                 size="sm"
                               >
                                 <Square className="h-4 w-4 mr-2" />
                                 Interrompi
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                               <AlertDialogHeader>
                                      <AlertDialogTitle>Conferma interruzione</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Sei sicuro di voler interrompere definitivamente il protocollo "{protocol.title}"? Questa azione fermerà il protocollo e dovrai riavviarlo dall'inizio se vorrai riprenderlo.
                                      </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Annulla</AlertDialogCancel>
                                 <AlertDialogAction 
                                   onClick={() => handleStatusChange(protocol.id, 'paused')}
                                   className="bg-red-600 hover:bg-red-700"
                                 >
                                   Sì, interrompi
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                         )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold">Protocolli Completati</h2>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/20">
              {completedProtocols.length} completati
            </Badge>
          </div>

          <div className="grid gap-4">
            {completedLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : completedProtocols.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Trophy className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold text-muted-foreground">Nessun protocollo completato</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Completa i tuoi primi protocolli per vederli qui
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              completedProtocols.map((protocol) => (
                <Card key={protocol.id} className="border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{protocol.title}</h3>
                            <p className="text-sm text-muted-foreground">{protocol.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getDifficultyColor(protocol.difficulty)}>
                            {protocol.difficulty}
                          </Badge>
                          <Badge variant="outline">{protocol.category}</Badge>
                          <Badge className="bg-green-500/20 text-green-700 border-green-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completato
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{protocol.duration_days} giorni</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{Math.round(protocol.success_rate)}% successo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Completato il {new Date(protocol.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium text-green-600">100%</span>
                          </div>
                          <Progress value={100} className="mt-1 h-2" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartProtocol(protocol)}
                          className="border-green-500/20 hover:border-green-500/40 hover:bg-green-500/10"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Rifai
                        </Button>
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
                          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white">
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


        <TabsContent value="community" className="space-y-4">
          <div className="grid gap-6">
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
                          <div className="text-sm font-medium">{Math.round(template.success_rate)}%</div>
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
                    <div><strong>Tasso di successo:</strong> {Math.round(selectedProtocol.success_rate)}%</div>
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
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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
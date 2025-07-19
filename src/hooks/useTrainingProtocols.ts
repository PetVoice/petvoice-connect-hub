import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrainingProtocol {
  id: string;
  user_id: string;
  pet_id?: string;
  title: string;
  description?: string;
  category: string;
  difficulty: 'facile' | 'medio' | 'difficile';
  duration_days: number;
  current_day: number;
  progress_percentage: number;
  status: 'available' | 'active' | 'paused' | 'completed' | 'suggested';
  target_behavior?: string;
  triggers?: string[];
  success_rate: number;
  ai_generated: boolean;
  integration_source?: 'analysis' | 'diary' | 'wellness' | 'matching' | 'manual';
  veterinary_approved: boolean;
  estimated_cost?: number;
  required_materials?: string[];
  is_public: boolean;
  share_code?: string;
  community_rating: number;
  community_usage: number;
  mentor_recommended: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  // Relationships
  exercises?: TrainingExercise[];
  metrics?: TrainingMetrics | null;
  schedule?: TrainingSchedule | null;
}

export interface TrainingExercise {
  id: string;
  protocol_id: string;
  day_number: number;
  title: string;
  description?: string;
  duration_minutes: number;
  exercise_type: 'physical' | 'mental' | 'behavioral' | 'social';
  instructions?: string[];
  materials?: string[];
  video_url?: string;
  completed: boolean;
  completed_at?: string;
  feedback?: string;
  effectiveness_score?: number;
  photos?: string[];
  voice_notes?: string[];
  ai_analysis?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingMetrics {
  id: string;
  protocol_id: string;
  behavior_improvement: number;
  stress_reduction: number;
  engagement_level: number;
  owner_satisfaction: number;
  community_success: number;
  time_efficiency: number;
  cost_effectiveness: number;
  recorded_at: string;
  created_at: string;
}

export interface TrainingSchedule {
  id: string;
  protocol_id: string;
  start_date: string;
  end_date?: string;
  daily_time: string;
  reminder_times?: string[];
  weekdays?: number[];
  flexible: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuggestedProtocol {
  id: string;
  user_id: string;
  pet_id?: string;
  title: string;
  description?: string;
  reason: string;
  source: string;
  confidence_score: number;
  estimated_success: number;
  similar_cases: number;
  category: string;
  difficulty: string;
  duration_days: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  integration_data: any;
  auto_generated: boolean;
  accepted: boolean;
  dismissed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  duration_days: number;
  popularity_score: number;
  success_rate: number;
  template_data: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Hook per recuperare protocolli completati (unici per titolo)
export const useCompletedProtocols = () => {
  return useQuery({
    queryKey: ['completed-protocols'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Query per ottenere protocolli completati unici (uno per titolo)
      const { data, error } = await supabase
        .from('ai_training_protocols')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Filtra per mantenere solo un protocollo per titolo (il più recente)
      const uniqueProtocols = data?.reduce((acc: any[], protocol: any) => {
        if (!acc.some(p => p.title === protocol.title)) {
          acc.push({
            ...protocol,
            difficulty: protocol.difficulty as 'facile' | 'medio' | 'difficile'
          });
        }
        return acc;
      }, []) || [];

      return uniqueProtocols as TrainingProtocol[];
    },
  });
};

export const useTrainingProtocols = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['training-protocols'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_training_protocols')
        .select(`
          *,
          exercises:ai_training_exercises(*),
          metrics:ai_training_metrics(*),
          schedule:ai_training_schedules(*)
        `)
        .eq('user_id', user.id)
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Errore nel caricamento',
          description: 'Non è stato possibile caricare i protocolli di training',
          variant: 'destructive',
        });
        throw error;
      }

      return data.map(protocol => ({
        ...protocol,
        exercises: protocol.exercises || [],
        metrics: protocol.metrics?.[0] || null,
        schedule: protocol.schedule?.[0] || null,
      })) as TrainingProtocol[];
    },
  });
};

export const useSuggestedProtocols = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['suggested-protocols'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_suggested_protocols')
        .select('*')
        .eq('dismissed', false)
        .order('confidence_score', { ascending: false });

      if (error) {
        toast({
          title: 'Errore nel caricamento',
          description: 'Non è stato possibile caricare i protocolli suggeriti',
          variant: 'destructive',
        });
        throw error;
      }

      return data as SuggestedProtocol[];
    },
  });
};

export const useTrainingTemplates = () => {
  return useQuery({
    queryKey: ['training-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_training_templates')
        .select('*')
        .eq('is_active', true)
        .order('popularity_score', { ascending: false });

      if (error) throw error;
      return data as TrainingTemplate[];
    },
  });
};

export const useCreateProtocol = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (protocol: Omit<TrainingProtocol, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('ai_training_protocols')
        .insert({
          ...protocol,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
      toast({
        title: 'Protocollo creato',
        description: 'Il protocollo di training è stato creato con successo',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore nella creazione',
        description: 'Non è stato possibile creare il protocollo',
        variant: 'destructive',
      });
      console.error('Error creating protocol:', error);
    },
  });
};

export const useUpdateProtocol = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TrainingProtocol> }) => {
      const { data, error } = await supabase
        .from('ai_training_protocols')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
      toast({
        title: 'Protocollo aggiornato',
        description: 'Il protocollo è stato aggiornato con successo',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore nell\'aggiornamento',
        description: 'Non è stato possibile aggiornare il protocollo',
        variant: 'destructive',
      });
      console.error('Error updating protocol:', error);
    },
  });
};

export const useDeleteProtocol = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ai_training_protocols')
        .delete()
        .eq('id', id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
      toast({
        title: 'Protocollo eliminato',
        description: 'Il protocollo è stato eliminato con successo',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore nell\'eliminazione',
        description: 'Non è stato possibile eliminare il protocollo',
        variant: 'destructive',
      });
      console.error('Error deleting protocol:', error);
    },
  });
};

export const useAcceptSuggestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (suggestion: SuggestedProtocol) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // 1. Crea il protocollo dal suggerimento
      const { data: protocol, error: protocolError } = await supabase
        .from('ai_training_protocols')
        .insert({
          user_id: user.id,
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          difficulty: suggestion.difficulty as any,
          duration_days: suggestion.duration_days,
          ai_generated: suggestion.auto_generated,
          integration_source: 'matching',
          status: 'available',
        })
        .select()
        .single();

      if (protocolError) throw protocolError;

      // 2. Marca il suggerimento come accettato
      const { error: suggestionError } = await supabase
        .from('ai_suggested_protocols')
        .update({ accepted: true })
        .eq('id', suggestion.id);

      if (suggestionError) throw suggestionError;

      return protocol;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['suggested-protocols'] });
      toast({
        title: 'Suggerimento accettato',
        description: 'Il protocollo è stato aggiunto ai tuoi training',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore nell\'accettazione',
        description: 'Non è stato possibile accettare il suggerimento',
        variant: 'destructive',
      });
      console.error('Error accepting suggestion:', error);
    },
  });
};

export const useDismissSuggestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('ai_suggested_protocols')
        .update({ dismissed: true })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-protocols'] });
      toast({
        title: 'Suggerimento rifiutato',
        description: 'Il suggerimento è stato rimosso dalla lista',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore nel rifiuto',
        description: 'Non è stato possibile rifiutare il suggerimento',
        variant: 'destructive',
      });
      console.error('Error dismissing suggestion:', error);
    },
  });
};
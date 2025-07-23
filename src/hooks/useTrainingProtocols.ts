import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  MultiLanguageTrainingProtocol, 
  convertToStandardProtocol, 
  convertFromStandardProtocol,
  SupportedLanguage 
} from '@/utils/protocolLanguage';

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
  // Personal rating fields (only for completed protocols)
  personal_success_rate?: number;
  personal_rating?: number;
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

      // Ottieni la lingua corrente dell'utente
      const { data: profile } = await supabase
        .from('profiles')
        .select('language')
        .eq('user_id', user.id)
        .single();
      
      const userLanguage = (profile?.language as SupportedLanguage) || 'it';
      const statusColumn = `status_${userLanguage}`;

      // Query per ottenere protocolli completati unici (uno per titolo)
      const { data, error } = await supabase
        .from('ai_training_protocols')
        .select('*')
        .eq('user_id', user.id)
        .eq(statusColumn, userLanguage === 'it' ? 'completato' : userLanguage === 'en' ? 'completed' : 'completado')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Filtra per mantenere solo un protocollo per titolo (il più recente)
      const uniqueProtocols = data?.reduce((acc: any[], rawProtocol: any) => {
        const protocol = convertToStandardProtocol(rawProtocol as MultiLanguageTrainingProtocol, userLanguage);
        if (!acc.some(p => p.title === protocol.title)) {
          acc.push(protocol);
        }
        return acc;
      }, []) || [];

      // Per ogni protocollo completato, recupera il rating personale dell'utente
      const protocolsWithPersonalRating = await Promise.all(
        uniqueProtocols.map(async (protocol: any) => {
          const { data: ratingData, error: ratingError } = await supabase
            .from('protocol_ratings')
            .select('rating')
            .eq('user_id', user.id)
            .eq('protocol_id', protocol.id)
            .maybeSingle();

          if (ratingError) {
            console.error('Error fetching rating:', ratingError);
          }

          // Calcola il tasso di successo personale basato sul rating (1-10 -> 0-100%)
          const personalSuccessRate = ratingData?.rating 
            ? Math.round(((ratingData.rating - 1) / 9.0) * 100)
            : 0;

          return {
            ...protocol,
            personal_success_rate: personalSuccessRate,
            personal_rating: ratingData?.rating || 0
          };
        })
      );

      return protocolsWithPersonalRating as TrainingProtocol[];
    },
  });
};

// Hook per recuperare protocolli attivi dell'utente
export const useActiveProtocols = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['active-protocols'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ottieni la lingua corrente dell'utente
      const { data: profile } = await supabase
        .from('profiles')
        .select('language')
        .eq('user_id', user.id)
        .single();
      
      const userLanguage = (profile?.language as SupportedLanguage) || 'it';
      const statusColumn = `status_${userLanguage}`;

      const { data, error } = await supabase
        .from('ai_training_protocols')
        .select(`
          *,
          exercises:ai_training_exercises(*),
          metrics:ai_training_metrics(*),
          schedule:ai_training_schedules(*)
        `)
        .eq('user_id', user.id)
        .eq(statusColumn, userLanguage === 'it' ? 'attivo' : userLanguage === 'en' ? 'active' : 'activo')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data?.filter(rawProtocol => rawProtocol && rawProtocol.id).map(rawProtocol => {
        const protocol = convertToStandardProtocol(rawProtocol as MultiLanguageTrainingProtocol, userLanguage);
        return {
          ...protocol,
          exercises: rawProtocol.exercises || [],
          metrics: rawProtocol.metrics?.[0] || null,
          schedule: rawProtocol.schedule?.[0] || null,
        };
      }) as TrainingProtocol[];
    },
    refetchInterval: 2000, // Ricarica ogni 2 secondi invece del realtime
  });

  return query;
};

export const useTrainingProtocols = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ['training-protocols'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Per la lista principale, mostra solo protocolli pubblici (template disponibili)
      const { data, error } = await supabase
        .from('ai_training_protocols')
        .select(`
          *,
          exercises:ai_training_exercises(*),
          metrics:ai_training_metrics(*),
          schedule:ai_training_schedules(*)
        `)
        .eq('is_public', true)
        .eq('status_it', 'disponibile')  // Usa la colonna italiana
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ottieni la lingua corrente dell'utente
      const { data: profile } = await supabase
        .from('profiles')
        .select('language')
        .eq('user_id', user.id)
        .single();
      
      const userLanguage = (profile?.language as SupportedLanguage) || 'it';

      return data?.map(rawProtocol => {
        const protocol = convertToStandardProtocol(rawProtocol as MultiLanguageTrainingProtocol, userLanguage);
        return {
          ...protocol,
          exercises: rawProtocol.exercises || [],
          metrics: rawProtocol.metrics?.[0] || null,
          schedule: rawProtocol.schedule?.[0] || null,
        };
      }) as TrainingProtocol[];
    },
    staleTime: 0, // Forza sempre il refresh
  });
};

export const useSuggestedProtocols = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

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
          title: t('training.errorCreating'),
          description: t('training.errorCreatingDescription'),
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
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (protocol: Omit<TrainingProtocol, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Ottieni la lingua corrente dell'utente
      const { data: profile } = await supabase
        .from('profiles')
        .select('language')
        .eq('user_id', user.id)
        .single();
      
      const userLanguage = (profile?.language as SupportedLanguage) || 'it';

      // Converte il protocollo nel formato multilingua
      const multiLangProtocol = convertFromStandardProtocol(protocol, userLanguage);

      const { data, error } = await supabase
        .from('ai_training_protocols')
        .insert({
          ...multiLangProtocol,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return convertToStandardProtocol(data as MultiLanguageTrainingProtocol, userLanguage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['active-protocols'] });
      toast({
        title: t('training.protocolCreated'),
        description: t('training.protocolCreatedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('training.errorCreating'),
        description: t('training.errorCreatingDescription'),
        variant: 'destructive',
      });
      console.error('Error creating protocol:', error);
    },
  });
};

export const useUpdateProtocol = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TrainingProtocol> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ottieni la lingua corrente dell'utente
      const { data: profile } = await supabase
        .from('profiles')
        .select('language')
        .eq('user_id', user.id)
        .single();
      
      const userLanguage = (profile?.language as SupportedLanguage) || 'it';

      // Converte gli aggiornamenti nel formato multilingua
      const multiLangUpdates = convertFromStandardProtocol(updates, userLanguage);

      const { data, error } = await supabase
        .from('ai_training_protocols')
        .update(multiLangUpdates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data ? convertToStandardProtocol(data as MultiLanguageTrainingProtocol, userLanguage) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['active-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['completed-protocols'] });
    },
    onError: (error) => {
      toast({
        title: t('training.errorUpdating'),
        description: t('training.errorUpdatingDescription'),
        variant: 'destructive',
      });
      console.error('Error updating protocol:', error);
    },
  });
};

export const useDeleteProtocol = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('training.protocolDeleted'),
        description: t('training.protocolDeletedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('training.errorDeleting'),
        description: t('training.errorDeletingDescription'),
        variant: 'destructive',
      });
      console.error('Error deleting protocol:', error);
    },
  });
};

export const useAcceptSuggestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('training.suggestionAccepted'),
        description: t('training.suggestionAcceptedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('training.errorAccepting'),
        description: t('training.errorAcceptingDescription'),
        variant: 'destructive',
      });
      console.error('Error accepting suggestion:', error);
    },
  });
};

export const useDismissSuggestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('training.suggestionDismissed'),
        description: t('training.suggestionDismissedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('training.errorDismissing'),
        description: t('training.errorDismissingDescription'),
        variant: 'destructive',
      });
      console.error('Error dismissing suggestion:', error);
    },
  });
};
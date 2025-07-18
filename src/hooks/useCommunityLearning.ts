import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type {
  CommunityPattern,
  CrossSpeciesInsight,
  AnonymousBenchmark,
  CommunityTrend,
  CommunityAnomaly,
  ModelImprovement,
  AIInsightsNotification,
  CommunityFilters,
  CommunityStats
} from '@/types/communityLearning';

export const useCommunityPatterns = (filters?: CommunityFilters) => {
  return useQuery({
    queryKey: ['community-patterns', filters],
    queryFn: async () => {
      let query = supabase
        .from('community_patterns')
        .select('*')
        .eq('validation_status', 'validated')
        .order('confidence_score', { ascending: false });

      if (filters?.species?.length) {
        query = query.overlaps('species_affected', filters.species);
      }

      if (filters?.confidence_threshold) {
        query = query.gte('confidence_score', filters.confidence_threshold);
      }

      if (filters?.impact_level?.length) {
        query = query.in('impact_level', filters.impact_level);
      }

      if (filters?.time_range) {
        query = query
          .gte('discovery_date', filters.time_range.start)
          .lte('discovery_date', filters.time_range.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CommunityPattern[];
    },
    staleTime: 5 * 60 * 1000, // 5 minuti
  });
};

export const useCrossSpeciesInsights = (sourceSpecies?: string, targetSpecies?: string) => {
  return useQuery({
    queryKey: ['cross-species-insights', sourceSpecies, targetSpecies],
    queryFn: async () => {
      let query = supabase
        .from('cross_species_insights')
        .select('*')
        .order('applicability_score', { ascending: false });

      if (sourceSpecies) {
        query = query.eq('source_species', sourceSpecies);
      }

      if (targetSpecies) {
        query = query.eq('target_species', targetSpecies);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrossSpeciesInsight[];
    },
    staleTime: 10 * 60 * 1000, // 10 minuti
  });
};

export const useAnonymousBenchmarks = (species?: string, benchmarkType?: string) => {
  return useQuery({
    queryKey: ['anonymous-benchmarks', species, benchmarkType],
    queryFn: async () => {
      let query = supabase
        .from('anonymous_benchmarks')
        .select('*')
        .order('last_updated', { ascending: false });

      if (species) {
        query = query.eq('species', species);
      }

      if (benchmarkType) {
        query = query.eq('benchmark_type', benchmarkType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AnonymousBenchmark[];
    },
    staleTime: 15 * 60 * 1000, // 15 minuti
  });
};

export const useCommunityTrends = (category?: string) => {
  return useQuery({
    queryKey: ['community-trends', category],
    queryFn: async () => {
      let query = supabase
        .from('community_trends')
        .select('*')
        .order('trend_strength', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CommunityTrend[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCommunityAnomalies = (severity?: string[]) => {
  return useQuery({
    queryKey: ['community-anomalies', severity],
    queryFn: async () => {
      let query = supabase
        .from('community_anomalies')
        .select('*')
        .in('severity', ['medium', 'high', 'critical'])
        .order('created_at', { ascending: false });

      if (severity?.length) {
        query = query.in('severity', severity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CommunityAnomaly[];
    },
    staleTime: 2 * 60 * 1000, // 2 minuti per anomalie
  });
};

export const useModelImprovements = () => {
  return useQuery({
    queryKey: ['model-improvements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_improvements')
        .select('*')
        .in('rollout_status', ['partial', 'complete'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ModelImprovement[];
    },
    staleTime: 30 * 60 * 1000, // 30 minuti
  });
};

export const useAINotifications = () => {
  return useQuery({
    queryKey: ['ai-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights_notifications')
        .select('*')
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIInsightsNotification[];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto per notifiche
  });
};

export const useCommunityStats = () => {
  return useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      // Query parallele per ottimizzare le performance
      const [
        patternsResult,
        validatedPatternsResult,
        trendsResult,
        anomaliesResult
      ] = await Promise.all([
        supabase.from('community_patterns').select('id', { count: 'exact', head: true }),
        supabase.from('community_patterns').select('id', { count: 'exact', head: true }).eq('validation_status', 'validated'),
        supabase.from('community_trends').select('id', { count: 'exact', head: true }),
        supabase.from('community_anomalies').select('id', { count: 'exact', head: true }).eq('resolution_status', 'open')
      ]);

      // Calcola statistiche aggregate
      const { data: confidenceData } = await supabase
        .from('community_patterns')
        .select('confidence_score')
        .eq('validation_status', 'validated');

      const avgConfidence = confidenceData?.length 
        ? confidenceData.reduce((sum, p) => sum + p.confidence_score, 0) / confidenceData.length
        : 0;

      // Conta specie uniche
      const { data: speciesData } = await supabase
        .from('community_patterns')
        .select('species_affected')
        .eq('validation_status', 'validated');

      const uniqueSpecies = new Set();
      speciesData?.forEach(p => 
        p.species_affected.forEach((species: string) => uniqueSpecies.add(species))
      );

      return {
        total_patterns: patternsResult.count || 0,
        validated_patterns: validatedPatternsResult.count || 0,
        active_trends: trendsResult.count || 0,
        open_anomalies: anomaliesResult.count || 0,
        species_coverage: uniqueSpecies.size,
        confidence_average: avgConfidence,
        recent_discoveries: 0, // TODO: calcolare ultimi 7 giorni
      } as CommunityStats;
    },
    staleTime: 10 * 60 * 1000, // 10 minuti
  });
};

export const useMarkNotificationRead = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('ai_insights_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile segnare la notifica come letta",
        variant: "destructive",
      });
    },
  });
};

export const useDismissNotification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('ai_insights_notifications')
        .update({ 
          is_dismissed: true, 
          dismissed_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-notifications'] });
      toast({
        title: "Notifica rimossa",
        description: "La notifica è stata rimossa dalla lista",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile rimuovere la notifica",
        variant: "destructive",
      });
    },
  });
};
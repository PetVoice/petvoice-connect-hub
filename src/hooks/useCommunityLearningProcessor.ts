import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ProcessingTask {
  type: 'pattern_discovery' | 'trend_analysis' | 'anomaly_detection' | 'cross_species_transfer';
  species_filter?: string[];
  time_range?: { start: string; end: string };
  confidence_threshold?: number;
}

export const useCommunityLearningProcessor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: ProcessingTask) => {
      console.log('Starting community learning processing:', task);
      
      const { data, error } = await supabase.functions.invoke('community-learning-processor', {
        body: { task }
      });

      if (error) {
        console.error('Processing error:', error);
        throw error;
      }

      console.log('Processing completed:', data);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Processamento Completato',
        description: `Elaborazione terminata con successo. ${data?.patterns_discovered || 0} pattern scoperti.`,
      });
      
      // Invalida le cache per ricaricare i dati
      queryClient.invalidateQueries({ queryKey: ['community-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ai-notifications'] });
    },
    onError: (error) => {
      console.error('Processing failed:', error);
      toast({
        title: 'Errore nel Processamento',
        description: 'Si è verificato un errore durante l\'elaborazione dei dati.',
        variant: 'destructive',
      });
    }
  });
};
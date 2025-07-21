import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePredictiveGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePredictiveAnalysis = async (petId: string, userId: string) => {
    setIsGenerating(true);
    
    try {
      console.log(`Generating predictive analysis for pet ${petId}...`);
      
      const { data, error } = await supabase.functions.invoke('generate-predictive-analysis', {
        body: {
          petId,
          userId
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.message || 'Errore durante la generazione delle previsioni');
      }

      console.log('Predictive analysis generated:', data.generated);
      
      toast({
        title: "Analisi completata!",
        description: `Generate: ${data.generated.predictions} previsioni, ${data.generated.warnings} avvisi, ${data.generated.interventions} interventi.`
      });

      return {
        success: true,
        predictions: data.generated.predictions,
        warnings: data.generated.warnings,
        interventions: data.generated.interventions,
        riskScore: data.generated.riskScore
      };

    } catch (error: any) {
      console.error('Error generating predictive analysis:', error);
      
      const errorMessage = error.message || 'Errore durante la generazione delle previsioni';
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive"
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePredictiveAnalysis,
    isGenerating
  };
};
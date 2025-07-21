import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface BehaviorPrediction {
  id: string;
  pet_id: string;
  prediction_date: string;
  prediction_window: string;
  predicted_behaviors: any;
  confidence_scores: any;
  contributing_factors: any;
}

export interface HealthRiskAssessment {
  id: string;
  pet_id: string;
  overall_risk_score: number;
  risk_categories: any;
  risk_factors: any;
  recommendations: any;
  assessment_date: string;
  trend_direction: string | null;
}

export interface EarlyWarning {
  id: string;
  pet_id: string;
  warning_type: string;
  severity_level: string;
  pattern_detected: any;
  alert_message: string;
  suggested_actions: any;
  is_acknowledged: boolean;
  expires_at?: string;
  created_at: string;
}

export interface InterventionRecommendation {
  id: string;
  pet_id: string;
  intervention_type: string;
  recommended_timing: string;
  priority_level: string;
  success_probability: number;
  estimated_cost?: number;
  reasoning: string;
  expected_outcomes: any;
  status: string;
}

export const usePredictiveAnalytics = (petId?: string) => {
  const { user } = useAuth();
  const [behaviorPredictions, setBehaviorPredictions] = useState<BehaviorPrediction[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<HealthRiskAssessment[]>([]);
  const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarning[]>([]);
  const [interventions, setInterventions] = useState<InterventionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch behavior predictions
  const fetchBehaviorPredictions = async () => {
    if (!user || !petId) return;

    try {
      let query = supabase
        .from('behavior_predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('prediction_date', { ascending: false });

      if (petId) {
        query = query.eq('pet_id', petId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setBehaviorPredictions(data || []);
    } catch (err) {
      console.error('Error fetching behavior predictions:', err);
      setError('Errore nel caricamento delle previsioni comportamentali');
    }
  };

  // Fetch risk assessments
  const fetchRiskAssessments = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('health_risk_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('assessment_date', { ascending: false });

      if (petId) {
        query = query.eq('pet_id', petId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setRiskAssessments(data || []);
    } catch (err) {
      console.error('Error fetching risk assessments:', err);
      setError('Errore nel caricamento delle valutazioni di rischio');
    }
  };

  // Fetch early warnings
  const fetchEarlyWarnings = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('early_warnings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false });

      if (petId) {
        query = query.eq('pet_id', petId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setEarlyWarnings(data || []);
    } catch (err) {
      console.error('Error fetching early warnings:', err);
      setError('Errore nel caricamento degli avvisi precoci');
    }
  };

  // Fetch intervention recommendations
  const fetchInterventions = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('intervention_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('recommended_timing', { ascending: true });

      if (petId) {
        query = query.eq('pet_id', petId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setInterventions(data || []);
    } catch (err) {
      console.error('Error fetching interventions:', err);
      setError('Errore nel caricamento delle raccomandazioni di intervento');
    }
  };

  // Acknowledge warning
  const acknowledgeWarning = async (warningId: string) => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('early_warnings')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', warningId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setEarlyWarnings(prev => 
        prev.filter(warning => warning.id !== warningId)
      );

      toast({
        title: "Avviso riconosciuto",
        description: "L'avviso è stato contrassegnato come letto.",
      });
    } catch (err) {
      console.error('Error acknowledging warning:', err);
      toast({
        title: "Errore",
        description: "Impossibile riconoscere l'avviso",
        variant: "destructive",
      });
    }
  };

  // Schedule intervention
  const scheduleIntervention = async (interventionId: string) => {
    if (!user) return;

    try {
      // Get intervention details first
      const intervention = interventions.find(i => i.id === interventionId);
      if (!intervention) return;

      // Create calendar event
      const eventData = {
        user_id: user.id,
        pet_id: intervention.pet_id,
        title: `Intervento: ${intervention.intervention_type}`,
        description: intervention.reasoning,
        start_time: intervention.recommended_timing,
        end_time: new Date(new Date(intervention.recommended_timing).getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
        category: 'intervention',
        status: 'scheduled',
        reminder_settings: {
          enabled: true,
          times: ['24h', '2h']
        }
      };

      const { error: calendarError } = await supabase
        .from('calendar_events')
        .insert([eventData]);

      if (calendarError) throw calendarError;

      // Update intervention status
      const { error: updateError } = await supabase
        .from('intervention_recommendations')
        .update({ status: 'scheduled' })
        .eq('id', interventionId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setInterventions(prev =>
        prev.map(intervention =>
          intervention.id === interventionId
            ? { ...intervention, status: 'scheduled' }
            : intervention
        )
      );

      toast({
        title: "Intervento programmato",
        description: "L'intervento è stato aggiunto al calendario.",
      });
    } catch (err) {
      console.error('Error scheduling intervention:', err);
      toast({
        title: "Errore",
        description: "Impossibile programmare l'intervento",
        variant: "destructive",
      });
    }
  };

  // Dismiss intervention
  const dismissIntervention = async (interventionId: string) => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('intervention_recommendations')
        .update({ status: 'dismissed' })
        .eq('id', interventionId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setInterventions(prev =>
        prev.map(intervention =>
          intervention.id === interventionId
            ? { ...intervention, status: 'dismissed' }
            : intervention
        )
      );

      toast({
        title: "Intervento ignorato",
        description: "La raccomandazione è stata rimossa.",
      });
    } catch (err) {
      console.error('Error dismissing intervention:', err);
      toast({
        title: "Errore",
        description: "Impossibile ignorare l'intervento",
        variant: "destructive",
      });
    }
  };

  // Calculate risk score for a pet
  const calculateRiskScore = async (targetPetId: string) => {
    if (!user) return;

    try {
      const { data, error: rpcError } = await supabase
        .rpc('calculate_pet_risk_score', {
          p_pet_id: targetPetId,
          p_user_id: user.id
        });

      if (rpcError) throw rpcError;
      
      return data as number;
    } catch (err) {
      console.error('Error calculating risk score:', err);
      return null;
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchBehaviorPredictions(),
        fetchRiskAssessments(),
        fetchEarlyWarnings(),
        fetchInterventions()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, petId]);

  // Get latest risk assessment for a pet
  const getLatestRiskAssessment = (targetPetId?: string): HealthRiskAssessment | null => {
    const filtered = targetPetId 
      ? riskAssessments.filter(assessment => assessment.pet_id === targetPetId)
      : riskAssessments;
    
    return filtered.length > 0 ? filtered[0] : null;
  };

  // Get active predictions
  const getActivePredictions = (targetPetId?: string): BehaviorPrediction[] => {
    const today = new Date().toISOString().split('T')[0];
    const filtered = behaviorPredictions.filter(prediction => {
      const matchesPet = !targetPetId || prediction.pet_id === targetPetId;
      const isActive = prediction.prediction_date >= today;
      return matchesPet && isActive;
    });

    return filtered;
  };

  // Get critical warnings
  const getCriticalWarnings = (targetPetId?: string): EarlyWarning[] => {
    const filtered = earlyWarnings.filter(warning => {
      const matchesPet = !targetPetId || warning.pet_id === targetPetId;
      const isCritical = warning.severity_level === 'critical' || warning.severity_level === 'high';
      return matchesPet && isCritical;
    });

    return filtered;
  };

  return {
    // Data
    behaviorPredictions,
    riskAssessments,
    earlyWarnings,
    interventions,
    
    // State
    loading,
    error,
    
    // Actions
    acknowledgeWarning,
    scheduleIntervention,
    dismissIntervention,
    calculateRiskScore,
    refreshData,
    
    // Helpers
    getLatestRiskAssessment,
    getActivePredictions,
    getCriticalWarnings,
  };
};
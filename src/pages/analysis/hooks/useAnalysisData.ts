import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AnalysisData {
  id: string;
  pet_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  primary_emotion: string;
  primary_confidence: number;
  secondary_emotions: any;
  behavioral_insights: string;
  recommendations: string[];
  triggers: string[];
  analysis_duration: unknown;
  created_at: string;
  updated_at: string;
}

interface UseAnalysisDataReturn {
  analyses: AnalysisData[];
  diaryData: any[];
  healthData: any[];
  wellnessData: any[];
  healthAlerts: any[];
  calendarEvents: any[];
  petData: any;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useAnalysisData = (petId?: string): UseAnalysisDataReturn => {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [diaryData, setDiaryData] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [wellnessData, setWellnessData] = useState<any[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [petData, setPetData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadAllData = useCallback(async () => {
    if (!petId) return;

    setLoading(true);
    setError(null);
    
    try {
      // Load analyses
      const analysesPromise = supabase
        .from('pet_analyses')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      // Load diary entries
      const diaryPromise = supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', petId)
        .order('entry_date', { ascending: false });

      // Load health metrics
      const healthPromise = supabase
        .from('health_metrics')
        .select('*')
        .eq('pet_id', petId)
        .order('recorded_at', { ascending: false });

      // Load wellness scores
      const wellnessPromise = supabase
        .from('pet_wellness_scores')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      // Load health alerts
      const alertsPromise = supabase
        .from('health_alerts')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      // Load calendar events
      const eventsPromise = supabase
        .from('calendar_events')
        .select('*')
        .eq('pet_id', petId)
        .order('start_time', { ascending: false });

      // Load pet data
      const petPromise = supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      // Execute all queries in parallel
      const [
        { data: analysesData, error: analysesError },
        { data: diaryDataRes, error: diaryError },
        { data: healthDataRes, error: healthError },
        { data: wellnessDataRes, error: wellnessError },
        { data: alertsData, error: alertsError },
        { data: eventsData, error: eventsError },
        { data: petDataRes, error: petError }
      ] = await Promise.all([
        analysesPromise,
        diaryPromise,
        healthPromise,
        wellnessPromise,
        alertsPromise,
        eventsPromise,
        petPromise
      ]);

      if (analysesError) throw analysesError;
      if (diaryError) console.warn('Error loading diary data:', diaryError);
      if (healthError) console.warn('Error loading health data:', healthError);
      if (wellnessError) console.warn('Error loading wellness data:', wellnessError);
      if (alertsError) console.warn('Error loading alerts data:', alertsError);
      if (eventsError) console.warn('Error loading events data:', eventsError);
      if (petError) console.warn('Error loading pet data:', petError);

      setAnalyses(analysesData || []);
      setDiaryData(diaryDataRes || []);
      setHealthData(healthDataRes || []);
      setWellnessData(wellnessDataRes || []);
      setHealthAlerts(alertsData || []);
      setCalendarEvents(eventsData || []);
      setPetData(petDataRes || null);

    } catch (err: any) {
      const errorMessage = err?.message || 'Impossibile caricare tutti i dati';
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [petId, toast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    analyses,
    diaryData,
    healthData,
    wellnessData,
    healthAlerts,
    calendarEvents,
    petData,
    loading,
    error,
    refreshData: loadAllData
  };
};
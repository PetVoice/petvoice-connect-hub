import { useMemo } from 'react';
import { AnalysisData } from './useAnalysisData';
import { calculatePredictions } from '../utils/analysisCalculations';

interface PredictionsData {
  analyses: AnalysisData[];
  diaryData: any[];
  healthData: any[];
  wellnessData: any[];
}

export const usePredictions = (data: PredictionsData) => {
  return useMemo(() => {
    return calculatePredictions(data);
  }, [data]);
};
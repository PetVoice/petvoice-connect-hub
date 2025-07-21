import { useState, useMemo, useCallback } from 'react';
import type { DateRange } from 'react-day-picker';
import { AnalysisData } from './useAnalysisData';

interface FilterState {
  searchTerm: string;
  emotionFilter: string;
  confidenceFilter: string;
  dateRange: DateRange | undefined;
}

interface UseAnalysisFiltersReturn {
  filteredAnalyses: AnalysisData[];
  filters: FilterState;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  clearFilters: () => void;
}

const applyFilters = (analyses: AnalysisData[], filters: FilterState): AnalysisData[] => {
  let filtered = [...analyses];

  // Search filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(analysis => 
      analysis.file_name.toLowerCase().includes(searchLower) ||
      analysis.primary_emotion.toLowerCase().includes(searchLower) ||
      analysis.behavioral_insights.toLowerCase().includes(searchLower)
    );
  }

  // Emotion filter
  if (filters.emotionFilter !== 'all') {
    filtered = filtered.filter(analysis => analysis.primary_emotion === filters.emotionFilter);
  }

  // Confidence filter
  if (filters.confidenceFilter !== 'all') {
    const minConfidence = parseInt(filters.confidenceFilter);
    filtered = filtered.filter(analysis => analysis.primary_confidence >= minConfidence);
  }

  // Date filter
  if (filters.dateRange?.from) {
    filtered = filtered.filter(analysis => 
      new Date(analysis.created_at) >= filters.dateRange!.from!
    );
  }
  if (filters.dateRange?.to) {
    filtered = filtered.filter(analysis => 
      new Date(analysis.created_at) <= filters.dateRange!.to!
    );
  }

  return filtered;
};

export const useAnalysisFilters = (analyses: AnalysisData[]): UseAnalysisFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    emotionFilter: 'all',
    confidenceFilter: 'all',
    dateRange: undefined
  });

  const filteredAnalyses = useMemo(() => {
    return applyFilters(analyses, filters);
  }, [analyses, filters]);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      emotionFilter: 'all',
      confidenceFilter: 'all',
      dateRange: undefined
    });
  }, []);

  return {
    filteredAnalyses,
    filters,
    updateFilters,
    clearFilters
  };
};
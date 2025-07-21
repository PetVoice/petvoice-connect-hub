import React from 'react';
import { Filter, Search, CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import AnalysisHistory from '@/components/analysis/AnalysisHistory';
import { AnalysisData } from '../hooks/useAnalysisData';
import { CONFIDENCE_LEVELS, EMOTION_LABELS } from '../utils/constants';

interface HistorySectionProps {
  analyses: AnalysisData[];
  filteredAnalyses: AnalysisData[];
  filters: {
    searchTerm: string;
    emotionFilter: string;
    confidenceFilter: string;
    dateRange: DateRange | undefined;
  };
  onFiltersChange: (newFilters: any) => void;
  onClearFilters: () => void;
}

const FiltersCard: React.FC<{
  filters: any;
  onFiltersChange: (newFilters: any) => void;
  onClearFilters: () => void;
}> = ({ filters, onFiltersChange, onClearFilters }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtri Avanzati
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cerca</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome file, emozione..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Emozione</label>
            <Select 
              value={filters.emotionFilter} 
              onValueChange={(value) => onFiltersChange({ emotionFilter: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tutte le emozioni" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le emozioni</SelectItem>
                {Object.entries(EMOTION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confidenza</label>
            <Select 
              value={filters.confidenceFilter} 
              onValueChange={(value) => onFiltersChange({ confidenceFilter: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tutte le confidenze" />
              </SelectTrigger>
              <SelectContent>
                {CONFIDENCE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Periodo</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "dd/MM/yyyy", { locale: it })} -{" "}
                        {format(filters.dateRange.to, "dd/MM/yyyy", { locale: it })}
                      </>
                    ) : (
                      format(filters.dateRange.from, "dd/MM/yyyy", { locale: it })
                    )
                  ) : (
                    <span>Seleziona periodo</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) => onFiltersChange({ dateRange: range })}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
          >
            Pulisci Filtri
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const HistorySection: React.FC<HistorySectionProps> = ({
  analyses,
  filteredAnalyses,
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  return (
    <div className="space-y-6">
      <FiltersCard
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
      />
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Cronologia Analisi ({filteredAnalyses.length})
        </h2>
      </div>

      <AnalysisHistory 
        analyses={filteredAnalyses}
      />
    </div>
  );
};
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Grid3X3, List, Settings, X } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/types/calendar';

interface CalendarFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  onExport: () => Promise<void>;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  filterCategory,
  onFilterCategoryChange,
  viewMode,
  onViewModeChange,
  onExport
}) => {
  return (
    <div className="space-y-4">
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca eventi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="medical">Medici</SelectItem>
              <SelectItem value="grooming">Toelettatura</SelectItem>
              <SelectItem value="training">Addestramento</SelectItem>
              <SelectItem value="social">Socializzazione</SelectItem>
              <SelectItem value="exercise">Esercizio</SelectItem>
              <SelectItem value="feeding">Alimentazione</SelectItem>
              <SelectItem value="travel">Viaggi</SelectItem>
              <SelectItem value="other">Altri</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('month')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('week')}
              className="rounded-none border-x"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('day')}
              className="rounded-l-none"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
          <Badge
            key={key}
            variant={selectedCategories.includes(key) ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              selectedCategories.includes(key) 
                ? `${category.color}` 
                : 'hover:bg-muted'
            }`}
            onClick={() => onCategoryToggle(key)}
          >
            {category.icon} {category.label}
            {selectedCategories.includes(key) && (
              <X className="h-3 w-3 ml-1" />
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
};
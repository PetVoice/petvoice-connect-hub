import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Grid3X3, List, Settings, X } from 'lucide-react';
import { PREDEFINED_TAGS, TAG_COLORS } from '@/types/diary';

interface DiaryFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  onExport: () => Promise<void>;
}

export const DiaryFilters: React.FC<DiaryFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedTags,
  onTagToggle,
  filterCategory,
  onFilterCategoryChange,
  viewMode,
  onViewModeChange,
  onExport
}) => {
  const allTags = Object.values(PREDEFINED_TAGS).flat();
  
  const getTagColor = (tag: string) => {
    for (const [category, tags] of Object.entries(PREDEFINED_TAGS)) {
      if (tags.includes(tag)) {
        return TAG_COLORS[category as keyof typeof TAG_COLORS];
      }
    }
    return 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca nelle voci del diario..."
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
              <SelectItem value="emotional">Emotivi</SelectItem>
              <SelectItem value="behavioral">Comportamentali</SelectItem>
              <SelectItem value="health">Salute</SelectItem>
              <SelectItem value="environmental">Ambientali</SelectItem>
              <SelectItem value="training">Training</SelectItem>
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
          </div>
          
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
        </div>
      </div>
    </div>
  );
};
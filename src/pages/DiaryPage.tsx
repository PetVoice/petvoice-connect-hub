import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePets } from '@/contexts/PetContext';
import { useNotificationEventsContext } from '@/contexts/NotificationEventsContext';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

// Components
import { DiaryHeader } from '@/components/diary/DiaryHeader';
import { DiaryFilters } from '@/components/diary/DiaryFilters';
import { DiaryCalendarView } from '@/components/diary/DiaryCalendarView';
import { DiaryEntryForm } from '@/components/diary/DiaryEntryForm';
import { DayEntriesModal } from '@/components/diary/DayEntriesModal';
import { DiaryLegend } from '@/components/diary/DiaryLegend';

// Types
import { DiaryEntry, DayEntriesModalState } from '@/types/diary';

const DiaryPage: React.FC = () => {
  const { pets, selectedPet } = usePets();
  const { triggerDiaryAdded } = useNotificationEventsContext();
  const { showToast } = useTranslatedToast();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // UI state
  const [showLegend, setShowLegend] = useState(false);
  const [dayEntriesModal, setDayEntriesModal] = useState<DayEntriesModalState>({ 
    open: false, 
    date: new Date(), 
    entries: [] 
  });

  // Load entries
  const loadEntries = useCallback(async () => {
    if (!selectedPet) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      showToast({
        title: 'error.title',
        description: 'diary.error.cannotLoad',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPet]);

  // Filter entries
  useEffect(() => {
    let filtered = [...entries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.behavioral_tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        entry.behavioral_tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // Date range filter based on view mode
    if (viewMode !== 'month') {
      const start = viewMode === 'week' 
        ? startOfWeek(currentDate)
        : startOfDay(currentDate);
      const end = viewMode === 'week'
        ? endOfWeek(currentDate)
        : endOfDay(currentDate);

      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.entry_date);
        return entryDate >= start && entryDate <= end;
      });
    }

    setFilteredEntries(filtered);
  }, [entries, searchTerm, selectedTags, viewMode, currentDate, filterCategory]);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Listen for diary updates from other pages
  useEffect(() => {
    const handleDiaryUpdate = (event: CustomEvent) => {
      console.log('DiaryPage - Diary update event received:', event.detail);
      loadEntries(); // Reload entries when behavior tags are modified
    };

    window.addEventListener('diaryUpdated', handleDiaryUpdate as EventListener);
    
    return () => {
      window.removeEventListener('diaryUpdated', handleDiaryUpdate as EventListener);
    };
  }, [loadEntries]);

  // Handlers
  const handleNewEntry = (date?: Date) => {
    if (date instanceof Date && !isNaN(date.getTime())) setSelectedDate(date);
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleSaveEntry = async (data: any) => {
    if (!selectedPet) return;

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('diary_entries')
          .update(data)
          .eq('id', editingEntry.id);

        if (error) throw error;
        showToast({
          title: 'diary.entryUpdated.title',
          description: 'diary.entryUpdated.description',
          variant: 'success'
        });
      } else {
        const { error } = await supabase
          .from('diary_entries')
          .insert(data);

        if (error) throw error;
        showToast({
          title: 'diary.entryCreated.title',
          description: 'diary.entryCreated.description',
          variant: 'success'
        });
        
        // Trigger notification for new diary entry
        if (selectedPet) {
          triggerDiaryAdded(selectedPet.name);
        }
      }

      setIsFormOpen(false);
      setEditingEntry(null);
      loadEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      showToast({
        title: 'error.title',
        description: 'diary.error.cannotSave',
        variant: 'destructive'
      });
    }
  };

  const handleDayClick = (day: Date) => {
    if (day instanceof Date && !isNaN(day.getTime())) {
      setSelectedDate(day);
      const dayEntries = entries.filter(entry => 
        isSameDay(parseISO(entry.entry_date), day)
      );
      
      setDayEntriesModal({ open: true, date: day, entries: dayEntries });
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleExport = async () => {
    if (!selectedPet) return;

    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text(`Diario di ${selectedPet.name}`, 20, 20);
      
      // Date range
      doc.setFontSize(12);
      doc.text(`Esportato il: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 35);
      doc.text(`Totale voci: ${filteredEntries.length}`, 20, 45);

      let yPosition = 60;
      const pageHeight = doc.internal.pageSize.height;

      // Entries
      filteredEntries
        .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
        .forEach((entry) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }

          // Entry date
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.text(`${format(parseISO(entry.entry_date), 'dd/MM/yyyy')}`, 20, yPosition);
          yPosition += 10;

          // Entry title
          if (entry.title) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(entry.title, 20, yPosition);
            yPosition += 8;
          }

          // Mood score
          if (entry.mood_score) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Umore: ${entry.mood_score}/10`, 20, yPosition);
            yPosition += 6;
          }

          // Content
          if (entry.content) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(entry.content, 170);
            doc.text(lines, 20, yPosition);
            yPosition += lines.length * 5;
          }

          // Tags
          if (entry.behavioral_tags && entry.behavioral_tags.length > 0) {
            doc.setFontSize(9);
            doc.text(`Tag: ${entry.behavioral_tags.join(', ')}`, 20, yPosition);
            yPosition += 6;
          }

          // Weather
          if (entry.weather_condition || entry.temperature) {
            const weatherInfo = [];
            if (entry.weather_condition) weatherInfo.push(`Meteo: ${entry.weather_condition}`);
            if (entry.temperature) weatherInfo.push(`Temp: ${entry.temperature}°C`);
            doc.setFontSize(9);
            doc.text(weatherInfo.join(' - '), 20, yPosition);
            yPosition += 6;
          }

          yPosition += 10; // Space between entries
        });

      // Save PDF
      doc.save(`diario-${selectedPet.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      showToast({
        title: 'diary.pdfExported.title',
        description: 'diary.pdfExported.description',
        variant: 'success',
        variables: { petName: selectedPet.name }
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast({
        title: 'error.title',
        description: 'diary.error.cannotExport',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      
      showToast({
        title: 'diary.entryDeleted.title',
        description: 'diary.entryDeleted.description',
        variant: 'success'
      });
      
      // Update modal state
      setDayEntriesModal(prev => ({
        ...prev,
        entries: prev.entries.filter(entry => entry.id !== entryId)
      }));
      
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast({
        title: 'error.title',
        description: 'diary.error.cannotDelete',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteMultiple = async (entryIds: string[]) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .in('id', entryIds);

      if (error) throw error;
      
      showToast({
        title: 'diary.entriesDeleted.title',
        description: 'diary.entriesDeleted.description',
        variant: 'success',
        variables: { count: entryIds.length.toString() }
      });
      
      // Update modal state
      setDayEntriesModal(prev => ({
        ...prev,
        entries: prev.entries.filter(entry => !entryIds.includes(entry.id))
      }));
      
      loadEntries();
    } catch (error) {
      console.error('Error deleting entries:', error);
      showToast({
        title: 'error.title',
        description: 'diary.error.cannotDeleteMultiple',
        variant: 'destructive'
      });
    }
  };

  // Show loading or no pet selected
  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Nessun pet selezionato</h2>
          <p className="text-muted-foreground">
            Seleziona un pet per visualizzare il diario
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <DiaryHeader
        petName={selectedPet.name}
        onNewEntry={handleNewEntry}
        onToggleLegend={() => setShowLegend(!showLegend)}
        showLegend={showLegend}
      />

      {/* Legend */}
      <DiaryLegend show={showLegend} />

      {/* Filters */}
      <DiaryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
      />

      {/* Calendar View */}
      <DiaryCalendarView
        currentDate={currentDate}
        onCurrentDateChange={setCurrentDate}
        entries={filteredEntries}
        onDayClick={handleDayClick}
        viewMode={viewMode}
      />

      {/* Entry Form Modal */}
      <DiaryEntryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEntry(null);
        }}
        entry={editingEntry}
        onSave={handleSaveEntry}
        petId={selectedPet.id}
        userId={selectedPet.user_id}
        initialDate={selectedDate instanceof Date && !isNaN(selectedDate.getTime()) ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
      />

      {/* Day Entries Modal */}
      <DayEntriesModal
        modalState={dayEntriesModal}
        onClose={() => setDayEntriesModal(prev => ({ ...prev, open: false }))}
        onNewEntry={(date) => {
          if (date instanceof Date && !isNaN(date.getTime())) setSelectedDate(date);
          handleNewEntry(date);
        }}
        onEditEntry={handleEditEntry}
        onDeleteEntry={handleDeleteEntry}
        onDeleteMultiple={handleDeleteMultiple}
      />
    </div>
  );
};

export default DiaryPage;
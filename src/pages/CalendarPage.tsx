import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { useNotifications } from '@/hooks/useNotifications';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

// Components
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { CalendarView } from '@/components/calendar/CalendarView';
import { EventForm } from '@/components/calendar/EventForm';

// Types
import { CalendarEvent } from '@/types/calendar';

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, selectedPet } = usePets();
  const { addNotification } = useNotifications();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // UI state
  const [showTemplates, setShowTemplates] = useState(false);

  // Get active pet
  const activePet = selectedPet || pets[0];

  // Load events
  const loadEvents = useCallback(async () => {
    if (!activePet || !user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('pet_id', activePet.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli eventi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [activePet, user]);

  // Filter events
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Categories filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event =>
        selectedCategories.includes(event.category)
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

      filtered = filtered.filter(event => {
        const eventDate = parseISO(event.start_time);
        return eventDate >= start && eventDate <= end;
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategories, viewMode, currentDate]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Handlers
  const handleNewEvent = (date?: Date) => {
    if (date) setSelectedDate(date);
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (data: any) => {
    if (!activePet || !user) return;

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('calendar_events')
          .update(data)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast({ title: "Evento aggiornato con successo!" });
      } else {
        const { data: newEvent, error } = await supabase
          .from('calendar_events')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        
        // Add notification for new event
        if (newEvent) {
          addNotification({
            title: `Nuovo evento: ${newEvent.title}`,
            message: `Evento programmato per ${format(parseISO(newEvent.start_time), 'dd/MM/yyyy HH:mm')}`,
            type: 'info',
            read: false
          });
        }
        
        toast({ title: "Nuovo evento creato!" });
      }

      setIsFormOpen(false);
      setEditingEvent(null);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare l'evento",
        variant: "destructive"
      });
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const dayEvents = events.filter(event => 
      isSameDay(parseISO(event.start_time), day)
    );
    
    if (dayEvents.length === 0) {
      handleNewEvent(day);
    }
    // If there are events, the calendar will show them and user can click on specific events
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleExport = async () => {
    if (!activePet) return;

    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text(`Calendario di ${activePet.name}`, 20, 20);
      
      // Date range
      doc.setFontSize(12);
      doc.text(`Esportato il: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 35);
      doc.text(`Totale eventi: ${filteredEvents.length}`, 20, 45);

      let yPosition = 60;
      const pageHeight = doc.internal.pageSize.height;

      // Group events by month
      const eventsByMonth = filteredEvents.reduce((acc, event) => {
        const monthKey = format(parseISO(event.start_time), 'yyyy-MM');
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(event);
        return acc;
      }, {} as Record<string, CalendarEvent[]>);

      // Sort months
      const sortedMonths = Object.keys(eventsByMonth).sort();

      sortedMonths.forEach((monthKey) => {
        const monthEvents = eventsByMonth[monthKey].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );

        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        // Month header
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(format(parseISO(monthEvents[0].start_time), 'MMMM yyyy', { locale: it }), 20, yPosition);
        yPosition += 15;

        monthEvents.forEach((event) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }

          // Event date and time
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          const dateStr = event.is_all_day 
            ? format(parseISO(event.start_time), 'dd/MM/yyyy')
            : format(parseISO(event.start_time), 'dd/MM/yyyy HH:mm');
          doc.text(dateStr, 20, yPosition);
          yPosition += 8;

          // Event title and category
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          const categoryEmoji = {
            medical: '🏥', grooming: '✂️', training: '🎓', social: '🐕',
            exercise: '🏃', feeding: '🍽️', travel: '✈️', other: '📅'
          }[event.category] || '📅';
          doc.text(`${categoryEmoji} ${event.title}`, 25, yPosition);
          yPosition += 6;

          // Location
          if (event.location) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`📍 ${event.location}`, 25, yPosition);
            yPosition += 5;
          }

          // Description
          if (event.description) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(event.description, 160);
            doc.text(lines, 25, yPosition);
            yPosition += lines.length * 4;
          }

          // Cost
          if (event.cost) {
            doc.setFontSize(9);
            doc.text(`💰 Costo: €${event.cost.toFixed(2)}`, 25, yPosition);
            yPosition += 5;
          }

          // Status
          doc.setFontSize(9);
          const statusEmoji = {
            scheduled: '📅', completed: '✅', cancelled: '❌', rescheduled: '🔄'
          }[event.status] || '📅';
          doc.text(`${statusEmoji} ${event.status}`, 25, yPosition);
          yPosition += 8;

          yPosition += 5; // Space between events
        });

        yPosition += 10; // Space between months
      });

      // Save PDF
      doc.save(`calendario-${activePet.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "PDF Esportato!",
        description: `Calendario di ${activePet.name} scaricato con successo`
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Errore",
        description: "Impossibile esportare il PDF",
        variant: "destructive"
      });
    }
  };

  // Show loading or no pet selected
  if (!activePet) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Nessun pet disponibile</h2>
          <p className="text-muted-foreground">
            Aggiungi un pet per gestire il calendario
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <CalendarHeader
        petName={activePet.name}
        onNewEvent={() => handleNewEvent()}
        onToggleTemplates={() => setShowTemplates(!showTemplates)}
        showTemplates={showTemplates}
      />

      {/* Filters */}
      <CalendarFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
      />

      {/* Calendar View */}
      <CalendarView
        currentDate={currentDate}
        onCurrentDateChange={setCurrentDate}
        events={filteredEvents}
        onDayClick={handleDayClick}
        onEventClick={handleEditEvent}
      />

      {/* Event Form Modal */}
      <EventForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onSave={handleSaveEvent}
        petId={activePet.id}
        userId={user?.id || ''}
        initialDate={format(selectedDate, 'yyyy-MM-dd')}
      />
    </div>
  );
};

export default CalendarPage;
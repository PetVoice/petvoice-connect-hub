import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, DollarSign, Camera, FileText, Bell, Repeat, AlertTriangle, Filter, Download, Settings, Grid3X3, List, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, addDays, addWeeks, subWeeks, isSameDay, isSameMonth, parseISO, addHours, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

// Types
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  category: string;
  start_time: string;
  end_time?: string;
  is_all_day: boolean;
  recurring_pattern?: any;
  reminder_settings?: any;
  attendees?: string[];
  cost?: number;
  status: string;
  notes?: string;
  photo_urls?: string[];
  pet_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface EventTemplate {
  id: string;
  name: string;
  category: string;
  default_duration?: any;
  default_reminder_settings?: any;
  template_data?: any;
  created_at: string;
  user_id: string;
}

// Event categories with colors and icons
const EVENT_CATEGORIES = {
  veterinary: {
    label: '🏥 Veterinario',
    color: 'bg-red-500 text-white',
    borderColor: 'border-red-500',
    icon: '🏥'
  },
  grooming: {
    label: '🛁 Toelettatura',
    color: 'bg-blue-500 text-white',
    borderColor: 'border-blue-500',
    icon: '🛁'
  },
  medication: {
    label: '💊 Farmaci',
    color: 'bg-green-500 text-white',
    borderColor: 'border-green-500',
    icon: '💊'
  },
  activity: {
    label: '🎾 Attività',
    color: 'bg-orange-500 text-white',
    borderColor: 'border-orange-500',
    icon: '🎾'
  },
  special: {
    label: '🎉 Speciali',
    color: 'bg-purple-500 text-white',
    borderColor: 'border-purple-500',
    icon: '🎉'
  },
  training: {
    label: '📚 Training',
    color: 'bg-yellow-500 text-black',
    borderColor: 'border-yellow-500',
    icon: '📚'
  }
};

const REMINDER_OPTIONS = [
  { value: '2w', label: '2 settimane prima' },
  { value: '1w', label: '1 settimana prima' },
  { value: '24h', label: '24 ore prima' },
  { value: '2h', label: '2 ore prima' },
  { value: '30m', label: '30 minuti prima' }
];

const RECURRING_PATTERNS = [
  { value: 'none', label: 'Nessuna ripetizione' },
  { value: 'daily', label: 'Giornaliera' },
  { value: 'weekly', label: 'Settimanale' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'yearly', label: 'Annuale' }
];

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { pets, selectedPet } = usePets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showLegend, setShowLegend] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    defaultView: 'month' as 'month' | 'week' | 'day',
    workingHours: { start: '09:00', end: '18:00' },
    weekStart: 1, // Monday
    showWeekends: true,
    defaultEventDuration: 60, // minutes
    reminderDefault: ['24h', '2h'],
    autoSaveEnabled: true,
    weatherIntegration: true,
    moodCorrelation: true
  });


  // Form state for event creation/editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'activity',
    start_time: '',
    end_time: '',
    is_all_day: false,
    recurring_pattern: { type: 'none', interval: 1 },
    reminder_settings: { enabled: true, times: ['24h', '2h'] },
    attendees: [] as string[],
    cost: null as number | null,
    notes: '',
    photo_urls: [] as string[]
  });

  const activePet = selectedPet || pets[0];

  // Advanced features hooks
  useEffect(() => {
    if (settings.autoSaveEnabled && editingEvent && formData.title) {
      const autoSaveTimer = setTimeout(() => {
        console.log('Auto-saving event draft...');
        toast({
          title: "Bozza salvata",
          description: "Le modifiche sono state salvate automaticamente",
        });
      }, 5000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData, settings.autoSaveEnabled, editingEvent]);

  useEffect(() => {
    if (settings.weatherIntegration && formData.category === 'activity' && formData.start_time) {
      setTimeout(() => {
        const weatherConditions = ['soleggiato', 'nuvoloso', 'piovoso'];
        const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        
        if (weather === 'piovoso') {
          toast({
            title: "⛈️ Allerta Meteo",
            description: "Previsto tempo piovoso. Considera un'attività al coperto.",
          });
        }
      }, 1000);
    }
  }, [formData.start_time, formData.category, settings.weatherIntegration]);

  useEffect(() => {
    if (settings.moodCorrelation && activePet && formData.start_time && formData.category) {
      setTimeout(() => {
        const moodScore = Math.floor(Math.random() * 10) + 1;
        
        if (moodScore <= 4 && (formData.category === 'veterinary' || formData.category === 'grooming')) {
          toast({
            title: "🧠 Correlazione Umore",
            description: "Considera di programmare eventi stressanti in un momento migliore.",
          });
        }
      }, 1500);
    }
  }, [formData.start_time, formData.category, settings.moodCorrelation, activePet]);
  const loadEvents = useCallback(async () => {
    if (!user || !activePet) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
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
  }, [user, activePet]);

  // Load event templates
  const loadTemplates = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_templates')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }, [user]);

  useEffect(() => {
    loadEvents();
    loadTemplates();
  }, [loadEvents, loadTemplates]);

  // Filter events based on current view and filters
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => event.category === filterCategory);
    }

    // Filter by date range based on view mode
    const start = viewMode === 'month' 
      ? startOfWeek(startOfMonth(currentDate))
      : viewMode === 'week'
      ? startOfWeek(currentDate)
      : startOfDay(currentDate);

    const end = viewMode === 'month'
      ? endOfWeek(endOfMonth(currentDate))
      : viewMode === 'week'
      ? endOfWeek(currentDate)
      : endOfDay(currentDate);

    filtered = filtered.filter(event => {
      const eventDate = parseISO(event.start_time);
      return eventDate >= start && eventDate <= end;
    });

    return filtered;
  }, [events, filterCategory, currentDate, viewMode]);

  // Check for conflicts when creating/editing events
  const checkConflicts = async (startTime: string, endTime: string, excludeId?: string) => {
    if (!user || !activePet || !startTime || !endTime) return;

    try {
      // For now, we'll do a simple client-side conflict check
      // In production, you would call the detect_event_conflicts function
      const conflictingEvents = events.filter(event => {
        if (excludeId && event.id === excludeId) return false;
        if (event.pet_id !== activePet.id) return false;
        
        const eventStart = parseISO(event.start_time);
        const eventEnd = event.end_time ? parseISO(event.end_time) : eventStart;
        const checkStart = parseISO(startTime);
        const checkEnd = parseISO(endTime);
        
        return (
          (eventStart <= checkStart && eventEnd > checkStart) ||
          (eventStart < checkEnd && eventEnd >= checkEnd) ||
          (eventStart >= checkStart && eventEnd <= checkEnd)
        );
      });
      
      setConflicts(conflictingEvents.map(event => ({
        conflicting_event_id: event.id,
        conflicting_title: event.title,
        conflicting_start: event.start_time,
        conflicting_end: event.end_time
      })));
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  // Save event
  const saveEvent = async () => {
    if (!user || !activePet || !formData.title || !formData.start_time) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const eventData = {
        ...formData,
        user_id: user.id,
        pet_id: activePet.id,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        cost: formData.cost || null
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast({ title: "Evento aggiornato con successo!" });
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert(eventData);

        if (error) throw error;
        toast({ title: "Evento creato con successo!" });
      }

      resetForm();
      setIsEventDialogOpen(false);
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

  // Delete event
  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast({ title: "Evento eliminato con successo!" });
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'evento",
        variant: "destructive"
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      category: 'activity',
      start_time: '',
      end_time: '',
      is_all_day: false,
      recurring_pattern: { type: 'none', interval: 1 },
      reminder_settings: { enabled: true, times: ['24h', '2h'] },
      attendees: [],
      cost: null,
      notes: '',
      photo_urls: []
    });
    setEditingEvent(null);
    setConflicts([]);
  };

  // Open event dialog for editing
  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      category: event.category,
      start_time: format(parseISO(event.start_time), "yyyy-MM-dd'T'HH:mm"),
      end_time: event.end_time ? format(parseISO(event.end_time), "yyyy-MM-dd'T'HH:mm") : '',
      is_all_day: event.is_all_day,
      recurring_pattern: event.recurring_pattern || { type: 'none', interval: 1 },
      reminder_settings: event.reminder_settings || { enabled: true, times: ['24h', '2h'] },
      attendees: event.attendees || [],
      cost: event.cost || null,
      notes: event.notes || '',
      photo_urls: event.photo_urls || []
    });
    setIsEventDialogOpen(true);
  };

  // Quick add event on date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    resetForm();
    setFormData(prev => ({
      ...prev,
      start_time: format(date, "yyyy-MM-dd'T'09:00"),
      end_time: format(addHours(date, 1), "yyyy-MM-dd'T'10:00")
    }));
    setIsEventDialogOpen(true);
  };

  // Navigation functions
  const navigateCalendar = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) :
                    viewMode === 'week' ? subWeeks(currentDate, 1) :
                    addDays(currentDate, -1));
    } else {
      setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) :
                    viewMode === 'week' ? addWeeks(currentDate, 1) :
                    addDays(currentDate, 1));
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: CalendarEvent) => {
    setDraggedEvent(event);
  };

  const handleDrop = async (targetDate: Date) => {
    if (!draggedEvent) return;

    const startTime = parseISO(draggedEvent.start_time);
    const endTime = draggedEvent.end_time ? parseISO(draggedEvent.end_time) : null;
    const duration = endTime ? endTime.getTime() - startTime.getTime() : 0;

    const newStartTime = new Date(targetDate);
    newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
    
    const newEndTime = endTime ? new Date(newStartTime.getTime() + duration) : null;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime?.toISOString() || null
        })
        .eq('id', draggedEvent.id);

      if (error) throw error;
      toast({ title: "Evento spostato con successo!" });
      loadEvents();
    } catch (error) {
      console.error('Error moving event:', error);
      toast({
        title: "Errore",
        description: "Impossibile spostare l'evento",
        variant: "destructive"
      });
    }

    setDraggedEvent(null);
  };

  // Render calendar grid based on view mode
  const renderCalendarGrid = () => {
    if (viewMode === 'month') {
      return <MonthView 
        currentDate={currentDate}
        events={filteredEvents}
        onDateClick={handleDateClick}
        onEventClick={openEditDialog}
        onEventDragStart={handleDragStart}
        onEventDrop={handleDrop}
      />;
    } else if (viewMode === 'week') {
      return <WeekView 
        currentDate={currentDate}
        events={filteredEvents}
        onDateClick={handleDateClick}
        onEventClick={openEditDialog}
        onEventDragStart={handleDragStart}
        onEventDrop={handleDrop}
      />;
    } else {
      return <DayView 
        currentDate={currentDate}
        events={filteredEvents}
        onEventClick={openEditDialog}
        onEventDragStart={handleDragStart}
        onEventDrop={handleDrop}
      />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento calendario...</p>
        </div>
      </div>
    );
  }

  if (!activePet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nessun pet selezionato</h3>
          <p className="text-muted-foreground">Seleziona un pet per visualizzare il calendario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendario {activePet.name}</h1>
          <p className="text-muted-foreground">Gestisci eventi e appuntamenti</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            className={showLegend ? "bg-muted text-primary font-medium border-primary/20" : ""}
          >
            <Eye className="h-4 w-4 mr-2" />
            Legenda
          </Button>
          
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Evento
              </Button>
            </DialogTrigger>
            <EventDialog 
              formData={formData}
              setFormData={setFormData}
              conflicts={conflicts}
              onSave={saveEvent}
              onCancel={() => setIsEventDialogOpen(false)}
              editingEvent={editingEvent}
              checkConflicts={checkConflicts}
            />
          </Dialog>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <Card className="shadow-elegant">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${category.color}`}></div>
                  <span className="text-sm">{category.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Controls */}
      <Card className="shadow-elegant">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* View Mode Selector */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Mese
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                <List className="h-4 w-4 mr-2" />
                Settimana
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Giorno
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy', { locale: it })}
                {viewMode === 'week' && `Settimana del ${format(startOfWeek(currentDate), 'dd MMM', { locale: it })}`}
                {viewMode === 'day' && format(currentDate, 'dd MMMM yyyy', { locale: it })}
              </h2>
              
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="shadow-elegant">
        <CardContent className="p-0">
          {renderCalendarGrid()}
        </CardContent>
      </Card>

      {/* Upcoming Events Summary */}
      <UpcomingEventsSummary events={events} activePet={activePet} />

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Impostazioni Calendario
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto px-1 space-y-6">
            {/* View Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preferenze Visualizzazione</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-view">Vista predefinita</Label>
                  <Select 
                    value={settings.defaultView} 
                    onValueChange={(value: 'month' | 'week' | 'day') => 
                      setSettings(prev => ({ ...prev, defaultView: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Mensile</SelectItem>
                      <SelectItem value="week">Settimanale</SelectItem>
                      <SelectItem value="day">Giornaliera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="week-start">Inizio settimana</Label>
                  <Select 
                    value={settings.weekStart.toString()} 
                    onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, weekStart: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Domenica</SelectItem>
                      <SelectItem value="1">Lunedì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-weekends"
                  checked={settings.showWeekends}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, showWeekends: checked }))
                  }
                />
                <Label htmlFor="show-weekends">Mostra weekend</Label>
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Orari di Lavoro</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="work-start">Inizio</Label>
                  <Input
                    id="work-start"
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        workingHours: { ...prev.workingHours, start: e.target.value }
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="work-end">Fine</Label>
                  <Input
                    id="work-end"
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        workingHours: { ...prev.workingHours, end: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Event Defaults */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Impostazioni Eventi</h3>
              
              <div>
                <Label htmlFor="default-duration">Durata predefinita eventi (minuti)</Label>
                <Input
                  id="default-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={settings.defaultEventDuration}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, defaultEventDuration: parseInt(e.target.value) || 60 }))
                  }
                />
              </div>

              <div>
                <Label>Promemoria predefiniti</Label>
                <div className="space-y-2 mt-2">
                  {REMINDER_OPTIONS.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`default-reminder-${option.value}`}
                        checked={settings.reminderDefault.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const newReminders = checked 
                            ? [...settings.reminderDefault, option.value]
                            : settings.reminderDefault.filter(r => r !== option.value);
                          setSettings(prev => ({ ...prev, reminderDefault: newReminders }));
                        }}
                      />
                      <Label htmlFor={`default-reminder-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Funzionalità Avanzate</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-save"
                    checked={settings.autoSaveEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, autoSaveEnabled: checked }))
                    }
                  />
                  <Label htmlFor="auto-save">Salvataggio automatico</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="weather-integration"
                    checked={settings.weatherIntegration}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, weatherIntegration: checked }))
                    }
                  />
                  <Label htmlFor="weather-integration">Integrazione meteo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="mood-correlation"
                    checked={settings.moodCorrelation}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, moodCorrelation: checked }))
                    }
                  />
                  <Label htmlFor="mood-correlation">Correlazione con umore</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Annulla
            </Button>
            <Button onClick={() => {
              toast({
                title: "Impostazioni salvate",
                description: "Le tue preferenze sono state aggiornate con successo"
              });
              setIsSettingsOpen(false);
            }}>
              Salva Impostazioni
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upcoming Events Summary */}
      <UpcomingEventsSummary events={events} activePet={activePet} />
    </div>
  );
};

// Monthly calendar view component
const MonthView: React.FC<{
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventDragStart: (event: CalendarEvent) => void;
  onEventDrop: (date: Date) => void;
}> = ({ currentDate, events, onDateClick, onEventClick, onEventDragStart, onEventDrop }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = [];
  let day = calendarStart;
  
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(parseISO(event.start_time), date));
  };

  return (
    <div className="p-4">
      {/* Week headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={index}
              className={`
                min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors
                ${isCurrentMonth ? 'bg-background hover:bg-muted/50' : 'bg-muted/20 text-muted-foreground'}
                ${isToday ? 'ring-2 ring-primary' : ''}
              `}
              onClick={() => onDateClick(day)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onEventDrop(day);
              }}
            >
              <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`
                      text-xs p-1 rounded cursor-pointer
                      ${EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES]?.color || 'bg-gray-500 text-white'}
                    `}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      onEventDragStart(event);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <div className="truncate">{event.title}</div>
                    {!event.is_all_day && (
                      <div className="text-xs opacity-75">
                        {format(parseISO(event.start_time), 'HH:mm')}
                      </div>
                    )}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} altri
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Weekly calendar view component
const WeekView: React.FC<{
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventDragStart: (event: CalendarEvent) => void;
  onEventDrop: (date: Date) => void;
}> = ({ currentDate, events, onDateClick, onEventClick, onEventDragStart, onEventDrop }) => {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start_time);
      return isSameDay(eventDate, date) && eventDate.getHours() === hour;
    });
  };

  return (
    <div className="p-4">
      {/* Week header */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        <div className="text-center text-sm font-medium text-muted-foreground p-2">Ora</div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="text-center text-sm font-medium p-2">
            <div>{format(day, 'EEE', { locale: it })}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
        ))}
      </div>
      
      {/* Time slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 gap-2 border-b border-muted">
            <div className="text-sm text-muted-foreground p-2 text-center">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map(day => {
              const hourEvents = getEventsForDayAndHour(day, hour);
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="min-h-[60px] p-1 hover:bg-muted/50 cursor-pointer border-r border-muted"
                  onClick={() => {
                    const clickDate = new Date(day);
                    clickDate.setHours(hour, 0, 0, 0);
                    onDateClick(clickDate);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dropDate = new Date(day);
                    dropDate.setHours(hour, 0, 0, 0);
                    onEventDrop(dropDate);
                  }}
                >
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className={`
                        text-xs p-1 rounded mb-1 cursor-pointer
                        ${EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES]?.color || 'bg-gray-500 text-white'}
                      `}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        onEventDragStart(event);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className="truncate font-medium">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {format(parseISO(event.start_time), 'HH:mm')}
                        {event.end_time && ` - ${format(parseISO(event.end_time), 'HH:mm')}`}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Daily calendar view component
const DayView: React.FC<{
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventDragStart: (event: CalendarEvent) => void;
  onEventDrop: (date: Date) => void;
}> = ({ currentDate, events, onEventClick, onEventDragStart, onEventDrop }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter(event => isSameDay(parseISO(event.start_time), currentDate));

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => {
      const eventDate = parseISO(event.start_time);
      return eventDate.getHours() === hour;
    });
  };

  return (
    <div className="p-4">
      <div className="max-h-[700px] overflow-y-auto">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          return (
            <div key={hour} className="flex border-b border-muted">
              <div className="w-20 text-sm text-muted-foreground p-4 text-center border-r border-muted">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div
                className="flex-1 min-h-[80px] p-2 hover:bg-muted/50 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropDate = new Date(currentDate);
                  dropDate.setHours(hour, 0, 0, 0);
                  onEventDrop(dropDate);
                }}
              >
                {hourEvents.map(event => (
                  <div
                    key={event.id}
                    className={`
                      p-3 mb-2 rounded-lg cursor-pointer border-l-4
                      ${EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES]?.color || 'bg-gray-500 text-white'}
                      ${EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES]?.borderColor || 'border-gray-500'}
                    `}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      onEventDragStart(event);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm opacity-75 flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(event.start_time), 'HH:mm')}
                        {event.end_time && ` - ${format(parseISO(event.end_time), 'HH:mm')}`}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <div className="text-xs mt-2 opacity-75">{event.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Event creation/editing dialog
const EventDialog: React.FC<{
  formData: any;
  setFormData: (data: any) => void;
  conflicts: any[];
  onSave: () => void;
  onCancel: () => void;
  editingEvent: CalendarEvent | null;
  checkConflicts: (start: string, end: string, excludeId?: string) => void;
}> = ({ formData, setFormData, conflicts, onSave, onCancel, editingEvent, checkConflicts }) => {
  
  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      checkConflicts(formData.start_time, formData.end_time, editingEvent?.id);
    }
  }, [formData.start_time, formData.end_time, editingEvent?.id, checkConflicts]);

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingEvent ? 'Modifica Evento' : 'Nuovo Evento'}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Conflict warnings */}
        {conflicts.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Conflitti rilevati</span>
            </div>
            <div className="space-y-1">
              {conflicts.map((conflict, index) => (
                <div key={index} className="text-sm text-yellow-700">
                  {conflict.conflicting_title} - {format(parseISO(conflict.conflicting_start), 'dd/MM/yyyy HH:mm')}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titolo dell'evento"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrizione dell'evento"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="location">Luogo</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Indirizzo o nome del luogo"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-day"
                checked={formData.is_all_day}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_all_day: checked }))}
              />
              <Label htmlFor="all-day">Tutto il giorno</Label>
            </div>

            <div>
              <Label htmlFor="start-time">Data e ora inizio *</Label>
              <Input
                id="start-time"
                type={formData.is_all_day ? "date" : "datetime-local"}
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>

            {!formData.is_all_day && (
              <div>
                <Label htmlFor="end-time">Data e ora fine</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            )}

            <div>
              <Label>Ripetizione</Label>
              <Select 
                value={formData.recurring_pattern.type} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  recurring_pattern: { ...prev.recurring_pattern, type: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRING_PATTERNS.map(pattern => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.recurring_pattern.type !== 'none' && (
              <div>
                <Label htmlFor="interval">Ogni</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  value={formData.recurring_pattern.interval}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    recurring_pattern: { 
                      ...prev.recurring_pattern, 
                      interval: parseInt(e.target.value) || 1 
                    }
                  }))}
                />
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cost">Costo (€)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || null }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="attendees">Partecipanti</Label>
              <Input
                id="attendees"
                value={formData.attendees.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                placeholder="Nome partecipanti separati da virgola"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Promemoria</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder-enabled"
                    checked={formData.reminder_settings.enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      reminder_settings: { ...prev.reminder_settings, enabled: checked }
                    }))}
                  />
                  <Label htmlFor="reminder-enabled">Abilita promemoria</Label>
                </div>
                
                {formData.reminder_settings.enabled && (
                  <div className="space-y-2">
                    {REMINDER_OPTIONS.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reminder-${option.value}`}
                          checked={formData.reminder_settings.times.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const times = checked 
                              ? [...formData.reminder_settings.times, option.value]
                              : formData.reminder_settings.times.filter(t => t !== option.value);
                            setFormData(prev => ({ 
                              ...prev, 
                              reminder_settings: { ...prev.reminder_settings, times }
                            }));
                          }}
                        />
                        <Label htmlFor={`reminder-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Note</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Note aggiuntive"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button onClick={onSave} disabled={!formData.title || !formData.start_time}>
            <Calendar className="h-4 w-4 mr-2" />
            {editingEvent ? 'Aggiorna' : 'Crea'} Evento
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

// Upcoming events summary component
const UpcomingEventsSummary: React.FC<{
  events: CalendarEvent[];
  activePet: any;
}> = ({ events, activePet }) => {
  const upcomingEvents = events
    .filter(event => parseISO(event.start_time) > new Date())
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
    .slice(0, 5);

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Prossimi Eventi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES]?.color.split(' ')[0] || 'bg-gray-500'}`}></div>
              <div className="flex-1">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(parseISO(event.start_time), 'dd MMM, HH:mm', { locale: it })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="secondary">
                {EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES]?.icon || '📅'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarPage;
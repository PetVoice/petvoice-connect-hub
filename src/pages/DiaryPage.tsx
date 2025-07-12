import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Search, Filter, Download, Mic, MicOff, Camera, Tag, Save, Trash2, Edit3, Heart, Brain, Activity, Moon, Sun, Cloud, Zap, MessageSquare, Upload, X, Eye, BookOpen, Play, ZoomIn, ExternalLink, Settings, Grid3X3, List, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePets } from '@/contexts/PetContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

// Types
interface DiaryEntry {
  id: string;
  title: string | null;
  content: string | null;
  entry_date: string;
  mood_score: number | null;
  behavioral_tags: string[] | null;
  photo_urls: string[] | null;
  voice_note_url: string | null;
  weather_condition: string | null;
  temperature: number | null;
  pet_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Predefined tags with categories
const PREDEFINED_TAGS = {
  emotional: ['felice', 'triste', 'ansioso', 'calmo', 'energico', 'depresso', 'stressato', 'rilassato'],
  behavioral: ['gioco', 'appetito', 'sonno', 'aggressivo', 'affettuoso', 'curioso', 'timido', 'sociale'],
  health: ['malato', 'sano', 'dolorante', 'vivace', 'stanco', 'alert'],
  environmental: ['temporale', 'caldo', 'freddo', 'rumoroso', 'silenzioso', 'casa', 'parco', 'visita-vet'],
  training: ['training', 'obbedienza', 'trucchi', 'ricompensa', 'punizione', 'progresso']
};

const TAG_COLORS = {
  emotional: 'bg-pink-500',
  behavioral: 'bg-blue-500', 
  health: 'bg-green-500',
  environmental: 'bg-yellow-500',
  training: 'bg-purple-500'
};

const MOOD_LABELS = {
  1: 'Terribile',
  2: 'Molto Male', 
  3: 'Male',
  4: 'Sotto la Media',
  5: 'Neutrale',
  6: 'Bene',
  7: 'Molto Bene',
  8: 'Ottimo',
  9: 'Fantastico',
  10: 'Perfetto'
};

// Diary Categories with colors - Like Calendar
const DIARY_CATEGORIES = {
  happy: {
    label: '😊 Felice',
    color: 'bg-green-500 text-white',
    moodRange: [8, 10]
  },
  calm: {
    label: '😌 Calmo',
    color: 'bg-blue-500 text-white',
    moodRange: [6, 7]
  },
  neutral: {
    label: '😐 Neutrale',
    color: 'bg-gray-500 text-white',
    moodRange: [5, 5]
  },
  sad: {
    label: '😔 Triste',
    color: 'bg-yellow-500 text-black',
    moodRange: [3, 4]
  },
  stressed: {
    label: '😰 Stressato',
    color: 'bg-red-500 text-white',
    moodRange: [1, 2]
  }
};

const DiaryPage: React.FC = () => {
  const { pets, selectedPet } = usePets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  const [dayEntriesModal, setDayEntriesModal] = useState<{ open: boolean; date: Date; entries: DiaryEntry[] }>({ open: false, date: new Date(), entries: [] });
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [dateToDeleteAll, setDateToDeleteAll] = useState<Date | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Settings state - Like Calendar
  const [settings, setSettings] = useState({
    defaultView: 'month' as 'month' | 'week' | 'day',
    weekStart: 1, // Monday - like Calendar
    autoSaveEnabled: true,
    showMoodInCalendar: true,
    reminderEnabled: true,
    privacyMode: false
  });

  // Sync viewMode with settings.defaultView when viewMode changes
  useEffect(() => {
    setSettings(prev => ({ ...prev, defaultView: viewMode }));
  }, [viewMode]);

  // Navigation for different view modes
  const navigateDiary = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -1) : addDays(currentDate, 1));
    }
  };
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood_score: 5,
    behavioral_tags: [] as string[],
    photo_urls: [] as string[],
    voice_note_url: null as string | null,
    weather_condition: '',
    temperature: null as number | null,
    entry_date: format(new Date(), 'yyyy-MM-dd')
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      toast({
        title: "Errore",
        description: "Impossibile caricare le voci del diario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPet]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!selectedPet || !formData.title && !formData.content) return;

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('diary_entries')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntry.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [formData, editingEntry, selectedPet]);

  // Filter entries based on view mode and filters
  useEffect(() => {
    let filtered = entries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.behavioral_tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter based on mood
    if (filterCategory !== 'all') {
      filtered = filtered.filter(entry => {
        if (!entry.mood_score) return false;
        const category = Object.entries(DIARY_CATEGORIES).find(([key, cat]) => 
          entry.mood_score! >= cat.moodRange[0] && entry.mood_score! <= cat.moodRange[1]
        );
        return category && category[0] === filterCategory;
      });
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        entry.behavioral_tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // Filter by date range based on view mode
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
  }, [entries, searchTerm, selectedTags, filterCategory, currentDate, viewMode]);

  // Auto-save trigger per salvare effettivamente nel database
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, autoSave]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Get calendar days - identical to Calendar to show previous/next month days
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

  const getEntriesForDate = (date: Date) => {
    return entries.filter(entry => 
      isSameDay(parseISO(entry.entry_date), date)
    );
  };

  const getEntryForDate = (date: Date) => {
    return entries.find(entry => 
      isSameDay(parseISO(entry.entry_date), date)
    );
  };

  const getMoodColor = (moodScore: number | null) => {
    if (!moodScore) return 'bg-gray-300';
    if (moodScore <= 3) return 'bg-red-500';
    if (moodScore <= 5) return 'bg-yellow-500';
    if (moodScore <= 7) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const saveEntry = async () => {
    if (!selectedPet) return;

    try {
      const entryData = {
        ...formData,
        pet_id: selectedPet.id,
        user_id: selectedPet.user_id
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('diary_entries')
          .update(entryData)
          .eq('id', editingEntry.id);

        if (error) throw error;
        
        // Aggiorna anche viewingEntry se è aperto
        if (viewingEntry && viewingEntry.id === editingEntry.id) {
          setViewingEntry({
            ...viewingEntry,
            ...entryData,
            updated_at: new Date().toISOString()
          });
        }
        
        toast({ title: "Nota aggiornata con successo!" });
      } else {
        const { error } = await supabase
          .from('diary_entries')
          .insert(entryData);

        if (error) throw error;
        toast({ title: "Nuova voce salvata!" });
      }

      setIsDialogOpen(false);
      resetForm();
      loadEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la voce",
        variant: "destructive"
      });
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      
      toast({ title: "Voce eliminata" });
      
      // Aggiorna lo stato locale della modal del giorno se è aperta
      if (dayEntriesModal.open) {
        setDayEntriesModal(prev => ({
          ...prev,
          entries: prev.entries.filter(entry => entry.id !== entryId)
        }));
      }
      
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la voce",
        variant: "destructive"
      });
    }
  };

  const deleteAllDayEntries = async (date: Date) => {
    try {
      const dayEntries = entries.filter(entry => isSameDay(parseISO(entry.entry_date), date));
      const entryIds = dayEntries.map(entry => entry.id);
      
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .in('id', entryIds);

      if (error) throw error;
      
      toast({ title: `${dayEntries.length} voci eliminate` });
      
      // Aggiorna la modal locale per mostrare l'elenco vuoto
      setDayEntriesModal(prev => ({ ...prev, entries: [] }));
      
      loadEntries();
    } catch (error) {
      console.error('Error deleting all entries:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare le voci",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };

  const handleDeleteAllClick = (date: Date) => {
    setDateToDeleteAll(date);
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    if (dateToDeleteAll) {
      deleteAllDayEntries(dateToDeleteAll);
      setDateToDeleteAll(null);
    }
    setShowDeleteAllConfirm(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood_score: 5,
      behavioral_tags: [],
      photo_urls: [],
      voice_note_url: null,
      weather_condition: '',
      temperature: null,
      entry_date: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingEntry(null);
  };

  const openEditDialog = (entry: DiaryEntry) => {
    setFormData({
      title: entry.title || '',
      content: entry.content || '',
      mood_score: entry.mood_score || 5,
      behavioral_tags: entry.behavioral_tags || [],
      photo_urls: entry.photo_urls || [],
      voice_note_url: entry.voice_note_url,
      weather_condition: entry.weather_condition || '',
      temperature: entry.temperature,
      entry_date: entry.entry_date
    });
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const addTag = (tag: string) => {
    if (!formData.behavioral_tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        behavioral_tags: [...prev.behavioral_tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      behavioral_tags: prev.behavioral_tags.filter(t => t !== tag)
    }));
  };

  const addCustomTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !customTags.includes(normalizedTag)) {
      setCustomTags(prev => [...prev, normalizedTag]);
      addTag(normalizedTag);
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const dayEntries = getEntriesForDate(day);
    
    // Mostra sempre la modal del giorno, anche se vuota
    setDayEntriesModal({ open: true, date: day, entries: dayEntries });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedPet) return;

    try {
      const uploadedUrls = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedPet.user_id}/${selectedPet.id}/${Date.now()}-${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('pet-media')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('pet-media')
          .getPublicUrl(fileName);
          
        uploadedUrls.push(publicUrl);
      }
      
      setFormData(prev => ({
        ...prev,
        photo_urls: [...prev.photo_urls, ...uploadedUrls]
      }));
      
      toast({ title: "Foto caricate con successo!" });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le foto",
        variant: "destructive"
      });
    }
  };

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        setMediaRecorder(recorder);
        setAudioChunks([]);
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks(prev => [...prev, event.data]);
          }
        };
        
        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // Upload to Supabase storage
          if (selectedPet) {
            const fileName = `${selectedPet.user_id}/${selectedPet.id}/voice-${Date.now()}.webm`;
            
            try {
              const { error: uploadError } = await supabase.storage
                .from('pet-media')
                .upload(fileName, audioBlob);
                
              if (uploadError) throw uploadError;
              
              const { data: { publicUrl } } = supabase.storage
                .from('pet-media')
                .getPublicUrl(fileName);
              
              setFormData(prev => ({
                ...prev,
                voice_note_url: publicUrl
              }));
              
              toast({ title: "Registrazione salvata!" });
            } catch (error) {
              console.error('Error uploading voice note:', error);
              toast({
                title: "Errore",
                description: "Impossibile salvare la registrazione",
                variant: "destructive"
              });
            }
          }
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };
        
        recorder.start();
        setIsRecording(true);
        toast({ title: "Registrazione avviata" });
        
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({
          title: "Errore",
          description: "Impossibile accedere al microfono",
          variant: "destructive"
        });
      }
    } else {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
        toast({ title: "Registrazione completata" });
      }
    }
  };

  const playVoiceNote = async (voiceNoteUrl: string) => {
    try {
      console.log('Playing voice note:', voiceNoteUrl);
      
      // Create and play audio element directly with the URL
      const audio = new Audio(voiceNoteUrl);
      
      // Add error handling for audio loading
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e, 'URL:', voiceNoteUrl);
        toast({
          title: "Errore",
          description: `File audio non trovato: ${voiceNoteUrl}`,
          variant: "destructive"
        });
      });
      
      audio.addEventListener('loadstart', () => {
        console.log('Audio loading started');
      });
      
      audio.addEventListener('canplay', () => {
        console.log('Audio can play');
        audio.play().then(() => {
          toast({
            title: "Riproduzione avviata",
            description: "Riproduzione della nota vocale in corso"
          });
        }).catch((error) => {
          console.error('Error playing audio:', error);
          toast({
            title: "Errore",
            description: "Impossibile riprodurre la nota vocale",
            variant: "destructive"
          });
        });
      });
      
      // Load the audio
      audio.load();
      
    } catch (error) {
      console.error('Error playing voice note:', error);
      toast({
        title: "Errore",
        description: "Impossibile riprodurre la nota vocale",
        variant: "destructive"
      });
    }
  };

  if (!selectedPet) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Seleziona un Pet</h2>
        <p className="text-muted-foreground">Scegli un pet per iniziare a tenere il diario</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - Identical to Calendar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Diario {selectedPet.name}</h1>
          <p className="text-muted-foreground">Tieni traccia del comportamento e dell'umore quotidiano</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Legenda
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nuova Voce
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] shadow-elegant">
              <div className="max-h-[80vh] overflow-y-auto px-1">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? 'Modifica Voce' : 'Nuova Voce del Diario'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Date and Mood */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entry_date">Data</Label>
                      <Input
                        id="entry_date"
                        type="date"
                        value={formData.entry_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label>Umore (1-10): {formData.mood_score} - {MOOD_LABELS[formData.mood_score as keyof typeof MOOD_LABELS]}</Label>
                      <Slider
                        value={[formData.mood_score]}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, mood_score: value[0] }))}
                        max={10}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Terribile</span>
                        <span>Perfetto</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Titolo</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titolo della voce..."
                    />
                  </div>
                  
                  {/* Content */}
                  <div>
                    <Label htmlFor="content">Contenuto</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Descrivi il comportamento, l'umore e le attività di oggi..."
                      rows={6}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Auto-save attivo • Ultima modifica salvata automaticamente
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <Label>Tag Comportamentali</Label>
                    <div className="space-y-4 mt-2">
                      {/* Selected tags */}
                      {formData.behavioral_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.behavioral_tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Predefined tags */}
                      {Object.entries(PREDEFINED_TAGS).map(([category, tags]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium mb-2 capitalize">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                             {tags.map(tag => (
                               <Button
                                 key={tag}
                                 variant={formData.behavioral_tags.includes(tag) ? "default" : "outline"}
                                 size="sm"
                                 onClick={() => {
                                   if (formData.behavioral_tags.includes(tag)) {
                                     removeTag(tag);
                                   } else {
                                     addTag(tag);
                                   }
                                 }}
                                 className="text-xs"
                               >
                                 {tag}
                               </Button>
                             ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* Custom tag input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Aggiungi tag personalizzato..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addCustomTag(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="personalizzato"]') as HTMLInputElement;
                            if (input) {
                              addCustomTag(input.value);
                              input.value = '';
                            }
                          }}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Weather and Temperature */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weather">Condizioni Meteo</Label>
                      <Select value={formData.weather_condition} onValueChange={(value) => setFormData(prev => ({ ...prev, weather_condition: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona meteo" />
                        </SelectTrigger>
                        <SelectContent className="shadow-elegant">
                          <SelectItem value="soleggiato">☀️ Soleggiato</SelectItem>
                          <SelectItem value="nuvoloso">☁️ Nuvoloso</SelectItem>
                          <SelectItem value="piovoso">🌧️ Piovoso</SelectItem>
                          <SelectItem value="temporale">⛈️ Temporale</SelectItem>
                          <SelectItem value="neve">❄️ Neve</SelectItem>
                          <SelectItem value="vento">💨 Ventoso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="temperature">Temperatura (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        value={formData.temperature || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value ? Number(e.target.value) : null }))}
                        placeholder="es. 22"
                      />
                    </div>
                  </div>
                  
                   {/* Media Upload */}
                  <div className="space-y-4">
                    <Label>Media</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()}>
                        <Camera className="h-4 w-4 mr-2" />
                        Aggiungi Foto
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleVoiceRecording}
                        className={isRecording ? 'bg-red-500 text-white' : ''}
                      >
                        {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                        {isRecording ? 'Stop Recording' : 'Nota Vocale'}
                      </Button>
                    </div>
                    
                    {/* Display uploaded photos */}
                    {formData.photo_urls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.photo_urls.map((url, index) => (
                          <div key={index} className="relative group cursor-pointer">
                            <img
                              src={url}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-24 object-cover rounded hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedPhoto(url)}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData(prev => ({
                                  ...prev,
                                  photo_urls: prev.photo_urls.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPhoto(url);
                                }}
                              >
                                <ZoomIn className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Display voice note */}
                    {formData.voice_note_url && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Mic className="h-4 w-4" />
                        <span className="text-sm">Nota vocale registrata</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, voice_note_url: null }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annulla
                    </Button>
                    <Button onClick={saveEntry} className="gradient-cosmic text-white">
                      <Save className="h-4 w-4 mr-2" />
                      {editingEntry ? 'Aggiorna Nota' : 'Crea Nota'}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Legend - Identical to Calendar */}
      {showLegend && (
        <Card className="shadow-elegant">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {Object.entries(DIARY_CATEGORIES).map(([key, category]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${category.color}`}></div>
                  <span className="text-sm">{category.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diary Controls - Identical to Calendar Controls */}
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

            {/* Navigation - Like Calendar */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateDiary('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy', { locale: it })}
                {viewMode === 'week' && `Settimana del ${format(startOfWeek(currentDate), 'dd MMM', { locale: it })}`}
                {viewMode === 'day' && format(currentDate, 'dd MMMM yyyy', { locale: it })}
              </h2>
              
              <Button variant="outline" size="sm" onClick={() => navigateDiary('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters - Like Calendar */}
            <div className="flex items-center gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {Object.entries(DIARY_CATEGORIES).map(([key, category]) => (
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

      {/* Calendar View */}
      {viewMode === 'month' && (
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {format(currentDate, 'MMMM yyyy', { locale: it })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {days.map(day => {
                const entry = getEntryForDate(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      relative aspect-square p-2 border rounded-lg cursor-pointer transition-colors
                      ${isCurrentMonth ? 'bg-background hover:bg-muted/50' : 'bg-muted/20 text-muted-foreground'}
                      ${isToday ? 'ring-2 ring-primary' : ''}
                    `}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="text-sm">{format(day, 'd')}</div>
                    {(() => {
                      const dayEntries = getEntriesForDate(day);
                      if (dayEntries.length === 0) return null;
                      
                      return (
                        <div className="absolute inset-2 flex flex-col justify-center">
                          {dayEntries.length > 1 && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center z-10">
                              {dayEntries.length}
                            </div>
                          )}
                          <div className="space-y-1">
                            {dayEntries.slice(0, 2).map((entry, index) => (
                              <div 
                                key={entry.id} 
                                className={`
                                  text-xs p-1 rounded cursor-pointer
                                  ${getMoodColor(entry.mood_score)} text-white
                                `}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(entry);
                                }}
                              >
                                <div className="truncate font-medium">
                                  {entry.title || 'Senza titolo'}
                                </div>
                              </div>
                            ))}
                            {dayEntries.length > 2 && (
                              <div className="text-xs text-muted-foreground bg-secondary/80 p-1 rounded">
                                +{dayEntries.length - 2} altre
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View - Calendar Style */}
      {viewMode === 'week' && (
        <Card className="shadow-elegant">
          <CardContent className="p-0">
            <DiaryWeekView 
              currentDate={currentDate}
              entries={filteredEntries}
              onDateClick={handleDayClick}
              onEntryClick={openEditDialog}
            />
          </CardContent>
        </Card>
      )}

      {/* Day View - Calendar Style */}
      {viewMode === 'day' && (
        <Card className="shadow-elegant">
          <CardContent className="p-0">
            <DiaryDayView 
              currentDate={currentDate}
              entries={filteredEntries}
              onEntryClick={openEditDialog}
            />
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Elimina Voce del Diario"
        description="Sei sicuro di voler eliminare questa voce? Questa azione non può essere annullata."
        confirmText="Elimina"
        cancelText="Annulla"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      {/* Photo Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] shadow-elegant">
            <DialogHeader>
              <DialogTitle>Anteprima Foto</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={selectedPhoto}
                alt="Foto ingrandita"
                className="max-w-full max-h-[70vh] object-contain rounded"
                onError={(e) => {
                  console.error('Image failed to load:', selectedPhoto);
                  toast({
                    title: "Errore",
                    description: "Impossibile caricare l'immagine",
                    variant: "destructive"
                  });
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Entry Detail Modal */}
      {viewingEntry && (
        <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] shadow-elegant">
            <div className="max-h-[80vh] overflow-y-auto px-1">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl">
                      {viewingEntry.title || 'Senza titolo'}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(viewingEntry.entry_date), 'dd MMMM yyyy', { locale: it })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewingEntry(null);
                        openEditDialog(viewingEntry);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingEntry(null)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Chiudi
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                {/* Mood Score */}
                {viewingEntry.mood_score && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${getMoodColor(viewingEntry.mood_score)}`} />
                      <span className="font-medium">Umore: {viewingEntry.mood_score}/10</span>
                      <span className="text-sm text-muted-foreground">
                        ({MOOD_LABELS[viewingEntry.mood_score as keyof typeof MOOD_LABELS]})
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                {viewingEntry.content && (
                  <div>
                    <h4 className="font-medium mb-2">Contenuto</h4>
                    <p className="text-foreground whitespace-pre-wrap">{viewingEntry.content}</p>
                  </div>
                )}

                {/* Tags */}
                {viewingEntry.behavioral_tags && viewingEntry.behavioral_tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tag Comportamentali</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingEntry.behavioral_tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weather & Temperature */}
                {(viewingEntry.weather_condition || viewingEntry.temperature) && (
                  <div>
                    <h4 className="font-medium mb-2">Condizioni</h4>
                    <div className="flex gap-4 text-sm">
                      {viewingEntry.weather_condition && (
                        <span>🌤️ {viewingEntry.weather_condition}</span>
                      )}
                      {viewingEntry.temperature && (
                        <span>🌡️ {viewingEntry.temperature}°C</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {viewingEntry.photo_urls && viewingEntry.photo_urls.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Foto ({viewingEntry.photo_urls.length})</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {viewingEntry.photo_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedPhoto(url)}
                          onError={(e) => {
                            console.error('Image failed to load:', url);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Note */}
                {viewingEntry.voice_note_url && (
                  <div>
                    <h4 className="font-medium mb-2">Nota Vocale</h4>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded">
                      <Mic className="h-4 w-4" />
                      <span className="text-sm">Nota vocale registrata</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playVoiceNote(viewingEntry.voice_note_url!)}
                      >
                        <Play className="h-3 w-3 mr-2" />
                        Riproduci
                      </Button>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-muted-foreground pt-4 border-t">
                  <p>Creato: {format(parseISO(viewingEntry.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  <p>Modificato: {format(parseISO(viewingEntry.updated_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Day Entries Modal */}
      {dayEntriesModal.open && (
        <Dialog open={dayEntriesModal.open} onOpenChange={(open) => setDayEntriesModal({ ...dayEntriesModal, open })}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Voci del {format(dayEntriesModal.date, 'dd MMMM yyyy', { locale: it })}
              </DialogTitle>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {dayEntriesModal.entries.length} {dayEntriesModal.entries.length === 1 ? 'voce trovata' : 'voci trovate'}
                </span>
                <div className="flex gap-2">
                  {dayEntriesModal.entries.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAllClick(dayEntriesModal.date)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina Tutte
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, entry_date: format(dayEntriesModal.date, 'yyyy-MM-dd') }));
                      resetForm();
                      setDayEntriesModal({ ...dayEntriesModal, open: false });
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova Voce
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              {dayEntriesModal.entries.map((entry) => (
                <Card 
                  key={entry.id} 
                  className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setDayEntriesModal({ ...dayEntriesModal, open: false });
                    openEditDialog(entry);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{entry.title || 'Senza titolo'}</h3>
                        <p className="text-sm text-muted-foreground">
                          Creato alle {format(parseISO(entry.created_at), 'HH:mm')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {entry.mood_score && (
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${getMoodColor(entry.mood_score)}`} />
                            <span className="text-sm">{entry.mood_score}/10</span>
                          </div>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDayEntriesModal({ ...dayEntriesModal, open: false });
                            openEditDialog(entry);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(entry.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {entry.content && (
                      <p className="text-sm text-foreground mb-3 line-clamp-2">{entry.content}</p>
                    )}
                    
                    {entry.behavioral_tags && entry.behavioral_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entry.behavioral_tags.slice(0, 4).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                        {entry.behavioral_tags.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{entry.behavioral_tags.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {entry.weather_condition && (
                        <span>🌤️ {entry.weather_condition}</span>
                      )}
                      {entry.temperature && (
                        <span>🌡️ {entry.temperature}°C</span>
                      )}
                      {entry.photo_urls && entry.photo_urls.length > 0 && (
                        <span>📸 {entry.photo_urls.length}</span>
                      )}
                      {entry.voice_note_url && (
                        <span>🎤</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {dayEntriesModal.entries.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nessuna voce per questo giorno</h3>
                  <p className="text-muted-foreground mb-4">
                    Inizia creando la prima voce per il {format(dayEntriesModal.date, 'dd MMMM yyyy', { locale: it })}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, entry_date: format(dayEntriesModal.date, 'yyyy-MM-dd') }));
                      resetForm();
                      setDayEntriesModal({ ...dayEntriesModal, open: false });
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Nuova Voce
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione Tutte le Voci</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare tutte le voci del {dateToDeleteAll && format(dateToDeleteAll, 'dd MMMM yyyy', { locale: it })}? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteAllConfirm(false)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina Tutte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Dialog - Identical to Calendar */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Impostazioni Diario
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
                      <SelectItem value="month">Mese</SelectItem>
                      <SelectItem value="week">Settimana</SelectItem>
                      <SelectItem value="day">Giorno</SelectItem>
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

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-mood"
                    checked={settings.showMoodInCalendar}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, showMoodInCalendar: checked }))
                    }
                  />
                  <Label htmlFor="show-mood">Mostra umore nel calendario</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-save"
                    checked={settings.autoSaveEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, autoSaveEnabled: checked }))
                    }
                  />
                  <Label htmlFor="auto-save">Auto-salvataggio attivo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="reminders"
                    checked={settings.reminderEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, reminderEnabled: checked }))
                    }
                  />
                  <Label htmlFor="reminders">Promemoria giornalieri</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="privacy"
                    checked={settings.privacyMode}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, privacyMode: checked }))
                    }
                  />
                  <Label htmlFor="privacy">Modalità privacy</Label>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Impostazioni Avanzate</h3>
              
              <div className="space-y-3">
                {/* Buttons removed as requested */}
              </div>
            </div>
          </div>
          
          {/* Footer with Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Annulla
            </Button>
            <Button onClick={() => {
              // Apply settings immediately
              setViewMode(settings.defaultView);
              
              setIsSettingsOpen(false);
              toast({
                title: "Impostazioni salvate",
                description: "Le tue preferenze sono state aggiornate",
              });
            }}>
              Salva impostazioni
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Weekly diary view component - identical to Calendar WeekView
const DiaryWeekView: React.FC<{
  currentDate: Date;
  entries: DiaryEntry[];
  onDateClick: (date: Date) => void;
  onEntryClick: (entry: DiaryEntry) => void;
}> = ({ currentDate, entries, onDateClick, onEntryClick }) => {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEntriesForDayAndHour = (date: Date, hour: number) => {
    return entries.filter(entry => {
      const entryDate = parseISO(entry.created_at);
      return isSameDay(entryDate, date) && entryDate.getHours() === hour;
    });
  };

  const getMoodColorForEntry = (entry: DiaryEntry) => {
    if (!entry.mood_score) return 'bg-gray-500 text-white';
    
    const category = Object.entries(DIARY_CATEGORIES).find(([key, cat]) => 
      entry.mood_score! >= cat.moodRange[0] && entry.mood_score! <= cat.moodRange[1]
    );
    
    return category ? category[1].color : 'bg-gray-500 text-white';
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
      
      {/* Time slots - identical to Calendar */}
      <div className="max-h-[600px] overflow-y-auto">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 gap-2 border-b border-muted">
            <div className="text-sm text-muted-foreground p-2 text-center">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map(day => {
              const hourEntries = getEntriesForDayAndHour(day, hour);
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="min-h-[60px] p-1 hover:bg-muted/50 cursor-pointer border-r border-muted"
                  onClick={() => {
                    const clickDate = new Date(day);
                    clickDate.setHours(hour, 0, 0, 0);
                    onDateClick(clickDate);
                  }}
                >
                  {hourEntries.map(entry => (
                    <div
                      key={entry.id}
                      className={`
                        text-xs p-1 rounded mb-1 cursor-pointer
                        ${getMoodColorForEntry(entry)}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEntryClick(entry);
                      }}
                    >
                      <div className="truncate font-medium">{entry.title || 'Senza titolo'}</div>
                      <div className="text-xs opacity-75">
                        {format(parseISO(entry.created_at), 'HH:mm')}
                        {entry.mood_score && ` - 😊${entry.mood_score}`}
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

// Daily diary view component - identical to Calendar DayView  
const DiaryDayView: React.FC<{
  currentDate: Date;
  entries: DiaryEntry[];
  onEntryClick: (entry: DiaryEntry) => void;
}> = ({ currentDate, entries, onEntryClick }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEntries = entries.filter(entry => isSameDay(parseISO(entry.created_at), currentDate));

  const getEntriesForHour = (hour: number) => {
    return dayEntries.filter(entry => {
      const entryDate = parseISO(entry.created_at);
      return entryDate.getHours() === hour;
    });
  };

  const getMoodColorForEntry = (entry: DiaryEntry) => {
    if (!entry.mood_score) return 'bg-gray-500 text-white border-gray-500';
    
    const category = Object.entries(DIARY_CATEGORIES).find(([key, cat]) => 
      entry.mood_score! >= cat.moodRange[0] && entry.mood_score! <= cat.moodRange[1]
    );
    
    return category ? category[1].color : 'bg-gray-500 text-white';
  };

  return (
    <div className="p-4">
      <div className="max-h-[700px] overflow-y-auto">
        {hours.map(hour => {
          const hourEntries = getEntriesForHour(hour);
          return (
            <div key={hour} className="flex border-b border-muted">
              <div className="w-20 text-sm text-muted-foreground p-4 text-center border-r border-muted">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 min-h-[80px] p-2 hover:bg-muted/50 cursor-pointer">
                {hourEntries.map(entry => (
                  <div
                    key={entry.id}
                    className={`
                      p-3 mb-2 rounded-lg cursor-pointer border-l-4
                      ${getMoodColorForEntry(entry)}
                    `}
                    onClick={() => onEntryClick(entry)}
                  >
                    <div className="font-medium">{entry.title || 'Senza titolo'}</div>
                    <div className="text-sm opacity-75 flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(entry.created_at), 'HH:mm')}
                      </span>
                      {entry.mood_score && (
                        <span className="flex items-center gap-1">
                          😊 {entry.mood_score}/10
                        </span>
                      )}
                      {entry.weather_condition && (
                        <span>🌤️ {entry.weather_condition}</span>
                      )}
                    </div>
                    {entry.content && (
                      <div className="text-xs mt-2 opacity-75 line-clamp-2">{entry.content}</div>
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

export default DiaryPage;
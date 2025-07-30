import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Mic, MicOff, Save, Upload, X, Tag, Brain, Play, Pause } from 'lucide-react';
import { DiaryEntry, PREDEFINED_TAGS, TAG_COLORS, MOOD_LABELS } from '@/types/diary';
import { format } from 'date-fns';
import { UnifiedDatePicker } from '@/components/ui/unified-date-picker';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedToast } from '@/hooks/use-unified-toast';

interface DiaryEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: DiaryEntry | null;
  onSave: (data: any) => void;
  petId: string;
  userId: string;
  initialDate?: string;
}

export const DiaryEntryForm: React.FC<DiaryEntryFormProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
  petId,
  userId,
  initialDate
}) => {
  console.log('DiaryEntryForm component rendered', { isOpen, petId, userId });
  
  const { toast } = useUnifiedToast();
  const [entryDate, setEntryDate] = useState<Date>();
  console.log('DiaryEntryForm: entryDate state defined', entryDate);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood_score: 5,
    behavioral_tags: [],
    photo_urls: [],
    voice_note_url: null,
    weather_condition: 'nessuna',
    temperature: null,
    entry_date: format(new Date(), 'yyyy-MM-dd')
  });

  // Reset form data when entry, initialDate, or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: entry?.title || '',
        content: entry?.content || '',
        mood_score: entry?.mood_score || 5,
        behavioral_tags: entry?.behavioral_tags || [],
        photo_urls: entry?.photo_urls || [],
        voice_note_url: entry?.voice_note_url || null,
        weather_condition: entry?.weather_condition && entry.weather_condition !== '' ? entry.weather_condition : 'nessuna',
        temperature: entry?.temperature || null,
        entry_date: entry?.entry_date || initialDate || format(new Date(), 'yyyy-MM-dd')
      });
      
      // Gestione della data
      if (entry?.entry_date) {
        setEntryDate(new Date(entry.entry_date));
      } else if (initialDate) {
        setEntryDate(new Date(initialDate));
      } else {
        setEntryDate(new Date());
      }
    }
  }, [entry, initialDate, isOpen]);

  const [customTag, setCustomTag] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'photo' | 'voice' | null;
    url?: string;
  }>({ type: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!entryDate) {
      return;
    }
    
    const data = {
      ...formData,
      entry_date: format(entryDate, 'yyyy-MM-dd'),
      pet_id: petId,
      user_id: userId,
      // Convert 'nessuna' back to empty string for database
      weather_condition: formData.weather_condition === 'nessuna' ? '' : formData.weather_condition
    };
    onSave(data);
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

  const addCustomTag = () => {
    if (customTag.trim() && !formData.behavioral_tags.includes(customTag.trim())) {
      addTag(customTag.trim());
      setCustomTag('');
    }
  };

  const getTagColor = (tag: string) => {
    for (const [category, tags] of Object.entries(PREDEFINED_TAGS)) {
      if (tags.includes(tag)) {
        return TAG_COLORS[category as keyof typeof TAG_COLORS];
      }
    }
    return 'bg-gray-500';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `diary-photos/${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('diary-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('diary-photos')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        photo_urls: [...prev.photo_urls, ...urls]
      }));

      toast.success(`${files.length} foto caricate con successo`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error("Errore durante il caricamento delle foto");
    }
  };

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const fileName = `voice-note-${Math.random()}.webm`;
          const filePath = `diary-voice-notes/${userId}/${fileName}`;

          try {
            const { error: uploadError } = await supabase.storage
              .from('diary-voice-notes')
              .upload(filePath, audioBlob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('diary-voice-notes')
              .getPublicUrl(filePath);

            setFormData(prev => ({
              ...prev,
              voice_note_url: publicUrl
            }));

            toast.success("Nota vocale salvata con successo");
          } catch (error) {
            console.error('Error uploading voice note:', error);
            toast.error("Errore durante il salvataggio della nota vocale");
          }

          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);

        toast.success("Registrazione in corso - parla nel microfono");
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast.error("Impossibile accedere al microfono");
      }
    } else {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
      }
    }
  };

  const openPhoto = (url: string) => {
    setSelectedPhoto(url);
  };

  const closePhotoViewer = () => {
    setSelectedPhoto(null);
  };

  const confirmDeletePhoto = (url: string) => {
    setDeleteConfirm({ type: 'photo', url });
  };

  const confirmDeleteVoice = () => {
    setDeleteConfirm({ type: 'voice' });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.type === 'photo' && deleteConfirm.url) {
      removePhoto(deleteConfirm.url);
    } else if (deleteConfirm.type === 'voice') {
      removeVoiceNote();
    }
    setDeleteConfirm({ type: null });
  };

  const removePhoto = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter(url => url !== urlToRemove)
    }));
  };

  const removeVoiceNote = () => {
    setFormData(prev => ({
      ...prev,
      voice_note_url: null
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] shadow-elegant">
        <div className="max-h-[80vh] overflow-y-auto px-1">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              {entry ? 'Modifica Voce' : 'Nuova Voce del Diario'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {/* Date and Mood */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedDatePicker
                label="Data"
                value={entryDate}
                onChange={(date) => {
                  console.log('DiaryEntryForm: onChange entryDate', date);
                  setEntryDate(date);
                }}
                placeholder="Seleziona data"
                required
              />
              
              <div>
                <Label htmlFor="mood_score">
                  Umore: {MOOD_LABELS[formData.mood_score as keyof typeof MOOD_LABELS]} ({formData.mood_score}/10)
                </Label>
                <Slider
                  value={[formData.mood_score]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mood_score: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full mt-2"
                />
              </div>
            </div>

            {/* Title and Content */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titolo (opzionale)</Label>
                <Input
                  id="title"
                  placeholder="Titolo della voce..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="content">Contenuto</Label>
                <Textarea
                  id="content"
                  placeholder="Scrivi qui la tua osservazione del giorno..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                />
              </div>
            </div>

            {/* Behavioral Tags */}
            <div>
              <Label>Tag Comportamentali</Label>
              <div className="space-y-4 mt-2">
                {/* Selected Tags */}
                {formData.behavioral_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.behavioral_tags.map((tag) => (
                      <Badge
                        key={tag}
                        className={`${getTagColor(tag)} text-white`}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Predefined Tags */}
                <div className="space-y-3">
                  {Object.entries(PREDEFINED_TAGS).map(([category, tags]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium capitalize mb-2">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => addTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Aggiungi tag personalizzato..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                  />
                  <Button variant="outline" onClick={addCustomTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Weather and Temperature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weather_condition">Condizioni Meteo (opzionale)</Label>
                <Select
                  value={formData.weather_condition}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, weather_condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona condizioni meteo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nessuna">Nessuna</SelectItem>
                    <SelectItem value="soleggiato">☀️ Soleggiato</SelectItem>
                    <SelectItem value="nuvoloso">☁️ Nuvoloso</SelectItem>
                    <SelectItem value="piovoso">🌧️ Piovoso</SelectItem>
                    <SelectItem value="temporale">⛈️ Temporale</SelectItem>
                    <SelectItem value="neve">🌨️ Neve</SelectItem>
                    <SelectItem value="vento">🌬️ Ventoso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="temperature">Temperatura (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  placeholder="es. 22"
                  value={formData.temperature || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    temperature: e.target.value ? Number(e.target.value) : null 
                  }))}
                />
              </div>
            </div>

            {/* Media Upload Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Aggiungi Foto
              </Button>
              
              <Button
                variant="outline"
                onClick={handleVoiceRecording}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 mr-2" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                {isRecording ? 'Stop Registrazione' : 'Nota Vocale'}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Media Preview Section */}
            {(formData.photo_urls.length > 0 || formData.voice_note_url) && (
              <div className="space-y-4">
                <Label>Media Allegati</Label>
                
                {/* Photo Previews */}
                {formData.photo_urls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Foto ({formData.photo_urls.length})</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.photo_urls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Foto ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openPhoto(url)}
                          />
                          <button
                            onClick={() => confirmDeletePhoto(url)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Note Preview */}
                {formData.voice_note_url && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Nota Vocale</h4>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <audio controls className="flex-1">
                        <source src={formData.voice_note_url} type="audio/webm" />
                        Il tuo browser non supporta l'elemento audio.
                      </audio>
                      <button
                        onClick={confirmDeleteVoice}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {entry ? 'Aggiorna Nota' : 'Crea Nota'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Photo Viewer Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={closePhotoViewer}>
        <DialogContent className="max-w-4xl p-0 bg-black/90">
          <div className="relative">
            <button
              onClick={closePhotoViewer}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </button>
            {selectedPhoto && (
              <img
                src={selectedPhoto}
                alt="Foto ingrandita"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.type !== null} onOpenChange={() => setDeleteConfirm({ type: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm.type === 'photo' 
                ? 'Sei sicuro di voler eliminare questa foto? L\'azione non può essere annullata.'
                : 'Sei sicuro di voler eliminare la nota vocale? L\'azione non può essere annullata.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
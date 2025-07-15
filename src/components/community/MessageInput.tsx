import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image, Mic, MicOff, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: string, fileUrl?: string, voiceDuration?: number) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTime = useRef<number>(0);

  const handleSendText = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const uploadFile = async (file: File, messageType: 'image' | 'voice') => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${messageType}s/${fileName}`;

      const { data, error } = await supabase.storage
        .from('channel-media')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('channel-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il file",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Errore",
        description: "Seleziona un'immagine valida",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Errore",
        description: "L'immagine deve essere più piccola di 5MB",
        variant: "destructive"
      });
      return;
    }

    const fileUrl = await uploadFile(file, 'image');
    if (fileUrl) {
      onSendMessage('', 'image', fileUrl);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      recordingStartTime.current = Date.now();

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const duration = Math.round((Date.now() - recordingStartTime.current) / 1000);
        
        // Convert Blob to File
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        const fileUrl = await uploadFile(audioFile, 'voice');
        if (fileUrl) {
          onSendMessage('', 'voice', fileUrl, duration);
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      toast({
        title: "Registrazione iniziata",
        description: "Premi nuovamente per fermare la registrazione"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Errore",
        description: "Impossibile accedere al microfono",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            disabled={uploading}
            className="resize-none"
          />
        </div>

        {/* Image upload */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2"
        >
          <Image className="h-4 w-4" />
        </Button>

        {/* Voice recording */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleVoiceToggle}
          disabled={uploading}
          className={`p-2 ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}
        >
          {isRecording ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSendText}
          disabled={!message.trim() || uploading}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {uploading && (
        <div className="text-center text-sm text-muted-foreground mt-2">
          Caricamento in corso...
        </div>
      )}
    </div>
  );
};
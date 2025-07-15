import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Send, Camera, Mic, MicOff, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MessageInputProps {
  channelId: string;
  channelName: string;
  onMessageSent?: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  channelId,
  channelName,
  onMessageSent,
  disabled = false
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. INVIO MESSAGGI TESTO
  const sendMessage = useCallback(async () => {
    if (!messageText.trim() || !channelId || !user?.id || sending || disabled) return;
    
    setSending(true);
    try {
      console.log('Sending message:', {
        channelId,
        userId: user.id,
        messageText: messageText.trim()
      });
      
      // Verifica se l'utente è iscritto al canale
      const { data: subscription } = await supabase
        .from('user_channel_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .maybeSingle();
      
      if (!subscription) {
        throw new Error('Devi essere iscritto al canale per inviare messaggi');
      }
      
      const { data, error } = await supabase
        .from('community_messages')
        .insert([{
          channel_id: channelId,
          user_id: user.id,
          content: messageText.trim(),
          message_type: 'text',
          is_emergency: false,
          metadata: {
            channel_name: channelName
          }
        }])
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Errore di database');
      }
      
      console.log('Message sent successfully:', data);
      
      setMessageText('');
      onMessageSent?.();
      
      toast({
        title: "Messaggio inviato",
        description: `Messaggio inviato in ${channelName}`
      });
    } catch (error) {
      console.error('Errore invio messaggio:', error);
      toast({
        title: "Errore",
        description: `Impossibile inviare il messaggio: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  }, [channelId, channelName, messageText, user, sending, disabled, onMessageSent]);

  // 2. UPLOAD IMMAGINI
  const uploadImage = useCallback(async () => {
    if (!channelId || !user?.id || disabled) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Validazione file
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File troppo grande",
          description: "L'immagine deve essere inferiore a 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSending(true);
      try {
        // Upload file a Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('channel-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) throw uploadError;
        
        // Ottieni URL pubblico
        const { data: { publicUrl } } = supabase.storage
          .from('channel-media')
          .getPublicUrl(fileName);
        
        // Salva messaggio con immagine
        const { data, error } = await supabase
          .from('community_messages')
          .insert([{
            channel_id: channelId,
            user_id: user.id,
            content: `📷 Immagine condivisa`,
            message_type: 'image',
            file_url: publicUrl,
            is_emergency: false,
            metadata: {
              channel_name: channelName,
              file_name: file.name,
              file_size: file.size
            }
          }])
          .select();
        
        if (error) throw error;
        
        onMessageSent?.();
        toast({
          title: "Immagine caricata",
          description: `Immagine condivisa in ${channelName}`
        });
      } catch (error) {
        console.error('Errore upload immagine:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare l'immagine",
          variant: "destructive"
        });
      } finally {
        setSending(false);
      }
    };
    
    input.click();
  }, [channelId, channelName, user, disabled, onMessageSent]);

  // 3. REGISTRAZIONE AUDIO
  const startRecording = useCallback(async () => {
    if (!channelId || !user?.id || disabled) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        try {
          setSending(true);
          
          const blob = new Blob(chunks, { 
            type: recorder.mimeType || 'audio/webm' 
          });
          
          const fileName = `audio-${Date.now()}.webm`;
          
          // Upload audio
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('channel-media')
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) throw uploadError;
          
          // Ottieni URL pubblico
          const { data: { publicUrl } } = supabase.storage
            .from('channel-media')
            .getPublicUrl(fileName);
          
          // Salva messaggio audio
          const { data, error } = await supabase
            .from('community_messages')
            .insert([{
              channel_id: channelId,
              user_id: user.id,
              content: `🎤 Messaggio vocale`,
              message_type: 'voice',
              file_url: publicUrl,
              voice_duration: Math.floor(blob.size / 1000), // Stima durata
              is_emergency: false,
              metadata: {
                channel_name: channelName,
                file_size: blob.size
              }
            }])
            .select();
          
          if (error) throw error;
          
          onMessageSent?.();
          toast({
            title: "Audio registrato",
            description: `Messaggio vocale inviato in ${channelName}`
          });
        } catch (error) {
          console.error('Errore registrazione audio:', error);
          toast({
            title: "Errore",
            description: "Impossibile inviare il messaggio vocale",
            variant: "destructive"
          });
        } finally {
          setSending(false);
          setRecording(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      setMediaRecorder(recorder);
      setRecording(true);
      recorder.start();
      
      // Auto-stop dopo 60 secondi
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 60000);
      
    } catch (error) {
      console.error('Errore avvio registrazione:', error);
      toast({
        title: "Errore",
        description: "Impossibile accedere al microfono",
        variant: "destructive"
      });
    }
  }, [channelId, channelName, user, disabled, onMessageSent]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, [mediaRecorder]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="message-input-container">
      <div className="message-input-row">
        <Input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Scrivi in ${channelName}...`}
          disabled={sending || disabled}
          className="message-input-field"
        />
        <Button 
          onClick={sendMessage} 
          disabled={sending || !messageText.trim() || disabled}
          size="icon"
          variant="default"
        >
          {sending ? '⏳' : <Send size={18} />}
        </Button>
      </div>
      
      <div className="message-input-media">
        <Button 
          onClick={uploadImage} 
          disabled={sending || disabled}
          size="sm"
          variant="outline"
        >
          <Camera size={16} />
          Foto
        </Button>
        <Button 
          onClick={recording ? stopRecording : startRecording}
          disabled={sending || disabled}
          size="sm"
          variant={recording ? "destructive" : "outline"}
        >
          {recording ? <MicOff size={16} /> : <Mic size={16} />}
          {recording ? 'Stop' : 'Audio'}
        </Button>
      </div>
    </div>
  );
};
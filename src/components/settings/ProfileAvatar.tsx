import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAvatarProps {
  user: any;
  onAvatarChange: (url: string) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ user, onAvatarChange }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileSelect;
    input.click();
  };
  
  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    
    // Validazione file
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Errore",
        description: "File troppo grande. Massimo 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Errore",
        description: "Seleziona un'immagine valida.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploading(true);
      
      // Upload su Supabase Storage
      const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Ottieni URL pubblico
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Aggiorna metadata utente
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (updateError) throw updateError;
      
      // Aggiorna anche nella tabella profiles se esiste
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });
      
      onAvatarChange(publicUrl);
      toast({
        title: "Successo",
        description: "Avatar aggiornato con successo!"
      });
      
    } catch (error: any) {
      console.error('Errore upload avatar:', error);
      toast({
        title: "Errore",
        description: `Errore aggiornamento avatar: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <img 
          src={user.user_metadata?.avatar_url || '/default-avatar.png'}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
        />
        
        {/* Camera overlay */}
        <button
          onClick={handleAvatarClick}
          disabled={uploading}
          className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:opacity-50"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>
      
      <Button 
        onClick={handleAvatarClick}
        disabled={uploading}
        variant="outline"
        size="sm"
        className="min-w-[120px]"
      >
        {uploading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            <span>Caricamento...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Cambia Avatar</span>
          </div>
        )}
      </Button>
    </div>
  );
};
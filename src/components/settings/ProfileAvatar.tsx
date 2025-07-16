import React, { useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAvatarProps {
  user: any;
  onAvatarChange: (url: string | null) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ user, onAvatarChange }) => {
  const [uploading, setUploading] = useState(false);
  const [showRemoveOption, setShowRemoveOption] = useState(false);
  const { toast } = useToast();
  
  // Genera avatar casuale basato su user ID
  const getRandomAvatar = (userId: string) => {
    const avatarStyles = ['adventurer', 'avataaars', 'big-smile', 'bottts', 'fun-emoji'];
    const style = avatarStyles[userId.charCodeAt(0) % avatarStyles.length];
    const seed = userId.slice(0, 8);
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=96`;
  };
  
  const currentAvatar = user.user_metadata?.avatar_url || getRandomAvatar(user.id);
  const isRandomAvatar = !user.user_metadata?.avatar_url;
  
  const handleAvatarClick = () => {
    if (isRandomAvatar) {
      // Se è avatar casuale, carica direttamente
      openFileSelector();
    } else {
      // Se è avatar personalizzato, mostra opzioni
      setShowRemoveOption(!showRemoveOption);
    }
  };
  
  const openFileSelector = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileSelect;
    input.click();
    setShowRemoveOption(false);
  };
  
  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    
    // Validazione
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
      
      const fileName = `avatar_${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Aggiorna utente
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (updateError) throw updateError;
      
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
        description: "Avatar aggiornato!"
      });
      
    } catch (error: any) {
      console.error('Errore upload avatar:', error);
      toast({
        title: "Errore",
        description: "Errore aggiornamento avatar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const removeAvatar = async () => {
    try {
      setUploading(true);
      
      // Rimuovi avatar URL dall'utente
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });
      
      if (updateError) throw updateError;
      
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: null,
          updated_at: new Date().toISOString()
        });
      
      onAvatarChange(null);
      setShowRemoveOption(false);
      toast({
        title: "Successo",
        description: "Avatar rimosso!"
      });
      
    } catch (error: any) {
      console.error('Errore rimozione avatar:', error);
      toast({
        title: "Errore",
        description: "Errore rimozione avatar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="relative group">
          <img 
            src={currentAvatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover cursor-pointer border-2 border-muted transition-all group-hover:border-primary"
            onClick={handleAvatarClick}
          />
          
          {/* Overlay hover */}
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-white text-2xl">
              {isRandomAvatar ? <Camera className="w-6 h-6" /> : "✏️"}
            </span>
          </div>
          
          {uploading && (
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-black/70 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        {/* Menu opzioni per avatar personalizzato */}
        {showRemoveOption && !isRandomAvatar && (
          <div className="absolute top-0 left-28 bg-background border rounded-lg shadow-lg p-2 z-10">
            <button 
              onClick={openFileSelector}
              className="block w-full text-left px-3 py-2 hover:bg-muted rounded text-sm"
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Cambia Foto
            </button>
            <button 
              onClick={removeAvatar}
              disabled={uploading}
              className="block w-full text-left px-3 py-2 hover:bg-muted rounded text-sm text-destructive"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Rimuovi Avatar
            </button>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        {isRandomAvatar ? 'Clicca per caricare foto' : 'Clicca per opzioni'}
      </p>
    </div>
  );
};
import React, { useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import { supabase } from '@/integrations/supabase/client';

interface PetAvatarUploadProps {
  pet: {
    id: string;
    name: string;
    type: string;
    avatar_url?: string | null;
  };
  onAvatarChange: (url: string | null) => void;
}

export const PetAvatarUpload: React.FC<PetAvatarUploadProps> = ({ pet, onAvatarChange }) => {
  const [uploading, setUploading] = useState(false);
  const [showRemoveOption, setShowRemoveOption] = useState(false);
  const { toast } = useUnifiedToast();
  
  // Genera avatar casuale basato su pet ID e tipo
  const getRandomAvatar = (petId: string, petType: string) => {
    const avatarStyles = ['adventurer', 'avataaars', 'big-smile', 'bottts', 'fun-emoji'];
    const style = avatarStyles[petId.charCodeAt(0) % avatarStyles.length];
    const seed = `${petId.slice(0, 8)}_${petType}`;
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=96`;
  };
  
  const currentAvatar = pet.avatar_url || getRandomAvatar(pet.id, pet.type);
  const isRandomAvatar = !pet.avatar_url;
  
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
      toast.error("File troppo grande (max 5MB)");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error("Seleziona un'immagine valida");
      return;
    }
    
    try {
      setUploading(true);
      
      const fileName = `pets/${pet.id}/${Date.now()}.${file.name.split('.').pop()}`;
      
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
      
      // Aggiorna pet nel database
      const { error: updateError } = await supabase
        .from('pets')
        .update({ avatar_url: publicUrl })
        .eq('id', pet.id);
      
      if (updateError) throw updateError;
      
      onAvatarChange(publicUrl);
      toast.success(`Foto di ${pet.name} aggiornata`);
      
    } catch (error: any) {
      console.error('Errore upload avatar pet:', error);
      toast.error("Impossibile aggiornare la foto");
    } finally {
      setUploading(false);
    }
  };
  
  const removeAvatar = async () => {
    try {
      setUploading(true);
      
      // Rimuovi avatar URL dal pet
      const { error: updateError } = await supabase
        .from('pets')
        .update({ avatar_url: null })
        .eq('id', pet.id);
      
      if (updateError) throw updateError;
      
      onAvatarChange(null);
      setShowRemoveOption(false);
      toast.success(`Foto di ${pet.name} rimossa`);
      
    } catch (error: any) {
      console.error('Errore rimozione avatar pet:', error);
      toast.error("Impossibile rimuovere la foto");
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <div className="relative group">
          <img 
            src={currentAvatar}
            alt={`Foto di ${pet.name}`}
            className="w-16 h-16 rounded-full object-cover cursor-pointer border-2 border-muted transition-all group-hover:border-primary"
            onClick={handleAvatarClick}
          />
          
          {/* Overlay hover */}
          <div 
            className="absolute inset-0 w-16 h-16 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleAvatarClick}
          >
            <span className="text-white text-lg">
              {isRandomAvatar ? <Camera className="w-4 h-4" /> : "✏️"}
            </span>
          </div>
          
          {uploading && (
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-black/70 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        {/* Menu opzioni per avatar personalizzato */}
        {showRemoveOption && !isRandomAvatar && (
          <div className="absolute top-0 left-20 bg-background border rounded-lg shadow-lg p-2 z-10">
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
              Rimuovi Foto
            </button>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        {isRandomAvatar ? 'Clicca per foto' : 'Clicca per opzioni'}
      </p>
    </div>
  );
};
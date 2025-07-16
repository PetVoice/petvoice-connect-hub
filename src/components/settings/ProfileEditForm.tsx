import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, User, MapPin, FileText } from 'lucide-react';
import { GooglePlacesInput } from './GooglePlacesInput';

interface ProfileEditFormProps {
  user: any;
  onProfileUpdate: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: ''
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    console.log('🔍 User metadata:', user.user_metadata);
    console.log('🔍 Full user object:', user);
    
    setFormData({
      display_name: user.user_metadata?.display_name || '',
      bio: user.user_metadata?.bio || '',
      location: user.user_metadata?.location || ''
    });
  }, [user]);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('💾 Saving form data:', formData);
    
    try {
      setSaving(true);
      
      // Aggiorna metadata utente in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location
        }
      });
      
      if (authError) throw authError;
      
      // Aggiorna anche tabella profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: formData.display_name,
          location: formData.location,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (profileError) throw profileError;
      
      console.log('✅ Profile saved successfully to database');
      
      // Forza refresh dell'utente
      await supabase.auth.refreshSession();
      
      console.log('🔄 Session refreshed');
      
      onProfileUpdate();
      
      toast({
        title: "Successo",
        description: "Profilo aggiornato con successo!"
      });
      
    } catch (error: any) {
      console.error('Errore salvataggio profilo:', error);
      toast({
        title: "Errore",
        description: `Errore salvataggio: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="display_name" className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span>Nome Visualizzato</span>
        </Label>
        <Input
          id="display_name"
          type="text"
          value={formData.display_name}
          onChange={(e) => setFormData(prev => ({...prev, display_name: e.target.value}))}
          placeholder="Come vuoi essere chiamato?"
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>Località</span>
        </Label>
        <GooglePlacesInput
          value={formData.location}
          onChange={(location) => setFormData(prev => ({...prev, location}))}
          placeholder="Dove vivi?"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio" className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Bio</span>
        </Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
          placeholder="Parlaci di te e dei tuoi animali..."
          className="w-full min-h-[80px]"
          rows={3}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={saving}
        className="w-full"
      >
        {saving ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            <span>Salvataggio...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Salva Modifiche</span>
          </div>
        )}
      </Button>
    </form>
  );
};
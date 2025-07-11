import React, { useState, useEffect } from 'react';
import '../styles/dropdown.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Heart,
  Star,
  PawPrint
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  birth_date: string | null;
  age: number | null;
  weight: number | null;
  description: string | null;
  allergies: string | null;
  fears: string | null;
  favorite_activities: string | null;
  health_conditions: string | null;
  personality_traits: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

const dogBreeds = [
  'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Alaskan Malamute', 'American Bulldog',
  'American Cocker Spaniel', 'American Pit Bull Terrier', 'American Staffordshire Terrier',
  'Basenji', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Bernese Mountain Dog',
  'Bichon Frise', 'Bloodhound', 'Border Collie', 'Border Terrier', 'Boston Terrier',
  'Boxer', 'Brittany', 'Bulldog', 'Bulldog Francese', 'Bull Terrier', 'Cairn Terrier',
  'Cane Corso', 'Cavalier King Charles Spaniel', 'Chihuahua', 'Chinese Crested',
  'Chow Chow', 'Cocker Spaniel', 'Collie', 'Dachshund', 'Dalmatian', 'Doberman',
  'English Setter', 'English Springer Spaniel', 'Fox Terrier', 'French Bulldog',
  'German Shepherd', 'German Shorthaired Pointer', 'Golden Retriever', 'Great Dane',
  'Greyhound', 'Havanese', 'Irish Setter', 'Irish Wolfhound', 'Jack Russell Terrier',
  'Japanese Spitz', 'Labrador Retriever', 'Lagotto Romagnolo', 'Maltese', 'Mastiff',
  'Newfoundland', 'Pastore Tedesco', 'Pomeranian', 'Poodle', 'Pug', 'Rottweiler',
  'Saint Bernard', 'Samoyed', 'Schnauzer', 'Scottish Terrier', 'Shar Pei',
  'Shih Tzu', 'Siberian Husky', 'Staffordshire Bull Terrier', 'Weimaraner',
  'West Highland White Terrier', 'Whippet', 'Yorkshire Terrier'
];

const catBreeds = [
  'Abissino', 'American Curl', 'American Shorthair', 'Angora Turco', 'Balinese',
  'Bengala', 'Birmano', 'Bombay', 'British Longhair', 'British Shorthair',
  'Burmese', 'California Spangled', 'Certosino', 'Cornish Rex', 'Devon Rex',
  'Egyptian Mau', 'Europeo', 'Exotic Shorthair', 'Himalayan', 'Japanese Bobtail',
  'Korat', 'LaPerm', 'Maine Coon', 'Manx', 'Munchkin', 'Nebelung',
  'Norwegian Forest Cat', 'Ocicat', 'Oriental', 'Persiano', 'Peterbald',
  'Pixie-bob', 'Ragdoll', 'Russian Blue', 'Savannah', 'Scottish Fold',
  'Selkirk Rex', 'Siamese', 'Siberian', 'Singapura', 'Somali', 'Sphynx',
  'Tonkinese', 'Turkish Van'
];

// Avatar mapping for breeds - TUTTE LE RAZZE
const breedAvatars: { [key: string]: string } = {
  // Cani - TUTTE LE RAZZE
  'Affenpinscher': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
  'Afghan Hound': 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=300&fit=crop',
  'Airedale Terrier': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'Alaskan Malamute': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'American Bulldog': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop',
  'American Cocker Spaniel': 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
  'American Pit Bull Terrier': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop',
  'American Staffordshire Terrier': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop',
  'Basenji': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Basset Hound': 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=300&fit=crop',
  'Beagle': 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=300&fit=crop',
  'Bearded Collie': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
  'Bernese Mountain Dog': 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=300&h=300&fit=crop',
  'Bichon Frise': 'https://images.unsplash.com/photo-1616190264687-b7ebf7aa2eb4?w=300&h=300&fit=crop',
  'Bloodhound': 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=300&fit=crop',
  'Border Collie': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
  'Border Terrier': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'Boston Terrier': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
  'Boxer': 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
  'Brittany': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Bulldog': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop',
  'Bulldog Francese': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
  'Bull Terrier': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop',
  'Cairn Terrier': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'Cane Corso': 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=300&h=300&fit=crop',
  'Cavalier King Charles Spaniel': 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
  'Chihuahua': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=300&h=300&fit=crop',
  'Chinese Crested': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Chow Chow': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'Cocker Spaniel': 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
  'Collie': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
  'Dachshund': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Dalmatian': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Doberman': 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=300&h=300&fit=crop',
  'English Setter': 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
  'English Springer Spaniel': 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
  'Fox Terrier': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'French Bulldog': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
  'German Shepherd': 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300&h=300&fit=crop',
  'German Shorthaired Pointer': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Golden Retriever': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
  'Great Dane': 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=300&h=300&fit=crop',
  'Greyhound': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Havanese': 'https://images.unsplash.com/photo-1616190264687-b7ebf7aa2eb4?w=300&h=300&fit=crop',
  'Irish Setter': 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
  'Irish Wolfhound': 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=300&fit=crop',
  'Jack Russell Terrier': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'Japanese Spitz': 'https://images.unsplash.com/photo-1616190264687-b7ebf7aa2eb4?w=300&h=300&fit=crop',
  'Labrador Retriever': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Lagotto Romagnolo': 'https://images.unsplash.com/photo-1616190264687-b7ebf7aa2eb4?w=300&h=300&fit=crop',
  'Maltese': 'https://images.unsplash.com/photo-1616190264687-b7ebf7aa2eb4?w=300&h=300&fit=crop',
  'Mastiff': 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=300&h=300&fit=crop',
  'Newfoundland': 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=300&h=300&fit=crop',
  'Pastore Tedesco': 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300&h=300&fit=crop',
  'Pomeranian': 'https://images.unsplash.com/photo-1616190264687-b7ebf7aa2eb4?w=300&h=300&fit=crop',
  'Poodle': 'https://images.unsplash.com/photo-1616190264687-b7ebf7aa2eb4?w=300&h=300&fit=crop',
  'Pug': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
  'Rottweiler': 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=300&h=300&fit=crop',
  'Saint Bernard': 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=300&h=300&fit=crop',
  'Samoyed': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'Schnauzer': 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
  'Scottish Terrier': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'Shar Pei': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Shih Tzu': 'https://images.unsplash.com/photo-1616190264687-b7ebf7aa2eb4?w=300&h=300&fit=crop',
  'Siberian Husky': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'Staffordshire Bull Terrier': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop',
  'Weimaraner': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'West Highland White Terrier': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
  'Whippet': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
  'Yorkshire Terrier': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',

  // Gatti - TUTTE LE RAZZE  
  'Abissino': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop',
  'American Curl': 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=300&fit=crop',
  'American Shorthair': 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=300&fit=crop',
  'Angora Turco': 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=300&h=300&fit=crop',
  'Balinese': 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=300&h=300&fit=crop',
  'Bengala': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop',
  'Birmano': 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300&h=300&fit=crop',
  'Bombay': 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300&h=300&fit=crop',
  'British Longhair': 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=300&fit=crop',
  'British Shorthair': 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=300&fit=crop',
  'Burmese': 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=300&h=300&fit=crop',
  'California Spangled': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop',
  'Certosino': 'https://images.unsplash.com/photo-1596854273338-cbf078db0dc8?w=300&h=300&fit=crop',
  'Cornish Rex': 'https://images.unsplash.com/photo-1572964547716-24607b7f1ed5?w=300&h=300&fit=crop',
  'Devon Rex': 'https://images.unsplash.com/photo-1572964547716-24607b7f1ed5?w=300&h=300&fit=crop',
  'Egyptian Mau': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop',
  'Europeo': 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300&h=300&fit=crop',
  'Exotic Shorthair': 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=300&h=300&fit=crop',
  'Himalayan': 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=300&h=300&fit=crop',
  'Japanese Bobtail': 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=300&fit=crop',
  'Korat': 'https://images.unsplash.com/photo-1596854273338-cbf078db0dc8?w=300&h=300&fit=crop',
  'LaPerm': 'https://images.unsplash.com/photo-1572964547716-24607b7f1ed5?w=300&h=300&fit=crop',
  'Maine Coon': 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=300&h=300&fit=crop',
  'Manx': 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=300&fit=crop',
  'Munchkin': 'https://images.unsplash.com/photo-1574231164645-d6f0e8553590?w=300&h=300&fit=crop',
  'Nebelung': 'https://images.unsplash.com/photo-1596854273338-cbf078db0dc8?w=300&h=300&fit=crop',
  'Norwegian Forest Cat': 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=300&h=300&fit=crop',
  'Ocicat': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop',
  'Oriental': 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=300&h=300&fit=crop',
  'Persiano': 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=300&h=300&fit=crop',
  'Peterbald': 'https://images.unsplash.com/photo-1572964547716-24607b7f1ed5?w=300&h=300&fit=crop',
  'Pixie-bob': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop',
  'Ragdoll': 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300&h=300&fit=crop',
  'Russian Blue': 'https://images.unsplash.com/photo-1596854273338-cbf078db0dc8?w=300&h=300&fit=crop',
  'Savannah': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop',
  'Scottish Fold': 'https://images.unsplash.com/photo-1574231164645-d6f0e8553590?w=300&h=300&fit=crop',
  'Selkirk Rex': 'https://images.unsplash.com/photo-1572964547716-24607b7f1ed5?w=300&h=300&fit=crop',
  'Siamese': 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=300&h=300&fit=crop',
  'Siberian': 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=300&h=300&fit=crop',
  'Singapura': 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=300&fit=crop',
  'Somali': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop',
  'Sphynx': 'https://images.unsplash.com/photo-1572964547716-24607b7f1ed5?w=300&h=300&fit=crop',
  'Tonkinese': 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=300&h=300&fit=crop',
  'Turkish Van': 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=300&h=300&fit=crop'
};

const PetsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    weight: '',
    description: '',
    allergies: '',
    fears: '',
    favorite_activities: '',
    health_conditions: '',
    personality_traits: ''
  });
  const [birthDate, setBirthDate] = useState({
    day: '',
    month: '',
    year: ''
  });

  useEffect(() => {
    fetchPets();
    
    // Check if we should open the form immediately (from Dashboard)
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setShowForm(true);
      // Remove the parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);

  const fetchPets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: { day: string; month: string; year: string }) => {
    if (!birthDate.day || !birthDate.month || !birthDate.year) return null;
    
    const birth = new Date(parseInt(birthDate.year), parseInt(birthDate.month) - 1, parseInt(birthDate.day));
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name || !formData.type) {
      toast({
        title: "Errore",
        description: "Nome e tipo sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const age = calculateAge(birthDate);
      const birth_date = (birthDate.year && birthDate.month && birthDate.day) 
        ? `${birthDate.year}-${birthDate.month.padStart(2, '0')}-${birthDate.day.padStart(2, '0')}` 
        : null;

      // Get avatar based on breed
      const avatar_url = formData.breed && breedAvatars[formData.breed] 
        ? breedAvatars[formData.breed] 
        : null;

      const petData = {
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        breed: formData.breed || null,
        birth_date,
        age,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        description: formData.description || null,
        allergies: formData.allergies || null,
        fears: formData.fears || null,
        favorite_activities: formData.favorite_activities || null,
        health_conditions: formData.health_conditions || null,
        personality_traits: formData.personality_traits || null,
        avatar_url: avatar_url
      };

      if (editingPet) {
        const { error } = await supabase
          .from('pets')
          .update(petData)
          .eq('id', editingPet.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Pet aggiornato con successo!",
        });
      } else {
        const { error } = await supabase
          .from('pets')
          .insert([petData]);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Pet aggiunto con successo!",
        });
      }

      resetForm();
      fetchPets();
    } catch (error) {
      console.error('Error saving pet:', error);
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio del pet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      weight: pet.weight?.toString() || '',
      description: pet.description || '',
      allergies: pet.allergies || '',
      fears: pet.fears || '',
      favorite_activities: pet.favorite_activities || '',
      health_conditions: pet.health_conditions || '',
      personality_traits: pet.personality_traits || ''
    });

    // Set birth date if available
    if (pet.birth_date) {
      const date = new Date(pet.birth_date);
      setBirthDate({
        day: date.getDate().toString(),
        month: (date.getMonth() + 1).toString(),
        year: date.getFullYear().toString()
      });
    } else {
      setBirthDate({ day: '', month: '', year: '' });
    }
    
    setShowForm(true);
  };

  const handleDelete = async (petId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo pet?')) return;

    try {
      const { error } = await supabase
        .from('pets')
        .update({ is_active: false })
        .eq('id', petId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Pet eliminato con successo!",
      });

      fetchPets();
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione del pet",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      breed: '',
      weight: '',
      description: '',
      allergies: '',
      fears: '',
      favorite_activities: '',
      health_conditions: '',
      personality_traits: ''
    });
    setBirthDate({
      day: '',
      month: '',
      year: ''
    });
    setEditingPet(null);
    setShowForm(false);
  };

  const getAvailableBreeds = () => {
    return formData.type === 'Cane' ? dogBreeds : catBreeds;
  };

  const getPetEmoji = (type: string) => {
    return type === 'Cane' ? '🐕' : '🐱';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">I Miei Pet</h1>
          <p className="text-muted-foreground">
            Gestisci le informazioni dei tuoi amici a quattro zampe
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="petvoice-button">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Pet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPet ? 'Modifica Pet' : 'Aggiungi Nuovo Pet'}
              </DialogTitle>
              <DialogDescription>
                {editingPet 
                  ? 'Modifica le informazioni del tuo pet'
                  : 'Inserisci tutte le informazioni del tuo nuovo pet'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome del pet"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value, breed: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il tipo" />
                    </SelectTrigger>
                    <SelectContent 
                      className="select-content-no-scroll"
                      onWheel={(e) => e.stopPropagation()}
                      onPointerMove={(e) => e.stopPropagation()}
                    >
                      <SelectItem value="Cane">Cane</SelectItem>
                      <SelectItem value="Gatto">Gatto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type && (
                  <div>
                    <Label htmlFor="breed">Razza</Label>
                    <Select 
                      value={formData.breed} 
                      onValueChange={(value) => setFormData({...formData, breed: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona la razza" />
                      </SelectTrigger>
                      <SelectContent 
                        className="select-content-no-scroll"
                        onWheel={(e) => e.stopPropagation()}
                        onPointerMove={(e) => e.stopPropagation()}
                      >
                        {getAvailableBreeds().map((breed) => (
                          <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="Es. 5.2"
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Data di nascita</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={birthDate.day} onValueChange={(value) => setBirthDate({...birthDate, day: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Giorno" />
                      </SelectTrigger>
                      <SelectContent 
                        className="select-content-no-scroll"
                        onWheel={(e) => e.stopPropagation()}
                        onPointerMove={(e) => e.stopPropagation()}
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={birthDate.month} onValueChange={(value) => setBirthDate({...birthDate, month: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Mese" />
                      </SelectTrigger>
                      <SelectContent 
                        className="select-content-no-scroll"
                        onWheel={(e) => e.stopPropagation()}
                        onPointerMove={(e) => e.stopPropagation()}
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {new Date(2000, month - 1).toLocaleDateString('it-IT', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={birthDate.year} onValueChange={(value) => setBirthDate({...birthDate, year: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Anno" />
                      </SelectTrigger>
                      <SelectContent 
                        className="select-content-no-scroll"
                        onWheel={(e) => e.stopPropagation()}
                        onPointerMove={(e) => e.stopPropagation()}
                      >
                        {Array.from({length: 25}, (_, i) => new Date().getFullYear() - i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {birthDate.day && birthDate.month && birthDate.year && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Età: {calculateAge(birthDate)} anni
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="allergies">Allergie</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    placeholder="Es. Polline, alcuni cibi..."
                  />
                </div>

                <div>
                  <Label htmlFor="fears">Paure</Label>
                  <Input
                    id="fears"
                    value={formData.fears}
                    onChange={(e) => setFormData({...formData, fears: e.target.value})}
                    placeholder="Es. Tuoni, fuochi d'artificio..."
                  />
                </div>

                <div>
                  <Label htmlFor="favorite_activities">Attività preferite</Label>
                  <Input
                    id="favorite_activities"
                    value={formData.favorite_activities}
                    onChange={(e) => setFormData({...formData, favorite_activities: e.target.value})}
                    placeholder="Es. Giocare a riporto, dormire..."
                  />
                </div>

                <div>
                  <Label htmlFor="health_conditions">Condizioni di salute</Label>
                  <Input
                    id="health_conditions"
                    value={formData.health_conditions}
                    onChange={(e) => setFormData({...formData, health_conditions: e.target.value})}
                    placeholder="Es. Artrite, problemi cardiaci..."
                  />
                </div>

                <div>
                  <Label htmlFor="personality_traits">Tratti di personalità</Label>
                  <Input
                    id="personality_traits"
                    value={formData.personality_traits}
                    onChange={(e) => setFormData({...formData, personality_traits: e.target.value})}
                    placeholder="Es. Giocherellone, timido, socievole..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrizione generale</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrivi il carattere e le caratteristiche del tuo pet"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="petvoice-button flex-1" disabled={loading}>
                  {loading ? 'Salvando...' : (editingPet ? 'Aggiorna Pet' : 'Aggiungi Pet')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pets.length === 0 ? (
        <Card className="petvoice-card border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full gradient-coral flex items-center justify-center mb-4">
              <PawPrint className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-xl mb-2">Nessun Pet Registrato</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              Non hai ancora aggiunto nessun pet. Inizia creando il profilo del tuo amico a quattro zampe!
            </CardDescription>
            <Button 
              onClick={() => setShowForm(true)}
              className="petvoice-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi il tuo primo Pet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className="petvoice-card">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={pet.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {getPetEmoji(pet.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pet.name}</CardTitle>
                    <CardDescription>
                      {pet.type} {pet.breed && `• ${pet.breed}`}
                    </CardDescription>
                    {pet.age && (
                      <Badge variant="secondary" className="mt-1">
                        {pet.age} anni
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pet.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peso:</span>
                      <span>{pet.weight} kg</span>
                    </div>
                  )}
                  
                  {pet.personality_traits && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Personalità:</span>
                      <span className="text-right">{pet.personality_traits}</span>
                    </div>
                  )}

                  {pet.favorite_activities && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ama:</span>
                      <span className="text-right">{pet.favorite_activities}</span>
                    </div>
                  )}

                  {pet.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                      {pet.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(pet)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(pet.id)}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetsPage;
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PetMatch {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  location: string;
  user_id: string;
  owner_name: string;
  match_score: number;
  created_at: string;
  // Additional properties for UI
  avatar: string;
  owner: string;
  matchScore: number;
  distance: number;
  behavioralDNA: string[];
  commonTraits: string[];
  differences: string[];
  successStories: number;
  lastActive: string;
  energyLevel: number;
  socialScore: number;
  anxietyLevel: number;
  trainingProgress: number;
  isBookmarked: boolean;
}

export interface MentorProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  experience_years: number;
  specialties: string[];
  location: string;
  success_rate: number;
  total_mentorships: number;
  rating: number;
  is_online: boolean;
  last_seen: string;
  bio: string;
  hourly_rate: number;
  response_time: string;
  availability: string;
  // Additional properties for UI compatibility
  name: string;
  avatar: string;
  experience: number;
  successRate: number;
  totalMentorships: number;
  isOnline: boolean;
  lastSeen: string;
  responseTime: string;
  hourlyRate: number;
  languages: string[];
  distance: number;
  isBookmarked: boolean;
}

export const usePetMatching = () => {
  return useQuery({
    queryKey: ['pet-matching'],
    queryFn: async () => {
      const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

      if (petsError) throw petsError;

      const { data: protocols, error: protocolsError } = await supabase
        .from('ai_training_protocols')
        .select('*')
        .eq('status', 'completed');

      if (protocolsError) throw protocolsError;

      const { data: communityMessages, error: messagesError } = await supabase
        .from('community_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Calculate statistics
      const petTwins = pets?.filter(pet => pet.type && pet.breed).length || 0;
      const mentorsActive = Math.floor(pets?.length / 3) || 0; // Mock calculation
      const averageImprovement = protocols?.length > 0 
        ? Math.round(protocols.reduce((sum, p) => sum + (p.success_rate || 0), 0) / protocols.length)
        : 0;
      const successStories = communityMessages?.length || 0;

      return {
        petTwins,
        mentorsActive,
        averageImprovement,
        successStories,
        pets: pets || [],
        protocols: protocols || [],
        communityMessages: communityMessages || []
      };
    },
  });
};

export const usePetTwins = () => {
  return useQuery({
    queryKey: ['pet-twins'],
    queryFn: async () => {
      const { data: pets, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get profiles for owner names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', pets?.map(pet => pet.user_id) || []);

      if (profilesError) throw profilesError;

      // Create a map of user_id to display_name
      const ownerNames = profiles?.reduce((acc, profile) => {
        acc[profile.user_id] = profile.display_name;
        return acc;
      }, {} as Record<string, string>) || {};

      // Transform to PetMatch format
      return pets?.map(pet => ({
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed || 'Misto',
        age: pet.age || 0,
        location: 'Italia', // Mock location
        user_id: pet.user_id,
        owner_name: ownerNames[pet.user_id] || 'Utente',
        match_score: Math.floor(Math.random() * 30) + 70, // Mock score 70-100
        created_at: pet.created_at,
        // Additional properties for UI
        avatar: '/placeholder.svg',
        owner: ownerNames[pet.user_id] || 'Utente',
        matchScore: Math.floor(Math.random() * 30) + 70,
        distance: Math.floor(Math.random() * 20) + 1,
        behavioralDNA: ['Giocoso', 'Socievole', 'Energico', 'Curioso'],
        commonTraits: ['Ama giocare', 'Socievole con altri pet', 'Energico al mattino'],
        differences: ['Più calmo', 'Meno territoriale'],
        successStories: Math.floor(Math.random() * 5) + 1,
        lastActive: '2 ore fa',
        energyLevel: Math.floor(Math.random() * 40) + 60,
        socialScore: Math.floor(Math.random() * 40) + 60,
        anxietyLevel: Math.floor(Math.random() * 40) + 20,
        trainingProgress: Math.floor(Math.random() * 40) + 60,
        isBookmarked: false
      })) || [];
    },
  });
};

export const useMentors = () => {
  return useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform to MentorProfile format
      return profiles?.map(profile => ({
        id: profile.user_id,
        display_name: profile.display_name || 'Mentore',
        avatar_url: profile.avatar_url || '/placeholder.svg',
        experience_years: Math.floor(Math.random() * 10) + 1,
        specialties: ['Comportamento', 'Addestramento', 'Socializzazione'],
        location: 'Italia',
        success_rate: Math.floor(Math.random() * 20) + 80,
        total_mentorships: Math.floor(Math.random() * 50) + 10,
        rating: Math.round((Math.random() * 1 + 4) * 10) / 10,
        is_online: Math.random() > 0.5,
        last_seen: 'Online ora',
        bio: 'Esperto in comportamento animale con anni di esperienza.',
        hourly_rate: Math.floor(Math.random() * 40) + 30,
        response_time: '< 2 ore',
        availability: Math.random() > 0.3 ? 'Disponibile' : 'Occupato',
        // Additional properties for UI compatibility
        name: profile.display_name || 'Mentore',
        avatar: profile.avatar_url || '/placeholder.svg',
        experience: Math.floor(Math.random() * 10) + 1,
        successRate: Math.floor(Math.random() * 20) + 80,
        totalMentorships: Math.floor(Math.random() * 50) + 10,
        isOnline: Math.random() > 0.5,
        lastSeen: 'Online ora',
        responseTime: '< 2 ore',
        hourlyRate: Math.floor(Math.random() * 40) + 30,
        languages: ['Italiano', 'Inglese'],
        distance: Math.floor(Math.random() * 20) + 1,
        isBookmarked: false
      })) || [];
    },
  });
};

export const useSuccessPatterns = () => {
  return useQuery({
    queryKey: ['success-patterns'],
    queryFn: async () => {
      const { data: templates, error } = await supabase
        .from('ai_training_templates')
        .select('*')
        .eq('is_active', true)
        .order('success_rate', { ascending: false });

      if (error) throw error;

      return templates?.map(template => ({
        id: template.id,
        patternName: template.name,
        description: template.description || 'Pattern di successo provato',
        difficulty: template.difficulty === 'facile' ? 'Facile' : 
                   template.difficulty === 'medio' ? 'Medio' : 'Difficile',
        successRate: template.success_rate || 0,
        timeframe: `${template.duration_days || 14} giorni`,
        steps: [
          'Valutazione iniziale',
          'Implementazione graduale',
          'Monitoraggio progress',
          'Ottimizzazione',
          'Consolidamento risultati'
        ],
        similarCases: template.popularity_score || 0,
        category: template.category || 'Comportamento',
        isStarted: false,
        estimatedCost: null, // Sempre gratuito
        requiredMaterials: ['Materiali base', 'Strumenti di monitoraggio']
      })) || [];
    },
  });
};
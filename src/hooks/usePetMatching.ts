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
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all pets except current user's pets
      const { data: pets, error } = await supabase
        .from('pets')
        .select('*')
        .neq('user_id', user.id) // Exclude current user's pets
        .order('created_at', { ascending: false });

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

      // Get current user's pets to calculate matches
      const { data: myPets, error: myPetsError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id);

      if (myPetsError) throw myPetsError;

      if (!myPets?.length) return []; // No pets to match against

      // Get pet analyses for better matching
      const { data: analyses, error: analysesError } = await supabase
        .from('pet_analyses')
        .select('pet_id, primary_emotion, primary_confidence, behavioral_insights');

      if (analysesError) throw analysesError;

      // Get completed protocols for matching
      const { data: allProtocols, error: protocolsError } = await supabase
        .from('ai_training_protocols')
        .select('user_id, title, category, status')
        .eq('status', 'completed');

      if (protocolsError) throw protocolsError;

      // Create analysis map
      const analysisMap = analyses?.reduce((acc, analysis) => {
        if (!acc[analysis.pet_id]) acc[analysis.pet_id] = [];
        acc[analysis.pet_id].push(analysis);
        return acc;
      }, {} as Record<string, any[]>) || {};

      // Create protocols map by user
      const protocolsByUser = allProtocols?.reduce((acc, protocol) => {
        if (!acc[protocol.user_id]) acc[protocol.user_id] = [];
        acc[protocol.user_id].push(protocol);
        return acc;
      }, {} as Record<string, any[]>) || {};

      // Get current user's completed protocols
      const myProtocols = protocolsByUser[user.id] || [];

      // Transform to PetMatch format with real matching logic
      return pets?.map(pet => {
        const myPet = myPets[0]; // Use first pet for matching (could be enhanced)
        const petAnalyses = analysisMap[pet.id] || [];
        const myPetAnalyses = analysisMap[myPet.id] || [];
        
        // Calculate match score based on multiple criteria
        let matchScore = 40; // Base score
        
        // Same breed bonus (30%)
        if (pet.breed === myPet.breed) matchScore += 30;
        
        // Same type (species) bonus (20%)
        if (pet.type === myPet.type) matchScore += 20;
        
        // Age similarity (within 2 years) (15%)
        const ageDiff = Math.abs((pet.age || 0) - (myPet.age || 0));
        if (ageDiff <= 2) matchScore += 15;
        
        // Similar completed protocols (25%)
        const otherUserProtocols = protocolsByUser[pet.user_id] || [];
        const commonProtocols = myProtocols.filter(myProtocol => 
          otherUserProtocols.some(otherProtocol => 
            otherProtocol.title === myProtocol.title && 
            otherProtocol.category === myProtocol.category
          )
        );
        if (commonProtocols.length > 0) {
          matchScore += Math.min(25, commonProtocols.length * 8);
        }
        
        // Similar emotions/behaviors from analyses (10%)
        if (petAnalyses.length && myPetAnalyses.length) {
          const commonEmotions = petAnalyses.filter(pa => 
            myPetAnalyses.some(mpa => mpa.primary_emotion === pa.primary_emotion)
          ).length;
          matchScore += Math.min(10, commonEmotions * 3);
        }
        
        // Ensure score is within bounds
        matchScore = Math.min(100, Math.max(60, matchScore));

        return {
          id: pet.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed || 'Misto',
          age: pet.age || 0,
          location: 'Italia', // Mock location, could be enhanced with real locations
          user_id: pet.user_id,
          owner_name: ownerNames[pet.user_id] || 'Utente',
          match_score: matchScore,
          created_at: pet.created_at,
          // Additional properties for UI
          avatar: '/placeholder.svg',
          owner: ownerNames[pet.user_id] || 'Utente',
          matchScore: matchScore,
          distance: Math.floor(Math.random() * 20) + 1, // Mock distance for now
          behavioralDNA: petAnalyses.map(a => a.primary_emotion).filter(Boolean) || ['Socievole', 'Energico'],
           commonTraits: [
             pet.breed === myPet.breed ? `Stessa razza: ${pet.breed}` : null,
             pet.type === myPet.type ? `Stesso tipo: ${pet.type}` : null,
             ageDiff <= 2 ? `Età simile (${pet.age || 0} anni)` : null,
             commonProtocols.length > 0 ? `${commonProtocols.length} protocolli completati in comune` : null
           ].filter(Boolean),
          differences: ['Caratteristiche uniche', 'Temperamento diverso'],
          successStories: Math.floor(Math.random() * 5) + 1,
          lastActive: '2 ore fa',
          energyLevel: Math.floor(Math.random() * 40) + 60,
          socialScore: Math.floor(Math.random() * 40) + 60,
          anxietyLevel: Math.floor(Math.random() * 40) + 20,
          trainingProgress: Math.floor(Math.random() * 40) + 60,
          isBookmarked: false
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score
      .slice(0, 20) || []; // Limit to top 20 matches
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
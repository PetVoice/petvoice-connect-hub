import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PetMatch {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  photo_url?: string;
  owner_display_name: string;
  compatibility_score: number;
  common_traits: string[];
  completed_protocols: string[];
  matching_protocols: number;
  behavioral_compatibility: number;
  // Existing properties for backward compatibility
  location: string;
  user_id: string;
  owner_name: string;
  match_score: number;
  created_at: string;
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

export interface PetMatchingData {
  total_pets: number;
  pet_twins: PetMatch[];
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

const calculateCompatibilityScore = (userPet: any, otherPet: any, userProtocols: any[], otherProtocols: any[]): { 
  score: number; 
  traits: string[]; 
  matchingProtocols: number;
  behavioralScore: number;
} => {
  let score = 0;
  const traits: string[] = [];
  
  // 1. BREED MATCHING (peso: 30%)
  if (userPet.breed?.toLowerCase() === otherPet.breed?.toLowerCase()) {
    score += 30;
    traits.push(`Stessa razza (${userPet.breed})`);
  }
  
  // 2. SPECIES MATCHING (peso: 20%)
  if (userPet.type?.toLowerCase() === otherPet.type?.toLowerCase()) {
    score += 20;
    traits.push(`Stessa specie (${userPet.type})`);
  }
  
  // 3. AGE PROXIMITY (peso: 15%)
  if (userPet.age && otherPet.age) {
    const ageDiff = Math.abs(userPet.age - otherPet.age);
    if (ageDiff === 0) {
      score += 15;
      traits.push(`Stessa età (${userPet.age} anni)`);
    } else if (ageDiff <= 1) {
      score += 10;
      traits.push(`Età simile (differenza ${ageDiff} anno)`);
    } else if (ageDiff <= 2) {
      score += 5;
      traits.push(`Età compatibile (differenza ${ageDiff} anni)`);
    }
  }
  
  // 4. COMPLETED PROTOCOLS MATCHING (peso: 25%) - NUOVO
  const userCompletedProtocols = userProtocols.filter(p => p.status === 'completed');
  const otherCompletedProtocols = otherProtocols.filter(p => p.status === 'completed');
  
  const userProtocolTitles = new Set(userCompletedProtocols.map(p => p.title.toLowerCase()));
  const otherProtocolTitles = new Set(otherCompletedProtocols.map(p => p.title.toLowerCase()));
  
  const commonProtocols = [...userProtocolTitles].filter(title => otherProtocolTitles.has(title));
  const protocolMatchPercentage = commonProtocols.length > 0 ? 
    (commonProtocols.length / Math.max(userProtocolTitles.size, otherProtocolTitles.size)) * 100 : 0;
  
  const protocolScore = Math.min(25, protocolMatchPercentage * 0.25);
  score += protocolScore;
  
  if (commonProtocols.length > 0) {
    traits.push(`${commonProtocols.length} protocolli in comune`);
  }
  
  // 5. BEHAVIORAL ANALYSIS COMPATIBILITY (peso: 10%)
  let behavioralScore = 0;
  
  // Simula analisi comportamentale basata sui protocolli e sui dati
  if (userCompletedProtocols.length > 0 && otherCompletedProtocols.length > 0) {
    const userAvgSuccess = userCompletedProtocols.reduce((sum, p) => sum + (p.success_rate || 0), 0) / userCompletedProtocols.length;
    const otherAvgSuccess = otherCompletedProtocols.reduce((sum, p) => sum + (p.success_rate || 0), 0) / otherCompletedProtocols.length;
    
    const successDiff = Math.abs(userAvgSuccess - otherAvgSuccess);
    if (successDiff < 10) {
      behavioralScore = 10;
      traits.push('Livello di training simile');
    } else if (successDiff < 20) {
      behavioralScore = 7;
      traits.push('Training compatibile');
    } else if (successDiff < 30) {
      behavioralScore = 4;
    }
  }
  
  score += behavioralScore;
  
  return { 
    score: Math.min(100, Math.round(score)), 
    traits,
    matchingProtocols: commonProtocols.length,
    behavioralScore: Math.round(behavioralScore)
  };
};

export const usePetMatching = () => {
  return useQuery({
    queryKey: ['pet-matching'],
    queryFn: async (): Promise<PetMatchingData> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's pets
      const { data: userPets, error: userPetsError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id);

      if (userPetsError) throw userPetsError;
      if (!userPets || userPets.length === 0) {
        return { total_pets: 0, pet_twins: [] };
      }

      // Get user's training protocols for each pet
      const { data: userProtocols, error: userProtocolsError } = await supabase
        .from('ai_training_protocols')
        .select('*')
        .eq('user_id', user.id);

      if (userProtocolsError) throw userProtocolsError;

      // Get all other pets (excluding user's own pets) with profiles
      const { data: allOtherPets, error: allPetsError } = await supabase
        .from('pets')
        .select('*')
        .neq('user_id', user.id);

      if (allPetsError) throw allPetsError;

      // Get profiles for all pet owners
      const ownerIds = [...new Set(allOtherPets?.map(pet => pet.user_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', ownerIds);

      if (profilesError) throw profilesError;

      // Create owner map
      const ownerMap = profiles?.reduce((acc, profile) => {
        acc[profile.user_id] = profile.display_name || 'Utente';
        return acc;
      }, {} as Record<string, string>) || {};

      if (allPetsError) throw allPetsError;

      // Get protocols for all other pet owners
      const otherUserIds = ownerIds;
      const { data: allOtherProtocols, error: protocolsError } = await supabase
        .from('ai_training_protocols')
        .select('*')
        .in('user_id', otherUserIds);

      if (protocolsError) throw protocolsError;

      // Calculate matches for each user pet
      const allMatches: PetMatch[] = [];

      userPets.forEach(userPet => {
        const userPetProtocols = userProtocols?.filter(p => p.pet_id === userPet.id || !p.pet_id) || [];
        
        allOtherPets?.forEach(otherPet => {
          const otherPetProtocols = allOtherProtocols?.filter(p => 
            p.user_id === otherPet.user_id && (p.pet_id === otherPet.id || !p.pet_id)
          ) || [];
          
          const { score, traits, matchingProtocols, behavioralScore } = calculateCompatibilityScore(
            userPet, 
            otherPet, 
            userPetProtocols,
            otherPetProtocols
          );

          // Only include pets with compatibility score > 20%
          if (score > 20) {
            const completedProtocolTitles = otherPetProtocols
              .filter(p => p.status === 'completed')
              .map(p => p.title);

            allMatches.push({
              id: otherPet.id,
              name: otherPet.name,
              type: otherPet.type,
              breed: otherPet.breed || 'Misto',
              age: otherPet.age || 0,
              photo_url: otherPet.avatar_url,
              owner_display_name: ownerMap[otherPet.user_id] || 'Utente',
              compatibility_score: score,
              common_traits: traits,
              completed_protocols: completedProtocolTitles,
              matching_protocols: matchingProtocols,
              behavioral_compatibility: behavioralScore,
              // Backward compatibility properties
              location: 'Italia',
              user_id: otherPet.user_id,
              owner_name: ownerMap[otherPet.user_id] || 'Utente',
              match_score: score,
              created_at: otherPet.created_at,
              avatar: otherPet.avatar_url || '/placeholder.svg',
              owner: ownerMap[otherPet.user_id] || 'Utente',
              matchScore: score,
              distance: Math.floor(Math.random() * 20) + 1,
              behavioralDNA: traits,
              commonTraits: traits,
              differences: ['Caratteristiche uniche'],
              successStories: Math.floor(Math.random() * 5) + 1,
              lastActive: '2 ore fa',
              energyLevel: Math.floor(Math.random() * 40) + 60,
              socialScore: Math.floor(Math.random() * 40) + 60,
              anxietyLevel: Math.floor(Math.random() * 40) + 20,
              trainingProgress: Math.floor(Math.random() * 40) + 60,
              isBookmarked: false
            });
          }
        });
      });

      // Sort by compatibility score (highest first) and remove duplicates
      const uniqueMatches = allMatches
        .sort((a, b) => b.compatibility_score - a.compatibility_score)
        .filter((match, index, arr) => 
          arr.findIndex(m => m.id === match.id) === index
        )
        .slice(0, 10); // Top 10 matches

      return {
        total_pets: allOtherPets?.length || 0,
        pet_twins: uniqueMatches
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePetTwins = () => {
  // Use the new enhanced pet matching
  const petMatchingQuery = usePetMatching();
  
  return {
    ...petMatchingQuery,
    data: petMatchingQuery.data?.pet_twins || []
  };
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
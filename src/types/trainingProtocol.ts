// Types that match the new database schema
export interface DatabaseTrainingProtocol {
  id: string;
  user_id: string;
  pet_id?: string;
  title_it?: string;
  title_en?: string;
  title_es?: string;
  description_it?: string;
  description_en?: string;
  description_es?: string;
  category_it?: string;
  category_en?: string;
  category_es?: string;
  difficulty_it?: string;
  difficulty_en?: string;
  difficulty_es?: string;
  status_it?: string;
  status_en?: string;
  status_es?: string;
  target_behavior_it?: string;
  target_behavior_en?: string;
  target_behavior_es?: string;
  triggers_it?: any;
  triggers_en?: any;
  triggers_es?: any;
  required_materials_it?: any;
  required_materials_en?: any;
  required_materials_es?: any;
  duration_days: number;
  current_day: number;
  progress_percentage: string;
  success_rate: number;
  ai_generated: boolean;
  is_public: boolean;
  veterinary_approved: boolean;
  community_rating: number;
  community_usage: string;
  mentor_recommended: boolean;
  notifications_enabled: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  integration_source?: string;
  estimated_cost?: string;
  share_code?: string;
}

// Client-side interface for components
export interface TrainingProtocol {
  id: string;
  user_id: string;
  pet_id?: string;
  title: string;
  description?: string;
  category: string;
  difficulty: 'facile' | 'medio' | 'difficile';
  duration_days: number;
  current_day: number; 
  progress_percentage: number;
  status: 'available' | 'active' | 'paused' | 'completed' | 'suggested';
  target_behavior?: string;
  triggers?: string[];
  success_rate: number;
  ai_generated: boolean;
  integration_source?: 'analysis' | 'diary' | 'wellness' | 'matching' | 'manual';
  veterinary_approved: boolean;
  estimated_cost?: number;
  required_materials?: string[];
  is_public: boolean;
  share_code?: string;
  community_rating: number;
  community_usage: number;
  mentor_recommended: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  // Personal rating fields (only for completed protocols)
  personal_success_rate?: number;
  personal_rating?: number;
  // Relationships
  exercises?: TrainingExercise[];
  metrics?: TrainingMetrics | null;
  schedule?: TrainingSchedule | null;
}

export interface TrainingExercise {
  id: string;
  protocol_id: string;
  day_number: number;
  title: string;
  description?: string;
  duration_minutes: number;
  exercise_type: 'physical' | 'mental' | 'behavioral' | 'social';
  instructions?: string[];
  materials?: string[];
  video_url?: string;
  completed: boolean;
  completed_at?: string;
  feedback?: string;
  effectiveness_score?: number;
  photos?: string[];
  voice_notes?: string[];
  ai_analysis?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingMetrics {
  id: string;
  protocol_id: string;
  behavior_improvement: number;
  stress_reduction: number;
  engagement_level: number;
  owner_satisfaction: number;
  community_success: number;
  time_efficiency: number;
  cost_effectiveness: number;
  recorded_at: string;
  created_at: string;
}

export interface TrainingSchedule {
  id: string;
  protocol_id: string;
  start_date: string;
  end_date?: string;
  daily_time: string;
  reminder_times?: string[];
  weekdays?: number[];
  flexible: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuggestedProtocol {
  id: string;
  user_id: string;
  pet_id?: string;
  title: string;
  description?: string;
  reason: string;
  source: string;
  confidence_score: number;
  estimated_success: number;
  similar_cases: number;
  category: string;
  difficulty: string;
  duration_days: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  integration_data: any;
  auto_generated: boolean;
  accepted: boolean;
  dismissed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  duration_days: number;
  popularity_score: number;
  success_rate: number;
  template_data: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_description: string | null
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          pet_id: string | null
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          pet_id?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          pet_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          category: string
          cost: number | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          is_all_day: boolean | null
          location: string | null
          notes: string | null
          pet_id: string
          photo_urls: string[] | null
          recurring_pattern: Json | null
          reminder_settings: Json | null
          start_time: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          category?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          notes?: string | null
          pet_id: string
          photo_urls?: string[] | null
          recurring_pattern?: Json | null
          reminder_settings?: Json | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          category?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          notes?: string | null
          pet_id?: string
          photo_urls?: string[] | null
          recurring_pattern?: Json | null
          reminder_settings?: Json | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_channels: {
        Row: {
          breed: string | null
          channel_type: string
          country_code: string | null
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          is_active: boolean | null
          name: string
          pet_type: string | null
          updated_at: string
        }
        Insert: {
          breed?: string | null
          channel_type: string
          country_code?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pet_type?: string | null
          updated_at?: string
        }
        Update: {
          breed?: string | null
          channel_type?: string
          country_code?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pet_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          channel_id: string
          channel_name: string | null
          content: string | null
          created_at: string
          deleted_at: string | null
          file_url: string | null
          id: string
          is_emergency: boolean | null
          message_type: string
          metadata: Json | null
          updated_at: string
          user_id: string
          voice_duration: number | null
        }
        Insert: {
          channel_id: string
          channel_name?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          file_url?: string | null
          id?: string
          is_emergency?: boolean | null
          message_type?: string
          metadata?: Json | null
          updated_at?: string
          user_id: string
          voice_duration?: number | null
        }
        Update: {
          channel_id?: string
          channel_name?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          file_url?: string | null
          id?: string
          is_emergency?: boolean | null
          message_type?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
          voice_duration?: number | null
        }
        Relationships: []
      }
      community_notifications: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message_id: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_id: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_notifications_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_notifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_entries: {
        Row: {
          behavioral_tags: string[] | null
          content: string | null
          created_at: string
          entry_date: string
          id: string
          mood_score: number | null
          pet_id: string
          photo_urls: string[] | null
          temperature: number | null
          title: string | null
          updated_at: string
          user_id: string
          voice_note_url: string | null
          weather_condition: string | null
        }
        Insert: {
          behavioral_tags?: string[] | null
          content?: string | null
          created_at?: string
          entry_date: string
          id?: string
          mood_score?: number | null
          pet_id: string
          photo_urls?: string[] | null
          temperature?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
          voice_note_url?: string | null
          weather_condition?: string | null
        }
        Update: {
          behavioral_tags?: string[] | null
          content?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          mood_score?: number | null
          pet_id?: string
          photo_urls?: string[] | null
          temperature?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
          voice_note_url?: string | null
          weather_condition?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          address: string | null
          contact_type: string | null
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          notes: string | null
          phone: string
          relationship: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          notes?: string | null
          phone: string
          relationship?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          phone?: string
          relationship?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_notifications: {
        Row: {
          created_at: string
          event_id: string
          id: string
          notification_type: string
          scheduled_for: string
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          notification_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          notification_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      event_templates: {
        Row: {
          category: string
          created_at: string
          default_duration: unknown | null
          default_reminder_settings: Json | null
          id: string
          name: string
          template_data: Json | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          default_duration?: unknown | null
          default_reminder_settings?: Json | null
          id?: string
          name: string
          template_data?: Json | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          default_duration?: unknown | null
          default_reminder_settings?: Json | null
          id?: string
          name?: string
          template_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      feature_request_comments: {
        Row: {
          content: string
          created_at: string | null
          feature_request_id: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          feature_request_id: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          feature_request_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_request_comments_feature_request_id_fkey"
            columns: ["feature_request_id"]
            isOneToOne: false
            referencedRelation: "support_feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_request_votes: {
        Row: {
          created_at: string | null
          feature_request_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_request_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_request_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_request_votes_feature_request_id_fkey"
            columns: ["feature_request_id"]
            isOneToOne: false
            referencedRelation: "support_feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      health_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          pet_id: string
          resolved_at: string | null
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          pet_id: string
          resolved_at?: string | null
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          pet_id?: string
          resolved_at?: string | null
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          created_at: string
          id: string
          metric_type: string
          notes: string | null
          pet_id: string
          recorded_at: string
          unit: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metric_type: string
          notes?: string | null
          pet_id: string
          recorded_at: string
          unit?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metric_type?: string
          notes?: string | null
          pet_id?: string
          recorded_at?: string
          unit?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          color: string
          created_at: string
          description: string
          estimated_time_minutes: number
          icon_name: string
          id: string
          is_active: boolean
          level: string
          sort_order: number
          title: string
          total_lessons: number
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          description: string
          estimated_time_minutes?: number
          icon_name: string
          id?: string
          is_active?: boolean
          level: string
          sort_order?: number
          title: string
          total_lessons?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          estimated_time_minutes?: number
          icon_name?: string
          id?: string
          is_active?: boolean
          level?: string
          sort_order?: number
          title?: string
          total_lessons?: number
          updated_at?: string
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          learning_path_id: string
          lesson_id: string
          notes: string | null
          score: number | null
          time_spent_minutes: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          learning_path_id: string
          lesson_id: string
          notes?: string | null
          score?: number | null
          time_spent_minutes?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          learning_path_id?: string
          lesson_id?: string
          notes?: string | null
          score?: number | null
          time_spent_minutes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_required: boolean
          learning_path_id: string
          lesson_type: string
          prerequisites: Json | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_required?: boolean
          learning_path_id: string
          lesson_type: string
          prerequisites?: Json | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_required?: boolean
          learning_path_id?: string
          lesson_type?: string
          prerequisites?: Json | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      local_alerts: {
        Row: {
          affected_species: string[] | null
          alert_type: string
          country_code: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          reports_count: number | null
          severity: string
          title: string
          updated_at: string
          user_id: string
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          affected_species?: string[] | null
          alert_type: string
          country_code: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          reports_count?: number | null
          severity?: string
          title: string
          updated_at?: string
          user_id: string
          verification_status?: string
          verified_by?: string | null
        }
        Update: {
          affected_species?: string[] | null
          alert_type?: string
          country_code?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          reports_count?: number | null
          severity?: string
          title?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          cost: number | null
          created_at: string
          description: string | null
          document_url: string | null
          id: string
          metadata: Json | null
          notes: string | null
          pet_id: string
          record_date: string
          record_type: string
          title: string
          updated_at: string
          user_id: string
          veterinarian_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          pet_id: string
          record_date: string
          record_type: string
          title: string
          updated_at?: string
          user_id: string
          veterinarian_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          pet_id?: string
          record_date?: string
          record_type?: string
          title?: string
          updated_at?: string
          user_id?: string
          veterinarian_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_medical_records_veterinarian"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          administration_method: string | null
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          pet_id: string
          prescribing_vet: string | null
          reminder_enabled: boolean | null
          side_effects: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          administration_method?: string | null
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          pet_id: string
          prescribing_vet?: string | null
          reminder_enabled?: boolean | null
          side_effects?: string | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          administration_method?: string | null
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          pet_id?: string
          prescribing_vet?: string | null
          reminder_enabled?: boolean | null
          side_effects?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_medications_prescribing_vet"
            columns: ["prescribing_vet"]
            isOneToOne: false
            referencedRelation: "veterinarians"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_analyses: {
        Row: {
          analysis_duration: unknown | null
          behavioral_insights: string | null
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          pet_id: string
          primary_confidence: number
          primary_emotion: string
          recommendations: string[] | null
          secondary_emotions: Json | null
          storage_path: string
          triggers: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_duration?: unknown | null
          behavioral_insights?: string | null
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          pet_id: string
          primary_confidence: number
          primary_emotion: string
          recommendations?: string[] | null
          secondary_emotions?: Json | null
          storage_path: string
          triggers?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_duration?: unknown | null
          behavioral_insights?: string | null
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          pet_id?: string
          primary_confidence?: number
          primary_emotion?: string
          recommendations?: string[] | null
          secondary_emotions?: Json | null
          storage_path?: string
          triggers?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pet_insurance: {
        Row: {
          contact_info: Json | null
          coverage_details: Json | null
          created_at: string
          deductible: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          pet_id: string
          policy_number: string
          policy_type: string | null
          premium_amount: number | null
          provider_name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_info?: Json | null
          coverage_details?: Json | null
          created_at?: string
          deductible?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          pet_id: string
          policy_number: string
          policy_type?: string | null
          premium_amount?: number | null
          provider_name: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_info?: Json | null
          coverage_details?: Json | null
          created_at?: string
          deductible?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          pet_id?: string
          policy_number?: string
          policy_type?: string | null
          premium_amount?: number | null
          provider_name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pet_wellness_scores: {
        Row: {
          created_at: string
          factors: Json | null
          id: string
          pet_id: string
          score_date: string
          updated_at: string
          user_id: string
          wellness_score: number | null
        }
        Insert: {
          created_at?: string
          factors?: Json | null
          id?: string
          pet_id: string
          score_date: string
          updated_at?: string
          user_id: string
          wellness_score?: number | null
        }
        Update: {
          created_at?: string
          factors?: Json | null
          id?: string
          pet_id?: string
          score_date?: string
          updated_at?: string
          user_id?: string
          wellness_score?: number | null
        }
        Relationships: []
      }
      pets: {
        Row: {
          age: number | null
          allergies: string | null
          avatar_url: string | null
          birth_date: string | null
          breed: string | null
          created_at: string
          description: string | null
          favorite_activities: string | null
          fears: string | null
          health_conditions: string | null
          id: string
          is_active: boolean | null
          name: string
          personality_traits: string | null
          type: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          description?: string | null
          favorite_activities?: string | null
          fears?: string | null
          health_conditions?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          personality_traits?: string | null
          type: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          description?: string | null
          favorite_activities?: string | null
          fears?: string | null
          health_conditions?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          personality_traits?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          language: string | null
          location: string | null
          notifications_enabled: boolean | null
          postal_code: string | null
          province: string | null
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          street_name: string | null
          street_number: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          location?: string | null
          notifications_enabled?: boolean | null
          postal_code?: string | null
          province?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          street_name?: string | null
          street_number?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          location?: string | null
          notifications_enabled?: boolean | null
          postal_code?: string | null
          province?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          street_name?: string | null
          street_number?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_commissions: {
        Row: {
          amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          commission_rate: number
          commission_type: string
          created_at: string | null
          id: string
          is_cancelled: boolean | null
          is_historical: boolean | null
          referred_email: string | null
          referred_user_id: string | null
          referrer_email: string | null
          referrer_id: string | null
          status: string
          subscription_amount: number
          tier: string
        }
        Insert: {
          amount: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          commission_rate: number
          commission_type: string
          created_at?: string | null
          id?: string
          is_cancelled?: boolean | null
          is_historical?: boolean | null
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_email?: string | null
          referrer_id?: string | null
          status?: string
          subscription_amount: number
          tier: string
        }
        Update: {
          amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          commission_rate?: number
          commission_type?: string
          created_at?: string | null
          id?: string
          is_cancelled?: boolean | null
          is_historical?: boolean | null
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_email?: string | null
          referrer_id?: string | null
          status?: string
          subscription_amount?: number
          tier?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string
          is_active: boolean
          is_historical: boolean | null
          referral_code: string
          referred_email: string
          referred_user_id: string | null
          referrer_email: string | null
          referrer_id: string | null
          registered_at: string | null
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_historical?: boolean | null
          referral_code: string
          referred_email: string
          referred_user_id?: string | null
          referrer_email?: string | null
          referrer_id?: string | null
          registered_at?: string | null
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_historical?: boolean | null
          referral_code?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_email?: string | null
          referrer_id?: string | null
          registered_at?: string | null
          status?: string
        }
        Relationships: []
      }
      referrer_stats: {
        Row: {
          available_credits: number | null
          current_tier: string | null
          referral_code: string
          tier_progress: number | null
          total_conversions: number | null
          total_credits_earned: number | null
          total_registrations: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_credits?: number | null
          current_tier?: string | null
          referral_code: string
          tier_progress?: number | null
          total_conversions?: number | null
          total_credits_earned?: number | null
          total_registrations?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_credits?: number | null
          current_tier?: string | null
          referral_code?: string
          tier_progress?: number | null
          total_conversions?: number | null
          total_credits_earned?: number | null
          total_registrations?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sharing_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          template_name: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          template_name: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          template_name?: string
          variables?: Json | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          can_reactivate: boolean | null
          cancellation_date: string | null
          cancellation_effective_date: string | null
          cancellation_type: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          email: string | null
          id: string
          immediate_cancellation_after_period_end: boolean | null
          is_cancelled: boolean | null
          max_pets_allowed: number | null
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_plan: string
          subscription_start_date: string | null
          subscription_status: string
          trial_used: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_reactivate?: boolean | null
          cancellation_date?: string | null
          cancellation_effective_date?: string | null
          cancellation_type?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string | null
          id?: string
          immediate_cancellation_after_period_end?: boolean | null
          is_cancelled?: boolean | null
          max_pets_allowed?: number | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string
          subscription_start_date?: string | null
          subscription_status?: string
          trial_used?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_reactivate?: boolean | null
          cancellation_date?: string | null
          cancellation_effective_date?: string | null
          cancellation_type?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string | null
          id?: string
          immediate_cancellation_after_period_end?: boolean | null
          is_cancelled?: boolean | null
          max_pets_allowed?: number | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string
          subscription_start_date?: string | null
          subscription_status?: string
          trial_used?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_agents: {
        Row: {
          created_at: string
          current_ticket_count: number | null
          email: string
          id: string
          is_active: boolean | null
          max_concurrent_tickets: number | null
          name: string
          specializations: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_ticket_count?: number | null
          email: string
          id?: string
          is_active?: boolean | null
          max_concurrent_tickets?: number | null
          name: string
          specializations?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_ticket_count?: number | null
          email?: string
          id?: string
          is_active?: boolean | null
          max_concurrent_tickets?: number | null
          name?: string
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string | null
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          message_id?: string | null
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string | null
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "support_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_faq: {
        Row: {
          answer: string
          category: string
          created_at: string
          helpful_count: number | null
          id: string
          is_published: boolean | null
          not_helpful_count: number | null
          question: string
          sort_order: number | null
          tags: string[] | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          question: string
          sort_order?: number | null
          tags?: string[] | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          question?: string
          sort_order?: number | null
          tags?: string[] | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      support_feature_requests: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
          votes: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          votes?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          votes?: number | null
        }
        Relationships: []
      }
      support_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          feedback_type: string
          id: string
          improvement_suggestions: string | null
          metadata: Json | null
          rating: number
          ticket_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          feedback_type: string
          id?: string
          improvement_suggestions?: string | null
          metadata?: Json | null
          rating: number
          ticket_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          improvement_suggestions?: string | null
          metadata?: Json | null
          rating?: number
          ticket_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_feedback_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string
          helpful_count: number | null
          id: string
          is_published: boolean | null
          last_updated_by: string
          not_helpful_count: number | null
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by: string
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          last_updated_by: string
          not_helpful_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          last_updated_by?: string
          not_helpful_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          is_internal: boolean | null
          message_type: string
          metadata: Json | null
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message_type?: string
          metadata?: Json | null
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message_type?: string
          metadata?: Json | null
          sender_id?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_performance_metrics: {
        Row: {
          avg_resolution_time_hours: number | null
          avg_response_time_minutes: number | null
          created_at: string
          customer_satisfaction_avg: number | null
          date: string
          escalation_count: number | null
          first_contact_resolution_rate: number | null
          id: string
          resolved_tickets: number | null
          total_tickets: number | null
        }
        Insert: {
          avg_resolution_time_hours?: number | null
          avg_response_time_minutes?: number | null
          created_at?: string
          customer_satisfaction_avg?: number | null
          date: string
          escalation_count?: number | null
          first_contact_resolution_rate?: number | null
          id?: string
          resolved_tickets?: number | null
          total_tickets?: number | null
        }
        Update: {
          avg_resolution_time_hours?: number | null
          avg_response_time_minutes?: number | null
          created_at?: string
          customer_satisfaction_avg?: number | null
          date?: string
          escalation_count?: number | null
          first_contact_resolution_rate?: number | null
          id?: string
          resolved_tickets?: number | null
          total_tickets?: number | null
        }
        Relationships: []
      }
      support_sla_config: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean | null
          priority: string
          resolution_time_hours: number
          response_time_minutes: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          priority: string
          resolution_time_hours: number
          response_time_minutes: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          priority?: string
          resolution_time_hours?: number
          response_time_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_agent_id: string | null
          category: string
          closed_at: string | null
          created_at: string
          customer_satisfaction_rating: number | null
          description: string
          escalation_count: number | null
          first_response_at: string | null
          id: string
          metadata: Json | null
          priority: string
          resolved_at: string | null
          satisfaction_feedback: string | null
          sla_deadline: string | null
          status: string
          subject: string
          tags: string[] | null
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_agent_id?: string | null
          category: string
          closed_at?: string | null
          created_at?: string
          customer_satisfaction_rating?: number | null
          description: string
          escalation_count?: number | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          sla_deadline?: string | null
          status?: string
          subject: string
          tags?: string[] | null
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_agent_id?: string | null
          category?: string
          closed_at?: string | null
          created_at?: string
          customer_satisfaction_rating?: number | null
          description?: string
          escalation_count?: number | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          sla_deadline?: string | null
          status?: string
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          observed_at: string
          pet_id: string
          related_medication_id: string | null
          resolved_at: string | null
          severity: number
          symptom_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          observed_at: string
          pet_id: string
          related_medication_id?: string | null
          resolved_at?: string | null
          severity: number
          symptom_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          observed_at?: string
          pet_id?: string
          related_medication_id?: string | null
          resolved_at?: string | null
          severity?: number
          symptom_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_symptoms_related_medication"
            columns: ["related_medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_channel_subscriptions: {
        Row: {
          channel_id: string | null
          channel_name: string | null
          id: string
          joined_at: string
          notifications_enabled: boolean | null
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          channel_name?: string | null
          id?: string
          joined_at?: string
          notifications_enabled?: boolean | null
          user_id: string
        }
        Update: {
          channel_id?: string | null
          channel_name?: string | null
          id?: string
          joined_at?: string
          notifications_enabled?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_learning_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_lesson_id: string | null
          id: string
          is_completed: boolean
          last_accessed_at: string
          learning_path_id: string
          progress_percentage: number
          started_at: string
          total_time_spent_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_lesson_id?: string | null
          id?: string
          is_completed?: boolean
          last_accessed_at?: string
          learning_path_id: string
          progress_percentage?: number
          started_at?: string
          total_time_spent_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_lesson_id?: string | null
          id?: string
          is_completed?: boolean
          last_accessed_at?: string
          learning_path_id?: string
          progress_percentage?: number
          started_at?: string
          total_time_spent_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_current_lesson_id_fkey"
            columns: ["current_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_progress_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          completed_date: string | null
          created_at: string
          current_step: number
          id: string
          onboarding_completed: boolean
          plan_type: string
          skipped_steps: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          current_step?: number
          id?: string
          onboarding_completed?: boolean
          plan_type: string
          skipped_steps?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          current_step?: number
          id?: string
          onboarding_completed?: boolean
          plan_type?: string
          skipped_steps?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      veterinarians: {
        Row: {
          address: string | null
          clinic_name: string | null
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          specialization: string | null
          updated_at: string
          user_id: string
          vet_type: string | null
        }
        Insert: {
          address?: string | null
          clinic_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
          vet_type?: string | null
        }
        Update: {
          address?: string | null
          clinic_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
          vet_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_referral_tier: {
        Args: { converted_count: number }
        Returns: Json
      }
      calculate_sla_deadline: {
        Args: { category: string; priority: string }
        Returns: string
      }
      cancel_user_subscription: {
        Args: { p_user_id: string; p_immediate?: boolean }
        Returns: boolean
      }
      check_email_exists: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      convert_referral: {
        Args: { p_user_id: string; p_email: string }
        Returns: Json
      }
      convert_referral_on_payment: {
        Args: { user_email: string }
        Returns: Json
      }
      delete_user_account: {
        Args: Record<PropertyKey, never> | { user_id_to_delete: string }
        Returns: undefined
      }
      force_convert_all_now: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never> | { user_email: string }
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_tier_info: {
        Args: { conversions: number }
        Returns: {
          tier: string
          rate: number
          min_conversions: number
          max_conversions: number
        }[]
      }
      get_user_subscription: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          subscription_plan: string
          subscription_status: string
          is_cancelled: boolean
          max_pets_allowed: number
          cancellation_effective_date: string
        }[]
      }
      process_all_payments: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_recurring_commissions: {
        Args: { p_user_id: string }
        Returns: Json
      }
      reactivate_user_subscription: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      register_referral: {
        Args: {
          p_referrer_id: string
          p_referred_email: string
          p_referral_code: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

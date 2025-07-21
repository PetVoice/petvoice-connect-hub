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
      ai_insights_notifications: {
        Row: {
          action_data: Json | null
          action_required: boolean | null
          created_at: string
          dismissed_at: string | null
          expires_at: string | null
          id: string
          insight_type: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          priority: string
          read_at: string | null
          related_id: string
          title: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_required?: boolean | null
          created_at?: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          priority?: string
          read_at?: string | null
          related_id: string
          title: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_required?: boolean | null
          created_at?: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          priority?: string
          read_at?: string | null
          related_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_suggested_protocols: {
        Row: {
          accepted: boolean | null
          auto_generated: boolean | null
          category: string
          confidence_score: number
          created_at: string | null
          description: string | null
          difficulty: string
          dismissed: boolean | null
          duration_days: number
          estimated_success: number | null
          id: string
          integration_data: Json | null
          pet_id: string | null
          reason: string
          similar_cases: number | null
          source: string
          title: string
          updated_at: string | null
          urgency: string
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          auto_generated?: boolean | null
          category: string
          confidence_score: number
          created_at?: string | null
          description?: string | null
          difficulty: string
          dismissed?: boolean | null
          duration_days: number
          estimated_success?: number | null
          id?: string
          integration_data?: Json | null
          pet_id?: string | null
          reason: string
          similar_cases?: number | null
          source: string
          title: string
          updated_at?: string | null
          urgency?: string
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          auto_generated?: boolean | null
          category?: string
          confidence_score?: number
          created_at?: string | null
          description?: string | null
          difficulty?: string
          dismissed?: boolean | null
          duration_days?: number
          estimated_success?: number | null
          id?: string
          integration_data?: Json | null
          pet_id?: string | null
          reason?: string
          similar_cases?: number | null
          source?: string
          title?: string
          updated_at?: string | null
          urgency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggested_protocols_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training_exercises: {
        Row: {
          ai_analysis: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          day_number: number
          description: string | null
          duration_minutes: number | null
          effectiveness_score: number | null
          exercise_type: string
          feedback: string | null
          id: string
          instructions: string[] | null
          materials: string[] | null
          photos: string[] | null
          protocol_id: string
          title: string
          updated_at: string | null
          video_url: string | null
          voice_notes: string[] | null
        }
        Insert: {
          ai_analysis?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          day_number: number
          description?: string | null
          duration_minutes?: number | null
          effectiveness_score?: number | null
          exercise_type?: string
          feedback?: string | null
          id?: string
          instructions?: string[] | null
          materials?: string[] | null
          photos?: string[] | null
          protocol_id: string
          title: string
          updated_at?: string | null
          video_url?: string | null
          voice_notes?: string[] | null
        }
        Update: {
          ai_analysis?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          day_number?: number
          description?: string | null
          duration_minutes?: number | null
          effectiveness_score?: number | null
          exercise_type?: string
          feedback?: string | null
          id?: string
          instructions?: string[] | null
          materials?: string[] | null
          photos?: string[] | null
          protocol_id?: string
          title?: string
          updated_at?: string | null
          video_url?: string | null
          voice_notes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_exercises_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "ai_training_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training_metrics: {
        Row: {
          behavior_improvement: number | null
          community_success: number | null
          cost_effectiveness: number | null
          created_at: string | null
          engagement_level: number | null
          id: string
          owner_satisfaction: number | null
          protocol_id: string
          recorded_at: string | null
          stress_reduction: number | null
          time_efficiency: number | null
        }
        Insert: {
          behavior_improvement?: number | null
          community_success?: number | null
          cost_effectiveness?: number | null
          created_at?: string | null
          engagement_level?: number | null
          id?: string
          owner_satisfaction?: number | null
          protocol_id: string
          recorded_at?: string | null
          stress_reduction?: number | null
          time_efficiency?: number | null
        }
        Update: {
          behavior_improvement?: number | null
          community_success?: number | null
          cost_effectiveness?: number | null
          created_at?: string | null
          engagement_level?: number | null
          id?: string
          owner_satisfaction?: number | null
          protocol_id?: string
          recorded_at?: string | null
          stress_reduction?: number | null
          time_efficiency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_metrics_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "ai_training_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training_protocols: {
        Row: {
          ai_generated: boolean | null
          category: string
          community_rating: number | null
          community_usage: number | null
          created_at: string | null
          current_day: number | null
          description: string | null
          difficulty: string
          duration_days: number
          estimated_cost: number | null
          id: string
          integration_source: string | null
          is_public: boolean | null
          last_activity_at: string | null
          mentor_recommended: boolean | null
          notifications_enabled: boolean | null
          pet_id: string | null
          progress_percentage: number | null
          required_materials: string[] | null
          share_code: string | null
          status: string
          success_rate: number | null
          target_behavior: string | null
          title: string
          triggers: string[] | null
          updated_at: string | null
          user_id: string | null
          veterinary_approved: boolean | null
        }
        Insert: {
          ai_generated?: boolean | null
          category?: string
          community_rating?: number | null
          community_usage?: number | null
          created_at?: string | null
          current_day?: number | null
          description?: string | null
          difficulty?: string
          duration_days?: number
          estimated_cost?: number | null
          id?: string
          integration_source?: string | null
          is_public?: boolean | null
          last_activity_at?: string | null
          mentor_recommended?: boolean | null
          notifications_enabled?: boolean | null
          pet_id?: string | null
          progress_percentage?: number | null
          required_materials?: string[] | null
          share_code?: string | null
          status?: string
          success_rate?: number | null
          target_behavior?: string | null
          title: string
          triggers?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          veterinary_approved?: boolean | null
        }
        Update: {
          ai_generated?: boolean | null
          category?: string
          community_rating?: number | null
          community_usage?: number | null
          created_at?: string | null
          current_day?: number | null
          description?: string | null
          difficulty?: string
          duration_days?: number
          estimated_cost?: number | null
          id?: string
          integration_source?: string | null
          is_public?: boolean | null
          last_activity_at?: string | null
          mentor_recommended?: boolean | null
          notifications_enabled?: boolean | null
          pet_id?: string | null
          progress_percentage?: number | null
          required_materials?: string[] | null
          share_code?: string | null
          status?: string
          success_rate?: number | null
          target_behavior?: string | null
          title?: string
          triggers?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          veterinary_approved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_protocols_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training_schedules: {
        Row: {
          created_at: string | null
          daily_time: string | null
          end_date: string | null
          flexible: boolean | null
          id: string
          protocol_id: string
          reminder_times: string[] | null
          start_date: string
          updated_at: string | null
          weekdays: number[] | null
        }
        Insert: {
          created_at?: string | null
          daily_time?: string | null
          end_date?: string | null
          flexible?: boolean | null
          id?: string
          protocol_id: string
          reminder_times?: string[] | null
          start_date: string
          updated_at?: string | null
          weekdays?: number[] | null
        }
        Update: {
          created_at?: string | null
          daily_time?: string | null
          end_date?: string | null
          flexible?: boolean | null
          id?: string
          protocol_id?: string
          reminder_times?: string[] | null
          start_date?: string
          updated_at?: string | null
          weekdays?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_schedules_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "ai_training_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty: string
          duration_days: number
          id: string
          is_active: boolean | null
          name: string
          popularity_score: number | null
          success_rate: number | null
          template_data: Json
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration_days: number
          id?: string
          is_active?: boolean | null
          name: string
          popularity_score?: number | null
          success_rate?: number | null
          template_data?: Json
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_days?: number
          id?: string
          is_active?: boolean | null
          name?: string
          popularity_score?: number | null
          success_rate?: number | null
          template_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      anonymous_benchmarks: {
        Row: {
          age_range: string | null
          benchmark_type: string
          created_at: string
          data_period: string
          id: string
          last_updated: string
          metadata: Json | null
          metric_name: string
          percentile_data: Json
          region_code: string | null
          sample_size: number
          species: string
        }
        Insert: {
          age_range?: string | null
          benchmark_type: string
          created_at?: string
          data_period: string
          id?: string
          last_updated?: string
          metadata?: Json | null
          metric_name: string
          percentile_data: Json
          region_code?: string | null
          sample_size: number
          species: string
        }
        Update: {
          age_range?: string | null
          benchmark_type?: string
          created_at?: string
          data_period?: string
          id?: string
          last_updated?: string
          metadata?: Json | null
          metric_name?: string
          percentile_data?: Json
          region_code?: string | null
          sample_size?: number
          species?: string
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
      community_anomalies: {
        Row: {
          affected_species: string[]
          anomaly_data: Json
          anomaly_type: string
          community_reports: number
          confidence_score: number
          created_at: string
          detection_method: string
          expert_validation: string | null
          geographic_distribution: Json | null
          id: string
          potential_causes: string[] | null
          recommended_actions: Json | null
          resolution_status: string | null
          severity: string
          temporal_pattern: Json | null
          updated_at: string
        }
        Insert: {
          affected_species?: string[]
          anomaly_data: Json
          anomaly_type: string
          community_reports?: number
          confidence_score: number
          created_at?: string
          detection_method: string
          expert_validation?: string | null
          geographic_distribution?: Json | null
          id?: string
          potential_causes?: string[] | null
          recommended_actions?: Json | null
          resolution_status?: string | null
          severity: string
          temporal_pattern?: Json | null
          updated_at?: string
        }
        Update: {
          affected_species?: string[]
          anomaly_data?: Json
          anomaly_type?: string
          community_reports?: number
          confidence_score?: number
          created_at?: string
          detection_method?: string
          expert_validation?: string | null
          geographic_distribution?: Json | null
          id?: string
          potential_causes?: string[] | null
          recommended_actions?: Json | null
          resolution_status?: string | null
          severity?: string
          temporal_pattern?: Json | null
          updated_at?: string
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
          reply_to_id: string | null
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
          reply_to_id?: string | null
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
          reply_to_id?: string | null
          updated_at?: string
          user_id?: string
          voice_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
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
      community_patterns: {
        Row: {
          confidence_score: number
          created_at: string
          description: string | null
          discovery_date: string
          id: string
          impact_level: string
          metadata: Json | null
          pattern_data: Json
          pattern_type: string
          sample_size: number
          species_affected: string[]
          updated_at: string
          validation_count: number
          validation_status: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          description?: string | null
          discovery_date?: string
          id?: string
          impact_level?: string
          metadata?: Json | null
          pattern_data: Json
          pattern_type: string
          sample_size?: number
          species_affected?: string[]
          updated_at?: string
          validation_count?: number
          validation_status?: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          description?: string | null
          discovery_date?: string
          id?: string
          impact_level?: string
          metadata?: Json | null
          pattern_data?: Json
          pattern_type?: string
          sample_size?: number
          species_affected?: string[]
          updated_at?: string
          validation_count?: number
          validation_status?: string
        }
        Relationships: []
      }
      community_trends: {
        Row: {
          age_groups_affected: string[] | null
          category: string
          created_at: string
          duration_days: number
          geographic_scope: string[] | null
          id: string
          peak_period: string | null
          predictions: Json | null
          related_events: Json | null
          species_affected: string[]
          statistical_significance: number | null
          trend_data: Json
          trend_strength: number
          trend_type: string
          updated_at: string
        }
        Insert: {
          age_groups_affected?: string[] | null
          category: string
          created_at?: string
          duration_days: number
          geographic_scope?: string[] | null
          id?: string
          peak_period?: string | null
          predictions?: Json | null
          related_events?: Json | null
          species_affected?: string[]
          statistical_significance?: number | null
          trend_data: Json
          trend_strength: number
          trend_type: string
          updated_at?: string
        }
        Update: {
          age_groups_affected?: string[] | null
          category?: string
          created_at?: string
          duration_days?: number
          geographic_scope?: string[] | null
          id?: string
          peak_period?: string | null
          predictions?: Json | null
          related_events?: Json | null
          species_affected?: string[]
          statistical_significance?: number | null
          trend_data?: Json
          trend_strength?: number
          trend_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cross_species_insights: {
        Row: {
          applicability_score: number
          community_votes: number
          created_at: string
          evidence_strength: string
          expert_validated: boolean | null
          id: string
          insight_data: Json
          insight_type: string
          related_patterns: string[] | null
          source_species: string
          target_species: string
          updated_at: string
        }
        Insert: {
          applicability_score: number
          community_votes?: number
          created_at?: string
          evidence_strength: string
          expert_validated?: boolean | null
          id?: string
          insight_data: Json
          insight_type: string
          related_patterns?: string[] | null
          source_species: string
          target_species: string
          updated_at?: string
        }
        Update: {
          applicability_score?: number
          community_votes?: number
          created_at?: string
          evidence_strength?: string
          expert_validated?: boolean | null
          id?: string
          insight_data?: Json
          insight_type?: string
          related_patterns?: string[] | null
          source_species?: string
          target_species?: string
          updated_at?: string
        }
        Relationships: []
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
      health_data_sync: {
        Row: {
          created_at: string
          data_type: string
          data_value: Json | null
          external_data_id: string | null
          id: string
          integration_id: string
          last_synced_at: string | null
          pet_id: string
          recorded_at: string | null
          sync_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data_type: string
          data_value?: Json | null
          external_data_id?: string | null
          id?: string
          integration_id: string
          last_synced_at?: string | null
          pet_id: string
          recorded_at?: string | null
          sync_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data_type?: string
          data_value?: Json | null
          external_data_id?: string | null
          id?: string
          integration_id?: string
          last_synced_at?: string | null
          pet_id?: string
          recorded_at?: string | null
          sync_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_data_sync_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "user_integrations"
            referencedColumns: ["id"]
          },
        ]
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
      message_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          message_id: string
          reason: string
          reported_user_id: string
          reporter_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          message_id: string
          reason: string
          reported_user_id: string
          reporter_user_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          message_id?: string
          reason?: string
          reported_user_id?: string
          reporter_user_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      model_improvements: {
        Row: {
          affected_users_count: number | null
          after_metrics: Json
          before_metrics: Json
          created_at: string
          deployment_date: string | null
          id: string
          improvement_percentage: number | null
          improvement_type: string
          model_component: string
          performance_impact: Json | null
          rollout_status: string | null
          technical_details: Json | null
          updated_at: string
          user_feedback_summary: Json | null
        }
        Insert: {
          affected_users_count?: number | null
          after_metrics: Json
          before_metrics: Json
          created_at?: string
          deployment_date?: string | null
          id?: string
          improvement_percentage?: number | null
          improvement_type: string
          model_component: string
          performance_impact?: Json | null
          rollout_status?: string | null
          technical_details?: Json | null
          updated_at?: string
          user_feedback_summary?: Json | null
        }
        Update: {
          affected_users_count?: number | null
          after_metrics?: Json
          before_metrics?: Json
          created_at?: string
          deployment_date?: string | null
          id?: string
          improvement_percentage?: number | null
          improvement_type?: string
          model_component?: string
          performance_impact?: Json | null
          rollout_status?: string | null
          technical_details?: Json | null
          updated_at?: string
          user_feedback_summary?: Json | null
        }
        Relationships: []
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
      private_chats: {
        Row: {
          created_at: string
          id: string
          initiated_by: string
          is_active: boolean | null
          last_message_at: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiated_by: string
          is_active?: boolean | null
          last_message_at?: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          initiated_by?: string
          is_active?: boolean | null
          last_message_at?: string | null
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          chat_id: string | null
          content: string | null
          created_at: string
          deleted_by_recipient: boolean | null
          deleted_by_sender: boolean | null
          file_url: string | null
          id: string
          is_read: boolean | null
          message_type: string
          metadata: Json | null
          recipient_id: string
          reply_to_id: string | null
          sender_id: string
          updated_at: string
          voice_duration: number | null
        }
        Insert: {
          chat_id?: string | null
          content?: string | null
          created_at?: string
          deleted_by_recipient?: boolean | null
          deleted_by_sender?: boolean | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string
          metadata?: Json | null
          recipient_id: string
          reply_to_id?: string | null
          sender_id: string
          updated_at?: string
          voice_duration?: number | null
        }
        Update: {
          chat_id?: string | null
          content?: string | null
          created_at?: string
          deleted_by_recipient?: boolean | null
          deleted_by_sender?: boolean | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string
          metadata?: Json | null
          recipient_id?: string
          reply_to_id?: string | null
          sender_id?: string
          updated_at?: string
          voice_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "private_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "private_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "private_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          analytics_contribution: boolean | null
          avatar_url: string | null
          city: string | null
          community_participation: boolean | null
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          language: string | null
          location: string | null
          marketing_communications: boolean | null
          notifications_enabled: boolean | null
          postal_code: string | null
          province: string | null
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          street_name: string | null
          street_number: string | null
          theme: string | null
          third_party_sharing: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_contribution?: boolean | null
          avatar_url?: string | null
          city?: string | null
          community_participation?: boolean | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          location?: string | null
          marketing_communications?: boolean | null
          notifications_enabled?: boolean | null
          postal_code?: string | null
          province?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          street_name?: string | null
          street_number?: string | null
          theme?: string | null
          third_party_sharing?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_contribution?: boolean | null
          avatar_url?: string | null
          city?: string | null
          community_participation?: boolean | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          location?: string | null
          marketing_communications?: boolean | null
          notifications_enabled?: boolean | null
          postal_code?: string | null
          province?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          street_name?: string | null
          street_number?: string | null
          theme?: string | null
          third_party_sharing?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      protocol_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          protocol_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          protocol_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          protocol_id?: string
          rating?: number
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
      synced_calendar_events: {
        Row: {
          calendar_event_id: string | null
          created_at: string
          external_event_id: string
          id: string
          integration_id: string
          last_synced_at: string | null
          sync_status: string | null
          user_id: string
        }
        Insert: {
          calendar_event_id?: string | null
          created_at?: string
          external_event_id: string
          id?: string
          integration_id: string
          last_synced_at?: string | null
          sync_status?: string | null
          user_id: string
        }
        Update: {
          calendar_event_id?: string | null
          created_at?: string
          external_event_id?: string
          id?: string
          integration_id?: string
          last_synced_at?: string | null
          sync_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "synced_calendar_events_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "synced_calendar_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "user_integrations"
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
      user_display_names: {
        Row: {
          avatar_url: string | null
          display_name: string
          is_online: boolean | null
          last_seen: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          display_name: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          display_name?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          integration_type: string
          is_active: boolean | null
          provider: string
          refresh_token: string | null
          settings: Json | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean | null
          provider: string
          refresh_token?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean | null
          provider?: string
          refresh_token?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
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
      calculate_protocol_success_rate: {
        Args: { p_protocol_id: string }
        Returns: number
      }
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
      execute_affiliation_reset: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      get_protocol_ratings_count: {
        Args: { p_protocol_id: string }
        Returns: number
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
      reset_affiliation_system: {
        Args: Record<PropertyKey, never>
        Returns: Json
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

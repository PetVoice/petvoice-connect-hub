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
      challenge_participations: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          referrals_count: number | null
          reward_claimed: boolean | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          referrals_count?: number | null
          reward_claimed?: boolean | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          referrals_count?: number | null
          reward_claimed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "referral_challenges"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          display_name: string | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_analytics: {
        Row: {
          clicks: number | null
          conversions: number | null
          created_at: string
          credits_earned: number | null
          date: string
          geographic_data: Json | null
          id: string
          registrations: number | null
          top_channel: string | null
          user_id: string
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          credits_earned?: number | null
          date: string
          geographic_data?: Json | null
          id?: string
          registrations?: number | null
          top_channel?: string | null
          user_id: string
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          credits_earned?: number | null
          date?: string
          geographic_data?: Json | null
          id?: string
          registrations?: number | null
          top_channel?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_type: string
          earned_at: string
          icon_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string
          icon_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string
          icon_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_challenges: {
        Row: {
          challenge_name: string
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          reward_credits: number
          start_date: string
          target_referrals: number
        }
        Insert: {
          challenge_name: string
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          reward_credits: number
          start_date: string
          target_referrals: number
        }
        Update: {
          challenge_name?: string
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          reward_credits?: number
          start_date?: string
          target_referrals?: number
        }
        Relationships: []
      }
      referral_credits: {
        Row: {
          amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string
          credit_type: string
          description: string | null
          expires_at: string | null
          id: string
          redeemed_at: string | null
          referral_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          credit_type: string
          description?: string | null
          expires_at?: string | null
          id?: string
          redeemed_at?: string | null
          referral_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          credit_type?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          redeemed_at?: string | null
          referral_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_credits_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          channel: string | null
          conversion_date: string | null
          created_at: string
          credits_awarded: number | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
          referral_code: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          status: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          channel?: string | null
          conversion_date?: string | null
          created_at?: string
          credits_awarded?: number | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          referral_code: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          channel?: string | null
          conversion_date?: string | null
          created_at?: string
          credits_awarded?: number | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          referral_code?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      sharing_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          platform: string
          template_name: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform: string
          template_name: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
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
          cancellation_date: string | null
          cancellation_effective_date: string | null
          cancellation_type: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          email: string | null
          id: string
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
          cancellation_date?: string | null
          cancellation_effective_date?: string | null
          cancellation_type?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string | null
          id?: string
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
          cancellation_date?: string | null
          cancellation_effective_date?: string | null
          cancellation_type?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string | null
          id?: string
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
          id: string
          joined_at: string
          notifications_enabled: boolean | null
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          id?: string
          joined_at?: string
          notifications_enabled?: boolean | null
          user_id: string
        }
        Update: {
          channel_id?: string | null
          id?: string
          joined_at?: string
          notifications_enabled?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          consecutive_months: number | null
          created_at: string
          current_tier: string | null
          id: string
          is_leaderboard_visible: boolean | null
          referral_code: string
          successful_conversions: number | null
          total_credits_earned: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consecutive_months?: number | null
          created_at?: string
          current_tier?: string | null
          id?: string
          is_leaderboard_visible?: boolean | null
          referral_code: string
          successful_conversions?: number | null
          total_credits_earned?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consecutive_months?: number | null
          created_at?: string
          current_tier?: string | null
          id?: string
          is_leaderboard_visible?: boolean | null
          referral_code?: string
          successful_conversions?: number | null
          total_credits_earned?: number | null
          total_referrals?: number | null
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
      auto_convert_pending_referrals: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      calculate_referral_tier: {
        Args: { converted_count: number }
        Returns: Json
      }
      cancel_user_subscription: {
        Args: { p_user_id: string; p_immediate?: boolean }
        Returns: boolean
      }
      check_email_exists: {
        Args: { email_to_check: string }
        Returns: boolean
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
      reactivate_user_subscription: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      update_all_referral_stats: {
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

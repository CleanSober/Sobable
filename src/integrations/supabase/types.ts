export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          id: string
          notifications_enabled: boolean
          show_ads: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          show_ads?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          show_ads?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          completed_tasks: string[] | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_tasks?: string[] | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_tasks?: string[] | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes: number | null
          post_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes?: number | null
          post_type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          post_type?: string
          user_id?: string
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      daily_goals: {
        Row: {
          created_at: string
          date: string
          id: string
          journal_written: boolean
          meditation_done: boolean
          mood_logged: boolean
          trigger_logged: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          journal_written?: boolean
          meditation_done?: boolean
          mood_logged?: boolean
          trigger_logged?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          journal_written?: boolean
          meditation_done?: boolean
          mood_logged?: boolean
          trigger_logged?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_submissions: {
        Row: {
          category: string | null
          created_at: string
          id: string
          message: string | null
          platform: string | null
          rating: number
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string | null
          platform?: string | null
          rating: number
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string | null
          platform?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          forum_id: string
          id: string
          is_pinned: boolean
          likes: number
          reply_count: number
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          forum_id: string
          id?: string
          is_pinned?: boolean
          likes?: number
          reply_count?: number
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          forum_id?: string
          id?: string
          is_pinned?: boolean
          likes?: number
          reply_count?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          likes: number
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes?: number
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          post_count: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          post_count?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          post_count?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      friend_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invite_code: string
          invitee_email: string
          inviter_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invite_code?: string
          invitee_email: string
          inviter_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invite_code?: string
          invitee_email?: string
          inviter_id?: string
          status?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          ai_prompt: string | null
          content: string
          created_at: string
          id: string
          is_favorite: boolean | null
          mood_analysis: string | null
          mood_score: number | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_prompt?: string | null
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          mood_analysis?: string | null
          mood_score?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_prompt?: string | null
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          mood_analysis?: string | null
          mood_score?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moderation_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          moderator_id: string
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          moderator_id: string
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          moderator_id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          craving_level: number
          created_at: string | null
          date: string
          id: string
          mood: number
          note: string | null
          user_id: string
        }
        Insert: {
          craving_level: number
          created_at?: string | null
          date: string
          id?: string
          mood: number
          note?: string | null
          user_id: string
        }
        Update: {
          craving_level?: number
          created_at?: string | null
          date?: string
          id?: string
          mood?: number
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content_preview: string | null
          created_at: string
          from_user_id: string
          id: string
          is_read: boolean
          notification_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          content_preview?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          is_read?: boolean
          notification_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          content_preview?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          is_read?: boolean
          notification_type?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_matches: {
        Row: {
          created_at: string
          id: string
          match_score: number | null
          partner_id: string
          shared_goals: string[] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number | null
          partner_id: string
          shared_goals?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number | null
          partner_id?: string
          shared_goals?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_messages: {
        Row: {
          created_at: string
          id: string
          match_id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "partner_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      pathway_progress: {
        Row: {
          completed_at: string | null
          completed_tasks: string[] | null
          current_week: number
          id: string
          is_active: boolean | null
          pathway_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_tasks?: string[] | null
          current_week?: number
          id?: string
          is_active?: boolean | null
          pathway_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_tasks?: string[] | null
          current_week?: number
          id?: string
          is_active?: boolean | null
          pathway_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pathway_progress_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "recovery_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allows_multiple: boolean
          created_at: string
          ends_at: string | null
          id: string
          options: Json
          post_id: string
          question: string
        }
        Insert: {
          allows_multiple?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          options?: Json
          post_id: string
          question: string
        }
        Update: {
          allows_multiple?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          options?: Json
          post_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_insights: {
        Row: {
          confidence: number | null
          created_at: string
          description: string
          id: string
          insight_type: string
          pattern_data: Json | null
          strategies: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description: string
          id?: string
          insight_type: string
          pattern_data?: Json | null
          strategies?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string
          id?: string
          insight_type?: string
          pattern_data?: Json | null
          strategies?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      prevention_plans: {
        Row: {
          coping_strategies: string[] | null
          created_at: string | null
          emergency_contacts: Json | null
          id: string
          personal_reasons: string[] | null
          safe_activities: string[] | null
          updated_at: string | null
          user_id: string
          warning_signals: string[] | null
        }
        Insert: {
          coping_strategies?: string[] | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          personal_reasons?: string[] | null
          safe_activities?: string[] | null
          updated_at?: string | null
          user_id: string
          warning_signals?: string[] | null
        }
        Update: {
          coping_strategies?: string[] | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          personal_reasons?: string[] | null
          safe_activities?: string[] | null
          updated_at?: string | null
          user_id?: string
          warning_signals?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          daily_spending: number | null
          display_name: string | null
          emergency_contact: string | null
          id: string
          onboarding_complete: boolean | null
          personal_reminder: string | null
          sobriety_start_date: string | null
          sponsor_phone: string | null
          substances: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          daily_spending?: number | null
          display_name?: string | null
          emergency_contact?: string | null
          id?: string
          onboarding_complete?: boolean | null
          personal_reminder?: string | null
          sobriety_start_date?: string | null
          sponsor_phone?: string | null
          substances?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          daily_spending?: number | null
          display_name?: string | null
          emergency_contact?: string | null
          id?: string
          onboarding_complete?: boolean | null
          personal_reminder?: string | null
          sobriety_start_date?: string | null
          sponsor_phone?: string | null
          substances?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      recovery_pathways: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string
          duration_weeks: number
          icon: string | null
          id: string
          is_active: boolean | null
          tasks: Json
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_weeks?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          tasks?: Json
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_weeks?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          tasks?: Json
          title?: string
        }
        Relationships: []
      }
      risk_scores: {
        Row: {
          created_at: string
          factors: Json | null
          id: string
          recommendations: string[] | null
          risk_level: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          factors?: Json | null
          id?: string
          recommendations?: string[] | null
          risk_level?: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          factors?: Json | null
          id?: string
          recommendations?: string[] | null
          risk_level?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      sleep_entries: {
        Row: {
          bedtime: string
          created_at: string | null
          date: string
          hours_slept: number
          id: string
          quality: number
          user_id: string
          wake_time: string
        }
        Insert: {
          bedtime: string
          created_at?: string | null
          date: string
          hours_slept: number
          id?: string
          quality: number
          user_id: string
          wake_time: string
        }
        Update: {
          bedtime?: string
          created_at?: string | null
          date?: string
          hours_slept?: number
          id?: string
          quality?: number
          user_id?: string
          wake_time?: string
        }
        Relationships: []
      }
      streak_freezes: {
        Row: {
          created_at: string
          id: string
          protected_date: string
          streak_type: string
          used_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          protected_date: string
          streak_type?: string
          used_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          protected_date?: string
          streak_type?: string
          used_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      thread_subscriptions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_subscriptions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      trigger_entries: {
        Row: {
          coping_used: string | null
          created_at: string | null
          date: string
          emotion: string
          id: string
          intensity: number
          notes: string | null
          outcome: string | null
          situation: string
          time: string
          trigger: string
          user_id: string
        }
        Insert: {
          coping_used?: string | null
          created_at?: string | null
          date: string
          emotion: string
          id?: string
          intensity: number
          notes?: string | null
          outcome?: string | null
          situation: string
          time: string
          trigger: string
          user_id: string
        }
        Update: {
          coping_used?: string | null
          created_at?: string | null
          date?: string
          emotion?: string
          id?: string
          intensity?: number
          notes?: string | null
          outcome?: string | null
          situation?: string
          time?: string
          trigger?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          is_permanent: boolean
          reason: string
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean
          reason: string
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_karma: {
        Row: {
          helpful_votes: number
          id: string
          posts_count: number
          reactions_received: number
          replies_count: number
          total_karma: number
          updated_at: string
          user_id: string
        }
        Insert: {
          helpful_votes?: number
          id?: string
          posts_count?: number
          reactions_received?: number
          replies_count?: number
          total_karma?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          helpful_votes?: number
          id?: string
          posts_count?: number
          reactions_received?: number
          replies_count?: number
          total_karma?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          freeze_used_this_week: boolean | null
          id: string
          last_activity_date: string | null
          last_freeze_week: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          freeze_used_this_week?: boolean | null
          id?: string
          last_activity_date?: string | null
          last_freeze_week?: string | null
          longest_streak?: number
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          freeze_used_this_week?: boolean | null
          id?: string
          last_activity_date?: string | null
          last_freeze_week?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          created_at: string
          current_level: number
          daily_login_streak: number
          id: string
          last_login_date: string | null
          last_login_reward_date: string | null
          show_on_leaderboard: boolean
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          daily_login_streak?: number
          id?: string
          last_login_date?: string | null
          last_login_reward_date?: string | null
          show_on_leaderboard?: boolean
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          daily_login_streak?: number
          id?: string
          last_login_date?: string | null
          last_login_reward_date?: string | null
          show_on_leaderboard?: boolean
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          source: string
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          source: string
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      subscriptions_safe: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string | null
          plan_type: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          plan_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          plan_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_xp: {
        Args: {
          p_description?: string
          p_source: string
          p_user_id: string
          p_xp_amount: number
        }
        Returns: Json
      }
      admin_count_users: { Args: never; Returns: number }
      calculate_level_from_xp: { Args: { xp_amount: number }; Returns: number }
      can_use_streak_freeze: {
        Args: { check_streak_type?: string; check_user_id: string }
        Returns: boolean
      }
      claim_daily_login_reward: { Args: { p_user_id: string }; Returns: Json }
      count_recent_actions: {
        Args: { p_action_type: string; p_minutes?: number; p_user_id: string }
        Returns: number
      }
      find_partner_candidates: {
        Args: { p_exclude_ids: string[]; p_limit?: number; p_user_id: string }
        Returns: {
          display_name: string
          sobriety_start_date: string
          substances: string[]
          user_id: string
        }[]
      }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          sobriety_start_date: string
          user_id: string
        }[]
      }
      get_public_profiles: {
        Args: { profile_user_ids: string[] }
        Returns: {
          avatar_url: string
          display_name: string
          sobriety_start_date: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_forum_post_likes: {
        Args: { p_increment?: number; p_post_id: string }
        Returns: undefined
      }
      increment_forum_reply_count: {
        Args: { p_increment?: number; p_post_id: string }
        Returns: undefined
      }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_premium_user: { Args: { check_user_id: string }; Returns: boolean }
      is_user_blocked: {
        Args: { blocked_uuid: string; blocker_uuid: string }
        Returns: boolean
      }
      use_streak_freeze: {
        Args: {
          p_protected_date?: string
          p_streak_type?: string
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

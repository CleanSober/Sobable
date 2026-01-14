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
      forum_posts: {
        Row: {
          content: string
          created_at: string
          forum_id: string
          id: string
          likes: number
          reply_count: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          forum_id: string
          id?: string
          likes?: number
          reply_count?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          forum_id?: string
          id?: string
          likes?: number
          reply_count?: number
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
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_premium_user: { Args: { check_user_id: string }; Returns: boolean }
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

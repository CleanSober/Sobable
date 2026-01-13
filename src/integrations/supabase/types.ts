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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

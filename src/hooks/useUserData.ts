import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  sobriety_start_date: string | null;
  substances: string[] | null;
  daily_spending: number | null;
  sponsor_phone: string | null;
  emergency_contact: string | null;
  personal_reminder: string | null;
  onboarding_complete: boolean;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;
      await fetchProfile();
      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { error: error as Error };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, loading, updateProfile, refetch: fetchProfile };
};

export const useMoodEntries = () => {
  const { user } = useAuth();

  const getMoodEntries = async () => {
    if (!user) return [];
    const { data } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    return data || [];
  };

  const saveMoodEntry = async (entry: { date: string; mood: number; craving_level: number; note?: string }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("mood_entries")
      .upsert({ ...entry, user_id: user.id }, { onConflict: "user_id,date" });

    return { error };
  };

  const getTodaysMoodEntry = async () => {
    if (!user) return null;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();
    return data;
  };

  return { getMoodEntries, saveMoodEntry, getTodaysMoodEntry };
};

export const useTriggerEntries = () => {
  const { user } = useAuth();

  const getTriggerEntries = async () => {
    if (!user) return [];
    const { data } = await supabase
      .from("trigger_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return data || [];
  };

  const saveTriggerEntry = async (entry: {
    date: string;
    time: string;
    trigger: string;
    situation: string;
    emotion: string;
    intensity: number;
    coping_used?: string;
    outcome?: string;
    notes?: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("trigger_entries")
      .insert({ ...entry, user_id: user.id });

    return { error };
  };

  const deleteTriggerEntry = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("trigger_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    return { error };
  };

  return { getTriggerEntries, saveTriggerEntry, deleteTriggerEntry };
};

export const useCommunityPosts = () => {
  const { user } = useAuth();

  const getPosts = async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return data || [];
  };

  const createPost = async (content: string, postType: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("community_posts")
      .insert({ content, post_type: postType, user_id: user.id });

    return { error };
  };

  const likePost = async (postId: string, currentLikes: number) => {
    const { error } = await supabase
      .from("community_posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", postId);

    return { error };
  };

  return { getPosts, createPost, likePost };
};

export const useSleepEntries = () => {
  const { user } = useAuth();

  const getSleepEntries = async () => {
    if (!user) return [];
    const { data } = await supabase
      .from("sleep_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    return data || [];
  };

  const saveSleepEntry = async (entry: {
    date: string;
    bedtime: string;
    wake_time: string;
    quality: number;
    hours_slept: number;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("sleep_entries")
      .upsert({ ...entry, user_id: user.id }, { onConflict: "user_id,date" });

    return { error };
  };

  return { getSleepEntries, saveSleepEntry };
};

export const usePreventionPlan = () => {
  const { user } = useAuth();

  const getPlan = async () => {
    if (!user) return null;
    const { data } = await supabase
      .from("prevention_plans")
      .select("*")
      .eq("user_id", user.id)
      .single();
    return data;
  };

  const savePlan = async (plan: {
    warning_signals?: string[];
    coping_strategies?: string[];
    emergency_contacts?: any[];
    safe_activities?: string[];
    personal_reasons?: string[];
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data: existing } = await supabase
      .from("prevention_plans")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("prevention_plans")
        .update(plan)
        .eq("user_id", user.id);
      return { error };
    } else {
      const { error } = await supabase
        .from("prevention_plans")
        .insert({ ...plan, user_id: user.id });
      return { error };
    }
  };

  return { getPlan, savePlan };
};

export const useChallengeProgress = () => {
  const { user } = useAuth();

  const getChallengeProgress = async (challengeId: string) => {
    if (!user) return null;
    const { data } = await supabase
      .from("challenge_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId)
      .single();
    return data;
  };

  const saveChallengeProgress = async (challengeId: string, completedTasks: string[]) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data: existing } = await supabase
      .from("challenge_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("challenge_progress")
        .update({ completed_tasks: completedTasks })
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId);
      return { error };
    } else {
      const { error } = await supabase
        .from("challenge_progress")
        .insert({ 
          challenge_id: challengeId, 
          completed_tasks: completedTasks, 
          user_id: user.id 
        });
      return { error };
    }
  };

  return { getChallengeProgress, saveChallengeProgress };
};

// Real-time sync hook for cross-device updates
export const useRealtimeSync = <T>(
  tableName: string,
  userId: string | undefined,
  onUpdate: (data: T) => void
) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`${tableName}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log(`Realtime update on ${tableName}:`, payload);
          onUpdate(payload.new as T);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, userId, onUpdate]);
};

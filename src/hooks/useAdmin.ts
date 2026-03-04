import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "moderator" | "user";
  created_at: string;
}

interface ContentReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface UserBan {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  expires_at: string | null;
  created_at: string;
  is_permanent: boolean;
}

interface ModerationLog {
  id: string;
  moderator_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export const useAdminRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-role", user?.id],
    queryFn: async () => {
      if (!user) return { isAdmin: false, isModerator: false };

      const { data, error } = await supabase
        .from("user_roles" as never)
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error checking admin role:", error);
        return { isAdmin: false, isModerator: false };
      }

      const roles = (data as unknown as UserRole[])?.map((r) => r.role) || [];
      return {
        isAdmin: roles.includes("admin"),
        isModerator: roles.includes("moderator") || roles.includes("admin"),
      };
    },
    enabled: !!user,
  });
};

export const useContentReports = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["content-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContentReport[];
    },
    enabled: !!user,
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
    }: {
      reportId: string;
      status: "pending" | "reviewed" | "dismissed" | "actioned";
    }) => {
      const { error } = await supabase
        .from("content_reports")
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-reports"] });
      toast.success("Report updated");
    },
    onError: (error) => {
      toast.error("Failed to update report: " + error.message);
    },
  });
};

export const useUserBans = () => {
  return useQuery({
    queryKey: ["user-bans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_bans" as never)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as UserBan[];
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
      isPermanent,
      expiresAt,
    }: {
      userId: string;
      reason: string;
      isPermanent: boolean;
      expiresAt?: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from("user_bans" as never) as any)
        .insert({
          user_id: userId,
          banned_by: user?.id,
          reason,
          is_permanent: isPermanent,
          expires_at: expiresAt,
        } as never);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("moderation_logs" as never) as any)
        .insert({
          moderator_id: user?.id,
          action_type: "ban_user",
          target_type: "user",
          target_id: userId,
          details: { reason, isPermanent, expiresAt },
        } as never);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bans"] });
      toast.success("User banned successfully");
    },
    onError: (error) => {
      toast.error("Failed to ban user: " + error.message);
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (banId: string) => {
      const { data: ban, error: fetchError } = await supabase
        .from("user_bans" as never)
        .select("user_id")
        .eq("id", banId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("user_bans" as never)
        .delete()
        .eq("id", banId);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("moderation_logs" as never) as any)
        .insert({
          moderator_id: user?.id,
          action_type: "unban_user",
          target_type: "user",
          target_id: (ban as unknown as UserBan).user_id,
          details: {},
        } as never);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bans"] });
      toast.success("User unbanned");
    },
    onError: (error) => {
      toast.error("Failed to unban user: " + error.message);
    },
  });
};

export const useModerationLogs = () => {
  return useQuery({
    queryKey: ["moderation-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moderation_logs" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as unknown as ModerationLog[];
    },
  });
};

export const useCommunityStats = () => {
  return useQuery({
    queryKey: ["community-stats"],
    queryFn: async () => {
      const [
        userCountRes,
        { count: totalPosts },
        { count: totalReports },
        { count: pendingReports },
        { count: activeBans },
      ] = await Promise.all([
        supabase.rpc("admin_count_users"),
        supabase.from("forum_posts").select("*", { count: "exact", head: true }),
        supabase.from("content_reports").select("*", { count: "exact", head: true }),
        supabase.from("content_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("user_bans" as never).select("*", { count: "exact", head: true }),
      ]);

      return {
        totalUsers: (userCountRes.data as number) || 0,
        totalPosts: totalPosts || 0,
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
        activeBans: activeBans || 0,
      };
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      targetType,
      targetId,
    }: {
      targetType: "forum_post" | "forum_reply" | "chat_message";
      targetId: string;
    }) => {
      let error;

      if (targetType === "forum_post") {
        ({ error } = await supabase.from("forum_posts").delete().eq("id", targetId));
      } else if (targetType === "forum_reply") {
        ({ error } = await supabase.from("forum_replies").delete().eq("id", targetId));
      } else if (targetType === "chat_message") {
        ({ error } = await supabase.from("chat_messages").delete().eq("id", targetId));
      }

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("moderation_logs" as never) as any)
        .insert({
          moderator_id: user?.id,
          action_type: "delete_content",
          target_type: targetType,
          target_id: targetId,
          details: {},
        } as never);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-reports"] });
      toast.success("Content deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete content: " + error.message);
    },
  });
};

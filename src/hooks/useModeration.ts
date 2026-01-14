import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  target_type: "forum_post" | "forum_reply" | "chat_message";
  target_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
}

export type ReportReason = "spam" | "harassment" | "hate_speech" | "inappropriate" | "misinformation" | "other";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or scam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
];

export const useBlockedUsers = () => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = useCallback(async () => {
    if (!user) {
      setBlockedUsers([]);
      setBlockedUserIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("blocked_users")
        .select("*")
        .eq("blocker_id", user.id);

      if (error) throw error;

      setBlockedUsers(data || []);
      setBlockedUserIds(new Set(data?.map((b) => b.blocked_id) || []));
    } catch {
      // User may not be premium - ignore error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const blockUser = async (blockedId: string) => {
    if (!user || blockedId === user.id) return false;

    try {
      const { error } = await supabase.from("blocked_users").insert({
        blocker_id: user.id,
        blocked_id: blockedId,
      });

      if (error) throw error;

      toast.success("User blocked");
      await fetchBlockedUsers();
      return true;
    } catch {
      toast.error("Failed to block user");
      return false;
    }
  };

  const unblockUser = async (blockedId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", blockedId);

      if (error) throw error;

      toast.success("User unblocked");
      await fetchBlockedUsers();
      return true;
    } catch {
      toast.error("Failed to unblock user");
      return false;
    }
  };

  const isUserBlocked = useCallback(
    (userId: string) => blockedUserIds.has(userId),
    [blockedUserIds]
  );

  return {
    blockedUsers,
    blockedUserIds,
    loading,
    blockUser,
    unblockUser,
    isUserBlocked,
    refetch: fetchBlockedUsers,
  };
};

export const useContentReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!user) {
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("content_reports")
        .select("*")
        .eq("reporter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as ContentReport[]) || []);
    } catch {
      // User may not be premium
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const reportContent = async (
    targetType: "forum_post" | "forum_reply" | "chat_message",
    targetId: string,
    reportedUserId: string,
    reason: ReportReason,
    description?: string
  ) => {
    if (!user || reportedUserId === user.id) return false;

    try {
      const { error } = await supabase.from("content_reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        target_type: targetType,
        target_id: targetId,
        reason,
        description: description?.trim() || null,
      });

      if (error) throw error;

      toast.success("Report submitted. Thank you for helping keep our community safe.");
      await fetchReports();
      return true;
    } catch {
      toast.error("Failed to submit report");
      return false;
    }
  };

  return {
    reports,
    loading,
    reportContent,
    refetch: fetchReports,
  };
};

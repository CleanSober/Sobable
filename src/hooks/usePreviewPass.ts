import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const PREVIEW_PASS_DAYS = 7;

interface PreviewPassRecord {
  claimed_at: string; // ISO
  expires_at: string; // ISO
}

const storageKey = (userId: string | undefined | null) =>
  `sober_club_preview_pass_${userId ?? "guest"}`;

export const readPreviewPass = (userId: string | undefined | null): PreviewPassRecord | null => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as PreviewPassRecord;
  } catch {
    return null;
  }
};

export const isPreviewPassActive = (userId: string | undefined | null): boolean => {
  const rec = readPreviewPass(userId);
  if (!rec) return false;
  return new Date(rec.expires_at).getTime() > Date.now();
};

export const usePreviewPass = () => {
  const { user } = useAuth();
  const [record, setRecord] = useState<PreviewPassRecord | null>(() => readPreviewPass(user?.id));

  // Re-read when user changes
  useEffect(() => {
    setRecord(readPreviewPass(user?.id));
  }, [user?.id]);

  // Listen for cross-tab updates
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(user?.id)) {
        setRecord(readPreviewPass(user?.id));
      }
    };
    const onCustom = () => setRecord(readPreviewPass(user?.id));
    window.addEventListener("storage", onStorage);
    window.addEventListener("preview-pass-updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("preview-pass-updated", onCustom);
    };
  }, [user?.id]);

  const alreadyClaimed = record !== null;
  const isActive = !!record && new Date(record.expires_at).getTime() > Date.now();
  const expiresAt = record ? new Date(record.expires_at) : null;
  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const claim = useCallback(() => {
    if (readPreviewPass(user?.id)) return null; // one-time only
    const now = new Date();
    const expires = new Date(now.getTime() + PREVIEW_PASS_DAYS * 24 * 60 * 60 * 1000);
    const next: PreviewPassRecord = {
      claimed_at: now.toISOString(),
      expires_at: expires.toISOString(),
    };
    localStorage.setItem(storageKey(user?.id), JSON.stringify(next));
    setRecord(next);
    window.dispatchEvent(new CustomEvent("preview-pass-updated"));
    window.dispatchEvent(new CustomEvent("premium-status-refresh"));
    return next;
  }, [user?.id]);

  return {
    isActive,
    alreadyClaimed,
    expiresAt,
    daysRemaining,
    claim,
    previewPassDays: PREVIEW_PASS_DAYS,
  };
};

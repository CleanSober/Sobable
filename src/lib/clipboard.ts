/**
 * Robust clipboard copy with retry + execCommand fallback.
 * Returns a structured result so callers can show clear UX.
 */
export type CopyOutcome = "clipboard" | "fallback" | "blocked" | "unsupported";

export interface CopyResult {
  ok: boolean;
  outcome: CopyOutcome;
  message: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const tryAsyncClipboard = async (text: string): Promise<CopyResult | null> => {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return null;

  // Permissions API is best-effort — Safari/Firefox may not implement it.
  try {
    const perm = (navigator as Navigator & {
      permissions?: { query: (d: { name: PermissionName }) => Promise<PermissionStatus> };
    }).permissions;
    if (perm?.query) {
      const status = await perm.query({ name: "clipboard-write" as PermissionName }).catch(() => null);
      if (status && status.state === "denied") {
        return { ok: false, outcome: "blocked", message: "Clipboard access is blocked in your browser settings." };
      }
    }
  } catch {
    /* ignore — proceed to write */
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, outcome: "clipboard", message: "Copied to clipboard!" };
    } catch (err) {
      const name = (err as Error)?.name ?? "";
      // NotAllowedError = permission denied / no user gesture; don't retry.
      if (name === "NotAllowedError") {
        return {
          ok: false,
          outcome: "blocked",
          message: "Browser blocked clipboard access. Try again right after tapping a button, or copy manually.",
        };
      }
      if (attempt < 2) await sleep(120);
    }
  }
  return null;
};

const tryExecCommand = (text: string): CopyResult => {
  if (typeof document === "undefined") {
    return { ok: false, outcome: "unsupported", message: "Clipboard not available in this environment." };
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (ok) return { ok: true, outcome: "fallback", message: "Copied to clipboard!" };
    return {
      ok: false,
      outcome: "blocked",
      message: "Couldn't copy automatically — long-press the text below to copy it manually.",
    };
  } catch {
    return {
      ok: false,
      outcome: "unsupported",
      message: "Couldn't copy — long-press the text below to copy it manually.",
    };
  }
};

export const copyText = async (text: string): Promise<CopyResult> => {
  const asyncResult = await tryAsyncClipboard(text);
  if (asyncResult?.ok) return asyncResult;
  // Fall back to execCommand whether async failed silently or was blocked.
  const fallback = tryExecCommand(text);
  if (fallback.ok) return fallback;
  // Surface the most informative message.
  return asyncResult ?? fallback;
};

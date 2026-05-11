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

const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Covers iPhone, iPad, iPod, plus iPadOS 13+ which reports as Mac with touch.
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
};

/**
 * iOS Safari refuses execCommand('copy') on a hidden/readonly <textarea>.
 * The reliable workaround: use a contentEditable element + Range/Selection,
 * which Safari treats as a user-driven selection and allows the copy.
 */
const tryIOSCopy = (text: string): boolean => {
  try {
    const el = document.createElement("div");
    el.contentEditable = "true";
    // Must be visible to Safari but invisible to the user.
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "0";
    el.style.width = "1px";
    el.style.height = "1px";
    el.style.opacity = "0";
    el.style.userSelect = "text";
    el.style.webkitUserSelect = "text" as unknown as string;
    el.innerText = text;
    document.body.appendChild(el);

    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    el.setAttribute("contenteditable", "true");
    (el as HTMLElement).focus();
    // Safari needs an explicit selection on the element itself.
    (el as unknown as { setSelectionRange?: (s: number, e: number) => void }).setSelectionRange?.(
      0,
      text.length
    );

    const ok = document.execCommand("copy");
    selection?.removeAllRanges();
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
};

const tryExecCommand = (text: string): CopyResult => {
  if (typeof document === "undefined") {
    return { ok: false, outcome: "unsupported", message: "Clipboard not available in this environment." };
  }

  // iOS Safari path first — the textarea route is unreliable there.
  if (isIOS() && tryIOSCopy(text)) {
    return { ok: true, outcome: "fallback", message: "Copied to clipboard!" };
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    // NOTE: do NOT set readonly on iOS — Safari blocks copy from readonly fields.
    ta.contentEditable = "true";
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    ta.style.fontSize = "16px"; // prevent iOS auto-zoom on focus
    document.body.appendChild(ta);

    const range = document.createRange();
    range.selectNodeContents(ta);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    ta.focus();
    ta.setSelectionRange(0, text.length);

    const ok = document.execCommand("copy");
    selection?.removeAllRanges();
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

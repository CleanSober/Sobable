import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { NATIVE_OAUTH_REDIRECT_URL } from "@/lib/nativeOAuth";

export default function NativeAuthBridge() {
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    const handoffToNative = async () => {
      const url = new URL(window.location.href);
      const search = url.search ? url.search : "";
      const hash = url.hash ? url.hash : "";

      console.debug("[auth-bridge] loaded", {
        href: window.location.href,
        search,
        hash,
      });

      if (search || hash) {
        console.debug("[auth-bridge] forwarding callback params to native app", {
          target: `${NATIVE_OAUTH_REDIRECT_URL}${search}${hash}`,
        });
        window.location.replace(`${NATIVE_OAUTH_REDIRECT_URL}${search}${hash}`);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      const session = data.session;

      console.debug("[auth-bridge] session lookup result", {
        hasSession: Boolean(session),
        hasAccessToken: Boolean(session?.access_token),
        hasRefreshToken: Boolean(session?.refresh_token),
        error: error?.message ?? null,
      });

      if (error || !session?.access_token || !session.refresh_token) {
        setMessage("OAuth completed, but no session tokens were available to hand off.");
        return;
      }

      const params = new URLSearchParams({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      console.debug("[auth-bridge] forwarding session tokens to native app", {
        target: `${NATIVE_OAUTH_REDIRECT_URL}?${params.toString()}`,
      });
      window.location.replace(`${NATIVE_OAUTH_REDIRECT_URL}?${params.toString()}`);
    };

    void handoffToNative();
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-background px-6 text-center">
      <div className="max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold text-foreground">Returning to Sober Club</h1>
        <p className="text-sm text-muted-foreground">
          {Capacitor.isNativePlatform()
            ? message
            : "If the app did not open automatically, return to Sober Club to finish sign-in."}
        </p>
      </div>
    </div>
  );
}

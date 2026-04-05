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

      if (search || hash) {
        window.location.replace(`${NATIVE_OAUTH_REDIRECT_URL}${search}${hash}`);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      const session = data.session;

      if (error || !session?.access_token || !session.refresh_token) {
        setMessage("OAuth completed, but no session tokens were available to hand off.");
        return;
      }

      const params = new URLSearchParams({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
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

import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const NATIVE_OAUTH_SCHEME = "com.sober.club";
export const NATIVE_OAUTH_HOST = "auth";
export const NATIVE_OAUTH_PATH = "/callback";
export const NATIVE_OAUTH_REDIRECT_URL = `${NATIVE_OAUTH_SCHEME}://${NATIVE_OAUTH_HOST}${NATIVE_OAUTH_PATH}`;

const getAllParams = (url: URL) => {
  const params = new URLSearchParams(url.search);
  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;

  for (const [key, value] of new URLSearchParams(hash).entries()) {
    params.set(key, value);
  }

  return params;
};

const isNativeCallbackUrl = (url: string) => {
  return url.startsWith(`${NATIVE_OAUTH_SCHEME}://${NATIVE_OAUTH_HOST}`);
};

const completeNativeOAuth = async (callbackUrl: string) => {
  const url = new URL(callbackUrl);
  const params = getAllParams(url);
  const errorDescription = params.get("error_description") || params.get("error");

  if (errorDescription) {
    throw new Error(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const authCode = params.get("code");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    return;
  }

  if (authCode) {
    const { error } = await supabase.auth.exchangeCodeForSession(authCode);
    if (error) {
      throw error;
    }

    return;
  }

  throw new Error("OAuth callback did not contain a session or authorization code.");
};

export const useNativeOAuthCallback = () => {
  const navigate = useNavigate();
  const lastHandledUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleUrl = async (callbackUrl?: string | null) => {
      if (!callbackUrl || !isNativeCallbackUrl(callbackUrl) || lastHandledUrlRef.current === callbackUrl) {
        return;
      }

      lastHandledUrlRef.current = callbackUrl;

      try {
        await completeNativeOAuth(callbackUrl);
        await Browser.close();
        toast.success("Signed in successfully.");
        navigate("/");
      } catch (error) {
        await Browser.close();
        toast.error(error instanceof Error ? error.message : "Failed to complete sign in.");
        navigate("/auth");
      }
    };

    let urlOpenListener: Awaited<ReturnType<typeof App.addListener>> | null = null;

    const setup = async () => {
      const launchUrl = await App.getLaunchUrl();
      await handleUrl(launchUrl?.url);

      urlOpenListener = await App.addListener("appUrlOpen", async ({ url }) => {
        await handleUrl(url);
      });
    };

    void setup();

    return () => {
      void urlOpenListener?.remove();
    };
  }, [navigate]);
};

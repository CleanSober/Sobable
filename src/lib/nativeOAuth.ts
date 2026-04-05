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
  console.debug("[native-oauth] completing callback", { callbackUrl });
  const url = new URL(callbackUrl);
  const params = getAllParams(url);
  const errorDescription = params.get("error_description") || params.get("error");

  if (errorDescription) {
    console.error("[native-oauth] callback contained oauth error", {
      callbackUrl,
      errorDescription,
    });
    throw new Error(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const authCode = params.get("code");

  if (accessToken && refreshToken) {
    console.debug("[native-oauth] found session tokens in callback", {
      hasAccessToken: true,
      hasRefreshToken: true,
    });
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("[native-oauth] setSession failed", { error });
      throw error;
    }

    console.debug("[native-oauth] session restored from callback tokens");
    return;
  }

  if (authCode) {
    console.debug("[native-oauth] found auth code in callback");
    const { error } = await supabase.auth.exchangeCodeForSession(authCode);
    if (error) {
      console.error("[native-oauth] exchangeCodeForSession failed", { error });
      throw error;
    }

    console.debug("[native-oauth] session exchanged from auth code");
    return;
  }

  console.error("[native-oauth] callback missing session tokens and auth code", {
    callbackUrl,
  });
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
      console.debug("[native-oauth] received app url", { callbackUrl });
      if (!callbackUrl || !isNativeCallbackUrl(callbackUrl) || lastHandledUrlRef.current === callbackUrl) {
        console.debug("[native-oauth] ignoring app url", {
          callbackUrl,
          isMatchingCallback: Boolean(callbackUrl && isNativeCallbackUrl(callbackUrl)),
          alreadyHandled: lastHandledUrlRef.current === callbackUrl,
        });
        return;
      }

      lastHandledUrlRef.current = callbackUrl;

      try {
        await completeNativeOAuth(callbackUrl);
        await Browser.close();
        console.debug("[native-oauth] callback completed successfully");
        toast.success("Signed in successfully.");
        navigate("/");
      } catch (error) {
        await Browser.close();
        console.error("[native-oauth] callback completion failed", { error });
        toast.error(error instanceof Error ? error.message : "Failed to complete sign in.");
        navigate("/auth");
      }
    };

    let urlOpenListener: Awaited<ReturnType<typeof App.addListener>> | null = null;

    const setup = async () => {
      const launchUrl = await App.getLaunchUrl();
      console.debug("[native-oauth] initial launch url", { launchUrl: launchUrl?.url ?? null });
      await handleUrl(launchUrl?.url);

      urlOpenListener = await App.addListener("appUrlOpen", async ({ url }) => {
        console.debug("[native-oauth] appUrlOpen fired", { url });
        await handleUrl(url);
      });
    };

    void setup();

    return () => {
      void urlOpenListener?.remove();
    };
  }, [navigate]);
};

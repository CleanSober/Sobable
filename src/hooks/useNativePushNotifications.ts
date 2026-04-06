import { useCallback, useEffect, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { PushNotifications, type PermissionStatus } from "@capacitor/push-notifications";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

type NativePushPermission = PermissionStatus["receive"];
type FirebaseMessagingBridgePlugin = {
  getToken: () => Promise<{ token: string | null }>;
};

const FirebaseMessagingBridge = registerPlugin<FirebaseMessagingBridgePlugin>("FirebaseMessagingBridge");

export const useNativePushNotifications = () => {
  const [permission, setPermission] = useState<NativePushPermission>("prompt");
  const [isRegistering, setIsRegistering] = useState(false);
  const [apnsToken, setApnsToken] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const isNativeSupported = Capacitor.isNativePlatform() && ["ios", "android"].includes(Capacitor.getPlatform());
  const platform = isNativeSupported ? Capacitor.getPlatform() : null;
  const isIosNative = platform === "ios";
  const isAndroidNative = platform === "android";

  const syncFcmToken = useCallback(async () => {
    if (!isNativeSupported) return;

    try {
      const { token } = isIosNative
        ? await FirebaseMessagingBridge.getToken()
        : await FirebaseMessaging.getToken();
      setFcmToken(token ?? null);
    } catch (error) {
      console.error("[native-push] failed to fetch Firebase messaging token", { error, platform });
    }
  }, [isIosNative, isNativeSupported, platform]);

  const syncPermission = useCallback(async () => {
    if (!isNativeSupported) return;

    const status = await PushNotifications.checkPermissions();
    setPermission(status.receive);
  }, [isNativeSupported]);

  useEffect(() => {
    if (!isNativeSupported) return;

    void syncPermission();
    void syncFcmToken();

    const registrationListener = PushNotifications.addListener("registration", (token) => {
      console.debug("[native-push] registration token received", {
        platform,
        hasToken: Boolean(token.value),
      });
      if (isIosNative) {
        setApnsToken(token.value);
        void syncFcmToken();
      } else {
        setFcmToken(token.value);
      }
    });

    const registrationErrorListener = PushNotifications.addListener("registrationError", (error) => {
      console.error("[native-push] registration failed", { error, platform });
    });

    const receivedListener = PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.debug("[native-push] notification received", { platform, notification });
    });

    const actionListener = PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
      console.debug("[native-push] notification action performed", { platform, notification });
    });

    const firebaseTokenListener = isAndroidNative
      ? FirebaseMessaging.addListener("tokenReceived", (event) => {
          console.debug("[native-push] Firebase token received", {
            platform,
            hasToken: Boolean(event.token),
          });
          setFcmToken(event.token ?? null);
        })
      : null;

    return () => {
      void registrationListener.then((listener) => listener.remove());
      void registrationErrorListener.then((listener) => listener.remove());
      void receivedListener.then((listener) => listener.remove());
      void actionListener.then((listener) => listener.remove());
      void firebaseTokenListener?.then((listener) => listener.remove());
    };
  }, [isAndroidNative, isIosNative, isNativeSupported, platform, syncFcmToken, syncPermission]);

  const enablePush = useCallback(async () => {
    if (!isNativeSupported) {
      return { granted: false, error: new Error("Native push notifications are not available on this platform.") };
    }

    setIsRegistering(true);

    try {
      let status = await PushNotifications.checkPermissions();

      if (status.receive === "prompt") {
        status = await PushNotifications.requestPermissions();
      }

      setPermission(status.receive);

      if (status.receive !== "granted") {
        return { granted: false, error: new Error("Push notification permission was denied.") };
      }

      await PushNotifications.register();
      await syncFcmToken();
      return { granted: true, error: null };
    } catch (error) {
      return {
        granted: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    } finally {
      setIsRegistering(false);
    }
  }, [isNativeSupported, syncFcmToken]);

  const disablePush = useCallback(async () => {
    if (!isNativeSupported) return;

    try {
      await PushNotifications.unregister();
      setApnsToken(null);
      setFcmToken(null);
    } finally {
      await syncPermission();
    }
  }, [isNativeSupported, syncPermission]);

  return {
    platform,
    isAndroidNative,
    isIosNative,
    isSupported: isNativeSupported,
    isRegistering,
    permission,
    apnsToken,
    fcmToken,
    enablePush,
    disablePush,
    refreshPermission: syncPermission,
  };
};

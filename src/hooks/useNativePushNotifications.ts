import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, type PermissionStatus } from "@capacitor/push-notifications";

type NativePushPermission = PermissionStatus["receive"];

export const useNativePushNotifications = () => {
  const [permission, setPermission] = useState<NativePushPermission>("prompt");
  const [isRegistering, setIsRegistering] = useState(false);
  const [apnsToken, setApnsToken] = useState<string | null>(null);
  const isIosNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";

  const syncPermission = useCallback(async () => {
    if (!isIosNative) return;

    const status = await PushNotifications.checkPermissions();
    setPermission(status.receive);
  }, [isIosNative]);

  useEffect(() => {
    if (!isIosNative) return;

    void syncPermission();

    const registrationListener = PushNotifications.addListener("registration", (token) => {
      console.debug("[ios-push] APNs token received", {
        hasToken: Boolean(token.value),
      });
      setApnsToken(token.value);
    });

    const registrationErrorListener = PushNotifications.addListener("registrationError", (error) => {
      console.error("[ios-push] registration failed", { error });
    });

    const receivedListener = PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.debug("[ios-push] notification received", { notification });
    });

    const actionListener = PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
      console.debug("[ios-push] notification action performed", { notification });
    });

    return () => {
      void registrationListener.then((listener) => listener.remove());
      void registrationErrorListener.then((listener) => listener.remove());
      void receivedListener.then((listener) => listener.remove());
      void actionListener.then((listener) => listener.remove());
    };
  }, [isIosNative, syncPermission]);

  const enablePush = useCallback(async () => {
    if (!isIosNative) {
      return { granted: false, error: new Error("Native push notifications are only enabled for iOS in this app.") };
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
      return { granted: true, error: null };
    } catch (error) {
      return {
        granted: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    } finally {
      setIsRegistering(false);
    }
  }, [isIosNative]);

  const disablePush = useCallback(async () => {
    if (!isIosNative) return;

    try {
      await PushNotifications.unregister();
      setApnsToken(null);
    } finally {
      await syncPermission();
    }
  }, [isIosNative, syncPermission]);

  return {
    isIosNative,
    isSupported: isIosNative,
    isRegistering,
    permission,
    apnsToken,
    enablePush,
    disablePush,
    refreshPermission: syncPermission,
  };
};

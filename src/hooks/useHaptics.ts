import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const impact = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isNative) return;
    
    try {
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };
      await Haptics.impact({ style: styleMap[style] });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isNative) return;
    
    try {
      const typeMap = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };
      await Haptics.notification({ type: typeMap[type] });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  const vibrate = async (duration: number = 50) => {
    if (!isNative) return;
    
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  const selection = async () => {
    if (!isNative) return;
    
    try {
      await Haptics.selectionStart();
      await Haptics.selectionEnd();
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  };

  return {
    impact,
    notification,
    vibrate,
    selection,
    isNative,
  };
};

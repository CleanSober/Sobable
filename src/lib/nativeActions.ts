import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Native actions helper for iOS and Android integration
 */

const isNative = () => Capacitor.isNativePlatform();

/**
 * Trigger haptic feedback before an action
 */
const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
  if (!isNative()) {
    // Fallback for web - use vibration API if available
    if ('vibrate' in navigator) {
      const durations = { light: 10, medium: 25, heavy: 50 };
      navigator.vibrate(durations[style]);
    }
    return;
  }
  
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

/**
 * Make a phone call with haptic feedback
 * Works on both native apps and mobile web browsers
 */
export const makePhoneCall = async (phoneNumber: string) => {
  if (!phoneNumber) {
    console.warn('No phone number provided');
    return false;
  }

  // Clean the phone number (remove spaces, dashes, parentheses)
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Trigger haptic feedback
  await triggerHaptic('medium');

  // Use tel: protocol - works on both native and web
  window.location.href = `tel:${cleanNumber}`;
  
  return true;
};

/**
 * Send an SMS with haptic feedback
 */
export const sendSMS = async (phoneNumber: string, body?: string) => {
  if (!phoneNumber) {
    console.warn('No phone number provided');
    return false;
  }

  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  await triggerHaptic('light');

  // Build SMS URL with optional body
  const smsUrl = body 
    ? `sms:${cleanNumber}?body=${encodeURIComponent(body)}`
    : `sms:${cleanNumber}`;
    
  window.location.href = smsUrl;
  
  return true;
};

/**
 * Trigger success haptic feedback
 */
export const hapticSuccess = async () => {
  if (!isNative()) {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
    return;
  }
  
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
};

/**
 * Trigger warning haptic feedback
 */
export const hapticWarning = async () => {
  if (!isNative()) {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
    return;
  }
  
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
};

/**
 * Trigger error haptic feedback  
 */
export const hapticError = async () => {
  if (!isNative()) {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
    return;
  }
  
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
};

/**
 * Light tap haptic for UI interactions
 */
export const hapticTap = async () => {
  await triggerHaptic('light');
};

/**
 * Medium impact haptic for button presses
 */
export const hapticImpact = async () => {
  await triggerHaptic('medium');
};

/**
 * Heavy impact haptic for important actions
 */
export const hapticHeavy = async () => {
  await triggerHaptic('heavy');
};

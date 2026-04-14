import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { applyThemePreference } from '@/lib/theme';

export const useCapacitor = () => {
  useEffect(() => {
    let keyboardWillShowListener: Awaited<ReturnType<typeof Keyboard.addListener>> | null = null;
    let keyboardWillHideListener: Awaited<ReturnType<typeof Keyboard.addListener>> | null = null;
    let appStateChangeListener: Awaited<ReturnType<typeof App.addListener>> | null = null;
    let backButtonListener: Awaited<ReturnType<typeof App.addListener>> | null = null;

    const initCapacitor = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // Add platform class to body for platform-specific CSS
        const platform = Capacitor.getPlatform();
        document.body.classList.add(platform); // 'ios' or 'android'

        applyThemePreference();

        // Hide splash screen after app is ready
        await SplashScreen.hide();

        // Handle keyboard events
        keyboardWillShowListener = await Keyboard.addListener('keyboardWillShow', (info) => {
          document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
        });

        keyboardWillHideListener = await Keyboard.addListener('keyboardWillHide', () => {
          document.body.style.setProperty('--keyboard-height', '0px');
        });

        // Handle app state changes
        appStateChangeListener = await App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive);
          if (isActive) {
            applyThemePreference();
          }
        });

        // Handle back button on Android
        backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });

      } catch (error) {
        console.error('Error initializing Capacitor:', error);
      }
    };

    initCapacitor();

    return () => {
      if (Capacitor.isNativePlatform()) {
        void keyboardWillShowListener?.remove();
        void keyboardWillHideListener?.remove();
        void appStateChangeListener?.remove();
        void backButtonListener?.remove();
      }
    };
  }, []);
};

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

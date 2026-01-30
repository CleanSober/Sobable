import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

export const useCapacitor = () => {
  useEffect(() => {
    const initCapacitor = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // Configure status bar for dark theme
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0a0a0a' });

        // Hide splash screen after app is ready
        await SplashScreen.hide();

        // Handle keyboard events
        Keyboard.addListener('keyboardWillShow', (info) => {
          document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
        });

        Keyboard.addListener('keyboardWillHide', () => {
          document.body.style.setProperty('--keyboard-height', '0px');
        });

        // Handle app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive);
        });

        // Handle back button on Android
        App.addListener('backButton', ({ canGoBack }) => {
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
        Keyboard.removeAllListeners();
        App.removeAllListeners();
      }
    };
  }, []);
};

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

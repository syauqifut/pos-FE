import { useState, useEffect } from 'react';

interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isStandalone: boolean;
  deferredPrompt: PWAInstallPromptEvent | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    isStandalone: false,
    deferredPrompt: null,
  });

  useEffect(() => {
    // Check if app is installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    // Check if app is in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;

    // Check offline status
    const updateOnlineStatus = () => {
      setPwaState(prev => ({
        ...prev,
        isOffline: !navigator.onLine,
        isInstalled,
        isStandalone,
      }));
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as PWAInstallPromptEvent;
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: promptEvent,
      }));
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }));
    };

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial check
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!pwaState.deferredPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      pwaState.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await pwaState.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({
          ...prev,
          isInstallable: false,
          deferredPrompt: null,
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  const checkForUpdates = async (): Promise<boolean> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          return true;
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
    return false;
  };

  return {
    ...pwaState,
    installApp,
    checkForUpdates,
  };
};

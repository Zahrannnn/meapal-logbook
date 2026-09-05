export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type InstallPromptListener = (prompt: BeforeInstallPromptEvent | null) => void;

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const installPromptListeners = new Set<InstallPromptListener>();

const notifyInstallPromptListeners = () => {
  installPromptListeners.forEach((listener) => listener(deferredInstallPrompt));
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    notifyInstallPromptListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    notifyInstallPromptListeners();
  });
}

export const getInstallPrompt = () => deferredInstallPrompt;

export const subscribeToInstallPrompt = (listener: InstallPromptListener) => {
  installPromptListeners.add(listener);
  listener(deferredInstallPrompt);

  return () => {
    installPromptListeners.delete(listener);
  };
};

export const clearInstallPrompt = () => {
  deferredInstallPrompt = null;
  notifyInstallPromptListeners();
};

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.error('Service worker registration failed:', error);
  });
};

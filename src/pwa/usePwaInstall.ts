import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  clearInstallPrompt,
  getInstallPrompt,
  subscribeToInstallPrompt,
  type BeforeInstallPromptEvent,
} from '../pwa';
import { getInstallGuide, type InstallGuide } from './installGuide';

export const usePwaInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    getInstallPrompt(),
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && window.navigator.standalone === true);
    setIsInstalled(isStandalone);

    const handleAppInstalled = () => {
      clearInstallPrompt();
      setInstallPrompt(null);
      setIsInstalled(true);
      setIsModalOpen(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    const unsubscribeFromInstallPrompt = subscribeToInstallPrompt(setInstallPrompt);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      unsubscribeFromInstallPrompt();
    };
  }, []);

  const installGuide: InstallGuide = isInstalled ? 'native' : getInstallGuide(Boolean(installPrompt));
  const canNativeInstall = Boolean(installPrompt) && !isInstalled;

  const openInstallModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeInstallModal = useCallback(() => {
    if (!isInstalling) {
      setIsModalOpen(false);
    }
  }, [isInstalling]);

  const confirmInstall = useCallback(async () => {
    if (isInstalled) {
      setIsModalOpen(false);
      return;
    }

    if (!installPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      clearInstallPrompt();
      setInstallPrompt(null);

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsModalOpen(false);
        toast('App installed successfully', { icon: '✓' });
      }
    } catch {
      clearInstallPrompt();
      setInstallPrompt(null);
      toast('Installation was cancelled or is unavailable.', { icon: 'ℹ️' });
    } finally {
      setIsInstalling(false);
    }
  }, [installPrompt, isInstalled]);

  return {
    isInstalled,
    isModalOpen,
    isInstalling,
    installGuide,
    canNativeInstall,
    openInstallModal,
    closeInstallModal,
    confirmInstall,
  };
};

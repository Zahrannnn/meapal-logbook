export type InstallGuide = 'native' | 'chrome' | 'safari-ios' | 'insecure';

export const getInstallGuide = (hasNativePrompt: boolean): InstallGuide => {
  if (hasNativePrompt) return 'native';

  if (!window.isSecureContext) return 'insecure';

  const ua = window.navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

  if (isIOS || isSafari) return 'safari-ios';

  return 'chrome';
};

export const INSTALL_BENEFITS = [
  'Launch from your home screen or taskbar',
  'Full-screen workspace without browser chrome',
  'Faster access to daily activity logging',
] as const;

export const INSTALL_STEPS: Record<Exclude<InstallGuide, 'native'>, string[]> = {
  insecure: [
    'Open this app over HTTPS in a supported browser.',
    'Once secure, return here and try installing again.',
  ],
  chrome: [
    'Open the browser menu (⋮) in the top-right corner.',
    'Select "Install app" or "Install Meapal LogBook".',
    'Confirm when prompted to add the app.',
  ],
  'safari-ios': [
    'Tap the Share button at the bottom of Safari.',
    'Scroll down and choose "Add to Home Screen".',
    'Tap "Add" to place the app on your home screen.',
  ],
};

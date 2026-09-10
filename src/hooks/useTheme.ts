import { useCallback, useLayoutEffect, useState } from 'react';
import { logEvent } from '../lib/telemetry';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'logbook:theme';
// Migrated from the dashboard-only experiment so existing choices survive.
const LEGACY_THEME_KEY = 'logbook:dashboard-theme';

const readStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_KEY) ?? localStorage.getItem(LEGACY_THEME_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

/**
 * App-wide light/dark theme. The `.dark` class rides on <html> so Radix
 * portals (dialogs, toasts, pickers) inherit it too. useLayoutEffect applies
 * the stored choice before first paint on mount; every mounted instance reads
 * the same storage, and toggles apply + persist immediately, so the App root,
 * the header and the login page stay consistent without shared state.
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // storage unavailable (private mode) — the choice just won't persist
    }
    logEvent('theme_change', { to: next });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
};

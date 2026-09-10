import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { logEvent } from '../lib/telemetry';

export type ThemeId = 'light' | 'dark' | 'midnight' | 'graphite';
/** What the user picks; 'system' resolves to light/dark from the OS. */
export type ThemeSetting = ThemeId | 'system';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  hint: string;
  /** True when the theme rides on the shared .dark token base. */
  darkFamily: boolean;
  /** Popover preview: background, card and accent chips. */
  swatch: { bg: string; card: string; accent: string };
  /** Browser chrome / PWA title bar color. */
  metaColor: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'light',
    label: 'Light',
    hint: 'Default look',
    darkFamily: false,
    swatch: { bg: 'hsl(220 20% 97%)', card: 'hsl(0 0% 100%)', accent: 'hsl(221 83% 53%)' },
    metaColor: 'hsl(220 20% 97%)',
  },
  {
    id: 'dark',
    label: 'Dark',
    hint: 'Slate surfaces',
    darkFamily: true,
    swatch: { bg: 'hsl(224 30% 8%)', card: 'hsl(224 30% 12%)', accent: 'hsl(217 91% 60%)' },
    metaColor: 'hsl(224 30% 8%)',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    hint: 'True black · OLED',
    darkFamily: true,
    swatch: { bg: 'hsl(228 30% 3%)', card: 'hsl(226 28% 7%)', accent: 'hsl(217 91% 60%)' },
    metaColor: 'hsl(228 30% 3%)',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    hint: 'Neutral gray',
    darkFamily: true,
    swatch: { bg: 'hsl(220 4% 8%)', card: 'hsl(220 4% 12%)', accent: 'hsl(217 91% 60%)' },
    metaColor: 'hsl(220 4% 8%)',
  },
];

const THEME_KEY = 'logbook:theme';
// Migrated from the dashboard-only experiment so existing choices survive.
const LEGACY_THEME_KEY = 'logbook:dashboard-theme';

const isThemeId = (value: string | null): value is ThemeId =>
  value === 'light' || value === 'dark' || value === 'midnight' || value === 'graphite';

const readStoredSetting = (): ThemeSetting => {
  try {
    const stored = localStorage.getItem(THEME_KEY) ?? localStorage.getItem(LEGACY_THEME_KEY);
    if (stored === 'system') return 'system';
    if (isThemeId(stored)) return stored;
  } catch {
    // storage unavailable — fall through to the default
  }
  return 'system';
};

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const resolveTheme = (setting: ThemeSetting): ThemeId =>
  setting === 'system' ? (prefersDark() ? 'dark' : 'light') : setting;

const applyTheme = (id: ThemeId) => {
  const definition = THEMES.find((theme) => theme.id === id) ?? THEMES[0];
  document.documentElement.dataset.theme = definition.id;
  // All dark-family themes ride the shared .dark base so `dark:` variants work everywhere.
  document.documentElement.classList.toggle('dark', definition.darkFamily);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', definition.metaColor);
};

/**
 * App-wide theme. Every mounted instance reads the same storage and applies
 * the resolved theme to <html> (so Radix portals inherit it); toggles apply
 * and persist immediately. 'system' follows the OS light/dark preference live.
 */
export const useTheme = () => {
  const [setting, setSettingState] = useState<ThemeSetting>(readStoredSetting);
  const [resolvedTheme, setResolvedTheme] = useState<ThemeId>(() => resolveTheme(readStoredSetting()));

  useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // System setting follows the OS live; explicit choices ignore it.
  useEffect(() => {
    if (setting !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolvedTheme(media.matches ? 'dark' : 'light');
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [setting]);

  const setSetting = useCallback((next: ThemeSetting) => {
    setSettingState(next);
    if (next !== 'system') setResolvedTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // storage unavailable (private mode) — the choice just won't persist
    }
    logEvent('theme_change', { to: next, resolved: next === 'system' ? undefined : next });
  }, []);

  return { setting, resolvedTheme, setSetting, themes: THEMES };
};

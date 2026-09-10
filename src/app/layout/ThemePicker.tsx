import React from 'react';
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme, type ThemeDefinition } from '@/hooks/useTheme';

/** Three stacked chips — background, card, accent — previewing a theme's palette. */
const Swatch: React.FC<{ theme: ThemeDefinition }> = ({ theme }) => (
  <span
    className="flex h-4 w-4 shrink-0 overflow-hidden rounded-full border border-border"
    aria-hidden="true"
  >
    <span className="h-full flex-1" style={{ backgroundColor: theme.swatch.bg }} />
    <span className="h-full flex-1" style={{ backgroundColor: theme.swatch.card }} />
    <span className="h-full w-1.5" style={{ backgroundColor: theme.swatch.accent }} />
  </span>
);

/**
 * The theme control for the navbar and the login page: a popover listing
 * System plus every registered theme with a palette swatch.
 */
export const ThemePicker: React.FC<{ className?: string }> = ({ className }) => {
  const { setting, resolvedTheme, setSetting, themes } = useTheme();
  const resolved = themes.find((theme) => theme.id === resolvedTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Change theme"
          title="Theme"
          className={className ?? 'text-muted-foreground hover:text-foreground'}
        >
          {resolvedTheme === 'light' ? (
            <SunIcon />
          ) : (
            <MoonIcon style={resolved?.id === 'graphite' ? { filter: 'saturate(0)' } : undefined} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuItem
          className="justify-between"
          onSelect={() => setSetting('system')}
        >
          <span className="flex items-center gap-2">
            <MonitorIcon />
            System
          </span>
          {setting === 'system' && <CheckIcon className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            className="justify-between"
            onSelect={() => setSetting(theme.id)}
          >
            <span className="flex items-center gap-2">
              <Swatch theme={theme} />
              <span className="flex flex-col items-start leading-tight">
                <span>{theme.label}</span>
                <span className="text-[11px] text-muted-foreground">{theme.hint}</span>
              </span>
            </span>
            {setting === theme.id && <CheckIcon className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

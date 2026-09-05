import React from 'react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  /** Show wordmark beside the mark */
  showWordmark?: boolean;
  /** Compact sizing for mobile header */
  compact?: boolean;
  /** Larger mark for login / marketing surfaces */
  large?: boolean;
  /** Color treatment for dark backgrounds */
  variant?: 'default' | 'inverse';
  className?: string;
}

/**
 * Corporate mark for Meapal LogBook — a ledger spine with activity entries.
 * Uses the app's primary blue and foreground tokens.
 */
const LogoMark = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="32" height="32" rx="6" className="fill-primary" />
    {/* Ledger spine */}
    <rect x="8" y="7" width="2.5" height="18" rx="1" className="fill-primary-foreground" opacity="0.9" />
    {/* Activity entry lines */}
    <rect x="13" y="9" width="12" height="2" rx="1" className="fill-primary-foreground" />
    <rect x="13" y="14" width="9" height="2" rx="1" className="fill-primary-foreground" opacity="0.75" />
    <rect x="13" y="19" width="11" height="2" rx="1" className="fill-primary-foreground" opacity="0.55" />
    {/* Completion indicator */}
    <circle cx="24" cy="22" r="2.5" className="fill-primary-foreground" opacity="0.4" />
  </svg>
);

export const AppLogo: React.FC<AppLogoProps> = ({
  showWordmark = true,
  compact = false,
  large = false,
  variant = 'default',
  className,
}) => {
  const markSize = large ? 40 : compact ? 28 : 32;
  const isInverse = variant === 'inverse';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={markSize} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'font-semibold tracking-tight',
              isInverse ? 'text-white' : 'text-foreground',
              large ? 'text-xl' : compact ? 'text-sm' : 'text-[15px]',
            )}
          >
            Meapal LogBook
          </span>
          <span
            className={cn(
              'font-medium uppercase tracking-widest mt-0.5',
              isInverse ? 'text-white/60' : 'text-muted-foreground',
              large ? 'text-[11px]' : 'text-[10px]',
            )}
          >
            Ricoh · Internal
          </span>
        </div>
      )}
    </div>
  );
};

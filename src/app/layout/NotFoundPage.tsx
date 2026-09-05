import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  const handleReturnHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <AppLogo large className="justify-center mb-12" />

        <p className="text-[5rem] font-semibold leading-none tracking-tight text-muted-foreground/20 tabular-nums">
          404
        </p>

        <h1 className="mt-4 text-lg font-semibold text-foreground tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The page you requested doesn&apos;t exist or may have been moved. Check the URL, or return
          to the workspace home.
        </p>

        <Button onClick={handleReturnHome} className="mt-8 gap-2">
          <ArrowLeft className="size-4" />
          Return home
        </Button>

        <p className="mt-10 text-[11px] text-muted-foreground">
          Meapal LogBook · Ricoh internal system
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { logEvent } from '../lib/telemetry';
import { Button } from '@/components/ui/button';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logEvent('app_error', {
      message: error.message,
      stack: (info.componentStack || '').slice(0, 500),
    });
    console.error(error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-bold text-foreground">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This screen hit an unexpected error. Your logged activities are safe on the server.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload
            </Button>
            <Button onClick={() => this.setState({ error: null })}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }
}

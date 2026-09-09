import { useMemo } from 'react';
import { Toaster } from './components/ui/sonner';
import { Container, Theme } from './settings/types';
import { ActivityReportApp } from './app/ActivityReportApp';
import { AppErrorBoundary } from './app/AppErrorBoundary';
import { NotFoundPage } from './app/layout/NotFoundPage';

const theme: Theme = 'light';
// only use 'centered' container for standalone components, never for full page apps or websites.
const container: Container = 'none';

// Workspace routes: the logbook root plus the manager tabs.
const KNOWN_ROUTES = new Set(['/', '/analytics', '/reports', '/admin']);

const isKnownPath = (pathname: string) => {
  const normalized = (pathname.replace(/\/+$/, '') || '/').toLowerCase();
  return KNOWN_ROUTES.has(normalized);
};

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  const isNotFound = useMemo(() => !isKnownPath(window.location.pathname), []);

  const generatedComponent = useMemo(() => {
    if (isNotFound) {
      return <NotFoundPage />;
    }
    // THIS IS WHERE THE TOP LEVEL GENRATED COMPONENT WILL BE RETURNED!
    return <ActivityReportApp />;
  }, [isNotFound]);

  if (container === 'centered') {
    return (
      <>
        <Toaster position="top-right" />
        <div className="h-full w-full flex flex-col items-center justify-center">
          {generatedComponent}
        </div>
      </>
    );
  } else {
    return (
      <>
        <Toaster position="top-right" />
        <AppErrorBoundary>{generatedComponent}</AppErrorBoundary>
      </>
    );
  }
}

export default App;

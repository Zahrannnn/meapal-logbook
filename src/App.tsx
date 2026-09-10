import { useMemo } from 'react';
import { Toaster } from './components/ui/sonner';
import { ActivityReportApp } from './app/ActivityReportApp';
import { AppErrorBoundary } from './app/AppErrorBoundary';
import { NotFoundPage } from './app/layout/NotFoundPage';

// Workspace routes: the logbook root plus the manager tabs.
const KNOWN_ROUTES = new Set(['/', '/analytics', '/reports', '/admin']);

const isKnownPath = (pathname: string) => {
  const normalized = (pathname.replace(/\/+$/, '') || '/').toLowerCase();
  return KNOWN_ROUTES.has(normalized);
};

function App() {
  const isNotFound = useMemo(() => !isKnownPath(window.location.pathname), []);

  const generatedComponent = useMemo(() => {
    if (isNotFound) {
      return <NotFoundPage />;
    }
    // THIS IS WHERE THE TOP LEVEL GENRATED COMPONENT WILL BE RETURNED!
    return <ActivityReportApp />;
  }, [isNotFound]);

  return (
    <>
      <Toaster position="top-right" />
      <AppErrorBoundary>{generatedComponent}</AppErrorBoundary>
    </>
  );
}

export default App;

import { useEffect, useRef } from 'react';
import { formatDateValue } from '@/components/date-picker';
import { logEvent } from '../../../lib/telemetry';

// StrictMode double-mounts effects in dev; dedupe so one page view = one event.
let lastDashboardViewAt = 0;

/** Telemetry for the dashboard: one view event on mount, date-change events afterwards. */
export const useDashboardTelemetry = (selectedDate: Date) => {
  const previousDateRef = useRef(selectedDate);
  useEffect(() => {
    if (previousDateRef.current !== selectedDate) {
      previousDateRef.current = selectedDate;
      logEvent('date_change', { to: formatDateValue(selectedDate) });
    }
  }, [selectedDate]);
  useEffect(() => {
    const now = Date.now();
    if (now - lastDashboardViewAt > 1000) {
      lastDashboardViewAt = now;
      logEvent('dashboard_view', { selected_date: formatDateValue(selectedDate) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

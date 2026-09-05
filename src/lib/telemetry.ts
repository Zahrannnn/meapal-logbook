/**
 * Minimal event telemetry for validating UX hypotheses (Lean UX loop).
 *
 * Sinks, smallest-first:
 *  1. `console.info` — visible in devtools during dogfooding sessions.
 *  2. `window.__logbookTelemetry` — ring buffer scripts/tests can read.
 *
 * Swap in a backend endpoint here when one exists; call sites stay unchanged.
 */

export type TelemetryEventName =
  | 'dashboard_view'
  | 'date_change'
  | 'bar_click'
  | 'modal_open'
  | 'modal_save'
  | 'modal_cancel'
  | 'nudge_click'
  | 'nudge_dismiss'
  | 'duplicate_click'
  | 'period_progress_view'
  | 'period_cta_click'
  | 'app_error';

export type TelemetryPayload = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    __logbookTelemetry?: Array<{ event: TelemetryEventName; ts: string } & TelemetryPayload>;
  }
}

export function logEvent(name: TelemetryEventName, payload: TelemetryPayload = {}): void {
  const entry = { event: name, ...payload, ts: new Date().toISOString() };

  // eslint-disable-next-line no-console
  console.info('[telemetry]', entry);

  if (typeof window !== 'undefined') {
    window.__logbookTelemetry = window.__logbookTelemetry ?? [];
    window.__logbookTelemetry.push(entry);
  }
}

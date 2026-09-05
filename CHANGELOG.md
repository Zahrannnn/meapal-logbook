# Changelog

All notable changes to Meapal LogBook are documented here. The latest release is at the top; each release has employee-facing notes plus a short "For the team" section.

## [1.2.0] — 2026-09-02 · Pay periods, work calendar & streaks

### New

- **Pay period progress** — a new card shows how you're tracking against the 160h target for the current period (the 21st → 20th), with a marker for where you're expected to be by today, a "behind/ahead of pace" badge, and a "Log today's work" shortcut when you're behind.
- **Streaks 🔥** — log at least one entry on each working day to build your streak. Friday and Saturday never break it, and working a rest day extends it.
- **The calendar drives everything** — pick any date and the pay period card, weekly chart, and activity list all switch to that date's context. Previous pay periods show their own totals and a "Closed at X%" summary.
- **Weekly chart, reworked** — shows the full Saturday → Friday week of the selected date, with all seven days, your selected day highlighted, and clickable bars that open that day.
- **Date & time pickers** — a calendar popover on every date field (deadline, recurring start/end, dashboard date) and a 15-minute time picker for start/end times. No more typing into raw inputs.

### Improved

- **Rest days, respected** — the working week is Sunday to Thursday. Friday and Saturday never trigger reminders or break your streak, and anything you log on them still counts toward your pay-period hours and extends your streak.
- **Calmer date changes** — switching dates no longer flashes a loading screen over the whole app; content updates in place, and moving inside the loaded period is instant.
- **Weekly chart empty weeks** get a designed placeholder with a one-click shortcut to log the first entry.

### Fixed

- Entries logged between midnight and ~3 AM could be saved with **yesterday's date**.
- Changing dates flashed a **full-page loading spinner** on every change.
- The "This week" counter could exclude the selected day and disagree with the chart, depending on timezone.

### For the team

- The dashboard fetches one full pay period per selection (keyed by `userId:periodStart`); the calendar is the single context controller — see `getPayPeriod` / `getWorkWeek` in `src/lib/payPeriod.ts`.
- Targets are configured per period in `PERIOD_TARGET_HOURS` (holidays aren't modeled in workday counts yet).
- New telemetry events: `period_progress_view`, `period_cta_click`.

## [1.1.0] — 2026-09-02 · A fresh look and faster logging

### New

- **Duplicate any activity** — one click on an entry's copy icon opens a prefilled form for a new entry.
- **Missed-day reminder** — if a working day has no entries, the dashboard offers a one-click "Log it now" (dismissible; never shown on Fridays or Saturdays).
- **Daily summary header** — the metric cards now carry the selected date, so it's always clear which day they describe.

### Changed

- **A fresh, calmer look** across the app: new typeface (Manrope), tighter corners, solid buttons instead of gradients, a reworked logo, and clearer status colors. Built on the shadcn/ui component set.
- The weekly chart uses bars instead of a line, with whole-number axes and a week total in the header.
- The activity list shows a colored tile per project and quieter row actions.
- The pay period, weekly chart, and reminders now follow the date you select instead of always "today".

### Fixed

- Modals now close with **Escape** or by clicking outside, have proper titles for screen readers, and no longer show a broken-looking disabled save button.
- The profile screen no longer shows two close buttons or "1 skills".
- Keyboard focus is visible on every control.

### For the team

- Employee screens rebuilt on shadcn/ui + Radix (18 components installed under `src/components/ui`); Manrope is the app typeface.
- Added a telemetry event layer (`src/lib/telemetry.ts`) and a top-level error boundary.
- Lean UX experiments running: missed-day nudge (H1), duplicate action (H2), pay-period progress (H4) — see `logEvent` events for the signals.

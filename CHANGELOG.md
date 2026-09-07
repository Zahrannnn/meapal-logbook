# Changelog

All notable changes to Meapal LogBook are documented here. The latest release is at the top; each release has employee-facing notes plus a short "For the team" section.

## [1.3.0] — 2026-09-08 · Logging first: your day, your record, zero friction

### New

- **Logged hours are the hero** — the biggest element on the screen is today's logged hours in hours and minutes ("6h 30m"), with the daily target beside it. The screen answers "how many hours have I logged today?" before anything else.
- **Tiered daily targets** — main target 8h, stretch target 9h. The progress bar marks both; hours past 9h render as emerald overtime.
- **Pay period, compact** — the period card (main 160h, stretch 190h, overtime past 190h) sits beside the day hero as a one-row strip instead of a full-width section.
- **Personal Task Record 🏆** — fixed task limits are gone. Each user races their own best single-day task count, computed from their history. The hero compares today to it ("2 tasks today · 6 away from your best (8)") and celebrates a new record with a one-time confetti burst.
- **Save as draft & Drafts section** — park an unfinished activity ("Save as draft" in the dialog), find it under **Drafts** in the activities card, and resume it later. Drafts are per browser.
- **Auto-save recovery** — everything typed into the log form is saved as you type. After a crash, refresh, or accidental close, a banner asks "You have an unfinished activity. Continue where you left off?" with Continue / Discard.
- **One time-range menu** — start and end times merged into a single picker showing "9:00 AM – 5:00 PM" with quick-duration presets (30m–3h). Moving the start past the end slides the end along.
- **Undo delete** — deleting an entry no longer asks for confirmation. The row disappears instantly and a 5-second toast offers Undo; the network delete only happens after the undo window closes.

### Improved

- **Chronological day rail** — the activity list is a timeline: a time gutter (start over end), a rail with status-colored dots, entries sorted by start time, a bold duration column, and the day's total in the header ("3 · 5h logged").
- **Logging-first hierarchy** — "Log activity" is the page's primary CTA at the top right; the pay period and weekly overview are supporting context, with the weekly chart collapsed by default.
- **My Logbook** — the main navigation item (desktop, mobile drawer, and bottom tab) is renamed from "Dashboard" to match the product's mental model.
- **Instant everything** — submits, edits, and deletes apply optimistically: rows appear or collapse immediately with a brief saving shimmer, no global spinner, no confirm dialogs.
- **Branded notifications** — all toasts moved to Sonner, styled as design-system cards (Manrope, card surface, brand action buttons) and pinned top-center below the header.
- **Filter scoping** — search and project filters now apply to the activity list only; the hero, pay period, and weekly overview always show unfiltered truth.

### Fixed

- Over-target periods displayed **100%** instead of the real percentage; they now show the true figure ("118%") with a "+Xh over target" badge.
- Dropdown menus (projects, times) stretched to the full viewport height; they now size to their content and open below the trigger.
- A stale create-draft could be wiped by closing the modal; closing always preserves, only explicit Discard clears.
- The streak could ignore today's entries (backend end-date exclusivity), so logging today never extended it.
- The "0 hours" KPI rendered as "0m" instead of "0h".

### For the team

- Daily targets are constants in `src/lib/payPeriod.ts` (`DAILY_TARGET_HOURS`, `DAILY_STRETCH_HOURS`); period stretch = main target + `PERIOD_STRETCH_EXTRA_HOURS` (30).
- The Personal Task Record derives from the same year-scoped fetch as the streak (`taskBest` / `prevTaskBest`; today is excluded from the "previous best" so new records are detectable).
- The log form persists to localStorage on every change: `logbook:activity-draft` (single recovery entry, with `savedAt`) and `logbook:activity-drafts` (explicit drafts list). `onAfterSubmit` reconciles optimistic rows with the server response instead of refetching the world — the global loader never fires for activity writes.
- The backend's activity `endDate` filter is exclusive; the streak window compensates by extending one day.
- All toasts moved to Sonner (`src/components/ui/sonner.tsx`); react-hot-toast is no longer a dependency.
- New telemetry events: `modal_draft_saved`, `draft_saved`, `draft_resumed`, `draft_restored`.

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

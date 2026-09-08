# PRODUCT.md — Meapal LogBook

## Users

- **Team members** (primary): Ricoh/Corelia employees who log daily work activities. They open the app once or twice a day, log what they did, and leave. Speed and certainty matter more than depth.
- **Project managers**: review team activity, approve entries, watch period pace. Analytics and reports are their surfaces.
- **Administrators**: manage projects, teams, users, competencies.

## Product purpose

An internal daily activity reporting workspace for Ricoh teams. The core loop: open app, see today, log activity, see what's logged, done. The calendar (selected date) is the context controller: every number, list, and chart reflects the selected day and its pay period.

## Domain rules (design must respect these)

- Pay periods run the 21st to the 20th; the main period target is 160 hours with a 190-hour stretch target.
- Daily targets: main 8 hours, stretch 9 hours. Hours past the stretch target are overtime; on the period, hours past 190h are overtime.
- Working days are Sunday to Thursday. Friday and Saturday are rest days: no targets, no alerts, muted visuals, but anything logged still counts.
- Daily hour targets are fixed (8h main, 9h stretch), independent of the period math. Logged hours are the primary KPI and the most prominent element on the screen, formatted as hours and minutes ("6h 30m").
- Tasks have NO fixed daily limit. Instead each user has a Personal Task Record: the highest number of tasks they ever completed in a single day, computed from their own history. The UI compares today's count to that personal best ("2 away from your best") and celebrates a new record lightly (confetti once per day, never disruptive).
- Streak counts consecutive working days the user logged in real time — an entry only counts if it was created on the same calendar day it is dated. Backfilling past days in one sitting never inflates the streak; rest days still extend it when actually worked and logged that day.
- Hours are honest: real percentages past target ("118%", "+29h over target"), overlapping entries counted once.

## Tone

Calm, precise, internal-tool professional. Plain language ("Log activity", not "Create new activity record"). Encouraging without gamification pressure; the streak is a quiet chip, not a scoreboard.

## Anti-references

- Enterprise dashboard clutter: tile grids of vanity metrics.
- Analytics-first hierarchies that bury the logging loop.
- SaaS marketing styling inside the app surface (gradient heroes, display fonts in labels).
- Guilt-driven nudges; reminders state facts and offer one action.

## Strategic principles

1. Logging loop first; period progress and weekly analytics are supporting context.
2. One primary CTA ("Log activity"), pinned top-right; mobile carries it in the bottom tab.
3. Every number scoped to the selected day says so.
4. Rest days feel like rest days.
5. Never lose user input. Auto-save protects the activity being typed (recovery banner: "You have an unfinished activity"). "Save as draft" explicitly parks work in a Drafts section; auto-save recovery and saved drafts are separate layers.

## Register

product

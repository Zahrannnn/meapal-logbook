/**
 * In-app "What's new" content for the current release.
 * Keep in sync with CHANGELOG.md at the repo root — this module carries the
 * employee-facing highlights only; the changelog is the full source of truth.
 */

export interface WhatsNewSection {
  title: string;
  items: string[];
}

export interface WhatsNewRelease {
  version: string;
  date: string;
  title: string;
  sections: WhatsNewSection[];
}

export const CURRENT_RELEASE: WhatsNewRelease = {
  version: '1.2.0',
  date: '2026-09-02',
  title: 'Pay periods, work calendar & streaks',
  sections: [
    {
      title: 'Track your pay period',
      items: [
        'A new card shows your logged hours against the 160h target for the current period (the 21st → 20th), with a marker for where you should be by today.',
        'Behind pace? A "Log today\'s work" shortcut appears right on the card.',
      ],
    },
    {
      title: 'Streaks 🔥',
      items: [
        'Log at least one entry on each working day (Sunday to Thursday) to build your streak.',
        'Friday and Saturday never break it — and if you work a rest day, it counts.',
      ],
    },
    {
      title: 'The calendar is in charge',
      items: [
        'Pick any date and everything follows: the pay period card, the weekly chart, and your entries all switch to that date.',
        'Previous pay periods show their own totals with a "Closed at X%" summary.',
      ],
    },
    {
      title: 'Weekly chart',
      items: [
        'Shows the full Saturday → Friday week of the selected date, all seven days, with clickable bars that open that day.',
      ],
    },
  ],
};

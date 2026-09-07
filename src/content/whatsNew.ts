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
  version: '1.3.0',
  date: '2026-09-08',
  title: 'Logging first: your day, your record, zero friction',
  sections: [
    {
      title: 'Your day at a glance',
      items: [
        'Logged hours are now the hero of the screen, shown in hours and minutes ("6h 30m") the moment you open the app.',
        'Daily targets are clear: 8h main, 9h stretch — the bar marks both, and hours past 9h count as overtime.',
        'The "Log activity" button sits at the top of the page, exactly where you expect the main action.',
      ],
    },
    {
      title: 'Your Personal Task Record 🏆',
      items: [
        'No more fixed task limits. You race your own best: the highest number of tasks you ever completed in a single day.',
        'The hero shows how today compares — "2 away from your best" or "New personal record!" with a small celebration when you beat it.',
      ],
    },
    {
      title: 'Never lose an entry',
      items: [
        'Everything you type is saved as you type. Closed the tab by accident? You\'ll be asked to continue where you left off.',
        'New "Save as draft" parks an activity in your Drafts section, and "Undo" gives you 5 seconds to reverse a delete.',
      ],
    },
    {
      title: 'Faster logging',
      items: [
        'Start and end times now live in one menu with quick-duration presets (30m to 3h) — no more clock math.',
        'Your entries appear on a chronological day rail with bold durations, and the pay period sits beside your day as a compact card (160h main, 190h stretch, overtime tracked).',
        'Projects and times open in neat dropdowns sized to their content, and saving is instant: changes appear immediately, no spinners.',
      ],
    },
  ],
};

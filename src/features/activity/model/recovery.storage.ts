import type { ActivityDraft } from './activity.types';

// The in-progress create draft survives refreshes and crashes: written on every
// change (with a timestamp, for the recovery banner), restored on app start,
// cleared on save, discard, or switching to edit. Explicit "Save as draft" work
// lives separately in drafts.storage.
const DRAFT_STORAGE_KEY = 'logbook:activity-draft';

export interface StoredRecovery {
  savedAt: string;
  draft: ActivityDraft;
}

export const readStoredRecovery = (): StoredRecovery | null => {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<StoredRecovery> | ActivityDraft;
    // Legacy shape: the raw draft without a timestamp.
    if (typeof (parsed as StoredRecovery).savedAt !== 'string') {
      return { savedAt: new Date().toISOString(), draft: normalizeActivityDraft(parsed as ActivityDraft) };
    }
    return { savedAt: (parsed as StoredRecovery).savedAt, draft: normalizeActivityDraft((parsed as StoredRecovery).draft) };
  } catch {
    return null;
  }
};

export const storeRecovery = (recovery: StoredRecovery | null) => {
  try {
    if (recovery) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(recovery));
    } else {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  } catch {
    // storage unavailable (private mode) — the draft just won't persist
  }
};

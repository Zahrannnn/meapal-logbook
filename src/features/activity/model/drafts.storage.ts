import type { ActivityDraft } from './activity.types';
import { createDefaultActivityDraft } from './activity.draft';
import { normalizeActivityDraft } from './activity.schema';

// Both sides go through the same normalize pass — zod's output key order can
// differ from the raw default literal, and string comparison needs exact match.
const EMPTY_DRAFT_JSON = JSON.stringify(normalizeActivityDraft(createDefaultActivityDraft()));

export const isDefaultDraft = (draft: ActivityDraft) =>
  JSON.stringify(normalizeActivityDraft(draft)) === EMPTY_DRAFT_JSON;

/**
 * Two distinct persistence layers, by design:
 *
 * 1. Recovery (`logbook:activity-draft`, single entry) — what the user is
 *    typing RIGHT NOW. Written automatically on every change so an accidental
 *    close, refresh, or crash never loses input. Cleared on submit or discard.
 *
 * 2. Drafts (`logbook:activity-drafts`, a list) — work the user explicitly
 *    parked via "Save as draft". Listed in the Drafts section, resumable later,
 *    removed when resumed or deleted.
 */

export interface StoredDraft {
  id: string;
  savedAt: string;
  /** The dashboard day the entry was being logged for. */
  entryDate: string;
  draft: ActivityDraft;
}

const DRAFTS_KEY = 'logbook:activity-drafts';
export const DRAFTS_CHANGED_EVENT = 'logbook:drafts-changed';

const notifyDraftsChanged = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(DRAFTS_CHANGED_EVENT));
};

/** Subscribes to draft-list changes (save, resume, delete) for reactive counts. */
export const subscribeDraftsChanged = (handler: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(DRAFTS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(DRAFTS_CHANGED_EVENT, handler);
};

export const listDrafts = (): StoredDraft[] => {
  try {
    const stored = localStorage.getItem(DRAFTS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as StoredDraft[];
    return parsed
      .map((entry) => ({ ...entry, draft: normalizeActivityDraft(entry.draft) }))
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
};

export const addDraft = (draft: ActivityDraft, entryDate: string): StoredDraft => {
  const stored: StoredDraft = {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    entryDate,
    draft: normalizeActivityDraft(draft),
  };
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify([stored, ...listDrafts()]));
  } catch {
    // storage unavailable (private mode) — the draft just won't persist
  }
  notifyDraftsChanged();
  return stored;
};

export const removeDraft = (id: string): void => {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(listDrafts().filter((entry) => entry.id !== id)));
  } catch {
    // ignore
  }
  notifyDraftsChanged();
};

/** When the auto-saved recovery draft was last touched, for the recovery banner. */
export const getRecoverySavedAt = (): string | null => {
  try {
    const stored = localStorage.getItem('logbook:activity-draft');
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { savedAt?: string };
    return parsed.savedAt ?? null;
  } catch {
    return null;
  }
};

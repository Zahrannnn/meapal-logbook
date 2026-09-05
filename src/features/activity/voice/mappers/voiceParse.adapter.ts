import type { ParsedVoiceActivity } from '../../../../lib/api';
import type { ActivityDraft } from '../../model/activity.types';

const validStatuses: ActivityDraft['status'][] = ['completed', 'in-progress', 'pending-approval', 'blocked'];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const normalizeTime = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (timePattern.test(trimmed)) {
    return trimmed;
  }

  const meridiemMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!meridiemMatch) {
    return undefined;
  }

  const [, rawHour, rawMinute = '00', rawMeridiem] = meridiemMatch;
  let hour = parseInt(rawHour, 10);
  if (Number.isNaN(hour) || hour < 1 || hour > 12) {
    return undefined;
  }

  if (rawMeridiem.toLowerCase() === 'pm' && hour !== 12) {
    hour += 12;
  }

  if (rawMeridiem.toLowerCase() === 'am' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${rawMinute}`;
};

export const adaptParsedVoiceActivityToDraftPatch = (
  parsed: ParsedVoiceActivity,
  currentDraft: ActivityDraft,
): Partial<ActivityDraft> => ({
  title: parsed.title?.trim() || currentDraft.title,
  description: parsed.description?.trim() || currentDraft.description,
  notes: parsed.notes?.trim() || currentDraft.notes,
  projectId: parsed.projectId ? parsed.projectId.toString() : currentDraft.projectId,
  startTime: normalizeTime(parsed.startTime) || currentDraft.startTime,
  endTime: normalizeTime(parsed.endTime) || currentDraft.endTime,
  status: validStatuses.includes(parsed.status as ActivityDraft['status'])
    ? (parsed.status as ActivityDraft['status'])
    : currentDraft.status,
});

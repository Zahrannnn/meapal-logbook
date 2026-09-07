/** `HH:mm` string helpers shared by the time pickers and the activity form. */

export const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const toHHMM = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** "1h", "45m", "1h 30m" */
export const formatDurationLabel = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
};

/** Decimal hours (6.5) as hours and minutes ("6h 30m"); 0 renders "0h". */
export const formatHoursMinutes = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes === 0) return '0h';
  return formatDurationLabel(totalMinutes);
};

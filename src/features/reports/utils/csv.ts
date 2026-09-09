/** Escapes a value for CSV output: quotes fields containing commas, quotes or newlines. */
export const csvField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

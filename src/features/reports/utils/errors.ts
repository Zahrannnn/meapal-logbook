/** Pulls a presentable message off an unknown thrown value for toast display. */
export const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

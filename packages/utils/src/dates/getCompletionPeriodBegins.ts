export const getCompletionPeriodBegins = (
  nextDue: Date,
  frequencyMinutes: number,
): Date => {
  return new Date(
    nextDue.getTime() -
      Math.min(8 * 60 * 60 * 1000, frequencyMinutes * 60 * 1000 * 0.2),
  );
};

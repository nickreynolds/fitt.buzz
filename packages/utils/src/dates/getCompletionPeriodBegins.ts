export const getCompletionPeriodBegins = (
  nextDue: Date,
  frequencyHours: number,
): Date => {
  return new Date(
    nextDue.getTime() -
      Math.max(8 * 60 * 60 * 1000, frequencyHours * 60 * 60 * 1000 * 0.2),
  );
};

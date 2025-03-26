export const parseTime = (timeString: string): number => {
  const timeSplit = timeString.split(":");
  if (timeSplit.length !== 2) {
    throw new Error("Invalid time string");
  }
  const [minutesString, secondsString] = timeString.split(":");
  if (minutesString?.length !== 2 || secondsString?.length !== 2) {
    throw new Error("Invalid time string");
  }
  const minutes = parseInt(minutesString);
  const seconds = parseInt(secondsString);
  if (isNaN(minutes) || isNaN(seconds)) return 0;
  return minutes * 60 + seconds;
};

export function getFriendlyTime(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (minutes < 2) {
    return "about a minute";
  } else if (minutes < 10) {
    return "about 5 minutes";
  } else if (minutes < 45) {
    return "about 30 minutes";
  } else if (hours < 1.5) {
    return "an hour";
  } else if (hours < 6) {
    return `${Math.round(hours)} hours`;
  } else if (hours < 18) {
    return "about half a day";
  } else if (hours < 30) {
    return "about 1 day";
  } else if (hours < 42) {
    return "a day and a half";
  } else if (days < 6) {
    return `${days} days`;
  } else if (days < 10) {
    return "about a week";
  } else if (days < 12) {
    return "a week and a half";
  } else if (days < 14) {
    return "two weeks";
  } else {
    return "more than 2 weeks";
  }
}

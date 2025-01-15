interface Task {
  title: string;
  recurring: boolean;
  frequencyHours: number;
  nextDue: Date;
}

export const bootstrapTasks: Task[] = [
  {
    title: "Water Plants",
    recurring: true,
    frequencyHours: 168,
    nextDue: new Date("2025-01-20 17:00:00+00"),
  },
  {
    title: "Push Weights",
    recurring: true,
    frequencyHours: 168,
    nextDue: new Date("2025-01-20 05:51:00+00"),
  },
  {
    title: "Pull Weights",
    recurring: true,
    frequencyHours: 168,
    nextDue: new Date("2025-01-16 14:41:00+00"),
  },
  {
    title: "1 Hour Leetcode",
    recurring: true,
    frequencyHours: 24,
    nextDue: new Date("2025-01-11 17:45:00+00"),
  },
  {
    title: "Go Outside",
    recurring: true,
    frequencyHours: 24,
    nextDue: new Date("2025-01-14 13:08:00+00"),
  },
  {
    title: "1 Hour Zwift",
    recurring: true,
    frequencyHours: 168,
    nextDue: new Date("2025-01-20 17:00:00+00"),
  },
];

"use client";

import { getFriendlyTime } from "@acme/utils";

interface TimeUntilOverdueBadgeProps {
  nextDue: Date;
  className?: string;
}

export function TimeUntilOverdueBadge({
  nextDue,
  className,
}: TimeUntilOverdueBadgeProps) {
  const now = new Date();
  const secondsUntilDue = Math.max(
    0,
    Math.floor((nextDue.getTime() - now.getTime()) / 1000),
  );
  const friendlyTime = getFriendlyTime(secondsUntilDue);

  return (
    <span
      className={`ml-2 inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-foreground ${className ?? ""}`}
    >
      due in {friendlyTime}
    </span>
  );
}

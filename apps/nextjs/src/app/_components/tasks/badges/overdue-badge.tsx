"use client";

interface OverdueBadgeProps {
  className?: string;
}

export function OverdueBadge({ className }: OverdueBadgeProps) {
  return (
    <span
      className={`ml-2 inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive ${className ?? ""}`}
    >
      overdue
    </span>
  );
}

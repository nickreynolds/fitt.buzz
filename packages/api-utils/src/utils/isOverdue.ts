import type { RouterOutputs } from "@acme/api";

export default function isOverdue(
  task: RouterOutputs["task"]["getTask"] | undefined,
): boolean {
  if (!task) {
    return false;
  }

  const now = new Date();
  const nextDue = new Date(task.nextDue);

  // If the task is recurring, we need to check if we're in the completion period
  if (task.recurring && task.completionPeriodBegins) {
    const completionPeriodBegins = new Date(task.completionPeriodBegins);
    return now > completionPeriodBegins && now > nextDue;
  }

  // For non-recurring tasks, simply check if the due date has passed
  return now > nextDue;
}

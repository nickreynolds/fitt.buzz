import type { RouterOutputs } from "@acme/api";

export default function isCompleted(
  task: RouterOutputs["task"]["getTask"],
): boolean {
  if (task?.recurring) {
    return (
      (task.completionPeriodBegins &&
        task.lastCompleted &&
        task.lastCompleted > task.completionPeriodBegins) ??
      false
    );
  } else {
    return !!task?.lastCompleted;
  }
}

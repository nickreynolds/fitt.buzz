import type { RouterOutputs } from "@acme/api";

export default function inCompletionPeriod(
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number],
): boolean {
  return (
    (!task.recurring ||
      (task.completionPeriodBegins &&
        new Date() > task.completionPeriodBegins)) ??
    false
  );
}

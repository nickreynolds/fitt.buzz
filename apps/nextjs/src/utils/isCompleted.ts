import type { RouterOutputs } from "@acme/api";

export default function isCompleted(
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number],
): boolean {
  const alreadyCompleted =
    (!task.recurring && task.lastCompleted && true) ??
    (task.recurring &&
      task.completionPeriodBegins &&
      task.lastCompleted &&
      task.lastCompleted > task.completionPeriodBegins);

  return alreadyCompleted ?? false;
}

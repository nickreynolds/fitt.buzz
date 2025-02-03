import type { RouterOutputs } from "@acme/api";

export default function getNumCompletedChildTasks(
  task: RouterOutputs["task"]["getTask"],
): number {
  if (!task?.childTasks) {
    return 0;
  }
  let count = 0;
  for (const childTask of task.childTasks) {
    if (
      task.recurring &&
      childTask.lastCompleted &&
      task.completionPeriodBegins &&
      childTask.lastCompleted > task.completionPeriodBegins
    ) {
      count++;
    }

    if (!task.recurring && childTask.lastCompleted) {
      count++;
    }
  }
  return count;
}

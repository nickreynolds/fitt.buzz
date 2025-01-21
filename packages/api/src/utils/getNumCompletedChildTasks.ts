import type { RouterOutputs } from "..";

export default function getNumCompletedChildTasks(
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number],
): number {
  return task.childTasks.filter(
    (childTask) =>
      (task.recurring &&
        childTask.lastCompleted &&
        task.completionPeriodBegins &&
        childTask.lastCompleted > task.completionPeriodBegins) ||
      (!task.recurring && childTask.lastCompleted),
  ).length;
}

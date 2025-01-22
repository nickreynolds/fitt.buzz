import type { RouterOutputs } from "@acme/api";

export default function getNumCompletedChildTasks(
  task: RouterOutputs["task"]["getTask"],
): number {
  if (!task?.childTasks) {
    return 0;
  }
  let count = 0;
  for (const childTask of task.childTasks) {
    console.log("iterate over child task.");
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
  console.log("2 numCompletedChildTasks: ", count);
  return count;
  // return task.childTasks.filter(
  //   (childTask) =>
  //     (task.recurring &&
  //       childTask.lastCompleted &&
  //       task.completionPeriodBegins &&
  //       childTask.lastCompleted > task.completionPeriodBegins) ??
  //     (!task.recurring && childTask.lastCompleted),
  // ).length;
}

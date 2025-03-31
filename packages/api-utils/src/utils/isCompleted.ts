import type { RouterOutputs } from "@acme/api";

export default function isCompleted(
  task: RouterOutputs["task"]["getTask"],
  parentTask?: RouterOutputs["task"]["getTask"],
): boolean {
  if (parentTask) {
    console.log("parentTask", parentTask);
    if (parentTask.isSet) {
      console.log("yes parent is set.");
      if (parentTask.numCompletedSets === parentTask.numSets) {
        return true;
      }
      return false;
    }
  }

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

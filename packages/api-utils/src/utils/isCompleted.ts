import type { RouterOutputs } from "@acme/api";
import { TaskCompletionTypes } from "@acme/utils";

export default function isCompleted(
  task: RouterOutputs["task"]["getTask"],
  parentTask?: RouterOutputs["task"]["getTask"],
): boolean {
  if (task?.completionDataType === TaskCompletionTypes.WeightReps) {
    // TODO: check parent set completion
    return false;
  }

  if (parentTask) {
    if (parentTask.isSet) {
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

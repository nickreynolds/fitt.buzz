import type { RouterOutputs } from "@acme/api";

import getNumCompletedChildTasks from "./getNumCompletedChildTasks";
import inCompletionPeriod from "./inCompletionPeriod";
import isCompleted from "./isCompleted";

export default function canBeCompleted(
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number],
  parentTask?: RouterOutputs["task"]["getTask"],
): boolean {
  const inCompletion = inCompletionPeriod(task);
  console.log("canBeCompleted", task);
  if (parentTask) {
    if (parentTask.isSet) {
      if (parentTask.numCompletedSets === parentTask.numSets) {
        return false;
      }
      return true;
    }
  }

  const alreadyCompleted = isCompleted(task);

  const numChildTasks = task.childTasks?.length ?? 0;

  const numCompletedChildTasks = getNumCompletedChildTasks(task);

  if (task.isSet) {
    const numSets = task.numSets;
    for (const child of task.childTasks ?? []) {
      if (task.childTaskCompletionDataMap?.get(child.id)?.length !== numSets) {
        return false;
      }
    }

    return (!alreadyCompleted && inCompletion) || false;
  }

  const canBeCompleted =
    inCompletion &&
    numCompletedChildTasks === numChildTasks &&
    !alreadyCompleted;

  return canBeCompleted || false;
}

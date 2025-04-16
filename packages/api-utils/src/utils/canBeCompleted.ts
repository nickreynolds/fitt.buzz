import type { RouterOutputs } from "@acme/api";

import getNumCompletedChildTasks from "./getNumCompletedChildTasks";
import inCompletionPeriod from "./inCompletionPeriod";
import isCompleted from "./isCompleted";

export default function canBeCompleted(
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number],
  parentTask?: RouterOutputs["task"]["getTask"],
): boolean {
  const inCompletion = inCompletionPeriod(task);
  if (parentTask) {
    if (parentTask.isSet) {
      if (parentTask.numCompletedSets === parentTask.numSets) {
        return false;
      }

      // if current task has more completions than other children, return false
      const numCompletedThisChild =
        parentTask.childTaskCompletionDataMap?.get(task.id)?.length ?? 0;

      for (const [
        key,
        value,
      ] of parentTask.childTaskCompletionDataMap?.entries() ?? []) {
        if (key === task.id) {
          continue;
        }
        if (value.length < numCompletedThisChild) {
          return false;
        }
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

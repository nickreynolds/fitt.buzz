import type { RouterOutputs } from "@acme/api";

import getNumCompletedChildTasks from "./getNumCompletedChildTasks";

export default function canBeCompleted(
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number],
): boolean {
  const inCompletionPeriod =
    !task.recurring ||
    (task.completionPeriodBegins && new Date() > task.completionPeriodBegins);

  const alreadyCompleted =
    (!task.recurring && task.lastCompleted) ??
    (task.recurring &&
      task.completionPeriodBegins &&
      task.lastCompleted &&
      task.lastCompleted > task.completionPeriodBegins);

  const numChildTasks = task.childTasks?.length;

  const numCompletedChildTasks = getNumCompletedChildTasks(task);

  const canBeCompleted =
    inCompletionPeriod &&
    numCompletedChildTasks === numChildTasks &&
    !alreadyCompleted;

  return canBeCompleted ?? false;
}

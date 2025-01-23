import type { RouterOutputs } from "@acme/api";

import getNumCompletedChildTasks from "./getNumCompletedChildTasks";
import isCompleted from "./isCompleted";

export default function canBeCompleted(
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number],
): boolean {
  const inCompletionPeriod =
    !task.recurring ||
    (task.completionPeriodBegins && new Date() > task.completionPeriodBegins);

  const alreadyCompleted = isCompleted(task);

  const numChildTasks = task.childTasks?.length ?? 0;

  const numCompletedChildTasks = getNumCompletedChildTasks(task);

  const canBeCompleted =
    inCompletionPeriod &&
    numCompletedChildTasks === numChildTasks &&
    !alreadyCompleted;

  return canBeCompleted ?? false;
}

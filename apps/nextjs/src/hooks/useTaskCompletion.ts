import { usePathname, useRouter } from "next/navigation";

import { api } from "~/trpc/react";

interface TaskCompletionData {
  result?: boolean | number;
  weight?: number;
  reps?: number;
  time?: number;
  weightUnit?: string;
}

interface UseTaskCompletionProps {
  taskId: string;
  parentTaskId: string | null;
  onComplete?: () => void;
}

export function useTaskCompletion({
  taskId,
  parentTaskId,
  onComplete,
}: UseTaskCompletionProps) {
  const utils = api.useUtils();
  const router = useRouter();
  const pathname = usePathname();
  const handleOptimisticUpdate = async (completionData: TaskCompletionData) => {
    const task = utils.task.getTask.getData({ id: taskId });
    const existingTaskCompletionData = task?.taskCompletionData ?? [];

    const promises = [];
    if (parentTaskId) {
      promises.push(utils.task.getTask.cancel({ id: parentTaskId }));
    }
    promises.push(utils.task.getTask.cancel({ id: taskId }));
    promises.push(utils.task.getAllMyActiveTasks.cancel());

    await Promise.all(promises);

    if (parentTaskId) {
      const parentTask = utils.task.getTask.getData({
        id: parentTaskId,
      });
      if (parentTask) {
        const updatedChildTasks = parentTask.childTasks?.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              lastCompleted: new Date(),
              taskCompletionData: [
                JSON.stringify([...existingTaskCompletionData, completionData]),
              ],
            };
          }
          return t;
        });

        const existingChildTaskCompletionDataMap =
          parentTask.childTaskCompletionDataMap;
        const existingChildTaskCompletionData =
          existingChildTaskCompletionDataMap?.get(taskId) ?? [];

        existingChildTaskCompletionDataMap?.set(taskId, [
          ...existingChildTaskCompletionData,
          JSON.stringify(completionData),
        ]);

        let shouldIncrementParentSet = true;
        for (const [
          key,
          value,
        ] of existingChildTaskCompletionDataMap?.entries() ?? []) {
          if (key !== taskId) {
            if (
              value.length !==
              existingChildTaskCompletionDataMap?.get(taskId)?.length
            ) {
              shouldIncrementParentSet = false;
            }
          }
        }

        utils.task.getTask.setData(
          { id: parentTaskId },
          {
            ...parentTask,
            childTasks: updatedChildTasks,
            childTaskCompletionDataMap: existingChildTaskCompletionDataMap,
            numCompletedSets:
              parentTask.isSet && shouldIncrementParentSet
                ? parentTask.numCompletedSets + 1
                : parentTask.numCompletedSets,
          },
        );
      }
    }

    if (task) {
      utils.task.getTask.setData(
        { id: taskId },
        {
          ...task,
          lastCompleted: new Date(),
          taskCompletionData: [
            JSON.stringify([...existingTaskCompletionData, completionData]),
          ],
        },
      );
    }

    const tasks = utils.task.getAllMyActiveTasks.getData();
    const updatedTasks = tasks?.filter((t) => t.id !== taskId);
    utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
  };

  const handleSettled = async () => {
    const promises = [];
    if (parentTaskId) {
      promises.push(utils.task.getTask.cancel({ id: parentTaskId }));
    }
    promises.push(utils.task.getTask.cancel({ id: taskId }));
    promises.push(utils.task.getAllMyActiveTasks.cancel());

    if (parentTaskId) {
      promises.push(utils.task.getTask.invalidate({ id: parentTaskId }));
    }
    promises.push(utils.task.getTask.invalidate({ id: taskId }));
    promises.push(utils.task.getAllMyActiveTasks.invalidate());

    promises.push(utils.task.shouldBlockFun.invalidate());

    await Promise.all(promises);

    onComplete?.();

    // if we're still looking at the task page, redirect
    if (pathname.includes(`/task/${taskId}`)) {
      if (parentTaskId) {
        router.push(`/task/${parentTaskId}`);
      } else {
        router.push("/");
      }
    }
  };

  return {
    handleOptimisticUpdate,
    handleSettled,
  };
}

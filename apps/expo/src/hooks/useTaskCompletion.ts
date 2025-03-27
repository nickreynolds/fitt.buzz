import { router } from "expo-router";

import { api } from "~/utils/api";

interface TaskCompletionData {
  result: boolean | number;
  weight?: number;
  reps?: number;
  time?: number;
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
            return { ...t, lastCompleted: new Date() };
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

        utils.task.getTask.setData(
          { id: parentTaskId },
          {
            ...parentTask,
            childTasks: updatedChildTasks,
            childTaskCompletionDataMap: existingChildTaskCompletionDataMap,
            numCompletedSets: parentTask.isSet
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

    const promises2 = [];
    if (parentTaskId) {
      promises2.push(utils.task.getTask.invalidate({ id: parentTaskId }));
    }
    promises2.push(utils.task.getTask.invalidate({ id: taskId }));
    promises2.push(utils.task.getAllMyActiveTasks.invalidate());

    await Promise.all(promises2);

    onComplete?.();

    if (parentTaskId) {
      router.push(`/task/${parentTaskId}`);
    } else {
      router.push("/");
    }
  };

  return {
    handleOptimisticUpdate,
    handleSettled,
  };
}

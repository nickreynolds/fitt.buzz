"use client";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";

export function CompleteTaskButton({
  taskId,
  parentTaskId,
}: {
  taskId: string;
  parentTaskId: string | null;
}) {
  //   const router = useRouter();
  const utils = api.useUtils();

  const completeTask = api.task.completeTask.useMutation({
    onMutate: async () => {
      // prevent any in-flight updates from overwriting this optimistic update
      // we'll get the updated data eventually
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

          utils.task.getTask.setData(
            { id: parentTaskId },
            { ...parentTask, childTasks: updatedChildTasks },
          );
        }
      }

      const task = utils.task.getTask.getData({ id: taskId });
      if (task) {
        utils.task.getTask.setData(
          { id: taskId },
          { ...task, lastCompleted: new Date() },
        );
      }

      // remove regular task if found
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== taskId);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
      const promises = [];
      if (parentTaskId) {
        promises.push(utils.task.getTask.invalidate({ id: parentTaskId }));
      }
      promises.push(utils.task.getTask.invalidate({ id: taskId }));
      promises.push(utils.task.getAllMyActiveTasks.invalidate());

      await Promise.all(promises);
    },
  });

  return (
    <Button
      variant="primary"
      onClick={() => completeTask.mutate({ id: taskId })}
      className="motion-preset-bounce flex items-center gap-2"
    >
      Complete Task
    </Button>
  );
}

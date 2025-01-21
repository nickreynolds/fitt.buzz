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
    onMutate: () => {
      console.log("on mutate.");

      if (parentTaskId) {
        console.log("yes there is a parent task.");
        const parentTask = utils.task.getTask.getData({
          id: parentTaskId,
        });
        if (parentTask) {
          console.log("parentTaskBefore: ", parentTask);
          const updatedChildTasks = parentTask.childTasks.map((t) => {
            if (t.id === taskId) {
              return { ...t, lastCompleted: new Date() };
            }
            return t;
          });
          //   parentTask.childTasks = updatedChildTasks;
          //   console.log("parentTask after: ", parentTask);
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
      if (parentTaskId) {
        await utils.task.getTask.invalidate({ id: parentTaskId });
      }
      await utils.task.getTask.invalidate({ id: taskId });
      await utils.task.getAllMyActiveTasks.invalidate();
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

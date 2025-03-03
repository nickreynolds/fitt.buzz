"use client";

import React from "react";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";

export function CompleteWeightRepsTaskButton({
  taskId,
  parentTaskId,
}: {
  taskId: string;
  parentTaskId: string | null;
}) {
  //   const router = useRouter();
  const utils = api.useUtils();

  const [weight, setWeight] = React.useState(0);
  const [reps, setReps] = React.useState(0);

  const completeTask = api.task.completeWeightRepsTask.useMutation({
    onMutate: async (data) => {
      // prevent any in-flight updates from overwriting this optimistic update
      // we'll get the updated data eventually

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

          console.log(
            "existingChildTaskCompletionDataMap 1",
            existingChildTaskCompletionDataMap,
          );
          existingChildTaskCompletionDataMap?.set(taskId, [
            ...existingChildTaskCompletionData,
            JSON.stringify({
              weight: data.weight,
              reps: data.reps,
              weightUnit: "lbs",
            }),
          ]);
          console.log(
            "existingChildTaskCompletionDataMap 2",
            existingChildTaskCompletionDataMap,
          );

          utils.task.getTask.setData(
            { id: parentTaskId },
            {
              ...parentTask,
              childTasks: updatedChildTasks,
              childTaskCompletionDataMap: existingChildTaskCompletionDataMap,
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
              JSON.stringify([
                ...existingTaskCompletionData,
                { weight: 10, reps: 10, weightUnit: "lbs" },
              ]),
            ],
          },
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
    },
  });

  return (
    <div className="flex flex-row">
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(parseInt(e.target.value))}
        className="w-14"
      />
      <input
        type="number"
        value={reps}
        onChange={(e) => setReps(parseInt(e.target.value))}
        className="w-12"
      />
      <Button
        variant="primary"
        onClick={() =>
          completeTask.mutate({
            id: taskId,
            weight: weight,
            reps: reps,
            weightUnit: "lbs",
          })
        }
        className="motion-preset-bounce flex items-center gap-2"
      >
        Complete Task
      </Button>
    </div>
  );
}

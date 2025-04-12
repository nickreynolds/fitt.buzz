"use client";

import React from "react";

import { canBeCompleted } from "@acme/api-utils";
import { Button } from "@acme/ui/button";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/trpc/react";
import { NumericInputWithButtons } from "../../shared/numeric-input-with-buttons";

interface CompleteWeightRepsTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteWeightRepsTaskButton({
  taskId,
  parentTaskId,
}: CompleteWeightRepsTaskButtonProps) {
  const [weight, setWeight] = React.useState(0);
  const [reps, setReps] = React.useState(0);
  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

  const utils = api.useUtils();

  const task = utils.task.getTask.getData({ id: taskId });
  const parentTask = utils.task.getTask.getData({ id: parentTaskId ?? "" });
  React.useEffect(() => {
    if (parentTask) {
      const numCompletedSets = parentTask.numCompletedSets;
      const prevCompletions =
        parentTask.prevChildTaskCompletionDataMap?.get(taskId);
      if (prevCompletions && prevCompletions.length > 0) {
        const prevCompletion1 =
          prevCompletions[
            Math.min(numCompletedSets, prevCompletions.length - 1)
          ];
        if (prevCompletion1) {
          const prevCompletion = JSON.parse(prevCompletion1) as {
            weight: number;
            reps: number;
          };
          setWeight(prevCompletion.weight);
          setReps(prevCompletion.reps);
        }
      }
    }
  }, [parentTask, taskId]);

  const completeTask = api.task.completeWeightRepsTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({
        weightUnit: "lbs",
        weight,
        reps,
      });
    },
    onSettled: handleSettled,
  });

  if (!task) {
    return <div />;
  }

  return (
    <div className="flex flex-row">
      {canBeCompleted(task, parentTask) && (
        <>
          <NumericInputWithButtons
            value={weight}
            onChange={setWeight}
            increment={2.5}
          />
          <NumericInputWithButtons
            value={reps}
            onChange={setReps}
            increment={1}
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
            Complete
          </Button>
        </>
      )}
    </div>
  );
}

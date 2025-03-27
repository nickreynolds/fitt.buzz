import React from "react";
import { Pressable, Text } from "react-native";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/utils/api";

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

  const completeTask = api.task.completeTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ result: true, weight, reps });
    },
    onSettled: handleSettled,
  });

  return (
    <Pressable
      onPress={() => completeTask.mutate({ id: taskId })}
      className="flex-row items-center justify-center rounded-lg bg-primary px-4 py-2"
    >
      <Text className="text-foreground">
        Complete ({weight}kg × {reps})
      </Text>
    </Pressable>
  );
}

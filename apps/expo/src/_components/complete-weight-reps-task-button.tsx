import React from "react";
import { Pressable, Text } from "react-native";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/utils/api";

interface CompleteWeightRepsTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
  weight: number;
  reps: number;
}

export function CompleteWeightRepsTaskButton({
  taskId,
  parentTaskId,
  weight,
  reps,
}: CompleteWeightRepsTaskButtonProps) {
  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

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

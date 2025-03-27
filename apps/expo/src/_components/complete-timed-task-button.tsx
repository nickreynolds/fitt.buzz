import React from "react";
import { Pressable, Text } from "react-native";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/utils/api";

interface CompleteTimedTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
  time: number;
}

export function CompleteTimedTaskButton({
  taskId,
  parentTaskId,
  time,
}: CompleteTimedTaskButtonProps) {
  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

  const completeTask = api.task.completeTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ result: true, time });
    },
    onSettled: handleSettled,
  });

  return (
    <Pressable
      onPress={() => completeTask.mutate({ id: taskId })}
      className="flex-row items-center justify-center rounded-lg bg-primary px-4 py-2"
    >
      <Text className="text-foreground">Complete ({time}s)</Text>
    </Pressable>
  );
}

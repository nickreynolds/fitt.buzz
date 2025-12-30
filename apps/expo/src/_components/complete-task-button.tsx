import React, { useState } from "react";
import { Pressable, Text } from "react-native";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/utils/api";
import { CompletionTimerDialog } from "./completion-timer-dialog";

interface CompleteTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteTaskButton({
  taskId,
  parentTaskId,
}: CompleteTaskButtonProps) {
  const [showTimer, setShowTimer] = useState(false);
  const utils = api.useUtils();
  const task = utils.task.getTask.getData({ id: taskId });

  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

  const completeTask = api.task.completeTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ result: true });
    },
    onSuccess: () => {
      if (task?.timeDelayAfterCompletion && task.timeDelayAfterCompletion > 0) {
        setShowTimer(true);
      }
    },
    onSettled: handleSettled,
  });

  return (
    <>
      <Pressable
        onPress={() => completeTask.mutate({ id: taskId })}
        className="flex-row items-center justify-center rounded-lg bg-primary px-4 py-2"
      >
        <Text className="text-foreground">Complete</Text>
      </Pressable>
      {task?.timeDelayAfterCompletion && task.timeDelayAfterCompletion > 0 && (
        <CompletionTimerDialog
          open={showTimer}
          onOpenChange={setShowTimer}
          initialSeconds={task.timeDelayAfterCompletion}
        />
      )}
    </>
  );
}

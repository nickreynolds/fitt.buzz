"use client";

import { Button } from "@acme/ui/button";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/trpc/react";

interface CompleteTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteTaskButton({
  taskId,
  parentTaskId,
}: CompleteTaskButtonProps) {
  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

  const completeTask = api.task.completeTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ result: true });
    },
    onSettled: handleSettled,
  });

  return (
    <Button
      variant="primary"
      onClick={() => completeTask.mutate({ id: taskId })}
      className="motion-preset-bounce flex items-center gap-2"
    >
      Complete
    </Button>
  );
}

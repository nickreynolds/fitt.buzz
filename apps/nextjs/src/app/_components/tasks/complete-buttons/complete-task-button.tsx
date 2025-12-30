"use client";

import { useState } from "react";

import { Button } from "@acme/ui/button";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/trpc/react";
import { CompletionTimerDialog } from "../../shared/completion-timer-dialog";

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
      <Button
        variant="primary"
        onClick={() => completeTask.mutate({ id: taskId })}
        className="motion-preset-bounce flex items-center gap-2"
      >
        Complete
      </Button>
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

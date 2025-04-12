"use client";

import React, { useRef, useState } from "react";

import { canBeCompleted, isCompleted } from "@acme/api-utils";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { parseEditValue } from "@acme/utils";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/trpc/react";
import { TimerDialog } from "../../shared/timer-dialog";

interface CompleteTimedTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteTimedTaskButton({
  taskId,
  parentTaskId,
}: CompleteTimedTaskButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState("0100");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utils = api.useUtils();
  const task = utils.task.getTask.getData({ id: taskId });
  const parentTask = utils.task.getTask.getData({ id: parentTaskId ?? "" });

  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

  const completeTask = api.task.completeTimedTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ time: parseEditValue(editValue) });
    },
    onSettled: handleSettled,
  });

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
            time: number;
          };
          setEditValue(formatEditValue(prevCompletion.time.toString()));
        }
      }
    }
  }, [parentTask, taskId, setEditValue]);

  if (!task) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 4) {
      // Only allow up to 4 digits
      setEditValue(value);
    }
  };

  const formatEditValue = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length <= 2) return value;
    if (value.length == 3) return `${value.slice(0, 1)}:${value.slice(1)}`;
    return `${value.slice(0, 2)}:${value.slice(2)}`;
  };

  const handleStartTimer = () => {
    const time = parseEditValue(editValue);
    if (time > 0) {
      setIsDialogOpen(true);
    }
  };

  const handleTimerComplete = (time: number) => {
    completeTask.mutate({ id: taskId, time });
    if (audioRef.current) {
      // eslint-disable-next-line
      audioRef.current.play();
    }
  };

  return (
    <>
      {canBeCompleted(task, parentTask) && (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={formatEditValue(editValue)}
            onChange={handleInputChange}
            className="w-20 border-b-2 border-none bg-transparent p-0 text-center text-2xl font-medium text-foreground outline-none"
            maxLength={5}
            placeholder="00:00"
          />
          <Button
            variant="primary"
            onClick={handleStartTimer}
            className="motion-preset-bounce flex items-center gap-2"
          >
            Start Timer
          </Button>
        </div>
      )}
      {!isCompleted(task, parentTask) && !canBeCompleted(task, parentTask) && (
        <span>cannot complete</span>
      )}

      <audio ref={audioRef} src="/sounds/meditation-bell.mp3" />
      <TimerDialog
        taskId={taskId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialTime={parseEditValue(editValue)}
        onTimerComplete={handleTimerComplete}
      />
    </>
  );
}

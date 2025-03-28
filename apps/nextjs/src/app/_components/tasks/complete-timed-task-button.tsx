"use client";

import React, { useState } from "react";

import { canBeCompleted, isCompleted } from "@acme/api-utils";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { formatTime, parseEditValue } from "@acme/utils";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/trpc/react";
import { TimerDialog } from "./timer-dialog";

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

      <TimerDialog
        taskId={taskId}
        parentTaskId={parentTaskId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialTime={parseEditValue(editValue)}
      />
    </>
  );
}

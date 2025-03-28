"use client";

import React, { useEffect, useRef } from "react";

import { canBeCompleted, isCompleted } from "@acme/api-utils";
import { useTimer } from "@acme/hooks";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/trpc/react";
import TimeDisplay from "./time-display";

interface TimerDialogProps {
  taskId: string;
  parentTaskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTime: number;
}

export function TimerDialog({
  taskId,
  parentTaskId,
  open,
  onOpenChange,
  initialTime,
}: TimerDialogProps) {
  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

  const utils = api.useUtils();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    time,
    setTime,
    originalTime,
    setOriginalTime,
    isRunning,
    isEditing,
    editValue,
    setEditValue,
    startEditing,
    handleBlur,
    togglePause,
    pauseTimer,
    onForcedProgressChange,
  } = useTimer({
    onTimerComplete: () => {
      completeTask.mutate({ id: taskId, time: originalTime });
      if (audioRef.current) {
        // eslint-disable-next-line
        audioRef.current.play();
      }
      onOpenChange(false);
    },
    initialTime,
  });

  const completeTask = api.task.completeTimedTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ time: originalTime });
    },
    onSettled: handleSettled,
  });

  // const parentTask = utils.task.getTask.getData({ id: parentTaskId ?? "" });
  const task = utils.task.getTask.getData({ id: taskId });

  // Set initial time when dialog opens
  useEffect(() => {
    if (open) {
      setTime(initialTime);
      setOriginalTime(initialTime);
      // togglePause(); // Start the timer immediately
    }
  }, [open, initialTime, setTime, setOriginalTime]);

  useEffect(() => {
    if (open) {
      togglePause(); // Start the timer immediately
    }
  }, [open, togglePause]);

  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8">
          <audio ref={audioRef} src="/sounds/meditation-bell.mp3" />
          <TimeDisplay
            time={time}
            originalTime={originalTime}
            isEditing={isEditing}
            editValue={editValue}
            isRunning={isRunning}
            onEditValueChange={setEditValue}
            onStartEditing={startEditing}
            onBlur={handleBlur}
            onKeyDown={() => {
              console.log("keydown");
            }}
            pauseTimer={pauseTimer}
            onNewAngle={onForcedProgressChange}
          />

          <Button
            variant="primary"
            onClick={() => togglePause()}
            className="motion-preset-bounce mt-8 flex items-center gap-2"
          >
            {isRunning ? "Pause" : "Start"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

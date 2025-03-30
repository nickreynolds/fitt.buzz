"use client";

import React, { useEffect } from "react";

import { useTimer } from "@acme/hooks";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { api } from "~/trpc/react";
import TimeDisplay from "./time-display";

interface TimerDialogProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTime: number;
  onTimerComplete: (time: number) => void;
}

export function TimerDialog({
  taskId,
  open,
  onOpenChange,
  initialTime,
  onTimerComplete,
}: TimerDialogProps) {
  const utils = api.useUtils();
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
    resetTimer,
  } = useTimer({
    onTimerComplete: () => {
      onTimerComplete(originalTime);
      onOpenChange(false);
    },
    initialTime,
  });

  const task = utils.task.getTask.getData({ id: taskId });

  // Set initial time when dialog opens
  useEffect(() => {
    if (open) {
      setTime(initialTime);
      setOriginalTime(initialTime);
    }
  }, [open, initialTime, setTime, setOriginalTime]);

  useEffect(() => {
    if (open) {
      togglePause(); // Start the timer immediately
    }
  }, [open]);

  if (!task) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetTimer();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8">
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

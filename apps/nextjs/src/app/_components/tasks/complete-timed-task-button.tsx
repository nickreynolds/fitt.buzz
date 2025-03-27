"use client";

import React, { useRef } from "react";

import { canBeCompleted, isCompleted } from "@acme/api-utils";
import { useTimer } from "@acme/hooks";
import { Button } from "@acme/ui/button";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/trpc/react";
import TimeDisplay from "./time-display";

interface CompleteTimedTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteTimedTaskButton({
  taskId,
  parentTaskId,
}: CompleteTimedTaskButtonProps) {
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
    // inputRef,
    setEditValue,
    startEditing,
    handleBlur,
    // handleKeyDown,
    togglePause,
    // addMinute,
    // resetTimer,
    pauseTimer,
    onForcedProgressChange,
  } = useTimer(() => {
    completeTask.mutate({ id: taskId, time: originalTime });
    if (audioRef.current) {
      // eslint-disable-next-line
      audioRef.current.play();
    }
  });

  const completeTask = api.task.completeTimedTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ time: originalTime });
    },
    onSettled: handleSettled,
  });

  const parentTask = utils.task.getTask.getData({ id: parentTaskId ?? "" });
  const task = utils.task.getTask.getData({ id: taskId });
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
          setTime(prevCompletion.time);
          setOriginalTime(prevCompletion.time);
        }
      }
    }
  }, [parentTask, taskId, setTime, setOriginalTime]);

  if (!task) {
    return <div />;
  }

  return (
    <div className="flex flex-row">
      <audio ref={audioRef} src="/sounds/meditation-bell.mp3" />
      {canBeCompleted(task, parentTask) && (
        <>
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
            // inputRef={inputRef}
            pauseTimer={pauseTimer}
            onNewAngle={onForcedProgressChange}
          />

          <Button
            variant="primary"
            onClick={() => togglePause()}
            className="motion-preset-bounce flex items-center gap-2"
          >
            {isRunning ? "Pause" : "Start"}
          </Button>
        </>
      )}
      {!isCompleted(task, parentTask) && !canBeCompleted(task, parentTask) && (
        <span>cannot complete</span>
      )}
    </div>
  );
}

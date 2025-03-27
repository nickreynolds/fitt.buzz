"use client";

import React, { useRef } from "react";

import { canBeCompleted, isCompleted } from "@acme/api-utils";
import { useTimer } from "@acme/hooks";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";
import { NumericInputWithButtons } from "./NumericInputWithButtons";
import TimeDisplay from "./time-display";

export function CompleteTimedTaskButton({
  taskId,
  parentTaskId,
}: {
  taskId: string;
  parentTaskId: string | null;
}) {
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
    addMinute,
    resetTimer,
    pauseTimer,
    onForcedProgressChange,
  } = useTimer(() => {
    console.log("timer done");
    completeTask.mutate({ id: taskId, time: originalTime });
    if (audioRef.current) {
      // eslint-disable-next-line
      audioRef.current.play();
    }
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

  const completeTask = api.task.completeTimedTask.useMutation({
    onMutate: async (data) => {
      const task = utils.task.getTask.getData({ id: taskId });
      const existingTaskCompletionData = task?.taskCompletionData ?? [];

      const promises = [];
      if (parentTaskId) {
        promises.push(utils.task.getTask.cancel({ id: parentTaskId }));
      }
      promises.push(utils.task.getTask.cancel({ id: taskId }));
      promises.push(utils.task.getAllMyActiveTasks.cancel());

      await Promise.all(promises);

      if (parentTaskId) {
        const parentTask = utils.task.getTask.getData({
          id: parentTaskId,
        });
        if (parentTask) {
          const updatedChildTasks = parentTask.childTasks?.map((t) => {
            if (t.id === taskId) {
              return { ...t, lastCompleted: new Date() };
            }
            return t;
          });

          const existingChildTaskCompletionDataMap =
            parentTask.childTaskCompletionDataMap;
          const existingChildTaskCompletionData =
            existingChildTaskCompletionDataMap?.get(taskId) ?? [];

          existingChildTaskCompletionDataMap?.set(taskId, [
            ...existingChildTaskCompletionData,
            JSON.stringify({
              time: data.time,
            }),
          ]);

          utils.task.getTask.setData(
            { id: parentTaskId },
            {
              ...parentTask,
              childTasks: updatedChildTasks,
              childTaskCompletionDataMap: existingChildTaskCompletionDataMap,
              numCompletedSets: parentTask.isSet
                ? parentTask.numCompletedSets + 1
                : parentTask.numCompletedSets,
            },
          );
        }
      }

      if (task) {
        utils.task.getTask.setData(
          { id: taskId },
          {
            ...task,
            lastCompleted: new Date(),
            taskCompletionData: [
              JSON.stringify([
                ...existingTaskCompletionData,
                { time: data.time },
              ]),
            ],
          },
        );
      }

      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== taskId);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
      const promises = [];
      if (parentTaskId) {
        promises.push(utils.task.getTask.cancel({ id: parentTaskId }));
      }
      promises.push(utils.task.getTask.cancel({ id: taskId }));
      promises.push(utils.task.getAllMyActiveTasks.cancel());

      const promises2 = [];
      if (parentTaskId) {
        promises2.push(utils.task.getTask.invalidate({ id: parentTaskId }));
      }
      promises2.push(utils.task.getTask.invalidate({ id: taskId }));
      promises2.push(utils.task.getAllMyActiveTasks.invalidate());

      await Promise.all(promises2);
    },
  });

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

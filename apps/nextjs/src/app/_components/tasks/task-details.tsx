"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { Switch } from "@acme/ui/switch";
import { TaskBlockingTypes } from "@acme/utils";

import { api } from "~/trpc/react";
import { TaskChildrenPrevCompletionData } from "./completion-data/task-children-prev-completion-data";

interface TaskDetailsProps {
  isRecurring: boolean;
  description: string | null;
  nextDue: Date;
  frequencyHours: number | null;
  lastCompleted: Date | null;
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
  onClose?: () => void;
}

export function TaskDetails({
  isRecurring,
  frequencyHours,
  lastCompleted,
  initialTask,
  taskId,
  onClose,
}: TaskDetailsProps) {
  const utils = api.useUtils();

  const task = utils.task.getTask.getData({ id: taskId });

  const deleteTask = api.task.deleteTask.useMutation({
    onMutate: () => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== taskId);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
      onClose?.();
    },
    onSettled: async () => {
      await Promise.all([
        utils.task.getAllMyActiveTasks.invalidate(),
        utils.task.getAllMyTasks.invalidate(),
        utils.task.getTask.invalidate({ id: taskId }),
      ]);
    },
  });

  const updateIsSet = api.task.updateIsSet.useMutation({
    onMutate: ({ isSet }) => {
      const previousTask = utils.task.getTask.getData({ id: taskId });
      if (previousTask) {
        utils.task.getTask.setData(
          { id: taskId },
          { ...previousTask, isSet, numSets: isSet ? 1 : 0 },
        );
      }
    },
    onSettled: async () => {
      await utils.task.getTask.invalidate({ id: taskId });
    },
  });

  const updateBlocking = api.task.updateBlocking.useMutation({
    onMutate: ({ blocking }) => {
      const previousTask = utils.task.getTask.getData({ id: taskId });
      if (previousTask) {
        utils.task.getTask.setData(
          { id: taskId },
          { ...previousTask, blocking },
        );
      }
    },
    onSettled: async () => {
      await utils.task.getTask.invalidate({ id: taskId });
    },
  });

  const getBlockingLabel = (blocking: TaskBlockingTypes) => {
    switch (blocking) {
      case TaskBlockingTypes.BLOCK_WHEN_OVERDUE:
        return "Block when overdue";
      case TaskBlockingTypes.NEVER_BLOCK:
        return "Never block";
      case TaskBlockingTypes.BLOCK_WHEN_TWICE_OVERDUE:
        return "Block when twice overdue";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Description</h3>
        <p className="mt-1 text-muted-foreground">
          {initialTask?.description ?? "No description provided"}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Set-based Task</h3>
          <p className="text-sm text-muted-foreground">
            Enable if this task should be completed in sets
          </p>
        </div>
        <Switch
          checked={task?.isSet ?? false}
          onCheckedChange={(checked) =>
            updateIsSet.mutate({ id: taskId, isSet: checked ? true : false })
          }
        />
      </div>

      <div>
        <h3 className="text-sm font-medium">Blocking Behavior</h3>
        <p className="text-sm text-muted-foreground">
          Controls how this task blocks apps when overdue
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {Object.values(TaskBlockingTypes).map((blockingType) => (
            <div key={blockingType} className="flex items-center gap-2">
              <Switch
                checked={task?.blocking === blockingType}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateBlocking.mutate({
                      id: taskId,
                      blocking: blockingType,
                    });
                  }
                }}
              />
              <span className="text-sm">{getBlockingLabel(blockingType)}</span>
            </div>
          ))}
        </div>
      </div>

      {isRecurring && (
        <>
          <div>
            <h3 className="text-sm font-medium">Frequency</h3>
            <p className="mt-1 text-muted-foreground">
              Every{" "}
              {frequencyHours === 24
                ? "day"
                : frequencyHours === 168
                  ? "week"
                  : frequencyHours === 336
                    ? "two weeks"
                    : "month"}
            </p>
          </div>

          {lastCompleted && (
            <div>
              <h3 className="text-sm font-medium">Last Completed</h3>
              <p className="mt-1 text-muted-foreground">
                {format(lastCompleted, "PPP 'at' p")}
              </p>
              <TaskChildrenPrevCompletionData
                initialTask={task ?? initialTask}
                taskId={taskId}
              />
            </div>
          )}
        </>
      )}

      <div className="mt-6 flex gap-2">
        <Button
          variant="destructive"
          onClick={() => deleteTask.mutate({ id: taskId })}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link.js";
import { formatDistanceToNowStrict, isPast } from "date-fns";
import { Check } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

function getTimeStatus(date: Date) {
  if (isPast(date)) {
    return <span className="text-destructive">Past due</span>;
  }
  return (
    <span className="text-muted-foreground">
      Due in {formatDistanceToNowStrict(date, { unit: "hour" })}
    </span>
  );
}

interface TaskCardProps {
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number];
  isRecurring?: boolean;
}

export function TaskCard({ task, isRecurring }: TaskCardProps) {
  const utils = api.useUtils();
  const completeTask = api.task.completeTask.useMutation({
    onMutate: () => {
      console.log("on mutate.");

      if (task.parentTaskId) {
        const parentTask = utils.task.getTask.getData({
          id: task.parentTaskId,
        });
        if (parentTask) {
          const updatedChildTasks = parentTask.childTasks.map((t) => {
            if (t.id === task.id) {
              return { ...t, lastCompleted: new Date() };
            }
            return t;
          });
          parentTask.childTasks = updatedChildTasks;
          utils.task.getTask.setData({ id: task.parentTaskId }, parentTask);
        }
      }
      // remove regular task if found
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== task.id);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
      if (task.parentTaskId) {
        await utils.task.getTask.invalidate({ id: task.parentTaskId });
      }
      await utils.task.invalidate();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to complete a task"
          : "Failed to complete task",
      );
    },
  });

  // if (nextDue is in past AND lastCompleted is not set or lastCompleted is before completionPeriodBegins)
  const showNextDue =
    task.nextDue < new Date() &&
    (!task.lastCompleted ||
      (task.completionPeriodBegins &&
        task.lastCompleted < task.completionPeriodBegins));

  const inCompletionPeriod =
    !task.recurring ||
    (task.completionPeriodBegins && new Date() > task.completionPeriodBegins);

  const alreadyCompleted =
    (!task.recurring && task.lastCompleted) ||
    (task.recurring &&
      task.completionPeriodBegins &&
      task.lastCompleted &&
      task.lastCompleted > task.completionPeriodBegins);

  const numChildTasks = task.childTasks.length;

  console.log("numChildTasks", numChildTasks);
  const numCompletedChildTasks = task.childTasks.filter(
    (childTask) =>
      (task.recurring &&
        childTask.lastCompleted &&
        task.completionPeriodBegins &&
        childTask.lastCompleted > task.completionPeriodBegins) ||
      (!task.recurring && childTask.lastCompleted),
  ).length;
  console.log("numCompletedChildTasks", numCompletedChildTasks);

  console.log("showNextDue", showNextDue);

  const canBeCompleted =
    inCompletionPeriod &&
    numCompletedChildTasks === numChildTasks &&
    !alreadyCompleted;

  return (
    <div className="flex w-full flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <Link href={`/task/${task.id}`}>
            <h2
              className="text-2xl font-bold text-primary"
              // onClick={() => setIsDetailsOpen(true)}
            >
              {task.title}
              {isRecurring && <span className="text-muted-foreground"> ↻</span>}
            </h2>
          </Link>

          {showNextDue && getTimeStatus(task.nextDue)}
        </div>
        <p className="mt-2 text-sm">{task.description}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Due Date: {task.nextDue.toISOString()}
          <br />
          CompletionPeriodBegins: {task.completionPeriodBegins?.toISOString()}
        </p>
      </div>
      <div>
        {canBeCompleted && (
          <Button
            variant="ghost"
            className="cursor-pointer text-sm font-bold uppercase text-primary hover:bg-transparent hover:text-white"
            onClick={() => completeTask.mutate({ id: task.id })}
            disabled={!canBeCompleted}
          >
            <Check className="h-5 w-5" />
          </Button>
        )}
        {numCompletedChildTasks < numChildTasks &&
          numCompletedChildTasks + " / " + numChildTasks}
      </div>
      {/* <TaskDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        id={task.id}
      /> */}
    </div>
  );
}

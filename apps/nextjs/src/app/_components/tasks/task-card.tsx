"use client";

import { useState } from "react";
import Link from "next/link.js";
import { formatDistanceToNowStrict, isPast } from "date-fns";
import { Check } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import { TaskDetailsDialog } from "./task-details-dialog";

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

      // remove regular task if found
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== task.id);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // if (nextDue is in past AND lastCompleted is not set or lastCompleted is before completionPeriodBegins)
  const showNextDue =
    task.nextDue < new Date() &&
    (!task.lastCompleted ||
      (task.completionPeriodBegins &&
        task.lastCompleted < task.completionPeriodBegins));

  const inCompletionPeriod =
    !task.recurring ||
    (task.completionPeriodBegins && new Date() > task.completionPeriodBegins);

  const numChildTasks = task.childTasks.length;

  console.log("numChildTasks", numChildTasks);
  const numCompletedChildTasks = task.completionPeriodBegins
    ? task.childTasks.filter(
        (childTask) =>
          childTask.lastCompleted &&
          task.completionPeriodBegins &&
          childTask.lastCompleted > task.completionPeriodBegins,
      ).length
    : 0;
  console.log("numCompletedChildTasks", numCompletedChildTasks);

  console.log("showNextDue", showNextDue);

  const canBeCompleted =
    inCompletionPeriod && numCompletedChildTasks === numChildTasks;

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

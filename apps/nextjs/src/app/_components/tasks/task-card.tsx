"use client";

import { useState } from "react";
import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  isPast,
} from "date-fns";
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

  return (
    <div className="flex w-full flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl font-bold text-primary"
            onClick={() => setIsDetailsOpen(true)}
          >
            {task.title}
            {isRecurring && <span className="text-muted-foreground"> ↻</span>}
          </h2>

          {getTimeStatus(task.nextDue)}
        </div>
        <p className="mt-2 text-sm">{task.description}</p>
      </div>
      <div>
        <Button
          variant="ghost"
          className="cursor-pointer text-sm font-bold uppercase text-primary hover:bg-transparent hover:text-white"
          onClick={() => completeTask.mutate({ id: task.id })}
        >
          <Check className="h-5 w-5" />
        </Button>
      </div>
      <TaskDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        task={task}
      />
    </div>
  );
}

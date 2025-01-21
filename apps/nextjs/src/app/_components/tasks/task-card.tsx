"use client";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/trpc/react";
import TaskHeader from "./task-header";

interface TaskCardProps {
  task: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskCard({ task, taskId }: TaskCardProps) {
  const { data: queryTask } = api.task.getTask.useQuery({ id: taskId });

  if (queryTask) {
    task = queryTask;
  }

  if (!task) {
    return <>FAIL.</>;
  }

  return (
    <div className="flex w-full flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <TaskHeader initialTask={task} taskId={task.id} />
        <p className="mt-2 text-sm">{task.description}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Due Date: {task.nextDue.toISOString()}
          <br />
          CompletionPeriodBegins: {task.completionPeriodBegins?.toISOString()}
        </p>
      </div>
    </div>
  );
}

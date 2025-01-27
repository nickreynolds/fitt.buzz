"use client";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/trpc/react";
import TaskHeader from "./task-header";

interface TaskCardProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskCard({ initialTask, taskId }: TaskCardProps) {
  const { data: task } = api.task.getTask.useQuery(
    { id: taskId },
    { initialData: initialTask },
  );

  if (!task) {
    return <>FAIL.</>;
  }

  return (
    <div
      data-task-id={task.id}
      className="flex w-full flex-row rounded-lg bg-muted p-4"
    >
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

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
    <div className="flex-grow">
      <TaskHeader initialTask={task} taskId={task.id} />
    </div>
  );
}

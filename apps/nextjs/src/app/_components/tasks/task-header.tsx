"use client";

import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import {
  canBeCompleted,
  getNumCompletedChildTasks,
  isCompleted,
} from "@acme/api-utils";

import { api } from "~/trpc/react";
import { CompleteTaskButton } from "./complete-task-button";

export default function TaskHeader({
  initialTask,
  taskId,
}: {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}) {
  const { data: task } = api.task.getTask.useQuery({ id: taskId });
  if (!initialTask) {
    return <>F.</>;
  }
  const canComplete = canBeCompleted(task ?? initialTask);
  const numChildTasks = (task ?? initialTask).childTasks?.length ?? 0;
  const numCompletedChildTasks = getNumCompletedChildTasks(task ?? initialTask);
  const isComplete = isCompleted(task ?? initialTask);

  const undoneTasks = Array(numChildTasks - numCompletedChildTasks).fill(1);
  const doneTasks = Array(numCompletedChildTasks).fill(1);

  return (
    <div className="flex flex-row items-center justify-between">
      <Link href={`/task/${(task ?? initialTask).id}`}>
        <h2
          className="text-2xl font-bold text-primary"
          // onClick={() => setIsDetailsOpen(true)}
        >
          {(task ?? initialTask).title}
          {(task ?? initialTask).recurring && (
            <span className="text-muted-foreground"> ↻</span>
          )}
        </h2>
      </Link>
      <div className="flex flex-row items-center gap-4">
        {canComplete && (
          <CompleteTaskButton
            taskId={(task ?? initialTask).id}
            parentTaskId={(task ?? initialTask).parentTaskId}
          />
        )}
        {(numCompletedChildTasks < numChildTasks || !canComplete) &&
          undoneTasks.map((_, i) => <Circle key={i} className="h-4 w-4" />)}
        {(numCompletedChildTasks < numChildTasks || !canComplete) &&
          doneTasks.map((_, i) => <CheckCircle key={i} className="h-4 w-4" />)}
        {isComplete && <CheckCircle className="h-4 w-4" />}
      </div>
    </div>
  );
}

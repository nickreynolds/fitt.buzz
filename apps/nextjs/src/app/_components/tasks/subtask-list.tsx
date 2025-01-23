"use client";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

import type { RouterOutputs } from "@acme/api";

interface SubtaskListProps {
  initialTask: RouterOutputs["task"]["getTask"];
  parentTaskId: string;
}

export function SubtaskList({ initialTask, parentTaskId }: SubtaskListProps) {
  const { data: task } = api.task.getTask.useQuery(
    { id: parentTaskId },
    { initialData: initialTask },
  );

  if (!task) {
    return null;
  }
  const tasks = task.childTasks;
  if (!tasks || tasks.length === 0) {
    return <div>No subtasks</div>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {tasks
        .sort((t1, t2) => t1.createdAt.getTime() - t2.createdAt.getTime())
        .map((task, index) => {
          return (
            <div
              // @ts-expect-error: `--delay` is a custom property
              style={{ "--delay": `${index * 100}ms` }}
              className={`motion-translate-x-in-[-500%] motion-delay-[var(--delay,0)]`}
            >
              <TaskCard initialTask={task} taskId={task.id} />
            </div>
          );
        })}
    </div>
  );
}

"use client";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";
import { TaskCardSkeleton } from "./task-skeleton";

export function TaskList() {
  const [tasks] = api.task.getAllMyActiveTasks.useSuspenseQuery();

  if (tasks.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <TaskCardSkeleton pulse={false} />
        <TaskCardSkeleton pulse={false} />
        <TaskCardSkeleton pulse={false} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">No active tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {tasks.map((task) => {
        return <TaskCard key={task.id} task={task} />;
      })}
    </div>
  );
}

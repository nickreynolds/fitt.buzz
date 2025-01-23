"use client";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

export function TaskList() {
  const [tasks] = api.task.getAllMyActiveTasks.useSuspenseQuery();
  const utils = api.useUtils();
  const bootstrap = api.task.bootstrapTasks.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to post"
          : "Failed to create post",
      );
    },
  });

  if (tasks.length === 0) {
    return (
      <div>
        No tasks found. Would you like to bootstrap a set of tasks?
        <Button onClick={() => bootstrap.mutate()}>Bootstrap tasks</Button>
      </div>
    );
  }

  return (
    <div className="task-list flex w-full flex-col gap-4">
      {tasks.map((task, index) => (
        <div
          className="animate-slideIn opacity-0"
          // @ts-expect-error: `--delay` is a custom property
          style={{ "--delay": `${index * 200}ms` }}
        >
          <TaskCard initialTask={task} taskId={task.id} />
        </div>
      ))}
    </div>
  );
}

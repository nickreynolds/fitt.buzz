"use client";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

import React from "react";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

export function TaskList() {
  const [tasks] = api.task.getAllMyActiveTasks.useSuspenseQuery();
  const { data: allTasks } = api.task.getAllMyTasks.useQuery();

  const [showAllTasks, setShowAllTasks] = React.useState(false);

  const displayedTasks = showAllTasks ? allTasks : tasks;

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

  if (displayedTasks?.length === 0) {
    return (
      <div>
        No tasks found. Would you like to bootstrap a set of tasks?
        <Button onClick={() => bootstrap.mutate()}>Bootstrap tasks</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setShowAllTasks((prev) => !prev)}>
        {showAllTasks ? "Show only active tasks" : "Show all tasks"}
      </Button>
      <div className="task-list flex w-full flex-col gap-4">
        {displayedTasks?.map((task, index) => (
          <div
            className="animate-slideIn opacity-0"
            // @ts-expect-error: `--delay` is a custom property
            style={{ "--delay": `${index * 200}ms` }}
          >
            <TaskCard initialTask={task} taskId={task.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

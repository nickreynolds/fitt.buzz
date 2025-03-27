"use client";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

import React from "react";

import { Button } from "@acme/ui/button";

export function TaskList() {
  const [tasks] = api.task.getAllMyActiveTasks.useSuspenseQuery();
  const { data: allTasks } = api.task.getAllMyTasks.useQuery();

  const [showAllTasks, setShowAllTasks] = React.useState(false);

  const displayedTasks = showAllTasks ? allTasks : tasks;

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setShowAllTasks((prev) => !prev)}>
        {showAllTasks ? "Show only active tasks" : "Show all tasks"}
      </Button>
      <div className="task-list flex w-full flex-col gap-4">
        {displayedTasks?.map((task, index) => (
          <div
            key={task.id}
            className="animate-slideIn opacity-0"
            // @ts-expect-error: `--delay` is a custom property
            style={{ "--delay": `${index * 100}ms` }}
          >
            <TaskCard initialTask={task} taskId={task.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

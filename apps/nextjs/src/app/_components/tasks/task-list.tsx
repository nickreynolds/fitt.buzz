"use client";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

import React from "react";

import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";

export function TaskList() {
  const [tasks] = api.task.getAllMyActiveTasks.useSuspenseQuery();
  const { data: allTasks } = api.task.getAllMyTasks.useQuery();

  const [showAllTasks, setShowAllTasks] = React.useState(false);

  const displayedTasks = showAllTasks ? allTasks : tasks;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="show-all-tasks"
          checked={showAllTasks}
          onCheckedChange={setShowAllTasks}
        />
        <Label htmlFor="show-all-tasks">
          {!showAllTasks ? "Show all tasks" : "Show only active tasks"}
        </Label>
      </div>
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

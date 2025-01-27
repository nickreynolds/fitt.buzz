"use client";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

import type { RouterOutputs } from "@acme/api";

import { List } from "../drag-list/list";

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
      <List tasks={tasks.sort((a, b) => a.sortIndex - b.sortIndex)} />
    </div>
  );
}

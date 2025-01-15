"use client";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

export function SubtaskList({ parentTaskId }: { parentTaskId: string }) {
  const { data: task, isLoading: isLoadingRegular } = api.task.getTask.useQuery(
    { id: parentTaskId },
  );

  const isLoading = isLoadingRegular;
  console.log("subtask list. data: ", task);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!task || task.childTasks.length === 0) {
    return <div>No subtasks</div>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <TransitionGroup component={null}>
        {task.childTasks.map((task) => (
          <CSSTransition key={task.title} timeout={300} classNames="task">
            <div>
              <TaskCard task={task} />
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
}

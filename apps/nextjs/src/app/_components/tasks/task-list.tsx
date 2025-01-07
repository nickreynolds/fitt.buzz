"use client";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

export function TaskList() {
  const { data: regularTasks, isLoading: isLoadingRegular } =
    api.task.getAllMyActiveTasks.useQuery();
  const { data: recurringTasks, isLoading: isLoadingRecurring } =
    api.task.getRecurringTasks.useQuery();

  const isLoading = isLoadingRegular || isLoadingRecurring;

  const regularTasksExtra = regularTasks?.map((t) => {
    return { ...t, frequencyHours: 0 };
  });

  const recurringTasksExtra = recurringTasks?.map((t) => {
    return { ...t, completed: false };
  });

  const allTasks = [
    ...(regularTasksExtra ?? []),
    ...(recurringTasksExtra ?? []),
  ].sort(
    (a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime(),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (allTasks.length === 0) {
    return <div>No tasks found</div>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <TransitionGroup component={null}>
        {allTasks.map((task) => (
          <CSSTransition key={task.id} timeout={300} classNames="task">
            <div>
              <TaskCard task={task} isRecurring={task.frequencyHours !== 0} />
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
}

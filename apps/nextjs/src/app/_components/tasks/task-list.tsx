"use client";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

export function TaskList() {
  const { data: tasks, isLoading: isLoadingRegular } =
    api.task.getAllMyActiveTasks.useQuery();
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

  const isLoading = isLoadingRegular;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div>
        No tasks found. Would you like to bootstrap a set of tasks?
        <Button onClick={() => bootstrap.mutate()}>Bootstrap tasks</Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <TransitionGroup component={null}>
        {tasks.map((task) => (
          <CSSTransition key={task.title} timeout={300} classNames="task">
            <div>
              <TaskCard task={task} isRecurring={task.recurring} />
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
}

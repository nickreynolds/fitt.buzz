"use client";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { api } from "~/trpc/react";
import { TaskCard } from "./task-card";

import "./transitions.css";

import type { RouterOutputs } from "@acme/api";

interface SubtaskListProps {
  childTasks: RouterOutputs["task"]["getAllMyActiveTasks"][number][];
  parentTaskId: string;
}

export function SubtaskList({ childTasks, parentTaskId }: SubtaskListProps) {
  const { data: task } = api.task.getTask.useQuery({ id: parentTaskId });

  if (task) {
    childTasks = task.childTasks;
  }
  if (childTasks.length === 0) {
    return <div>No subtasks</div>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <TransitionGroup component={null}>
        {childTasks.map((task, index) => {
          // const delay = index * 500;
          return (
            <CSSTransition key={task.title} timeout={300} classNames="task">
              <div
                // style={{ transitionDelay: `${delay}ms` }}
                className={`motion-translate-x-in-[-500%]`}
              >
                <TaskCard task={task} />
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    </div>
  );
}

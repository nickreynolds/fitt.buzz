"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, CheckCircle, Circle, Pencil } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import {
  canBeCompleted,
  getNumCompletedChildTasks,
  isCompleted,
} from "@acme/api-utils";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

import { api } from "~/trpc/react";
import { CompleteTaskButton } from "./complete-task-button";

interface TaskHeaderProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export default function TaskHeader({ initialTask, taskId }: TaskHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialTask?.title ?? "");
  const pathname = usePathname();
  const utils = api.useUtils();

  const isTaskPage = pathname === `/task/${taskId}`;

  const updateTitle = api.task.updateTaskTitle.useMutation({
    onMutate: ({ title }) => {
      // Update the task in the cache
      const previousTask = utils.task.getTask.getData({ id: taskId });
      if (previousTask) {
        utils.task.getTask.setData({ id: taskId }, { ...previousTask, title });
      }

      setIsEditing(false);
    },
    onSuccess: async () => {
      await utils.task.getTask.invalidate({ id: taskId });
    },
    onError: () => {
      setEditedTitle(initialTask?.title ?? "");
    },
  });

  const { data: task } = api.task.getTask.useQuery(
    { id: taskId },
    { initialData: initialTask },
  );
  if (!task) {
    return <>F.</>;
  }
  const canComplete = canBeCompleted(task);
  const numChildTasks = task.childTasks?.length ?? 0;
  const numCompletedChildTasks = getNumCompletedChildTasks(task);
  const isComplete = isCompleted(task);

  const undoneTasks = Array(numChildTasks - numCompletedChildTasks).fill(1);
  const doneTasks = Array(numCompletedChildTasks).fill(1);

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex-grow">
        {isEditing && isTaskPage ? (
          <div className="flex items-center gap-2">
            <Input
              className="text-lg font-bold text-primary"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
              onBlur={() => {
                if (editedTitle.trim() !== task.title) {
                  updateTitle.mutate({
                    id: task.id,
                    title: editedTitle.trim(),
                  });
                } else {
                  setIsEditing(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (editedTitle.trim() !== task.title) {
                    updateTitle.mutate({
                      id: task.id,
                      title: editedTitle.trim(),
                    });
                  } else {
                    setIsEditing(false);
                  }
                }
              }}
            />
          </div>
        ) : isTaskPage ? (
          <button
            onClick={() => setIsEditing(true)}
            className="group flex items-center gap-2"
          >
            <h2 className="text-2xl font-bold text-primary">
              {task.title}
              {task.recurring && (
                <span className="text-muted-foreground"> ↻</span>
              )}
            </h2>
            <Pencil className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ) : (
          <Link href={`/task/${task.id}`}>
            <h2 className="text-2xl font-bold text-primary">
              {task.title}
              {task.recurring && (
                <span className="text-muted-foreground"> ↻</span>
              )}
            </h2>
          </Link>
        )}
      </div>
      <div className="flex flex-row items-center gap-4">
        {canComplete && (
          <CompleteTaskButton
            taskId={task.id}
            parentTaskId={task.parentTaskId}
          />
        )}
        {(numCompletedChildTasks < numChildTasks || !canComplete) &&
          undoneTasks.map((_, i) => <Circle key={i} className="h-4 w-4" />)}
        {(numCompletedChildTasks < numChildTasks || !canComplete) &&
          doneTasks.map((_, i) => <CheckCircle key={i} className="h-4 w-4" />)}
        {isComplete && <Check className="h-8 w-8 text-primary" />}
      </div>
    </div>
  );
}

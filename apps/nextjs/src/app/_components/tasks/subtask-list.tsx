"use client";

import { api } from "~/trpc/react";

import "./transitions.css";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";

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
  const utils = api.useUtils();

  const doIsSet = api.task.setIsSet.useMutation({
    onMutate: ({ id, isSet }) => {
      const task = utils.task.getTask.getData({ id });
      if (!task) {
        throw new Error("Parent task not found");
      }

      utils.task.getTask.setData({ id }, { ...task, isSet });

      // return parentTask;
    },
    async onSuccess(data) {
      console.log("onSuccess data", data);
      await utils.task.getTask.invalidate({ id: task?.id ?? "" });
    },
  });

  const doSetNumSets = api.task.setNumSets.useMutation({
    onMutate: ({ id, numSets }) => {
      const task = utils.task.getTask.getData({ id });
      if (!task) {
        throw new Error("Parent task not found");
      }

      utils.task.getTask.setData({ id }, { ...task, numSets });

      // return parentTask;
    },
    async onSuccess(data) {
      console.log("onSuccess data", data);
      await utils.task.getTask.invalidate({ id: task?.id ?? "" });
    },
  });

  if (!task) {
    return null;
  }
  const tasks = task.childTasks;
  if (!tasks || tasks.length === 0) {
    return <div>No subtasks</div>;
  }

  const isSet = task.isSet;
  const numSets = task.numSets;

  return (
    <div className="flex w-full flex-col gap-4">
      {isSet && (
        <div>
          {" "}
          <Button
            variant={"ghost"}
            onClick={() => {
              const t = utils.task.getTask.getData({ id: task.id });
              if (!t) {
                throw new Error("Task not found in cache");
              }
              doSetNumSets.mutate({ id: task.id, numSets: t.numSets - 1 });
            }}
          >
            -
          </Button>
          {numSets}{" "}
          <Button
            variant={"ghost"}
            onClick={() => {
              const t = utils.task.getTask.getData({ id: task.id });
              if (!t) {
                throw new Error("Task not found in cache");
              }
              doSetNumSets.mutate({ id: task.id, numSets: t.numSets + 1 });
            }}
          >
            +
          </Button>
        </div>
      )}
      {!isSet && (
        <Button onClick={() => doIsSet.mutate({ id: task.id, isSet: true })}>
          Make Set
        </Button>
      )}
      <List tasks={tasks.sort((a, b) => a.sortIndex - b.sortIndex)} />
    </div>
  );
}

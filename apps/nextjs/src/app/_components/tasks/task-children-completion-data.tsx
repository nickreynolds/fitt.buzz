"use client";

import React from "react";

import type { RouterOutputs } from "@acme/api";

import type { TaskCompletionInfo } from "./TaskCompletionTable";
import { api } from "~/trpc/react";
import { TaskCompletionTable } from "./TaskCompletionTable";

interface SubtaskListProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskChildrenCompletionData({
  initialTask,
  taskId,
}: SubtaskListProps) {
  const { data: task } = api.task.getTask.useQuery(
    { id: taskId },
    { initialData: initialTask },
  );

  const data = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data1: any[] = [];

    if (task) {
      task.childTasks?.forEach((childTask) => {
        const completionData = task.childTaskCompletionDataMap?.get(
          childTask.id,
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const parsedData = completionData?.map((data) => JSON.parse(data));
        if (parsedData) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data1 = [...data1, parsedData];
        }
      });
    }
    data1 = data1.flat();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Array.isArray(data1) ? data1 : [];
  }, [task]);

  const childTaskCompletionDataMap = task?.childTaskCompletionDataMap;

  if (!task || childTaskCompletionDataMap?.size === 0) {
    return null;
  }

  return <TaskCompletionTable data={data as TaskCompletionInfo[]} />;
}

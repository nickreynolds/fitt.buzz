"use client";

import React from "react";

import type { RouterOutputs } from "@acme/api";
import { formatTime, TaskCompletionTypes } from "@acme/utils";

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

        completionData?.forEach((data) => {
          console.log("parsing completion data: ", data);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsedData = JSON.parse(data);
          if (parsedData) {
            if (
              childTask.completionDataType === TaskCompletionTypes.WeightReps
            ) {
              const parsedData2 = parsedData as {
                weight: number;
                reps: number;
              };
              const result = `Weight: ${parsedData2.weight}, Reps: ${parsedData2.reps}`;
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              data1 = [...data1, { result }];
            } else if (
              childTask.completionDataType === TaskCompletionTypes.Boolean
            ) {
              const result = `Completed.`;
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              data1 = [...data1, { result }];
            } else {
              const parsedData2 = parsedData as { time: number };
              const result = formatTime(parsedData2.time);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              data1 = [...data1, { result }];
            }
          }
        });
      });
    }
    data1 = data1.flat();

    console.log("data: ", data1);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Array.isArray(data1) ? data1 : [];
  }, [task]);

  const childTaskCompletionDataMap = task?.childTaskCompletionDataMap;

  if (!task || childTaskCompletionDataMap?.size === 0) {
    return null;
  }

  return <TaskCompletionTable data={data as TaskCompletionInfo[]} />;
}

"use client";

import { format } from "date-fns";

import { api } from "~/trpc/react";

interface TaskDetailsProps {
  id: string;
}

export function TaskDetails({ id }: TaskDetailsProps) {
  const { data: task } = api.task.getTask.useQuery({ id });
  if (!task) return null;
  const isRecurring = task.recurring;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Description</h3>
        <p className="mt-1 text-muted-foreground">
          {task.description ?? "No description provided"}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium">Due Date</h3>
        <p className="mt-1 text-muted-foreground">
          {format(task.nextDue, "PPP 'at' p")}
        </p>
      </div>

      {isRecurring && (
        <>
          <div>
            <h3 className="text-sm font-medium">Frequency</h3>
            <p className="mt-1 text-muted-foreground">
              Every{" "}
              {task.frequencyHours === 24
                ? "day"
                : task.frequencyHours === 168
                  ? "week"
                  : task.frequencyHours === 336
                    ? "two weeks"
                    : "month"}
            </p>
          </div>

          {task.lastCompleted && (
            <div>
              <h3 className="text-sm font-medium">Last Completed</h3>
              <p className="mt-1 text-muted-foreground">
                {format(task.lastCompleted, "PPP 'at' p")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

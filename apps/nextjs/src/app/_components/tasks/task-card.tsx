"use client";

import { useState } from "react";
import Link from "next/link.js";
import { formatDistanceToNowStrict, isPast } from "date-fns";
import { Check } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import TaskHeader from "./task-header";

function getTimeStatus(date: Date) {
  if (isPast(date)) {
    return <span className="text-destructive">Past due</span>;
  }
  return (
    <span className="text-muted-foreground">
      Due in {formatDistanceToNowStrict(date, { unit: "hour" })}
    </span>
  );
}

interface TaskCardProps {
  task: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskCard({ task, taskId }: TaskCardProps) {
  const { data: queryTask } = api.task.getTask.useQuery({ id: taskId });

  if (queryTask) {
    task = queryTask;
  }

  if (!task) {
    return <>FAIL.</>;
  }

  return (
    <div className="flex w-full flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <TaskHeader initialTask={task} taskId={task.id} />
        <p className="mt-2 text-sm">{task.description}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Due Date: {task.nextDue.toISOString()}
          <br />
          CompletionPeriodBegins: {task.completionPeriodBegins?.toISOString()}
        </p>
      </div>
    </div>
  );
}

"use client";

import { Check } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export function TaskCard(props: {
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number];
}) {
  const utils = api.useUtils();
  const completeTask = api.task.completeTask.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to complete a task"
          : "Failed to complete task",
      );
    },
  });

  return (
    <div className="flex w-full flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <h2 className="text-2xl font-bold text-primary">{props.task.title}</h2>
        <p className="mt-2 text-sm">{props.task.description}</p>
      </div>
      <div>
        <Button
          variant="ghost"
          className="cursor-pointer text-sm font-bold uppercase text-primary hover:bg-transparent hover:text-white"
          onClick={() => completeTask.mutate({ id: props.task.id })}
        >
          <Check className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

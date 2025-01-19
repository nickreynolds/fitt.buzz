"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const utils = api.useUtils();

  const deleteTask = api.task.deleteTask.useMutation({
    onMutate: () => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== taskId);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);

      router.push("/tasks");
    },
    onSettled: async () => {
      await Promise.all([utils.task.getAllMyActiveTasks.invalidate()]);
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to delete this task"
          : "Failed to delete task",
      );
    },
  });

  return (
    <Button
      variant="destructive"
      onClick={() => deleteTask.mutate({ id: taskId })}
      className="flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4" />
      Delete Task
    </Button>
  );
}

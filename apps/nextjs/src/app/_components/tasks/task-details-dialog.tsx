import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: {
    id: string;
    title: string;
    description: string | null;
    nextDue: Date;
    frequencyHours?: number;
    lastCompleted?: Date | null;
  };
}

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
}: TaskDetailsDialogProps) {
  const utils = api.useUtils();
  const isRecurring = typeof task.frequencyHours !== "undefined";

  const deleteTask = api.task.deleteTask.useMutation({
    onMutate: () => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== task.id);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);

      const recurringTasks = utils.task.getMyActiveRecurringTasks.getData();
      const updatedRecurringTasks = recurringTasks?.filter(
        (t) => t.id !== task.id,
      );
      utils.task.getMyActiveRecurringTasks.setData(
        undefined,
        updatedRecurringTasks,
      );

      onOpenChange(false);
    },
    onSettled: async () => {
      await Promise.all([
        utils.task.getAllMyActiveTasks.invalidate(),
        utils.task.getMyActiveRecurringTasks.invalidate(),
      ]);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
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

        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteTask.mutate({ id: task.id })}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

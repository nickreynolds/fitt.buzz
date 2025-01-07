import { format } from "date-fns";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: {
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
  const isRecurring = typeof task.frequencyHours !== "undefined";

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
              {task.description || "No description provided"}
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

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

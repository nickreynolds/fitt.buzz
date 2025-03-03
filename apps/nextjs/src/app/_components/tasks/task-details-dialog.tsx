"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { TaskDetails } from "./task-details";

interface TaskDetailsDialogProps {
  isRecurring: boolean;
  description: string | null;
  nextDue: Date;
  frequencyHours: number | null;
  lastCompleted: Date | null;
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskDetailsDialog({
  isRecurring,
  description,
  nextDue,
  frequencyHours,
  lastCompleted,
  initialTask,
  taskId,
}: TaskDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 xl:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Info className="h-4 w-4" />
        Details
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        <TaskDetails
          isRecurring={isRecurring}
          description={description}
          nextDue={nextDue}
          frequencyHours={frequencyHours}
          lastCompleted={lastCompleted}
          initialTask={initialTask}
          taskId={taskId}
        />
      </DialogContent>
    </Dialog>
  );
}

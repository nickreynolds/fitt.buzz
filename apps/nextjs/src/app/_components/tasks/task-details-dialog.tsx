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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRecurring: boolean;
  description: string | null;
  nextDue: Date;
  frequencyMinutes: number | null;
  lastCompleted: Date | null;
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskDetailsDialog({
  open,
  onOpenChange,
  isRecurring,
  description,
  nextDue,
  frequencyMinutes,
  lastCompleted,
  initialTask,
  taskId,
}: TaskDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 xl:hidden"
        onClick={() => onOpenChange(true)}
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
          frequencyMinutes={frequencyMinutes}
          lastCompleted={lastCompleted}
          initialTask={initialTask}
          taskId={taskId}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

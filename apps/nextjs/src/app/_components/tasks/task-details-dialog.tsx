"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { TaskDetails } from "./task-details";

interface TaskDetailsDialogProps {
  id: string;
}

export function TaskDetailsDialog({ id }: TaskDetailsDialogProps) {
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

        <TaskDetails id={id} />
      </DialogContent>
    </Dialog>
  );
}

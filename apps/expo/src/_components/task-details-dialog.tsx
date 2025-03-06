import React from "react";
import { Text, TouchableOpacity } from "react-native";
import * as DialogPrimitive from "@rn-primitives/dialog";
import { Info } from "lucide-react-native";

import type { RouterOutputs } from "@acme/api";

import Icon from "./icon";
import { TaskDetails } from "./task-details";

interface TaskDetailsDialogProps {
  //   open: boolean;
  //   onOpenChange: (open: boolean) => void;
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskDetailsDialog({
  // open,
  // onOpenChange,
  initialTask,
  taskId,
}: TaskDetailsDialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <TouchableOpacity
          className="flex-row items-center gap-2"
          //   onPress={() => console.log("open??")}
        >
          <Icon name="Info" className="h-6 w-6 text-primary" />
        </TouchableOpacity>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="bg-background">
          <DialogPrimitive.Title>Task Details</DialogPrimitive.Title>

          <TaskDetails
            initialTask={initialTask}
            taskId={taskId}
            // onClose={() => console.log("close")}
            // onClose={() => onOpenChange(false)}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

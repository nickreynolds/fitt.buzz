import React from "react";
import { Text, TouchableOpacity } from "react-native";
import * as DialogPrimitive from "@rn-primitives/dialog";

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
        <DialogPrimitive.Overlay className="absolute inset-0 bottom-16 left-16 right-16 top-16 z-50 bg-black/50 p-4">
          <DialogPrimitive.Content className="bg-background">
            <DialogPrimitive.Title>
              <Text>Task Details</Text>
            </DialogPrimitive.Title>

            <TaskDetails
              initialTask={initialTask}
              taskId={taskId}
              // onClose={() => console.log("close")}
              // onClose={() => onOpenChange(false)}
            />
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
        <DialogPrimitive.Overlay className="absolute inset-0 bottom-32 left-16 right-16 top-32 z-50">
          <DialogPrimitive.Content className="h-full w-full rounded-lg bg-muted p-4">
            <DialogPrimitive.Title>
              <Text>Task Details</Text>
            </DialogPrimitive.Title>

            <TaskDetails
              initialTask={initialTask}
              taskId={taskId}
              // onClose={() => console.log("close")}
              // onClose={() => onOpenChange(false)}
            />
            <DialogPrimitive.Close className="absolute right-4 top-0">
              <View className="mt-8 rounded-md bg-primary p-4">
                <Text>X</Text>
              </View>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

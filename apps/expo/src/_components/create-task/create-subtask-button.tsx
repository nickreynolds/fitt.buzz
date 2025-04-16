import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as DialogPrimitive from "@rn-primitives/dialog";

import Icon from "~/_components/icon";
import { CreateSubtaskDialog } from "./create-subtask-dialog";

export interface CreateSubtaskButtonProps {
  taskId: string;
  parentTaskTitle: string;
}

export default function CreateSubtaskButton({
  taskId,
  parentTaskTitle,
}: CreateSubtaskButtonProps) {
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = React.useState(false);
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <TouchableOpacity
          className="flex-row items-center gap-2"
          //   onPress={() => console.log("open??")}
        >
          <Icon name="Plus" className="h-6 w-6 text-primary" />
        </TouchableOpacity>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="absolute inset-0 h-full w-full rounded-md">
          <DialogPrimitive.Content>
            <View className="pt-12">
              <CreateSubtaskDialog
                parentTaskId={taskId}
                parentTaskTitle={parentTaskTitle}
                isOpen={isSubtaskDialogOpen}
                onClose={() => setIsSubtaskDialogOpen(false)}
              />
            </View>
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

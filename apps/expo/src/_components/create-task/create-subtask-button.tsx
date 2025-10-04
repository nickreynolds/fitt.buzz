import React from "react";
import { TouchableOpacity, View } from "react-native";
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
    <DialogPrimitive.Root
      open={isSubtaskDialogOpen}
      onOpenChange={setIsSubtaskDialogOpen}
    >
      <DialogPrimitive.Trigger asChild>
        <TouchableOpacity className="flex-row items-center gap-2">
          <Icon name="Plus" className="h-6 w-6 text-primary" />
        </TouchableOpacity>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="absolute inset-0 h-full w-full rounded-md bg-background">
          <DialogPrimitive.Content>
            <View className="pt-12">
              <CreateSubtaskDialog
                parentTaskId={taskId}
                parentTaskTitle={parentTaskTitle}
                isOpen={isSubtaskDialogOpen}
                onClose={() => setIsSubtaskDialogOpen(false)}
              />
            </View>
            <DialogPrimitive.Close asChild>
              <TouchableOpacity className="absolute right-6 top-20">
                <View className="rounded-full bg-muted p-3">
                  <Icon name="X" className="h-6 w-6 text-foreground" />
                </View>
              </TouchableOpacity>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

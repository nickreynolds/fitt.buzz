import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import * as DialogPrimitive from "@rn-primitives/dialog";

import { CreateSubtaskDialog } from "~/_components/create-subtask-dialog";
import Icon from "~/_components/icon";
import { SubtaskList } from "~/_components/subtask-list";
import { TaskCompletionTable } from "~/_components/task-completion-table";
import { TaskDetailsDialog } from "~/_components/task-details-dialog";
import { TaskHeader } from "~/_components/task-header";
import { api } from "~/utils/api";

export default function Index() {
  const { id } = useLocalSearchParams();
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = React.useState(false);

  const { data: task } = api.task.getTask.useQuery({ id: id as string });

  if (!task) {
    return null;
  }

  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Task", headerShown: false }} />
      <View className="h-full w-full bg-background p-4">
        <TaskHeader initialTask={task} taskId={id as string} />
        <TaskDetailsDialog initialTask={task} taskId={id as string} />
        <TaskCompletionTable task={task} />
        <SubtaskList initialTask={task} parentTaskId={id as string} />
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
            <DialogPrimitive.Overlay className="absolute inset-0 bottom-16 left-16 right-16 top-16 rounded-md">
              <DialogPrimitive.Content className="bg-muted">
                <CreateSubtaskDialog
                  parentTaskId={task.id}
                  isOpen={isSubtaskDialogOpen}
                  onClose={() => setIsSubtaskDialogOpen(false)}
                />
              </DialogPrimitive.Content>
            </DialogPrimitive.Overlay>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </View>
    </SafeAreaView>
  );
}

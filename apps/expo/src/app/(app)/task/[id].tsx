import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import * as DialogPrimitive from "@rn-primitives/dialog";

import CreateSubtaskButton from "~/_components/create-task/create-subtask-button";
import { CreateSubtaskDialog } from "~/_components/create-task/create-subtask-dialog";
import Icon from "~/_components/icon";
import { SubtaskList } from "~/_components/subtask-list";
import { TaskCompletionTable } from "~/_components/task-completion-table";
import { TaskDetailsDialog } from "~/_components/task-details-dialog";
import { TaskHeader } from "~/_components/task-header";
import { api } from "~/utils/api";

export default function Index() {
  const { id } = useLocalSearchParams();

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
        <CreateSubtaskButton
          taskId={id as string}
          parentTaskTitle={task.title}
        />
      </View>
    </SafeAreaView>
  );
}

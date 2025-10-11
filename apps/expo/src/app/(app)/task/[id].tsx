import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";

import CreateSubtaskButton from "~/_components/create-task/create-subtask-button";
import { SetsInput } from "~/_components/sets-input";
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
    <SafeAreaView className="relative bg-background">
      <Stack.Screen options={{ title: "Task", headerShown: false }} />
      <View className="h-full w-full bg-background p-2">
        <TaskHeader initialTask={task} taskId={id as string} />
        <View className="flex-row items-center justify-between py-2">
          {task.isSet && (
            <SetsInput taskId={id as string} numSets={task.numSets} />
          )}
          <TaskDetailsDialog initialTask={task} taskId={id as string} />
        </View>
        <TaskCompletionTable task={task} />
        <SubtaskList initialTask={task} parentTaskId={id as string} />
      </View>
      <View className="absolute bottom-4 right-4 z-50">
        <CreateSubtaskButton
          taskId={id as string}
          parentTaskTitle={task.title}
        />
      </View>
    </SafeAreaView>
  );
}

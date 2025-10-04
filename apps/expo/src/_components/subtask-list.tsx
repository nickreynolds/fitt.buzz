import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/utils/api";
import TaskCard from "./task-card";

interface SubtaskListProps {
  initialTask: RouterOutputs["task"]["getTask"];
  parentTaskId: string;
}

export function SubtaskList({ initialTask, parentTaskId }: SubtaskListProps) {
  const { data: task } = api.task.getTask.useQuery(
    { id: parentTaskId },
    { initialData: initialTask, refetchInterval: 5 * 60 * 1000 },
  );

  const tasks =
    task?.childTasks
      ?.concat()
      .sort(
        (
          a: RouterOutputs["task"]["getTask"],
          b: RouterOutputs["task"]["getTask"],
        ) => a.sortIndex - b.sortIndex,
      ) ?? [];

  const renderItem = ({ item }: { item: RouterOutputs["task"]["getTask"] }) => {
    return (
      <View className="flex flex-row rounded-lg bg-muted">
        <TaskCard task={item} />
      </View>
    );
  };

  if (tasks.length === 0) {
    return (
      <View>
        <Text>No subtasks</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="mt-0 flex h-full space-y-2">
      <FlashList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item: RouterOutputs["task"]["getTask"]) => item.id}
        estimatedItemSize={100}
      />
    </SafeAreaView>
  );
}

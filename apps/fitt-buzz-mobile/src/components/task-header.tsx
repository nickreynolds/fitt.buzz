import React from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Check } from "lucide-react-native";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/utils/api";
import { Button } from "./ui/button";

interface TaskHeaderProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskHeader({ initialTask, taskId }: TaskHeaderProps) {
  const utils = api.useUtils();

  const completeTask = api.task.completeTask.useMutation({
    onMutate: () => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== taskId);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
      await utils.task.invalidate();
    },
  });

  const completedSubtasks = initialTask.childTasks.filter(
    (task) => task.lastCompleted,
  ).length;
  const totalSubtasks = initialTask.childTasks.length;

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text
          className="text-2xl font-bold text-primary"
          onPress={() => router.push(`/task/${taskId}`)}
        >
          {initialTask.title}
          {initialTask.recurring && (
            <Text className="text-muted-foreground"> ↻</Text>
          )}
        </Text>
        {totalSubtasks > 0 && (
          <Text className="mt-1 text-sm text-muted-foreground">
            {completedSubtasks} of {totalSubtasks} subtasks completed
          </Text>
        )}
      </View>
      <Button
        variant="ghost"
        className="h-10 w-10 p-0"
        onPress={() => completeTask.mutate({ id: taskId })}
      >
        <Check className="h-5 w-5" />
      </Button>
    </View>
  );
}

import React from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Check } from "lucide-react-native";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/utils/api";
import { Button } from "./ui/button";

interface SubtaskListProps {
  tasks: RouterOutputs["task"]["getTask"]["childTasks"];
}

export function SubtaskList({ tasks }: SubtaskListProps) {
  const utils = api.useUtils();

  const completeTask = api.task.completeTask.useMutation({
    onMutate: (input) => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== input.id);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
      await utils.task.invalidate();
    },
  });

  if (tasks.length === 0) {
    return null;
  }

  return (
    <View className="mt-4 space-y-2">
      <Text className="text-lg font-semibold text-primary">Subtasks</Text>
      {tasks.map((task) => (
        <View
          key={task.id}
          className="flex-row items-center justify-between rounded-lg bg-card p-3"
        >
          <Text
            className="flex-1 text-sm"
            onPress={() => router.push(`/task/${task.id}`)}
          >
            {task.title}
          </Text>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onPress={() => completeTask.mutate({ id: task.id })}
          >
            <Check className="h-4 w-4" />
          </Button>
        </View>
      ))}
    </View>
  );
}

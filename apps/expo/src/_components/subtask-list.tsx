import React from "react";
import { Text, View } from "react-native";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/utils/api";
import TaskCard from "./task-card";

interface SubtaskListProps {
  tasks: RouterOutputs["task"]["getTask"][];
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
      {tasks.map(
        (task) =>
          task && (
            <TaskCard
              task={task}
              onComplete={() => completeTask.mutate({ id: task.id })}
            />
          ),
      )}
    </View>
  );
}

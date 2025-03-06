import React from "react";
import { View } from "react-native";

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
    { initialData: initialTask },
  );

  if (!task) {
    return null;
  }

  const tasks = task.childTasks;
  if (!tasks || tasks.length === 0) {
    return <View>No subtasks</View>;
  }

  return (
    <View className="mt-4 space-y-2">
      {tasks.map((t) => {
        return <TaskCard key={t.id} task={t} />;
      })}
    </View>
  );
}

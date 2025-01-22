import React from "react";
import { Text, View } from "react-native";

import type { RouterOutputs } from "@acme/api";

import TaskCard from "./task-card";

interface SubtaskListProps {
  tasks?: RouterOutputs["task"]["getTask"][];
}

export function SubtaskList({ tasks }: SubtaskListProps) {
  if (!tasks) {
    return null;
  }
  if (tasks.length === 0) {
    return null;
  }

  return (
    <View className="mt-4 space-y-2">
      {tasks.map((task) => task && <TaskCard key={task.id} task={task} />)}
    </View>
  );
}

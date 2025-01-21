import React from "react";
import { Text, View } from "react-native";
import { format } from "date-fns";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/utils/api";
import { SubtaskList } from "./subtask-list";
import { TaskHeader } from "./task-header";

interface TaskCardProps {
  task: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskCard({ task, taskId }: TaskCardProps) {
  const { data: queryTask } = api.task.getTask.useQuery({ id: taskId });

  if (queryTask) {
    task = queryTask;
  }

  if (!task) {
    return <Text>Failed to load task.</Text>;
  }

  return (
    <View className="w-full rounded-lg bg-muted p-4">
      <TaskHeader initialTask={task} taskId={task.id} />
      <Text className="mt-2 text-sm">{task.description}</Text>
      <Text className="mt-2 text-sm text-muted-foreground">
        Due: {format(task.nextDue, "PPP 'at' p")}
      </Text>
      {task.completionPeriodBegins && (
        <Text className="text-sm text-muted-foreground">
          Completion window opens:{" "}
          {format(task.completionPeriodBegins, "PPP 'at' p")}
        </Text>
      )}
      <SubtaskList tasks={task.childTasks} />
    </View>
  );
}

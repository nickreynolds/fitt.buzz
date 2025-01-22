import React from "react";
import { Text, View } from "react-native";
import { Link, router } from "expo-router";
import { CheckCircle } from "lucide-react-native";

import type { RouterOutputs } from "@acme/api";
import {
  canBeCompleted,
  getNumCompletedChildTasks,
  isCompleted,
} from "@acme/api-utils";

import { CompleteTaskButton } from "./complete-task-button";
import Icon from "./icon";

interface TaskHeaderProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskHeader({ initialTask, taskId }: TaskHeaderProps) {
  if (!initialTask) {
    return null;
  }

  const canComplete = canBeCompleted(initialTask);
  const numChildTasks = initialTask.childTasks?.length ?? 0;
  const numCompletedChildTasks = getNumCompletedChildTasks(initialTask);
  const isComplete = isCompleted(initialTask);
  const undoneTasks = Array(numChildTasks - numCompletedChildTasks).fill(1);
  const doneTasks = Array(numCompletedChildTasks).fill(1);

  return (
    <View className="flex-col">
      <View className="w-full flex-row items-center justify-between">
        <Link href={`/task/${taskId}`}>
          <Text
            className="text-2xl font-semibold text-primary"
            onPress={() => router.push(`/task/${taskId}`)}
          >
            {initialTask.title}
            {initialTask.recurring && (
              <Text className="text-muted-foreground"> ↻</Text>
            )}
          </Text>
        </Link>
        <View className="flex flex-row items-center gap-4">
          {canComplete && <CompleteTaskButton task={initialTask} />}
          {(numCompletedChildTasks < numChildTasks || !canComplete) &&
            undoneTasks.map((t, i) => (
              <Icon
                name="Circle"
                className="h-6 w-6 text-primary"
                key={`${t}-${i}`}
              />
            ))}
          {(numCompletedChildTasks < numChildTasks || !canComplete) &&
            doneTasks.map((t, i) => (
              <Icon
                name="Check"
                className="h-6 w-6 text-primary"
                key={`${t}-${i}`}
              />
            ))}
          {isComplete && <CheckCircle className="h-4 w-4" />}
        </View>
      </View>
    </View>
  );
}

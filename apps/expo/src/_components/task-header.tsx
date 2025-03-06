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
  const numSets = initialTask.numSets;
  const numCompletedSets = initialTask.numCompletedSets;

  const status = () => {
    if (canComplete) {
      return (
        <CompleteTaskButton
          taskId={initialTask.id}
          parentTaskId={initialTask.parentTaskId}
        />
      );
    }

    if (numSets > 1) {
      const completedSets = Array(numCompletedSets).fill(1);
      const incompleteSets = Array(numSets - numCompletedSets).fill(1);
      const incompleteElements = incompleteSets.map((t, i) => (
        <Icon
          name="Circle"
          className="h-6 w-6 text-foreground"
          key={`${t}-${i}`}
        />
      ));
      const completedElements = completedSets.map((t, i) => (
        <Icon
          name="Check"
          className="h-6 w-6 text-foreground"
          key={`${t}-${i}`}
        />
      ));
      return [...incompleteElements, ...completedElements];
    }

    if (numCompletedChildTasks < numChildTasks) {
      const incompleteTaskElements = undoneTasks.map((t, i) => (
        <Icon
          name="Circle"
          className="h-6 w-6 text-foreground"
          key={`${t}-${i}`}
        />
      ));

      const completedTaskElements = doneTasks.map((t, i) => (
        <Icon
          name="Check"
          className="h-6 w-6 text-foreground"
          key={`${t}-${i}`}
        />
      ));
      return [...incompleteTaskElements, ...completedTaskElements];
    }

    if (isComplete) {
      return (
        <View className="text-primary">
          <Icon name="Check" className="h-6 w-6 text-primary" />
        </View>
      );
    }
  };

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
        <View className="flex flex-row items-center gap-4">{status()}</View>
      </View>
    </View>
  );
}

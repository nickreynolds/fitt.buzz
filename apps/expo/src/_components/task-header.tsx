import React from "react";
import { Pressable, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Check } from "lucide-react-native";

import type { RouterOutputs } from "@acme/api";

interface TaskHeaderProps {
  initialTask: RouterOutputs["task"]["getTask"];
  onComplete: () => void;
  taskId: string;
}

export function TaskHeader({
  initialTask,
  taskId,
  onComplete,
}: TaskHeaderProps) {
  if (!initialTask) {
    return null;
  }

  console.log("initialTask", JSON.stringify(initialTask, null, 2));

  const completedSubtasks = initialTask.childTasks.filter(
    (task) => task.lastCompleted,
  ).length;
  const totalSubtasks = initialTask.childTasks.length;

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-grow">
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
        {totalSubtasks > 0 && (
          <Text className="mt-1 text-sm text-muted-foreground">
            {completedSubtasks} of {totalSubtasks} subtasks completed
          </Text>
        )}
      </View>
      <Pressable onPress={onComplete}>
        <Check className="h-6 w-6" stroke="#5B65E9" strokeWidth={2} />
      </Pressable>
    </View>
  );
}

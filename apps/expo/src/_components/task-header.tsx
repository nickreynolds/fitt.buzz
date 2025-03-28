import React from "react";
import { Text, View } from "react-native";
import { Link, router } from "expo-router";

import type { RouterOutputs } from "@acme/api";
import {
  canBeCompleted,
  getNumCompletedChildTasks,
  isCompleted,
} from "@acme/api-utils";
import { TaskCompletionTypes } from "@acme/utils";

import { api } from "~/utils/api";
import { CompleteTaskButton } from "./complete-task-button";
import { CompleteTimedTaskButton } from "./complete-timed-task-button";
import { CompleteWeightRepsTaskButton } from "./complete-weight-reps-task-button";
import Icon from "./icon";

interface TaskHeaderProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskHeader({ initialTask, taskId }: TaskHeaderProps) {
  if (!initialTask) {
    return null;
  }

  const { data } = api.task.getTask.useQuery(
    { id: taskId },
    { initialData: initialTask },
  );

  const task = data ?? initialTask;

  const canComplete = canBeCompleted(task);
  const numChildTasks = task.childTasks?.length ?? 0;
  const numCompletedChildTasks = getNumCompletedChildTasks(task);
  const isComplete = isCompleted(task);
  const undoneTasks = Array(numChildTasks - numCompletedChildTasks).fill(1);
  const doneTasks = Array(numCompletedChildTasks).fill(1);
  const numSets = task.numSets;
  const numCompletedSets = task.numCompletedSets;

  const status = () => {
    if (canComplete) {
      if (task.completionDataType === TaskCompletionTypes.WeightReps) {
        return (
          <CompleteWeightRepsTaskButton
            taskId={task.id}
            parentTaskId={task.parentTaskId}
          />
        );
      } else if (task.completionDataType === TaskCompletionTypes.Time) {
        return (
          <CompleteTimedTaskButton
            taskId={task.id}
            parentTaskId={task.parentTaskId}
          />
        );
      }
      return (
        <CompleteTaskButton taskId={task.id} parentTaskId={task.parentTaskId} />
      );
    }

    if (numSets > 1) {
      const completedSets = Array(numCompletedSets).fill(1);
      const incompleteSets = Array(numSets - numCompletedSets).fill(1);
      const incompleteElements = incompleteSets.map((t, i) => (
        <Icon
          name="Circle"
          className="h-6 w-6 text-foreground"
          key={`${taskId}-circle-${t}-${i}`}
        />
      ));
      const completedElements = completedSets.map((t, i) => (
        <Icon
          name="Check"
          className="h-6 w-6 text-foreground"
          key={`${taskId}-check-${t}-${i}`}
        />
      ));
      return [...incompleteElements, ...completedElements];
    }

    if (numCompletedChildTasks < numChildTasks) {
      const incompleteTaskElements = undoneTasks.map((t, i) => (
        <Icon
          name="Circle"
          className="h-6 w-6 text-foreground"
          key={`${taskId}-circle-${t}-${i}`}
        />
      ));

      const completedTaskElements = doneTasks.map((t, i) => (
        <Icon
          name="Check"
          className="h-6 w-6 text-foreground"
          key={`${taskId}-check-${t}-${i}`}
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
      <View className="min-w-full flex-col">
        <Link href={`/task/${taskId}`} className="w-full">
          <Text
            className="w-full text-2xl font-semibold text-primary"
            onPress={() => router.push(`/task/${taskId}`)}
          >
            {task.title}
            {task.recurring && (
              <Text className="text-muted-foreground"> ↻</Text>
            )}
          </Text>
        </Link>
        <View className="flex flex-row items-center gap-4 self-end">
          {status()}
        </View>
      </View>
    </View>
  );
}

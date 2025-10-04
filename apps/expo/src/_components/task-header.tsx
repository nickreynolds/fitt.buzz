import React, { useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Text, View } from "react-native";
import { Link, router } from "expo-router";

import type { RouterOutputs } from "@acme/api";
import {
  canBeCompleted,
  getNumCompletedChildTasks,
  isCompleted,
  isOverdue,
} from "@acme/api-utils";
import { TaskCompletionTypes } from "@acme/utils";

import { api } from "~/utils/api";
import { CompleteTaskButton } from "./complete-task-button";
import { CompleteTimedTaskButton } from "./complete-timed-task-button";
import { CompleteWeightRepsTaskButton } from "./complete-weight-reps-task-button";
import Icon from "./icon";
import { OverdueBadge } from "./overdue-badge";
import { TimeUntilOverdueBadge } from "./time-until-overdue-badge";

interface TaskHeaderProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskHeader({ initialTask, taskId }: TaskHeaderProps) {
  const [textWidth, setTextWidth] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  if (!initialTask) {
    return null;
  }
  const utils = api.useUtils();
  const { data } = api.task.getTask.useQuery(
    { id: taskId },
    { initialData: initialTask, refetchInterval: 5 * 60 * 1000 },
  );

  const task = data ?? initialTask;
  const parentTask = utils.task.getTask.getData({
    id: initialTask.parentTaskId ?? "",
  });

  const canComplete = canBeCompleted(task, parentTask);
  const numChildTasks = task.childTasks?.length ?? 0;
  const numCompletedChildTasks = getNumCompletedChildTasks(task);
  const isComplete = isCompleted(task);
  const isTaskOverdue = !task.parentTaskId && isOverdue(task);
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

  const handleTextLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTextWidth(width);
    if (width > 300) {
      setFontSize(fontSize - 1);
    }
  };

  console.log("textWidth", textWidth);

  return (
    <View className="flex-col max-w-full">
      <View className="min-w-full flex-col max-w-full">
        <Link href={`/task/${taskId}`} className="min-w-fullmax-w-full">
          <View className="w-full flex-row justify-between items-center">
            <Text
              className="font-semibold text-primary"
              onPress={() => router.push(`/task/${taskId}`)}
              onLayout={handleTextLayout}
              style={{ fontSize }}
            >
              {task.title}
              {task.recurring && (
                <Text className="text-muted-foreground">↻</Text>
              )}
            </Text>
            <View>
              {isTaskOverdue && <OverdueBadge />}
              {!task.parentTaskId && !isTaskOverdue && (
                <TimeUntilOverdueBadge nextDue={task.nextDue} />
              )}
            </View>
          </View>
        </Link>
        <View className="flex flex-row items-center gap-4 self-end">
          {status()}
        </View>
      </View>
    </View>
  );
}

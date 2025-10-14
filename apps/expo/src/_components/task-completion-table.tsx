import React from "react";
import { ScrollView, Text, View } from "react-native";

import type { RouterOutputs } from "@acme/api";
import { TaskCompletionTypes } from "@acme/utils";
import { formatTime } from "@acme/utils";

interface TaskCompletionTableProps {
  task: RouterOutputs["task"]["getTask"];
}

interface WeightRepsCompletionData {
  weight: number;
  weightUnit: string;
  reps: number;
}

interface TimedCompletionData {
  time: number;
}

export function TaskCompletionTable({ task }: TaskCompletionTableProps) {
  if (
    !task?.taskCompletionData?.length &&
    !task?.childTaskCompletionDataMap?.size
  ) {
    return null;
  }

  const renderCompletionData = (data: string, completionDataType: string) => {
    try {
      const parsed = JSON.parse(data) as
        | WeightRepsCompletionData
        | TimedCompletionData
        | Record<string, unknown>;
      if (
        (completionDataType as TaskCompletionTypes) ===
        TaskCompletionTypes.WeightReps
      ) {
        const parsedData = parsed as WeightRepsCompletionData;
        if (parsedData.weight && parsedData.weightUnit && parsedData.reps) {
          return `${parsedData.weight}${parsedData.weightUnit} × ${parsedData.reps}`;
        }
      } else if (
        (completionDataType as TaskCompletionTypes) === TaskCompletionTypes.Time
      ) {
        const parsedData = parsed as TimedCompletionData;
        return formatTime(parsedData.time);
      } else if (
        (completionDataType as TaskCompletionTypes) ===
        TaskCompletionTypes.Boolean
      ) {
        return "Completed.";
      }
      return String(JSON.stringify(parsed));
    } catch {
      return String(data);
    }
  };

  const allCompletionData = [];

  for (const childTask of task.childTasks ?? []) {
    const completionData = task.childTaskCompletionDataMap?.get(childTask.id);
    if (!completionData?.length) continue;
    allCompletionData.push(
      ...completionData.map((cd, index) => {
        return {
          key: `${childTask.id}-${index}`,
          cd,
          title: childTask.title,
          completionDataType: childTask.completionDataType,
        };
      }),
    );
  }

  console.log(allCompletionData);

  return (
    <View className="mt-4 w-full">
      {/* Main task row */}
      {task.taskCompletionData && task.taskCompletionData.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          <View className="flex-row border-b border-border">
            <View className="w-32 p-2">
              <Text className="text-sm">{task.title}</Text>
            </View>
            {task.taskCompletionData.map((data, i) => (
              <View key={i} className="w-24 p-2">
                <Text className="text-sm">
                  {renderCompletionData(data, task.completionDataType)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Child task rows */}
      {allCompletionData.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {allCompletionData.map((childTask) => {
              // Don't display child task title if it's identical to the parent task title
              const shouldShowTitle = childTask.title !== task.title;

              return (
                <View
                  key={childTask.key}
                  className="rounded-md bg-secondary p-2 mr-2 min-w-24"
                >
                  {shouldShowTitle && (
                    <Text className="text-sm text-foreground mb-1">
                      {childTask.title}
                    </Text>
                  )}
                  <Text className="text-sm text-primary">
                    {renderCompletionData(
                      childTask.cd,
                      childTask.completionDataType,
                    )}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

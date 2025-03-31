import React from "react";
import { Text, View } from "react-native";

import type { RouterOutputs } from "@acme/api";

interface TaskCompletionTableProps {
  task: RouterOutputs["task"]["getTask"];
}

interface WeightRepsCompletionData {
  weight: number;
  weightUnit: string;
  reps: number;
}

export function TaskCompletionTable({ task }: TaskCompletionTableProps) {
  if (
    !task?.taskCompletionData?.length &&
    !task?.childTaskCompletionDataMap?.size
  ) {
    return null;
  }

  const renderCompletionData = (data: string) => {
    try {
      const parsed = JSON.parse(data) as WeightRepsCompletionData;
      if (parsed.weight && parsed.weightUnit && parsed.reps) {
        return `${parsed.weight}${parsed.weightUnit} × ${parsed.reps}`;
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
        return { key: `${childTask.id}-${index}`, cd, title: childTask.title };
      }),
    );
  }

  console.log(allCompletionData);

  return (
    <View className="mt-4 min-w-full max-w-full">
      <View>
        {/* Main task row */}
        {task.taskCompletionData && task.taskCompletionData.length > 0 && (
          <View className="flex-row border-b border-border">
            <View className="w-32 p-2">
              <Text className="text-sm">{task.title}</Text>
            </View>
            {task.taskCompletionData.map((data, i) => (
              <View key={i} className="w-24 p-2">
                <Text className="text-sm">{renderCompletionData(data)}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="wrap flex w-full max-w-full flex-row">
          {/* Child task rows */}
          {allCompletionData.length > 0 &&
            allCompletionData.map((childTask) => {
              return (
                <View
                  key={childTask.key}
                  className="flex-row rounded-md bg-secondary p-2"
                >
                  <Text className="text-sm text-foreground">
                    {childTask.title}{" "}
                  </Text>
                  <Text className="text-sm text-primary">
                    {renderCompletionData(childTask.cd)}
                  </Text>
                </View>
              );
            })}
        </View>
      </View>
    </View>
  );
}

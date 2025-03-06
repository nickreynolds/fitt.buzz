import React from "react";
import { ScrollView, Text, View } from "react-native";

import type { RouterOutputs } from "@acme/api";
import { TaskCompletionTypes } from "@acme/utils";

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

  return (
    <View className="mt-4">
      <ScrollView horizontal>
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

          {/* Child task rows */}
          {task.childTasks?.map((childTask) => {
            const completionData = task.childTaskCompletionDataMap?.get(
              childTask.id,
            );
            if (!completionData?.length) return null;

            return (
              <View
                key={childTask.id}
                className="flex-col border-b border-border"
              >
                {completionData.map((data, i) => (
                  <View key={i} className="w-24 flex-row p-2">
                    <Text className="text-sm text-foreground">
                      {childTask.title}{" "}
                    </Text>
                    <Text className="text-sm text-primary">
                      {renderCompletionData(data)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

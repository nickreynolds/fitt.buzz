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
  console.log("CLIENT - task.taskCompletionData:", task?.taskCompletionData);
  console.log(
    "CLIENT - task.childTaskCompletionDataMap:",
    task?.childTaskCompletionDataMap,
  );
  console.log(
    "CLIENT - task.taskCompletionDataWithTimestamps:",
    task?.taskCompletionDataWithTimestamps,
  );
  console.log(
    "CLIENT - task.childTaskCompletionDataMapWithTimestamps:",
    task?.childTaskCompletionDataMapWithTimestamps,
  );

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

  // Sort child tasks by the createdAt of their first completion data item
  const sortedChildTasks = (task.childTasks ?? []).sort((a, b) => {
    const aCompletionData = task.childTaskCompletionDataMapWithTimestamps?.get(
      a.id,
    );
    const bCompletionData = task.childTaskCompletionDataMapWithTimestamps?.get(
      b.id,
    );

    if (!aCompletionData?.length && !bCompletionData?.length) return 0;
    if (!aCompletionData?.length) return 1;
    if (!bCompletionData?.length) return -1;

    const aFirstCompletion = aCompletionData[0];
    const bFirstCompletion = bCompletionData[0];

    if (!aFirstCompletion || !bFirstCompletion) return 0;

    return (
      aFirstCompletion.createdAt.getTime() -
      bFirstCompletion.createdAt.getTime()
    );
  });

  for (const childTask of sortedChildTasks) {
    // Use timestamp data if available, otherwise fall back to regular data
    const completionDataWithTimestamps =
      task.childTaskCompletionDataMapWithTimestamps?.get(childTask.id);
    const completionData = task.childTaskCompletionDataMap?.get(childTask.id);

    if (completionDataWithTimestamps?.length) {
      // Sort by createdAt in ascending order (oldest first)
      const sortedCompletionData = completionDataWithTimestamps.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      console.log("CLIENT - sortedCompletionData:", sortedCompletionData);

      allCompletionData.push(
        ...sortedCompletionData.map((item, index) => {
          return {
            key: `${childTask.id}-${index}`,
            cd: item.data,
            title: childTask.title,
            completionDataType: childTask.completionDataType,
          };
        }),
      );
    } else if (completionData?.length) {
      // Fallback to regular data if timestamp data not available
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
  }

  console.log(allCompletionData);

  return (
    <View className="mt-4 w-full">
      {/* Main task row */}
      {(task.taskCompletionDataWithTimestamps?.length ??
        task.taskCompletionData?.length) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          <View className="flex-row border-b border-border">
            <View className="w-32 p-2">
              <Text className="text-sm">{task.title}</Text>
            </View>
            {task.taskCompletionDataWithTimestamps?.length
              ? // Use timestamp data if available
                task.taskCompletionDataWithTimestamps
                  .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                  .map((item, i) => (
                    <View key={i} className="w-24 p-2">
                      <Text className="text-sm">
                        {renderCompletionData(
                          item.data,
                          task.completionDataType,
                        )}
                      </Text>
                    </View>
                  ))
              : // Fallback to regular data
                task.taskCompletionData?.map((data, i) => (
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

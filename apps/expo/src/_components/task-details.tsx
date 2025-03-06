import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { format } from "date-fns";
import { Trash2 } from "lucide-react-native";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/utils/api";

interface TaskDetailsProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
  onClose?: () => void;
}

export function TaskDetails({
  initialTask,
  taskId,
  onClose,
}: TaskDetailsProps) {
  const utils = api.useUtils();

  const deleteTask = api.task.deleteTask.useMutation({
    onMutate: () => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== taskId);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
      onClose?.();
    },
    onSettled: async () => {
      await Promise.all([
        utils.task.getAllMyActiveTasks.invalidate(),
        utils.task.getAllMyTasks.invalidate(),
      ]);
    },
  });

  return (
    <View className="space-y-4">
      <View>
        <Text className="text-sm font-medium">Description</Text>
        <Text className="mt-1 text-muted-foreground">
          {initialTask?.description ?? "No description provided"}
        </Text>
      </View>

      <View>
        <Text className="text-sm font-medium">Due Date</Text>
        <Text className="mt-1 text-muted-foreground">
          {format(initialTask?.nextDue ?? new Date(), "PPP 'at' p")}
        </Text>
      </View>

      {initialTask?.recurring && (
        <>
          <View>
            <Text className="text-sm font-medium">Frequency</Text>
            <Text className="mt-1 text-muted-foreground">
              Every{" "}
              {initialTask.frequencyHours === 24
                ? "day"
                : initialTask.frequencyHours === 168
                  ? "week"
                  : initialTask.frequencyHours === 336
                    ? "two weeks"
                    : "month"}
            </Text>
          </View>

          {initialTask.lastCompleted && (
            <View>
              <Text className="text-sm font-medium">Last Completed</Text>
              <Text className="mt-1 text-muted-foreground">
                {format(initialTask.lastCompleted, "PPP 'at' p")}
              </Text>
            </View>
          )}

          {initialTask.completionPeriodBegins && (
            <View>
              <Text className="text-sm font-medium">
                Completion Window Opens
              </Text>
              <Text className="mt-1 text-muted-foreground">
                {format(initialTask.completionPeriodBegins, "PPP 'at' p")}
              </Text>
            </View>
          )}
        </>
      )}

      <View className="mt-6 flex-row gap-2">
        <TouchableOpacity
          onPress={() => deleteTask.mutate({ id: taskId })}
          className="bg-red flex-row items-center gap-2 rounded-lg"
        >
          <Trash2 size={16} color="currentColor" />
          <Text className="text-destructive-foreground">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

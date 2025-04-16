import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { format } from "date-fns";
import { Trash2 } from "lucide-react-native";

import type { RouterOutputs } from "@acme/api";
import { TaskBlockingTypes } from "@acme/utils";

import { Switch } from "~/components/ui/switch";
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

  const updateIsSet = api.task.updateIsSet.useMutation({
    onMutate: ({ isSet }) => {
      const previousTask = utils.task.getTask.getData({ id: taskId });
      if (previousTask) {
        utils.task.getTask.setData(
          { id: taskId },
          { ...previousTask, isSet, numSets: isSet ? 1 : 0 },
        );
      }
    },
    onSettled: async () => {
      await utils.task.getTask.invalidate({ id: taskId });
    },
  });

  const updateBlocking = api.task.updateBlocking.useMutation({
    onMutate: ({ blocking }) => {
      const previousTask = utils.task.getTask.getData({ id: taskId });
      if (previousTask) {
        utils.task.getTask.setData(
          { id: taskId },
          { ...previousTask, blocking },
        );
      }
    },
    onSettled: async () => {
      await utils.task.getTask.invalidate({ id: taskId });
    },
  });

  const getBlockingLabel = (blocking: TaskBlockingTypes) => {
    switch (blocking) {
      case TaskBlockingTypes.BLOCK_WHEN_OVERDUE:
        return "Block when overdue";
      case TaskBlockingTypes.NEVER_BLOCK:
        return "Never block";
      case TaskBlockingTypes.BLOCK_WHEN_TWICE_OVERDUE:
        return "Block when twice overdue";
      default:
        return "Unknown";
    }
  };

  return (
    <View className="space-y-4">
      <View>
        <Text className="text-sm font-medium">Description</Text>
        <Text className="mt-1 text-muted-foreground">
          {initialTask?.description ?? "No description provided"}
        </Text>
      </View>

      <View className="flex-col items-start justify-between">
        <View>
          <Text className="text-sm font-medium">Set-based Task</Text>
          <Text className="text-sm text-muted-foreground">
            Enable if this task should be completed in sets
          </Text>
        </View>
        <Switch
          checked={initialTask?.isSet ? true : false}
          onCheckedChange={(checked) =>
            updateIsSet.mutate({ id: taskId, isSet: checked })
          }
        />
      </View>

      <View className="flex-col items-start justify-between">
        <View>
          <Text className="text-sm font-medium">Blocking Behavior</Text>
          <Text className="text-sm text-muted-foreground">
            Controls how this task blocks other tasks when overdue
          </Text>
        </View>
        <View className="mt-2 w-full space-y-2">
          {Object.values(TaskBlockingTypes).map((blockingType) => (
            <View
              key={blockingType}
              className="flex-row items-center justify-between"
            >
              <Text className="text-sm">{getBlockingLabel(blockingType)}</Text>
              <Switch
                checked={initialTask?.blocking === blockingType}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateBlocking.mutate({
                      id: taskId,
                      blocking: blockingType,
                    });
                  }
                }}
              />
            </View>
          ))}
        </View>
      </View>

      <View>
        <Text className="text-sm font-medium text-primary">Due Date</Text>
        <Text className="mt-1 text-muted-foreground">
          {format(initialTask?.nextDue ?? new Date(), "PPP 'at' p")}
        </Text>
      </View>

      {initialTask?.recurring && (
        <>
          <View>
            <Text className="text-sm font-medium text-primary">Frequency</Text>
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
              <Text className="text-sm font-medium text-primary">
                Last Completed
              </Text>
              <Text className="mt-1 text-muted-foreground">
                {format(initialTask.lastCompleted, "PPP 'at' p")}
              </Text>
            </View>
          )}

          {initialTask.completionPeriodBegins && (
            <View>
              <Text className="text-sm font-medium text-primary">
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

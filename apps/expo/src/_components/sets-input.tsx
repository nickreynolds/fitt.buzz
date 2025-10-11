import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { api } from "~/utils/api";

interface SetsInputProps {
  taskId: string;
  numSets: number;
}

export function SetsInput({ taskId, numSets }: SetsInputProps) {
  const utils = api.useUtils();

  const doSetNumSets = api.task.setNumSets.useMutation({
    onMutate: ({ id, numSets }) => {
      const task = utils.task.getTask.getData({ id });
      if (!task) {
        throw new Error("Parent task not found");
      }

      utils.task.getTask.setData({ id }, { ...task, numSets });
    },
    onSettled: async () => {
      await utils.task.getTask.invalidate({ id: taskId });
    },
  });

  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        className="rounded-lg bg-muted px-4 py-2"
        onPress={() => {
          const t = utils.task.getTask.getData({ id: taskId });
          if (!t) {
            throw new Error("Task not found in cache");
          }
          if (t.numSets > 1) {
            doSetNumSets.mutate({
              id: taskId,
              numSets: t.numSets - 1,
            });
          }
        }}
      >
        <Text className="text-lg font-semibold text-foreground">-</Text>
      </TouchableOpacity>
      <Text className="text-lg font-semibold text-foreground">{numSets}</Text>
      <TouchableOpacity
        className="rounded-lg bg-muted px-4 py-2"
        onPress={() => {
          const t = utils.task.getTask.getData({ id: taskId });
          if (!t) {
            throw new Error("Task not found in cache");
          }
          doSetNumSets.mutate({
            id: taskId,
            numSets: t.numSets + 1,
          });
        }}
      >
        <Text className="text-lg font-semibold text-foreground">+</Text>
      </TouchableOpacity>
    </View>
  );
}

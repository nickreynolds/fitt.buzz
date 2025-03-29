import type { AVPlaybackSource } from "expo-av";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Audio } from "expo-av";

import { canBeCompleted, isCompleted } from "@acme/api-utils";
import { parseEditValue } from "@acme/utils";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/utils/api";
import { TimerDialog } from "./timer-dialog";

interface CompleteTimedTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteTimedTaskButton({
  taskId,
  parentTaskId,
}: CompleteTimedTaskButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState("0100");
  const [sound, setSound] = useState<Audio.Sound>();
  const utils = api.useUtils();
  const task = utils.task.getTask.getData({ id: taskId });
  const parentTask = utils.task.getTask.getData({ id: parentTaskId ?? "" });

  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

  const completeTask = api.task.completeTimedTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ time: parseEditValue(editValue) });
    },
    onSettled: handleSettled,
  });

  React.useEffect(() => {
    if (parentTask) {
      const numCompletedSets = parentTask.numCompletedSets;
      const prevCompletions =
        parentTask.prevChildTaskCompletionDataMap?.get(taskId);
      if (prevCompletions && prevCompletions.length > 0) {
        const prevCompletion1 =
          prevCompletions[
            Math.min(numCompletedSets, prevCompletions.length - 1)
          ];
        if (prevCompletion1) {
          const prevCompletion = JSON.parse(prevCompletion1) as {
            time: number;
          };
          setEditValue(formatEditValue(prevCompletion.time.toString()));
        }
      }
    }
  }, [parentTask, taskId, setEditValue]);

  React.useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("../../assets/sounds/meditation-bell.mp3") as AVPlaybackSource,
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }

  if (!task) {
    return null;
  }

  const handleInputChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, ""); // Remove non-digits
    if (cleanValue.length <= 4) {
      // Only allow up to 4 digits
      setEditValue(cleanValue);
    }
  };

  const formatEditValue = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length <= 2) return value;
    if (value.length == 3) return `${value.slice(0, 1)}:${value.slice(1)}`;
    return `${value.slice(0, 2)}:${value.slice(2)}`;
  };

  const handleStartTimer = () => {
    const time = parseEditValue(editValue);
    if (time > 0) {
      setIsDialogOpen(true);
    }
  };

  const handleTimerComplete = async (time: number) => {
    completeTask.mutate({ id: taskId, time });
    await playSound();
  };

  return (
    <>
      {canBeCompleted(task, parentTask) && (
        <View className="flex-row items-center gap-2">
          <TextInput
            value={formatEditValue(editValue)}
            onChangeText={handleInputChange}
            className="w-20 border-b-2 border-none bg-transparent p-0 text-center text-2xl font-medium text-foreground"
            maxLength={5}
            placeholder="00:00"
            placeholderTextColor="#666"
          />
          <Pressable
            onPress={handleStartTimer}
            className="flex-row items-center justify-center rounded-lg bg-primary px-4 py-2"
          >
            <Text className="text-foreground">Start Timer</Text>
          </Pressable>
        </View>
      )}
      {!isCompleted(task, parentTask) && !canBeCompleted(task, parentTask) && (
        <Text>cannot complete</Text>
      )}

      <TimerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialTime={parseEditValue(editValue)}
        onTimerComplete={handleTimerComplete}
      />
    </>
  );
}

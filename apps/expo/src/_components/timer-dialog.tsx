import type { AVPlaybackSource } from "expo-av";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Audio } from "expo-av";
import * as DialogPrimitive from "@rn-primitives/dialog";

import { useTimer } from "@acme/hooks";
import { formatTime } from "@acme/utils";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/utils/api";

interface TimerDialogProps {
  taskId: string;
  parentTaskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTime: number;
}

export function TimerDialog({
  taskId,
  parentTaskId,
  open,
  onOpenChange,
  initialTime,
}: TimerDialogProps) {
  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

  const [sound, setSound] = useState<Audio.Sound>();

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

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const utils = api.useUtils();
  const {
    time,
    setTime,
    originalTime,
    setOriginalTime,
    isRunning,
    startEditing,
    togglePause,
  } = useTimer({
    onTimerComplete: () => {
      completeTask.mutate({ id: taskId, time: originalTime });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      playSound();
      onOpenChange(false);
    },
    initialTime,
  });

  const completeTask = api.task.completeTimedTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ time: originalTime });
    },
    onSettled: handleSettled,
  });

  const parentTask = utils.task.getTask.getData({ id: parentTaskId ?? "" });
  const task = utils.task.getTask.getData({ id: taskId });

  // Set initial time when dialog opens
  useEffect(() => {
    if (open) {
      setTime(initialTime);
      setOriginalTime(initialTime);
      togglePause(); // Start the timer immediately
    }
  }, [open, initialTime, setTime, setOriginalTime, togglePause]);

  if (!task) {
    return null;
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="absolute inset-0 bottom-16 left-16 right-16 top-16 z-50 bg-black/50 p-4">
          <DialogPrimitive.Content className="rounded-lg bg-background p-4">
            <DialogPrimitive.Title>
              <Text className="text-lg font-semibold text-primary">
                {task.title}
              </Text>
            </DialogPrimitive.Title>

            <View className="mt-8 items-center justify-center">
              <Pressable
                onPress={startEditing}
                className="items-center justify-center"
              >
                <Text className="text-4xl font-medium text-foreground">
                  {formatTime(time)}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => togglePause()}
                className="mt-8 flex-row items-center justify-center rounded-lg bg-primary px-8 py-4"
              >
                <Text className="text-lg text-foreground">
                  {isRunning ? "Pause" : "Start"}
                </Text>
              </Pressable>
            </View>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

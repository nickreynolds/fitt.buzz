import type { AVPlaybackSource } from "expo-av";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Audio } from "expo-av";

import { canBeCompleted, isCompleted } from "@acme/api-utils";
import { useTimer } from "@acme/hooks";
import { formatTime } from "@acme/utils";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/utils/api";

interface CompleteTimedTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteTimedTaskButton({
  taskId,
  parentTaskId,
}: CompleteTimedTaskButtonProps) {
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
    // isEditing,
    // editValue,
    // setEditValue,
    startEditing,
    // handleBlur,
    togglePause,
    // pauseTimer,
    // onForcedProgressChange,
  } = useTimer(() => {
    completeTask.mutate({ id: taskId, time: originalTime });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    playSound();
  });

  const completeTask = api.task.completeTimedTask.useMutation({
    onMutate: async () => {
      await handleOptimisticUpdate({ time: originalTime });
    },
    onSettled: handleSettled,
  });

  const parentTask = utils.task.getTask.getData({ id: parentTaskId ?? "" });
  const task = utils.task.getTask.getData({ id: taskId });

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
          setTime(prevCompletion.time);
          setOriginalTime(prevCompletion.time);
        }
      }
    }
  }, [parentTask, taskId, setTime, setOriginalTime]);

  // React.useEffect(() => {
  //   return () => {
  //     if (audioRef.current) {
  //       audioRef.current.unloadAsync();
  //     }
  //   };
  // }, []);

  if (!task) {
    return <View />;
  }

  return (
    <View className="flex-row items-center">
      {canBeCompleted(task, parentTask) && (
        <>
          <Pressable
            onPress={startEditing}
            className="items-center justify-center"
          >
            <Text className="text-2xl font-medium text-foreground">
              {formatTime(time)}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => togglePause()}
            className="ml-4 flex-row items-center justify-center rounded-lg bg-primary px-4 py-2"
          >
            <Text className="text-foreground">
              {isRunning ? "Pause" : "Start"}
            </Text>
          </Pressable>
        </>
      )}
      {!isCompleted(task, parentTask) && !canBeCompleted(task, parentTask) && (
        <Text>cannot complete</Text>
      )}
    </View>
  );
}

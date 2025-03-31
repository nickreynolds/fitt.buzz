import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import * as DialogPrimitive from "@rn-primitives/dialog";

import { useTimer } from "@acme/hooks";
import { formatTime } from "@acme/utils";

interface TimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTime: number;
  onTimerComplete: (time: number) => void;
}

export function TimerDialog({
  open,
  onOpenChange,
  initialTime,
  onTimerComplete,
}: TimerDialogProps) {
  const {
    time,
    setTime,
    originalTime,
    setOriginalTime,
    isRunning,
    togglePause,
    resetTimer,
  } = useTimer({
    onTimerComplete: () => {
      onTimerComplete(originalTime);
      onOpenChange(false);
    },
    initialTime,
  });

  // Set initial time when dialog opens
  useEffect(() => {
    if (open) {
      setTime(initialTime);
      setOriginalTime(initialTime);
    }
  }, [open, initialTime, setTime, setOriginalTime]);

  useEffect(() => {
    if (open) {
      togglePause(); // Start the timer immediately
    }
  }, [open]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetTimer();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="absolute inset-0 bottom-32 left-16 right-16 top-32 z-50">
          <DialogPrimitive.Content className="h-full w-full rounded-lg bg-muted p-4">
            <DialogPrimitive.Title>
              <Text className="text-lg font-semibold text-primary">Timer</Text>
            </DialogPrimitive.Title>

            <View className="mt-8 items-center justify-center">
              <Text className="text-4xl font-medium text-foreground">
                {formatTime(time)}
              </Text>

              <Pressable
                onPress={togglePause}
                className="mt-8 rounded-md bg-primary p-4"
              >
                {isRunning ? <Text>Pause</Text> : <Text>Start</Text>}
              </Pressable>
            </View>
            <DialogPrimitive.Close className="absolute right-4 top-4">
              <View className="mt-8 rounded-md bg-primary p-4">
                <Text>X</Text>
              </View>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

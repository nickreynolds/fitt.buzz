import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as DialogPrimitive from "@rn-primitives/dialog";

interface CompletionTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSeconds: number;
}

export function CompletionTimerDialog({
  open,
  onOpenChange,
  initialSeconds,
}: CompletionTimerDialogProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when dialog opens or closes
  useEffect(() => {
    if (open && initialSeconds > 0) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset to initial value
      setSeconds(initialSeconds);
    } else if (!open) {
      // Clear interval and reset when dialog closes
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setSeconds(initialSeconds);
    }
  }, [open, initialSeconds]);

  // Countdown timer - only runs when dialog is open and seconds > 0
  useEffect(() => {
    if (!open || seconds <= 0) {
      // Auto-close when timer reaches 0
      if (seconds === 0 && open) {
        const timeout = setTimeout(() => {
          onOpenChange(false);
        }, 100);
        return () => clearTimeout(timeout);
      }
      return;
    }

    // Start countdown interval
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, seconds, onOpenChange]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="absolute inset-0 h-full w-full rounded-md bg-background">
          <DialogPrimitive.Content>
            <View className="pt-12">
              <View className="w-full space-y-5 rounded-lg bg-card p-4 py-12">
                <Text className="text-xl font-semibold text-foreground">
                  Task Completed
                </Text>

                <View className="flex flex-col items-center justify-center py-8">
                  <Text className="text-6xl font-bold text-primary">
                    {formatTime(seconds)}
                  </Text>
                  <Text className="mt-4 text-sm text-muted-foreground">
                    Timer will close automatically
                  </Text>

                  <TouchableOpacity
                    onPress={() => onOpenChange(false)}
                    className="mt-8 rounded-lg border border-input bg-background px-6 py-3"
                  >
                    <Text className="text-center text-base font-medium text-foreground">
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Task Completed</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-6xl font-bold text-primary">
            {formatTime(seconds)}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Timer will close automatically
          </p>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mt-8"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

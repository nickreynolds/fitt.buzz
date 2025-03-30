import React, { useEffect, useRef, useState } from "react";

import { formatTime, parseEditValue } from "@acme/utils";

export const useTimer = ({
  onTimerComplete,
  initialTime,
}: {
  onTimerComplete: () => void;
  initialTime: number;
}) => {
  const [time, setTime] = useState<number>(initialTime); // Start at 1 minute (60 seconds)
  const [originalTime, setOriginalTime] = useState<number>(initialTime); // Track original starting time
  const [isRunning, setIsRunning] = useState<boolean>(false); // Start/paused
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>("");
  const lastTickTime = useRef<number>(Date.now());
  const nextTickDelay = useRef<number>(0);
  //   const inputRef = useRef<HTMLInputElement>(null);

  const timerStartTime = useRef<number>(Date.now());

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let initialDelayId: NodeJS.Timeout;

    if (isRunning && time > 0) {
      // If we have a delay from a previous pause, schedule the first tick
      if (nextTickDelay.current > 0) {
        initialDelayId = setTimeout(() => {
          setTime((prevTime) => prevTime - 1);
          lastTickTime.current = Date.now();
          nextTickDelay.current = 0;
        }, nextTickDelay.current);
      } else {
        const secondsElapsed = originalTime - time;
        const scheduledTime = timerStartTime.current + secondsElapsed * 1000;
        const diff = scheduledTime - Date.now();

        // Schedule regular ticks
        intervalId = setTimeout(() => {
          setTime((prevTime) => prevTime - 1);
          lastTickTime.current = Date.now();
        }, 1000 + diff);
      }
    } else if (isRunning && time === 0) {
      onTimerComplete();
      setIsRunning(false);
    }

    return () => {
      //   if (intervalId) {
      clearTimeout(intervalId);
      //   }
      //   if (initialDelayId) {
      clearTimeout(initialDelayId);
      //   }
    };
  }, [isRunning, time]);

  const startEditing = () => {
    setIsEditing(true);
    setIsRunning(false);
    setEditValue(formatTime(time));
    // setTimeout(() => {
    //   inputRef.current?.focus();
    // }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const newTime = parseEditValue(editValue);
    if (newTime > 0) {
      lastTickTime.current = Date.now();
      timerStartTime.current = Date.now();

      setTime(newTime);
      setOriginalTime(newTime);
      setIsRunning(true);
    }
  };

  //   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //     if (e.key === "Enter") {
  //       inputRef.current?.blur();
  //     }
  //   };

  const togglePause = () => {
    if (isRunning) {
      const now = Date.now();
      const timeSinceLastTick = now - lastTickTime.current;
      nextTickDelay.current = 1000 - (timeSinceLastTick % 1000);
    } else {
      // lastTickTime.current = Date.now();
      if (originalTime !== time) {
        if (nextTickDelay.current > 0) {
          timerStartTime.current =
            Date.now() +
            nextTickDelay.current -
            (originalTime - time + 1) * 1000;
        } else {
          timerStartTime.current = Date.now() - (originalTime - time) * 1000;
        }
      } else {
        timerStartTime.current = Date.now();
      }
    }
    setIsRunning((prev) => !prev);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const addMinute = () => {
    const now = Date.now();
    const timeSinceLastTick = now - lastTickTime.current;
    const remainingDelay = 1000 - (timeSinceLastTick % 1000);

    setTime((prevTime) => prevTime + 60);
    setOriginalTime((prevTime) => prevTime + 60);

    // If the timer is running, update the last tick time to preserve the timing
    if (isRunning) {
      lastTickTime.current = now;
      nextTickDelay.current = remainingDelay;
    }
  };

  const resetTimer = () => {
    setTime(originalTime);
    setIsRunning(false);
    nextTickDelay.current = 0;
  };

  // timer progress is changed by method other than ticking (e.g. dragging the progress circle)
  const onForcedProgressChange = (progressPercentage: number) => {
    const newTime = Math.round(progressPercentage * originalTime);
    nextTickDelay.current = 0;
    setTime(newTime);
  };

  return {
    time,
    setTime,
    originalTime,
    setOriginalTime,
    isRunning,
    isEditing,
    editValue,
    // inputRef,
    setEditValue,
    startEditing,
    handleBlur,
    // handleKeyDown,
    togglePause,
    addMinute,
    resetTimer,
    pauseTimer,
    onForcedProgressChange,
  };
};

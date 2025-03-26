import React from "react";

import { formatTime } from "@acme/utils";

import ProgressCircle from "../shared/progress-circle";

interface TimeDisplayProps {
  time: number;
  originalTime: number;
  isEditing: boolean;
  isRunning: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onStartEditing: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  //   inputRef: React.RefObject<HTMLInputElement | null>;
  pauseTimer: () => void;
  onNewAngle: (angle: number) => void;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  time,
  originalTime,
  isEditing,
  editValue,
  isRunning,
  onEditValueChange,
  onStartEditing,
  onBlur,
  onKeyDown,
  //   inputRef,
  pauseTimer,
  onNewAngle,
}) => {
  const progress = (time / originalTime) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 4) {
      // Only allow up to 4 digits
      onEditValueChange(value);
    }
  };

  const formatEditValue = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length <= 2) return value;
    if (value.length == 3) return `${value.slice(0, 1)}:${value.slice(1)}`;
    return `${value.slice(0, 2)}:${value.slice(2)}`;
  };

  return (
    <div className="relative mx-auto h-[120px] w-[120px]">
      <ProgressCircle
        progress={progress}
        onDragStart={pauseTimer}
        onDrag={onNewAngle}
        isRunning={isRunning}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer text-center">
        {isEditing ? (
          <div className="relative">
            <input
              //   ref={inputRef}
              type="text"
              value={formatEditValue(editValue)}
              onChange={handleInputChange}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              className="border-timer-primary focus:border-timer-secondary w-20 border-b-2 border-none bg-transparent p-0 text-center text-2xl font-medium text-foreground outline-none"
              maxLength={5}
              placeholder="00:00"
            />
          </div>
        ) : (
          <button
            onClick={onStartEditing}
            className="text-2xl font-medium text-foreground"
            aria-label="Edit Time  "
          >
            {formatTime(time)}
          </button>
        )}
      </div>
    </div>
  );
};

export default TimeDisplay;

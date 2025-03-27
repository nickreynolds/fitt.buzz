import React from "react";

import "./ProgressCircle.css";

// import { useDraggable } from "../../hooks/useDraggable";

interface ProgressCircleProps {
  progress: number; // 0 to 100
  onDragStart?: () => void;
  onDrag?: (angle: number) => void;
  isRunning?: boolean;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  isRunning = false,
}) => {
  // make sure progress is between 0 and 100
  progress = Math.max(0, Math.min(progress, 100));

  //   const [draggbleRef, dx, dy, angle, setFromAngle] = useDraggable({
  //         initialAngle: (progress / 100),
  //         onDragStart,
  //         onDrag,
  //     });

  //   React.useEffect(() => {
  //     (setFromAngle as (angle: number) => void)(progress / 100);
  //   }, [progress]);

  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div>
      <svg
        className="progress-ring"
        width="120"
        height="120"
        viewBox="0 0 120 120"
        role="graphics-document" // for testing
      >
        {/* Background circle */}
        <circle
          className="progress-ring__circle-bg"
          stroke="#253238"
          strokeWidth="4"
          fill="transparent"
          r="45"
          cx="60"
          cy="60"
        />
        {/* Progress circle */}
        <circle
          className={
            isRunning ? "progress-ring__circle" : "progress-ring__circle-empty"
          }
          stroke="#dfedfb"
          strokeWidth="4"
          fill="transparent"
          r="45"
          cx="60"
          cy="60"
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      {/* <div className="radial-progress-bar__circle" >
        <div
          className="bg-foreground rounded-full absolute top-0 left-0 w-4 h-4 cursor-move"
          // @ts-ignore
          ref={draggbleRef as (node: HTMLElement) => void}
          style={{
              transform: `translate(${dx}px, ${dy}px)`,
              zIndex: 9999,
          }}
        />
      </div> */}
    </div>
  );
};

export default ProgressCircle;

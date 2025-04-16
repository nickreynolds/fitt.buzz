import React from "react";

export interface TaskCompletionInfo {
  title: string;
  result: string;
}

export interface TaskCompletionTableProps {
  data: TaskCompletionInfo[];
}

export const TaskCompletionTable: React.FC<TaskCompletionTableProps> = ({
  data,
}) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="p-2">
      {data.map((row, i) => {
        return <div key={i}>{row.result}</div>;
      })}
    </div>
  );
};

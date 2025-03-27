import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export interface TaskCompletionInfo {
  title: string;
  result: string;
}

const columnHelper = createColumnHelper<TaskCompletionInfo>();

const columns = [
  columnHelper.accessor("title", {
    header: () => "Title",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("result", {
    header: () => "Result",
    cell: (info) => (
      <div>
        <span className="text-primary">{info.renderValue()}</span>
      </div>
    ),
  }),
];

export interface TaskCompletionTableProps {
  data: TaskCompletionInfo[];
}

export const TaskCompletionTable: React.FC<TaskCompletionTableProps> = ({
  data,
}) => {
  return (
    <div className="p-2">
      {data.map((row, i) => {
        return <div key={i}>{row.result}</div>;
      })}

      <div className="h-4" />
    </div>
  );
};

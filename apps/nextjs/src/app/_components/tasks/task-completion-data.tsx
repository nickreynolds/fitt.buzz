"use client";

import { api } from "~/trpc/react";

import "./transitions.css";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { RouterOutputs } from "@acme/api";
import { formatTime, TaskCompletionTypes } from "@acme/utils";

interface SubtaskListProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

interface TaskCompletionInfo {
  title: string;
  result: string;
}

const columnHelper = createColumnHelper<TaskCompletionInfo>();

const columns = [
  columnHelper.accessor("title", {
    header: () => "Title",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),

  columnHelper.accessor("result", {
    header: () => "Result",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
];

export function TaskCompletionData({ initialTask, taskId }: SubtaskListProps) {
  const { data: task } = api.task.getTask.useQuery(
    { id: taskId },
    { initialData: initialTask },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data1: any[] = React.useMemo(() => [], []);

  if (task) {
    task.taskCompletionData?.forEach((completionData) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsedData = JSON.parse(completionData);
      if (parsedData) {
        if (task.completionDataType === TaskCompletionTypes.WeightReps) {
          const parsedData2 = parsedData as { weight: number; reps: number };
          const result = `Weight: ${parsedData2.weight}, Reps: ${parsedData2.reps}`;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data1 = [...data1, result];
        } else if (task.completionDataType === TaskCompletionTypes.Boolean) {
          const result = `Completed.`;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data1 = [...data1, result];
        } else if (task.completionDataType === TaskCompletionTypes.Time) {
          const parsedData2 = parsedData as { time: number };
          const result = formatTime(parsedData2.time);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data1 = [...data1, result];
        } else {
          throw new Error("Invalid completion data type.");
        }
      }
    });
  }

  data1 = data1.flat();
  const data = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Array.isArray(data1) ? data1 : [];
  }, [data1]);

  const table = useReactTable({
    data: data as TaskCompletionInfo[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
    autoResetExpanded: false,
  });

  const childTaskCompletionDataMap = task?.childTaskCompletionDataMap;

  if (!task || childTaskCompletionDataMap?.size === 0) {
    return null;
  }

  // return null;
  return (
    <div className="p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <div className="h-4" />
    </div>
  );
}

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
import { Button } from "@acme/ui/button";

import { List } from "../drag-list/list";

interface SubtaskListProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

interface TaskCompletionInfo {
  title: string;
  weight: number;
  reps: number;
  weightUnit: string;
}

const columnHelper = createColumnHelper<TaskCompletionInfo>();

const columns = [
  columnHelper.accessor("title", {
    header: () => "Title",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),

  columnHelper.accessor("weight", {
    header: () => "Weight",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("reps", {
    header: () => "Reps",
    footer: (info) => info.column.id,
  }),
];

export function TaskChildrenCompletionData({
  initialTask,
  taskId,
}: SubtaskListProps) {
  const { data: task } = api.task.getTask.useQuery(
    { id: taskId },
    { initialData: initialTask },
  );

  const data = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data1: any[] = [];

    if (task) {
      task.childTasks?.forEach((childTask) => {
        const completionData = task.childTaskCompletionDataMap?.get(
          childTask.id,
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const parsedData = completionData?.map((data) => JSON.parse(data));
        if (parsedData) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data1 = [...data1, parsedData];
        }
      });
      console.log("data: ", data1);
    }
    data1 = data1.flat();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Array.isArray(data1) ? data1 : [];
  }, [task]);

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

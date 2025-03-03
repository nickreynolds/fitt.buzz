import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export interface TaskCompletionInfo {
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
  }),
  columnHelper.accessor("weight", {
    header: () => "Weight",
    cell: (info) => (
      <div>
        <span className="text-primary">{info.renderValue()}</span> lbs
      </div>
    ),
  }),
  columnHelper.accessor("reps", {
    header: () => "Reps",
    cell: (info) => (
      <div>
        {" "}
        for <span className="text-primary">{info.renderValue()}</span> reps
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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
    autoResetExpanded: false,
  });

  return (
    <div className="p-2">
      <table>
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
      </table>
      <div className="h-4" />
    </div>
  );
};

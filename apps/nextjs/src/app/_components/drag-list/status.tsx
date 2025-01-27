import type { HTMLAttributes } from "react";

import type { TStatus } from "./task-data";

const bgColor: Record<TStatus, HTMLAttributes<HTMLElement>["className"]> = {
  todo: "bg-violet-200 ",
  "in-progress": "bg-amber-200",
  done: "bg-green-200",
};

const label: Record<TStatus, string> = {
  todo: "TODO",
  "in-progress": "In progress",
  done: "Done",
};

export function Status({ status }: { status: TStatus }) {
  return (
    <div className="flex w-[100px] justify-end">
      <span
        className={`${bgColor[status]} flex-shrink-0 rounded p-1 text-xs font-semibold uppercase text-slate-900`}
      >
        {label[status]}
      </span>
    </div>
  );
}

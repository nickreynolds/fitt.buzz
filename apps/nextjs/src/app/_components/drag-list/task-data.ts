import type { RouterOutputs } from "@acme/api";

export type TStatus = "todo" | "in-progress" | "done";
export interface TTask {
  id: string;
  content: string;
  status: TStatus;
}

const taskDataKey = Symbol("task");

export interface TTaskData {
  [taskDataKey]: true;
  taskId: TTask["id"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

export function getTaskData(task: RouterOutputs["task"]["getTask"]): TTaskData {
  return { [taskDataKey]: true, taskId: task?.id ?? "" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTaskData(data: any): data is TTaskData {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return data[taskDataKey] === true;
}

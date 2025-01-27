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
  [x: string]: any;
}

export function getTaskData(task: RouterOutputs["task"]["getTask"]): TTaskData {
  return { [taskDataKey]: true, taskId: task?.id ?? "" };
}

export function isTaskData(data: any): data is TTaskData {
  return data[taskDataKey] === true;
}

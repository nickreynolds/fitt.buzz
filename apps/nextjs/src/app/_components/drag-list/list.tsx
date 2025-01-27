"use client";

import { useEffect, useState } from "react";
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { flushSync } from "react-dom";

import type { RouterOutputs } from "@acme/api";

// import { TaskCard } from "../tasks";
// import type { TTask } from "./task-data";
import { Task } from "./task";
import { isTaskData } from "./task-data";

export function List({ tasks }: { tasks: RouterOutputs["task"]["getTask"][] }) {
  const [stateTasks, setTasks] =
    useState<RouterOutputs["task"]["getTask"][]>(tasks);

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        console.log("source: ", source);
        const isTask = isTaskData(source.data);
        console.log("isTask: ", isTask);
        return isTask;
      },
      onDrop({ location, source }) {
        console.log("onDrop 1");
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }
        console.log("onDrop 2");

        const sourceData = source.data;
        const targetData = target.data;

        console.log("sourceData: ", sourceData);
        console.log("targetData: ", targetData);

        if (!isTaskData(sourceData) || !isTaskData(targetData)) {
          return;
        }

        console.log("onDrop 3");
        const indexOfSource = stateTasks.findIndex(
          (task) => task?.id === sourceData.taskId,
        );
        const indexOfTarget = stateTasks.findIndex(
          (task) => task?.id === targetData.taskId,
        );

        console.log("onDrop 4");
        if (indexOfTarget < 0 || indexOfSource < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        console.log("onDrop 5");

        const tasks = reorderWithEdge({
          list: stateTasks,
          startIndex: indexOfSource,
          indexOfTarget,
          closestEdgeOfTarget,
          axis: "vertical",
        });

        // Using `flushSync` so we can query the DOM straight after this line
        flushSync(() => {
          setTasks(tasks);
        });
        // Being simple and just querying for the task after the drop.
        // We could use react context to register the element in a lookup,
        // and then we could retrieve that element after the drop and use
        // `triggerPostMoveFlash`. But this gets the job done.
        const element = document.querySelector(
          `[data-task-id="${sourceData.taskId}"]`,
        );
        if (element instanceof HTMLElement) {
          triggerPostMoveFlash(element);
        }

        console.log("tasks: ", tasks);
      },
    });
  }, [stateTasks]);

  return (
    <>
      {stateTasks.map((task, index) => (
        <div
          // @ts-expect-error: `--delay` is a custom property
          style={{ "--delay": `${index * 100}ms` }}
          className={`motion-translate-x-in-[-500%] motion-delay-[var(--delay,0)]`}
        >
          <Task key={task?.id} task={task} />
        </div>
      ))}
    </>
  );
}

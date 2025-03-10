"use client";

import { Layout } from "~/app/_components/Layout";
import BackButton from "~/app/_components/tasks/back-button";
import { CreateSubtaskButton } from "~/app/_components/tasks/create-subtask-button";
import { SubtaskList } from "~/app/_components/tasks/subtask-list";
import { TaskChildrenCompletionData } from "~/app/_components/tasks/task-children-completion-data";
import { TaskDetails } from "~/app/_components/tasks/task-details";
import { TaskDetailsDialog } from "~/app/_components/tasks/task-details-dialog";
import TaskHeader from "~/app/_components/tasks/task-header";
import { api } from "~/trpc/react";

export default function TaskPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: task } = api.task.getTask.useQuery(
    { id },
    { refetchOnMount: "always" },
  );

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <Layout>
      <div className="flex min-h-full w-full flex-col px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex w-full gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <BackButton parentTaskId={task.parentTaskId} />
              <TaskDetailsDialog
                isRecurring={task.recurring}
                description={task.description}
                nextDue={task.nextDue}
                frequencyHours={task.frequencyHours}
                lastCompleted={task.lastCompleted}
                initialTask={task}
                taskId={task.id}
              />
            </div>

            <div className="space-y-6">
              <TaskHeader initialTask={task} taskId={task.id} />

              <TaskChildrenCompletionData initialTask={task} taskId={task.id} />

              <div>
                <h2 className="mb-4 text-xl font-semibold">Subtasks</h2>
                <SubtaskList initialTask={task} parentTaskId={task.id} />
                <CreateSubtaskButton taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Details Sidebar - Hidden on smaller screens */}
          <div className="motion-translate-x-in-[0%] motion-translate-y-in-[-100%] motion-rotate-in-[-35deg] hidden w-80 shrink-0 rounded-lg border border-border bg-card p-6 xl:block">
            <h2 className="mb-4 text-lg font-semibold">Task Details</h2>
            <TaskDetails
              isRecurring={task.recurring}
              description={task.description}
              nextDue={task.nextDue}
              frequencyHours={task.frequencyHours}
              lastCompleted={task.lastCompleted}
              initialTask={task}
              taskId={task.id}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

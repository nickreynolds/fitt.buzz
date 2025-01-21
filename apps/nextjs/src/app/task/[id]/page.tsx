import { notFound } from "next/navigation";
import { format } from "date-fns";

import { canBeCompleted } from "@acme/api";

import { Layout } from "~/app/_components/Layout";
import BackButton from "~/app/_components/tasks/back-button";
import { CompleteTaskButton } from "~/app/_components/tasks/complete-task-button";
import { CreateSubtaskButton } from "~/app/_components/tasks/create-subtask-button";
import { DeleteTaskButton } from "~/app/_components/tasks/delete-task-button";
import { SubtaskList } from "~/app/_components/tasks/subtask-list";
import { TaskDetails } from "~/app/_components/tasks/task-details";
import { TaskDetailsDialog } from "~/app/_components/tasks/task-details-dialog";
import TaskHeader from "~/app/_components/tasks/task-header";
import { api, HydrateClient } from "~/trpc/server";

export default async function TaskPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const task = await api.task.getTask({ id });

  if (!task) {
    notFound();
  }

  return (
    <HydrateClient>
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
                />
              </div>

              <div className="space-y-6">
                <TaskHeader initialTask={task} taskId={task.id} />

                <div>
                  <h2 className="mb-4 text-xl font-semibold">Subtasks</h2>
                  <SubtaskList
                    childTasks={task.childTasks}
                    parentTaskId={task.id}
                  />
                  <CreateSubtaskButton taskId={task.id} />
                </div>

                <div className="flex gap-2">
                  <DeleteTaskButton taskId={task.id} />
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
              />
            </div>
          </div>
        </div>
      </Layout>
    </HydrateClient>
  );
}

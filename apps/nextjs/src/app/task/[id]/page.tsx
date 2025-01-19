import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

import { Button } from "@acme/ui/button";

import { Layout } from "~/app/_components/Layout";
import BackButton from "~/app/_components/tasks/back-button";
import { CreateSubtaskButton } from "~/app/_components/tasks/create-subtask-button";
import { DeleteTaskButton } from "~/app/_components/tasks/delete-task-button";
import { SubtaskList } from "~/app/_components/tasks/subtask-list";
import { api, HydrateClient } from "~/trpc/server";

export default async function TaskPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const task = await api.task.getTask({ id });

  if (!task) {
    notFound();
  }

  const isRecurring = task.recurring;

  return (
    <HydrateClient>
      <Layout>
        <div className="flex min-h-full w-full flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="mx-auto w-full min-w-[33%] md:w-3/4 lg:w-2/3">
              <div className="mb-6">
                <BackButton parentTaskId={task.parentTaskId} />
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">{task.title}</h1>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="mt-1 text-muted-foreground">
                      {task.description ?? "No description provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Due Date</h3>
                    <p className="mt-1 text-muted-foreground">
                      {format(task.nextDue, "PPP 'at' p")}
                    </p>
                  </div>

                  {isRecurring && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium">Frequency</h3>
                        <p className="mt-1 text-muted-foreground">
                          Every{" "}
                          {task.frequencyHours === 24
                            ? "day"
                            : task.frequencyHours === 168
                              ? "week"
                              : task.frequencyHours === 336
                                ? "two weeks"
                                : "month"}
                        </p>
                      </div>

                      {task.lastCompleted && (
                        <div>
                          <h3 className="text-sm font-medium">
                            Last Completed
                          </h3>
                          <p className="mt-1 text-muted-foreground">
                            {format(task.lastCompleted, "PPP 'at' p")}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-semibold">Subtasks</h2>
                  <SubtaskList parentTaskId={task.id} />
                  <CreateSubtaskButton taskId={task.id} />
                </div>

                <div className="flex gap-2">
                  <DeleteTaskButton taskId={task.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </HydrateClient>
  );
}

import { Suspense } from "react";

import { api, HydrateClient } from "~/trpc/server";
// import ListExample from "./_components/drag-list/example";
// import { List } from "./_components/drag-list/list";
import { Layout } from "./_components/Layout";
import {
  CreateTaskForm,
  TaskCardSkeleton,
  TaskList,
} from "./_components/tasks";

export default async function HomePage() {
  await api.task.getAllMyActiveTasks.prefetch();

  return (
    <HydrateClient>
      <Layout>
        <div className="flex min-h-full w-full flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="mx-auto w-full min-w-[33%] md:w-3/4 lg:w-2/3">
              <CreateTaskForm />
              <div className="mt-8">
                <Suspense
                  fallback={
                    <div className="flex w-full flex-col gap-4">
                      <TaskCardSkeleton />
                      <TaskCardSkeleton />
                      <TaskCardSkeleton />
                    </div>
                  }
                >
                  <TaskList />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </HydrateClient>
  );
}

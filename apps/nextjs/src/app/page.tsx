// import { Suspense } from "react";

import { HydrateClient } from "~/trpc/server";
import { Layout } from "./_components/Layout";
import { CreatePostForm } from "./_components/posts";
import {
  CreateTaskForm,
  // TaskCardSkeleton,
  // TaskList,
} from "./_components/tasks";

export default function HomePage() {
  return (
    <HydrateClient>
      <Layout>
        <main className="container py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              Create <span className="text-primary">T3</span> Turbo
            </h1>
            <div className="w-full max-w-2xl overflow-y-scroll">
              <CreateTaskForm />
              <CreatePostForm />
              {/* <Suspense
                fallback={
                  <div className="flex w-full flex-col gap-4">
                    <TaskCardSkeleton />
                    <TaskCardSkeleton />
                    <TaskCardSkeleton />
                  </div>
                }
              >
                <TaskList />
              </Suspense> */}
            </div>
          </div>
        </main>
      </Layout>
    </HydrateClient>
  );
}

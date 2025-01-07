import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { taskRouter } from "./router/task";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  task: taskRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

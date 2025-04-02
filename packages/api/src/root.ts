import { authRouter } from "./router/auth";
import { domainBlockingRouter } from "./router/domain-blocking";
import { taskRouter } from "./router/task";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  task: taskRouter,
  domainBlocking: domainBlockingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

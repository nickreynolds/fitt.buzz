"use client";

import { Check } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { CreateTaskSchema } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

export function CreateTaskForm() {
  const form = useForm({
    schema: CreateTaskSchema,
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const utils = api.useUtils();
  const createTask = api.task.createTask.useMutation({
    onSuccess: async () => {
      form.reset();
      await utils.task.invalidate();
    },
    onError: (err) => {
      console.log("ERROR err: ", err);
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to create a task"
          : "Failed to create task",
      );
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-2xl flex-col gap-4"
        onSubmit={form.handleSubmit((data) => {
          console.log("onSubmit.");
          createTask.mutate(data);
        })}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Task Title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Task Description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button>Create Task</Button>
      </form>
    </Form>
  );
}

export function TaskList() {
  const [tasks] = api.task.getAllMyActiveTasks.useSuspenseQuery();

  if (tasks.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <TaskCardSkeleton pulse={false} />
        <TaskCardSkeleton pulse={false} />
        <TaskCardSkeleton pulse={false} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">No active tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {tasks.map((task) => {
        return <TaskCard key={task.id} task={task} />;
      })}
    </div>
  );
}

export function TaskCard(props: {
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number];
}) {
  const utils = api.useUtils();
  const completeTask = api.task.completeTask.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to complete a task"
          : "Failed to complete task",
      );
    },
  });

  return (
    <div className="flex flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <h2 className="text-2xl font-bold text-primary">{props.task.title}</h2>
        <p className="mt-2 text-sm">{props.task.description}</p>
      </div>
      <div>
        <Button
          variant="ghost"
          className="cursor-pointer text-sm font-bold uppercase text-primary hover:bg-transparent hover:text-white"
          onClick={() => completeTask.mutate({ id: props.task.id })}
        >
          <Check className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export function TaskCardSkeleton(props: { pulse?: boolean }) {
  const { pulse = true } = props;
  return (
    <div className="flex flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <h2
          className={cn(
            "w-1/4 rounded bg-primary text-2xl font-bold",
            pulse && "animate-pulse",
          )}
        >
          &nbsp;
        </h2>
        <p
          className={cn(
            "mt-2 w-1/3 rounded bg-current text-sm",
            pulse && "animate-pulse",
          )}
        >
          &nbsp;
        </p>
      </div>
    </div>
  );
}

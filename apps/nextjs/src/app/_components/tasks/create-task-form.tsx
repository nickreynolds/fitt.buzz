"use client";

import { CreateTaskSchema } from "@acme/db/schema";
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
        <Button>Create Task</Button>
      </form>
    </Form>
  );
}

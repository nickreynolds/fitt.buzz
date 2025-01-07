"use client";

import { useState } from "react";
import { format } from "date-fns";
import { z } from "zod";

import { CreateTaskSchema } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
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
import { CreateTaskDialogForm } from "./create-task-dialog-form";

export function CreateTaskForm() {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [initialTitle, setInitialTitle] = useState("");

  const form = useForm({
    schema: z.object({ title: z.string() }),
    defaultValues: {
      title: "",
    },
  });

  const form2 = useForm({
    schema: CreateTaskSchema,
    defaultValues: {
      title: "",
      description: "",
      nextDue: new Date(),
    },
  });

  const utils = api.useUtils();
  const createTask = api.task.createTask.useMutation({
    onSuccess: async () => {
      form.reset();
      setSelectedDate(new Date());
      setIsDatePickerOpen(false);
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

  const handleSubmit = form.handleSubmit(() => {
    if (!selectedDate) {
      toast.error("Please select a due date");
      return;
    }

    console.log("selectedDate", selectedDate);
    createTask.mutate({
      ...form2.getValues(),
      nextDue: selectedDate,
    });
  });

  return (
    <>
      <Form {...form}>
        <form
          className="flex w-full max-w-2xl flex-col gap-4"
          onSubmit={form.handleSubmit((data) => {
            console.log("form1 data: ", data);
            setIsDatePickerOpen(true);
            setInitialTitle(data.title);
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
          <Button type="submit">Create Task</Button>
        </form>
      </Form>

      <CreateTaskDialogForm
        initialTitle={initialTitle}
        open={isDatePickerOpen}
        onOpenChange={setIsDatePickerOpen}
      />
    </>
  );
}

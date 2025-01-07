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

export function CreateTaskDialogForm({
  initialTitle,
  open,
  onOpenChange,
}: {
  initialTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [inputTitle, setInputTitle] = useState(initialTitle);

  console.log("selectedDate: ", selectedDate);
  console.log("initialTitle: ", initialTitle);

  // const form = useForm({
  //   schema: CreateTaskSchema,
  //   defaultValues: {
  //     title: "",
  //     description: "",
  //     nextDue: new Date(),
  //   },
  // });

  const form = useForm({
    schema: z.object({ title: z.string(), description: z.string() }),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const utils = api.useUtils();
  const createTask = api.task.createTask.useMutation({
    onSuccess: async () => {
      form.reset();
      setSelectedDate(new Date());
      onOpenChange(false);
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

    console.log("submit selectedDate", selectedDate);
    createTask.mutate({
      ...form.getValues(),
      nextDue: selectedDate,
    });
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <Form {...form}>
            <form
              className="flex w-full max-w-2xl flex-col gap-4"
              onSubmit={form.handleSubmit((data) => {
                console.log("form1 data: ", data);
                console.log("form.getValues(): ", form.getValues());
                onOpenChange(true);
              })}
            >
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              {/* <Input
                type="text"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
              /> */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        defaultValue={initialTitle}
                        key={initialTitle}
                        // placeholder={initialTitle}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="py-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </div>
              {/* <FormField
                control={form.control}
                name="nextDue"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        value={selectedDate?.toISOString().slice(0, 10)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                Create Task due{" "}
                {selectedDate ? format(selectedDate, "PPP") : "..."}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

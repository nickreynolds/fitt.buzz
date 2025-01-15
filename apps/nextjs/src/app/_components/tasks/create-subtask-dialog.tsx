import type { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CreateSubtaskSchema, CreateTaskSchema } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import { getCompletionPeriodBegins } from "@acme/utils";

import { api } from "~/trpc/react";

interface CreateSubtaskDialogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentTaskId: string;
}

export function CreateSubtaskDialogForm({
  open,
  onOpenChange,
  parentTaskId,
}: CreateSubtaskDialogFormProps) {
  const [isRecurring, setIsRecurring] = useState(false);

  const zodSchema = CreateSubtaskSchema.omit({ parentTaskId: true });

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      title: "",
      description: "",
      parentTaskId,
    },
  });

  const utils = api.useUtils();
  const createTask = api.task.createSubtask.useMutation({
    onMutate: (data) => {
      console.log("on mutate. data: ", data);
      // const completionPeriodBegins = data.frequencyHours
      //   ? getCompletionPeriodBegins(data.nextDue, data.frequencyHours)
      //   : null;
      // console.log("onMutate data", data);
      // const task = {
      //   id: "1",
      //   title: data.title,
      //   description: data.description ?? "",
      //   nextDue: data.nextDue,
      //   lastCompleted: null,
      //   recurring: data.recurring ?? false,
      //   frequencyHours: data.frequencyHours ?? null,
      //   completionPeriodBegins,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //   creatorId: "1",
      // };

      // if (
      //   !data.recurring ||
      //   (completionPeriodBegins && completionPeriodBegins < new Date())
      // ) {
      //   const tasks = utils.task.getAllMyActiveTasks.getData();
      //   if (tasks) {
      //     utils.task.getAllMyActiveTasks.setData(undefined, [...tasks, task]);
      //   }
      // }
      // form.reset();
      // onOpenChange(false);
    },
    onSuccess: async () => {
      await Promise.all([
        utils.task.getAllMyActiveTasks.invalidate(),
        utils.task.getTask.invalidate({ id: parentTaskId }),
      ]);
    },
  });

  function onSubmit(data: z.infer<typeof zodSchema>) {
    createTask.mutate({
      parentTaskId,
      title: data.title,
      description: data.description,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Create Task</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

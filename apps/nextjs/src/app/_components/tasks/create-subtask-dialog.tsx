import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";

import { CreateSubtaskSchema } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
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
  const zodSchema = CreateSubtaskSchema.omit({ parentTaskId: true, id: true });

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
      const parentTask = utils.task.getTask.getData({ id: parentTaskId });
      if (!parentTask) {
        throw new Error("Parent task not found");
      }

      console.log("on mutate. data: ", data);
      const completionPeriodBegins = parentTask.frequencyHours
        ? getCompletionPeriodBegins(
            parentTask.nextDue,
            parentTask.frequencyHours,
          )
        : null;

      const numSiblingTasks = parentTask.childTasks?.length ?? 0;

      console.log("onMutate data", data);
      const task = {
        id: data.id,
        title: data.title,
        description: data.description,
        nextDue: parentTask.nextDue,
        lastCompleted: null,
        recurring: parentTask.recurring,
        frequencyHours: parentTask.frequencyHours ?? null,
        completionPeriodBegins,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: "1",
        parentTaskId: data.parentTaskId,
        childTasks: [],
        sortIndex: numSiblingTasks,
      };

      utils.task.getTask.setData(
        { id: parentTaskId },
        {
          ...parentTask,
          childTasks: parentTask.childTasks
            ? [...parentTask.childTasks, task]
            : [task],
        },
      );

      form.reset();
      onOpenChange(false);
    },
    onSuccess: async () => {
      await Promise.all([
        utils.task.getAllMyActiveTasks.invalidate(),
        utils.task.getTask.invalidate({ id: parentTaskId }),
      ]);
    },
  });

  function onSubmit(data: z.infer<typeof zodSchema>) {
    const parentTask = utils.task.getTask.getData({ id: parentTaskId });
    if (!parentTask) {
      throw new Error("Parent task not found");
    }

    const numSiblingTasks = parentTask.childTasks?.length ?? 0;
    createTask.mutate({
      id: v4(),
      parentTaskId,
      title: data.title,
      description: data.description,
      sortIndex: numSiblingTasks,
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

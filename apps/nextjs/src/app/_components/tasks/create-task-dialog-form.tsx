import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

import { api } from "~/trpc/react";

const FREQUENCY_OPTIONS = [
  { value: "24", label: "Daily" },
  { value: "168", label: "Weekly" },
  { value: "336", label: "Bi-weekly" },
  { value: "720", label: "Monthly" },
];

interface CreateTaskDialogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialogForm({
  open,
  onOpenChange,
}: CreateTaskDialogFormProps) {
  const [isRecurring, setIsRecurring] = useState(false);

  const zodSchema = z.object({
    title: z.string(),
    description: z.string(),
    nextDueString: z.string(),
    frequencyHours: z.number().optional(),
  });

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      title: "",
      description: "",
      nextDueString: new Date().toISOString(),
      frequencyHours: 24,
    },
  });

  const utils = api.useUtils();
  const createTask = api.task.createTask.useMutation({
    onMutate: (data) => {
      console.log("onMutate data", data);
      if (data.frequencyHours) {
        const recurringTask = {
          id: "1",
          title: data.title,
          description: data.description,
          nextDue: data.nextDue,
          frequencyHours: data.frequencyHours,
          lastCompleted: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: "1",
        };
        const recurringTasks = utils.task.getRecurringTasks.getData();

        if (recurringTasks) {
          utils.task.getRecurringTasks.setData(undefined, [
            ...recurringTasks,
            recurringTask,
          ]);
        }
      } else {
        const task = {
          id: "1",
          title: data.title,
          description: data.description,
          nextDue: data.nextDue,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: "1",
        };
        const tasks = utils.task.getAllMyActiveTasks.getData();
        if (tasks) {
          utils.task.getAllMyActiveTasks.setData(undefined, [...tasks, task]);
        }
      }
      form.reset();
      onOpenChange(false);
    },
    onSuccess: async () => {
      await Promise.all([
        utils.task.getAllMyActiveTasks.invalidate(),
        utils.task.getRecurringTasks.invalidate(),
      ]);
    },
  });

  function onSubmit(data: z.infer<typeof zodSchema>) {
    createTask.mutate({
      title: data.title,
      description: data.description,
      nextDue: new Date(data.nextDueString),
      frequencyHours: isRecurring ? data.frequencyHours : undefined,
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked: boolean) => setIsRecurring(checked)}
              />
              <Label htmlFor="recurring">Recurring Task</Label>
            </div>

            {isRecurring && (
              <FormField
                control={form.control}
                name="frequencyHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={(value: string) =>
                        field.onChange(parseInt(value))
                      }
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="nextDueString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
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

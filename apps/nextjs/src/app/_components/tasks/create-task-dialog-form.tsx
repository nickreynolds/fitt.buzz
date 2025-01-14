import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CreateTaskSchema } from "@acme/db/schema";
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

const FREQUENCY_OPTIONS = [
  { value: "1", label: "Hourly" },
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

  const zodSchema = CreateTaskSchema.extend({ nextDueString: z.string() }).omit(
    { nextDue: true },
  );

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      title: "",
      description: "",
      recurring: false,
      nextDueString: new Date(
        new Date().getTime() + 16 * 60 * 60 * 1000,
      ).toISOString(),
      frequencyHours: 24,
    },
  });

  const utils = api.useUtils();
  const createTask = api.task.createTask.useMutation({
    onMutate: (data) => {
      const completionPeriodBegins = data.frequencyHours
        ? getCompletionPeriodBegins(data.nextDue, data.frequencyHours)
        : null;
      console.log("onMutate data", data);
      const task = {
        id: "1",
        title: data.title,
        description: data.description ?? "",
        nextDue: data.nextDue,
        lastCompleted: null,
        recurring: data.recurring ?? false,
        frequencyHours: data.frequencyHours ?? null,
        completionPeriodBegins,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: "1",
      };

      if (
        !data.recurring ||
        (completionPeriodBegins && completionPeriodBegins < new Date())
      ) {
        const tasks = utils.task.getAllMyActiveTasks.getData();
        if (tasks) {
          utils.task.getAllMyActiveTasks.setData(undefined, [...tasks, task]);
        }
      }
      form.reset();
      onOpenChange(false);
    },
    onSuccess: async () => {
      await Promise.all([utils.task.getAllMyActiveTasks.invalidate()]);
    },
  });

  function onSubmit(data: z.infer<typeof zodSchema>) {
    createTask.mutate({
      title: data.title,
      description: data.description,
      nextDue: new Date(data.nextDueString),
      frequencyHours: isRecurring ? data.frequencyHours : undefined,
      recurring: isRecurring,
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

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem>
                    <Checkbox
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={(checked: boolean) =>
                        setIsRecurring(checked)
                      }
                    />
                    <Label htmlFor="recurring">Recurring Task</Label>
                  </FormItem>
                )}
              />
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

            <Button type="submit">Create Task</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

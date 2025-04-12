import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import {
  getCompletionPeriodBegins,
  TaskBlockingTypes,
  TaskCompletionTypes,
} from "@acme/utils";

import { api } from "~/trpc/react";

const FREQUENCY_OPTIONS = [
  { value: "1", label: "Hourly" },
  { value: "12", label: "Twice daily" },
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
  const router = useRouter();
  const [isRecurring, setIsRecurring] = useState(false);

  const zodSchema = CreateTaskSchema.extend({ nextDueString: z.string() }).omit(
    { nextDue: true, id: true, completionDataType: true },
  );

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      title: "",
      description: "",
      recurring: false,
      nextDueString: new Date(new Date().getTime() + 16 * 60 * 60 * 1000)
        .toISOString()
        .substring(0, 19),
      frequencyHours: 24,
    },
  });

  const utils = api.useUtils();
  const createTask = api.task.createTask.useMutation({
    onMutate: (data) => {
      console.log("on mutate. data: ", data);
      if (!data.id) {
        throw new Error("Task ID is required");
      }
      const completionPeriodBegins = data.frequencyHours
        ? getCompletionPeriodBegins(data.nextDue, data.frequencyHours)
        : null;
      const task = {
        id: data.id || "1",
        title: data.title,
        description: data.description,
        nextDue: data.nextDue,
        lastCompleted: null,
        recurring: data.recurring,
        frequencyHours: data.frequencyHours ?? null,
        completionPeriodBegins,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: "1",
        parentTaskId: null,
        childTasks: [],
        sortIndex: 0,
        completionDataType: TaskCompletionTypes.Boolean,
        isSet: false,
        numSets: 1,
        numCompletedSets: 0,
        blocking: TaskBlockingTypes.NEVER_BLOCK,
      };

      utils.task.getTask.setData({ id: data.id }, task);

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
    onSuccess: async (id) => {
      console.log("got id: ", id);
      await Promise.all([utils.task.getAllMyActiveTasks.invalidate()]);
      await utils.task.getTask.invalidate({ id });
      router.push(`/task/${id}`);
    },
  });

  function onSubmit(data: z.infer<typeof zodSchema>) {
    createTask.mutate({
      id: v4(),
      title: data.title,
      description: data.description,
      nextDue: new Date(data.nextDueString),
      frequencyHours: isRecurring ? data.frequencyHours : undefined,
      recurring: isRecurring,
      completionDataType: TaskCompletionTypes.Boolean,
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
                render={() => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={(checked: boolean) =>
                        setIsRecurring(checked)
                      }
                    />
                    <FormLabel>Recurring</FormLabel>
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

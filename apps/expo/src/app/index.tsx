import { useState } from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { formatDistanceToNowStrict, isPast } from "date-fns";
import { Check } from "lucide-react-native";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { useSignIn, useSignOut, useUser } from "~/utils/auth";

type RegularTask = RouterOutputs["task"]["getAllMyActiveTasks"][number];
type RecurringTask = RouterOutputs["task"]["getMyActiveRecurringTasks"][number];
type TaskWithFrequency = RegularTask & { frequencyHours: number };
type RecurringWithCompleted = RecurringTask & { completed: boolean };
type CombinedTask = TaskWithFrequency | RecurringWithCompleted;

interface TaskCardProps {
  task: CombinedTask;
  onComplete: () => void;
  isRecurring?: boolean;
}

function TaskCard({ task, onComplete, isRecurring }: TaskCardProps) {
  return (
    <View className="flex flex-row rounded-lg bg-muted p-4">
      <View className="flex-grow">
        <View className="flex flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-primary">
            {task.title}
            {isRecurring && <Text className="text-muted-foreground"> ↻</Text>}
          </Text>
        </View>
        <Text className="mt-2 text-foreground">
          Due in {formatDistanceToNowStrict(task.nextDue, { unit: "hour" })}
        </Text>
      </View>
      <Pressable onPress={onComplete}>
        <Check className="h-6 w-6" stroke="#5B65E9" strokeWidth={2} />
      </Pressable>
    </View>
  );
}

function CreateTask() {
  const utils = api.useUtils();

  const [title, setTitle] = useState("");

  const { mutate, error } = api.task.createTask.useMutation({
    async onSuccess() {
      setTitle("");
      await utils.task.getAllMyActiveTasks.invalidate();
    },
  });

  return (
    <View className="mt-4 flex gap-2">
      <TextInput
        className="items-center rounded-md border border-input bg-background px-3 text-lg leading-[1.25] text-foreground"
        value={title}
        onChangeText={setTitle}
        placeholder="Task Title"
      />
      {error?.data?.zodError?.fieldErrors.title && (
        <Text className="mb-2 text-destructive">
          {error.data.zodError.fieldErrors.title}
        </Text>
      )}
      <Pressable
        className="flex items-center rounded bg-primary p-2"
        onPress={() => {
          mutate({
            title,
            description: "",
            nextDue: new Date(), // For now, just set to current date
          });
        }}
      >
        <Text className="text-foreground">Create Task</Text>
      </Pressable>
      {error?.data?.code === "UNAUTHORIZED" && (
        <Text className="mt-2 text-destructive">
          You need to be logged in to create a task
        </Text>
      )}
    </View>
  );
}

function MobileAuth() {
  const user = useUser();
  const signIn = useSignIn();

  if (user) {
    return null;
  }
  return (
    <>
      <Text className="pb-2 text-center text-xl font-semibold text-white">
        {"Not logged in"}
      </Text>
      <Button
        onPress={() => signIn()}
        title={"Sign In With Google"}
        color={"#5B65E9"}
      />
    </>
  );
}

export default function Index() {
  const utils = api.useUtils();

  const { data: regularTasks } = api.task.getAllMyActiveTasks.useQuery();
  const { data: recurringTasks } =
    api.task.getMyActiveRecurringTasks.useQuery();

  const completeTaskMutation = api.task.completeTask.useMutation({
    onSettled: () => utils.task.getAllMyActiveTasks.invalidate(),
  });

  const regularTasksExtra = regularTasks?.map((t) => ({
    ...t,
    frequencyHours: 0,
  }));

  const recurringTasksExtra = recurringTasks?.map((t) => ({
    ...t,
    completed: false,
  }));

  const allTasks = [
    ...(regularTasksExtra ?? []),
    ...(recurringTasksExtra ?? []),
  ].sort(
    (a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime(),
  );

  return (
    <SafeAreaView className="bg-background">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Tasks", headerShown: false }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="top-0 pb-2 text-center text-5xl font-bold text-foreground">
          fitt.<Text className="text-primary">buzz</Text>
        </Text>

        <MobileAuth />

        <View className="py-2">
          <Text className="font-semibold italic text-primary">
            Tap the check to complete a task
          </Text>
        </View>

        <FlashList
          data={allTasks}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={(p) => (
            <TaskCard
              task={p.item}
              isRecurring={p.item.frequencyHours !== 0}
              onComplete={() => completeTaskMutation.mutate({ id: p.item.id })}
            />
          )}
        />

        <CreateTask />
      </View>
    </SafeAreaView>
  );
}

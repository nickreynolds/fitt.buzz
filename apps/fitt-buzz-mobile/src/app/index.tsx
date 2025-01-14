import { useState } from "react";
import { Button, Pressable, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { formatDistanceToNowStrict, isPast } from "date-fns";
import { Check } from "lucide-react-native";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { useSignIn, useSignOut, useUser } from "~/utils/auth";
import { CreateTaskDialog } from "./_components/create-task-dialog";

type RegularTask = RouterOutputs["task"]["getAllMyActiveTasks"][number];

interface TaskCardProps {
  task: RegularTask;
  onComplete: () => void;
  isRecurring?: boolean;
}

function TaskCard({ task, onComplete, isRecurring }: TaskCardProps) {
  return (
    <View className="flex flex-row rounded-lg bg-muted p-4" key={task.title}>
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

function MobileAuth() {
  const user = useUser();
  const signIn = useSignIn();
  const signOut = useSignOut();

  if (user) {
    return (
      <>
        <Button
          onPress={() => signOut()}
          title={"Sign Out"}
          color={"#5B65E9"}
        />
      </>
    );
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const utils = api.useUtils();

  const { data: tasks } = api.task.getAllMyActiveTasks.useQuery();

  const completeTaskMutation = api.task.completeTask.useMutation({
    onMutate: (data) => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      if (tasks) {
        const newTasks = tasks.filter((t) => t.id !== data.id);
        console.log("newTasks", JSON.stringify(newTasks));
        utils.task.getAllMyActiveTasks.setData(undefined, newTasks);
      }
    },
    onSettled: async () => await utils.task.getAllMyActiveTasks.invalidate(),
  });

  console.log("my tasks", JSON.stringify(tasks));

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

        <Animated.FlatList
          data={tasks}
          // estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={(p) => (
            <TaskCard
              task={p.item}
              isRecurring={p.item.recurring}
              onComplete={() => completeTaskMutation.mutate({ id: p.item.id })}
            />
          )}
          contentContainerStyle={{ minHeight: "100%" }}
          itemLayoutAnimation={LinearTransition}
        />

        {/* <Animated.ScrollView>
          {tasks?.map((task) => (
            <TaskCard
              task={task}
              isRecurring={task.recurring}
              onComplete={() => completeTaskMutation.mutate({ id: task.id })}
              key={task.title}
            />
          ))}
        </Animated.ScrollView> */}

        <Pressable
          className="mt-4 items-center rounded-lg bg-primary p-4"
          onPress={() => setIsCreateDialogOpen(true)}
        >
          <Text className="text-lg font-semibold text-primary-foreground">
            Create Task
          </Text>
        </Pressable>

        <CreateTaskDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
}

import type { PropsWithChildren } from "react";
import { Button, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { api } from "~/utils/api";
import { useSignIn, useSignOut, useUser } from "~/utils/auth";
import TaskCard from "../_components/task-card";

function MobileAuth({ children }: PropsWithChildren<object>) {
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
        {children}
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

export function MyTasks() {
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

  return (
    <View className="relative h-full grow">
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
    </View>
  );
}

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Tasks", headerShown: false }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="top-0 pb-2 text-center text-5xl font-bold text-foreground">
          fitt.<Text className="text-primary">buzz</Text>
        </Text>
        <MobileAuth>
          <MyTasks />
        </MobileAuth>
      </View>
    </SafeAreaView>
  );
}

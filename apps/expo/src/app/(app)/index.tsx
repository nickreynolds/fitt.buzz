import type { PropsWithChildren } from "react";
import { Button, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { api } from "~/utils/api";
import { useSignIn, useUser } from "~/utils/auth";
import TaskCard from "../../_components/task-card";

function MobileAuth({ children }: PropsWithChildren<object>) {
  const user = useUser();
  const signIn = useSignIn();

  if (user) {
    return <>{children}</>;
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
  const { data: tasks } = api.task.getAllMyActiveTasks.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <View className="relative h-full grow">
      <Animated.FlatList
        data={tasks}
        // estimatedItemSize={20}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={(p) => (
          <View className="animate-slideIn">
            <TaskCard task={p.item} />
          </View>
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

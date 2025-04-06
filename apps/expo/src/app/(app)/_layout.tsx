import type { PusherEvent } from "@pusher/pusher-websocket-react-native";
import React from "react";
import { Text } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Pusher } from "@pusher/pusher-websocket-react-native";
import { Home, Plus, SettingsIcon, Shield } from "lucide-react-native";
import { useColorScheme } from "nativewind";

import { api } from "~/utils/api";
import { useUser } from "~/utils/auth";

export default function AppLayout() {
  const pusher = Pusher.getInstance();
  pusher.init({
    apiKey: "b257f4198d06902e6bca",
    cluster: "us2",
    // onEvent: () => {
    //   console.log("EVENT RECEIVED.");
    // },
    // onSubscriptionSucceeded: (channelName, data) => {
    //   console.log("1. onSubscriptionSucceeded", channelName, data);
    // },
  });
  const { data: session, isLoading } = api.auth.getSession.useQuery();
  const { colorScheme } = useColorScheme();
  const user = useUser();
  const utils = api.useUtils();

  const userId = user?.id;
  React.useEffect(() => {
    if (userId) {
      const connect = async () => {
        await pusher.connect();
        await pusher.subscribe({
          channelName: `user-${userId}`,
          onEvent: (event: PusherEvent) => {
            console.log("event", event);
            const data = JSON.parse(event.data as string) as {
              tasks: string[];
            };
            const tasks = data.tasks;
            if (tasks.length > 0) {
              for (const taskId of tasks) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                utils.task.getTask.invalidate({ id: taskId });
              }
            }
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            utils.task.getAllMyActiveTasks.invalidate();
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            utils.task.getAllMyTasks.invalidate();
          },
          // onSubscriptionSucceeded: (data) => {
          //   console.log("2. onSubscriptionSucceeded: ", data);
          // },
          onSubscriptionError(channelName, message, e) {
            console.log("onSubscriptionError: ", channelName, message, e);
          },
        });
      };

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(connect, 1000); // hack
    }
  }, [
    userId,
    utils.task.getTask,
    utils.task.getAllMyActiveTasks,
    utils.task.getAllMyTasks,
    pusher,
  ]);
  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#09090B" : "#FFFFFF",
          borderTopColor: colorScheme === "dark" ? "#27272A" : "#E4E4E7",
        },
        tabBarActiveTintColor: "#f472b6",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#A1A1AA" : "#71717A",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-task/index"
        options={{
          title: "Create Task",
          tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fun-blocking/index"
        options={{
          title: "Fun Blocking",
          tabBarIcon: ({ color, size }) => <Shield size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="login-redirect/index" options={{ href: null }} />
      <Tabs.Screen name="task/[id]" options={{ href: null }} />
    </Tabs>
  );
  // return (
  //   <AppBlockerView
  //     name="fun-blocking"
  //     style={{ flex: 1, backgroundColor: "red" }}
  //   />
  // );
}

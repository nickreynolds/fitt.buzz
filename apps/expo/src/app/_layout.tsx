import "@bacons/text-decoder/install";

import { Platform, UIManager } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";

import { AppBlockingMonitor } from "~/_components/app-blocking-monitor";
import { api, TRPCProvider } from "~/utils/api";

import "../styles.css";

import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { useColorScheme } from "nativewind";

import { block, unblock } from "../../modules/app-blocker";

const BACKGROUND_TASK_IDENTIFIER = "background-task";

// Register and create the task so that it is available also when the background task screen
// (a React component defined later in this example) is not visible.
// Note: This needs to be called in the global scope, not in a React component.
TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  console.log("task.");
  try {
    const now = Date.now();
    console.log(
      `Got background task call at date: ${new Date(now).toISOString()}`,
    );

    const shouldBlock = await api.useUtils().task.shouldBlockFun.fetch();
    console.log("shouldBlock: ", shouldBlock);
    if (shouldBlock) {
      block();
    } else {
      unblock();
    }
  } catch (error) {
    console.error("Failed to execute the background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
  return BackgroundTask.BackgroundTaskResult.Success;
});

// 2. Register the task at some point in your app by providing the same name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundTaskAsync() {
  console.log("registerBackgroundTaskAsync");
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_TASK_IDENTIFIER,
  );
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER, {
      minimumInterval: 15, // Try to repeat every 15 minutes while backgrounded
    });
  }
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background task calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
// async function unregisterBackgroundTaskAsync() {
//   return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER);
// }

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    registerBackgroundTaskAsync();
  }, []);

  // console.log("hello: ", hello());
  // console.log("hello: ", PI);
  const { colorScheme } = useColorScheme();
  return (
    <TRPCProvider>
      <StatusBar
        style="light"
        backgroundColor={colorScheme === "dark" ? "#000000" : "#FFFFFF"}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
        <PortalHost />
        <AppBlockingMonitor />
      </GestureHandlerRootView>
    </TRPCProvider>
  );
}

import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";

import { SubtaskList } from "~/_components/subtask-list";
import { TaskDetailsDialog } from "~/_components/task-details-dialog";
import { TaskHeader } from "~/_components/task-header";
import { api } from "~/utils/api";

export default function Index() {
  const { id } = useLocalSearchParams();

  const { data: task } = api.task.getTask.useQuery({ id: id as string });

  if (!task) {
    return null;
  }

  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Task", headerShown: false }} />
      <View className="h-full w-full bg-background p-4">
        <TaskHeader initialTask={task} taskId={id as string} />
        <TaskDetailsDialog initialTask={task} taskId={id as string} />
        <SubtaskList initialTask={task} parentTaskId={id as string} />
      </View>
    </SafeAreaView>
  );
}

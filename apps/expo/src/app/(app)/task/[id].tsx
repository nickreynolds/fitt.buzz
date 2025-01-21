import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";

import { SubtaskList } from "~/_components/subtask-list";
import { TaskHeader } from "~/_components/task-header";
import { api } from "~/utils/api";

export default function Index() {
  const utils = api.useUtils();
  const { id } = useLocalSearchParams();

  const { data: task } = api.task.getTask.useQuery({ id: id as string });

  const completeTaskMutation = api.task.completeTask.useMutation({
    onSettled: async () => await utils.task.getAllMyActiveTasks.invalidate(),
  });

  if (!task) {
    return null;
  }

  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Task", headerShown: false }} />
      <View className="h-full w-full bg-background p-4">
        <TaskHeader
          initialTask={task}
          taskId={id as string}
          onComplete={() => completeTaskMutation.mutate({ id: id as string })}
        />
        <SubtaskList tasks={task.childTasks} />
      </View>
    </SafeAreaView>
  );
}

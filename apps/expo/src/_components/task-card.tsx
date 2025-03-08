import { View } from "react-native";

import type { RouterOutputs } from "~/utils/api";
import { TaskHeader } from "./task-header";

type RegularTask = RouterOutputs["task"]["getTask"];

interface TaskCardProps {
  task: RegularTask;
}

export default function TaskCard({ task }: TaskCardProps) {
  if (!task) {
    return null;
  }

  return (
    <View className="flex flex-row rounded-lg p-4">
      <TaskHeader initialTask={task} taskId={task.id} />
    </View>
  );
}

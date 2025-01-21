import { Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { formatDistanceToNowStrict } from "date-fns";
import { Check } from "lucide-react-native";

import type { RouterOutputs } from "~/utils/api";
import { TaskHeader } from "./task-header";

type RegularTask = RouterOutputs["task"]["getTask"];

interface TaskCardProps {
  task: RegularTask;
  onComplete: () => void;
}

export default function TaskCard({ task, onComplete }: TaskCardProps) {
  if (!task) {
    return null;
  }

  console.log("going to add link to task id: ", task.id);
  return (
    <View className="flex flex-row rounded-lg bg-muted p-4" key={task.title}>
      <TaskHeader initialTask={task} taskId={task.id} onComplete={onComplete} />
    </View>
  );
}

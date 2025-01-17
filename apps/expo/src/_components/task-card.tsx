import { Pressable, Text, View } from "react-native";
import { formatDistanceToNowStrict } from "date-fns";
import { Check } from "lucide-react-native";

import type { RouterOutputs } from "~/utils/api";

type RegularTask = RouterOutputs["task"]["getAllMyActiveTasks"][number];

interface TaskCardProps {
  task: RegularTask;
  onComplete: () => void;
  isRecurring?: boolean;
}

export default function TaskCard({
  task,
  onComplete,
  isRecurring,
}: TaskCardProps) {
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

import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Dumbbell } from "lucide-react-native";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/utils/api";

interface CompleteWeightRepsTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteWeightRepsTaskButton({
  taskId,
  parentTaskId,
}: CompleteWeightRepsTaskButtonProps) {
  const [weight, setWeight] = React.useState("0");
  const [reps, setReps] = React.useState("0");
  const [hasSetValues, setHasSetValues] = React.useState(false);
  const { handleOptimisticUpdate, handleSettled } = useTaskCompletion({
    taskId,
    parentTaskId,
  });

  const utils = api.useUtils();

  const parentTask = utils.task.getTask.getData({ id: parentTaskId ?? "" });
  React.useEffect(() => {
    if (parentTask && !hasSetValues) {
      const numCompletedSets = parentTask.numCompletedSets;
      const prevCompletions =
        parentTask.prevChildTaskCompletionDataMap?.get(taskId);
      if (prevCompletions && prevCompletions.length > 0) {
        const prevCompletion1 =
          prevCompletions[
            Math.min(numCompletedSets, prevCompletions.length - 1)
          ];
        if (prevCompletion1) {
          const prevCompletion = JSON.parse(prevCompletion1) as {
            weight: number;
            reps: number;
          };
          setWeight(prevCompletion.weight.toString());
          setReps(prevCompletion.reps.toString());
          setHasSetValues(true);
        }
      }
    }
  }, [parentTask, taskId, hasSetValues]);

  const completeTask = api.task.completeWeightRepsTask.useMutation({
    onMutate: async () => {
      setHasSetValues(false);
      await handleOptimisticUpdate({
        result: true,
        weight: parseFloat(weight),
        reps: parseInt(reps),
      });
    },
    onSettled: handleSettled,
  });

  return (
    <View className="flex-row items-center gap-2">
      <View className="w-20">
        <TextInput
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-primary"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight"
        />
      </View>

      <Text className="text-foreground">lbs</Text>

      <View className="w-16">
        <TextInput
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-primary"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
          placeholder="Reps"
        />
      </View>

      <Text className="text-foreground">reps</Text>

      <TouchableOpacity
        className="rounded-lg bg-primary p-2 text-foreground"
        onPress={() => {
          const weightNum = parseFloat(weight);

          const repsNum = parseInt(reps, 10);

          if (!isNaN(weightNum) && !isNaN(repsNum)) {
            completeTask.mutate({
              id: taskId,

              weight: weightNum,

              weightUnit: "lbs",

              reps: repsNum,
            });
          }
        }}
      >
        <Dumbbell size={20} color="currentColor" />
      </TouchableOpacity>
    </View>
  );
}

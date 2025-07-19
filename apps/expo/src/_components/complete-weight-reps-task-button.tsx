import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Dumbbell } from "lucide-react-native";

import { useTaskCompletion } from "~/hooks/useTaskCompletion";
import { api } from "~/utils/api";
import Icon from "./icon";

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
        weightUnit: "lbs",
        weight: parseFloat(weight),
        reps: parseInt(reps),
      });
    },
    onSettled: handleSettled,
  });

  const handleWeightIncrement = () => {
    const currentWeight = parseFloat(weight) || 0;
    setWeight((currentWeight + 2.5).toString());
  };

  const handleWeightDecrement = () => {
    const currentWeight = parseFloat(weight) || 0;
    const newWeight = Math.max(0, currentWeight - 2.5);
    setWeight(newWeight.toString());
  };

  const handleRepsIncrement = () => {
    const currentReps = parseInt(reps) || 0;
    setReps((currentReps + 1).toString());
  };

  const handleRepsDecrement = () => {
    const currentReps = parseInt(reps) || 0;
    const newReps = Math.max(0, currentReps - 1);
    setReps(newReps.toString());
  };

  return (
    <View className="flex-row items-center gap-3">
      {/* Weight Input with Increment/Decrement */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleWeightDecrement}
          className="h-10 w-8 items-center justify-center rounded-l-md border border-input bg-background"
        >
          <Icon name="Minus" className="h-4 w-4 text-foreground" />
        </TouchableOpacity>

        <TextInput
          className="h-10 w-16 border-t border-b border-input bg-background px-2 text-center text-sm text-primary"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          placeholder="0"
        />

        <TouchableOpacity
          onPress={handleWeightIncrement}
          className="h-10 w-8 items-center justify-center rounded-r-md border border-input bg-background"
        >
          <Icon name="Plus" className="h-4 w-4 text-foreground" />
        </TouchableOpacity>
      </View>

      <Text className="text-foreground">lbs</Text>

      {/* Reps Input with Increment/Decrement */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleRepsDecrement}
          className="h-10 w-8 items-center justify-center rounded-l-md border border-input bg-background"
        >
          <Icon name="Minus" className="h-4 w-4 text-foreground" />
        </TouchableOpacity>

        <TextInput
          className="h-10 w-12 border-t border-b border-input bg-background px-2 text-center text-sm text-primary"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
          placeholder="0"
        />

        <TouchableOpacity
          onPress={handleRepsIncrement}
          className="h-10 w-8 items-center justify-center rounded-r-md border border-input bg-background"
        >
          <Icon name="Plus" className="h-4 w-4 text-foreground" />
        </TouchableOpacity>
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

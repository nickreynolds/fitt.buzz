import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
// import { Picker } from "@react-native-picker/picker";
import { Dumbbell } from "lucide-react-native";

// import type { RouterOutputs } from "@acme/api";
// import { Button } from "@acme/ui/button";

import { api } from "~/utils/api";

interface CompleteWeightRepsTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteWeightRepsTaskButton({
  taskId,
  parentTaskId,
}: CompleteWeightRepsTaskButtonProps) {
  const [weight, setWeight] = useState("0");
  const [reps, setReps] = useState("0");
  // const [weightUnit, setWeightUnit] = useState("lbs");
  const utils = api.useUtils();

  const completeTask = api.task.completeWeightRepsTask.useMutation({
    onMutate: () => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      if (!parentTaskId) {
        const updatedTasks = tasks?.filter((t) => t.id !== taskId);
        utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
      }
    },
    onSettled: async () => {
      await Promise.all([
        utils.task.getAllMyActiveTasks.invalidate(),
        utils.task.getTask.invalidate({ id: taskId }),
        parentTaskId
          ? utils.task.getTask.invalidate({ id: parentTaskId })
          : Promise.resolve(),
      ]);
    },
  });

  return (
    <View className="flex-row items-center gap-2">
      <View className="w-20">
        <TextInput
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight"
        />
      </View>
      {/* 
      <View className="w-20">
        <Picker
          selectedValue={weightUnit}
          onValueChange={setWeightUnit}
          className="h-10 rounded-md border border-input bg-background"
        >
          <Picker.Item label="lbs" value="lbs" />
          <Picker.Item label="kg" value="kg" />
        </Picker>
      </View> */}

      <View className="w-16">
        <TextInput
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
          placeholder="Reps"
        />
      </View>

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

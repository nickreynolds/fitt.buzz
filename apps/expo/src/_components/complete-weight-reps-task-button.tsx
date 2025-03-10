import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
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

  const parentTask = utils.task.getTask.getData({ id: parentTaskId ?? "" });
  React.useEffect(() => {
    console.log("GO!. parentTask: ", parentTask);
    if (parentTask) {
      const numCompletedSets = parentTask.numCompletedSets;
      const prevCompletions =
        parentTask.prevChildTaskCompletionDataMap?.get(taskId);
      console.log("prevCompletions: ", prevCompletions);
      if (prevCompletions && prevCompletions.length > 0) {
        const prevCompletion1 =
          prevCompletions[
            Math.min(numCompletedSets, prevCompletions.length - 1)
          ];
        console.log("prevCompletion1: ", prevCompletion1);
        if (prevCompletion1) {
          const prevCompletion = JSON.parse(prevCompletion1) as {
            weight: number;
            reps: number;
          };
          console.log("YES GO. prevCompletion: ", prevCompletion);
          setWeight(prevCompletion.weight.toString());
          setReps(prevCompletion.reps.toString());
        }
      }
    }
  }, [parentTask, taskId]);

  const completeTask = api.task.completeWeightRepsTask.useMutation({
    onMutate: async (data) => {
      const task = utils.task.getTask.getData({ id: taskId });
      const existingTaskCompletionData = task?.taskCompletionData ?? [];

      const promises = [];
      if (parentTaskId) {
        promises.push(utils.task.getTask.cancel({ id: parentTaskId }));
      }
      promises.push(utils.task.getTask.cancel({ id: taskId }));
      promises.push(utils.task.getAllMyActiveTasks.cancel());

      await Promise.all(promises);

      if (parentTaskId) {
        const parentTask = utils.task.getTask.getData({
          id: parentTaskId,
        });
        if (parentTask) {
          const updatedChildTasks = parentTask.childTasks?.map((t) => {
            if (t.id === taskId) {
              return { ...t, lastCompleted: new Date() };
            }
            return t;
          });

          const existingChildTaskCompletionDataMap =
            parentTask.childTaskCompletionDataMap;
          const existingChildTaskCompletionData =
            existingChildTaskCompletionDataMap?.get(taskId) ?? [];

          existingChildTaskCompletionDataMap?.set(taskId, [
            ...existingChildTaskCompletionData,
            JSON.stringify({
              weight: data.weight,
              reps: data.reps,
              weightUnit: "lbs",
            }),
          ]);

          utils.task.getTask.setData(
            { id: parentTaskId },
            {
              ...parentTask,
              childTasks: updatedChildTasks,
              childTaskCompletionDataMap: existingChildTaskCompletionDataMap,
              numCompletedSets: parentTask.isSet
                ? parentTask.numCompletedSets + 1
                : parentTask.numCompletedSets,
            },
          );
        }
      }

      if (task) {
        utils.task.getTask.setData(
          { id: taskId },
          {
            ...task,
            lastCompleted: new Date(),
            taskCompletionData: [
              JSON.stringify([
                ...existingTaskCompletionData,
                { weight: 10, reps: 10, weightUnit: "lbs" },
              ]),
            ],
          },
        );
      }

      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== taskId);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
      const promises = [];
      if (parentTaskId) {
        promises.push(utils.task.getTask.cancel({ id: parentTaskId }));
      }
      promises.push(utils.task.getTask.cancel({ id: taskId }));
      promises.push(utils.task.getAllMyActiveTasks.cancel());

      const promises2 = [];
      if (parentTaskId) {
        promises2.push(utils.task.getTask.invalidate({ id: parentTaskId }));
      }
      promises2.push(utils.task.getTask.invalidate({ id: taskId }));
      promises2.push(utils.task.getAllMyActiveTasks.invalidate());

      await Promise.all(promises2);
    },
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

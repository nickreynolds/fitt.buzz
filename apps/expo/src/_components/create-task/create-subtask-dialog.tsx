import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import uuid from "react-native-uuid";

import { TaskBlockingTypes, TaskCompletionTypes } from "@acme/utils";

import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { api } from "~/utils/api";
import Icon from "../icon";

interface CreateSubtaskDialogProps {
  parentTaskId: string;
  parentTaskTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSubtaskDialog({
  parentTaskId,
  parentTaskTitle,
  // isOpen,
  onClose,
}: CreateSubtaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [isRecurring, setIsRecurring] = useState(false);
  // const [frequency, setFrequency] = useState("24");
  // const [dueDate, setDueDate] = useState(new Date());
  // const [dueTime, setDueTime] = useState(new Date());
  // const [show, setShow] = useState(false);
  // const [showTime, setShowTime] = useState(false);
  const [completionType, setCompletionType] = useState<TaskCompletionTypes>(
    TaskCompletionTypes.Boolean,
  );
  const utils = api.useUtils();

  const createTask = api.task.createSubtask.useMutation({
    onMutate: (data) => {
      const parentTask = utils.task.getTask.getData({ id: parentTaskId });
      if (!parentTask) {
        throw new Error("Parent task not found");
      }
      if (!data.id) {
        throw new Error("Task ID is required");
      }

      const numSiblingTasks = parentTask.childTasks?.length ?? 0;
      const task = {
        id: data.id,
        title: data.title,
        description: data.description,
        nextDue: parentTask.nextDue,
        lastCompleted: null,
        recurring: parentTask.recurring,
        frequencyHours: parentTask.frequencyHours ?? null,
        completionPeriodBegins: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: "1",
        parentTaskId: parentTaskId,
        childTasks: [],
        sortIndex: numSiblingTasks,
        // horrible
        completionDataType:
          data.completionDataType === TaskCompletionTypes.Boolean
            ? TaskCompletionTypes.Boolean
            : data.completionDataType === TaskCompletionTypes.WeightReps
              ? TaskCompletionTypes.WeightReps
              : TaskCompletionTypes.Time,
        isSet: false,
        numSets: 1,
        numCompletedSets: 0,
        blocking: TaskBlockingTypes.NEVER_BLOCK,
      };

      utils.task.getTask.setData(
        { id: parentTaskId },
        {
          ...parentTask,
          childTasks: parentTask.childTasks
            ? [...parentTask.childTasks, task]
            : [task],
        },
      );

      setTitle("");
      setDescription("");
      // setIsRecurring(false);
      // setFrequency("24");
      // setDueDate(new Date());
      // setDueTime(new Date());
      setCompletionType(TaskCompletionTypes.Boolean);
      onClose();
    },
    onSettled: async () => {
      await utils.task.getAllMyActiveTasks.invalidate();
    },
  });

  const handleCreate = () => {
    const parentTask = utils.task.getTask.getData({ id: parentTaskId });
    if (!parentTask) {
      throw new Error("Parent task not found");
    }

    const numSiblingTasks = parentTask.childTasks?.length ?? 0;
    createTask.mutate({
      id: uuid.v4(),
      parentTaskId,
      title: title,
      description: description,
      sortIndex: numSiblingTasks,
      completionDataType:
        completionType === TaskCompletionTypes.Boolean
          ? TaskCompletionTypes.Boolean
          : completionType === TaskCompletionTypes.WeightReps
            ? TaskCompletionTypes.WeightReps
            : TaskCompletionTypes.Time,
      isSet: false,
      recurring: parentTask.recurring,
      nextDue: parentTask.nextDue,
    });
  };

  return (
    <View>
      <View className="w-full space-y-4 rounded-lg bg-card p-4">
        <Text className="text-xl font-semibold text-foreground">
          Create Subtask for{" "}
          <Text className="text-primary">{parentTaskTitle}</Text>
        </Text>

        <TextInput
          className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          placeholder="Task name"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#666"
        />

        <View className="space-y-2">
          <Text className="font-medium text-foreground">Completion Type</Text>
          <ToggleGroup
            type="single"
            value={completionType}
            onValueChange={(value) => {
              if (value) {
                setCompletionType(value as TaskCompletionTypes);
              }
            }}
            className="w-full"
          >
            <ToggleGroupItem
              value={TaskCompletionTypes.Boolean}
              className="flex-1"
            >
              <View className="flex-row items-center justify-center space-x-2">
                <Icon name="Check" className="h-4 w-4 text-foreground" />
                <Text className="text-foreground">Manual</Text>
              </View>
            </ToggleGroupItem>

            <ToggleGroupItem
              value={TaskCompletionTypes.WeightReps}
              className="flex-1"
            >
              <View className="flex-row items-center justify-center space-x-2">
                <Icon name="Dumbbell" className="h-4 w-4 text-foreground" />
                <Text className="text-foreground">Weight & Reps</Text>
              </View>
            </ToggleGroupItem>

            <ToggleGroupItem
              value={TaskCompletionTypes.Time}
              className="flex-1"
            >
              <View className="flex-row items-center justify-center space-x-2">
                <Icon name="Clock" className="h-4 w-4 text-foreground" />
                <Text className="text-foreground">Time</Text>
              </View>
            </ToggleGroupItem>
          </ToggleGroup>
        </View>

        <View className="flex-row justify-end space-x-2">
          <Pressable
            onPress={handleCreate}
            className="rounded-md bg-primary px-4 py-2"
          >
            <Text className="text-foreground">Create</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

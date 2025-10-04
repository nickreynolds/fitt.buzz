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
  const [createAsSet, setCreateAsSet] = useState(false);
  const utils = api.useUtils();

  const createTask = api.task.createSubtask.useMutation({
    onMutate: () => {
      setTitle("");
      setDescription("");
      setCompletionType(TaskCompletionTypes.Boolean);
      setCreateAsSet(false);
      onClose();
    },
    onSettled: async () => {
      await utils.task.getAllMyActiveTasks.invalidate();
      await utils.task.getTask.invalidate({ id: parentTaskId });
    },
  });

  const createTaskSet = api.task.createSubtaskSet.useMutation({
    onMutate: (data) => {
      const parentTask = utils.task.getTask.getData({ id: parentTaskId });
      if (!parentTask) {
        throw new Error("Parent task not found");
      }

      const numSiblingTasks = parentTask.childTasks?.length ?? 0;

      // Create the set parent task
      const setTask = {
        id: data.setTaskId,
        title: `${data.title} (set)`,
        description: data.description,
        nextDue: parentTask.nextDue,
        lastCompleted: null,
        recurring: parentTask.recurring,
        frequencyMinutes: parentTask.frequencyMinutes ?? null,
        completionPeriodBegins: parentTask.completionPeriodBegins,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: "1",
        parentTaskId: parentTask.id,
        childTasks: [],
        sortIndex: numSiblingTasks,
        completionDataType: TaskCompletionTypes.Boolean,
        isSet: true,
        numSets: 1,
        numCompletedSets: 0,
        blocking: TaskBlockingTypes.NEVER_BLOCK,
      };

      // Create the child exercise task
      const childTask = {
        id: data.childTaskId,
        title: data.title,
        description: data.description,
        nextDue: parentTask.nextDue,
        lastCompleted: null,
        recurring: parentTask.recurring,
        frequencyMinutes: parentTask.frequencyMinutes ?? null,
        completionPeriodBegins: parentTask.completionPeriodBegins,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: "1",
        parentTaskId: data.setTaskId,
        childTasks: [],
        sortIndex: 0,
        completionDataType: data.completionDataType,
        isSet: false,
        numSets: 1,
        numCompletedSets: 0,
        blocking: TaskBlockingTypes.NEVER_BLOCK,
      };

      // Add child task to set task
      setTask.childTasks = [childTask];

      // Optimistically update parent task with the new set task
      utils.task.getTask.setData(
        { id: parentTaskId },
        {
          ...parentTask,
          childTasks: parentTask.childTasks
            ? [...parentTask.childTasks, setTask]
            : [setTask],
        },
      );

      setTitle("");
      setDescription("");
      setCompletionType(TaskCompletionTypes.Boolean);
      setCreateAsSet(false);
      onClose();
    },
    onSettled: async () => {
      await utils.task.getAllMyActiveTasks.invalidate();
      await utils.task.getTask.invalidate({ id: parentTaskId });
    },
  });

  const handleCreate = () => {
    const parentTask = utils.task.getTask.getData({ id: parentTaskId });
    if (!parentTask) {
      throw new Error("Parent task not found");
    }

    const numSiblingTasks = parentTask.childTasks?.length ?? 0;

    if (createAsSet) {
      // Create set with both parent and child tasks in a single transaction
      createTaskSet.mutate({
        setTaskId: uuid.v4() as string,
        childTaskId: uuid.v4() as string,
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
      });
    } else {
      // Regular subtask creation
      createTask.mutate({
        id: uuid.v4() as string,
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
    }
  };

  return (
    <View className="w-full flex-col space-y-12 gap-4 py-4">
      <View className="w-full space-y-5 rounded-lg bg-card p-4 py-12">
        <Text className="text-xl font-semibold text-foreground">
          Create Subtask for{" "}
          <Text className="text-primary">{parentTaskTitle}</Text>
        </Text>

        <TextInput
          className="rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground"
          placeholder="Task name"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#666"
        />

        <Pressable
          onPress={() => setCreateAsSet(!createAsSet)}
          className="flex-row items-center justify-between rounded-lg border border-input bg-background p-4"
        >
          <Text className="font-medium text-foreground">Create as set</Text>
          <View
            className={`h-6 w-11 flex-row items-center rounded-full px-0.5 ${
              createAsSet ? "justify-end bg-primary" : "justify-start bg-input"
            }`}
          >
            <View className="h-5 w-5 rounded-full bg-background shadow-sm" />
          </View>
        </Pressable>

        <View className="space-y-3">
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

        <View className="flex-row gap-3 pt-4">
          <Pressable
            onPress={onClose}
            className="flex-1 rounded-lg border border-input bg-background px-6 py-4"
          >
            <Text className="text-center text-base font-medium text-foreground">
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleCreate}
            className="flex-1 rounded-lg bg-primary px-6 py-4"
          >
            <Text className="text-center text-base font-semibold text-primary-foreground">
              Create
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

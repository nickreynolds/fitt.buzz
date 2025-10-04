"use client";

import React, { useState } from "react";
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import uuid from "react-native-uuid";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DialogPrimitive from "@rn-primitives/dialog";
import { format } from "date-fns";

import { TaskBlockingTypes, TaskCompletionTypes } from "@acme/utils";

import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { api } from "~/utils/api";
import Icon from "./icon";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("24");
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [completionType, setCompletionType] = useState<TaskCompletionTypes>(
    TaskCompletionTypes.Boolean,
  );

  const utils = api.useUtils();
  const { mutate } = api.task.createTask.useMutation({
    onMutate: (data) => {
      if (!data.id) {
        throw new Error("Task ID is required");
      }

      const task = {
        id: data.id || "1",
        title: data.title,
        description: data.description,
        nextDue: data.nextDue,
        lastCompleted: null,
        recurring: data.recurring,
        frequencyMinutes: data.frequencyMinutes ?? null,
        completionPeriodBegins: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: "1",
        parentTaskId: null,
        childTasks: [],
        sortIndex: 0,
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

      const tasks = utils.task.getAllMyActiveTasks.getData();
      if (tasks) {
        utils.task.getAllMyActiveTasks.setData(undefined, [...tasks, task]);
      }

      setTitle("");
      setDescription("");
      setIsRecurring(false);
      setFrequency("24");
      setDueDate(new Date());
      setDueTime(new Date());
      setCompletionType(TaskCompletionTypes.Boolean);
      onOpenChange(false);
    },
    onSettled: async () => {
      await utils.task.getAllMyActiveTasks.invalidate();
    },
  });

  const handleSubmit = () => {
    mutate({
      id: uuid.v4(),
      title,
      description,
      nextDue: new Date(dueDate.toDateString() + " " + dueTime.toTimeString()),
      recurring: isRecurring,
      frequencyMinutes: isRecurring ? parseInt(frequency) : undefined,
      completionDataType: completionType,
    });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="absolute inset-0 h-full w-full rounded-md bg-background">
          <DialogPrimitive.Content>
            <View className="pt-12">
              <View className="w-full space-y-5 rounded-lg bg-card p-4 py-12">
                <Text className="text-xl font-semibold text-foreground">
                  Create New Task
                </Text>

                <TextInput
                  className="rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground"
                  placeholder="Task name"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#666"
                />

                <View className="space-y-3">
                  <Text className="font-medium text-foreground">
                    Completion Type
                  </Text>
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
                        <Icon
                          name="Check"
                          className="h-4 w-4 text-foreground"
                        />
                        <Text className="text-foreground">Manual</Text>
                      </View>
                    </ToggleGroupItem>

                    <ToggleGroupItem
                      value={TaskCompletionTypes.WeightReps}
                      className="flex-1"
                    >
                      <View className="flex-row items-center justify-center space-x-2">
                        <Icon
                          name="Dumbbell"
                          className="h-4 w-4 text-foreground"
                        />
                        <Text className="text-foreground">Weight & Reps</Text>
                      </View>
                    </ToggleGroupItem>

                    <ToggleGroupItem
                      value={TaskCompletionTypes.Time}
                      className="flex-1"
                    >
                      <View className="flex-row items-center justify-center space-x-2">
                        <Icon
                          name="Clock"
                          className="h-4 w-4 text-foreground"
                        />
                        <Text className="text-foreground">Time</Text>
                      </View>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </View>

                <View className="space-y-3">
                  <Text className="font-medium text-foreground">Due Date</Text>
                  <Pressable
                    className="rounded-lg border border-input bg-background px-4 py-3"
                    onPress={() => setShow(true)}
                  >
                    <Text className="text-base text-foreground">
                      {format(dueDate, "MM/dd/yyyy")}
                    </Text>
                  </Pressable>
                  {show && (
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      onChange={(event, date) => {
                        if (Platform.OS === "android") {
                          setShow(false);
                        }
                        if (date) {
                          setDueDate(date);
                        }
                      }}
                    />
                  )}
                </View>

                <View className="space-y-3">
                  <Text className="font-medium text-foreground">Due Time</Text>
                  <Pressable
                    className="rounded-lg border border-input bg-background px-4 py-3"
                    onPress={() => setShowTime(true)}
                  >
                    <Text className="text-base text-foreground">
                      {format(dueTime, "HH:mm a")}
                    </Text>
                  </Pressable>
                  {showTime && (
                    <DateTimePicker
                      value={dueTime}
                      mode="time"
                      onChange={(event, date) => {
                        if (Platform.OS === "android") {
                          setShowTime(false);
                        }
                        if (date) {
                          setDueTime(date);
                        }
                      }}
                    />
                  )}
                </View>

                <Pressable
                  onPress={() => setIsRecurring(!isRecurring)}
                  className="flex-row items-center justify-between rounded-lg border border-input bg-background p-4"
                >
                  <Text className="font-medium text-foreground">
                    Recurring Task
                  </Text>
                  <View
                    className={`h-6 w-11 flex-row items-center rounded-full px-0.5 ${
                      isRecurring
                        ? "justify-end bg-primary"
                        : "justify-start bg-input"
                    }`}
                  >
                    <View className="h-5 w-5 rounded-full bg-background shadow-sm" />
                  </View>
                </Pressable>

                {isRecurring && (
                  <View className="space-y-3">
                    <Text className="font-medium text-foreground">
                      Frequency (hours)
                    </Text>
                    <TextInput
                      className="rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground"
                      value={frequency}
                      onChangeText={setFrequency}
                      keyboardType="numeric"
                      placeholder="24"
                      placeholderTextColor="#666"
                    />
                  </View>
                )}

                <View className="flex-row gap-3 pt-4">
                  <Pressable
                    onPress={() => onOpenChange(false)}
                    className="flex-1 rounded-lg border border-input bg-background px-6 py-4"
                  >
                    <Text className="text-center text-base font-medium text-foreground">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSubmit}
                    className="flex-1 rounded-lg bg-primary px-6 py-4"
                  >
                    <Text className="text-center text-base font-semibold text-primary-foreground">
                      Create
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <DialogPrimitive.Close asChild>
              <TouchableOpacity className="absolute right-6 top-20">
                <View className="rounded-full bg-muted p-3">
                  <Icon name="X" className="h-6 w-6 text-foreground" />
                </View>
              </TouchableOpacity>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

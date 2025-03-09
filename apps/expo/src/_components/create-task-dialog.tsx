"use client";

import React, { useState } from "react";
import {
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import uuid from "react-native-uuid";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as DialogPrimitive from "@rn-primitives/dialog";
import { format } from "date-fns";

import { TaskCompletionTypes } from "@acme/utils";

import { api } from "~/utils/api";

const COMPLETION_TYPE_OPTIONS = [
  { value: TaskCompletionTypes.Boolean, label: "Simple Completion" },
  { value: TaskCompletionTypes.WeightReps, label: "Weight & Reps" },
];

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
  const { mutate, error } = api.task.createTask.useMutation({
    onMutate: (data) => {
      if (!data.id) {
        throw new Error("Task ID is required");
      }

      const task = {
        id: data.id,
        title: data.title,
        description: data.description,
        nextDue: data.nextDue,
        lastCompleted: null,
        recurring: data.recurring,
        frequencyHours: data.frequencyHours ?? null,
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
      frequencyHours: isRecurring ? parseInt(frequency) : undefined,
      completionDataType: completionType,
    });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="absolute inset-0 bottom-16 left-16 right-16 top-16 z-50 bg-black/50 p-4">
          <DialogPrimitive.Content className="rounded-lg bg-background p-4">
            <DialogPrimitive.Title>
              <Text className="text-lg font-semibold text-primary">
                Create New Task
              </Text>
            </DialogPrimitive.Title>

            <View className="mt-4 space-y-4">
              <View>
                <Text className="mb-1 text-sm text-muted-foreground">
                  Title
                </Text>
                <TextInput
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  value={title}
                  onChangeText={setTitle}
                />
                {error?.data?.zodError?.fieldErrors.title && (
                  <Text className="mt-1 text-destructive">
                    {error.data.zodError.fieldErrors.title}
                  </Text>
                )}
              </View>

              <View>
                <Text className="mb-1 text-sm text-muted-foreground">
                  Description
                </Text>
                <TextInput
                  className="h-20 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>

              <View>
                <Text className="mb-1 text-sm text-muted-foreground">
                  Completion Type
                </Text>
                <View className="rounded-md border border-input">
                  <Picker
                    selectedValue={completionType}
                    onValueChange={(value) =>
                      setCompletionType(value as TaskCompletionTypes)
                    }
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    {COMPLETION_TYPE_OPTIONS.map((option) => (
                      <Picker.Item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View>
                <Text className="mb-1 text-sm text-muted-foreground">
                  Due Date
                </Text>

                <Pressable
                  className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  onPress={() => setShow(true)}
                >
                  <Text className="text-foreground">
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
                      console.log("event: ", event);
                      if (date) {
                        setDueDate(date);
                      }
                    }}
                  />
                )}
              </View>
              <View>
                <Text className="mb-1 text-sm text-muted-foreground">
                  at Time
                </Text>

                <Pressable
                  className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  onPress={() => setShowTime(true)}
                >
                  <Text className="text-foreground">
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
                      console.log("time event: ", event);
                      if (date) {
                        setDueTime(date);
                      }
                    }}
                  />
                )}
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Recurring Task?</Text>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: "#666", true: "#5B65E9" }}
                />
              </View>

              {isRecurring && (
                <View>
                  <Text className="mb-1 text-sm text-muted-foreground">
                    Frequency (hours)
                  </Text>
                  <TextInput
                    className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                    value={frequency}
                    onChangeText={setFrequency}
                    keyboardType="numeric"
                    placeholder="24"
                    placeholderTextColor="#666"
                  />
                </View>
              )}

              <View className="flex-row justify-end gap-2">
                <TouchableOpacity onPress={() => onOpenChange(false)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit}>
                  <Text>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

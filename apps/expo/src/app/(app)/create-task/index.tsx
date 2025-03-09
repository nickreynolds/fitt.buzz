"use client";

import { useState } from "react";
import {
  //   Modal,
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import uuid from "react-native-uuid";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import { TaskCompletionTypes } from "@acme/utils";

import { api } from "~/utils/api";

export default function CreateTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("24");
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const utils = api.useUtils();
  const { mutate, error } = api.task.createTask.useMutation({
    onMutate: (data) => {
      if (!isRecurring) {
        const task = {
          id: data.id,
          creatorId: "temp",
          title: data.title,
          description: data.description,
          nextDue: data.nextDue,
          recurring: data.recurring,
          frequencyHours: data.frequencyHours ?? null,
          completionPeriodBegins: null,
          lastCompleted: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          parentTaskId: null,
          childTasks: [],
          sortIndex: 0,
          isSet: false,
          numSets: 0,
          numCompletedSets: 0,
          completionDataType: TaskCompletionTypes.Boolean,
        };

        const tasks = utils.task.getAllMyActiveTasks.getData();
        if (tasks) {
          utils.task.getAllMyActiveTasks.setData(undefined, [...tasks, task]);
        }
      }

      setTitle("");
      setDescription("");
      setIsRecurring(false);
      setFrequency("24");
      setDueDate(new Date());
      setDueTime(new Date());
      router.push("/");
    },
    onSuccess: async () => {
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
    });
  };

  return (
    <View
      //   animationType="slide"
      //   transparent={true}
      //   visible={isOpen}
      //   onRequestClose={onClose}
      className="flex-1 bg-primary-foreground"
    >
      <View className="flex-1 justify-end">
        <View className="h-4/5 rounded-t-3xl bg-background p-6">
          <Text className="mb-6 text-center text-2xl font-bold text-foreground">
            Create Task
          </Text>

          <View className="space-y-4">
            <View>
              <Text className="mb-1 text-sm text-muted-foreground">Title</Text>
              <TextInput
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                value={title}
                onChangeText={setTitle}
                placeholder="Task Title"
                placeholderTextColor="#666"
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
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                value={description}
                onChangeText={setDescription}
                placeholder="Task Description"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
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

            <View>
              <Text className="text-foreground">
                {dueDate.toDateString() + " " + dueTime.toTimeString()}
              </Text>
            </View>
            <View>
              <Text className="text-foreground">
                {format(
                  new Date(
                    dueDate.toDateString() + " " + dueTime.toTimeString(),
                  ),
                  "MM/dd/yyyy hh:mm a",
                )}
              </Text>
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

            <View className="flex-row justify-between space-x-2">
              <Pressable
                className="rounded-md bg-destructive px-4 py-2"
                // onPress={onClose}
              >
                <Text className="text-destructive-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                className="rounded-md bg-primary px-4 py-2"
                onPress={handleSubmit}
              >
                <Text className="text-primary-foreground">Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

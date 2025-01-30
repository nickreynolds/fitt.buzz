import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Check, Pencil } from "lucide-react-native";
import { styled } from "nativewind";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/utils/api";
import { Button } from "./ui/button";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);

interface TaskHeaderProps {
  initialTask: RouterOutputs["task"]["getTask"];
  taskId: string;
}

export function TaskHeader({ initialTask, taskId }: TaskHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialTask.title);
  const utils = api.useUtils();

  const completeTask = api.task.completeTask.useMutation({
    onMutate: () => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== taskId);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
      await utils.task.invalidate();
    },
  });

  const updateTitle = api.task.updateTaskTitle.useMutation({
    onMutate: ({ title }) => {
      // Update the task in the cache
      const previousTask = utils.task.getTask.getData({ id: taskId });
      if (previousTask) {
        utils.task.getTask.setData({ id: taskId }, { ...previousTask, title });
      }

      // Update the task in the active tasks list
      const tasks = utils.task.getAllMyActiveTasks.getData();
      if (tasks) {
        const updatedTasks = tasks.map((t) =>
          t.id === taskId ? { ...t, title } : t,
        );
        utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
      }

      setIsEditing(false);
    },
    onError: () => {
      setEditedTitle(initialTask.title);
      setIsEditing(false);
    },
  });

  const completedSubtasks = initialTask.childTasks.filter(
    (task) => task.lastCompleted,
  ).length;
  const totalSubtasks = initialTask.childTasks.length;

  return (
    <StyledView className="flex-row items-center justify-between">
      <StyledView className="flex-1">
        {isEditing ? (
          <StyledView className="flex-row items-center gap-2">
            <StyledTextInput
              className="flex-1 rounded-md border border-input bg-background px-3 py-1 text-lg font-bold text-primary"
              value={editedTitle}
              onChangeText={setEditedTitle}
              autoFocus
              onBlur={() => {
                if (editedTitle.trim() !== initialTask.title) {
                  updateTitle.mutate({
                    id: taskId,
                    title: editedTitle.trim(),
                  });
                } else {
                  setIsEditing(false);
                }
              }}
              onSubmitEditing={() => {
                if (editedTitle.trim() !== initialTask.title) {
                  updateTitle.mutate({
                    id: taskId,
                    title: editedTitle.trim(),
                  });
                } else {
                  setIsEditing(false);
                }
              }}
            />
          </StyledView>
        ) : (
          <StyledPressable
            className="flex-row items-center gap-2"
            onPress={() => setIsEditing(true)}
          >
            <StyledText className="text-2xl font-bold text-primary">
              {initialTask.title}
              {initialTask.recurring && (
                <StyledText className="text-muted-foreground"> ↻</StyledText>
              )}
            </StyledText>
            <Pencil size={16} className="text-muted-foreground" />
          </StyledPressable>
        )}
        {totalSubtasks > 0 && (
          <StyledText className="mt-1 text-sm text-muted-foreground">
            {completedSubtasks} of {totalSubtasks} subtasks completed
          </StyledText>
        )}
      </StyledView>
      <Button
        variant="ghost"
        className="h-10 w-10 p-0"
        onPress={() => completeTask.mutate({ id: taskId })}
      >
        <Check size={20} color="currentColor" />
      </Button>
    </StyledView>
  );
}

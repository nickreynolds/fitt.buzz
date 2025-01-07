import { useState } from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Check } from "lucide-react-native";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { useSignIn, useSignOut, useUser } from "~/utils/auth";

function TaskCard(props: {
  task: RouterOutputs["task"]["getAllMyActiveTasks"][number];
  onComplete: () => void;
}) {
  return (
    <View className="flex flex-row rounded-lg bg-muted p-4">
      <View className="flex-grow">
        <Text className="text-xl font-semibold text-primary">
          {props.task.title}
        </Text>
        <Text className="mt-2 text-foreground">{props.task.description}</Text>
      </View>
      <Pressable onPress={props.onComplete}>
        <Check className="h-6 w-6" stroke="#5B65E9" strokeWidth={2} />
      </Pressable>
    </View>
  );
}

function CreateTask() {
  const utils = api.useUtils();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { mutate, error } = api.task.createTask.useMutation({
    async onSuccess() {
      setTitle("");
      setDescription("");
      await utils.task.getAllMyActiveTasks.invalidate();
    },
  });

  return (
    <View className="mt-4 flex gap-2">
      <TextInput
        className="items-center rounded-md border border-input bg-background px-3 text-lg leading-[1.25] text-foreground"
        value={title}
        onChangeText={setTitle}
        placeholder="Task Title"
      />
      {error?.data?.zodError?.fieldErrors.title && (
        <Text className="mb-2 text-destructive">
          {error.data.zodError.fieldErrors.title}
        </Text>
      )}
      <TextInput
        className="items-center rounded-md border border-input bg-background px-3 text-lg leading-[1.25] text-foreground"
        value={description}
        onChangeText={setDescription}
        placeholder="Task Description"
      />
      {error?.data?.zodError?.fieldErrors.description && (
        <Text className="mb-2 text-destructive">
          {error.data.zodError.fieldErrors.description}
        </Text>
      )}
      <Pressable
        className="flex items-center rounded bg-primary p-2"
        onPress={() => {
          mutate({
            title,
            description,
          });
        }}
      >
        <Text className="text-foreground">Create Task</Text>
      </Pressable>
      {error?.data?.code === "UNAUTHORIZED" && (
        <Text className="mt-2 text-destructive">
          You need to be logged in to create a task
        </Text>
      )}
    </View>
  );
}

function MobileAuth() {
  const user = useUser();
  const signIn = useSignIn();
  const signOut = useSignOut();

  return (
    <>
      <Text className="pb-2 text-center text-xl font-semibold text-white">
        {user?.name ?? "Not logged in"}
      </Text>
      <Button
        onPress={() => (user ? signOut() : signIn())}
        title={user ? "Sign Out" : "Sign In With Google"}
        color={"#5B65E9"}
      />
    </>
  );
}

export default function Index() {
  const utils = api.useUtils();

  const taskQuery = api.task.getAllMyActiveTasks.useQuery();

  const completeTaskMutation = api.task.completeTask.useMutation({
    onSettled: () => utils.task.getAllMyActiveTasks.invalidate(),
  });

  return (
    <SafeAreaView className="bg-background">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Tasks" }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="pb-2 text-center text-5xl font-bold text-foreground">
          fitt.<Text className="text-primary">buzz</Text>
        </Text>

        <MobileAuth />

        <View className="py-2">
          <Text className="font-semibold italic text-primary">
            Tap the check to complete a task
          </Text>
        </View>

        <FlashList
          data={taskQuery.data}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={(p) => (
            <TaskCard
              task={p.item}
              onComplete={() => completeTaskMutation.mutate({ id: p.item.id })}
            />
          )}
        />

        <CreateTask />
      </View>
    </SafeAreaView>
  );
}

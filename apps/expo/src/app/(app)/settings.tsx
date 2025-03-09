import React from "react";
import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { useSignOut } from "~/utils/auth";

export default function Settings() {
  const signOut = useSignOut();
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Settings", headerShown: false }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="text-4xl font-bold text-primary">Settings</Text>
        <View className="py-8">
          <Button
            onPress={() => signOut()}
            title={"Sign Out"}
            color={"#5B65E9"}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

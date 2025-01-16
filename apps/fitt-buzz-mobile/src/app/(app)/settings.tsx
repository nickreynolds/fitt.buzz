import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function Settings() {
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Settings", headerShown: false }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="text-4xl font-bold text-primary">Settings</Text>
        <View className="py-8">
          <Text className="text-muted-foreground">
            Settings page coming soon...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

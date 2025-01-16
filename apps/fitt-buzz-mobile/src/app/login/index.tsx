import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Login", headerShown: false }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="text-center text-2xl font-semibold text-foreground">
          logged.
        </Text>
      </View>
    </SafeAreaView>
  );
}

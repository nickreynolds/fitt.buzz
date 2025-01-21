import { Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { useSignIn } from "~/utils/auth";

export default function Index() {
  const signIn = useSignIn();
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Login", headerShown: false }} />
      <View className="h-full w-full bg-background p-4">
        <Button
          onPress={() => signIn()}
          title={"Sign In With Google"}
          color={"#5B65E9"}
        />
      </View>
    </SafeAreaView>
  );
}

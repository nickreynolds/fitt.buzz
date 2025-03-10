import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

import Icon from "./icon";

export function ThemeToggle() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Pressable
      onPress={toggleColorScheme}
      className="flex-row items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-800"
    >
      <View className="flex-row items-center gap-3">
        {colorScheme === "dark" ? (
          <Icon name="Moon" className="h-8 w-8 text-primary" />
        ) : (
          <Icon name="Sun" className="h-8 w-8 text-primary" />
        )}
        <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
          {colorScheme === "dark" ? "Dark Mode" : "Light Mode"}
        </Text>
      </View>
    </Pressable>
  );
}

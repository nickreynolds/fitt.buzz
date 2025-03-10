import "@bacons/text-decoder/install";

import { Platform, UIManager } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";

import { TRPCProvider } from "~/utils/api";

import "../styles.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "nativewind";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <TRPCProvider>
      <StatusBar
        style="light"
        backgroundColor={colorScheme === "dark" ? "#000000" : "#FFFFFF"}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
        <PortalHost />
      </GestureHandlerRootView>
    </TRPCProvider>
  );
}

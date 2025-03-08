import "@bacons/text-decoder/install";

import { Platform, UIManager } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";

import { TRPCProvider } from "~/utils/api";

import "../styles.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  return (
    <TRPCProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
        <StatusBar />
        <PortalHost />
      </GestureHandlerRootView>
    </TRPCProvider>
  );
}

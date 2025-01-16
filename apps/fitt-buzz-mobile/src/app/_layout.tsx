import "@bacons/text-decoder/install";

import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Home, Plus, Settings as SettingsIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";

import { TRPCProvider } from "~/utils/api";

import "../styles.css";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <TRPCProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colorScheme === "dark" ? "#09090B" : "#FFFFFF",
            borderTopColor: colorScheme === "dark" ? "#27272A" : "#E4E4E7",
          },
          tabBarActiveTintColor: "#f472b6",
          tabBarInactiveTintColor:
            colorScheme === "dark" ? "#A1A1AA" : "#71717A",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create-task/index"
          options={{
            title: "Create Task",
            tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <SettingsIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="login/index" options={{ href: null }} />
      </Tabs>
      <StatusBar />
    </TRPCProvider>
  );
}

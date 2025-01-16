import { Text } from "react-native";
import { Redirect, Stack, Tabs } from "expo-router";
import { Home, Plus, SettingsIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";

import { api } from "~/utils/api";

export default function AppLayout() {
  const { data: session, isLoading } = api.auth.getSession.useQuery();
  const { colorScheme } = useColorScheme();

  console.log("AppLayout session", session);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#09090B" : "#FFFFFF",
          borderTopColor: colorScheme === "dark" ? "#27272A" : "#E4E4E7",
        },
        tabBarActiveTintColor: "#f472b6",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#A1A1AA" : "#71717A",
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
      <Tabs.Screen name="login-redirect/index" options={{ href: null }} />
    </Tabs>
  );
}

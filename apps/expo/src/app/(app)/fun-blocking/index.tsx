import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { Checkbox } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import {
  getBlockedPackages,
  getInstalledPackages,
  setBlockedPackages,
} from "../../../../modules/app-blocker";

export default function FunBlockingPage() {
  const [installedPackages, setInstalledPackages] = useState<string[]>([]);
  const [blockedPackages, setBlockedPackagesState] = useState<string[]>([]);

  useEffect(() => {
    // Load installed packages and blocked packages on mount
    const packages = getInstalledPackages();
    const blocked = getBlockedPackages();
    setInstalledPackages(packages);
    setBlockedPackagesState(blocked);
  }, []);

  const handlePackageToggle = (packageName: string) => {
    const newBlockedPackages = blockedPackages.includes(packageName)
      ? blockedPackages.filter((p) => p !== packageName)
      : [...blockedPackages, packageName];

    setBlockedPackagesState(newBlockedPackages);
    setBlockedPackages(newBlockedPackages);
  };

  return (
    <SafeAreaView className="min-h-full bg-background">
      <Stack.Screen
        options={{
          title: "Fun Blocking",
        }}
      />
      <ScrollView className="min-h-full bg-background p-4">
        <Text className="mb-4 text-lg font-semibold text-primary">
          Installed Apps
        </Text>
        {installedPackages.map((packageName) => (
          <TouchableOpacity
            key={packageName}
            onPress={() => handlePackageToggle(packageName)}
            className="flex-row items-center rounded-md bg-background py-2"
          >
            <Checkbox
              status={
                blockedPackages.includes(packageName) ? "checked" : "unchecked"
              }
              onPress={() => handlePackageToggle(packageName)}
            />
            <Text className="ml-4 flex-1 text-foreground">{packageName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

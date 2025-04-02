import React from "react";
import { Text, View } from "react-native";

interface OverdueBadgeProps {
  className?: string;
}

export function OverdueBadge({ className }: OverdueBadgeProps) {
  return (
    <View className="ml-2 rounded-md bg-destructive/10 px-2 py-0.5">
      <Text className="text-xs font-medium text-destructive">overdue</Text>
    </View>
  );
}

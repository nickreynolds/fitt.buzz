import React from "react";
import { Text, View } from "react-native";

import { getFriendlyTime } from "@acme/utils";

interface TimeUntilOverdueBadgeProps {
  nextDue: Date;
  className?: string;
}

export function TimeUntilOverdueBadge({
  nextDue,
  className,
}: TimeUntilOverdueBadgeProps) {
  const now = new Date();
  const secondsUntilDue = Math.max(
    0,
    Math.floor((nextDue.getTime() - now.getTime()) / 1000),
  );
  const friendlyTime = getFriendlyTime(secondsUntilDue);

  return (
    <View className="ml-2 rounded-md bg-accent/10 px-2 py-0.5">
      <Text className="text-xs font-medium text-accent-foreground">
        due in {friendlyTime}
      </Text>
    </View>
  );
}

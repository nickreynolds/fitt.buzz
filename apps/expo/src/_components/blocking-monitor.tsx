import { useEffect } from "react";
import { Platform } from "react-native";

import { api } from "~/utils/api";
import {
  getBlockedPackages,
  setBlockedPackages,
} from "../../modules/app-blocker";

export function BlockingMonitor() {
  const { data: shouldBlock } = api.task.shouldBlockFun.useQuery(undefined, {
    refetchInterval: 30 * 1000, // for testing
    // refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: blockedDomains } = api.domainBlocking.getAll.useQuery(
    undefined,
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    },
  );

  useEffect(() => {
    if (shouldBlock && blockedDomains) {
      console.log("blocking");

      // On Android, we can use the native module to get and set blocked packages
      if (Platform.OS === "android") {
        const currentBlockedPackages = getBlockedPackages();
        console.log("Currently blocked packages:", currentBlockedPackages);

        // Here you would implement the actual blocking logic for Android
        // This could involve using the AppBlockerModule to block specific apps
        // For now, we'll just log the packages that should be blocked
        setBlockedPackages(currentBlockedPackages);
      }
    } else {
      console.log("unblocking");
      // Here you would implement the unblocking logic for Android
      if (Platform.OS === "android") {
        setBlockedPackages([]);
      }
    }
  }, [shouldBlock, blockedDomains]);

  // This component doesn't render anything visible
  return null;
}

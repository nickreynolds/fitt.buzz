import { useEffect } from "react";
import { Platform } from "react-native";

import { api } from "~/utils/api";
import { block, unblock } from "../../modules/app-blocker";

export function AppBlockingMonitor() {
  const { data: shouldBlock } = api.task.shouldBlockFun.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  console.log("shouldBlock", shouldBlock);

  useEffect(() => {
    if (Platform.OS === "android") {
      if (shouldBlock) {
        console.log("blocking apps");
        block();
      } else {
        console.log("unblocking apps");
        // Clear the blocked packages list
        unblock();
      }
    }
  }, [shouldBlock]);

  // This component doesn't render anything visible
  return null;
}

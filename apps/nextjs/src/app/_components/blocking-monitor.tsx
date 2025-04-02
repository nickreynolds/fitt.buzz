"use client";

import { useEffect } from "react";

import { api } from "~/trpc/react";

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

      // Extract domain strings from the blocked domains
      const domainsToBlock = blockedDomains.map((blocking) => blocking.domain);

      // @ts-expect-error - hacky way to get the electron api
      if (window.createT3TurboElectron) {
        // @ts-expect-error - hacky way to get the electron api
        // eslint-disable-next-line
        window.createT3TurboElectron.block(domainsToBlock);
      }
    } else {
      console.log("unblocking");
      // @ts-expect-error - hacky way to get the electron api
      if (window.createT3TurboElectron) {
        // @ts-expect-error - hacky way to get the electron api
        // eslint-disable-next-line
        window.createT3TurboElectron.unblock();
      }
    }
  }, [shouldBlock, blockedDomains]);

  // This component doesn't render anything visible
  return null;
}

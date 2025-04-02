/**
 * @module preload
 */

import * as fs from "fs";
import { contextBridge } from "electron";

import { blockBlackList, unblockBlackList } from "../hostsBlocker";
import { sha256sum } from "/@/sha256sum";

// Expose version number to renderer
contextBridge.exposeInMainWorld("createT3TurboElectron", {
  version: 0.2,
  doThing: () => {
    console.log("DO THING!!");
  },
  block: async (blockedDomains: string[]) => {
    await unblockBlackList();
    await blockBlackList(blockedDomains);
  },
  unblock: async () => {
    await unblockBlackList();
  },
});

/**
 * The "Main World" is the JavaScript context that your main renderer code runs in.
 * By default, the page you load in your renderer executes code in this world.
 *
 * @see https://www.electronjs.org/docs/api/context-bridge
 */

/**
 * After analyzing the `exposeInMainWorld` calls,
 * `packages/preload/exposedInMainWorld.d.ts` file will be generated.
 * It contains all interfaces.
 * `packages/preload/exposedInMainWorld.d.ts` file is required for TS is `renderer`
 *
 * @see https://github.com/cawa-93/dts-for-context-bridge
 */

/**
 * Safe expose node.js API
 * @example
 * window.nodeCrypto('data')
 */
contextBridge.exposeInMainWorld("nodeCrypto", { sha256sum });

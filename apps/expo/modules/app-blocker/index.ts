/* eslint-disable */
import type { Subscription } from "expo-modules-core";
import { EventEmitter, NativeModulesProxy } from "expo-modules-core";

import type {
  AppBlockerViewProps,
  ChangeEventPayload,
} from "./src/AppBlocker.types";
// Import the native module. On web, it will be resolved to AppBlocker.web.ts
// and on native platforms to AppBlocker.ts
import AppBlockerModule from "./src/AppBlockerModule";
import AppBlockerView from "./src/AppBlockerView";

// Get the native constant value.
export const PI = AppBlockerModule.PI;

export function hello(): string {
  return AppBlockerModule.hello();
}

export function getBlockedPackages(): string[] {
  return AppBlockerModule.getBlockedPackages();
}

export function setBlockedPackages(packages: string[]): void {
  AppBlockerModule.setBlockedPackages(packages);
}

export function getInstalledPackages(): string[] {
  return AppBlockerModule.getInstalledPackages();
}

export async function setValueAsync(value: string) {
  return await AppBlockerModule.setValueAsync(value);
}

export function block(): void {
  AppBlockerModule.block();
}

export function unblock(): void {
  AppBlockerModule.unblock();
}
const emitter = new EventEmitter(
  AppBlockerModule ?? NativeModulesProxy.AppBlocker,
);

export function addChangeListener(
  listener: (event: ChangeEventPayload) => void,
): Subscription {
  return emitter.addListener<ChangeEventPayload>("onChange", listener);
}

export { AppBlockerView };
export type { AppBlockerViewProps, ChangeEventPayload };

import * as React from "react";
import { requireNativeViewManager } from "expo-modules-core";

import type { AppBlockerViewProps } from "./AppBlocker.types";

const NativeView: React.ComponentType<AppBlockerViewProps> =
  requireNativeViewManager("AppBlocker");

export default function AppBlockerView(props: AppBlockerViewProps) {
  return <NativeView {...props} />;
}

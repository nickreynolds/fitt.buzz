import type { ViewProps } from "react-native";

export interface ChangeEventPayload {
  value: string;
}

export type AppBlockerViewProps = ViewProps & {
  name: string;
};

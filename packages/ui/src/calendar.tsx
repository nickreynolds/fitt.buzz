"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  return (
    <DayPicker
      mode="single"
      classNames={{
        today: `border-amber-500`, // Add a border to today's date
        selected: `bg-amber-500 border-amber-500 text-white`, // Highlight the selected day
        root: `${defaultClassNames.root} shadow-lg p-5`, // Add a shadow to the root element
        chevron: `${defaultClassNames.chevron} fill-amber-500`, // Change the color of the chevron
      }}
      {...props}
    />
  );
}

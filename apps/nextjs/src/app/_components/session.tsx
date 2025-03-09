"use client";

import React from "react";

export const SessionContext = React.createContext("userId");

export function Session(props: { children: React.ReactNode; userId: string }) {
  return (
    <SessionContext.Provider value={props.userId}>
      <div>{props.children}</div>
    </SessionContext.Provider>
  );
}

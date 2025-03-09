"use server";

import React from "react";

import { auth, signIn } from "@acme/auth";
import { Button } from "@acme/ui/button";

import { Session } from "./session";

export async function AuthShowcase(props: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return (
      <form>
        <Button
          size="lg"
          formAction={async () => {
            "use server";
            await signIn("google");
          }}
        >
          Sign in with Google
        </Button>
      </form>
    );
  }

  return (
    <Session userId={session.user.id}>
      <div>{props.children}</div>
    </Session>
  );
}

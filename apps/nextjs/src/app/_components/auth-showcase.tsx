import { Suspense } from "react";

import { auth, signIn, signOut } from "@acme/auth";
import { Button } from "@acme/ui/button";

import { CreatePostForm, PostCardSkeleton, PostList } from "./posts";

export async function AuthShowcase() {
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
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-2xl">
          <span>Logged in as {session.user.name}</span>
        </p>

        <CreatePostForm />
        <div className="w-full max-w-2xl overflow-y-scroll">
          <Suspense
            fallback={
              <div className="flex w-full flex-col gap-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            }
          >
            <PostList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

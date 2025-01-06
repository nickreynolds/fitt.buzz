import { auth, signIn } from "@acme/auth";
import { Button } from "@acme/ui/button";

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
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-4">{props.children}</div>
    </div>
  );
}

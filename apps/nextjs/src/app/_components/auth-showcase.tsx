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

  return <div>{props.children}</div>;
}

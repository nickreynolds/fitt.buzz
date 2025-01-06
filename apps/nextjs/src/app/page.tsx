import { HydrateClient } from "~/trpc/server";
import { AuthShowcase } from "./_components/auth-showcase";
import { Layout } from "./_components/Layout";

export const runtime = process.platform === "win32" ? "nodejs" : "edge";

export default function HomePage() {
  return (
    <HydrateClient>
      <Layout>
        <main className="container py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              Create <span className="text-primary">T3</span> Turbo
            </h1>
            <AuthShowcase />
          </div>
        </main>
      </Layout>
    </HydrateClient>
  );
}

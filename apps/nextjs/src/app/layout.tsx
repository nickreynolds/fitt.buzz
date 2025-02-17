import type { Metadata, Viewport } from "next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthShowcase } from "./_components/auth-showcase";

import "~/app/globals.css";

import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://fitt.buzz"
      : "http://localhost:3000",
  ),
  title: "Fitt.Buzz",
  description: "Applications for staying on track",
  openGraph: {
    title: "Fitt.Buzz",
    description: "Applications for staying on track",
    url: "https://fitt.buzz",
    siteName: "Fitt.Buzz",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen w-full bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>
            <ReactQueryDevtools initialIsOpen={true} />
            <AuthShowcase>{props.children}</AuthShowcase>
          </TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

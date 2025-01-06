"use client";

import { LogOut, Moon } from "lucide-react";
import { signOut } from "next-auth/react";

import { ThemeToggle } from "@acme/ui/theme";

import { Layout } from "../_components/Layout";

export default function SettingsPage() {
  return (
    <Layout>
      <main className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5" />
              <div>
                <h2 className="font-medium">Appearance</h2>
                <p className="text-sm text-muted-foreground">
                  Switch between dark and light mode
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Sign Out */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-destructive" />
              <div>
                <h2 className="font-medium">Sign Out</h2>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="rounded-md bg-destructive px-4 py-2 text-destructive-foreground hover:bg-destructive/90"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
}

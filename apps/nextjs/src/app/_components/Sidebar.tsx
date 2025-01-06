import Link from "next/link";
import { Activity, Home, Settings } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-40 w-64 transform border-r border-border bg-background transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <nav className="space-y-2 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}

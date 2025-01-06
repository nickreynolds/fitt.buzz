import Link from "next/link";
import { Home, Settings } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const textClass = `${!isOpen ? "hidden" : ""} ${isOpen ? "inline" : ""} lg:inline`;
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-40 w-64 transform border-r border-border bg-background transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:w-16 md:translate-x-0 lg:w-64`}
      >
        <nav className="space-y-2 p-4">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-md p-2 hover:bg-accent"
          >
            <Home className="h-5 w-5 shrink-0" />
            <span className={textClass}>Home</span>
            {/* Tooltip for medium screens */}
            <span className="fixed left-16 ml-2 hidden scale-0 rounded bg-accent px-2 py-1 text-sm group-hover:scale-100 md:inline-block lg:hidden">
              Home
            </span>
          </Link>

          <Link
            href="/settings"
            className="group flex items-center gap-2 rounded-md p-2 hover:bg-accent"
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span className={textClass}>Settings</span>
            {/* Tooltip for medium screens */}
            <span className="fixed left-16 ml-2 hidden scale-0 rounded bg-accent px-2 py-1 text-sm group-hover:scale-100 md:inline-block lg:hidden">
              Settings
            </span>
          </Link>
        </nav>
      </aside>
    </>
  );
}

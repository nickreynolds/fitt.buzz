import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-border bg-background">
      <div className="flex h-full items-center justify-between px-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 hover:bg-accent md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-2xl font-bold">fitt.buzz</h1>
        </div>
      </div>
    </header>
  );
}

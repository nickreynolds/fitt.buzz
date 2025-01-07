"use client";

import { useEffect, useState } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prevScreenWidth, setPrevScreenWidth] = useState(0);

  // This is to hide the sidebar when going from small to big screen so that text is hidden correctly during sidebar transition
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth > 768 && prevScreenWidth <= 768) {
        setIsSidebarOpen(false);
      }
      setPrevScreenWidth(screenWidth);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [prevScreenWidth]);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} />
      <main className="flex min-h-screen flex-col md:pl-16 lg:pl-64">
        <div className="flex-1 pt-16">{children}</div>
      </main>
    </div>
  );
}

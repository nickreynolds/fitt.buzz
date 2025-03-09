"use client";

import { useContext, useEffect, useState } from "react";
import Pusher from "pusher-js";

import { api } from "~/trpc/react";
import { Header } from "./Header";
import { SessionContext } from "./session";
import { Sidebar } from "./Sidebar";

const pusher = new Pusher("b257f4198d06902e6bca", {
  cluster: "us2",
});

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const userId = useContext(SessionContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prevScreenWidth, setPrevScreenWidth] = useState(0);

  const utils = api.useUtils();

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

  const channel = pusher.subscribe(`user-${userId}`);
  channel.bind("refresh-tasks", async (data: { tasks: string[] }) => {
    console.log("refresh-tasks", data);
    await utils.task.getAllMyActiveTasks.invalidate();
    for (const taskId of data.tasks) {
      await utils.task.getTask.invalidate({ id: taskId });
    }
  });

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

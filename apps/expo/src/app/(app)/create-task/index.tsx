"use client";

import { useEffect, useState } from "react";
import { router } from "expo-router";

import { CreateTaskDialog } from "~/_components/create-task-dialog";

export default function CreateTask() {
  const [open, setOpen] = useState(true);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      router.push("/");
    }
  };

  // Auto-open when navigating to this page
  useEffect(() => {
    setOpen(true);
  }, []);

  return <CreateTaskDialog open={open} onOpenChange={handleOpenChange} />;
}

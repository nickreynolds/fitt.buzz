"use client";

import { useState } from "react";

import { Button } from "@acme/ui/button";

import { CreateTaskDialogForm } from "./create-task-dialog-form";

export function CreateTaskButton() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
        Create Task
      </Button>

      <CreateTaskDialogForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}

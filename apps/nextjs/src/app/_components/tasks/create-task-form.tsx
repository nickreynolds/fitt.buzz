"use client";

import { useState } from "react";

import { Button } from "@acme/ui/button";

import { CreateTaskDialogForm } from "./create-task-dialog-form";

export function CreateTaskForm() {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setIsDatePickerOpen(true)}>
        Create Task
      </Button>

      <CreateTaskDialogForm
        open={isDatePickerOpen}
        onOpenChange={setIsDatePickerOpen}
      />
    </>
  );
}

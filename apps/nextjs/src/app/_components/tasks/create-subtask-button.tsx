"use client";

import { useState } from "react";

import { Button } from "@acme/ui/button";

import { CreateSubtaskDialogForm } from "~/app/_components/tasks/create-subtask-dialog";

export function CreateSubtaskButton({ taskId }: { taskId: string }) {
  const [createSubtaskOpen, setCreateSubtaskOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setCreateSubtaskOpen(true)}>
        Create Subtask
      </Button>

      <CreateSubtaskDialogForm
        open={createSubtaskOpen}
        onOpenChange={setCreateSubtaskOpen}
        parentTaskId={taskId}
      />
    </>
  );
}

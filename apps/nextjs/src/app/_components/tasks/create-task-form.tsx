"use client";

import { useState } from "react";
import { format } from "date-fns";
import { z } from "zod";

import { CreateTaskSchema } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
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

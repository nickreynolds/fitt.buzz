"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@acme/ui/button";

export default function BackButton({
  parentTaskId,
}: {
  parentTaskId: string | null;
}) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-2"
      onClick={() => {
        if (parentTaskId) {
          router.push(`/task/${parentTaskId}`);
        } else {
          router.push("/");
        }
      }}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}

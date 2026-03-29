"use client";

import { toggleTaskStatusAction } from "@/lib/actions/tasks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function TaskToggleButton({
  taskId,
  completed,
}: {
  taskId: string;
  completed: boolean;
}) {
  return (
    <Button
      type="button"
      variant={completed ? "secondary" : "primary"}
      size="sm"
      onClick={async () => {
        try {
          await toggleTaskStatusAction(taskId);
          toast.success(completed ? "Marked pending" : "Marked complete");
        } catch {
          toast.error("Could not update task");
        }
      }}
    >
      {completed ? "Undo" : "Complete"}
    </Button>
  );
}

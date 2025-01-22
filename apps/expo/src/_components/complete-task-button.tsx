import { Button } from "react-native";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/utils/api";

interface CompleteTaskButtonProps {
  task: RouterOutputs["task"]["getTask"];
}

export function CompleteTaskButton({ task }: CompleteTaskButtonProps) {
  const utils = api.useUtils();

  const completeTask = api.task.completeTask.useMutation({
    onMutate: (input) => {
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== input.id);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
      await utils.task.invalidate();
    },
  });

  if (!task) {
    return null;
  }

  return (
    <Button
      onPress={() => completeTask.mutate({ id: task.id })}
      title="complete"
    />
  );
}

import { Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { api } from "~/utils/api";

interface CompleteTaskButtonProps {
  taskId: string;
  parentTaskId: string | null;
}

export function CompleteTaskButton({
  taskId,
  parentTaskId,
}: CompleteTaskButtonProps) {
  const utils = api.useUtils();

  const completeTask = api.task.completeTask.useMutation({
    onMutate: () => {
      // prevent any in-flight updates from overwriting this optimistic update
      // we'll get the updated data eventually
      const promises = [];
      if (parentTaskId) {
        promises.push(utils.task.getTask.cancel({ id: parentTaskId }));
      }
      promises.push(utils.task.getTask.cancel({ id: taskId }));
      promises.push(utils.task.getAllMyActiveTasks.cancel());

      if (parentTaskId) {
        const parentTask = utils.task.getTask.getData({
          id: parentTaskId,
        });
        if (parentTask) {
          const updatedChildTasks = parentTask.childTasks?.map((t) => {
            if (t.id === taskId) {
              return { ...t, lastCompleted: new Date() };
            }
            return t;
          });

          utils.task.getTask.setData(
            { id: parentTaskId },
            { ...parentTask, childTasks: updatedChildTasks },
          );
        }
      }

      const task = utils.task.getTask.getData({ id: taskId });
      if (task) {
        utils.task.getTask.setData(
          { id: taskId },
          { ...task, lastCompleted: new Date() },
        );
      }

      // remove regular task if found
      const tasks = utils.task.getAllMyActiveTasks.getData();
      const updatedTasks = tasks?.filter((t) => t.id !== taskId);
      utils.task.getAllMyActiveTasks.setData(undefined, updatedTasks);
    },
    onSettled: async () => {
      const promises = [];
      if (parentTaskId) {
        promises.push(utils.task.getTask.cancel({ id: parentTaskId }));
      }
      promises.push(utils.task.getTask.cancel({ id: taskId }));
      promises.push(utils.task.getAllMyActiveTasks.cancel());

      const promises2 = [];
      if (parentTaskId) {
        promises2.push(utils.task.getTask.invalidate({ id: parentTaskId }));
      }
      promises2.push(utils.task.getTask.invalidate({ id: taskId }));
      promises2.push(utils.task.getAllMyActiveTasks.invalidate());

      await Promise.all(promises2);

      if (parentTaskId) {
        router.push(`/task/${parentTaskId}`);
      } else {
        router.push("/");
      }
    },
  });

  return (
    <TouchableOpacity
      className="rounded-lg bg-primary p-2 text-foreground"
      onPress={() => completeTask.mutate({ id: taskId })}
    >
      <Text>complete</Text>
    </TouchableOpacity>
  );
}

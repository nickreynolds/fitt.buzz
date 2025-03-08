import React from "react";
import { Text, View } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { TouchableOpacity } from "react-native-gesture-handler";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/utils/api";
import TaskCard from "./task-card";

interface SubtaskListProps {
  initialTask: RouterOutputs["task"]["getTask"];
  parentTaskId: string;
}

export function SubtaskList({ initialTask, parentTaskId }: SubtaskListProps) {
  const utils = api.useUtils();
  const { data: task } = api.task.getTask.useQuery(
    { id: parentTaskId },
    { initialData: initialTask },
  );

  if (!task) {
    return null;
  }

  const tasks = task.childTasks;
  if (!tasks || tasks.length === 0) {
    return (
      <View>
        <Text>No subtasks</Text>
      </View>
    );
  }

  const renderItem = ({
    item,
    drag,
    isActive,
  }: {
    item: RouterOutputs["task"]["getTask"];
    drag: () => void;
    isActive: boolean;
  }) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity onLongPress={drag}>
          <TaskCard key={item?.id} task={item} />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const mutateTaskOrder = api.task.reorderTasks.useMutation({
    onMutate: (data) => {
      const oldChildTasks = utils.task.getTask.getData({ id: parentTaskId });
      const dataMapping = new Map<string, number>();
      for (const order of data) {
        dataMapping.set(order.id, order.sortIndex);
      }

      const newChildTasks = oldChildTasks?.childTasks?.map((t) => {
        return {
          ...t,
          sortIndex: dataMapping.get(t.id) ?? t.sortIndex,
        };
      });

      const sortedChildTasks = newChildTasks?.sort(
        (a, b) => a.sortIndex - b.sortIndex,
      );

      utils.task.getTask.setData(
        { id: parentTaskId },
        {
          ...task,
          childTasks: sortedChildTasks,
        },
      );
    },
    onSettled: async () => {
      // await utils.task.getTask.refetch({ id: parentTaskId });
    },
  });

  return (
    <View className="mt-4 space-y-2">
      <DraggableFlatList
        data={tasks.sort((a, b) => a.sortIndex - b.sortIndex)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => {
          // console.log("f: ", JSON.stringify(data, null, 2));
          const taskOrder: { id: string; sortIndex: number }[] = [];
          data.forEach((task, index) => {
            if (task.id && task.sortIndex !== index) {
              // utils.task.getTask.setData(
              //   { id: task.id },
              //   {
              //     ...task,
              //     sortIndex: index,
              //   },
              // );
              taskOrder.push({ id: task.id, sortIndex: index });
            }
          });
          mutateTaskOrder.mutate(taskOrder);
        }}
      />
    </View>
  );
}

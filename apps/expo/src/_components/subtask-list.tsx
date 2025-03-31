import React from "react";
import { SafeAreaView, Text, View } from "react-native";
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

  const [listData, setListData] = React.useState<
    RouterOutputs["task"]["getTask"][]
  >(task?.childTasks?.concat().sort((a, b) => a.sortIndex - b.sortIndex) ?? []);

  React.useEffect(() => {
    setListData(
      task?.childTasks?.concat().sort((a, b) => a.sortIndex - b.sortIndex) ??
        [],
    );
  }, [task]);

  const tasks = task?.childTasks ?? [];

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
        <TouchableOpacity onLongPress={drag} activeOpacity={0.8}>
          <View
            className={`flex flex-row rounded-lg ${isActive ? "bg-secondary" : "bg-muted"}`}
          >
            <TaskCard key={item?.id} task={item} />
          </View>
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

      if (task) {
        utils.task.getTask.setData(
          { id: parentTaskId },
          {
            ...task,
            childTasks: sortedChildTasks,
          },
        );
      }
    },
    onSettled: async () => {
      await utils.task.getTask.invalidate({ id: parentTaskId });
    },
  });

  if (tasks.length === 0) {
    return (
      <View>
        <Text>No subtasks</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="mt-4 flex h-1/2 space-y-2">
      <DraggableFlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id ?? ""}
        onDragEnd={({ data }) => {
          setListData(data);
          const taskOrder: { id: string; sortIndex: number }[] = [];
          data.forEach((task, index) => {
            if (task?.id && task.sortIndex !== index) {
              taskOrder.push({ id: task.id, sortIndex: index });
            }
          });
          mutateTaskOrder.mutate(taskOrder);
        }}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
}

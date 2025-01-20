import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Index() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>Task id: {id}</Text>
    </View>
  );
}

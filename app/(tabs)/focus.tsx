import { View, Text } from 'react-native';

export default function FocusScreen() {
  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center p-6">
      <Text className="font-inter-bold text-3xl text-zinc-900 dark:text-white mb-2">Deep Work</Text>
      <Text className="font-inter text-zinc-500 dark:text-zinc-400 text-center">
        A distraction-free environment for your focus sessions.
      </Text>
    </View>
  );
}

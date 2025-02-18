import React, { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface SubtaskInputProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

export const SubtaskInput: React.FC<SubtaskInputProps> = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <View className="p-4 border-t border-zinc-100 dark:border-zinc-800">
      <TextInput
        className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-zinc-100"
        placeholder="Add a subtask..."
        placeholderTextColor="#9ca3af"
        value={content}
        onChangeText={setContent}
        onSubmitEditing={handleSubmit}
        autoFocus
      />
      <View className="flex-row justify-end mt-3 space-x-3">
        <Pressable
          onPress={onCancel}
          className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex-row items-center"
        >
          <IconSymbol name="close" size={18} color="#71717a" />
          <Text className="text-zinc-800 dark:text-zinc-200 ml-2">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          className="px-4 py-2 rounded-lg bg-green-500 flex-row items-center"
        >
          <IconSymbol name="add-task" size={18} color="#fff" />
          <Text className="text-white ml-2">Add</Text>
        </Pressable>
      </View>
    </View>
  );
};

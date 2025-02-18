import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface SubtaskItemProps {
  subtask: {
    id: string;
    content: string;
    completed: boolean;
  };
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onEdit,
  onRemove,
}) => (
  <View className="flex-row items-center justify-between py-2">
    <Pressable
      className="flex-row items-center flex-1"
      onPress={onToggle}
    >
      <IconSymbol
        name={subtask.completed ? "check-circle" : "radio-button-unchecked"}
        size={20}
        color={subtask.completed ? '#22c55e' : '#71717a'}
      />
      <Text className={`ml-2 ${
        subtask.completed 
          ? 'line-through text-zinc-400 dark:text-zinc-600'
          : 'text-zinc-900 dark:text-zinc-100'
      }`}>
        {subtask.content}
      </Text>
    </Pressable>
    <View className="flex-row">
      <Pressable onPress={onEdit} className="p-2">
        <IconSymbol name="edit" size={18} color="#22c55e" />
      </Pressable>
      <Pressable onPress={onRemove} className="p-2">
        <IconSymbol name="delete" size={18} color="#ef4444" />
      </Pressable>
    </View>
  </View>
);

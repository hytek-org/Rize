import React, { useState } from 'react';
import { Modal, View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';

interface SubtaskDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  editMode?: boolean;
  initialValue?: string;
}

export const SubtaskDrawer: React.FC<SubtaskDrawerProps> = ({
  visible,
  onClose,
  onSave,
  editMode = false,
  initialValue = ''
}) => {
  const [content, setContent] = useState(initialValue);

  const handleSave = () => {
    if (content.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSave(content.trim());
      setContent('');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-white dark:bg-zinc-800 rounded-t-3xl p-6">
          <View className="w-12 h-1 bg-zinc-200 dark:bg-zinc-600 rounded-full self-center mb-6" />
          
          <Text className="text-2xl font-semibold text-center mb-6 text-zinc-800 dark:text-white">
            {editMode ? 'Edit Subtask' : 'Add New Subtask'}
          </Text>

          <TextInput
            className="bg-zinc-100 dark:bg-zinc-700 px-4 py-3 rounded-xl text-zinc-800 dark:text-white text-base mb-6"
            placeholder="What needs to be done?"
            placeholderTextColor="#9ca3af"
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus
            onSubmitEditing={handleSave}
          />

          <View className="flex-row justify-end gap-5">
            <Pressable
              onPress={onClose}
              className="px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-700"
            >
              <Text className="text-zinc-800 dark:text-zinc-200 font-medium">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              className="px-6 py-3 rounded-xl bg-green-500"
            >
              <Text className="text-white font-medium">
                {editMode ? 'Save Changes' : 'Add Task'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

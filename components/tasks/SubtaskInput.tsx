import React, { useState, useRef } from 'react';
import { View, TextInput, Pressable, Text, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface SubtaskInputProps {
  onAdd: (content: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export const SubtaskInput = ({ onAdd, onCancel, autoFocus = true }: SubtaskInputProps) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const handleSubmit = () => {
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Animated.View 
        style={{ opacity: fadeAnim }}
        className="mt-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700"
      >
        <Text className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">
          Add Subtask
        </Text>
        
        <TextInput
          ref={inputRef}
          className="bg-white dark:bg-zinc-900 px-4 py-3 rounded-lg text-zinc-900 dark:text-zinc-100 mb-3"
          value={text}
          onChangeText={setText}
          placeholder="Enter subtask description..."
          placeholderTextColor="#666"
          multiline={false}
          maxLength={100}
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={handleSubmit}
        />

        <View className="flex-row justify-end space-x-2">
          <Pressable
            className="px-4 py-2 mr-2 rounded-lg bg-zinc-200 dark:bg-zinc-700"
            onPress={onCancel}
          >
            <Text className="text-zinc-700 dark:text-zinc-300">Cancel</Text>
          </Pressable>
          <Pressable
            className="px-4 py-2 rounded-lg bg-green-500"
            onPress={handleSubmit}
          >
            <Text className="text-white font-medium">Add Task</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

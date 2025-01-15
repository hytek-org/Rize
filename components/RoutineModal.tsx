import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TabCreateIcon } from "@/components/navigation/TabBarIcon";

interface RoutineModalProps {
  visible: boolean;
  onClose: () => void;
  content: string;
  setContent: (text: string) => void;
  onSave: () => void;
  time: string;
}

const RoutineModal: React.FC<RoutineModalProps> = ({
  visible,
  onClose,
  content,
  setContent,
  onSave,
  time,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const formatTime = (timeStr: string): string => {
    const hour = parseInt(timeStr, 10);
    return `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View className="bg-white dark:bg-zinc-900 rounded-t-3xl">
            <View className="p-4 border-b border-gray-200 dark:border-zinc-800">
              <View className="w-12 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
              <Text className="text-xl font-semibold text-center dark:text-white">
                Edit Routine for {formatTime(time)}
              </Text>
            </View>

            <ScrollView className="p-4">
              <View className="space-y-4">
                <TextInput
                  className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-base dark:text-white"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  placeholder="Enter routine details..."
                  placeholderTextColor={isDarkMode ? "#666" : "#999"}
                  style={{ minHeight: 120, textAlignVertical: 'top' }}
                />

                <TouchableOpacity
                  className="bg-green-600 p-4 rounded-xl flex-row justify-center items-center space-x-2"
                  onPress={onSave}
                >
                  <Text className="text-white font-medium">Save Changes</Text>
                  <TabCreateIcon name="check" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="p-4"
                  onPress={onClose}
                >
                  <Text className="text-center text-zinc-600 dark:text-zinc-400">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default RoutineModal;

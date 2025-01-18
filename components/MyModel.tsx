import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { TabCreateIcon } from "@/components/navigation/TabBarIcon";

interface MyModalProps {
  visible: boolean;
  onClose: () => void;
  input: string;
  setInput: (text: string) => void;
  tag: string;
  setTag: (text: string) => void;
  editMode?: boolean;  // Optional editMode prop
  addNote: () => void;
  editNote?: () => void;
}

const MyModal: React.FC<MyModalProps> = ({
  visible,
  onClose,
  input,
  setInput,
  tag = '',
  setTag,
  editMode = false,  // Default to false if editMode is not passed
  addNote,
  editNote,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Handle back button press for Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose(); // Close modal when back button is pressed
        return true; // Indicate we handled the event
      }
      return false; // Default back press behavior
    });

    // Cleanup back handler on component unmount
    return () => backHandler.remove();
  }, [visible, onClose]);

  const handleSubmit = async () => {
    if (!input.trim()) {
      // Only validate input, tag is optional
      return;
    }

    setIsLoading(true);
    try {
      if (editMode && editNote) {
        await editNote();
      } else {
        await addNote();
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose} // Handle Android hardware back press
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1, justifyContent: 'flex-start', }}>
          <Animated.View 
            className='absolute w-full h-full bg-black/50'
            style={{ opacity: fadeAnim }}
          />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false} // Hide the scroll indicator for better UX
            >
              <View className='flex-1 justify-end '>
                <View className='bg-zinc-50 dark:bg-zinc-900 rounded-t-3xl p-6 space-y-6 '>
                  {/* Drag indicator */}
                  <View className='w-12 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full self-center' />

                  <Text className="text-2xl font-bold text-zinc-800 dark:text-zinc-50 py-4">
                    {editMode ? "Update Note" : "New Note"}
                  </Text>

                  <View className='space-y-2'>
                    <Text className="text-sm py-1 font-medium text-zinc-600 dark:text-zinc-400">
                      Label ({tag?.length}/15)
                    </Text>
                    <TextInput
                      className="bg-white dark:text-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3"
                      value={tag}
                      maxLength={15}
                      onChangeText={setTag}
                      placeholder="Enter label"
                      placeholderTextColor={isDarkMode ? "#666" : "#999"}
                    />
                  </View>

                  <View className='space-y-2'>
                    <Text className="text-sm py-1 font-medium text-zinc-600 dark:text-zinc-400">
                      Note Content
                    </Text>
                    <TextInput
                      className="bg-white dark:text-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4"
                      value={input}
                      onChangeText={setInput}
                      placeholder="What's on your mind?"
                      multiline
                      placeholderTextColor={isDarkMode ? "#666" : "#999"}
                      style={{ minHeight: 120, textAlignVertical: 'top' }}
                    />
                  </View>

                  <View className='space-y-4 pt-4 '>
                    <TouchableOpacity
                      className='bg-green-600 active:bg-green-700 rounded-xl p-4 flex-row justify-center items-center space-x-2'
                      onPress={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Text className='text-white font-medium'>
                            {editMode ? "Update Note" : "Create Note"}
                          </Text>
                          <TabCreateIcon 
                            name={editMode ? "check" : "pluscircleo"} 
                            size={20} 
                            color="white" 
                            className='pl-2'
                          />
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      className='p-4'
                      onPress={onClose}
                    >
                      <Text className='text-center text-zinc-600 dark:text-zinc-400'>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MyModal;

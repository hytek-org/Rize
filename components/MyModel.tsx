import React, { useEffect } from 'react';
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
  tag,
  setTag,
  editMode = false,  // Default to false if editMode is not passed
  addNote,
  editNote,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose} // Handle Android hardware back press
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>

          {/* Semi-transparent background */}
          <TouchableWithoutFeedback onPress={() => { /* Prevent closing modal when clicking inside */ }}>
            <View
              className='flex-1 justify-end bg-black opacity-50'
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
          </TouchableWithoutFeedback>

          {/* Main Modal Content */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false} // Hide the scroll indicator for better UX
            >
              <View
                className='flex flex-col space-y-4 h-full  justify-center bg-zinc-50 dark:bg-zinc-900 rounded-t-lg p-4'
                style={{ width: '100%' }}
              >
                <Text className="text-4xl ml-4 mt-12 text-zinc-800 font-bold dark:text-zinc-50 mb-4">
                  {editMode ? "Update Your Note" : "Create a new Note"}
                </Text>
                {/* Input for Tag */}
                <TextInput
                  className="xl:mt-20 p-2 dark:text-white dark:bg-zinc-700 border mx-2 my-2 rounded-lg text-lg xl:text-2xl px-2 focus:border-green-500 focus:ring-green-500"
                  value={tag}
                  maxLength={15}
                  numberOfLines={3}
                  onChangeText={setTag}
                  placeholder="Enter a new Label"
                  placeholderTextColor={isDarkMode ? "#fff" : "#b2aeae"}
                  textAlignVertical="top"
                />

                {/* Input for Note */}
                <TextInput
                  className="pt-4 dark:text-white dark:bg-zinc-700 border mx-2 my-2 rounded-lg text-lg xl:text-2xl px-2 focus:border-green-500 focus:ring-green-500"
                  value={input}
                  onChangeText={setInput}
                  placeholder="Enter a new note"
                  multiline={true}
                  numberOfLines={7}
                  placeholderTextColor={isDarkMode ? "#fff" : "#b2aeae"}
                  textAlignVertical="top" // Ensure the text starts from the top
                  style={{
                    maxHeight: 250, // Allow for larger text height while being scrollable
                    paddingTop: 10,
                  }}
                />

                {/* Buttons */}
                <View className='flex flex-col justify-center items-center'>
                  <TouchableOpacity
                    className='py-3 px-4 inline-flex flex-row gap-x-4 text-sm font-medium rounded-full items-center border border-zinc-200 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800'
                    onPress={editMode ? editNote : addNote}
                  >
                    <Text className='dark:text-white text-lg font-medium'>
                      {editMode ? "Update Note" : "Add Note"}
                    </Text>
                    <TabCreateIcon name={"pluscircleo"} size={24} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className='mt-4 text-xl'
                    onPress={onClose}
                  >
                    <Text className='text-xl text-green-600'>Close</Text>
                  </TouchableOpacity>
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

// MyModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { TabCreateIcon } from "@/components/navigation/TabBarIcon";

interface MyModalProps {
  visible: boolean;
  onClose: () => void;
  input: string;
  setInput: (text: string) => void;
  tag: string;
  setTag: (text: string) => void;
  editMode: boolean;
  addNote: () => void;
  editNote: () => void;
}

const MyModal: React.FC<MyModalProps> = ({
  visible,
  onClose,
  input,
  setInput,
  tag,
  setTag,
  editMode,
  addNote,
  editNote,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className='flex flex-col space-y-4 bg-zinc-50 dark:bg-zinc-900 h-screen' >
        <View className='mt-5 '>
          <TextInput
            className="xl:mt-20 p-2  dark:text-white  dark:bg-gray-700  border mx-2 my-2 rounded-lg text-lg xl:text-2xl px-2"
            value={tag}
            maxLength={15}
            numberOfLines={3}
            onChangeText={setTag}
            placeholder="Enter a new Label"
            placeholderTextColor={isDarkMode ? "#fff" : "#b2aeae"}
            textAlignVertical="top"
          />
          <TextInput
            className="pt-4 dark:text-white dark:bg-gray-700 border mx-2 my-2 rounded-lg text-lg xl:text-2xl px-2"
            value={input}
            onChangeText={setInput}
            placeholder="Enter a new note"
            multiline={true}
            numberOfLines={7}
            placeholderTextColor={isDarkMode ? "#fff" : "#b2aeae"}
            textAlignVertical="top" // Ensure the text starts from the top
          />

        </View>
        <View className='flex flex-col justify-center items-center'>

          <TouchableOpacity
            className='py-3 px-4  inline-flex flex-row gap-x-4 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800'
            onPress={editMode ? editNote : addNote}
          >
            <Text className='dark:text-white text-lg font-medium' >
              {editMode ? "Update Note" : "Add Note"}
            </Text>
            <TabCreateIcon className='text-black dark:text-white flex-shrink-0 size-4' name={"pluscircleo"} size={24} color="white" />

          </TouchableOpacity>
          <TouchableOpacity
            className=' mt-4 text-xl'
            onPress={onClose}
          >
            <Text className='text-xl text-green-600' >Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};



export default MyModal;

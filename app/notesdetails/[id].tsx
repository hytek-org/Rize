import { Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TabCreateIcon, TabTaskIcon } from '@/components/navigation/TabBarIcon';
import CustomAlert from '@/components/CustomAlert';
import MyModal from '@/components/MyModel';
import { useNotes } from '@/contexts/NotesContext';

type AlertType = 'error' | 'success' | 'info';

interface Note {
  id: string;
  content: string;
  tag: string;
  date: string;
}

export default function NoteDetails() {
  const { id } = useLocalSearchParams(); // Get note ID from URL params
  const colorScheme = useColorScheme();
  const router = useRouter();
  const color = colorScheme === 'dark' ? 'white' : 'black';
  const { notes, addNote, editNote, deleteNote } = useNotes();

  const [note, setNote] = useState<Note | null>(null);
  const [input, setInput] = useState('');
  const [tag, setTag] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // CustomAlert state management
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('error');

  useEffect(() => {
    if (id) {
      const fetchedNote = notes.find((note) => note.id === id);
      if (fetchedNote) {
        setNote(fetchedNote);
      } else {
        setAlertTitle('Error');
        setAlertMessage('Note not found.');
        setAlertType('error');
        setAlertVisible(true);
      }
    }
  }, [id, notes]);

  const startEditingNote = () => {
    if (note) {
      setTag(note.tag || 'Default');
      setInput(note.content);
      setEditMode(true);
      setModalVisible(true);
    }
  };

  const handleEditNote = () => {
    if (!input.trim()) {
      setAlertTitle('Error');
      setAlertMessage('Note content cannot be empty.');
      setAlertType('error');
      setAlertVisible(true);
      return;
    }
    if (note) {
      editNote(note.id, input, tag);
      setNote({ ...note, content: input, tag });
    }
    setModalVisible(false);
    setEditMode(false);
    setAlertTitle('Success');
    setAlertMessage('Note updated successfully!');
    setAlertType('success');
    setAlertVisible(true);
  };

  const handleDeleteNote = () => {
    if (note) {
      deleteNote(note.id);
      setAlertTitle('Success');
      setAlertMessage('Note deleted successfully!');
      setAlertType('success');
      setAlertVisible(true);
      setTimeout(() => {
        router.push('/notes');
      }, 500); 
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setInput('');
    setTag('');
  };

  if (!note) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 dark:text-gray-300 text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
      <ScrollView>
        <Text selectable={true} className="text-xl font-medium text-black dark:text-white mb-2">{note.content}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">Tag: {note.tag}</Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">Added on: {note.date}</Text>
      </ScrollView>

      <View className="flex-row justify-between mt-4">
        <Pressable
          className="rounded-md px-4 py-2 bg-blue-500 text-white shadow-md"
          onPress={startEditingNote}
        >
          <TabTaskIcon name="edit" />
          <Text className="text-sm">Edit</Text>
        </Pressable>

        <Pressable
          className="rounded-md px-4 py-2 bg-red-500 text-white shadow-md"
          onPress={handleDeleteNote}
        >
          <TabCreateIcon name="delete" />
          <Text className="text-sm">Delete</Text>
        </Pressable>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        type={alertType}
      />

    

      <MyModal
        visible={modalVisible}
        onClose={closeModal}
        input={input}
        setInput={setInput}
        tag={tag}
        setTag={setTag}
        editMode={editMode}
        addNote={() => {}} // Not used here
        editNote={handleEditNote}
      />
    </View>
  );
}

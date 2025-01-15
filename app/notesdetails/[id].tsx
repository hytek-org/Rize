import { Pressable, ScrollView, Text, useColorScheme, View, SafeAreaView } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TabCreateIcon, TabTaskIcon } from '@/components/navigation/TabBarIcon';
import CustomAlert from '@/components/CustomAlert';
import MyModal from '@/components/MyModel';
import { useNotes } from '@/contexts/NotesContext';
import { AlertState, AlertType, Note } from '@/types/notes';

export default function NoteDetails() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const color = colorScheme === 'dark' ? 'white' : 'black';
  const { notes, addNote, editNote, deleteNote } = useNotes();

  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState<Note | null>(null);
  const [input, setInput] = useState('');
  const [tag, setTag] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const showAlert = useCallback((title: string, message: string, type: AlertType) => {
    setAlertState({
      visible: true,
      title,
      message,
      type
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (id) {
      const fetchedNote = notes.find((note) => note.id === id);
      if (fetchedNote) {
        setNote(fetchedNote);
      } else {
        showAlert('Error', 'Note not found.', 'error');
        router.replace('/notes');
      }
    }
    setIsLoading(false);
  }, [id, notes, router, showAlert]);

  const startEditingNote = () => {
    if (note) {
      setTag(note.tag || 'Default');
      setInput(note.content);
      setEditMode(true);
      setModalVisible(true);
    }
  };

  const handleEditNote = useCallback(() => {
    if (!input.trim()) {
      showAlert('Error', 'Note content cannot be empty.', 'error');
      return;
    }
    if (note) {
      editNote(note.id, input, tag);
      setNote({ ...note, content: input, tag });
      setModalVisible(false);
      setEditMode(false);
      showAlert('Success', 'Note updated successfully!', 'success');
    }
  }, [input, tag, note, editNote, showAlert]);

  const handleDeleteNote = useCallback(() => {
    if (note) {
      deleteNote(note.id);
      showAlert('Success', 'Note deleted successfully!', 'success');
      setTimeout(() => router.replace('/notes'), 500);
    }
  }, [note, deleteNote, router, showAlert]);

  const closeModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setInput('');
    setTag('');
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-900 pt-10">
      {/* Header */}
      <View className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-row justify-between items-center">
        <Pressable onPress={() => router.back()}>
          <TabCreateIcon name="arrowleft" size={24} color={color} />
        </Pressable>
        <View className="flex-row space-x-4">
          <Pressable
            className="p-2 rounded-full"
            onPress={startEditingNote}
          >
            <TabTaskIcon 
              name="edit" 
              size={24} 
              color={colorScheme === 'dark' ? '#22c55e' : '#16a34a'} 
            />
          </Pressable>
          <Pressable
            className="p-2 rounded-full"
            onPress={handleDeleteNote}
          >
            <TabCreateIcon 
              name="delete" 
              size={24} 
              color="#ef4444" 
            />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Tag */}
        <View className="py-4">
          <View className="bg-green-100 dark:bg-green-900 self-start px-3 py-1 rounded-full">
            <Text className="text-green-700 dark:text-green-300 font-medium">
              {note?.tag || 'Untagged'}
            </Text>
          </View>
        </View>

        {/* Note Content */}
        <View className="space-y-4">
          <Text 
            selectable={true} 
            className="text-lg leading-relaxed text-zinc-900 dark:text-zinc-100"
          >
            {note?.content}
          </Text>
        </View>

        {/* Metadata */}
        <View className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Created on {note?.date} 
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Loading State */}
      {isLoading && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="bg-white dark:bg-zinc-800 p-4 rounded-2xl">
            <Text className="text-zinc-600 dark:text-zinc-300">Loading...</Text>
          </View>
        </View>
      )}

      {/* Alerts and Modal */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState({ ...alertState, visible: false })}
        type={alertState.type}
      />

      <MyModal
        visible={modalVisible}
        onClose={closeModal}
        input={input}
        setInput={setInput}
        tag={tag}
        setTag={setTag}
        editMode={editMode}
        addNote={() => {}}
        editNote={handleEditNote}
      />
    </SafeAreaView>
  );
}

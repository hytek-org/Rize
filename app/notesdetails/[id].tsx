import {
  Pressable,
  ScrollView,
  useColorScheme,
  View,
  SafeAreaView,
  Share,
  Text,
  Linking
} from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TabCreateIcon, TabTaskIcon } from '@/components/navigation/TabBarIcon';
import CustomAlert from '@/components/CustomAlert';
import MyModal from '@/components/notes/MyModel';
import { useNotes } from '@/contexts/NotesContext';
import { AlertState, AlertType, Note } from '@/types/notes';
import Markdown from 'react-native-markdown-display';

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
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Ref to capture the note content for sharing as an image (if needed)
  const noteContentRef = useRef<View>(null);

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

  // Custom delete confirmation modal
  const confirmNoteDelete = () => {
    setDeleteConfirmVisible(true);
  };

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

  // Share note as text using the native Share API
  const shareNoteAsText = async () => {
    if (!note) return;
    try {
      await Share.share({
        message: note.content,
        title: 'Share Note'
      });
    } catch (error) {
      showAlert('Error', 'Failed to share note.', 'error');
    }
  };

  const handleShareNote = () => {
    if (!note) return;
    shareNoteAsText();
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-900 pt-10">
      {/* Header */}
      <View className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-row items-center justify-between">
        {/* Back Button */}
        <Pressable onPress={() => router.back()} className="p-2">
          <TabCreateIcon name="arrowleft" size={26} color={color} />
        </Pressable>

        {/* Centered Title & Tag */}
        <View className="flex-1 flex-row items-center justify-start ml-4 gap-6">
          <View className="bg-green-100 dark:bg-green-900 px-4 py-1 rounded-full">
            <Text className="text-green-700 dark:text-green-300 font-medium text-sm">
              {note?.tag || 'Untagged'}
            </Text>
          </View>
        </View>

        {/* Actions: Edit, Share, Delete */}
        <View className="flex-row items-center gap-4 mr-2">
          <Pressable className="p-2" onPress={startEditingNote}>
            <TabTaskIcon name="edit" size={22} color={colorScheme === 'dark' ? '#22c55e' : '#16a34a'} />
          </Pressable>
          <Pressable className="p-2" onPress={handleShareNote}>
            <TabCreateIcon name="sharealt" size={22} color={color} />
          </Pressable>
          <Pressable className="p-2" onPress={confirmNoteDelete}>
            <TabCreateIcon name="delete" size={22} color="#FF3131" />
          </Pressable>
        </View>
      </View>

      {/* Content */}

      <View ref={noteContentRef} className='flex flex-col justify-between h-screen-safe pt-2 pb-10 px-4'>
        <ScrollView nestedScrollEnabled>
          <Markdown
            onLinkPress={(url:string) => {
              Linking.openURL(url).catch(err => console.error('Failed to open link:', err));
              return true;
            }}
            style={{
              body: {
                fontSize: 16,
                lineHeight: 24,
                color: colorScheme === 'dark' ? '#fff' : '#000',
              },
              link: {
                color: '#1e90ff', // Blue color for links
                textDecorationLine: 'underline',
              },
              heading1: { fontSize: 24, marginBottom: 10 },
              heading2: { fontSize: 20, marginBottom: 8 },
              paragraph: { marginBottom: 10 },
              listItem: { flexDirection: 'row', marginBottom: 4 },
            }}
          >
            {note?.content || '*No content available*'}
          </Markdown>
        </ScrollView>


        {/* Metadata */}
        <View className="border-t border-zinc-200 dark:border-zinc-800">
          <Markdown
            style={{
              body: {
                fontSize: 14,
                color: colorScheme === 'dark' ? '#a1a1aa' : '#6b7280'
              }
            }}
          >
            {`Created on ${note?.date}`}
          </Markdown>
        </View>
      </View>


      {/* Loading State */}
      {isLoading && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="bg-white dark:bg-zinc-800 p-4 rounded-2xl">
            <Markdown
              style={{
                body: {
                  fontSize: 16,
                  color: colorScheme === 'dark' ? '#d1d5db' : '#4b5563'
                }
              }}
            >
              Loading...
            </Markdown>
          </View>
        </View>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmVisible && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="bg-white dark:bg-zinc-800 p-6 rounded-2xl w-96">
            <Text className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">
              Confirm Deletion
            </Text>
            <Text className="text-md text-zinc-600 dark:text-zinc-300 mb-6">
              Are you sure you want to delete this note?
            </Text>
            <View className="flex-row justify-end gap-6">
              <Pressable onPress={() => setDeleteConfirmVisible(false)}>
                <Text className="text-blue-600 dark:text-blue-400">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDeleteConfirmVisible(false);
                  handleDeleteNote();
                }}
              >
                <Text className="text-red-600 dark:text-red-400">Delete</Text>
              </Pressable>
            </View>
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
        addNote={() => { }}
        editNote={handleEditNote}
      />
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert, Platform, ScrollView, Image } from 'react-native';
import { TabCreateIcon, TabTaskIcon } from '@/components/navigation/TabBarIcon';
import MyModal from '@/components/MyModel';
import FloatingButton from '@/components/FlotingButton';
import { ExternalLink } from '@/components/ExternalLink';
import { useNotes } from '@/contexts/NotesContext';

export default function TabTwoScreen() {
  const { notes, addNote, editNote, deleteNote } = useNotes();
  const [input, setInput] = useState('');
  const [tag, setTag] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  interface Note {
    id: string;
    content: string;
    tag: string;
    date: string;
  }
  const startEditingNote = (note:Note) => {
    setTag(note.tag || 'Default');
    setInput(note.content);
    setEditMode(true);
    setEditNoteId(note.id);
    setModalVisible(true);
  };

  const handleAddNote = () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Note cannot be empty.');
      return;
    }
    addNote(input, tag);
    setInput('');
    setModalVisible(false);
  };

  const handleEditNote = () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Note cannot be empty.');
      return;
    }
    editNote(editNoteId || "", input, tag);  
    setInput('');
    setEditMode(false);
    setEditNoteId(null);
    setModalVisible(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setEditNoteId(null);
    setInput('');
    setTag('');
  };

  return (
    <View className="grid grid-cols-1 xl:grid-cols-2 ">
      <View className="bg-slate-200 dark:bg-neutral-900 xl:pb-20 h-screen pb-10 xl:h-[100vh]">
        <Text className="text-4xl ml-4 mt-12 text-zinc-800 font-bold dark:text-zinc-50 mb-4">View Notes</Text>
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex flex-col bg-white dark:bg-neutral-800 border rounded mx-2 mb-4 py-4">
              <View className="flex flex-row justify-between">
                <Text className="text-lg ml-2 dark:text-white">
                  <TabCreateIcon name={'tago'} size={16} /> {item.tag ? item.tag : 'Default'}
                </Text>
              
                <View className="flex flex-row rounded-lg bg-neutral-100 border border-neutral-700 dark:bg-neutral-700 py-1 sm:py-2 mr-2">
                  <Pressable
                    className="rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-700 focus:relative"
                    onPress={() => startEditingNote(item)}
                  >
                    <TabTaskIcon name="edit-note" />
                  </Pressable>
                  <Pressable
                    className="rounded bg-white dark:bg-black px-4 py-2 text-sm text-blue-500 shadow-sm focus:relative"
                    onPress={() => deleteNote(item.id)}
                  >
                    <TabCreateIcon name={"delete"} />
                  </Pressable>
                </View>
              </View>
              <ScrollView>
                <Text className="dark:text-white text-xl ml-4 font-medium xl:text-2xl">{item.content}</Text>
              </ScrollView>
              <Text className="dark:text-white ml-4 text-xs">Note added on {item.date}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center h-full mt-[30vh] ">
              <Image source={require('../../assets/images/empty-note.png')} style={{ width: 200, height: 200 }} />
              <Text className="dark:text-white text-lg mt-4">No notes available</Text>
              <ExternalLink href="https://storyset.com/people">People illustrations by Storyset</ExternalLink>
            </View>
          )}
        />
      </View>

      <View>
        <FloatingButton onPress={() => setModalVisible(true)} />
        <MyModal
          visible={modalVisible}
          onClose={closeModal}
          input={input}
          setInput={setInput}
          tag={tag}
          setTag={setTag}
          editMode={editMode}
          addNote={handleAddNote}
          editNote={handleEditNote}
        />
      </View>
    </View>
  );
}

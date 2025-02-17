import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, Image, TextInput, useColorScheme } from 'react-native';
import { TabCreateIcon, TabTaskIcon } from '@/components/navigation/TabBarIcon';
import MyModal from '@/components/MyModel';
import FloatingButton from '@/components/FlotingButton';
import { useNotes } from '@/contexts/NotesContext';
import CustomAlert from '@/components/CustomAlert';
import { router } from 'expo-router';
import { AlertState, AlertType, Note } from '@/types/notes';
import Markdown from 'react-native-markdown-display';


export default function NotesScreen() {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';
  const { notes, addNote } = useNotes();
  const [input, setInput] = useState('');
  const [tag, setTag] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  // Fix alert state with proper typing
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Memoized unique tags - fixed type assertion
  const uniqueTags = useMemo(() =>
    Array.from(new Set(notes.map((note) => note.tag))).filter((tag): tag is string => Boolean(tag)),
    [notes]
  );

  // Memoized filtered and sorted notes
  const filteredAndSortedNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = selectedTag ? note.tag === selectedTag : true;
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return a.content.localeCompare(b.content);
      });
  }, [notes, searchQuery, selectedTag, sortBy]);

  const showAlert = useCallback((title: string, message: string, type: AlertType) => {
    setAlertState({
      visible: true,
      title,
      message,
      type
    });
  }, []);

  const handleAddNote = useCallback(() => {
    if (!input.trim()) {
      showAlert('Error', 'Note content cannot be empty.', 'error');
      return;
    }

    addNote(input, tag || undefined); // Pass undefined if tag is empty
    setInput('');
    setTag('');
    setModalVisible(false);
    showAlert('Success', 'Note added successfully!', 'success');
  }, [input, tag, addNote, showAlert]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setInput('');
    setTag('');
  }, []);

  const renderNoteItem = useCallback(({ item }: { item: Note }) => (
    <Pressable onPress={() => router.push({
      pathname: '/notesdetails/[id]',
      params: { id: item.id },
    })}
      className="bg-white dark:bg-neutral-800 text-black dark:text-white rounded-lg mx-2 mb-4 p-4 shadow-sm"
      style={{ elevation: 2 }}
    >

      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <TabCreateIcon name="tago" size={16} />
          <Text className="text-sm ml-2 dark:text-white font-medium">
            {item.tag || 'Default'}
          </Text>
        </View>
        <View
          className="bg-green-500 opacity-75 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-medium">View</Text>
        </View>
      </View>
      <Markdown      style={{
              body: {
                fontSize: 16,
                lineHeight: 24,
                color: color,
              },
              link: {
                color: '#1e90ff', // Blue color for links
                textDecorationLine: 'underline',
              },
              heading1: { fontSize: 24, marginBottom: 10 },
              heading2: { fontSize: 20, marginBottom: 8 },
              paragraph: { marginBottom: 10 },
              listItem: { flexDirection: 'row', marginBottom: 4 },
            }}>
        {item.contentPreview}
      </Markdown>
      <Text className="text-gray-500 dark:text-gray-400 text-xs">
        {item.date}
      </Text>
    </Pressable>
  ), []);

  return (
    <View className="flex-1 bg-slate-100 dark:bg-neutral-900 ">
      <View className="pt-12 px-4">
        <Text className="text-3xl font-bold dark:text-white mb-4">
          My Notes
        </Text>

        {/* Search and Sort Controls */}
        <View className="flex-row items-center mb-4 gap-2">
          <TextInput
            className="flex-1 bg-white dark:bg-neutral-800 rounded-lg px-4 py-2 text-base dark:text-white"
            placeholder="Search notes..."
            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable
            onPress={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}
            className="p-2"
          >
            <TabTaskIcon
              size={24}
              name={sortBy === 'date' ? 'sort' : 'sort-by-alpha'}
              color={color}
            />
          </Pressable>
        </View>

        {/* Tags ScrollView */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <Pressable
            onPress={() => setSelectedTag(null)}
            className={`mr-2 px-4 py-2 rounded-full ${selectedTag === null ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'
              }`}
          >
            <Text className={selectedTag === null ? 'text-white' : 'text-black dark:text-white'}>
              All
            </Text>
          </Pressable>
          {uniqueTags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => setSelectedTag(tag)}
              className={`mr-2 px-4 py-2 rounded-full ${selectedTag === tag ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-700'
                }`}
            >
              <Text className={`${selectedTag === tag ? 'text-white' : 'text-black dark:text-white'
                }`}>
                {tag}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList 
        data={filteredAndSortedNotes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            <Image
              source={require('../../assets/images/empty-note.png')}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
            <Text className="dark:text-white text-lg mt-4">No notes found</Text>
          </View>
        )}
      />

      <FloatingButton onPress={() => setModalVisible(true)} />

      <MyModal
        visible={modalVisible}
        onClose={closeModal}
        input={input}
        setInput={setInput}
        tag={tag}
        setTag={setTag}
        editMode={false}
        addNote={handleAddNote}
        editNote={() => { }}
      />

      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState(prev => ({ ...prev, visible: false }))}
        type={alertState.type}
      />
    </View>
  );
}

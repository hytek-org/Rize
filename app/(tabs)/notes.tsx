import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, Image, TextInput, useColorScheme } from 'react-native';
import { TabCreateIcon, TabTaskIcon } from '@/components/navigation/TabBarIcon';
import MyModal from '@/components/MyModel';
import FloatingButton from '@/components/FlotingButton';
import { ExternalLink } from '@/components/ExternalLink';
import { useNotes } from '@/contexts/NotesContext';
import CustomAlert from '@/components/CustomAlert';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Link } from 'expo-router';


export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? 'white' : 'black';
  const { notes, addNote,  } = useNotes();
  const [input, setInput] = useState('');
  const [tag, setTag] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // CustomAlert state management
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info' | 'warning'>('error');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  interface Note {
    id: string;
    contentPreview: string;
    content: string;
    tag: string;
    date: string;
  }



  const handleAddNote = () => {
    if (!input.trim()) {
      setAlertTitle('Error');
      setAlertMessage('Note cannot be empty.');
      setAlertType('error');
      setAlertVisible(true);
      return;
    }
    addNote(input, tag);
    setInput('');
    setModalVisible(false);
    setAlertTitle('Success');
    setAlertMessage('Note added successfully!');
    setAlertType('success');
    setAlertVisible(true);
  };

 

  const closeModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setEditNoteId(null);
    setInput('');
    setTag('');
  };

  // Filtered notes based on search query and selected tag
  const filteredNotes = notes.filter((note) => {
    const matchesSearchQuery = note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTagFilter = selectedTag ? note.tag === selectedTag : true;
    return matchesSearchQuery && matchesTagFilter;
  });

  // Extract all unique tags from the notes for filtering purposes
  const uniqueTags = Array.from(new Set(notes.map((note) => note.tag)));

  return (
    <View className="grid grid-cols-1 xl:grid-cols-2">
      <View className="bg-slate-200 dark:bg-neutral-900 xl:pb-20 h-screen pb-10 xl:h-[100vh]">
        <Text className="text-4xl ml-4 mt-12 text-zinc-800 font-bold dark:text-zinc-50 mb-4">View Notes</Text>

        {/* Search Bar */}
        <View className="flex flex-row items-center mx-4 mb-4">
          <TextInput
            className="border rounded-full px-4 py-2 w-full text-xl font-medium dark:bg-white"
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tag Filter Dropdown */}
        <View className="flex flex-row items-center mx-4 mb-4 overflow-x-scroll z-50">
          <Pressable className='mr-4' onPress={() => setSelectedTag(null)}><Text> {selectedTag ? <IconSymbol size={28} name="filter-list-off" color={color} /> : <IconSymbol size={28} name="filter-list" color={color} />}</Text></Pressable>

          <ScrollView horizontal
            showsHorizontalScrollIndicator={false}  // Hide horizontal scroll indicator
            contentContainerStyle={{
              paddingVertical: 2,  // Add vertical padding for better spacing
              flexDirection: 'row',
              gap: 5  // Ensure tags are laid out horizontally
            }} >
            {uniqueTags.map((tagOption) => (
              <Pressable
                key={tagOption}
                onPress={() => setSelectedTag(tagOption)}
                className={`border rounded-md px-4 py-2 ${selectedTag === tagOption ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                <Text className={`text-lg ${selectedTag === tagOption ? 'text-white' : 'text-black'}`}>
                  {tagOption}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Notes List */}
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex flex-col bg-white dark:bg-neutral-800 border rounded mx-2 mb-4 py-4">
              <View className="flex flex-row justify-between">
                <Text className="text-lg ml-2 dark:text-white">
                  <TabCreateIcon name={'tago'} size={16} /> {item.tag ? item.tag : 'Default'}
                </Text>
                <View className="flex flex-row rounded-lg bg-neutral-100 border border-neutral-700 dark:bg-neutral-700 py-1 sm:py-2 mr-2">

                  <Link href={{
                    pathname: '/notesdetails/[id]',
                    params: { id: item.id },
                  }} className='text-xl text-white'>View</Link>
                </View>
              </View>
              <ScrollView>
                <Text selectable={true} className="dark:text-white text-xl ml-4 font-medium xl:text-2xl">{item.contentPreview}</Text>
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
          editNote={() => {}}
        />
      </View>

      {/* Display Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        type={alertType}
      />
    </View>
  );
}

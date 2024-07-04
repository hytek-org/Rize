import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  Platform,

  useColorScheme
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabCreateIcon } from "@/components/navigation/TabBarIcon";
import { TabProfileIcon } from "@/components/navigation/TabBarIcon";
import MyModal from "@/components/MyModel";
import FloatingButton from "@/components/FlotingButton";

interface Note {
  id: string;
  content: string;
  tag: string;
  date: string;
}

export default function TabTwoScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [tag, setTag] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const formatDateToIndian = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const now = new Date();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem("@notes");
        if (storedNotes) {
          const parsedNotes: Note[] = JSON.parse(storedNotes);
          // Sort notes by date in descending order (latest first)
          const sortedNotes = parsedNotes.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setNotes(sortedNotes);
        }
      } catch (error) {
        console.error("Failed to load notes:", error);
      }
    };

    loadNotes();
  }, []);

  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem("@notes", JSON.stringify(newNotes));
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  };

  const addNote = () => {
    if (input.trim().length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Error: Note cannot be empty.');
      } else {
        Alert.alert('Error', 'Note cannot be empty.');
      }
      return;
    }


    const newNote: Note = {
      id: Date.now().toString(),
      content: input,
      tag: tag,
      date: formatDateToIndian(now)
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);

    setInput("");
  };

  const editNote = () => {
    if (input.trim().length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Error: Note cannot be empty.');
      } else {
        Alert.alert('Error', 'Note cannot be empty.');
      }

      return;
    }

    const updatedNotes = notes.map(
      note =>
        note.id === editNoteId
          ? { ...note, content: input, tag: tag, date: formatDateToIndian(now) }
          : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setInput("");
    setEditMode(false);
    setEditNoteId(null);
    setModalVisible(false);
  };

  const startEditingNote = (note: Note) => {
    setTag(note.tag || 'Default');
    setInput(note.content);
    setEditMode(true);
    setEditNoteId(note.id);
    setModalVisible(true);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };
  const openModal = () => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      setModalVisible(true);
    } else {
      Alert.alert('This feature is only available on mobile devices.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditMode(false); // Reset edit mode when modal is closed
    setEditNoteId(null); // Reset edit note ID when modal is closed
    setInput(""); // Clear input when modal is closed
    setTag(""); // Clear tag when modal is closed
  };
  return (
    <View className="grid grid-cols-1 xl:grid-cols-2 ">
      <View className="bg-slate-200 dark:bg-neutral-900 xl:pb-20 text-white  h-screen pb-10 xl:h-[100vh]  ">
        <Text className="text-4xl ml-4 mt-10 text-zinc-800 font-bold dark:text-zinc-50 mb-4">
          View Notes
        </Text>
        <FlatList
          data={notes}
          keyExtractor={item => item.id}
          renderItem={({ item }) =>
            <View className="flex flex-col bg-white dark:bg-neutral-800 border rounded mx-2 mb-4 py-4">
              <View className="flex flex-row justify-between  ">
                <Text className="text-lg ml-2 dark:text-white "> <TabCreateIcon className="mr-2" name={"tago"} size={16} /> {item.tag ? item.tag : 'Default'}</Text>
                <View className="flex flex-row rounded-lg border border-gray-100 bg-gray-100 py-1 sm:py-2 mr-2">
                  <Pressable
                    className=" rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-700 focus:relative"
                    onPress={() => startEditingNote(item)}
                  >
                    <TabProfileIcon name={"edit"} />
                  </Pressable>
                  <Pressable
                    className=" rounded bg-white  px-4 py-2 text-sm text-blue-500 shadow-sm focus:relative"
                    onPress={() => deleteNote(item.id)}
                  >
                    <TabCreateIcon name={"delete"} />
                  </Pressable>
                </View>
              </View>
              <View>
                <Text className="dark:text-white text-xl ml-4 font-medium xl:text-2xl">
                  {item.content}
                </Text>
              </View>
              <View>
                <Text className="dark:text-white ml-4 text-xs">
                  Note added on {item.date}
                </Text>
              </View>
            </View>}
        />
      </View>

      <View className="hidden sm:block bg-gray-100 dark:bg-zinc-900 h-1/4 xl:h-full">
        <View className="h-32 sm:h-fit">
          <TextInput
            value={tag}
            maxLength={15}
            onChangeText={setTag}
            placeholder="Enter a new Label"
            placeholderTextColor={colorScheme === "dark" ? "#fff" : "#b2aeae"}
            className="xl:mt-20 p-2  dark:text-white  dark:bg-gray-700  border mx-2 my-2 rounded-lg text-lg xl:text-2xl px-2"
          />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Enter a new note"
            multiline={true}
            numberOfLines={3}
            placeholderTextColor={colorScheme === "dark" ? "#fff" : "#b2aeae"}
            className="xl:p-4 xl:py-10  dark:text-white  dark:bg-gray-700  border mx-2 my-2 rounded-lg text-lg xl:text-2xl px-2"
          />
        </View>
        <View className="w-52 mx-auto mt-4">
          <Pressable
            className=" flex flex-row w-full text-center justify-center items-center   rounded-lg shadow-xl hover:shadow-white/50 space-x-2 bg-yellow-400 px-4 py-2"
            onPress={editMode ? editNote : addNote}
          >
            <TabCreateIcon name={"pluscircleo"} />
            <Text className="text-xl font-medium ">
              {editMode ? "Update Note" : "Add Note"}
            </Text>
          </Pressable>
        </View>
      </View>
      <View className=" sm:hidden">
        <FloatingButton onPress={openModal}  />
        <MyModal
          visible={modalVisible}
          onClose={closeModal}
          input={input}
          setInput={setInput}
          tag={tag}
          setTag={setTag}
          editMode={editMode}
          addNote={addNote}
          editNote={editNote}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10
  },
  button: {
    backgroundColor: "#4CAF50", // Button background color
    padding: 10,
    alignItems: "center",
    borderRadius: 5, // Rounded corners
    marginTop: 10,
    width: 150
  },
  buttonText: {
    color: "white", // Text color
    fontSize: 16,
    fontWeight: "bold"
  },
  modalButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
});

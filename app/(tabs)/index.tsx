import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, useColorScheme, FlatList, StyleSheet, Modal, Pressable, ScrollView, SafeAreaView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabProfileIcon } from "@/components/navigation/TabBarIcon";
import { Link } from 'expo-router';
import TimeBlock from '@/components/TimeBlock';
import MyModal from '@/components/MyModel';
import FloatingButton from '@/components/FlotingButton';
import { useNotes } from '@/contexts/NotesContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import CustomAlert from '@/components/CustomAlert';
import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
interface Task {
  id: number;
  content: string;
  time: string;
}

const TASKS_KEY = "dailyTasks";

const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [latestTasks, setLatestTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const colorScheme = useColorScheme();
  const { notes, addNote } = useNotes();
  const [input, setInput] = useState('');
  const [tag, setTag] = useState('');
  const [modalVisibleNotes, setModalVisibleNotes] = useState(false);
  const { togglePlayPause, skipForward, skipBackward, isPlaying, currentUrl } = useAudioPlayer();
  const closeModal = () => {
    setModalVisibleNotes(false);
    setInput('');
    setTag('');
  };
  // CustomAlert state management
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info' | 'warning'>('error');

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
    setModalVisibleNotes(false);
    setAlertTitle('Success');
    setAlertMessage('Note added successfully!');
    setAlertType('success');
    setAlertVisible(true);
  };

  useEffect(() => {
    const fetchLatestTasks = async () => {
      try {
        const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
        if (tasksJson) {
          const tasks: Task[] = JSON.parse(tasksJson);

          const currentHour = new Date().getHours();
          const previousHour = (currentHour - 1 + 24) % 24;
          const nextHour = (currentHour + 1) % 24;

          const filteredTasks = tasks.filter(task => {
            const taskHour = parseInt(task.time, 10);
            return taskHour === previousHour || taskHour === currentHour || taskHour === nextHour;
          });
          setTasks(tasks);
          setLatestTasks(filteredTasks);
        } else {
          setLatestTasks([
            { id: 1, content: "... .... .... ....", time: "00" },
            { id: 2, content: "... .... .... ....", time: "01" },
            { id: 3, content: "... .... .... ....", time: "02" },
          ]);
        }
      } catch (error) {
        console.error('Error fetching latest tasks:', error);
      }
    };

    fetchLatestTasks();
  }, [latestTasks]);

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setEditedContent(task.content);
    setModalVisible(true);
  };

  const saveEditedTask = async () => {
    if (selectedTask) {
      const updatedTasks = tasks.map(task =>
        task.id === selectedTask.id ? { ...task, content: editedContent } : task
      );
      setTasks(updatedTasks);
      setLatestTasks(updatedTasks.filter(task => {
        const taskHour = parseInt(task.time, 10);
        const currentHour = new Date().getHours();
        const previousHour = (currentHour - 1 + 24) % 24;
        const nextHour = (currentHour + 1) % 24;
        return taskHour === previousHour || taskHour === currentHour || taskHour === nextHour;
      }));
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
      setModalVisible(false);
      setAlertTitle('Success');
      setAlertMessage('Task updated successfully!');
      setAlertType('success');
      setAlertVisible(true);
    }
  };

  const now: Date = new Date();
  const currentHour: number = now.getHours();
  const currentHourString: string = now.getHours().toString().padStart(2, '0');
  const prevHour: string = ((currentHour - 1 + 24) % 24).toString().padStart(2, '0');
  const nextHour: string = ((currentHour + 1) % 24).toString().padStart(2, '0');

  function convertHourTo12HourFormat(hourStr: string): string {
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const twelveHour = hour % 12 || 12;
    return `${twelveHour} ${period}`;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={latestTasks}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={true}
        ListHeaderComponent={() => (
          <View>
            <Text className='text-2xl sm:text-4xl pt-12 pb-4 text-center dark:text-neutral-100'>
              Manage Tasks
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View
            className={`bg-white border border-t-4  ${item.time === currentHourString
              ? "border-t-green-600 dark:border-t-green-500"
              : " "}
              ${item.time == nextHour
                ? "border-t-red-600 dark:border-t-red-500"
                : " "}  ${item.time == prevHour
                  ? "border-t-yellow-600 dark:border-t-yellow-500"
                  : " "}
            shadow-sm rounded-[32px] dark:bg-neutral-900 dark:shadow-neutral-700/70
            mb-5 px-4 py-4 mx-4`}
          >
            <View className="flex flex-row justify-between">
              <Text className="text-xs sm:text-sm text-gray-800 dark:text-white">
                {convertHourTo12HourFormat(item.time)}
              </Text>
              {(item.time == currentHourString || item.time == nextHour) && (
                <Pressable onPress={() => openModal(item)}>
                  <TabProfileIcon name="edit" className="dark:text-white" />
                </Pressable>
              )}
            </View>
            <View className="p-2 md:p-5 ">
              <Text className="text-base font-semibold text-gray-800 dark:text-white">
                {item.content}
              </Text>
            </View>
            <View className='pr-8'>
              <TimeBlock item={item} currentHourString={currentHourString} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-between  pt-32">
            <Image
              source={require("../../assets/images/icon.png")}
              className="rounded-xl w-32 h-32 mb-10"
            />
            <ThemedText type="title" >No Template </ThemedText>
            <ThemedText type="subtitle">Select a template to continue</ThemedText>
            <Link href={'/(tabs)/create'} className="py-3 mt-2  px-4 bg-green-600 mx-auto rounded-full ">
              <Text className="text-white text-lg font-medium">Select Template</Text>
            </Link>
          </View>
        )}
      />

      {/* Floating Button */}
      <View className=' '>
        <View className="flex flex-row items-start justify-start  ">
          {isPlaying !== null && isPlaying ? (
            <View className="flex flex-row gap-2 pb-10 ml-5">
              <Pressable
                onPress={skipBackward}
                className="bg-blue-500 text-white py-2 px-4 rounded-full dark:bg-blue-700 dark:text-white"
              >
                <IconSymbol size={28} color={'white'} name="replay-30" />
              </Pressable>

              <Pressable
                onPress={togglePlayPause}
                className="bg-green-500 text-white py-2 px-4 rounded-full dark:bg-green-600 dark:text-white"
              >

                <IconSymbol color={'white'} size={28} name="pause" />
              </Pressable>

              <Pressable
                onPress={skipForward}
                className="bg-blue-500 text-white py-2 px-4 rounded-full dark:bg-blue-700 dark:text-white"
              >
                <IconSymbol size={28} color={'white'} name="forward-30" />
              </Pressable>
            </View>
          ) : isPlaying === false && currentUrl !== null ? (
            // If audio is not playing and there is a valid URL, show the Play button
            <View className='pb-10 ml-5'>
              <Pressable
                onPress={togglePlayPause}
                className="bg-green-500 text-white py-2 px-4 rounded-full dark:bg-green-600 dark:text-white"
              >
                <IconSymbol size={28} color={'white'} name="play-arrow" />
              </Pressable>
            </View>
          ) : <Link className='rounded-full p-4 mb-8 ml-4 bg-[#0aaf1d] inline w-16' href={'/podcast'}>
            <IconSymbol size={28} name="podcasts" color={'white'} />
          </Link>}
        </View>

        <FloatingButton
          iconName='edit'
          onPress={() => setModalVisibleNotes(true)}
        />
      </View>


      {/* Modal for Notes */}
      <MyModal
        visible={modalVisibleNotes}
        onClose={closeModal}
        input={input}
        setInput={setInput}
        tag={tag}
        setTag={setTag}
        addNote={handleAddNote}
      />

      {/* Modal for Task Editing */}
      {selectedTask && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={colorScheme === "dark" ? stylesDark.modalContainer : styles.modalContainer}
          >
            <Text
              style={colorScheme === "dark" ? stylesDark.modalTitle : styles.modalTitle}
            >
              Edit Task
            </Text>
            <TextInput
              style={[
                colorScheme === "dark" ? stylesDark.modalInput : styles.modalInput,
                { height: 100, textAlignVertical: 'top' }, // Ensure textarea-like behavior
              ]}
              maxLength={200}
              multiline
              value={editedContent}
              onChangeText={setEditedContent}
            />

            <Pressable
              onPress={saveEditedTask}
              className='bg-green-500 py-4  rounded-full w-full'
            >
              <Text className='text-center text-xl text-white font-semibold'>Save</Text>
            </Pressable>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text className="text-xl text-center p-2 font-medium dark:text-white">Cancel</Text>
            </Pressable>
          </View>
        </Modal>
      )}
      {/* Display Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        type={alertType}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20
  },
});

const stylesDark = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff"
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    color: "#fff"
  },
});

export default HomeScreen;

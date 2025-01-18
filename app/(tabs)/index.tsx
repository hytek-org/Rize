import React, { useEffect, useState } from 'react';
import { View, Text, useColorScheme, FlatList, Pressable, SafeAreaView, Image } from 'react-native';
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
import { ThemedText } from '@/components/ThemedText';

interface Routine {
  id: number;
  content: string;
  time: string;
}

const ROUTINES_KEY = "dailyRoutines";

const HomeScreen = () => {
  const [tasks, setTasks] = useState<Routine[]>([]);
  const [latestTasks, setLatestTasks] = useState<Routine[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Routine | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const colorScheme = useColorScheme();
  const { notes, addNote } = useNotes();
  const [input, setInput] = useState('');
  const [tag, setTag] = useState('');
  const [modalVisibleNotes, setModalVisibleNotes] = useState(false);
  const { togglePlayPause, skipForward, skipBackward, isPlaying, currentUrl, albumArt } = useAudioPlayer();
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
        const tasksJson = await AsyncStorage.getItem(ROUTINES_KEY);
        if (tasksJson) {
          const tasks: Routine[] = JSON.parse(tasksJson);

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

  const openModal = (task: Routine) => {
    setSelectedTask(task);
    setEditedContent(task.content);
    setModalVisible(true);
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
              Manage Routines
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
                <Pressable >
                  <TabProfileIcon name="plus-circle" className="dark:text-white" />
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


      <FloatingButton
        iconName='edit'
        onPress={() => setModalVisibleNotes(true)}
      />

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



export default HomeScreen;

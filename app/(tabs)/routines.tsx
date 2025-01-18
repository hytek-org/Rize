import React, { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, Image, useColorScheme } from "react-native";
import { TabProfileIcon, TabTaskIcon } from "@/components/navigation/TabBarIcon";
import { useTemplateContext } from "@/contexts/TemplateContext";
import { ThemedText } from "@/components/ThemedText";
import { Link } from "expo-router";
import CustomAlert from '@/components/CustomAlert';
import RoutineModal from '@/components/RoutineModal';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalEmitter } from '@/utils/eventEmitter';

interface Routine {
  id: number;
  content: string;
  time: string;
}

interface HistoryItem {
  date: string;
  routines: Routine[];
}

const DAILY_TASKS_STORAGE_KEY = "dailyRoutines";
const LAST_DATE_KEY = "lastDate";

export default function RoutinesScreen() {
  const { activeTemplateId, loading } = useTemplateContext(); 
  const [dailyTasks, setDailyTasks] = useState<Routine[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Routine | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = useState("morning");
  // CustomAlert state management
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info' | 'warning'>('error');
  // Load daily tasks from AsyncStorage when the app initializes
  useEffect(() => {
    // Listen for template changes
    const unsubscribe = globalEmitter.on('TEMPLATE_CHANGED', (newTasks: Routine[]) => {
      setDailyTasks(newTasks);
    });

    // Load initial tasks
    const loadDailyTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem(DAILY_TASKS_STORAGE_KEY);
        if (storedTasks) {
          setDailyTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Failed to load daily tasks", error);
        setAlertTitle('Error');
        setAlertMessage('Failed to load tasks.');
        setAlertType('error');
        setAlertVisible(true);
      
      }
    };

    loadDailyTasks();

    // Cleanup subscription
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save daily tasks to AsyncStorage whenever they change
  useEffect(() => {
    const saveDailyTasks = async () => {
      try {
        await AsyncStorage.setItem(DAILY_TASKS_STORAGE_KEY, JSON.stringify(dailyTasks));
      } catch (error) {
        console.error("Failed to save daily tasks", error);
        setAlertTitle('Error');
        setAlertMessage('Failed to save tasks.');
        setAlertType('error');
        setAlertVisible(true);
      }
    };

    saveDailyTasks();
  }, [dailyTasks]);

  const openModal = (task: Routine) => {
    setSelectedTask(task);
    setEditedContent(task.content);
    setModalVisible(true);
  };

  const saveEditedTask = async () => {
    if (!selectedTask) return;

    try {
      const updatedTasks = dailyTasks.map((task) =>
        task.id === selectedTask.id ? { ...task, content: editedContent } : task
      );
      
      setDailyTasks(updatedTasks);
      await AsyncStorage.setItem(DAILY_TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      setModalVisible(false);
      setAlertTitle('Success');
      setAlertMessage('Routine updated successfully!');
      setAlertType('success');
      setAlertVisible(true);
    } catch (error) {
      setAlertTitle('Error');
      setAlertMessage('Failed to update routine');
      setAlertType('error');
      setAlertVisible(true);
    }
  };

  const saveHistory = async (history: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem("history", JSON.stringify(history));
    } catch (error) {
      console.error(error);
    }
  };

  const checkDayEnd = () => {
    const currentDate = new Date().toLocaleDateString();
    AsyncStorage.getItem(LAST_DATE_KEY).then((lastDate) => {
      if (lastDate !== currentDate) {
        moveTasksToHistory();
        AsyncStorage.setItem(LAST_DATE_KEY, currentDate);
      }
    });
  };

  const moveTasksToHistory = async () => {
    const newHistory = [...history, { date: new Date().toLocaleDateString(), routines: dailyTasks }];
    setHistory(newHistory);
    await saveHistory(newHistory);
  };

  const convertHourTo12HourFormat = (hourStr: string): string => {
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12;
    return `${twelveHour} ${period}`;
  };

  const renderItem = ({ item }: { item: Routine }) => {
    const currentHourString = new Date().getHours().toString().padStart(2, "0");
    const isCurrentHour = item.time === currentHourString;

    return (
      <Pressable 
        onPress={() => openModal(item)}
        className={`bg-white dark:bg-neutral-900 border border-l-4 
          ${isCurrentHour ? "border-l-green-600" : "border-l-neutral-300 dark:border-l-neutral-700"}
          rounded-xl mx-4 mb-4 shadow-sm overflow-hidden`}
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-800 dark:text-gray-200">
              {convertHourTo12HourFormat(item.time)}
            </Text>
            <TabProfileIcon 
              name="edit" 
              size={20}
              color={colorScheme === 'dark' ? '#fff' : '#000'} 
            />
          </View>
          
          <Text className="text-base text-gray-800 dark:text-white">
            {item.content}
          </Text>
        </View>
      </Pressable>
    );
  };

  const firstHalf = dailyTasks.slice(0, 12);
  const secondHalf = dailyTasks.slice(12, 24);

  return (
    <View className="flex-1  bg-gray-50 dark:bg-black ">
      <Text className="dark:text-white text-4xl text-center pt-10 pb-2">Daily Routines</Text>
      <View className="flex flex-col md:flex-row">
        <View className="flex flex-row justify-center items-center mb-4 md:w-1/4 md:flex-col">
          <Pressable
            className={`inline-flex flex-row gap-2 p-2 px-4 rounded-full justify-center items-center ${selectedTab == "morning" ? "bg-[#0c891b]" : "bg-transparent dark:border-white"
              }`}
            onPress={() => setSelectedTab("morning")}
          >
            <TabTaskIcon name="wb-sunny" className={selectedTab == "morning" ? "text-white" : "dark:text-white"} />
            <Text className={selectedTab == "morning" ? "text-white" : "dark:text-white"}>Morning</Text>
          </Pressable>
          <Pressable
            className={`inline-flex flex-row gap-2 p-2 px-4 rounded-full justify-center items-center ${selectedTab == "afternoon" ? "bg-[#0c891b]" : "bg-transparent dark:border-white"
              }`}
            onPress={() => setSelectedTab("afternoon")}
          >
            <TabTaskIcon name="nights-stay" className={selectedTab == "afternoon" ? "text-white" : "dark:text-white"} />
            <Text className={selectedTab == "afternoon" ? "text-white" : "dark:text-white"}>Afternoon</Text>
          </Pressable>
        </View>

        <View className=" pb-60 md:w-3/4 ">
          <FlatList
            data={selectedTab === "morning" ? firstHalf : secondHalf}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <View className="flex flex-col items-center justify-between h-full pt-32">
                <Image
                  source={require("../../assets/images/icon.png")}
                  className="rounded-xl w-52 h-56 mb-10"
                />
                <ThemedText type="title" >No Template </ThemedText>
                <ThemedText type="subtitle">Select a template to continue</ThemedText>
                <Link href={'/(tabs)/create'} className="py-6">
                  <View className="py-3 px-4 bg-green-600 rounded-full flex items-center">
                    <Text className="text-white text-lg font-medium">Select Template</Text>
                  </View>
                </Link>
              </View>
            }
          />
        </View>
      </View>

      <RoutineModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        content={editedContent}
        setContent={setEditedContent}
        onSave={saveEditedTask}
        time={selectedTask?.time || "00"}
      />

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

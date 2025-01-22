import React, { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, Image, useColorScheme, Alert } from "react-native";
import { TabProfileIcon, TabTaskIcon } from "@/components/navigation/TabBarIcon";
import { useTemplateContext } from "@/contexts/TemplateContext";
import { ThemedText } from "@/components/ThemedText";
import { Link } from "expo-router";
import CustomAlert from '@/components/CustomAlert';
import RoutineModal from '@/components/RoutineModal';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalEmitter } from '@/utils/eventEmitter';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TaskItem } from '@/components/tasks/TaskItem';

interface SubTask {
  id: string;
  content: string;
  completed: boolean;
}

interface Routine {
  id: number;
  content: string;
  time: string;
  subtasks?: SubTask[];
}

interface HistoryItem {
  date: string;
  routines: Routine[];
}

const DAILY_TASKS_STORAGE_KEY = "dailyRoutines";
const LAST_DATE_KEY = "lastDate";

export default function RoutinesScreen() {
  const { dailyTasks: contextDailyTasks, loading, updateSubtask, addSubtask, removeSubtask } = useTemplateContext(); 
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

  const saveEditedTask = async () => {
    if (!selectedTask) return;

    try {
      const updatedTasks = contextDailyTasks.map((task) =>
        task.id === selectedTask.id ? 
          { 
            ...task, 
            content: editedContent,
            subtasks: task.subtasks || [] 
          } : task
      );
      
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
    const newHistory = [...history, { date: new Date().toLocaleDateString(), routines: contextDailyTasks }];
    setHistory(newHistory);
    await saveHistory(newHistory);
  };

  const convertHourTo12HourFormat = (hourStr: string): string => {
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12;
    return `${twelveHour} ${period}`;
  };

  const renderSubtasks = (task: Routine) => {
    if (!task.subtasks?.length) return null;

    return (
      <View className="mt-2 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
        {task.subtasks.map((subtask) => (
          <View key={subtask.id} className="flex-row items-center justify-between py-2">
            <Pressable 
              className="flex-row items-center flex-1"
              onPress={() => updateSubtask(task.id, subtask.id, !subtask.completed)}
            >
              <IconSymbol 
                name={subtask.completed ? "check-circle" : "radio-button-unchecked"} 
                size={20} 
                color={subtask.completed ? '#22c55e' : '#71717a'} 
              />
              <Text className={`ml-2 flex-1 ${subtask.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                {subtask.content}
              </Text>
            </Pressable>
            <Pressable 
              onPress={() => removeSubtask(task.id, subtask.id)}
              className="p-2"
            >
              <IconSymbol name="close" size={20} color="#ef4444" />
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Routine }) => {
    const currentHourString = new Date().getHours().toString().padStart(2, "0");
    const isCurrentHour = item.time === currentHourString;

    return (
      <TaskItem
        task={item}
        isCurrentHour={isCurrentHour}
        onEdit={() => {
          setSelectedTask(item);
          setEditedContent(item.content);
          setModalVisible(true);
        }}
      />
    );
  };

  const firstHalf = contextDailyTasks.slice(0, 12);
  const secondHalf = contextDailyTasks.slice(12, 24);

  return (
    <View className="flex-1  bg-gray-50 dark:bg-black ">
      <Text className="dark:text-white text-4xl text-center pt-10 pb-2">Daily Routines</Text>
      
      {/* Tab Buttons */}
      <View className="flex-row justify-center space-x-4 mb-4">
        {["morning", "afternoon"].map((tab) => (
          <Pressable
            key={tab}
            className={`px-4 py-2 rounded-full flex-row items-center space-x-2
              ${selectedTab === tab ? "bg-green-600" : "bg-transparent"}`}
            onPress={() => setSelectedTab(tab)}
          >
            <TabTaskIcon 
              name={tab === "morning" ? "wb-sunny" : "nights-stay"} 
              className={selectedTab === tab ? "text-white" : "dark:text-white"} 
            />
            <Text className={selectedTab === tab ? "text-white" : "dark:text-white"}>
              {tab === "morning" ? "Morning" : "Afternoon"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={selectedTab === "morning" ? firstHalf : secondHalf}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        className="pb-32"
        ListEmptyComponent={
          <View className="flex flex-col items-center justify-between h-full pt-32">
            <Image
              source={require("../../assets/images/icon.png")}
              className="rounded-xl w-52 h-56 mb-10"
            />
            <ThemedText type="title" >No Routine </ThemedText>
            <ThemedText type="subtitle">Select a routine to continue</ThemedText>
            <Link href={'/(tabs)/create'} className="py-6">
              <View className="py-3 px-4 bg-green-600 rounded-full flex items-center">
                <Text className="text-white text-lg font-medium">Select Routine Template</Text>
              </View>
            </Link>
          </View>
        }
      />

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

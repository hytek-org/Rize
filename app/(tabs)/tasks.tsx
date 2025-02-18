import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Image,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TabTaskIcon } from "@/components/navigation/TabBarIcon";
import { useTemplateContext } from "@/contexts/TemplateContext";
import { ThemedText } from "@/components/ThemedText";
import { Link } from "expo-router";
import CustomAlert from "@/components/CustomAlert";
import RoutineModal from "@/components/RoutineModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { TaskItem } from "@/components/tasks/TaskItem";

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
  const {
    dailyTasks: contextDailyTasks,
    updateRoutine,
    updateSubtask,
    removeSubtask,
  } = useTemplateContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Routine | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = useState("morning");

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success" | "info" | "warning">("error");

  useEffect(() => {
    checkDayEnd();
  }, []);

  const saveEditedTask = async () => {
    if (!selectedTask) return;

    try {
      await updateRoutine(selectedTask.id, editedContent);
      setModalVisible(false);
      setSelectedTask(null);
      showAlert("Success", "Task updated successfully!", "success");
    } catch (error) {
      showAlert("Error", "Failed to update task", "error");
    }
  };

  const showAlert = (title: string, message: string, type: "error" | "success" | "info" | "warning") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const saveHistory = async (history: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem("history", JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  };

  const checkDayEnd = async () => {
    const currentDate = new Date().toLocaleDateString();
    try {
      const lastDate = await AsyncStorage.getItem(LAST_DATE_KEY);
      if (lastDate !== currentDate) {
        moveTasksToHistory();
        await AsyncStorage.setItem(LAST_DATE_KEY, currentDate);
      }
    } catch (error) {
      console.error("Error checking day end:", error);
    }
  };

  const moveTasksToHistory = async () => {
    const newHistory = [...history, { date: new Date().toLocaleDateString(), routines: contextDailyTasks }];
    setHistory(newHistory);
    await saveHistory(newHistory);
  };

  const renderItem = ({ item }: { item: Routine }) => {
    const isCurrentHour = item.time === new Date().getHours().toString().padStart(2, "0");

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
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <Text className="dark:text-white text-4xl text-center pt-10 pb-2">Daily Routines</Text>

      {/* Tab Buttons */}
      <View className="flex-row justify-center space-x-4 mb-4">
        {["morning", "afternoon"].map((tab) => (
          <Pressable
            key={tab}
            className={`px-4 py-2 rounded-full flex-row items-center space-x-2 ${
              selectedTab === tab ? "bg-green-600" : "bg-transparent"
            }`}
            onPress={() => setSelectedTab(tab)}
          >
            <TabTaskIcon name={tab === "morning" ? "wb-sunny" : "nights-stay"} className={selectedTab === tab ? "text-white" : "dark:text-white"} />
            <Text className={selectedTab === tab ? "text-white" : "dark:text-white"}>
              {tab === "morning" ? "Morning" : "Afternoon"}
            </Text>
          </Pressable>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <FlatList
          data={selectedTab === "morning" ? firstHalf : secondHalf}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="flex flex-col items-center justify-between h-full pt-32">
              <Image source={require("../../assets/images/icon.png")} className="rounded-xl w-52 h-56 mb-10" />
              <ThemedText type="title">No Routine</ThemedText>
              <ThemedText type="subtitle">Select a routine to continue</ThemedText>
              <Link href={"/(tabs)/create"} className="py-6">
                <View className="py-3 px-4 bg-green-600 rounded-full flex items-center">
                  <Text className="text-white text-lg font-medium">Select Routine Template</Text>
                </View>
              </Link>
            </View>
          }
        />
      </KeyboardAvoidingView>

      {/* Routine Modal */}
      <RoutineModal 
        visible={modalVisible} 
        onClose={() => {
          setModalVisible(false);
          setSelectedTask(null);
        }} 
        content={editedContent} 
        setContent={setEditedContent} 
        onSave={saveEditedTask} 
        time={selectedTask?.time || "00"} 
      />

      {/* Custom Alert */}
      <CustomAlert visible={alertVisible} title={alertTitle} message={alertMessage} onClose={() => setAlertVisible(false)} type={alertType} />
    </View>
  );
}

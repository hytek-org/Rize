import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  useColorScheme,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabProfileIcon, TabTaskIcon } from "@/components/navigation/TabBarIcon";
import { useTemplateContext } from "@/contexts/TemplateContext";
import { ThemedText } from "@/components/ThemedText";
import { Link } from "expo-router";
import CustomAlert from '@/components/CustomAlert'; 
interface Task {
  id: number;
  content: string;
  time: string;
}

interface HistoryItem {
  date: string;
  tasks: Task[];
}

const DAILY_TASKS_STORAGE_KEY = "dailyTasks";
const LAST_DATE_KEY = "lastDate";
export default function TabTwoScreen() {
  const { activeTemplateId, loading } = useTemplateContext(); // You can add context functions if needed
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setEditedContent(task.content);
    setModalVisible(true);
  };

  const saveEditedTask = () => {
    if (!selectedTask) return;

    const updatedTasks = dailyTasks.map((task) =>
      task.id === selectedTask.id ? { ...task, content: editedContent } : task
    );
    setDailyTasks(updatedTasks);
    setModalVisible(false);
    setAlertTitle('Success');
    setAlertMessage('Tasks updated successfully!');
    setAlertType('success');
    setAlertVisible(true);
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
    const newHistory = [...history, { date: new Date().toLocaleDateString(), tasks: dailyTasks }];
    setHistory(newHistory);
    await saveHistory(newHistory);
  };

  const convertHourTo12HourFormat = (hourStr: string): string => {
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12;
    return `${twelveHour} ${period}`;
  };

  const renderItem = ({ item }: { item: Task }) => {
    const currentHourString = new Date().getHours().toString().padStart(2, "0");
    return (
      <View
        className={`bg-white border border-t-4 border-neutral-500 dark:border-neutral-700
          ${item.time === currentHourString ? "border-t-green-600 dark:border-t-green-500" : ""}
          shadow-sm rounded-[32px] dark:bg-neutral-900 mb-5 px-4 py-4 mx-4`}
      >
        <View className="flex flex-row justify-between ">
          <Text className="text-xs sm:text-sm text-gray-800 dark:text-white">
            {convertHourTo12HourFormat(item.time)}
          </Text>
          <Pressable onPress={() => openModal(item)}>
            <TabProfileIcon name="edit" className="dark:text-white" />
          </Pressable>
        </View>
        <View className="p-2 md:p-5">
          <Text className="text-base text-gray-800 dark:text-white">{item.content}</Text>
        </View>
      </View>
    );
  };

  const firstHalf = dailyTasks.slice(0, 12);
  const secondHalf = dailyTasks.slice(12, 24);

  return (
    <View>
      <Text className="dark:text-white text-4xl text-center pt-10 pb-2">Daily Tasks</Text>
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

        <View className="h-screen pb-40 md:w-3/4">
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

      {selectedTask && (
        <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={colorScheme === "dark" ? stylesDark.modalContainer : styles.modalContainer}>
            <Text style={colorScheme === "dark" ? stylesDark.modalTitle : styles.modalTitle}>Edit Task</Text>
          
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


            <Pressable onPress={saveEditedTask}
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
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
  }

});

const stylesDark = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 10,
    marginBottom: 20,
    color: "#fff",
  },

});

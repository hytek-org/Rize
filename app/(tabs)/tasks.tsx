import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
  useColorScheme
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TabProfileIcon,
  TabTaskIcon
} from "@/components/navigation/TabBarIcon";

interface Task {
  id: number;
  content: string;
  time: string;
}

interface HistoryItem {
  date: string;
  tasks: Task[];
}

const TEMPLATE_KEY = "Templates";
const TASKS_KEY = "dailyTasks";
const LAST_DATE_KEY = "lastDate";

export default function TabTwoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = useState("morning");
  useEffect(() => {
    const loadTasks = async () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        setSelectedTab("morning");
      } else {
        setSelectedTab("afternoon");
      }
      const today = new Date().toLocaleDateString();
      const lastDate = await AsyncStorage.getItem(LAST_DATE_KEY);
      if (lastDate !== today) {
        await resetTasksToTemplate();
        await AsyncStorage.setItem(LAST_DATE_KEY, today);
      } else {
        const savedTasks = await AsyncStorage.getItem(TASKS_KEY);
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          await resetTasksToTemplate();
        }
      }
    };
    loadTasks();
    checkDayEnd();
  }, []);

  const resetTasksToTemplate = async () => {
    const template = await AsyncStorage.getItem(TEMPLATE_KEY);
    if (template) {
      const parsedTemplate: Task[] = JSON.parse(template);
      setTasks(parsedTemplate);
      await AsyncStorage.setItem(TASKS_KEY, template);
    } else {
      Alert.alert("Error", "No template found");
    }
  };

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setEditedContent(task.content);
    setModalVisible(true);
  };

  const saveEditedTask = async () => {
    const newTasks = tasks.map(
      item =>
        item.id === selectedTask!.id
          ? { ...item, content: editedContent, time: item.time }
          : item
    );
    setTasks(newTasks);
    setModalVisible(false);
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));

    } catch (error) {
      console.error("Failed to save tasks to local storage", error);
      Alert.alert("Error", "Failed to save tasks");
    }
  };

  const saveHistory = async (history: HistoryItem[]) => {
    try {
      const historyJson = JSON.stringify(history);
      await AsyncStorage.setItem("history", historyJson);
    } catch (error) {
      console.error(error);
    }
  };

  const checkDayEnd = () => {
    const currentDate = new Date().toLocaleDateString();
    AsyncStorage.getItem(LAST_DATE_KEY).then(lastDate => {
      if (lastDate !== currentDate) {
        moveTasksToHistory();
        AsyncStorage.setItem(LAST_DATE_KEY, currentDate);
      }
    });
  };

  const moveTasksToHistory = async () => {
    const newHistory = [
      ...history,
      { date: new Date().toLocaleDateString(), tasks }
    ];
    setHistory(newHistory);
    await saveHistory(newHistory);
    await resetTasksToTemplate();
  };
  const now: Date = new Date();
  const currentHour: number = now.getHours();
  const currentHourString: string = now.getHours().toString().padStart(2, "0");
  const prevHour: string = ((currentHour - 1 + 24) % 24)
    .toString()
    .padStart(2, "0");
  const nextHour: string = ((currentHour + 1) % 24).toString().padStart(2, "0");
  function convertHourTo12HourFormat(hourStr: string): string {
    const hour = parseInt(hourStr, 10); // Convert the hour string to a number
    const period = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12; // Convert '0' to '12'
    return `${twelveHour} ${period}`;
  }
  const renderItem = ({ item }: { item: Task }) =>
    <View
      className={`bg-white border border-t-4 border-neutral-500 dark:border-neutral-700  ${item.time ===
        currentHourString
        ? "border-t-green-600 dark:border-t-green-500"
        : " "}
          ${item.time == nextHour
          ? "border-t-red-600 dark:border-t-red-500"
          : " "}  ${item.time == prevHour
            ? "border-t-yellow-600 dark:border-t-yellow-500"
            : " "}
      shadow-sm rounded-[32px] dark:bg-neutral-900   dark:shadow-neutral-700/70
      mb-5 px-4 py-4 mx-4`}
    >
      <View className="flex flex-row justify-between ">
        <Text className="text-xs sm:text-sm text-gray-800 dark:text-white">
          {convertHourTo12HourFormat(item.time)}
        </Text>
        {item.time == currentHourString &&
          <Pressable onPress={() => openModal(item)}>
            <TabProfileIcon name="edit" className="dark:text-white" />
          </Pressable>}
        {item.time >= nextHour &&
          <Pressable onPress={() => openModal(item)}>
            <TabProfileIcon name="edit" className="dark:text-white" />
          </Pressable>}
      </View>
      <View className="p-2 md:p-5">
        <Text className="text-base overflow-y-auto h-auto max-h-32 text-gray-800 dark:text-white">
          {item.content}
        </Text>
      </View>
    </View>;

  const firstHalf = tasks.slice(0, 12);
  const secondHalf = tasks.slice(12, 24);

  return (
    <View>
      <Text className="dark:text-white text-4xl text-center pt-10 pb-2">
        Daily Tasks
      </Text>
      <View className="flex flex-col   md:flex-row">
        <View className="flex flex-row justify-center items-center  mb-4 md:w-1/4 md:flex-col md:justify-normal ">
          <View className="flex flex-row  space-x-2 md:flex-col md:space-x-0 md:space-y-4">
            <Pressable
              className={`inline-flex flex-row space-x-2 p-2 md:py-4 rounded-lg justify-center  ${selectedTab ==
                "morning"
                ? "bg-[#0c891b]  "
                : "bg-transparent border dark:border-white hover:bg-[#0aaf1d] text-neutral-950"} `}
              onPress={() => setSelectedTab("morning")}
            >
              <TabTaskIcon
                name="wb-sunny"
                className={`${selectedTab == "morning" ? "text-white" : "dark:text-white"}`}
              />
              <Text
                className={` inline-flex text-lg font-medium ${selectedTab ==
                  "morning"
                  ? "text-white"
                  : "dark:text-white"}`}
              >
                Morning
              </Text>
              <Text
                className={`hidden  md:block text-lg font-medium ${selectedTab ==
                  "morning"
                  ? "text-white"
                  : "dark:text-white"}`}
              >
                Tasks
              </Text>
            </Pressable>
            <Pressable
              className={`inline-flex flex-row space-x-2 p-2 md:py-4 rounded-lg justify-center  ${selectedTab ==
                "afternoon"
                ? "bg-[#0c891b]  "
                : "bg-transparent border dark:border-white hover:bg-[#0aaf1d] text-neutral-950"} `}
              onPress={() => setSelectedTab("afternoon")}
            >
              <TabTaskIcon
                name="nights-stay"
                className={`${selectedTab == "afternoon" ? "text-white" : "dark:text-white"}`}
              />
              <Text
                className={` inline-flex text-lg font-medium ${selectedTab ==
                  "afternoon"
                  ? "text-white"
                  : "dark:text-white"}`}
              >
                Afternoon
              </Text>
              <Text
                className={`hidden  md:block text-lg font-medium ${selectedTab ==
                  "afternoon"
                  ? "text-white"
                  : "dark:text-white"}`}
              >
                Tasks
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="h-screen pb-40 md:pb-32 md:w-3/4 ">
          {selectedTab === "morning" &&
            <FlatList
              className="] dark:text-white"
              data={firstHalf}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
            />}
          {selectedTab === "afternoon" &&
            <FlatList
              className="dark:text-white "
              data={secondHalf}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
            />}
        </View>
      </View>
      <View>
        {selectedTask &&
          <Modal
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={
                colorScheme === "dark"
                  ? stylesDark.modalContainer
                  : styles.modalContainer
              }
            >
              <Text
                style={
                  colorScheme === "dark"
                    ? stylesDark.modalTitle
                    : styles.modalTitle
                }
              >
                Edit Task
              </Text>
              <TextInput
                style={
                  colorScheme === "dark"
                    ? stylesDark.modalInput
                    : styles.modalInput
                }
                maxLength={200}
                multiline
                className="text-xl"
                numberOfLines={3}
                value={editedContent}
                onChangeText={setEditedContent}
              />
              <Pressable
                style={
                  colorScheme === "dark"
                    ? stylesDark.modalButton
                    : styles.modalButton
                }
                onPress={saveEditedTask}
              >
                <Text
                  className="text-lg font-medium dark:text-white"
                  style={
                    colorScheme === "dark"
                      ? stylesDark.modalButtonText
                      : styles.modalButtonText
                  }
                >
                  Save
                </Text>
              </Pressable>
              <Pressable
                className="mx-auto mt-4 hover:underline"
                onPress={() => setModalVisible(false)}
              >
                <Text
                  className="text-lg hover:underline font-medium dark:text-white"
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Modal>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  modalButton: {
    backgroundColor: "#0aaf1d",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    width: 120,
    marginHorizontal: 'auto'
  },
  modalButtonText: {
    color: "#fff"
  }
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
  modalButton: {
    backgroundColor: "#0aaf1d",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    width: 120,
    marginHorizontal: 'auto'
  },
  modalButtonText: {
    color: "#fff"
  }
});

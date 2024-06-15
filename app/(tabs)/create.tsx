import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  useColorScheme
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TabProfileIcon,
  TabTaskIcon
} from "@/components/navigation/TabBarIcon";

const STORAGE_KEY = "dailyTemplate";
interface TemplateItem {
  id: number;
  content: string;
  time: string;
}
export default function TabTwoScreen() {
  const [template, setTemplate] = useState([
    { id: 1, content: "... .... .... ....", time: "00" },
    { id: 2, content: "... .... .... ....", time: "01" },
    { id: 3, content: "... .... .... ....", time: "02" },
    { id: 4, content: "... .... .... ....", time: "03" },
    { id: 5, content: "... .... .... ....", time: "04" },
    { id: 6, content: "... .... .... ....", time: "05" },
    { id: 7, content: "... .... .... ....", time: "06" },
    { id: 8, content: "... .... .... ....", time: "07" },
    { id: 9, content: "... .... .... ....", time: "08" },
    { id: 10, content: "... .... .... ....", time: "09" },
    { id: 11, content: "... .... .... ....", time: "10" },
    { id: 12, content: "... .... .... ....", time: "11" },
    { id: 13, content: "... .... .... ....", time: "12" },
    { id: 14, content: "... .... .... ....", time: "13" },
    { id: 15, content: "... .... .... ....", time: "14" },
    { id: 16, content: "... .... .... ....", time: "15" },
    { id: 17, content: "... .... .... ....", time: "16" },
    { id: 18, content: "... .... .... ....", time: "17" },
    { id: 19, content: "... .... .... ....", time: "18" },
    { id: 20, content: "... .... .... ....", time: "19" },
    { id: 21, content: "... .... .... ....", time: "20" },
    { id: 22, content: "... .... .... ....", time: "21" },
    { id: 23, content: "... .... .... ....", time: "22" },
    { id: 24, content: "... .... .... ....", time: "23" }
  ]);
  const [selectedTab, setSelectedTab] = useState("morning");
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const savedTemplate = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTemplate) {
          setTemplate(JSON.parse(savedTemplate));
        }
      } catch (error) {
        console.error("Failed to load template from local storage", error);
      }
    };
    loadTemplate();
  }, []);

  const updateTemplate = async (id: number, content: string, time: string) => {
    const newTemplate = template.map(
      item => (item.id === id ? { ...item, content, time } : item)
    );
    setTemplate(newTemplate);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplate));
    } catch (error) {
      console.error("Failed to save template to local storage", error);
      Alert.alert("Error", "Failed to save template");
    }
  };

  const saveTemplate = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(template));
      Alert.alert("Success", "Template saved successfully");
    } catch (error) {
      console.error("Failed to save template to local storage", error);
      Alert.alert("Error", "Failed to save template");
    }
  };
  const firstTwelve = template.slice(0, 12);
  const nextTwelve = template.slice(12);

  function convertHourTo12HourFormat(hourStr: string): string {
    const hour = parseInt(hourStr, 10); // Convert the hour string to a number
    const period = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12; // Convert '0' to '12'
    return `${twelveHour} ${period}`;
  }
  const renderItem = ({ item }: { item: TemplateItem }) =>
    <View
      className={`bg-white border border-t-4 
    shadow-sm rounded-[12px] dark:bg-neutral-900 dark:border-neutral-700  dark:shadow-neutral-700/70
    mb-5 px-2 py-2 sm:px-4 sm:py-4 sm:mx-4`}
    >
      <View className="flex flex-row justify-start ">
        <Text className="text-xs sm:text-sm text-gray-800 dark:text-white">
          {convertHourTo12HourFormat(item.time)}
        </Text>
      </View>
      <View className="">
        <TextInput
          className="text-base overflow-y-auto h-auto  text-gray-800 dark:text-white"
          maxLength={200}
          // value={item.content}
          multiline
          numberOfLines={3}
          onChangeText={text => updateTemplate(item.id, text, item.time)}
          placeholder="Task Name and short info"
          placeholderTextColor={colorScheme === "dark" ? "#888" : "#ccc"}
        />
      </View>
    </View>;

  return (
    <View
      style={colorScheme === "dark" ? stylesDark.container : styles.container}
    >
      <Text className="dark:text-white text-4xl text-center pt-10 pb-2 md:pt-5 md:pb-4">
        Daily Template
      </Text>
      <View className="flex flex-col  md:flex-row">
        <View className="flex flex-row justify-between mb-4 md:w-1/4 md:flex-col md:justify-start ">
          <View className="flex flex-row space-x-2 md:flex-col md:space-x-0 md:space-y-4">
            <TouchableOpacity
              className={`inline-flex flex-row space-x-2 p-2 md:py-4 rounded-lg justify-center  ${selectedTab ==
                "morning"
                  ? "bg-[#0c891b]  "
                  : "bg-transparent border dark:border-white hover:bg-[#0aaf1d] text-neutral-950"} `}
              onPress={() => setSelectedTab("morning")}
            >
              <TabTaskIcon  name="wb-sunny" className={`${selectedTab == "morning" ? "text-white":"dark:text-white"}`} />
              <Text className={`hidden  md:inline-flex  text-lg font-medium ${selectedTab == "morning" ? "text-white":""}`}>Morning</Text>
              <Text className={`hidden  md:block text-lg font-medium ${selectedTab == "morning" ? "text-white":""}`} >Tasks</Text>
        </TouchableOpacity>
            <TouchableOpacity
               className={`inline-flex flex-row space-x-2 p-2 md:py-4 rounded-lg justify-center  ${selectedTab ==
                "afternoon"
                  ? "bg-[#0c891b]  "
                  : "bg-transparent border dark:border-white hover:bg-[#0aaf1d] text-neutral-950 dark:text-white"} `}
              onPress={() => setSelectedTab("afternoon")}
            >
          <TabTaskIcon
                name="nights-stay"
                className={`${selectedTab == "afternoon" ? "text-white" : "dark:text-white"}`}
              />
              <Text
                className={` hidden md:inline-flex text-lg font-medium ${selectedTab ==
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
              </Text></TouchableOpacity>
          </View>
          <View className="md:mt-4">
            <TouchableOpacity
              className="flex flex-row space-x-2 md:w-32 lg:w-52 px-4 py-2 bg-green-500 rounded dark:text-white"
              onPress={saveTemplate}
            >
              <TabProfileIcon name="save" className="text-neutral-50  dark:text-white" />
              <Text className="text-xl font-medium text-neutral-50 dark:text-white">Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-screen pb-52 md:pb-32 md:w-3/4 ">
          {selectedTab === "morning" &&
            <FlatList
              data={firstTwelve}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={true}
              renderItem={renderItem}
            />}
          {selectedTab === "afternoon" &&
            <FlatList
              data={nextTwelve}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={true}
              renderItem={renderItem}
            />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#2196F3"
  },
  tab: {
    paddingVertical: 10
  },
  selectedTab: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "white"
  },
  tabText: {
    color: "white",
    fontSize: 18
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000"
  },
  templateItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  hour: {
    width: 50,
    fontSize: 16,
    color: "#000"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    flex: 1,
    borderRadius: 5,
    color: "#000"
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: 16
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10
  }
});

const stylesDark = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff"
  },
  templateItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  hour: {
    width: 50,
    fontSize: 16,
    color: "#fff"
  },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 5,
    flex: 1,
    borderRadius: 5,
    color: "#fff"
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#1e90ff",
    borderRadius: 5,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: 16
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10
  }
});

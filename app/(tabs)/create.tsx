import Ionicons from "@expo/vector-icons/Ionicons";
import {
  StyleSheet,
  Image,
  Platform,
  useColorScheme,
  View,
  Text,
  ScrollView,
  Alert,
  Pressable
} from "react-native";
import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import FloatingLink from "@/components/FlotingLink";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { TabTaskIcon } from "@/components/navigation/TabBarIcon";
import { Link } from "expo-router";
import NotificationScheduler from "@/components/NotificationScheduler";

const STORAGE_KEY = "Templates";
const TASKS_KEY = "dailyTasks";
const TASKS_KEY_ID = "dailyTasksid";

interface TemplateItem {
  id: number;
  content: string;
  time: string;
}

interface Template {
  id: number;
  title: string;
  desc: string;
  public: boolean;
  items: TemplateItem[];
}


export default function TabTwoScreen() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dailyTasks, setDailyTasks] = useState<TemplateItem[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null); // State to manage active template ID
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const storedTemplates = await AsyncStorage.getItem(STORAGE_KEY);
        const storedDailyTasksId = await AsyncStorage.getItem(TASKS_KEY_ID);
        if (storedTemplates) {
          setTemplates(JSON.parse(storedTemplates));
        }
        if (storedDailyTasksId) {
          setActiveTemplateId(Number(storedDailyTasksId));
        }
      } catch (error) {
        console.error("Failed to load templates from local storage", error);
        Alert.alert("Error", "Failed to load templates");
      }
    };
    loadTemplates();

  }, []);
  const addTemplateToDailyTasks = async (template: Template) => {
    setDailyTasks(template.items);
    setActiveTemplateId(template.id);

    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(template.items));
      await AsyncStorage.setItem(TASKS_KEY_ID, JSON.stringify(template.id));
      Alert.alert("Success", "Template added to daily tasks successfully");
    } catch (error) {
      console.error("Failed to save daily tasks to local storage", error);
      Alert.alert("Error", "Failed to save daily tasks");
    }
  };
  const handleNotificationSetup = (templateId: number) => {
    setActiveTemplateId(templateId);
    setModalVisible(true);
  };
  return (
    <View className="flex-1">
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        headerImage={
          <Image
            source={require("../../assets/images/createHeader.png")}
            className="w-[400px] sm:w-auto h-full mx-auto"
          />
        }
      >
        <View>
          <View className="flex flex-col space-y-10 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
            <View>
              <ThemedText type="title">My Templates</ThemedText>
              <ScrollView
              >
                <View className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4" >
                  {templates.filter(template => !template.public).length === 0 ? (
                        <View className="h-36 sm:h-56 flex flex-col justify-center border border-gray-200 rounded-xl text-center p-4 md:p-5 dark:border-neutral-700">

                          <View className="flex justify-center items-center size-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg mx-auto">

                            <TabTaskIcon name="now-widgets" size={42} className="flex-shrink-0  dark:text-white" />
                          </View>

                          <View className="mt-3">
                            <Text className="text-sm sm:text-lg text-center font-semibold text-gray-800 dark:text-neutral-200">
                             No Template Found
                            </Text>
                          </View>
                        </View>
                  ) : (
                    templates.filter(template => !template.public).map((template, index) => (
                      <View key={`template-${template.id}-${index}`} className="sm:w-80 rounded-xl border-2 border-gray-100 dark:border-neutral-700 bg-white dark:bg-black  ">
                        <View className="flex items-start gap-4 p-4 sm:p-6 lg:p-8">
                          <View className="flex flex-row justify-between w-full">

                            <Image
                              source={require("../../assets/images/icon.png")}
                              className="w-12 h-12 rounded-lg max-w-10 max-h-10 "
                            />

                            <View className="flex flex-row">

                              {activeTemplateId == template.id ? (
                                <Pressable
                                  onPress={() => handleNotificationSetup(template.id)}
                                >
                                  <TabTaskIcon name="notification-add" className="mr-4 sm:mr-2 text-black dark:text-white" />
                                </Pressable>
                              ) : (
                                <TabTaskIcon name="notifications-off" className="mr-4 sm:mr-2 text-black dark:text-white" />
                              )}
                            </View>
                          </View>

                          <View>
                            <Text className="font-medium sm:text-lg dark:text-gray-50">
                              {template.title}
                            </Text>

                            <Text className="line-clamp-2 text-sm text-gray-700 dark:text-gray-100">
                              {template.desc}
                            </Text>

                            <View className="mt-2 sm:flex sm:items-center sm:gap-2">
                              <Text className="text-xs sm:text-gray-500 ">
                                created by
                                <Link href="#" className="font-medium underline hover:text-gray-700"> You </Link>
                              </Text>

                            </View>
                          </View>
                        </View>

                        <View className="flex justify-end items-end ">

                          {activeTemplateId == template.id ? (
                            <View className="inline-flex flex-row items-center gap-1 rounded-l-full bg-green-600 px-3 py-1.5 text-white">
                              <TabTaskIcon name="verified" className="text-white" size={16} />
                              <Text className="text-xs font-medium text-white">Active</Text>
                            </View>
                          ) : (
                            <Pressable onPress={() => addTemplateToDailyTasks(template)}>
                              <View className="inline-flex flex-row items-center gap-1 rounded-l-full bg-transparent px-3 py-1.5 text-black dark:text-white border-l-2 border-t-2 hover:border-green-500 border-gray-100 dark:border-neutral-700">
                                <TabTaskIcon name="add-circle" className="text-black dark:text-white" size={16} />
                                <Text className="text-xs font-medium text-black dark:text-white">Add to Daily Tasks</Text>
                              </View>
                            </Pressable>
                          )}
                        </View>
                      </View>

                    )))}
                </View >

              </ScrollView>
            </View>
            <View>
              <ThemedText type="title">Public Templates</ThemedText>
              <ScrollView
              >
                <View className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4" >
                  {templates.filter(template => template.public).map((template, index) => (
                    <View key={`template-${template.id}-${index}`} className="sm:w-80 rounded-xl border-2 border-gray-100 dark:border-neutral-700 bg-white dark:bg-black  ">
                      <View className="flex items-start gap-4 p-4 sm:p-6 lg:p-8">
                        <View className="flex flex-row justify-between w-full">

                          <Image
                            source={require("../../assets/images/icon.png")}
                            className="w-12 h-12 rounded-lg max-w-10 max-h-10 "
                          />

                          <View className="flex flex-row">
                            {activeTemplateId == template.id ? (
                              <Pressable
                                onPress={() => handleNotificationSetup(template.id)}
                              >
                                <TabTaskIcon name="notification-add" className="mr-4 sm:mr-2 text-black dark:text-white" />
                              </Pressable>
                            ) : (
                              <TabTaskIcon name="notifications-off" className="mr-4 sm:mr-2 text-black dark:text-white" />
                            )}

                          </View>
                        </View>

                        <View>
                          <Text className="font-medium sm:text-lg dark:text-gray-50">
                            {template.title}
                          </Text>

                          <Text className="line-clamp-2 text-sm text-gray-700 dark:text-gray-100">
                            {template.desc}
                          </Text>

                          <View className="mt-2 sm:flex sm:items-center sm:gap-2">
                            <Text className="text-xs sm:text-gray-500 ">
                              created by
                              <Link href="#" className="font-medium underline hover:text-gray-700"> You </Link>
                            </Text>

                          </View>
                        </View>
                      </View>

                      <View className="flex justify-end items-end ">

                        {activeTemplateId == template.id ? (
                          <View className="inline-flex flex-row items-center gap-1 rounded-l-full bg-green-600 px-3 py-1.5 text-white">
                            <TabTaskIcon name="verified" className="text-white" size={16} />
                            <Text className="text-xs font-medium text-white">Active</Text>
                          </View>
                        ) : (
                          <Pressable onPress={() => addTemplateToDailyTasks(template)}>
                            <View className="inline-flex flex-row items-center gap-1 rounded-l-full bg-transparent px-3 py-1.5 text-black dark:text-white border-l-2 border-t-2 hover:border-green-500 border-gray-100 dark:border-neutral-700">
                              <TabTaskIcon name="add-circle" className="text-black dark:text-white" size={16} />
                              <Text className="text-xs font-medium text-black dark:text-white">Add to Daily Tasks</Text>
                            </View>
                          </Pressable>
                        )}
                      </View>
                    </View>

                  ))}
                </View >

              </ScrollView>
            </View>
          </View>
        </View>
      </ParallaxScrollView>
      <NotificationScheduler
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        templateId={activeTemplateId ?? 0}
      />
      <FloatingLink route="template" />
    </View>
  );
}


import React, { useState, useEffect } from "react";
import {
  Image,
  useColorScheme,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import FloatingLink from "@/components/FlotingLink";
import { TabTaskIcon } from "@/components/navigation/TabBarIcon";
import { Link } from "expo-router";
import NotificationScheduler from "@/components/NotificationScheduler";
import { useTemplateContext } from "@/contexts/TemplateContext";

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

const CreateScreen = () => {
  const { 
    templates, 
    dailyTasks, 
    activeTemplateId, 
    addTemplateToDailyTasks, 
    loading,
    updateRoutine 
  } = useTemplateContext();
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handleNotificationSetup = (templateId: number) => {
    if (!templateId) {
      Alert.alert("Error", "Invalid template");
      return;
    }
    setModalVisible(true);
  };

  const handleTemplateChange = async (template: Template) => {
    setIsChanging(true);
    try {
      // Show confirmation if there's already an active template
      if (activeTemplateId && activeTemplateId !== template.id) {
        Alert.alert(
          "Change Template",
          "Changing template will replace your current routines. Continue?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setIsChanging(false)
            },
            {
              text: "Continue",
              onPress: async () => {
                await addTemplateToDailyTasks(template);
                setModalVisible(true); // Show notification setup modal
              }
            }
          ]
        );
      } else {
        await addTemplateToDailyTasks(template);
        setModalVisible(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to change template");
    } finally {
      setIsChanging(false);
    }
  };

  const renderTemplate = (template: Template) => (
    <View key={template.id} className="sm:w-80 rounded-xl border-2 border-gray-100 dark:border-neutral-700 bg-white dark:bg-black">
      <View className="flex items-start gap-4 p-4 sm:p-6 lg:p-8">

        <View className="flex flex-row justify-between w-full">
          <Image
            source={require("../../assets/images/icon.png")}
            className="w-12 h-12 rounded-lg max-w-10 max-h-10"
          />
          <View className="flex flex-row">
            {activeTemplateId === template.id ? (
              <View className="flex flex-row items-center">
                <Pressable onPress={() => handleNotificationSetup(template.id)}>
                  <TabTaskIcon name="notification-add" className="mr-4 sm:mr-2 text-black dark:text-white" />
                </Pressable>
                <Link href={{
                  pathname: '/template/edit/[id]',
                  params: { id: template.id }
                }} className="ml-2" ><TabTaskIcon name="mode-edit-outline" /></Link>
              </View>
            ) : (
              <View className="flex flex-row items-center">
                <TabTaskIcon name="notifications-off" className="mr-4 sm:mr-2 text-black dark:text-white" />
                <Link href={{
                  pathname: '/template/edit/[id]',
                  params: { id: template.id }
                }} className="ml-2" ><TabTaskIcon name="mode-edit-outline" /></Link>
              </View>
            )}
          </View>
        </View>

        <View>
          <Text className="font-medium sm:text-lg dark:text-gray-50">{template.title}</Text>
          <Text className="line-clamp-2 text-sm text-gray-700 dark:text-gray-100">{template.desc}</Text>
          <View className="mt-2 sm:flex sm:items-center sm:gap-2">
            <Text className="text-xs sm:text-gray-500 dark:text-gray-200">
              created by
              <Link href="/profile" className="font-medium text-green-500"> You </Link>
            </Text>
          </View>
        </View>
      </View>

      <View className="flex justify-end items-end">
        {activeTemplateId === template.id ? (
          <View className="inline-flex flex-row items-center gap-1 rounded-l-full bg-green-600 px-3 py-1.5 text-white">
            <TabTaskIcon name="verified" className="text-white" size={16} />
            <Text className="text-xl font-medium text-white">Active</Text>
          </View>
        ) : (
          <Pressable 
            disabled={loading || isChanging} 
            className={`inline-flex flex-row items-center gap-1 rounded-l-full 
              ${isChanging ? 'opacity-50' : ''} 
              bg-transparent px-3 py-1.5 text-black dark:text-white 
              border-l-2 border-t-2 hover:border-green-500 
              border-gray-100 dark:border-neutral-700`}
            onPress={() => handleTemplateChange(template)}
          >
            {isChanging || loading ? (
              <ActivityIndicator color={colorScheme === 'dark' ? '#fff' : '#000'} />
            ) : (
              <>
                <TabTaskIcon name="add-circle" size={32} />
                <Text className="text-xl font-medium text-black dark:text-white">
                  Set as Daily Routine
                </Text>
              </>
            )}
          </Pressable>
        )}

      </View>
    </View>
  );

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
            {/* Private Templates */}
            <View>
              <ThemedText type="title">My Templates</ThemedText>
              <ScrollView>
                <View className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
                  {templates.filter(template => !template.public).length === 0 ? (
                    <View className="h-36 sm:h-56 flex flex-col justify-center border border-gray-200 rounded-xl text-center p-4 md:p-5 dark:border-neutral-700">
                      <View className="flex justify-center items-center size-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg mx-auto">
                        <TabTaskIcon name="now-widgets" size={42} />
                      </View>
                      <View className="mt-3">
                        <Text className="text-sm sm:text-lg text-center font-semibold text-gray-800 dark:text-neutral-200">
                          No Template Found
                        </Text>
                      </View>
                    </View>
                  ) : (
                    templates.filter(template => !template.public).map(renderTemplate)
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Public Templates */}
            <View className="py-10">
              <ThemedText type="title">Public Templates</ThemedText>
              <ScrollView>
                <View className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
                  {templates.filter(template => template.public).map(renderTemplate)}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
        <NotificationScheduler
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          templateId={activeTemplateId ?? 0}
        />
      </ParallaxScrollView>


      <FloatingLink route="template" />
    </View>
  );
};

export default CreateScreen;

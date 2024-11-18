import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  Alert,
  useColorScheme,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TabBarIcon,
  TabCreateIcon,
  TabProfileIcon,
  TabTaskIcon
} from "@/components/navigation/TabBarIcon";
import { Link } from "expo-router";
import { useTemplateContext } from "@/contexts/TemplateContext";
import { IconSymbol } from "@/components/ui/IconSymbol";

const STORAGE_KEY = "Templates";

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

export default function Create() {
  const initialTemplateItems = [
    { id: 1, content: "", time: "00" },
    { id: 2, content: "", time: "01" },
    { id: 3, content: "", time: "02" },
    { id: 4, content: "", time: "03" },
    { id: 5, content: "", time: "04" },
    { id: 6, content: "", time: "05" },
    { id: 7, content: "", time: "06" },
    { id: 8, content: "", time: "07" },
    { id: 9, content: "", time: "08" },
    { id: 10, content: "", time: "09" },
    { id: 11, content: "", time: "10" },
    { id: 12, content: "", time: "11" },
    { id: 13, content: "", time: "12" },
    { id: 14, content: "", time: "13" },
    { id: 15, content: "", time: "14" },
    { id: 16, content: "", time: "15" },
    { id: 17, content: "", time: "16" },
    { id: 18, content: "", time: "17" },
    { id: 19, content: "", time: "18" },
    { id: 20, content: "", time: "19" },
    { id: 21, content: "", time: "20" },
    { id: 22, content: "", time: "21" },
    { id: 23, content: "", time: "22" },
    { id: 24, content: "", time: "23" }
  ];
  const { templates, setTemplates, deleteTemplate } = useTemplateContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [selectedTab, setSelectedTab] = useState("morning");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState<boolean>(false);


  const updateTemplateItem = async (
    id: number,
    content: string,
    time: string
  ) => {
    if (!currentTemplate) return;

    const newItems = currentTemplate.items.map((item) =>
      item.id === id ? { ...item, content, time } : item
    );
    const updatedTemplate = { ...currentTemplate, items: newItems };
    setCurrentTemplate(updatedTemplate);

    const newTemplates = templates.map((template) =>
      template.id === updatedTemplate.id ? updatedTemplate : template
    );
    setTemplates(newTemplates);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
    } catch (error) {
      console.error("Failed to save template to local storage", error);
      Alert.alert("Error", "Failed to save template");
    }
  };
  const saveTemplate = async () => {
    setLoading(true);
    if (!title) {
      Alert.alert("Error", "Title cannot be empty");
      return;
    }
    if (!desc) {
      Alert.alert("Error", "Description cannot be empty");
      return;
    }

    const newTemplate = {
      id: Date.now(),
      title,
      desc,
      public: false,
      items: initialTemplateItems
    };

    const newTemplates = [...templates, newTemplate];
    setTemplates(newTemplates);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
      Alert.alert("Success", "Template saved successfully");
    } catch (error) {
      console.error("Failed to save template to local storage", error);
      Alert.alert("Error", "Failed to save template");
    } finally {
      setLoading(false);
    }

    setTitle("");
    setDesc("");
  };

  const saveTemplateData = async (templateId: number, items: TemplateItem[]) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === templateId) {
        return { ...template, items };
      }
      return template;
    });

    setTemplates(updatedTemplates);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
      Alert.alert("Success", "Template data saved successfully");
    } catch (error) {
      console.error("Failed to save template data to local storage", error);
      Alert.alert("Error", "Failed to save template data");
    }
  };


  const selectTemplate = (template: Template) => {
    setCurrentTemplate(template);
  };

  const firstTwelve = currentTemplate ? currentTemplate.items.slice(0, 12) : [];
  const nextTwelve = currentTemplate ? currentTemplate.items.slice(12) : [];

  function convertHourTo12HourFormat(hourStr: string): string {
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12;
    return `${twelveHour} ${period}`;
  }

  const renderItem = ({ item }: { item: TemplateItem }) => (
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
          value={item.content}
          multiline
          numberOfLines={3}
          onChangeText={(text) => updateTemplateItem(item.id, text, item.time)}
          placeholder="Task Name and short info"
          placeholderTextColor={colorScheme === "dark" ? "#888" : "#ccc"}
        />
      </View>
    </View>
  );

  const openModal = (template: Template) => {
    selectTemplate(template);
    setModalVisible(true);
  };


  return (
    <>
      <ScrollView>
        <View className="px-4 py-10 lg:px-10">
          <View className="flex flex-col lg:flex-row lg:justify-center lg:items-center lg:space-x-10">
            <View className="px-4 lg:w-1/2">
              <Text className="text-2xl font-bold md:text-3xl md:leading-tight dark:text-white">
                Template Title
              </Text>
              <Text className="mt-3 text-gray-600 dark:text-neutral-400">
                Name your daily template and start adding routines to it.
              </Text>
            </View>

            <View className="lg:w-1/2">
              <View className="flex flex-col space-y-4 ">
                <View className="">
                  <TextInput
                    className="py-3 px-4 block w-full border my-4 border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-green-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    placeholder="Enter template title"
                    placeholderTextColor={colorScheme === "dark" ? "#888" : "#ccc"}
                    value={title}
                    maxLength={50}
                    onChangeText={setTitle}
                  />
                  <TextInput
                    multiline
                    style={[
                      { height: 100, textAlignVertical: 'top' },
                    ]}
                    className="py-3 px-4 block w-full border my-4 border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-green-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    placeholder="Enter template Description"
                    placeholderTextColor={colorScheme === "dark" ? "#888" : "#ccc"}
                    value={desc}
                    maxLength={160}
                    onChangeText={setDesc}
                  />


                </View>

                <Pressable
                  className=" w-full sm:w-2/3 rounded-full  whitespace-nowrap py-3 px-4 inline-flex mx-auto flex-row justify-center items-center gap-x-2 text-sm font-semibold  border border-transparent bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none"
                  onPress={saveTemplate}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <TabBarIcon style={{ color: 'white' }}
                      name="add-circle"
                      className="text-white"
                    />
                  )}

                  <Text className=" text-white font-semibold text-lg">
                    Add new Template
                  </Text>
                </Pressable>
              </View>
              <Text className="mt-3 text-sm text-gray-500 dark:text-neutral-500 text-center">
                Now select the template from below
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-1 bg-white dark:bg-neutral-900 ">
          {/* templates choose */}
          <View className="">
            <Text className="text-xl font-normal  dark:text-white px-4 py-4"> Select a template to edit tasks</Text>
            {/* <ScrollView className="sm:h-80 pb-52"> */}
            {templates.filter((template) => !template.public).map((template) => (
              <View key={template.id} className=" rounded-xl border-2 border-gray-100 dark:border-neutral-700 bg-white dark:bg-black mx-4 mb-5">
                <View className="flex items-start gap-4 p-4 sm:p-6 lg:p-8">
                  <View className="flex flex-row justify-between w-full">

                    <Image
                      source={require("../../assets/images/icon.png")}
                      className="w-12 h-12 rounded-lg max-w-10 max-h-10 "
                    />

                    <View className="flex flex-row">
                      <Pressable
                        onPress={() => openModal(template)}
                        className="mr-2"
                      >
                        <TabProfileIcon name="edit" />
                      </Pressable>
                      <Pressable
                        onPress={() => deleteTemplate(template.id)}
                      >
                        <TabTaskIcon name="delete" className="dark:text-white" />
                      </Pressable>
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
                      <Text className="text-xs sm:text-gray-500 dark:text-gray-200 ">
                        created by
                        <Link href="/profile" className="font-medium text-green-500"> You </Link>
                      </Text>

                    </View>
                  </View>
                </View>

                <View className="flex justify-end items-end ">
                  <View className="  inline-flex flex-row items-center gap-1 rounded-l-full bg-green-600 px-3 py-1.5 text-white">
                    <TabTaskIcon name="verified" className="text-white  " style={{ color: 'white' }} size={16} />
                    <Text className="text-xs font-medium text-white">Rize</Text>
                  </View>
                </View>
              </View>

            ))}
            {/* </ScrollView> */}
          </View>
          <Modal
            visible={modalVisible}
            animationType="slide"
            className="dark:bg-neutral-900"
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1  dark:bg-neutral-900">
              {currentTemplate ? (
                <>
                  <View className="flex flex-row justify-end items-end px-10">
                    <Pressable
                      className=" mt-4 hover:underline  "
                      onPress={() => setModalVisible(false)}
                    >

                      <TabCreateIcon
                        name="closecircleo"
                        className="text-black dark:text-white pt-4"
                      />

                    </Pressable>
                  </View>
                  <View className="">
                    <View className="px-14 py-4 md:py-10 ">
                      <View className=" flex flex-row justify-between  ">
                        <View className="flex flex-row gap-4">
                          <Pressable
                            className={`inline-flex flex-row  p-2 md:py-4 rounded-full  justify-center items-center  ${selectedTab == "morning"
                              ? "bg-[#0c891b]  "
                              : "bg-transparent border dark:border-white hover:bg-[#0aaf1d] text-neutral-950"
                              } `}
                            onPress={() => setSelectedTab("morning")}
                          >
                            <IconSymbol  name="wb-sunny" />
                          </Pressable>
                          <Pressable
                            className={`inline-flex flex-row  p-2 md:py-4 rounded-full justify-center items-center  ${selectedTab == "afternoon"
                              ? "bg-[#0c891b]  "
                              : "bg-transparent border dark:border-white hover:bg-[#0aaf1d] text-neutral-950 dark:text-white"
                              } `}
                            onPress={() => setSelectedTab("afternoon")}
                          >

                            <IconSymbol  name="nights-stay" />

                          </Pressable>
                        </View>
                        <View>
                          <Pressable
                            className="bg-green-500  w-28 p-2 rounded-full border-2  border-zinc-200  dark:border-zinc-50   text-center   "
                            onPress={() => {
                              if (currentTemplate) {
                                saveTemplateData(currentTemplate.id, currentTemplate.items);
                              }
                              setModalVisible(false);
                            }}
                          >

                            <Text className="text-white text-center text-xl font-semibold  ">
                              Save
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                  <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {selectedTab === "morning" &&
                      firstTwelve.map((item) => (
                        <View key={item.id} className="mx-4">
                          {renderItem({ item })}
                        </View>
                      ))}

                    {selectedTab === "afternoon" &&
                      nextTwelve.map((item) => (
                        <View key={item.id} className="mx-4">
                          {renderItem({ item })}
                        </View>
                      ))}
                  </ScrollView>
                </>
              ) : (
                <Text className="text-2xl font-bold md:text-3xl md:leading-tight dark:text-white">
                  Create a template to view and edit its tasks
                </Text>
              )}
            </View>
          </Modal>
        </View>
      </ScrollView>
    </>
  );
}

import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    useColorScheme,
    ScrollView,
    ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabTaskIcon } from "@/components/navigation/TabBarIcon";
import { useTemplateContext } from "@/contexts/TemplateContext";
import { ThemedText } from '@/components/ThemedText';
import CustomAlert from '@/components/CustomAlert';
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

export default function Edit() {
    const { id } = useLocalSearchParams();
    const { templates, setTemplates, deleteTemplate } = useTemplateContext();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
    const [selectedTab, setSelectedTab] = useState("morning");
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const colorScheme = useColorScheme();
    const [showMore, setShowMore] = useState(false); // State to toggle showing more items
    const [loading, setLoading] = useState<boolean>(false);
    // CustomAlert state management
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'error' | 'success' | 'info' | 'warning'>('error');
    // Load the template based on the 'id' parameter when the component mounts
    useEffect(() => {
        if (id) {
            const templateToEdit = templates.find((template) => template.id === Number(id));
            if (templateToEdit) {
                setCurrentTemplate(templateToEdit);
                setTitle(templateToEdit.title);
                setDesc(templateToEdit.desc);
            } else {
                setAlertTitle('Error');
                setAlertMessage('Template not found');
                setAlertType('error');
                setAlertVisible(true);
            }
        }
    }, [id, templates]);

    const updateTemplateItem = async (
        itemId: number,
        content: string,
        time: string
    ) => {
        if (!currentTemplate) return;

        const newItems = currentTemplate.items.map((item) =>
            item.id === itemId ? { ...item, content, time } : item
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
            setAlertTitle('Error');
            setAlertMessage('Failed to save template');
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const saveTemplate = async () => {
        setLoading(true);
        if (!title) {
            setAlertTitle('Error');
            setAlertMessage('Title cannot be empty');
            setAlertType('error');
            setAlertVisible(true);
            return;
        }
        if (!desc) {
            setAlertTitle('Error');
            setAlertMessage('Description cannot be empty');
            setAlertType('error');
            setAlertVisible(true);
            return;
        }

        // Ensure id is valid before saving
        if (!currentTemplate?.id) {
            setAlertTitle('Error');
            setAlertMessage('Template id is missing');
            setAlertType('error');
            setAlertVisible(true);
            return;
        }

        const updatedTemplate = { ...currentTemplate, title, desc };
        const updatedTemplates = templates.map(template =>
            template.id === updatedTemplate.id ? updatedTemplate : template
        );

        // Update the templates state
        setTemplates(updatedTemplates);

        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
            setAlertTitle('Success');
            setAlertMessage('Template updated successfully!');
            setAlertType('success');
            setAlertVisible(true);
        } catch (error) {
            console.error("Failed to update template to local storage", error);
            setAlertTitle('Error');
            setAlertMessage('Failed to update template');
            setAlertType('error');
            setAlertVisible(true);
        } finally {
            setLoading(false)
        }
    };



    const firstTwelve = currentTemplate ? currentTemplate.items.slice(0, 12) : [];
    const nextTwelve = currentTemplate ? currentTemplate.items.slice(12) : [];

    function convertHourTo12HourFormat(hourStr: string): string {
        const hour = parseInt(hourStr, 10);
        const period = hour >= 12 ? "PM" : "AM";
        const twelveHour = hour % 12 || 12;
        return `${twelveHour} ${period}`;
    }

    const renderItem = (item: TemplateItem) => (
        <View className="bg-white  border border-t-4 shadow-sm rounded-[12px] dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70 mb-5 px-2 py-2 sm:px-4 sm:py-4 sm:mx-4" key={item.id}>
            <View className="flex flex-row justify-start">
                <Text className="text-xs sm:text-sm text-gray-800 dark:text-white">
                    {convertHourTo12HourFormat(item.time)}
                </Text>
            </View>
            <View className="mb-4">
                <TextInput
                    className="text-base overflow-y-auto h-auto text-gray-800 dark:text-white"
                    maxLength={100}
                    value={item.content}
                    multiline
                    onChangeText={(text) => updateTemplateItem(item.id, text, item.time)}
                    placeholder="Task Name and short info"
                    placeholderTextColor={colorScheme === "dark" ? "#888" : "#ccc"}
                />
            </View>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="px-4 py-10 lg:px-10">
            <View className="flex flex-col lg:flex-row lg:justify-center lg:items-center lg:space-x-10">
                <View className="px-4 lg:w-1/2 mt-4">
                    <ThemedText type='title'>
                        Edit Title
                    </ThemedText>
                    <Text className="mt-3 text-gray-600 dark:text-neutral-400">
                        Edit your  template and start adding routines to it.
                    </Text>
                </View>

                <View className="lg:w-1/2">
                    <View className="flex flex-col space-y-4">
                        <View>
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
                                numberOfLines={3}
                                className="py-3 px-4 block w-full border my-4 border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-green-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                                placeholder="Enter template Description"
                                placeholderTextColor={colorScheme === "dark" ? "#888" : "#ccc"}
                                value={desc}
                                maxLength={160}
                                onChangeText={setDesc}
                            />
                        </View>

                        <Pressable
                            className="w-full sm:w-2/3 rounded-full whitespace-nowrap py-3 px-4 inline-flex mx-auto flex-row justify-center items-center gap-x-2 text-sm font-semibold border border-transparent bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none"
                            onPress={saveTemplate}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <TabTaskIcon style={{ color: 'white', marginRight: 2 }} name="update" />
                            )}

                            <Text className="text-white font-semibold text-base">Update Template</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <View className="py-5">
                <ThemedText type="subtitle">Edit its tasks</ThemedText>
            </View>

            {/* Render Template Items */}
            {firstTwelve.map((item) => renderItem(item))}
            {showMore && nextTwelve.map((item) => renderItem(item))}

            {/* Show More / Less Button */}
            {nextTwelve.length > 0 && (
                <View className="flex items-center py-4 justify-center px-16">
                    <Pressable
                        onPress={() => setShowMore(!showMore)} // Toggle show more items
                        className="text-center w-full py-3 mb-4 border border-green-500 rounded-full"
                    >
                        <Text className="text-green-500 text-center">{showMore ? "Show less" : "Show more"}</Text>
                    </Pressable>
                </View>
            )}
            {/* Display Custom Alert */}
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
                type={alertType}
            />
        </ScrollView>
    );
}

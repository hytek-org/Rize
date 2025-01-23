import React, { useEffect, useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    BackHandler,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { useNotes } from '@/contexts/NotesContext';
import { TabCreateIcon } from "@/components/navigation/TabBarIcon";
interface NoteModalProps {
    visible: boolean;
    onClose: () => void;
    input?: string;
    setInput?: (text: string) => void;
    tag?: string;
    setTag?: (text: string) => void;
    editMode?: boolean;  // Optional editMode prop
    addNote?: () => void;
    editNote?: () => void;
    onSuccess: () => void;
    onError: (message: string) => void;
}

export const NoteModal = ({ visible, onClose, onSuccess, onError }: NoteModalProps) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [isLoading, setIsLoading] = useState(false);
    const { addNote } = useNotes();
    const [input, setInput] = React.useState('');
    const [tag, setTag] = React.useState('');

    const handleAddNote = () => {
        if (!input.trim()) {
            onError('Note cannot be empty.');
            return;
        }
        setIsLoading(true);
        addNote(input.trim(), tag.trim());
        setInput('');
        setTag('');
        onSuccess();
        setIsLoading(false);
        setTimeout(() => {
            onClose();
        }, 500); // Add delay before closing
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback className='z-50' onPress={() => Keyboard.dismiss()}>
                <View style={{ flex: 1, justifyContent: 'flex-start', zIndex: 50 }}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1 }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false} // Hide the scroll indicator for better UX
                        >
                            <View className='flex-1 justify-end '>
                                <View className='bg-zinc-50 dark:bg-zinc-900 rounded-t-3xl p-6 space-y-6 '>
                                    {/* Drag indicator */}
                                    <View className='w-12 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full self-center' />

                                    <Text className="text-2xl font-bold text-zinc-800 dark:text-zinc-50 py-4">
                                        {"New Note"}
                                    </Text>

                                    <View className='space-y-2'>
                                        <Text className="text-sm py-1 font-medium text-zinc-600 dark:text-zinc-400">
                                            Label ({tag?.length}/15)
                                        </Text>
                                        <TextInput
                                            className="bg-white dark:text-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3"
                                            value={tag}
                                            maxLength={15}
                                            onChangeText={setTag}
                                            placeholder="Enter label"
                                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                                        />
                                    </View>

                                    <View className='space-y-2'>
                                        <Text className="text-sm py-1 font-medium text-zinc-600 dark:text-zinc-400">
                                            Note Content
                                        </Text>
                                        <TextInput
                                            className="bg-white dark:text-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4"
                                            value={input}
                                            onChangeText={setInput}
                                            placeholder="What's on your mind?"
                                            multiline
                                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                                            style={{ minHeight: 120, textAlignVertical: 'top' }}
                                        />
                                    </View>

                                    <View className='space-y-4 pt-4 '>
                                        <TouchableOpacity
                                            className='bg-green-600 active:bg-green-700 rounded-xl p-4 flex-row justify-center items-center space-x-2'
                                            onPress={handleAddNote}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <>
                                                    <Text className='text-white font-medium'>
                                                        {"Create Note"}
                                                    </Text>
                                                    <TabCreateIcon
                                                        name={"pluscircleo"}
                                                        size={20}
                                                        color="white"
                                                        className='pl-2'
                                                    />
                                                </>
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className='p-4'
                                            onPress={onClose}
                                        >
                                            <Text className='text-center text-zinc-600 dark:text-zinc-400'>
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { useTemplateContext } from '@/contexts/TemplateContext';
import TimeBlock from '@/components/TimeBlock';

interface TimeSlotTask {
  task: {
    id: number;
    content: string;
    time: string;
    subtasks?: {
      id: string;
      content: string;
      completed: boolean;
    }[];
  };
  label: 'Previous' | 'Current' | 'Next';
  timeLabel: string;
  borderColor: string;
}

const { width: viewportWidth } = Dimensions.get('window');

/* ---------------------------------------------------------------------------
   SubtaskDrawer Component
   This modal drawer appears from the bottom and allows the user to add
   multiple subtasks at one time.
--------------------------------------------------------------------------- */
interface SubtaskDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (subtasks: string[]) => void;
}

const SubtaskDrawer: React.FC<SubtaskDrawerProps> = ({ visible, onClose, onSave }) => {
  const [inputs, setInputs] = useState<string[]>(['']);

  const handleInputChange = (text: string, index: number) => {
    const newInputs = [...inputs];
    newInputs[index] = text;
    setInputs(newInputs);
  };

  const addField = () => {
    setInputs([...inputs, '']);
  };

  const removeField = (index: number) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  const handleSave = () => {
    const nonEmptySubtasks = inputs.filter(input => input.trim() !== '');
    onSave(nonEmptySubtasks);
    setInputs(['']);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-zinc-50/80 dark:bg-zinc-900/60">
        <View className="bg-white dark:bg-zinc-800 p-4 rounded-t-2xl">
          <Text className="text-xl font-bold text-center mb-4 text-zinc-800 dark:text-white">
            Add Subtasks
          </Text>
          <ScrollView style={{ maxHeight: 500 ,minHeight: 50}}>
            {inputs.map((input, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <TextInput
                  className="flex-1 border border-zinc-300 dark:border-zinc-600 p-2 rounded-md text-zinc-800 dark:text-white"
                  placeholder="Enter subtask"
                  placeholderTextColor="#9ca3af"
                  value={input}
                  onChangeText={(text) => handleInputChange(text, index)}
                />
                {inputs.length > 1 && (
                  <Pressable onPress={() => removeField(index)} className="ml-2">
                    <IconSymbol name="xmark.circle.fill" size={24} color="#ef4444" />
                  </Pressable>
                )}
              </View>
            ))}
          </ScrollView>
          {/* <Pressable onPress={addField} className="py-2">
            <Text className="text-green-600 dark:text-green-400 text-center">Add Another</Text>
          </Pressable> */}
          <View className="flex-row justify-between mt-4">
            <Pressable
              onPress={onClose}
              className="py-2 px-4 border border-zinc-300 dark:border-zinc-600 rounded-md"
            >
              <Text className="text-zinc-800 dark:text-white">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              className="py-2 px-4 bg-green-600 dark:bg-green-700 rounded-md"
            >
              <Text className="text-white">Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ---------------------------------------------------------------------------
   HomeScreen Component
--------------------------------------------------------------------------- */
const HomeScreen = () => {
  const { dailyTasks, updateSubtask, addSubtask, removeSubtask } = useTemplateContext();
  const [timeSlots, setTimeSlots] = useState<TimeSlotTask[]>([]);
  const [showSubtaskInput, setShowSubtaskInput] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const flatListRef = useRef<FlatList>(null);

  // Set up the three time slot cards
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const prevHour = (currentHour - 1 + 24) % 24;
    const nextHour = (currentHour + 1) % 24;

    const slots: Array<{ hour: number; label: TimeSlotTask['label']; borderColor: string }> = [
      { hour: prevHour, label: 'Previous', borderColor: 'border-t-yellow-600' },
      { hour: currentHour, label: 'Current', borderColor: 'border-t-green-600' },
      { hour: nextHour, label: 'Next', borderColor: 'border-t-red-600' },
    ];

    const updatedTimeSlots = slots.map(slot => {
      const task = dailyTasks.find(t => parseInt(t.time) === slot.hour);
      return {
        task: task || {
          id: -1,
          content: 'No task scheduled',
          time: slot.hour.toString().padStart(2, '0'),
        },
        label: slot.label,
        timeLabel: convertHourTo12HourFormat(slot.hour.toString().padStart(2, '0')),
        borderColor: slot.borderColor,
      };
    });

    setTimeSlots(updatedTimeSlots);
  }, [dailyTasks]);

  const convertHourTo12HourFormat = (hourStr: string): string => {
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const twelveHour = hour % 12 || 12;
    return `${twelveHour} ${period}`;
  };

  const canEditTask = (label: TimeSlotTask['label']): boolean =>
    label === 'Current' || label === 'Next';

  const now = new Date();
  const currentHourString = now.getHours().toString().padStart(2, '0');

  const renderTask = (item: TimeSlotTask) => (
    <View
      className={`bg-white dark:bg-zinc-800 border border-t-4 ${item.borderColor} dark:border-zinc-700 shadow-lg rounded-2xl p-5`}
      style={{ minHeight: '100%', width: viewportWidth * 0.9 }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center space-x-2">
          <Text className="text-sm text-zinc-800 dark:text-white">{item.timeLabel}</Text>
          <Text
            className={`text-sm ${
              item.label === 'Previous'
                ? 'text-yellow-500'
                : item.label === 'Current'
                ? 'text-green-500'
                : 'text-red-500'
            }`}
          >
            ({item.label})
          </Text>
        </View>
        {item.task.id !== -1 && canEditTask(item.label) && (
          <Pressable
            onPress={() => setShowSubtaskInput(item.task.id)}
            className="flex-row items-center bg-green-500 dark:bg-green-600 px-3 py-1 rounded-full"
          >
            <IconSymbol name="add-task" size={16} color="#fff" />
            <Text className="text-white text-sm ml-1">Add Subtask</Text>
          </Pressable>
        )}
      </View>
  
      {/* Task Content */}
      <View className="mt-4">
        <Text className="text-lg font-semibold text-zinc-800 dark:text-white">
          {item.task.content}
        </Text>
  
        {/* Updated Subtasks UI with ScrollView */}
        {item.task.subtasks && item.task.subtasks.length > 0 && (
          <View className="mt-4 pl-4 border-l border-zinc-200 dark:border-zinc-700">
            <ScrollView
              style={{ maxHeight: '90%'}}
              contentContainerStyle={{ paddingVertical: 2 }}
            >
              {item.task.subtasks.map((subtask) => (
                <View key={subtask.id} className="flex-row items-center justify-between my-1">
                  <Pressable
                    className="flex-row items-center flex-1"
                    onPress={() =>
                      canEditTask(item.label) &&
                      updateSubtask(item.task.id, subtask.id, !subtask.completed)
                    }
                    disabled={!canEditTask(item.label)}
                  >
                    <IconSymbol
                      name={subtask.completed ? 'check-circle' : 'task-alt'}
                      size={20}
                      color={
                        !canEditTask(item.label)
                          ? '#9ca3af'
                          : subtask.completed
                          ? '#22c55e'
                          : '#71717a'
                      }
                    />
                    <Text
                      className={`ml-2 ${
                        subtask.completed
                          ? 'line-through text-zinc-400'
                          : !canEditTask(item.label)
                          ? 'text-zinc-500'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {subtask.content}
                    </Text>
                  </Pressable>
                  {canEditTask(item.label) && (
                    <Pressable onPress={() => removeSubtask(item.task.id, subtask.id)} className="p-1">
                      <IconSymbol name="remove-circle-outline" size={20} color="#ef4444" />
                    </Pressable>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
  
      {/* TimeBlock */}
      <View className="mt-auto items-end pl-5">
        <TimeBlock item={item} currentHourString={currentHourString} />
      </View>
    </View>
  );
  
  

  // Always call useFocusEffect so hook order remains consistent.
  useFocusEffect(
    useCallback(() => {
      if (timeSlots.length > 0) {
        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
        setActiveIndex(1);
      }
    }, [timeSlots])
  );

  // Handle swipe events with haptic feedback.
  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / viewportWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-zinc-50 dark:bg-black"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      <SafeAreaView className="flex-1">
        <View className="pt-14 pb-4">
          <Text className="text-3xl font-bold text-center text-zinc-800 dark:text-white">
            Today's Schedule
          </Text>
        </View>
        {dailyTasks.length === 0 ? (
          <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-black">
            <Image
              source={require('../../assets/images/icon.png')}
              className="rounded-xl w-52 h-56 mb-10"
            />
            <ThemedText type="title">No Routine</ThemedText>
            <ThemedText type="subtitle" className="mb-8">
              Select a routine to continue
            </ThemedText>
            <Link href={'/(tabs)/create'} className="py-6">
              <View className="py-3 px-6 bg-green-600 dark:bg-green-700 rounded-full">
                <Text className="text-white text-lg font-medium">Select Routine Template</Text>
              </View>
            </Link>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={timeSlots}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              initialScrollIndex={1}
              getItemLayout={(_, index) => ({
                length: viewportWidth,
                offset: viewportWidth * index,
                index,
              })}
              renderItem={({ item }) => (
                <View style={{ width: viewportWidth, alignItems: 'center', justifyContent: 'center' }}>
                  {renderTask(item)}
                </View>
              )}
            />

            {/* Pagination Indicators */}
            <View className="flex-row justify-center mb-24 mt-6">
              {timeSlots.map((_, index) => (
                <View
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full mx-1 ${
                    index === activeIndex
                      ? 'bg-green-500 dark:bg-green-400'
                      : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                />
              ))}
            </View>
          </>
        )}

        {/* Subtask Modal Drawer */}
        {showSubtaskInput !== null && (
          <SubtaskDrawer
            visible={true}
            onClose={() => setShowSubtaskInput(null)}
            onSave={(subtasks) => {
              // For each new subtask, call addSubtask for the current task.
              subtasks.forEach((subtask) => addSubtask(showSubtaskInput, subtask));
              setShowSubtaskInput(null);
            }}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;

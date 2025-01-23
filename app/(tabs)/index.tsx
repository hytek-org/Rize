import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, SafeAreaView, Image, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { TabProfileIcon } from "@/components/navigation/TabBarIcon";
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { Link } from 'expo-router';
import { useTemplateContext } from '@/contexts/TemplateContext';
import { SubtaskInput } from '@/components/tasks/SubtaskInput';
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
  borderColor: string; // Add this property to the interface
}

const HomeScreen = () => {
  const { dailyTasks, updateSubtask, addSubtask, removeSubtask } = useTemplateContext();
  const [timeSlots, setTimeSlots] = useState<TimeSlotTask[]>([]);
  const [showSubtaskInput, setShowSubtaskInput] = useState<number | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const prevHour = (currentHour - 1 + 24) % 24;
    const nextHour = (currentHour + 1) % 24;

    const slots: Array<{
      hour: number;
      label: TimeSlotTask['label'];
      borderColor: string;
    }> = [
        {
          hour: prevHour,
          label: 'Previous',
          borderColor: 'border-t-yellow-600'
        },
        {
          hour: currentHour,
          label: 'Current',
          borderColor: 'border-t-green-600'
        },
        {
          hour: nextHour,
          label: 'Next',
          borderColor: 'border-t-red-600'
        }
      ];

    const updatedTimeSlots = slots.map(slot => {
      const task = dailyTasks.find(t => parseInt(t.time) === slot.hour);
      return {
        task: task || {
          id: -1,
          content: 'No task scheduled',
          time: slot.hour.toString().padStart(2, '0')
        },
        label: slot.label,
        timeLabel: convertHourTo12HourFormat(slot.hour.toString().padStart(2, '0')),
        borderColor: slot.borderColor
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

  const handleAddSubtask = (taskId: number) => {
    if (!newSubtaskText.trim()) return;
    addSubtask(taskId, newSubtaskText.trim());
    setNewSubtaskText('');
    setShowSubtaskInput(null);
  };

  const canEditTask = (label: TimeSlotTask['label']): boolean => {
    return label === 'Current' || label === 'Next';
  };
  const now: Date = new Date();
  const currentHourString: string = now.getHours().toString().padStart(2, '0');
  const renderTask = ({ item }: { item: TimeSlotTask }) => (
    <View className={`bg-white border border-t-4 ${item.borderColor} 
      shadow-sm rounded-[32px] dark:bg-neutral-900 dark:shadow-neutral-700/70
      mb-5 px-4 py-4 mx-4`}>
      {/* Task Header */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center space-x-1">
          <Text className="text-xs sm:text-sm text-gray-800 dark:text-white">
            {item.timeLabel}
          </Text>
          <Text className={`text-xs ${item.label === 'Previous'
              ? 'text-yellow-500'
              : item.label === 'Current'
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
            ({item.label})
          </Text>
        </View>
        {item.task.id !== -1 && canEditTask(item.label) && (
          <Pressable
            onPress={() => setShowSubtaskInput(item.task.id)}
            className="flex-row items-center space-x-1 bg-green-500 px-3 py-1.5 rounded-full"
          >
            <IconSymbol name="add-task" size={16} color="#fff" />
            <Text className="text-white text-sm">Add Subtask</Text>
          </Pressable>
        )}
      </View>

      <View className="p-2 md:p-5">
        <Text className="text-base font-semibold text-gray-800 dark:text-white">
          {item.task.content}
        </Text>

        {/* Subtasks Section */}
        {item.task.subtasks && item.task.subtasks.length > 0 && (
          <View className="mt-4 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
            {item.task.subtasks.map(subtask => (
              <View key={subtask.id} className="flex-row items-center justify-between ">
                <Pressable
                  className="flex-row items-center "
                  onPress={() => canEditTask(item.label) && updateSubtask(item.task.id, subtask.id, !subtask.completed)}
                  disabled={!canEditTask(item.label)}
                >
                  <IconSymbol
                    name={subtask.completed ? "check-circle" : "task-alt"}
                    size={20}
                    color={
                      !canEditTask(item.label)
                        ? '#9ca3af' // gray-400 for disabled state
                        : subtask.completed
                          ? '#22c55e'
                          : '#71717a'
                    }
                  />
                  <Text className={`ml-2 flex-1 ${subtask.completed
                      ? 'line-through text-zinc-400'
                      : !canEditTask(item.label)
                        ? 'text-zinc-500'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                    {subtask.content}
                  </Text>
                </Pressable>
                {canEditTask(item.label) && (
                  <Pressable
                    onPress={() => removeSubtask(item.task.id, subtask.id)}
                    className="p-2"
                  >
                    <IconSymbol name="xmark.circle.fill" size={20} color="#ef4444" />
                  </Pressable>
                )}

              </View>
            ))}
          </View>
        )}

        {/* Add Subtask Input - Only show for current and upcoming tasks */}
        {showSubtaskInput === item.task.id && canEditTask(item.label) && (
          <View style={{ marginBottom: 200 }}>
            <SubtaskInput
              onAdd={(content) => {
                addSubtask(item.task.id, content);
                setShowSubtaskInput(null);
                Keyboard.dismiss();
              }}
              onCancel={() => {
                setShowSubtaskInput(null);
                Keyboard.dismiss();
              }}
            />
          </View>
        )}
      </View>
      <View className='pr-8'>
        <TimeBlock item={item} currentHourString={currentHourString} />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      <SafeAreaView className="flex-1">
        <FlatList
          data={timeSlots}
          keyExtractor={(item) => item.label}
          renderItem={renderTask}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          contentContainerStyle={{ paddingBottom: 200 }}
          onScrollBeginDrag={Keyboard.dismiss}
          ListHeaderComponent={() => (
            <View>
              <Text className='text-2xl sm:text-4xl pt-12 pb-4 text-center dark:text-neutral-100'>
                Today's Schedule
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex flex-col items-center justify-between h-full pt-32">
              <Image
                source={require("../../assets/images/icon.png")}
                className="rounded-xl w-52 h-56 mb-10"
              />
              <ThemedText type="title">No Routine</ThemedText>
              <ThemedText type="subtitle">Select a routine to continue</ThemedText>
              <Link href={'/(tabs)/create'} className="py-6">
                <View className="py-3 px-4 bg-green-600 rounded-full flex items-center">
                  <Text className="text-white text-lg font-medium">Select Routine Template</Text>
                </View>
              </Link>
            </View>
          }
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;

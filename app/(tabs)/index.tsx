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
  editMode?: boolean;
  initialValue?: string;
}

const SubtaskDrawer: React.FC<SubtaskDrawerProps> = ({
  visible,
  onClose,
  onSave,
  editMode = false,
  initialValue = ''
}) => {
  const [inputs, setInputs] = useState<string[]>([editMode ? initialValue : '']);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (text: string, index: number) => {
    const newInputs = [...inputs];
    const newErrors = [...errors];
    newInputs[index] = text;
    newErrors[index] = ''; // Clear error when typing
    setInputs(newInputs);
    setErrors(newErrors);
  };

  const addField = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputs([...inputs, '']);
    setErrors([...errors, '']);
  };

  const removeField = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newInputs = inputs.filter((_, i) => i !== index);
    const newErrors = errors.filter((_, i) => i !== index);
    setInputs(newInputs);
    setErrors(newErrors);
  };

  const validateInputs = (): boolean => {
    const newErrors = inputs.map(input =>
      input.trim() === '' ? 'Subtask cannot be empty' : ''
    );
    setErrors(newErrors);
    return !newErrors.some(error => error !== '');
  };

  const handleSave = () => {
    if (validateInputs()) {
      const nonEmptySubtasks = inputs.filter(input => input.trim() !== '');
      if (nonEmptySubtasks.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSave(nonEmptySubtasks);
        setInputs(['']);
        setErrors([]);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable
        className="flex-1 bg-zinc-900/60"
        onPress={onClose}
      >
        <View className="flex-1 justify-end">
          <Pressable className="bg-white dark:bg-zinc-800 p-6 rounded-t-3xl">
            <View className="w-12 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full self-center mb-6" />

            <Text className="text-2xl font-semibold text-center mb-6 text-zinc-800 dark:text-white">
              Add Subtasks
            </Text>

            <ScrollView
              className="max-h-[400px]"
              showsVerticalScrollIndicator={false}
            >
              {inputs.map((input, index) => (
                <View key={index} className="mb-4">
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <TextInput
                        className={`bg-zinc-100 dark:bg-zinc-700 px-4 py-3 rounded-xl text-zinc-800 dark:text-white text-base
                          ${errors[index] ? 'border-2 border-red-500' : ''}`}
                        placeholder="Enter subtask"
                        placeholderTextColor="#9ca3af"
                        value={input}
                        onChangeText={(text) => handleInputChange(text, index)}
                      />
                      {errors[index] && (
                        <Text className="text-red-500 text-sm mt-1 ml-2">
                          {errors[index]}
                        </Text>
                      )}
                    </View>
                    {inputs.length > 1 && (
                      <Pressable
                        onPress={() => removeField(index)}
                        className="ml-2 p-2"
                      >
                        <IconSymbol
                          name="close"
                          size={28}
                          color="#ef4444"
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>

            <Pressable
              onPress={addField}
              className="flex-row items-center justify-center py-3 mt-2 mb-4"
            >
              <IconSymbol name="add-task" size={24} color="#22c55e" />
              <Text className="text-green-600 ml-2 text-base font-medium">
                Add Another Subtask
              </Text>
            </Pressable>

            <View className="flex-row justify-between mt-2">
              <Pressable
                onPress={onClose}
                className="flex-1 py-3 mr-2 border-2 border-zinc-300 dark:border-zinc-600 rounded-xl"
              >
                <Text className="text-center text-zinc-800 dark:text-white text-base font-medium">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="flex-1 py-3 ml-2 bg-green-600 dark:bg-green-700 rounded-xl"
              >
                <Text className="text-center text-white text-base font-medium">
                  Save Subtasks
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </Pressable>
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
  const [editMode, setEditMode] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<{ taskId: number; subtaskId: string; content: string } | null>(null);

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

  const handleEditSubtask = (taskId: number, subtaskId: string, content: string) => {
    setEditingSubtask({ taskId, subtaskId, content });
    setShowSubtaskInput(taskId);
  };

  const renderTask = (item: TimeSlotTask) => (
    <View
      className={`bg-white dark:bg-zinc-800 border border-t-4 ${item.borderColor} dark:border-zinc-700 shadow-lg rounded-2xl p-5`}
      style={{ minHeight: '100%', width: viewportWidth * 0.9 }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center space-x-2">
          <Text className="text-sm text-zinc-800/80 dark:text-white/80 font-semibold">{item.timeLabel}</Text>

          <Text
            className={`text-sm ml-2 ${item.label === 'Previous'
              ? 'text-yellow-500'
              : item.label === 'Current'
                ? 'text-green-500'
                : 'text-red-500'
              }`}
          >
            ({item.label})
          </Text>
        </View>
        <Text className='text-zinc-800/80 dark:text-white/80 font-semibold px-1'> Routine</Text>
      </View>

      {/* Task Content */}
      <View className="mt-4">
        <View className='flex flex-row items-center gap-1 '>
          <IconSymbol size={28} name="lock-clock" color={'#22c55e'} />
          <Text className="text-2xl font-semibold text-wrap w-11/12 text-zinc-800 dark:text-white ">
            {item.task.content}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-4 ">
          <Text className='text-sm font-semibold text-black/50 dark:text-white/50'>Manage your Tasks</Text>

        </View>

        {/* Subtasks List */}
        {item.task.subtasks && item.task.subtasks.length > 0 && (
          <View className="mt-4 pl-4 border-l  border-zinc-200 dark:border-zinc-700">
            <ScrollView
              style={{ maxHeight: '100%' }}
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
                      className={`ml-2 text-2xl ${subtask.completed
                        ? 'line-through text-zinc-400'
                        : !canEditTask(item.label)
                          ? 'text-zinc-500'
                          : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                    >
                      {subtask.content}
                    </Text>
                  </Pressable>
                  {canEditTask(item.label) && editMode && (
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => handleEditSubtask(item.task.id, subtask.id, subtask.content)}
                        className="p-2"
                      >
                        <IconSymbol name="mode-edit-outline" size={20} color="#22c55e" />
                      </Pressable>
                      <Pressable
                        onPress={() => removeSubtask(item.task.id, subtask.id)}
                        className="p-2"
                      >
                        <IconSymbol name="remove-circle-outline" size={20} color="#ef4444" />
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* TimeBlock */}
      <View className="mt-auto items-end pl-5">
        <View className='w-full mb-5 flex flex-row gap-4 items-center justify-between'>
          {canEditTask(item.label) && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditMode(!editMode);
              }}
              className={`px-4 py-2  rounded-full  ${editMode ? 'bg-green-100 dark:bg-green-900' : 'bg-zinc-100 dark:bg-zinc-700'
                }`}
            >
              <Text className={`text-xl font-bold  ${editMode ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-400'
                }`}>
                {editMode ? <IconSymbol name="task-alt" size={28} color="#22c55e" /> : <IconSymbol name="mode-edit-outline" size={28} color="#22c55e" />}
              </Text>
            </Pressable>
          )}
          {item.task.id !== -1 && canEditTask(item.label) && (
            <Pressable
              onPress={() => setShowSubtaskInput(item.task.id)}
              className="flex-row items-center bg-green-500 dark:bg-green-600 px-4 py-2 rounded-full"
            >
              <IconSymbol name="add-task" size={28} color="#fff" />

            </Pressable>
          )}
        </View>
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
            <View className="flex-row justify-center mb-4 mt-6">
              {timeSlots.map((_, index) => (
                <View
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full mx-1 ${index === activeIndex
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
            onClose={() => {
              setShowSubtaskInput(null);
              setEditingSubtask(null);
            }}
            onSave={(subtasks) => {
              if (editingSubtask) {
                updateSubtask(editingSubtask.taskId, editingSubtask.subtaskId, false, subtasks[0]);
                setEditingSubtask(null);
              } else {
                subtasks.forEach((subtask) => addSubtask(showSubtaskInput, subtask));
              }
              setShowSubtaskInput(null);
            }}
            editMode={!!editingSubtask}
            initialValue={editingSubtask?.content}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;

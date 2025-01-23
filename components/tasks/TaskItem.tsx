import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTemplateContext } from '@/contexts/TemplateContext';
import CustomAlert from '../CustomAlert';
import { AlertState, AlertType, } from '@/types/notes';
interface SubTask {
  id: string;
  content: string;
  completed: boolean;
}

interface TaskItemProps {
  task: {
    id: number;
    content: string;
    time: string;
    subtasks?: SubTask[];
  };
  isCurrentHour: boolean;
  onEdit: () => void;
}

interface SubtaskItemProps {
  subtask: SubTask;
  onToggle: () => void;
  onRemove: () => void;
}

const SubtaskItem: React.FC<SubtaskItemProps> = React.memo(({ subtask, onToggle, onRemove }) => (
  <View className="flex-row items-center justify-between py-2">
    <Pressable
      className="flex-row items-center flex-1"
      onPress={onToggle}
    >
      <IconSymbol
        name={subtask.completed ? "checkmark.circle.fill" : "circle"}
        size={20}
        color={subtask.completed ? '#22c55e' : '#71717a'}
      />
      <Text className={`ml-2 flex-1 ${subtask.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
        {subtask.content}
      </Text>
    </Pressable>
    <Pressable
      onPress={onRemove}
      className="p-2"
    >
      <IconSymbol name="xmark.circle.fill" size={20} color="#ef4444" />
    </Pressable>
  </View>
));

const convertTo12Hour = (hourStr: string): string => {
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 || 12;
  return `${twelveHour} ${period}`;
};

export const TaskItem: React.FC<TaskItemProps> = React.memo(({ task, isCurrentHour, onEdit }) => {
  const { updateSubtask, addSubtask, removeSubtask } = useTemplateContext();
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  // Fix alert state with proper typing
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });
  const showAlert = useCallback((title: string, message: string, type: AlertType) => {
    setAlertState({
      visible: true,
      title,
      message,
      type
    });
  }, []);
  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      addSubtask(task.id, newSubtaskText.trim())
        .then(() => {
          setNewSubtaskText('');
          setShowSubtaskInput(false);

        })
        .catch(() => {
          showAlert('Error', 'Failed to add subtask', 'error');
        });
    }
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    removeSubtask(task.id, subtaskId)
    showAlert('Success', 'Subtask Removed', 'success');
  };

  const completedCount = task.subtasks?.filter(st => st.completed).length ?? 0;
  const totalCount = task.subtasks?.length ?? 0;

  return (
    <>
      <View className={`bg-white dark:bg-zinc-900 border border-l-4 
      ${isCurrentHour ? "border-l-green-600" : "border-l-neutral-300 dark:border-l-neutral-700"}
      rounded-xl mx-4 mb-4 shadow-sm`}>
        <View className="p-4">
          {/* Header with time and task count */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center space-x-2">
              <Text className="text-sm text-gray-800 dark:text-gray-200">
                {convertTo12Hour(task.time)}
              </Text>
              {totalCount > 0 && (
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  ({completedCount}/{totalCount})
                </Text>
              )}
            </View>
            <Pressable onPress={onEdit}>
              <IconSymbol name="pencil.circle" size={20} />
            </Pressable>
          </View>

          {/* Main task */}
          <Text className="text-base text-zinc-900 dark:text-zinc-100 mb-3">
            {task.content}
          </Text>

          {/* Subtasks list */}
          {task.subtasks && task.subtasks.length > 0 && (
            <View className="mb-3">
              {task.subtasks.map((subtask) => (
                <View key={subtask.id} className="flex-row items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <Pressable
                    className="flex-row items-center flex-1"
                    onPress={() => updateSubtask(task.id, subtask.id, !subtask.completed)}
                  >
                    <IconSymbol
                      name={subtask.completed ? "check-circle" : "task-alt"}
                      size={20}
                      color={subtask.completed ? '#22c55e' : '#71717a'}
                    />
                    <Text className={`ml-2 flex-1 ${subtask.completed
                      ? 'line-through text-zinc-400 dark:text-zinc-600'
                      : 'text-zinc-900 dark:text-zinc-100'
                      }`}>
                      {subtask.content}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemoveSubtask(subtask.id)}
                    className="p-2"
                  >
                    <IconSymbol name="remove-circle-outline" size={20} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Add subtask input */}
          {showSubtaskInput ? (
            <View className="flex-col w-full items-center mt-4 space-y-3 px-4">
              <TextInput
                className="w-full bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded-lg text-zinc-900 dark:text-zinc-100"
                value={newSubtaskText}
                onChangeText={setNewSubtaskText}
                placeholder="Add a subtask..."
                placeholderTextColor="#888"
                onSubmitEditing={handleAddSubtask}
                autoFocus
                multiline
              />
              <View className="flex flex-row justify-between items-center w-full space-x-3 mt-4">
                <Pressable
                  className="flex-row items-center justify-center bg-green-500 px-4 py-2 rounded-lg shadow-md"
                  onPress={handleAddSubtask}
                >
                  <IconSymbol name="task-alt" size={24} color="#fff" />
                  <Text className="ml-2 text-white font-medium">Add Task</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center justify-center bg-zinc-200 dark:bg-zinc-700 px-4 py-2 rounded-lg shadow-md"
                  onPress={() => setShowSubtaskInput(false)}
                >
                  <IconSymbol name="close" size={24} color="#666" />
                  <Text className="ml-2 text-zinc-800 dark:text-zinc-300 font-medium">Close</Text>
                </Pressable>
              </View>
            </View>

          ) : (
            <Pressable
              className="flex-row items-center mt-2"
              onPress={() => setShowSubtaskInput(true)}
            >
              <IconSymbol name="add-task" size={20} color="#22c55e" />
              <Text className="ml-2 text-green-500">Add Subtask</Text>
            </Pressable>
          )}
        </View>
      </View>
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState(prev => ({ ...prev, visible: false }))}
        type={alertState.type}
      />
    </>
  );
});

SubtaskItem.displayName = 'SubtaskItem';
TaskItem.displayName = 'TaskItem';

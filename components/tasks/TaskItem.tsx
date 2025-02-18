import React, { useCallback, useState } from 'react';
import {
  View, Text, Pressable, 

} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTemplateContext } from '@/contexts/TemplateContext';
import CustomAlert from '../CustomAlert';
import { AlertState, AlertType, } from '@/types/notes';
import * as Haptics from 'expo-haptics';
import { SubtaskDrawer } from './SubtaskDrawer';
import { SubtaskItem } from './SubtaskItem';

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
  onEdit: () => void;  // Add this line
}


const convertTo12Hour = (hourStr: string): string => {
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 || 12;
  return `${twelveHour} ${period}`;
};

export const TaskItem: React.FC<TaskItemProps> = React.memo(({ task, isCurrentHour, onEdit }) => {
  const { updateSubtask, addSubtask, removeSubtask } = useTemplateContext();
  const [isSubtasksVisible, setIsSubtasksVisible] = useState(false);
  const [showSubtaskDrawer, setShowSubtaskDrawer] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<{ id: string; content: string } | null>(null);
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  const toggleSubtasks = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    setIsSubtasksVisible(!isSubtasksVisible);
  }, [isSubtasksVisible]);

  const showAlert = useCallback((title: string, message: string, type: AlertType) => {
    setAlertState({ visible: true, title, message, type });
  }, []);

 

  const handleAddSubtask = async (content: string) => {
    try {
      await addSubtask(task.id, content);
      showAlert('Success', 'Subtask added successfully', 'success');
      setShowSubtaskDrawer(false);
    } catch (error) {
      showAlert('Error', 'Failed to add subtask', 'error');
    }
  };

  const handleEditSubtask = (subtaskId: string, content: string) => {
    setEditingSubtask({ id: subtaskId, content });
    setShowSubtaskDrawer(true);
  };

  const handleRemoveSubtask = async (subtaskId: string) => {
    try {
      await removeSubtask(task.id, subtaskId);
      showAlert('Success', 'Subtask removed', 'success');
    } catch (error) {
      showAlert('Error', 'Failed to remove subtask', 'error');
    }
  };

  return (
    <View className="mx-4 mb-4">
      <View className={`bg-white dark:bg-zinc-900 border border-l-4 
        ${isCurrentHour ? "border-l-green-600" : "border-l-neutral-300 dark:border-l-neutral-700"}
        rounded-xl shadow-sm`}
      >
        {/* Header */}
        <View className="p-4">
          <View className="flex-row justify-between items-center">
            {/* Time and Edit Button */}
            <View className="flex-row items-center space-x-3">
              <IconSymbol name="schedule" size={20} color="#22c55e" />
              <Text className=" pl-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {convertTo12Hour(task.time)}
              </Text>
            </View>
            <View className="flex-row items-center ">
              {/* Show subtask count if there are subtasks */}
              {task.subtasks && task.subtasks.length > 0 && (
                <Text className="text-sm text-zinc-500 mr-2">
                  {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                </Text>
              )}
              {/* Always show toggle button */}
              <Pressable
                onPress={toggleSubtasks}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                <IconSymbol
                  name={isSubtasksVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color="#71717a"
                />
              </Pressable>


              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onEdit();
                }}
                className="p-2 ml-4 rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                <IconSymbol name="mode-edit-outline" size={20} color="#22c55e" />
              </Pressable>
            </View>
          </View>

          {/* Task Content */}
          <Text className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mt-2">
            {task.content}
          </Text>

          {/* Subtasks Section */}
          {isSubtasksVisible && (
            <View className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              {/* Show existing subtasks if any */}
              {task.subtasks && task.subtasks.length > 0 ? (
                task.subtasks.map((subtask) => (
                  <SubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={() => updateSubtask(task.id, subtask.id, !subtask.completed)}
                    onRemove={() => handleRemoveSubtask(subtask.id)}
                    onEdit={() => handleEditSubtask(subtask.id, subtask.content)}
                  />
                ))
              ) : (
                <Text className="text-zinc-500 text-center pb-4">No subtasks yet</Text>
              )}

              {/* Add Subtask Button */}
              <Pressable
                className="flex-row items-center justify-center py-3 mt-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
                onPress={() => setShowSubtaskDrawer(true)}
              >
                <IconSymbol name="add-task" size={20} color="#22c55e" />
                <Text className="ml-2 text-green-600 font-medium">Add New Subtask</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Drawers and Alerts */}
      <SubtaskDrawer
        visible={showSubtaskDrawer}
        onClose={() => {
          setShowSubtaskDrawer(false);
          setEditingSubtask(null);
        }}
        onSave={editingSubtask ?
          (content) => {
            updateSubtask(task.id, editingSubtask.id, false, content);
            setEditingSubtask(null);
            setShowSubtaskDrawer(false);
            showAlert('Success', 'Subtask updated', 'success');
          } :
          handleAddSubtask
        }
        editMode={!!editingSubtask}
        initialValue={editingSubtask?.content}
      />

      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState(prev => ({ ...prev, visible: false }))}
        type={alertState.type}
      />
    </View>
  );
});

SubtaskItem.displayName = 'SubtaskItem';
TaskItem.displayName = 'TaskItem';

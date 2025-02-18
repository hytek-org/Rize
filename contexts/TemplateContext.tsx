import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { globalEmitter } from '@/utils/eventEmitter';

interface SubTask {
  id: string;
  content: string;
  completed: boolean;
}

interface TemplateItem {
  id: number;
  content: string;
  time: string;
  subtasks?: SubTask[];
}

interface Template {
  id: number;
  title: string;
  desc: string;
  public: boolean;
  items: TemplateItem[];
}

interface TemplateContextProps {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  templates: Template[];
  dailyTasks: TemplateItem[];
  activeTemplateId: number | null;
  addTemplate: (newTemplate: Template) => void;
  addTemplateToDailyTasks: (template: Template) => void;
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  deleteTemplate: (templateId: number) => void;
  editTemplate: (updatedTemplate: Template) => void;
  updateRoutine: (taskId: number, content: string) => Promise<void>;
  getCurrentTemplate: () => Template | null;
  updateSubtask: (taskId: number, subtaskId: string, completed: boolean, newContent?: string) => void;
  addSubtask: (taskId: number, content: string) => Promise<void>;
  removeSubtask: (taskId: number, subtaskId: string) => Promise<void>;
}

const TemplateContext = createContext<TemplateContextProps | undefined>(undefined);

const STORAGE_KEY = "Templates";
const TASKS_KEY = "dailyTasks";
const TASKS_KEY_ID = "dailyTasksid";

export const TemplateProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dailyTasks, setDailyTasks] = useState<TemplateItem[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadTemplatesAndTasks = async () => {
      try {
        const [storedTemplates, storedTasks, storedTasksId] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(TASKS_KEY),
          AsyncStorage.getItem(TASKS_KEY_ID),
        ]);
        
        if (storedTemplates) {
          setTemplates(JSON.parse(storedTemplates));
        }
        if (storedTasks) {
          setDailyTasks(JSON.parse(storedTasks));
        }
        if (storedTasksId) {
          setActiveTemplateId(Number(storedTasksId));
        }
      } catch (error) {
        console.error("Failed to load data from storage", error);
      }
    };

    loadTemplatesAndTasks();
  }, []);

  useEffect(() => {
    const saveDailyTasks = async () => {
      try {
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(dailyTasks));
      } catch (error) {
        console.error("Failed to save daily tasks", error);
      }
    };

    if (dailyTasks.length > 0) {
      saveDailyTasks();
    }
  }, [dailyTasks]);

  const addTemplate = async (newTemplate: Template) => {
    try {
      setTemplates((prevTemplates) => {
        const updatedTemplates = [...prevTemplates, newTemplate];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
        return updatedTemplates;
      });
      Alert.alert("Success", "New template added successfully");
    } catch (error) {
      console.error("Failed to save new template", error);
      Alert.alert("Error", "Failed to save new template. Please try again.");
    }
  };

  const addTemplateToDailyTasks = async (template: Template) => {
    setLoading(true);
    try {
      if (!template || !template.items || !template.id) {
        throw new Error("Invalid template data.");
      }

      await AsyncStorage.removeItem(TASKS_KEY);
      
      setDailyTasks(template.items);
      setActiveTemplateId(template.id);

      await Promise.all([
        AsyncStorage.setItem(TASKS_KEY, JSON.stringify(template.items)),
        AsyncStorage.setItem(TASKS_KEY_ID, JSON.stringify(template.id)),
      ]);

      globalEmitter.emit('TEMPLATE_CHANGED', template.items);
      Alert.alert("Success", "Template added to daily tasks successfully");
      
      return true;
    } catch (error) {
      console.error("Failed to save daily tasks", error);
      Alert.alert("Error", "Failed to save daily tasks to local storage. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId: number) => {
    const templateToDelete = templates.find(template => template.id === templateId);
  
    if (templateToDelete?.public) {
      Alert.alert("Error", "Deleting public templates is not allowed.");
      return;
    }
  
    const filteredTemplates = templates.filter(template => template.id !== templateId);
    setTemplates(filteredTemplates);
  
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTemplates));
      Alert.alert("Success", "Template deleted successfully");
    } catch (error) {
      console.error("Failed to delete template from local storage", error);
      Alert.alert("Error", "Failed to delete template");
    }
  };

  const editTemplate = async (updatedTemplate: Template) => {
    try {
      if (!updatedTemplate.id) {
        Alert.alert("Error", "Template ID is missing");
        return;
      }

      const updatedTemplates = templates.map((template) =>
        template.id === updatedTemplate.id ? updatedTemplate : template
      );

      setTemplates(updatedTemplates);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
      Alert.alert("Success", "Template updated successfully");

    } catch (error) {
      console.error("Failed to update template", error);
      Alert.alert("Error", "Failed to update template");
    }
  };

  const updateRoutine = async (taskId: number, content: string) => {
    try {
      const updatedTasks = dailyTasks.map(task =>
        task.id === taskId ? { ...task, content } : task
      );

      setDailyTasks(updatedTasks);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to update routine", error);
      return Promise.reject(error);
    }
  };

  const getCurrentTemplate = () => {
    return templates.find(template => template.id === activeTemplateId) || null;
  };

  const updateSubtask = (taskId: number, subtaskId: string, completed: boolean, newContent?: string) => {
    setDailyTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks?.map(subtask =>
              subtask.id === subtaskId
                ? {
                    ...subtask,
                    completed,
                    ...(newContent !== undefined && { content: newContent }),
                  }
                : subtask
            ),
          };
        }
        return task;
      })
    );
  };

  const addSubtask = async (taskId: number, content: string) => {
    try {
      const updatedTasks = dailyTasks.map(task => {
        if (task.id === taskId) {
          const newSubtask: SubTask = {
            id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content,
            completed: false
          };
          return {
            ...task,
            subtasks: [...(task.subtasks || []), newSubtask]
          };
        }
        return task;
      });

      setDailyTasks(updatedTasks);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
      globalEmitter.emit('TASKS_UPDATED', updatedTasks);
    } catch (error) {
      console.error("Failed to add subtask", error);
      throw error;
    }
  };

  const removeSubtask = async (taskId: number, subtaskId: string) => {
    try {
      const updatedTasks = dailyTasks.map(task => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
          };
        }
        return task;
      });

      setDailyTasks(updatedTasks);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Failed to remove subtask", error);
      throw error;
    }
  };

  return (
    <TemplateContext.Provider
      value={{
        loading,
        setLoading,
        templates,
        dailyTasks,
        activeTemplateId,
        addTemplate,
        addTemplateToDailyTasks,
        setTemplates,
        deleteTemplate,
        editTemplate,
        updateRoutine,
        getCurrentTemplate,
        updateSubtask,
        addSubtask,
        removeSubtask,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplateContext = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplateContext must be used within a TemplateProvider");
  }
  return context;
};

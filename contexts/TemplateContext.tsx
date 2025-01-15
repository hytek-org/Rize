import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { globalEmitter } from '@/utils/eventEmitter';

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
  editTemplate: (updatedTemplate: Template) => void; // New function to edit the template
  updateRoutine: (taskId: number, content: string) => Promise<void>;
  getCurrentTemplate: () => Template | null;
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
    const loadTemplates = async () => {
      try {
        const storedTemplates = await AsyncStorage.getItem(STORAGE_KEY);
        const storedDailyTasksId = await AsyncStorage.getItem(TASKS_KEY_ID);
        
        if (storedTemplates) {
          setTemplates(JSON.parse(storedTemplates));
        }
        if (storedDailyTasksId) {
          setActiveTemplateId(Number(storedDailyTasksId));
        }
      } catch (error) {
        console.error("Failed to load templates from local storage", error);
        Alert.alert("Error", "Failed to load templates");
      }
    };
    loadTemplates();
  }, []);

  const addTemplate = async (newTemplate: Template) => {
    try {
      // Update the local state first for an instant UI update
      setTemplates((prevTemplates) => {
        const updatedTemplates = [...prevTemplates, newTemplate];
        // Save updated templates to AsyncStorage
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

      // Clear existing tasks first
      await AsyncStorage.removeItem(TASKS_KEY);
      
      // Set new tasks and template ID
      setDailyTasks(template.items);
      setActiveTemplateId(template.id);

      await Promise.all([
        AsyncStorage.setItem(TASKS_KEY, JSON.stringify(template.items)),
        AsyncStorage.setItem(TASKS_KEY_ID, JSON.stringify(template.id)),
      ]);

      // Emit event using our custom event emitter
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
      // If the template is public, show an alert and do not proceed with deletion
      Alert.alert("Error", "Deleting public templates is not allowed.");
      return; // Exit the function
    }
  
    // If the template is not public, proceed with deletion
    const filteredTemplates = templates.filter(template => template.id !== templateId);
    setTemplates(filteredTemplates); // Update the state
  
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTemplates));
      Alert.alert("Success", "Template deleted successfully");
    } catch (error) {
      console.error("Failed to delete template from local storage", error);
      Alert.alert("Error", "Failed to delete template");
    }
  };

  // New editTemplate function
  const editTemplate = async (updatedTemplate: Template) => {
    try {
      // Make sure the template has a valid id
      if (!updatedTemplate.id) {
        Alert.alert("Error", "Template ID is missing");
        return;
      }

      // Update the template in the state
      const updatedTemplates = templates.map((template) =>
        template.id === updatedTemplate.id ? updatedTemplate : template
      );

      setTemplates(updatedTemplates); // Update the state

      // Save the updated templates to AsyncStorage
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
        editTemplate, // Expose the editTemplate function
        updateRoutine,
        getCurrentTemplate,
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

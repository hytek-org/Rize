// utils/TaskManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@tasks';

export const getTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error(e);
  }
};

export const saveTasks = async (tasks:any) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, jsonValue);
  } catch (e) {
    console.error(e);
  }
};

export const addTask = async (task:any) => {
  const tasks = await getTasks();
  tasks.push(task);
  await saveTasks(tasks);
};

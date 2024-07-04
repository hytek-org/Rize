// src/utils/getTemplates.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export const getTemplates = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('allTemplates');
    if (jsonValue != null) {
      const allTemplates = JSON.parse(jsonValue);
      return allTemplates;
    }
    return {};
  } catch (error) {
    console.error('Failed to retrieve templates', error);
    return {};
  }
};
